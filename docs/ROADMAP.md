# Roadmap

*Read this in [Spanish](ROADMAP-es.md).*

What Desplaza does today and where it could go. The ideas are ordered by how much they would help; they are ideas, not commitments or dates.

## What it does today

- Compare several ways of making the same trip (cars, a motorbike, an electric car, public transport), each with its own name.
- Rank them by cost, time or a balance of both with your hour valued in €/h; the best option is highlighted.
- Daily fuel prices per province from MITECO, route, distance and driving time from OSRM, and a draggable route on the map.
- The comparison is saved on the device and can be shared as a link.

## Ideas

1. **CO₂ per option,** with official emission factors (the table has to be verified before showing numbers).
2. **Automatic electricity price** (PVPC, from Red Eléctrica's open data) if its API answers without a token; otherwise it stays manual.
3. **Tolls and parking more visible;** today they live under "More settings".
4. **"My garage":** save vehicles to reuse them across trips.
5. **Plug-in hybrids** and **reference fares for public transport by city,** editable.
6. **Ask before replacing** the saved comparison when a shared link is opened.
7. **A routing service with clear production terms** instead of the public OSRM demo server.
8. **Automated tests for the interface;** today the core logic and the services are tested, and the screens are checked by hand and with browser scripts.

## Out of scope

- Accounts, a backend or any storage on a server: what you enter stays in your browser, apart from the requests to the public services listed in [`ARCHITECTURE.md`](ARCHITECTURE.md).
- Advertising and tracking.
