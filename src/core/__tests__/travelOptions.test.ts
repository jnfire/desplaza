import { describe, expect, it } from 'vitest';
import {
  changeOptionKind,
  createOption,
  duplicateOption,
  sanitizeOption,
  sanitizeTrip,
  uniqueName,
  type CombustionOption,
} from '../travelOptions';

describe('travel options', () => {
  it('creates each kind with its own defaults', () => {
    expect(createOption('combustion', 'Car')).toMatchObject({
      kind: 'combustion',
      consumption: 6.5,
    });
    expect(createOption('motorbike', 'Moto')).toMatchObject({ kind: 'motorbike', consumption: 4 });
    expect(createOption('electric', 'EV')).toMatchObject({ kind: 'electric', consumption: 16 });
    expect(createOption('transit', 'Bus')).toMatchObject({ kind: 'transit', fareType: 'pass' });
  });

  it('gives every option its own id', () => {
    expect(createOption('combustion', 'A').id).not.toBe(createOption('combustion', 'B').id);
  });

  it('keeps id, name and shared fields when changing the kind', () => {
    const car = { ...(createOption('combustion', 'Seat León') as CombustionOption), tollPerLeg: 3 };
    const moto = changeOptionKind(car, 'motorbike');
    const electric = changeOptionKind(car, 'electric');
    const transit = changeOptionKind(car, 'transit');

    expect(moto).toMatchObject({ id: car.id, name: 'Seat León', kind: 'motorbike', tollPerLeg: 3 });
    expect(electric).toMatchObject({ id: car.id, kind: 'electric', tollPerLeg: 3 });
    expect(transit).toMatchObject({ id: car.id, kind: 'transit' });
    expect(transit).not.toHaveProperty('tollPerLeg');
  });

  it('duplicates with a new id and name', () => {
    const car = createOption('combustion', 'Seat León');
    const copy = duplicateOption(car, 'Toyota Corolla');

    expect(copy).toMatchObject({ ...car, id: copy.id, name: 'Toyota Corolla' });
    expect(copy.id).not.toBe(car.id);
  });

  it('numbers repeated names', () => {
    const options = [
      createOption('combustion', 'Mi coche'),
      createOption('combustion', 'Mi coche (2)'),
    ];

    expect(uniqueName('Eléctrico', options)).toBe('Eléctrico');
    expect(uniqueName('Mi coche', options)).toBe('Mi coche (3)');
    expect(uniqueName('mi coche', options)).toBe('mi coche (3)');
  });
});

describe('sanitizing stored or shared data', () => {
  it('clamps trip values and falls back to defaults', () => {
    expect(sanitizeTrip({ tripMode: 'idavuelta', daysPerWeek: 9, activeMonths: 0 })).toEqual({
      tripMode: 'idavuelta',
      daysPerWeek: 7,
      activeMonths: 1,
    });
    expect(sanitizeTrip(undefined)).toEqual({
      tripMode: 'ciclo',
      daysPerWeek: 5,
      activeMonths: 12,
    });
  });

  it('drops unknown kinds and non-objects', () => {
    expect(sanitizeOption({ kind: 'teleport' })).toBeNull();
    expect(sanitizeOption('car')).toBeNull();
    expect(sanitizeOption(null)).toBeNull();
  });

  it('keeps valid fields and repairs invalid ones', () => {
    const option = sanitizeOption({
      id: 'abc',
      name: '  Seat León  ',
      kind: 'combustion',
      fuelType: 'Kerosene',
      priceSource: 'manual',
      manualPrice: 1.8,
      consumption: 'lots',
      tollPerLeg: -4,
    });

    expect(option).toMatchObject({
      id: 'abc',
      name: 'Seat León',
      fuelType: 'Precio Gasolina 95 E5',
      priceSource: 'manual',
      manualPrice: 1.8,
      consumption: 6.5,
      tollPerLeg: 0,
    });
  });

  it('accepts an unknown transit time as null', () => {
    expect(sanitizeOption({ kind: 'transit', minutesPerLeg: null })).toMatchObject({
      minutesPerLeg: null,
    });
    expect(sanitizeOption({ kind: 'transit', minutesPerLeg: 45 })).toMatchObject({
      minutesPerLeg: 45,
    });
  });
});
