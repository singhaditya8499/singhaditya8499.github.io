---
title: "Clear the Bus: Exit Strategy Simulator"
date: 2026-10-31
description: "Interactive single-aisle simulation comparing how 60 passengers can leave a bus."
projectType: "Project"
tags: ["simulation", "algorithms", "optimization", "javascript", "visualization"]
---

Clear the Bus is an interactive simulator for comparing different ways to unload 60 passengers from a 15-row bus.

The model tracks each passenger from their seat into a single-file aisle and through a front-right exit. It accounts for seat position, standing time, walking speed, aisle spacing, door throughput, and the dependency between a window passenger and the adjacent aisle passenger.

## Highlights

- Animates every passenger through seated, preparing, walking, and exited states.
- Compares six release strategies and ranks them by total emptying time.
- Includes adjustable aisle-seat, window-seat, and walking times.
- Models a staggered right-side seating layout and a one-person-per-second door.
- Explains the assumptions and limitations behind the result.

**Live project:** [Open the bus exit simulator](/bus-exit-simulator/)

**Write-up:** [What Is the Fastest Way to Empty a Bus?](/posts/emptying-a-bus/)
