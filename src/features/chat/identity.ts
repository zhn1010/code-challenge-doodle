import { useState } from 'react';

import { getStoredChatAuthor, setStoredChatAuthor } from '../../lib/storage';

const AUTHOR_MAX_LENGTH = 50;
const AUTHOR_PATTERN = /^[\w\s-]+$/;

const normalizeAuthor = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

const normalizeAuthorForComparison = (value: string): string => {
  return normalizeAuthor(value).toLocaleLowerCase();
};

export const areAuthorsSame = (firstAuthor?: string, secondAuthor?: string): boolean => {
  if (!firstAuthor || !secondAuthor) {
    return false;
  }

  return normalizeAuthorForComparison(firstAuthor) === normalizeAuthorForComparison(secondAuthor);
};

export const validateAuthor = (value: string): string | null => {
  const author = normalizeAuthor(value);

  if (!author) {
    return 'Please enter your display name.';
  }

  if (author.length > AUTHOR_MAX_LENGTH) {
    return `Display name must be ${AUTHOR_MAX_LENGTH} characters or fewer.`;
  }

  if (!AUTHOR_PATTERN.test(author)) {
    return 'Use letters, numbers, spaces, hyphens, or underscores only.';
  }

  return null;
};

type SaveAuthorResult =
  | {
      ok: true;
      author: string;
    }
  | {
      ok: false;
      error: string;
    };

type UseLocalAuthorResult = {
  author: string;
  hasAuthor: boolean;
  saveAuthor: (value: string) => SaveAuthorResult;
};

export const useLocalAuthor = (): UseLocalAuthorResult => {
  const [author, setAuthor] = useState(() => getStoredChatAuthor());

  const saveAuthor = (value: string): SaveAuthorResult => {
    const validationError = validateAuthor(value);

    if (validationError) {
      return {
        ok: false,
        error: validationError,
      };
    }

    const nextAuthor = normalizeAuthor(value);

    setStoredChatAuthor(nextAuthor);
    setAuthor(nextAuthor);

    return {
      ok: true,
      author: nextAuthor,
    };
  };

  return {
    author,
    hasAuthor: author.length > 0,
    saveAuthor,
  };
};
