import './style.css'

const CONFIG = {
  WIDTH: 100,
  HEIGHT: 100,
  SCALE: 5
}

const state = {
  lastPos: { x: 0, y: 0 },
  game: Array.from({ length: CONFIG.WIDTH }, () => Array.from({ length: CONFIG.HEIGHT }, () => 0)),
  cycle: 0
}

function numberToRGB(number: number) {
  const hue = number % 360;

  function hsvToRgb(h: number, s: number, v: number) {
      let c = v * s;
      let x = c * (1 - Math.abs((h / 60) % 2 - 1));
      let m = v - c;
      let r = 0, g = 0, b = 0;

      if (0 <= h && h < 60) {
          r = c; g = x; b = 0;
      } else if (60 <= h && h < 120) {
          r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
          r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
          r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
          r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
          r = c; g = 0; b = x;
      }

      return {
          r: Math.round((r + m) * 255),
          g: Math.round((g + m) * 255),
          b: Math.round((b + m) * 255)
      };
  }

  // Используем полную насыщенность и яркость
  const saturation = 1; // от 0 до 1
  const brightness = 1; // от 0 до 1

  const rgb = hsvToRgb(hue, saturation, brightness);

  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function setLastPos(x: number, y: number): void {
  state.lastPos = { x: Math.floor(x / CONFIG.SCALE), y: Math.floor(y / CONFIG.SCALE) };
}

function setLastPosEvent(e: MouseEvent) {
  setLastPos(e.offsetX, e.offsetY);
}

function fillRect(context2d: CanvasRenderingContext2D, x: number, y: number): void {
  state.game[Math.floor(x / CONFIG.SCALE)][Math.floor(y / CONFIG.SCALE)] = 2;
  updateCanvas(context2d);
}

function setEvents(canvasElm: HTMLCanvasElement, context2d: CanvasRenderingContext2D): void {
  canvasElm.addEventListener('mouseenter', setLastPosEvent);
  canvasElm.addEventListener('mousedown', setLastPosEvent);

  canvasElm.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
      fillRect(context2d, e.offsetX, e.offsetY);
      setLastPosEvent(e)
    }
  });

  canvasElm.addEventListener('click', (e) => {
      fillRect(context2d, e.offsetX, e.offsetY);
  });

  document.getElementById('start')?.addEventListener('click', () => start(context2d));
}

function isCell(x: number, y: number): boolean {
  let mx = x;
  let my = y;

  if (x < 0 || x > CONFIG.WIDTH - 1) {
    mx = Math.abs(Math.abs(x) - CONFIG.WIDTH);
  }

  if (y < 0 || y > CONFIG.HEIGHT - 1) {
    my = Math.abs(Math.abs(y) - CONFIG.HEIGHT);
  }

  return state.game[mx][my] === 2;
}

function clearCanvas(context2d: CanvasRenderingContext2D) {
  context2d.fillStyle = 'white';
  context2d.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
}

function updateCanvas(context2d: CanvasRenderingContext2D) {
  clearCanvas(context2d);
  state.cycle += 1;
  document.getElementById('start')!.innerText = state.cycle.toString()

  for (let x = 0; x < CONFIG.WIDTH; x++) {
    for (let y = 0; y < CONFIG.HEIGHT; y++) {
      if (state.game[x][y] === 0) {
        context2d.fillStyle = 'white';
      }

      if (isNaN(state.game[x][y])) {
        context2d.fillStyle = state.game[x][y] as any;
      }

      if (state.game[x][y] === 2) {
        context2d.fillStyle = 'black';
      }

      context2d.fillRect(x, y, 1, 1);
    }
  }
}

function loop(context2d: CanvasRenderingContext2D) {
  const newState = JSON.parse(JSON.stringify(state.game))

  for (let x = 0; x < CONFIG.WIDTH; x++) {
    for (let y = 0; y < CONFIG.HEIGHT; y++) {
      const currentIsCell = isCell(x, y);
      let neighboursCount = 0;
      
      if (isCell(x - 1, y)) {
        neighboursCount += 1;
      }

      if (isCell(x - 1, y - 1)) {
        neighboursCount += 1;
      }

      if (isCell(x, y - 1)) {
        neighboursCount += 1;
      }

      if (isCell(x + 1, y - 1)) {
        neighboursCount += 1;
      }

      if (isCell(x + 1, y)) {
        neighboursCount += 1;
      }

      if (isCell(x + 1, y + 1)) {
        neighboursCount += 1;
      }

      if (isCell(x, y + 1)) {
        neighboursCount += 1;
      }

      if (isCell(x - 1, y + 1)) {
        neighboursCount += 1;
      }

      if (currentIsCell && (neighboursCount < 2 || neighboursCount > 3)) {
        newState[x][y] = numberToRGB(state.cycle);
      } else if (currentIsCell && neighboursCount > 1) {
        newState[x][y] = 2;
      } else if (!currentIsCell && neighboursCount === 3) {
        newState[x][y] = 2;
      }
    }
  }

  state.game = newState;
  updateCanvas(context2d);
    requestAnimationFrame(() => loop(context2d));
}

function start(context2d: CanvasRenderingContext2D) {
  state.cycle = 0;
  loop(context2d);
}

const canvasElm = document.querySelector<HTMLCanvasElement>('#canvas')
const context2d = canvasElm?.getContext('2d');

if (canvasElm && context2d) {
  canvasElm.width = CONFIG.WIDTH
  canvasElm.height = CONFIG.HEIGHT

  setEvents(canvasElm, context2d);
  clearCanvas(context2d);
} else {
  console.error('Canvas or 2D context not found');
}

