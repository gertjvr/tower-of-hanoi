Kids-Friendly Tower of Hanoi (React + Vite)

Overview
- Click-to-select controls: tap/click a source peg, then a destination peg
- Starts at 3 disks; increases one disk after each win up to 7
- LocalStorage persistence: refresh-safe progress and board state
- Undo: single-step undo of the last move
- Confetti celebration on completion
- Hint button: highlights a legal move (auto-clears after 5s)
- Suitable for Cloudflare Pages static hosting

Local Development
1. Install deps: `npm install`
2. Run dev server: `npm run dev`
3. Build for production: `npm run build`
4. Preview build locally: `npm run preview`

Cloudflare Pages Deployment
- Framework preset: `None` (or Vite)
- Build command: `npm run build`
- Build output directory: `dist`
- Environment: Node.js 18+ (Cloudflare default works)

Game Rules
- Move one disk at a time
- Only the top disk can be moved from a peg
- A larger disk cannot be placed on top of a smaller disk

Persistence
- State is saved under the `hanoi-v1` key in `localStorage`
- Saved: current disk count, piles, move count, completion flag
- Also saved: last-move history stack for Undo

Accessibility
- Pegs are focusable buttons with clear labels
- Selected peg is highlighted; visual focus states included
- Hint highlights source and target pegs with gentle pulse

Notes
- No external confetti dependency; uses lightweight CSS animation
