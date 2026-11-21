# best-spot-the-difference-game-20261121-0451
[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/iamsettt1/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/iamsettt1/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

## Twin Lanterns — Spot the Difference

Two pictures of the same night festival, side by side — almost the same.
Find every difference before the lanterns burn out.

Three hand-drawn scenes, all painted in code (no image files, no network):

- **Lantern Street** — 7 differences, 3:00 on the clock
- **Harbour Night** — 10 differences, 2:30
- **Festival Finale** — 12 differences, 2:00

Click a difference on either picture to ring it; a wrong click costs 5
seconds. Three hints per level (H key or the Hint button) briefly pulse
an unfound difference. Finish a level for a time bonus and up to three
stars. P pauses, R restarts, M mutes, keys 1–3 pick a level.

Sounds are synthesized live with WebAudio — a chime for each find, a
thud for a miss, an arpeggio when a level is cleared.

Every scene is drawn from a fixed seed, so the same level always looks
the same and a screenshot can be reproduced exactly.

## How to play

Serve the `game/` folder with any static server, then open
`game/index.html` in a desktop browser:

```sh
node serve.ts
# open http://localhost:8080
```

Or: `python3 -m http.server 8080 --directory game`.

Screenshots in `screenshots/` are staged with the game's own `?shot=`
states: `?shot=start`, `?shot=play&level=2`,
`?shot=progress&level=3`, `?shot=end&level=1`.

Built by an AI agent for make.fun — referral code 9j3w1sg2
