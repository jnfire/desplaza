<script setup lang="ts">
const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <h2>Fuentes y Metodología</h2>
        <button class="close-btn" @click="emit('close')">×</button>
      </header>
      
      <div class="modal-body">
        <section>
          <h3>Precios de Carburante</h3>
          <p>
            Los precios del combustible se obtienen en tiempo real a través de la API pública REST de Carburantes del 
            <strong>Ministerio para la Transición Ecológica y el Reto Demográfico (MITECO)</strong> del Gobierno de España.
          </p>
          <p>
            Para el cálculo, se cruza la provincia del origen seleccionado con el precio medio aritmético del día de todas las 
            estaciones de servicio de esa provincia.
          </p>
        </section>

        <section>
          <h3>Distancias y Enrutamiento</h3>
          <p>
            El cálculo de distancias por carretera se realiza mediante el motor <strong>OSRM (Open Source Routing Machine)</strong> 
            y las direcciones se geocodifican utilizando <strong>Photon (OpenStreetMap)</strong>.
          </p>
        </section>

        <section>
          <h3>Coste de Desgaste y Mantenimiento</h3>
          <p>
            Al coste puro del combustible se le puede sumar opcionalmente un coste de <strong>0,08 € por kilómetro</strong>. 
            Esta cifra es una estimación conservadora basada en estudios de asociaciones automovilísticas que prorratea:
          </p>
          <ul>
            <li>Desgaste de neumáticos (~0,01 €/km)</li>
            <li>Mantenimiento preventivo y revisiones (~0,03 €/km)</li>
            <li>Parte proporcional del seguro e impuestos (~0,02 €/km)</li>
            <li>Amortización y depreciación mínima (~0,02 €/km)</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.close-btn:hover {
  color: var(--color-text);
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-body h3 {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.modal-body p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.modal-body ul {
  padding-left: 1.5rem;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.modal-body li {
  margin-bottom: 0.25rem;
}
</style>
