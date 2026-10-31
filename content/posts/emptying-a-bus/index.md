---
title: "What Is the Fastest Way to Empty a Bus?"
date: "2026-10-31"
description: "I built a visual simulator to compare different ways of getting 60 passengers off a bus."
author: "Aditya Singh"
tags: ["simulation", "algorithms", "optimization", "visualization"]
---

I was thinking about a very ordinary problem: what is the fastest way to empty a bus?

Everyone eventually has to pass through the same door, but they do not reach the aisle at the same time. A person sitting next to the aisle can stand up quickly. A person at the window needs more time and cannot move until the person beside them is out of the way. Passengers near the back have farther to walk, and people entering the aisle too early can block everyone behind them.

It looked like a small scheduling problem hiding inside an everyday activity, so I built a simulator for it.

> **Try the experiment:** [Open the interactive bus exit simulator](/bus-exit-simulator/)

## The Bus I Modeled

The simulated bus has 15 rows and four seats in each row, giving us 60 passengers.

There are two seats on each side of a single aisle. The exit is on the front-right side, just ahead of the first right-side row. The right-side rows are slightly farther forward than the corresponding rows on the left.

The default timing rules are:

- An aisle-seat passenger takes 1 second to stand and enter the aisle.
- A window-seat passenger takes 2 seconds to stand and enter the aisle.
- A window passenger waits until the adjacent aisle passenger has exited the bus.
- Passengers walk at 1 row per second.
- Nobody can pass inside the aisle.
- The door can process one passenger per second.

These rules are intentionally simple. The goal is not to recreate every detail of a real bus. It is to make the scheduling trade-offs visible.

## The Strategies

I compared six ways of releasing passengers:

| Strategy | Idea |
| --- | --- |
| Everyone at once | Every eligible passenger starts immediately. |
| Front to back | Rows leave in order from the door toward the rear. |
| Back to front | Rear rows are invited to leave first. |
| Aisle seats first | Aisle passengers form the first wave and window passengers form the second. |
| Alternating rows | Odd rows start first, followed by even rows. |
| Smart stagger | Passengers are released into predicted gaps in the aisle. |

The first surprise is that “closest to the door first” is not automatically the best answer. A front passenger can leave quickly, but releasing front rows too conservatively can leave the door unused. Starting at the back has the opposite problem: passengers travel farther and can create a long queue before the front seats have moved.

## What Smart Stagger Means

Smart stagger is a heuristic, not a mathematically proven optimum.

It begins with aisle passengers and groups rows that are four apart: rows 1, 5, 9, and 13 form one sequence; rows 2, 6, 10, and 14 form the next; and so on. The right-side passenger is released slightly before the matching left-side passenger because that seat is physically closer to the door.

The purpose of this pattern is to create space between new aisle entries. Instead of four nearby passengers competing for the same section of aisle, passengers enter at separated points and begin moving forward. Later releases try to occupy the gaps they leave behind.

Window passengers remain gated by the physical rule: they cannot begin until their adjacent aisle passenger has completely exited the bus.

## How the Simulation Works

The simulator advances in small time steps. During each step it checks four things:

1. Which seated passengers are allowed to start getting up?
2. Which prepared passengers have enough space to enter the aisle?
3. How far can each standing passenger move without passing the person ahead?
4. Is the door ready to process the next passenger?

Each passenger moves through three visible states: seated, preparing, and walking in the aisle. After crossing the door, the passenger is counted as off the bus.

The most important constraint is the single-file aisle. A strategy does not win by making one passenger very fast. It wins by keeping the door occupied while avoiding gaps and blockages in the queue.

## What Won?

With the default assumptions, Smart Stagger emptied the bus in about **61.1 seconds**. It finished roughly **1.6 seconds** ahead of the next strategy in the current model.

That difference is small, and that is useful information. Once the door is continuously busy, no strategy can improve much because the door itself becomes the bottleneck. With 60 passengers and a one-second door service time, the theoretical floor is already close to one minute.

The simulator lets you change the stand-up time and walking speed. As those values change, the ranking can change too. A strategy that works when everyone moves at the same pace might perform differently when window passengers need more time.

## What the Result Does Not Mean

This is not a crowd-safety plan and it is not a claim that real passengers should leave in this exact order.

The model does not yet include luggage, children, reduced mobility, passengers helping each other, hesitation, people ignoring instructions, or the extra space needed to turn through the door. It assumes deterministic timing and perfect compliance.

The phrase “smart” only means that the release pattern was designed around the geometry of this model. A real optimum would require searching a much larger set of schedules and testing them under uncertain passenger behavior.

## What I Learned

The interesting part of this problem is not the bus. It is the bottleneck.

When many independent actors share one narrow resource, local speed matters less than flow. Starting everyone immediately feels fast, and serving the nearest person first feels efficient, but neither idea guarantees that the shared resource stays productive.

This is the same kind of problem we see in request queues, manufacturing lines, CPU scheduling, elevators, and boarding systems. The objects change, but the question remains the same: how do we feed work into a constrained path without leaving it idle or overwhelming it?

For now, Smart Stagger is the best heuristic in this small experiment. The more interesting next step would be to let an optimizer discover schedules instead of hand-designing them.

[Run the simulator and change the assumptions →](/bus-exit-simulator/)
