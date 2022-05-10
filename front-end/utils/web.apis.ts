export const _window = () => {
  if (typeof window !== undefined) {
    return window;
  } else {
    return undefined;
  }
};

export const _document = () => {
  if (typeof document !== undefined) {
    return document;
  } else {
    return undefined;
  }
};

export const _localStorage = () => {
  if (typeof localStorage !== undefined) {
    return localStorage;
  } else {
    return undefined;
  }
};
