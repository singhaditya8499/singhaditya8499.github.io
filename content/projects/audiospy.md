---
title: "AudioSpy: Presence Detection with Sound"
date: 2026-09-12
description: "A private macOS presence detector that uses quiet, high-frequency sound to notice when someone approaches an unattended laptop."
projectType: "Project"
tags: ["swift", "macos", "audio", "signal-processing", "privacy", "security"]
---

AudioSpy started with a simple concern: what happens around my laptop when I leave it open?

I wanted the computer to notice when someone came close, record that an approach happened, and do it without filming the room or storing conversations. The result is a small macOS agent that turns the laptop's speakers and microphone into a basic proximity sensor.

Repository: [github.com/singhaditya8499/AudioSpy](https://github.com/singhaditya8499/AudioSpy)

## The Idea in One Sentence

The laptop plays sound at frequencies near the upper edge of human hearing, listens for how that sound returns, and notices when a person changes the pattern of reflections around it.

Think of shining a flashlight at a wall. If someone walks through the beam, the light pattern changes. AudioSpy applies the same idea to sound.

{{< figure src="/images/projects/audiospy/audiospy-sensing.svg" alt="A laptop sends three high-frequency tones toward a nearby person. Changed reflections return to the microphone." caption="A nearby person changes the paths that sound takes from the speakers back to the microphone." align="center" width="720" height="430" >}}

## How a Laptop Can Sense Someone with Sound

AudioSpy continuously plays three low-volume tones at 18.75 kHz, 19.25 kHz, and 19.75 kHz. Most adults cannot hear these frequencies, although complete inaudibility cannot be guaranteed for every person, speaker, or pet.

Some of this sound travels directly from the speakers to the microphone. The rest bounces off the desk, walls, screen, and nearby objects before reaching the microphone. Together, those paths create a recognizable sound fingerprint for the space around the laptop.

When a hand or body approaches, it blocks some paths and creates new reflections. The microphone may receive more of one tone and less of another. AudioSpy measures that change.

The system does not need to understand speech. It looks only at the strength of the three tones it generated.

## From Sound to a Detection

{{< figure src="/images/projects/audiospy/audiospy-pipeline.svg" alt="A six-step pipeline emits tones, observes reflections, samples the microphone, measures carriers, scores the change, and logs a sustained event." caption="AudioSpy reduces every microphone block to three measurements, compares them with the empty room, and logs only sustained changes." align="center" width="720" height="500" >}}

### 1. Learn the empty room

Every time AudioSpy starts, it spends ten seconds measuring the laptop's surroundings. During this time, the area should stay empty and still.

For each tone, it learns:

- The usual strength recorded by the microphone
- The amount that strength naturally moves while nothing is happening

This becomes the baseline.

### 2. Examine short pieces of microphone input

The microphone input is processed in small blocks of 2,048 samples. On a typical 48 kHz audio device, each block represents about 43 milliseconds.

AudioSpy uses frequency analysis to answer three narrow questions:

- How strong is the 18.75 kHz tone right now?
- How strong is the 19.25 kHz tone right now?
- How strong is the 19.75 kHz tone right now?

All other sound, including most speech and everyday room noise, is ignored by the detector.

### 3. Produce a change score

Each new measurement is compared with the baseline. A score near 1 represents a small change similar to normal variation. Larger scores mean the current sound fingerprint looks increasingly different from the calibrated room.

In one real test, AudioSpy learned these baseline amplitudes:

```text
[0.008571, 0.020382, 0.013649]
```

Ordinary readings moved between roughly 0.3 and 2. Placing hands above the speakers produced clearly higher scores. One sustained approach reached 13.79 and generated an event.

The score is not a distance in centimeters and it is not a probability. It measures how unusual the three reflected tones look compared with the room AudioSpy learned.

{{< figure src="/images/projects/audiospy/audiospy-score.svg" alt="A line chart of real AudioSpy scores. Most readings stay below 2, one reaches 4.85 without an event, and one reaches 13.79 above the threshold of 7." caption="Observed scores from a real session. The 4.85 reading remained below the threshold, while the sustained 13.79 change produced an event." align="center" width="720" height="410" >}}

### 4. Require a sustained change

A single unusual audio block might come from a click, vibration, or brief noise. To reduce false alarms, the default detector requires a score of at least 7 across four consecutive blocks. At 48 kHz, that is about 170 milliseconds of sustained change.

After an event, AudioSpy waits before it can log another one. It also requires the signal to return close to normal before rearming. This prevents one person standing near the laptop from producing hundreds of duplicate events.

## What Gets Logged

Each detection is stored as one line of JSON containing:

- The timestamp
- The change score
- The three measured tone strengths
- The baseline tone strengths
- The frequencies used by the detector

An event looks like this:

```json
{"timestamp":"2026-09-12T23:40:11Z","event":"presence_detected","score":13.79,"amplitudes":[0.0102,0.0271,0.0164],"baselineAmplitudes":[0.008571,0.020382,0.013649],"frequenciesHz":[18750,19250,19750]}
```

Raw microphone audio is never written to disk. Samples are discarded as soon as the three tone measurements have been calculated. AudioSpy cannot identify a person and does not record what anyone says.

## Building It as a macOS Background Agent

AudioSpy is written in Swift using Apple's AVFoundation audio framework. It has no third-party runtime dependencies.

The project includes:

- A signal-processing core that measures the emitted tones
- A detector that learns a baseline and scores changes
- A JSON Lines event logger
- A hidden macOS app bundle with no Dock icon or window
- A LaunchAgent installer that starts AudioSpy when the user logs in
- Self-tests for frequency measurement and detection behavior

macOS still shows its microphone privacy indicator while the agent is active. AudioSpy does not attempt to bypass operating system privacy controls.

## What I Learned

### A change score is more honest than a distance estimate

The built-in speakers and microphone are not synchronized scientific instruments. Reflections can strengthen or cancel each other in complex ways. A hand close to a speaker can create a larger change than a person farther away, depending on position.

For that reason, AudioSpy reports an anomaly score instead of claiming an exact distance.

### Several tones work better than one

A person might have little effect on one frequency because of the geometry of the room. Tracking three nearby frequencies creates a richer fingerprint and makes the detector less dependent on one lucky reflection path.

### Calibration matters as much as detection

Every desk and room sounds different. Even moving the laptop changes the relationship between its speakers, microphone, and surroundings. A short baseline calibration lets the same detector adapt to different environments.

### Reliable alerts need a small state machine

A useful detector must decide more than whether the current score is high. It must distinguish a brief spike from a sustained change, avoid duplicate alerts, recover after someone leaves, and slowly accommodate harmless environmental drift.

## Limitations

AudioSpy is an experiment, not a security system. It works only while the Mac is awake and its speakers and microphone are available. Muting the laptop, connecting headphones, changing audio devices, closing the lid, or creating strong high-frequency noise can interrupt or confuse detection.

The tones are near the upper limit of human hearing. Some young people may hear them, and some animals can hear frequencies above the human range. The output should remain low, and the project should not be used around a pet that reacts to high-frequency sound.

The detector records that the acoustic environment changed. It cannot prove who approached, why they approached, or whether they touched the computer.

## Try It

AudioSpy currently targets macOS 13 or newer. After cloning the repository, run:

```sh
./scripts/self-test.sh
./scripts/build-app.sh
./dist/AudioSpy.app/Contents/MacOS/AudioSpy
```

Allow microphone access when macOS asks, keep the area clear during calibration, and approach after the app prints `Armed`.

Sensitivity can be adjusted with `--threshold`. Lower values detect smaller changes but may create more false alarms. Higher values require a stronger change.

The goal of AudioSpy is modest: use hardware already present in a laptop to create a private, understandable record that something changed nearby.
