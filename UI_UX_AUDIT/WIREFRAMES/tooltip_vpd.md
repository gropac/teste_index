# Wireframe: VPD Contextual Tooltip

To improve the clarity of the VPD metric, a rich tooltip should appear on hover or focus of the `ℹ️` icon.

```text
+-----------------------------------------+
|                                         |
|  VPD (Déficit de Pressão) [ℹ️]          |
|                           +----------------------------------------+
|                           | Vapor Pressure Deficit (VPD)           |
|                           |                                        |
|                           | Measures the drying power of the air.  |
|                           |                                        |
|                           | Target Zones:                          |
|                           | 🟢 Clones: 0.4 - 0.8 kPa              |
|                           | 🟡 Veg:    0.8 - 1.2 kPa              |
|                           | 🔴 Flower: 1.2 - 1.5 kPa              |
|                           +----------------------------------------+
|                                         |
|     1.12 kPa                            |
|                                         |
+-----------------------------------------+
```

### Notes
- The tooltip must be accessible via keyboard (`tab` to focus the icon, then enter/space or automatic on focus).
- It should use a z-index high enough to sit above the chart and other cards.
- Dark theme styling should match the main cards (translucent background, light text).
