const DEFAULT_CHAT_API_BASE_URL = 'http://localhost:3000';
const DEFAULT_CHAT_API_TOKEN = 'super-secret-doodle-token';
const DEFAULT_MESSAGES_LIMIT = 50;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const appConfig = {
  chatApi: {
    baseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_CHAT_API_BASE_URL),
    token: import.meta.env.VITE_CHAT_API_TOKEN ?? DEFAULT_CHAT_API_TOKEN,
    routePrefix: '/api/v1',
    defaultMessagesLimit: DEFAULT_MESSAGES_LIMIT,
  },
} as const;
