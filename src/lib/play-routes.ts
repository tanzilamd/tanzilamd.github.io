// Stable public routes; content IDs stay unchanged when copy is edited.
export const playRoutes = {
  playground: '/play/playground/',
  draw: '/play/drawing-pad/',
  button: '/play/do-not-press/',
} as const;
export type PlayKey = keyof typeof playRoutes;
