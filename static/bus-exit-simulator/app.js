const ROWS = 15;
const SEATS = [
  { side: "L", kind: "window", col: 1 },
  { side: "L", kind: "aisle", col: 2 },
  { side: "R", kind: "aisle", col: 4 },
  { side: "R", kind: "window", col: 5 },
];

const strategies = [
  { id: "smart", name: "Smart stagger", subtitle: "Feeds open aisle gaps", glyph: "✦" },
  { id: "all", name: "Everyone at once", subtitle: "No managed sequence", glyph: "◎" },
  { id: "front", name: "Front to back", subtitle: "One row every 2 sec", glyph: "↓" },
  { id: "back", name: "Back to front", subtitle: "Rear rows leave first", glyph: "↑" },
  { id: "aisle", name: "Aisle seats first", subtitle: "Windows form wave two", glyph: "Ⅱ" },
  { id: "oddEven", name: "Alternating rows", subtitle: "Odd rows, then even", glyph: "≋" },
];

const state = {
  selected: "smart",
  aisleTime: 1,
  windowTime: 2,
  walkSpeed: 1,
  playing: false,
  playbackSpeed: 2,
  displayTime: 0,
  raf: null,
  lastFrame: 0,
  simulations: new Map(),
};

const $ = (id) => document.getElementById(id);
const strategyList = $("strategyList");
const seatGrid = $("seatGrid");
const aisleTrack = $("aisleTrack");

function releaseTime(strategy, passenger) {
  const r = passenger.row;
  const sideOffset = passenger.side === "L" ? 0.35 : 0;
  switch (strategy) {
    case "all": return 0;
    case "front": return (r - 1) * 2.15 + sideOffset;
    case "back": return (ROWS - r) * 2.15 + sideOffset;
    case "aisle": return passenger.kind === "aisle" ? (r - 1) * 0.18 + sideOffset : 18 + (r - 1) * 0.18 + sideOffset;
    case "oddEven": return (r % 2 ? 0 : 13) + Math.floor((r - 1) / 2) * 0.45 + sideOffset;
    case "smart": {
      const band = (r - 1) % 4;
      const wave = Math.floor((r - 1) / 4);
      const seatWave = passenger.kind === "window" ? 7.5 : 0;
      return band * 1.45 + wave * 0.32 + seatWave + sideOffset;
    }
    default: return 0;
  }
}

function createPassengers(strategy) {
  const people = [];
  for (let row = 1; row <= ROWS; row += 1) {
    SEATS.forEach((seat, index) => {
      people.push({
        id: `r${row}-${seat.side}-${seat.kind}`,
        row,
        side: seat.side,
        kind: seat.kind,
        col: seat.col,
        index,
        releaseAt: 0,
        prepStart: null,
        readyAt: null,
        enteredAt: null,
        exitedAt: null,
        pos: null,
        snapshots: [],
      });
    });
  }
  people.forEach((p) => { p.releaseAt = releaseTime(strategy, p); });
  return people;
}

function simulate(strategy) {
  const people = createPassengers(strategy);
  const byId = new Map(people.map((p) => [p.id, p]));
  const dt = 0.05;
  const gap = 0.72;
  let time = 0;
  let doorFreeAt = 0;
  let peakAisle = 0;
  let lastSeatClears = 0;
  const frames = [];
  const maxTime = 400;

  const adjacentAisle = (p) => byId.get(`r${p.row}-${p.side}-aisle`);
  const aislePosition = (p) => p.row - (p.side === "R" ? 0.35 : 0);

  while (people.some((p) => p.exitedAt === null) && time < maxTime) {
    for (const p of people) {
      if (p.enteredAt !== null || p.prepStart !== null || time + 1e-8 < p.releaseAt) continue;
      if (p.kind === "window" && adjacentAisle(p).exitedAt === null) continue;
      p.prepStart = time;
      p.readyAt = time + (p.kind === "aisle" ? state.aisleTime : state.windowTime);
    }

    const active = people.filter((p) => p.enteredAt !== null && p.exitedAt === null).sort((a, b) => a.pos - b.pos);
    for (let i = 0; i < active.length; i += 1) {
      const p = active[i];
      const frontLimit = i === 0 ? -0.3 : active[i - 1].pos + gap;
      p.pos = Math.max(frontLimit, p.pos - state.walkSpeed * dt);
    }

    const atDoor = active.filter((p) => p.pos <= 0.02).sort((a, b) => a.enteredAt - b.enteredAt);
    if (atDoor.length && time + 1e-8 >= doorFreeAt) {
      const leaving = atDoor[0];
      leaving.exitedAt = time;
      doorFreeAt = time + 1;
    }

    const ready = people
      .filter((p) => p.enteredAt === null && p.readyAt !== null && time + 1e-8 >= p.readyAt)
      .sort((a, b) => a.readyAt - b.readyAt || a.row - b.row || a.index - b.index);
    for (const p of ready) {
      const entryPosition = aislePosition(p);
      const occupied = people.some((q) => q.enteredAt !== null && q.exitedAt === null && Math.abs(q.pos - entryPosition) < gap);
      if (!occupied) {
        p.enteredAt = time;
        p.pos = entryPosition;
        lastSeatClears = Math.max(lastSeatClears, time);
      }
    }

    const aisleCount = people.filter((p) => p.enteredAt !== null && p.exitedAt === null).length;
    peakAisle = Math.max(peakAisle, aisleCount);
    if (Math.round(time * 10) % 2 === 0) {
      frames.push({
        t: time,
        people: people.map((p) => ({ id: p.id, prepStart: p.prepStart, enteredAt: p.enteredAt, exitedAt: p.exitedAt, pos: p.pos })),
      });
    }
    time += dt;
  }

  const total = Math.max(...people.map((p) => p.exitedAt || 0));
  frames.push({
    t: total,
    people: people.map((p) => ({ id: p.id, prepStart: p.prepStart, enteredAt: p.enteredAt, exitedAt: p.exitedAt, pos: p.pos })),
  });
  return { strategy, people, frames, total, peakAisle, lastSeatClears };
}

function runAll() {
  state.playing = false;
  cancelAnimationFrame(state.raf);
  state.simulations.clear();
  strategies.forEach((strategy) => state.simulations.set(strategy.id, simulate(strategy.id)));
  const selected = state.simulations.get(state.selected);
  state.displayTime = 0;
  renderResults();
  renderFrame(selected, 0);
}

function formatTime(seconds, tenths = false) {
  const safe = Math.max(0, seconds || 0);
  const mins = Math.floor(safe / 60);
  const secs = safe - mins * 60;
  return tenths ? `${String(mins).padStart(2, "0")}:${secs.toFixed(1).padStart(4, "0")}` : `${mins}:${Math.round(secs).toString().padStart(2, "0")}`;
}

function renderStrategies() {
  strategyList.innerHTML = "";
  strategies.forEach((strategy) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `strategy-option${strategy.id === state.selected ? " active" : ""}`;
    button.innerHTML = `<span class="strategy-glyph">${strategy.glyph}</span><span class="strategy-copy"><b>${strategy.name}</b><small>${strategy.subtitle}</small></span><span class="strategy-check">${strategy.id === state.selected ? "✓" : ""}</span>`;
    button.addEventListener("click", () => selectStrategy(strategy.id));
    strategyList.appendChild(button);
  });
}

function buildBus() {
  seatGrid.innerHTML = "";
  for (let row = 1; row <= ROWS; row += 1) {
    SEATS.forEach((seat) => {
      const el = document.createElement("div");
      const id = `r${row}-${seat.side}-${seat.kind}`;
      el.className = `seat ${seat.kind} ${seat.side === "R" ? "right" : "left"}`;
      el.id = `seat-${id}`;
      el.style.gridRow = row;
      el.style.gridColumn = seat.col;
      el.innerHTML = `<span class="person" title="Row ${row}, ${seat.side === "L" ? "left" : "right"} ${seat.kind} seat"></span>`;
      seatGrid.appendChild(el);
    });
    const marker = document.createElement("span");
    marker.className = "row-number";
    marker.textContent = row;
    marker.style.top = `${((row - 0.5) / ROWS) * 100}%`;
    seatGrid.appendChild(marker);
  }
}

function selectStrategy(id) {
  state.selected = id;
  state.displayTime = 0;
  state.playing = false;
  $("playIcon").textContent = "▶";
  renderStrategies();
  renderResults();
  renderFrame(state.simulations.get(id), 0);
}

function frameAt(sim, time) {
  let low = 0;
  let high = sim.frames.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (sim.frames[mid].t <= time) low = mid;
    else high = mid - 1;
  }
  return sim.frames[low];
}

function renderFrame(sim, time) {
  if (!sim) return;
  const frame = frameAt(sim, time);
  const total = sim.total;
  $("clock").textContent = formatTime(time, true);
  $("progress").value = Math.round((time / total) * 1000);
  aisleTrack.innerHTML = "";
  let seated = 0;
  let exited = 0;

  frame.people.forEach((p) => {
    const seat = $(`seat-${p.id}`);
    seat.classList.remove("preparing", "cleared");
    const hasEntered = p.enteredAt !== null && time >= p.enteredAt;
    const hasExited = p.exitedAt !== null && time >= p.exitedAt;
    const isPreparing = p.prepStart !== null && time >= p.prepStart && !hasEntered;
    if (isPreparing) seat.classList.add("preparing");
    if (hasEntered) seat.classList.add("cleared");
    if (!hasEntered) seated += 1;
    if (hasExited) exited += 1;
    if (hasEntered && !hasExited) {
      const dot = document.createElement("span");
      dot.className = "walker";
      const pos = Math.max(0, Math.min(ROWS, p.pos));
      dot.style.top = `${(pos / ROWS) * 100}%`;
      aisleTrack.appendChild(dot);
    }
  });
  $("progressStatus").textContent = exited === 60 ? "Bus empty" : `${seated} seated · ${exited} off`;
}

function renderResults() {
  const ordered = [...state.simulations.values()].sort((a, b) => a.total - b.total);
  const current = state.simulations.get(state.selected);
  const best = ordered[0];
  const strategy = strategies.find((s) => s.id === state.selected);
  $("activeStrategyName").textContent = strategy.name;
  $("totalTime").textContent = formatTime(current.total);
  $("lastSeat").textContent = formatTime(current.lastSeatClears, true);
  $("peakAisle").textContent = `${current.peakAisle} people`;
  const delta = current.total - best.total;
  $("resultDelta").textContent = delta < 0.1 ? "Fastest in this comparison" : `${delta.toFixed(1)} s behind ${strategies.find((s) => s.id === best.strategy).name}`;

  const max = Math.max(...ordered.map((s) => s.total));
  const min = Math.min(...ordered.map((s) => s.total));
  $("ranking").innerHTML = ordered.map((sim, i) => {
    const meta = strategies.find((s) => s.id === sim.strategy);
    const width = 45 + ((max - sim.total) / Math.max(1, max - min)) * 55;
    return `<div class="rank-row${sim.strategy === state.selected ? " active" : ""}"><span>${String(i + 1).padStart(2, "0")}</span><div class="rank-copy"><div class="rank-name"><span>${meta.name}</span></div><div class="rank-track"><i style="width:${width}%"></i></div></div><b>${formatTime(sim.total)}</b></div>`;
  }).join("");

  $("insightTitle").textContent = `${strategies.find((s) => s.id === best.strategy).name} wins this run.`;
  $("insightText").textContent = `It empties the bus in ${formatTime(best.total, true)}—${(ordered[1].total - best.total).toFixed(1)} seconds ahead of the next strategy. Change the stand-up or walking times to see whether the winner holds.`;
}

function animate(timestamp) {
  if (!state.playing) return;
  const sim = state.simulations.get(state.selected);
  if (!state.lastFrame) state.lastFrame = timestamp;
  const delta = Math.min(0.08, (timestamp - state.lastFrame) / 1000);
  state.lastFrame = timestamp;
  state.displayTime += delta * state.playbackSpeed;
  if (state.displayTime >= sim.total) {
    state.displayTime = sim.total;
    state.playing = false;
    $("playIcon").textContent = "▶";
  }
  renderFrame(sim, state.displayTime);
  if (state.playing) state.raf = requestAnimationFrame(animate);
}

function togglePlay() {
  const sim = state.simulations.get(state.selected);
  if (state.displayTime >= sim.total) state.displayTime = 0;
  state.playing = !state.playing;
  $("playIcon").textContent = state.playing ? "Ⅱ" : "▶";
  state.lastFrame = 0;
  if (state.playing) state.raf = requestAnimationFrame(animate);
}

function reset() {
  state.playing = false;
  state.displayTime = 0;
  $("playIcon").textContent = "▶";
  renderFrame(state.simulations.get(state.selected), 0);
}

function updateModel() {
  state.aisleTime = Number($("aisleTime").value);
  state.windowTime = Number($("windowTime").value);
  state.walkSpeed = Number($("walkSpeed").value);
  $("aisleOutput").textContent = `${state.aisleTime.toFixed(1)} s`;
  $("windowOutput").textContent = `${state.windowTime.toFixed(1)} s`;
  $("walkOutput").textContent = `${state.walkSpeed.toFixed(2).replace(/0$/, "")} row/s`;
  runAll();
}

$("playButton").addEventListener("click", togglePlay);
$("resetButton").addEventListener("click", reset);
$("compareButton").addEventListener("click", () => {
  runAll();
  $("insight").scrollIntoView({ behavior: "smooth", block: "center" });
});
$("progress").addEventListener("input", (event) => {
  state.playing = false;
  $("playIcon").textContent = "▶";
  const sim = state.simulations.get(state.selected);
  state.displayTime = (Number(event.target.value) / 1000) * sim.total;
  renderFrame(sim, state.displayTime);
});
$("playbackSpeed").addEventListener("change", (event) => { state.playbackSpeed = Number(event.target.value); });
["aisleTime", "windowTime", "walkSpeed"].forEach((id) => $(id).addEventListener("input", updateModel));
$("assumptionsButton").addEventListener("click", () => $("assumptionsDialog").showModal());

buildBus();
renderStrategies();
runAll();
