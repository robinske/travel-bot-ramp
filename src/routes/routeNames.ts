export const routeNames = {
  call: 'call',
  conversationRelay: 'conversation-relay',
  sms: 'text',
  stats: 'stats',
} as const;

export type RouteNames = typeof routeNames[keyof typeof routeNames];
