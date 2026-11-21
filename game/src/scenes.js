// Twin Lanterns — scene definitions.
// Each scene is a list of drawable elements plus the differences between
// its left (original) and right (altered) panels. Coordinates are in the
// panel's own space: 580 wide, 590 tall. A difference is a spot the player
// can click; `x`/`y`/`r` are the click target in panel space.
//
// An element may carry `alt`: overrides applied only on the right panel
// (recolour, move, hide, retext). An element with `rightOnly` is drawn only
// on the right panel (an added object). The left panel always shows the
// plain element, so every difference is a real, fair change between the
// two pictures the player compares.

export const PANEL_W = 580;
export const PANEL_H = 590;

function diff(x, y, r, label) {
  return { x, y, r, label };
}

// ---------------------------------------------------------------------------
// Level 1 — Lantern Street. A quiet night market lane under paper lanterns.
// 7 differences, 180 seconds.
// ---------------------------------------------------------------------------
export const LANTERN_STREET = {
  id: 1,
  name: 'Lantern Street',
  tagline: 'Paper lanterns over a sleepy market lane',
  timeLimit: 180,
  seed: 101,
  skyTop: '#2b1d4e',
  skyBottom: '#c96f3f',
  elements: [
    { kind: 'stars', seed: 11, count: 26 },
    { kind: 'moon', x: 492, y: 74, r: 34, alt: { hidden: true } },
    { kind: 'rooftops', y: 330, color: '#241640' },
    { kind: 'stringLights', y: 118, sag: 26, bulbs: 9, gap: 62, altBulb: 4 },
    { kind: 'lantern', x: 120, y: 210, r: 46, color: '#e5484d', cord: 96 },
    { kind: 'lantern', x: 300, y: 196, r: 40, color: '#f5b942', cord: 82,
      alt: { color: '#3fae7a' } },
    { kind: 'lantern', x: 462, y: 214, r: 44, color: '#2f9e8f', cord: 100 },
    { kind: 'banner', x: 60, y: 292, w: 200, h: 34, color: '#e5484d', dots: 3,
      alt: { dots: 2 } },
    { kind: 'stall', x: 66, y: 400, w: 190, h: 130, awning: '#e5484d',
      sign: 'NOODLES', alt: { sign: 'RAMEN' } },
    { kind: 'stall', x: 330, y: 412, w: 170, h: 118, awning: '#2f6fb2',
      sign: 'TEA', jars: 3 },
    { kind: 'stoneLantern', x: 500, y: 470 },
    { kind: 'cat', x: 452, y: 322, scale: 1, alt: { hidden: true } },
    { kind: 'ground', y: 520 },
    { kind: 'puddle', x: 180, y: 556, w: 130 },
    { kind: 'star', x: 84, y: 60, r: 7, rightOnly: true },
  ],
  differences: [
    diff(492, 74, 40, 'The moon vanished'),
    diff(300, 196, 48, 'A lantern changed colour'),
    diff(452, 322, 34, 'The cat slipped away'),
    diff(160, 309, 44, 'A banner lost a lantern-mark'),
    diff(84, 60, 22, 'A new star appeared'),
    diff(161, 400, 40, 'The stall sign changed'),
    diff(304, 132, 16, 'A string light went out'),
  ],
};

// ---------------------------------------------------------------------------
// Level 2 — Harbour Night. Fishing boats, a lighthouse and late fireworks.
// 10 differences, 150 seconds.
// ---------------------------------------------------------------------------
export const HARBOUR_NIGHT = {
  id: 2,
  name: 'Harbour Night',
  tagline: 'Boats bobbing under the lighthouse beam',
  timeLimit: 150,
  seed: 202,
  skyTop: '#0d1b3d',
  skyBottom: '#274b73',
  elements: [
    { kind: 'stars', seed: 23, count: 34 },
    { kind: 'moon', x: 88, y: 70, r: 28 },
    { kind: 'firework', x: 430, y: 110, r: 52, color: '#f5b942', arms: 10 },
    { kind: 'firework', x: 210, y: 88, r: 34, color: '#e5484d', arms: 8,
      alt: { hidden: true } },
    { kind: 'lighthouse', x: 496, y: 250, h: 190, beamColor: '#ffe9a8' },
    { kind: 'lighthouseBeam', x: 496, y: 120, alt: { color: '#8fd0ff' } },
    { kind: 'sea', y: 400 },
    { kind: 'moonGlitter', x: 88, y: 470, w: 90, alt: { hidden: true } },
    { kind: 'boat', x: 120, y: 452, scale: 1, flag: '#e5484d',
      alt: { flag: '#3fae7a' } },
    { kind: 'boat', x: 300, y: 480, scale: 0.8, flag: '#f5b942' },
    { kind: 'boat', x: 420, y: 430, scale: 0.62, flag: '#2f9e8f',
      alt: { x: 448 } },
    { kind: 'gull', x: 150, y: 190, alt: { hidden: true } },
    { kind: 'gull', x: 250, y: 160 },
    { kind: 'gull', x: 330, y: 210 },
    { kind: 'crates', x: 60, y: 520, count: 3, alt: { count: 2 } },
    { kind: 'fishingNet', x: 380, y: 540, alt: { x: 412 } },
    { kind: 'fish', x: 250, y: 520, rightOnly: true },
    { kind: 'pier', y: 500 },
    { kind: 'ropeLights', y: 500, bulbs: 7 },
    { kind: 'window', x: 512, y: 300, lit: true, alt: { lit: false } },
  ],
  differences: [
    diff(210, 88, 40, 'A firework faded out'),
    diff(496, 120, 30, 'The lighthouse beam changed colour'),
    diff(88, 470, 46, 'The moon-path on the water is gone'),
    diff(120, 452, 34, 'A boat flag changed colour'),
    diff(420, 430, 30, 'A boat drifted sideways'),
    diff(150, 190, 22, 'A gull flew away'),
    diff(250, 520, 26, 'A fish jumped out of the sea'),
    diff(512, 300, 16, 'A lighthouse window went dark'),
    diff(60, 520, 40, 'A crate is missing from the pier'),
    diff(380, 540, 36, 'The fishing net moved'),
  ],
};

// ---------------------------------------------------------------------------
// Level 3 — Festival Finale. The big night: stage, drums, kites and crowds.
// 12 differences, 120 seconds.
// ---------------------------------------------------------------------------
export const FESTIVAL_FINALE = {
  id: 3,
  name: 'Festival Finale',
  tagline: 'The whole town out for the closing night',
  timeLimit: 120,
  seed: 303,
  skyTop: '#1a0b33',
  skyBottom: '#7a2d5e',
  elements: [
    { kind: 'stars', seed: 37, count: 40 },
    { kind: 'moon', x: 500, y: 66, r: 30, alt: { crescent: true } },
    { kind: 'firework', x: 120, y: 96, r: 46, color: '#c77dff', arms: 12,
      alt: { color: '#06d6a0' } },
    { kind: 'firework', x: 300, y: 76, r: 38, color: '#f5b942', arms: 9,
      alt: { arms: 6 } },
    { kind: 'kite', x: 420, y: 130, color: '#e5484d', alt: { color: '#2f9e8f' } },
    { kind: 'kite', x: 180, y: 170, color: '#3fae7a', alt: { string: false } },
    { kind: 'stage', x: 90, y: 330, w: 400, h: 120 },
    { kind: 'stageLights', x: 90, y: 330, w: 400, color: '#ffe9a8',
      alt: { color: '#ff8fb3' } },
    { kind: 'drum', x: 170, y: 400, r: 34, alt: { hidden: true } },
    { kind: 'drum', x: 420, y: 404, r: 30 },
    { kind: 'crowd', y: 470, count: 9, hats: 3, altHats: 2 },
    { kind: 'foodCart', x: 60, y: 500, w: 150, wheels: 2, alt: { wheels: 1 } },
    { kind: 'foodCart', x: 380, y: 510, w: 140, wheels: 2 },
    { kind: 'gateLanterns', x: 520, y: 360, count: 4, alt: { count: 3 } },
    { kind: 'balloon', x: 90, y: 260, color: '#f5b942', rightOnly: true },
    { kind: 'torch', x: 540, y: 470, flame: true, alt: { flame: false } },
    { kind: 'ground', y: 540 },
    { kind: 'confetti', seed: 77, count: 22 },
  ],
  differences: [
    diff(500, 66, 36, 'The moon turned crescent'),
    diff(300, 76, 42, 'A firework lost some sparks'),
    diff(420, 130, 30, 'A kite changed colour'),
    diff(290, 330, 60, 'The stage lights changed colour'),
    diff(170, 400, 40, 'A festival drum vanished'),
    diff(290, 470, 50, 'A hat disappeared from the crowd'),
    diff(135, 500, 40, 'A food cart lost a wheel'),
    diff(520, 360, 34, 'A gate lantern went missing'),
    diff(90, 260, 26, 'A balloon floated in'),
    diff(540, 470, 22, 'A torch flame went out'),
    diff(180, 170, 28, 'A kite string snapped loose'),
    diff(120, 96, 50, 'A firework burst changed hue'),
  ],
};

export const SCENES = [LANTERN_STREET, HARBOUR_NIGHT, FESTIVAL_FINALE];

export function sceneById(id) {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
