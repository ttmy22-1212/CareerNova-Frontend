export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.error("Error setting localStorage:", err);
  }
};

export const getLocalStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (err) {
    console.error("Error getting localStorage:", err);
    return null;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Error removing localStorage:", err);
  }
};

export const hasLocalStorage = (key: string): boolean => {
  return localStorage.getItem(key) !== null;
};

export const CAREERS_LOGIN = "career_lens_login";
export const EXPIRED_LOGIN = 7;

// {
//     expired_at: new Date()
// }
