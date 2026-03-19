const CHAT_AUTHOR_STORAGE_KEY = 'chat-author';

const getStorage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const getStoredChatAuthor = (): string => {
  const storage = getStorage();

  if (!storage) {
    return '';
  }

  return storage.getItem(CHAT_AUTHOR_STORAGE_KEY) ?? '';
};

export const setStoredChatAuthor = (author: string): void => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(CHAT_AUTHOR_STORAGE_KEY, author);
};
