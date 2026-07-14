# Wireframe: Chart Error State

When the dashboard loses connection or the API fetch fails, the chart area should provide clear visual feedback rather than simply staying static or breaking.

```text
+-------------------------------------------------------------------------+
| [ Temperatura ]  [ Umidade ]  [ VPD ]  [ CO2 ]                          |
+-------------------------------------------------------------------------+
|                                                                         |
|                                                                         |
|                                                                         |
|           /!\ Error Loading Data                                        |
|                                                                         |
|           The dashboard lost connection to the server.                  |
|           Displaying last known good data.                              |
|                                                                         |
|           [   ↻ Reconnect / Retry    ]                                  |
|                                                                         |
|                                                                         |
|                                                                         |
+-------------------------------------------------------------------------+
|  Last Updated: 10:45 AM (15 minutes ago)      Status: [🔴 OFFLINE ]   |
+-------------------------------------------------------------------------+
```

### Notes
- The chart background should be slightly dimmed or grayscaled to emphasize that the data is not live.
- The error message should be centered over the canvas area.
- A manual retry button gives the user control to attempt a manual fetch instead of waiting for the interval.
