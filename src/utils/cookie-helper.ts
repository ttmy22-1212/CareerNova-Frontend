import {
  CookieValueTypes,
  deleteCookie,
  getCookie,
  OptionsType,
  setCookie,
} from "cookies-next";

/**
 * Defined CookieKeys to use
 */
const CookieHelper = {
  setItem: (
    key: string,
    value: string | object,
    options?: OptionsType | undefined
  ): void | Promise<void> => {
    return setCookie(key, value, options);
  },

  getItem: (
    key: string,
    options?: OptionsType | undefined
  ): CookieValueTypes | Promise<CookieValueTypes> => {
    return getCookie(key, options);
  },

  removeItem: (
    name: string,
    options?: OptionsType | undefined
  ): void | Promise<void> => {
    return deleteCookie(name, options);
  },
};

/**
 * Use for implement keys related to cookie
 */
export enum CookieKeys {
  TOKEN = "token",
}

export default CookieHelper;
