import lilGui from "https://esm.sh/lil-gui@0.17.0";

// =============================================================================
// constants
// =============================================================================

const WIDTH = 500;
const HEIGHT = 500;

const X_CENTER = WIDTH * (1 / 2);
const Y_CENTER = HEIGHT * (1 / 2);

const X_MARGIN = WIDTH * 0.1;
const Y_MARGIN = HEIGHT * 0.1;

const X_RADIUS = (WIDTH - 2 * X_MARGIN) * (1 / 2);
const Y_RADIUS = (HEIGHT - 2 * Y_MARGIN) * (1 / 2);

const LINE_WIDTH = 20;

const TAU = 2 * Math.PI;

// =============================================================================
// helpers
// =============================================================================

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// =============================================================================
// elements
// =============================================================================

const aOverBOutput = $("#aOverB");
const dOutput = $("#d");
const canvas = $("canvas");
const ctx = canvas.getContext("2d");

// =============================================================================
// state
// =============================================================================

const gui = new lilGui();

const state = {
  a: 2, // horizontal frequency
  b: 3, // vertical frequency
  pointsCount: 500,
  duration: 20_000,
  direction: "right",
  background: { r: 255, g: 255, b: 255 },
  foreground: { r: 0, g: 0, b: 0 },
  opacity: 1,
  reverseColors: () => {
    [state.background, state.foreground] = [state.foreground, state.background];
  },
};

gui
  .add(state, "a")
  .name("a (horizontal freq.)")
  .min(1)
  .step(1)
  .onChange(() => (aOverBOutput.textContent = state.a / state.b));
gui
  .add(state, "b")
  .name("b (vertical freq.)")
  .min(1)
  .step(1)
  .onChange(() => (aOverBOutput.textContent = state.a / state.b));
gui.add(state, "pointsCount").name("Points count").min(10).step(1);
gui.add(state, "duration").name("Duration (ms)").min(1_000).step(1);
gui.add(state, "direction", ["left", "right"]).name("Direction");
gui.addColor(state, "background", 255).name("Background").listen();
gui.addColor(state, "foreground", 255).name("Foreground").listen();
gui.add(state, "opacity", 0, 1, 0.01).name("Opacity");
gui.add(state, "reverseColors").name("Reverse colors");

// =============================================================================
// rendering
// =============================================================================

function animate(timestamp) {
  drawBackground();
  drawCurve(timestamp);
  requestAnimationFrame(animate);
}

function drawBackground() {
  const x = 0;
  const y = 0;
  const width = WIDTH;
  const height = HEIGHT;
  const radius = 8;

  ctx.save();
  ctx.lineWidth = 1;
  ctx.fillStyle =
    `rgb(` +
    `${state.background.r},` +
    `${state.background.g},` +
    `${state.background.b}` +
    `)`;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawCurve(timestamp) {
  const durationIndex = (timestamp % state.duration) / state.duration;
  const angle = durationIndex * TAU;
  const d = TAU * durationIndex; // animation offset

  dOutput.textContent = `${(d / Math.PI).toFixed(4)} π`;

  let firstPoint;
  let previousPoint;

  ctx.save();
  ctx.strokeStyle =
    `rgb(` +
    `${state.foreground.r},` +
    `${state.foreground.g},` +
    `${state.foreground.b},` +
    `${state.opacity}` +
    `)`;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  for (let i = 0; i <= state.pointsCount; i++) {
    const pointIndex = i / state.pointsCount;
    const at = state.a * TAU * pointIndex;
    const bt = state.b * TAU * pointIndex;

    const x = X_CENTER + X_RADIUS * Math.sin(at + d);
    const y = Y_CENTER + Y_RADIUS * Math.cos(bt);

    const distance = (at + angle + TAU) % TAU;
    const distanceIndex = distance / TAU;

    let wave;
    if (state.direction === "right") wave = Math.abs(distanceIndex * 2 - 1);
    if (state.direction === "left") wave = 1 - Math.abs(distanceIndex * 2 - 1);

    ctx.lineWidth = wave * LINE_WIDTH;

    if (i === 0) {
      ctx.moveTo(x, y);
      firstPoint = { x, y };
      previousPoint = { x, y };
      continue;
    }

    if (i === state.pointsCount) {
      ctx.beginPath();
      ctx.moveTo(previousPoint.x, previousPoint.y);
      ctx.lineTo(firstPoint.x, firstPoint.y);
      ctx.stroke();
      previousPoint = { x, y };
      continue;
    }

    ctx.beginPath();
    ctx.moveTo(previousPoint.x, previousPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    previousPoint = { x, y };
  }

  ctx.restore();
}

// =============================================================================
// listeners
// =============================================================================

window.addEventListener("load", () => {
  canvas.setAttribute("width", WIDTH * window.devicePixelRatio);
  canvas.setAttribute("height", HEIGHT * window.devicePixelRatio);
  canvas.setAttribute("style", `width: ${WIDTH}px; height: ${HEIGHT}px;`);

  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  aOverBOutput.textContent = state.a / state.b;

  requestAnimationFrame(animate);
});
