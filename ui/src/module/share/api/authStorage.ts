"use client";

const LOGIN_STATE_KEY = "IS_LOGGED_IN";

export const loginState = {
  /**
   * Checks if the user is currently marked as logged in.
   * @returns `true` if logged in, otherwise `false`.
   */
  isLoggedIn() {
    if (typeof window === "undefined") return;
    try {
      return localStorage.getItem(LOGIN_STATE_KEY) !== null;
    } catch {
      // console.warn(
      //   "LoginState.isLoggedIn(): unable to access localStorage",
      //   error
      // );
      return false;
    }
  },

  getToken() {
    if (typeof window === "undefined") return null;

    try {
      return localStorage.getItem(LOGIN_STATE_KEY);
    } catch (error) {
      console.warn(
        "LoginState.setLoggedIn(): unable to access localStorage",
        error
      );
      return null;
    }
  },

  setLoggedIn(token: string): void {
    console.log("token token", token);
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOGIN_STATE_KEY, token);
    } catch (error) {
      console.warn(
        "LoginState.setLoggedIn(): unable to access localStorage",
        error
      );
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(LOGIN_STATE_KEY);
    } catch (error) {
      console.warn("LoginState.clear(): unable to access localStorage", error);
    }
  },
};
