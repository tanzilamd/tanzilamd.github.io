// Stable public routes; content IDs stay unchanged when copy is edited.
export const playRoutes = {
  playground: '/play/playground/',
  draw: '/play/drawing-pad/',
  button: '/play/do-not-press/',
  'tic-tac-toe': '/play/tic-tac-toe/',
  'stack-tower': '/play/stack-tower/',
  snake: '/play/snake/',
  'dino-run': '/play/dino-run/',
  'aim-trainer': '/play/aim-trainer/',
} as const;
export const playKeys = ['playground', 'draw', 'button', 'tic-tac-toe', 'stack-tower', 'snake', 'dino-run', 'aim-trainer'] as const;
export type PlayKey = keyof typeof playRoutes;
