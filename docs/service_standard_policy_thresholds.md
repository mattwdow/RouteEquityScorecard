# Service Productivity, Crowding, and Utilization Thresholds (Policy Reference)

> **Source:** Transcribed from proposed Service Standard Policy table (`media_1795118946991_04b2f448.png`).
> **Purpose:** Reference specification for testing policy viability and equity-based minimum boarding variances against ETS boardings data and the Route Equity Scorecard.

---

## 1. Service Productivity Thresholds

Productivity thresholds determine where service additions and reductions are warranted based on maximum passenger boardings. In general, these mainly apply to lower-frequency service, as crowding thresholds are a more suitable evaluation criterion for higher-frequency service. In addition, **Social Vulnerability** is now being considered for lower minimum standards, to be more accommodating in areas where more passengers rely on transit as their primary mode of travel.

| Metric / Tier | Time Period | 20 min | 30 min | 60 min |
| :--- | :--- | :---: | :---: | :---: |
| **Maximum Passenger Boardings per hour** | Peak | 55 | 45 | 35 |
| | Off-peak | 50 | 40 | 30 |
| **Minimum Passenger Boardings per hour**<br>*Low Social Vulnerability areas* *(Highlighted)* | Peak | 25 | 20 | 15 |
| | Off-peak | 20 | 15 | 12 |
| **Minimum Passenger Boardings per hour**<br>*Frequent Routes, Crosstown Routes, Industrial Routes, and Moderate Social Vulnerability areas* *(Highlighted)* | Peak | 20 | 15 | 12 |
| | Off-peak | 15 | 12 | 10 |
| **Minimum Passenger Boardings per hour**<br>*High Social Vulnerability areas* *(Highlighted)* | Peak | 15 | 12 | 10 |
| | Off-peak | 12 | 10 | 8 |

> **Applicability Rule:** For service frequencies of **15-minute service or better** *(original text: "15-minute service on better")*, crowding thresholds determine service levels and proposed changes rather than productivity.

---

## 2. Service Crowding and Utilization Thresholds

Crowding and utilization thresholds determine where service additions and reductions are warranted based on maximum passenger loads per bus. There are separate thresholds for regular buses, articulated buses, and small buses due to capacity.

### 1. Regular Bus — 37-seat vehicle

| Metric | Time Period | <= 12 min | 15 min | 20 min | 30 - 60 min |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Minimum Peak Hour Passenger Load** | Peak | 25 | 20 | N/A | N/A |
| | Off-peak | 20 | 15 | N/A | N/A |
| **Maximum Peak Hour Passenger Load** | Peak | 45 | 40 | 40 | 35 |
| | Off-peak | 40 | 35 | 35 | 30 |

*(Note: Threshold tables for Articulated Buses and Small Buses are referenced in the policy text but not shown in the source image.)*

---

## 3. Initial Applicability Assessment (Route Equity Scorecard Integration)

- **Core Policy Mechanism:** The highlighted minimum boarding tiers create a **33% to 40% leniency buffer** for High Social Vulnerability areas compared to Low Social Vulnerability areas (e.g., at 20-minute peak frequency, the floor drops from `25` to `15` boardings/hr; at 60-minute off-peak, from `12` to `8` boardings/hr).
- **Mapping to Route Equity Scorecard:**
  - *High Social Vulnerability* maps naturally to high-CIMD / Grade A–B equity-seeking routes (and "Essential Equity" routes from Monte Carlo stability testing).
  - *Moderate Social Vulnerability* maps to Grade C corridors, alongside operational classifications (Frequent, Crosstown, Industrial).
  - *Low Social Vulnerability* maps to Grade D–F corridors where standard productivity floors apply before service reductions are triggered.
- **Data Dependencies for Full Viability Testing:**
  1. **Boardings per revenue hour** by route, time period (`Peak` vs. `Off-peak`), and headway tier (`20`, `30`, `60` min) — depends on **Phase 44 (Boardings Data Integration)**.
  2. **Maximum passenger load per bus** and vehicle type assignment (`Regular`, `Articulated`, `Small`) for routes operating at `<= 15` min frequency.
  3. **Route operational typology** tags (`Frequent`, `Crosstown`, `Industrial`) to separate operational leniency from pure social vulnerability leniency.
