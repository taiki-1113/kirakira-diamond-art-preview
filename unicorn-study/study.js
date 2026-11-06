import { colors, regions } from './scene.js';

const canvas = document.getElementById('art');
const context = canvas.getContext('2d');
const tester = document.createElement('canvas').getContext('2d');
const size = 1254;
const beads = [];
const placed = new Set();
const paths = regions.map(region => new Path2D(region.path));
const sprites = new Map();
const matte = new Map();
let ornaments = [];
let ornamentPaths = [];
let horn;
let hornPlaced = true;
let ready = false;

function image(src) {
  return new Promise((resolve, reject) => {
    const picture = new Image();
    picture.onload = () => resolve(picture);
    picture.onerror = () => reject(new Error(src));
    picture.src = src;
  });
}

function contains(index, x, y) {
  const region = regions[index];
  if (region.stroke) {
    tester.lineWidth = region.stroke;
    return tester.isPointInStroke(paths[index], x, y);
  }
  return tester.isPointInPath(paths[index], x, y);
}

function topRegion(x, y) {
  for (let index = regions.length - 1; index >= 0; index--) {
    if (contains(index, x, y)) return index;
  }
  return -1;
}

function covered(x, y) {
  if (x > 221 && x < 441 && y > 20 && y < 324) return true;
  return ornamentPaths.some(path => tester.isPointInPath(path, x, y));
}

function addBead(x, y, radius, color, regionIndex, border = false) {
  if (covered(x, y)) return;
  for (let step = 0; step < 12; step++) {
    const angle = step * Math.PI / 6;
    const px = x + Math.cos(angle) * (radius + 1);
    const py = y + Math.sin(angle) * (radius + 1);
    const top = topRegion(px, py);
    if (covered(px, py) || top > regionIndex || (!border && top !== regionIndex)) return;
  }
  if (beads.some(bead => Math.hypot(bead.x - x, bead.y - y) < bead.radius + radius + .8)) return;
  beads.push({x, y, radius, color, turn: beads.length * 2.39996});
}

function makeLayout() {
  // Lavender edging is also made of independent, tappable beads.
  regions.forEach((region, index) => {
    if (!region.stroke) return;
    const curve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    curve.setAttribute('d', region.path);
    const length = curve.getTotalLength();
    const radius = Math.min(region.radius, region.stroke / 2 - 4);
    const count = Math.floor(length / (radius * 2 + 1.5));
    for (let step = 0; step < count; step++) {
      const point = curve.getPointAtLength(length * (step + .5) / count);
      addBead(point.x, point.y, radius, region.color, index);
    }
  });
  regions.forEach((region, index) => {
    if (!region.rim) return;
    const curve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    curve.setAttribute('d', region.path);
    const length = curve.getTotalLength();
    const count = Math.floor(length / 31);
    for (let step = 0; step < count; step++) {
      const point = curve.getPointAtLength(length * step / count);
      addBead(point.x, point.y, 15, region.rim, index, true);
    }
  });
  regions.forEach((region, index) => {
    const radius = region.radius;
    const spacing = radius * 2 + 1.2;
    for (let row = 0; row * spacing * .866 < size; row++) {
      const y = 18 + row * spacing * .866;
      for (let column = 0; column * spacing < size; column++) {
        const x = 18 + column * spacing + row % 2 * spacing / 2;
        if (topRegion(x, y) === index) addBead(x, y, radius, region.color, index);
      }
    }
  });
  // Smaller gems fill narrow feather and mane sections without overlapping a neighbor.
  for (const radius of [13, 9, 6]) {
    const spacing = radius * 2 + 1;
    for (let row = 0; row * spacing * .866 < size; row++) {
      const y = 10 + row * spacing * .866;
      for (let column = 0; column * spacing < size; column++) {
        const x = 10 + column * spacing + row % 2 * spacing / 2;
        const index = topRegion(x,y);
        if (index >= 0) addBead(x,y,radius,regions[index].color,index);
      }
    }
  }
}

function matteSprite(original) {
  const copy = document.createElement('canvas');
  copy.width = original.width;
  copy.height = original.height;
  const paint = copy.getContext('2d');
  paint.drawImage(original, 0, 0);
  const pixels = paint.getImageData(0, 0, copy.width, copy.height);
  const values = pixels.data;
  for (let index = 0; index < values.length; index += 4) {
    const light = .2126 * values[index] + .7152 * values[index+1] + .0722 * values[index+2];
    const soft = 205 + .42 * (light - 205) - .23 * Math.max(0, light - 220);
    for (let channel = 0; channel < 3; channel++) values[index+channel] = soft + .64 * (values[index+channel] - light);
  }
  paint.putImageData(pixels, 0, 0);
  return copy;
}

function paintRegions() {
  regions.forEach((region, index) => {
    const gradient = context.createLinearGradient(0, 0, 900, 1200);
    gradient.addColorStop(0, colors[region.color][0]);
    gradient.addColorStop(1, colors[region.color][1]);
    context.fillStyle = gradient;
    context.strokeStyle = gradient;
    if (region.stroke) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = region.stroke;
      context.stroke(paths[index]);
    } else {
      context.fill(paths[index]);
      if (region.gold || region.rim) {
        context.strokeStyle = region.gold ? '#d8a337' : '#b095d2';
        context.lineWidth = region.gold ? 17 : 27;
        context.stroke(paths[index]);
        if (region.gold) {
          context.strokeStyle = '#fff0a6';
          context.lineWidth = 8;
          context.stroke(paths[index]);
          const curve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          curve.setAttribute('d', region.path);
          const length = curve.getTotalLength();
          for (let distance = 0; distance < length; distance += 15) {
            const point = curve.getPointAtLength(distance);
            context.fillStyle = distance % 30 < 15 ? '#ffdf67' : '#fff6cc';
            context.beginPath();
            context.arc(point.x, point.y, 4, 0, Math.PI * 2);
            context.fill();
          }
        }
      }
    }
  });
}

function render() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = size * ratio;
  canvas.height = size * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  paintRegions();
  beads.forEach((bead, index) => {
    context.save();
    context.translate(bead.x, bead.y);
    context.rotate(bead.turn);
    context.drawImage(placed.has(index) ? sprites.get(bead.color) : matte.get(bead.color),
      -bead.radius, -bead.radius, bead.radius * 2, bead.radius * 2);
    context.restore();
  });
  for (const ornament of ornaments) context.drawImage(ornament.image, ornament.x, ornament.y);
  if (hornPlaced) context.drawImage(horn, 227, 24);
  else {
    context.fillStyle = '#f5eefa';
    context.fillRect(235, 30, 185, 270);
  }
  document.getElementById('count').textContent = placed.size + ' / ' + beads.length + ' 粒' +
    (hornPlaced ? ' ＋ 最後の角' : placed.size === beads.length ? ' · 角の場所をタップして完成' : '');
  document.getElementById('state').textContent = hornPlaced && placed.size === beads.length ? '完成した姿' : 'タップで一粒ずつ';
  document.getElementById('some').disabled = placed.size === beads.length;
}

async function start() {
  const response = await fetch('ornaments.json');
  if (!response.ok) throw new Error('ornaments.json');
  ornaments = await response.json();
  await Promise.all(ornaments.map(async ornament => {
    ornament.image = await image('assets/' + ornament.name + '.png');
  }));
  ornamentPaths = ornaments.map(ornament => {
    const path = new Path2D();
    ornament.outline.forEach(([x,y], index) => index ? path.lineTo(x,y) : path.moveTo(x,y));
    path.closePath();
    return path;
  });
  await Promise.all(Object.keys(colors).map(async name => {
    const original = await image('assets/' + name + '.png');
    sprites.set(name, original);
    matte.set(name, matteSprite(original));
  }));
  horn = await image('assets/horn.png');
  if (new URLSearchParams(location.search).has('authoring')) {
    makeLayout();
  } else {
    const layoutResponse = await fetch('layout.json');
    if (!layoutResponse.ok) throw new Error('layout.json');
    beads.push(...await layoutResponse.json());
  }
  beads.forEach((_, index) => placed.add(index));
  ready = true;
  document.querySelectorAll('button').forEach(button => button.disabled = false);
  render();
}

canvas.onclick = event => {
  if (!ready) return;
  const box = canvas.getBoundingClientRect();
  const x = (event.clientX-box.left) * size / box.width;
  const y = (event.clientY-box.top) * size / box.height;
  const index = beads.findIndex(bead => Math.hypot(x-bead.x,y-bead.y) <= bead.radius);
  if (index >= 0) placed.add(index);
  if (placed.size === beads.length && x >= 227 && x <= 438 && y >= 24 && y <= 321) hornPlaced = true;
  render();
};
document.getElementById('try').onclick = () => { placed.clear(); hornPlaced = false; render(); };
document.getElementById('some').onclick = () => {
  let count = 0;
  for (let index = 0; index < beads.length && count < 10; index++) {
    if (!placed.has(index)) { placed.add(index); count++; }
  }
  render();
};
document.getElementById('complete').onclick = () => {
  beads.forEach((_, index) => placed.add(index));
  hornPlaced = true;
  render();
};
start().catch(error => {
  document.getElementById('state').textContent = '読み込みを確認してください';
  console.error(error);
});

export { beads, placed };
