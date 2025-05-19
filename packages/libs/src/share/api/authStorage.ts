/*
 * loginState.ts
 * Utility methods for persisting the user's login status in localStorage
 */

/**
 * Key under which the login status is stored in localStorage
 */
const LOGIN_STATE_KEY = "IS_LOGGED_IN";

/**
 * Provides methods to read, write, and clear the user's login status.
 */
export const loginState = {
  /**
   * Checks if the user is currently marked as logged in.
   * @returns `true` if logged in, otherwise `false`.
   */
  isLoggedIn(): boolean {
    try {
      return localStorage.getItem(LOGIN_STATE_KEY) === "true";
    } catch (error) {
      console.warn(
        "LoginState.isLoggedIn(): unable to access localStorage",
        error
      );
      return false;
    }
  },

  /**
   * Marks the user as logged in.
   */
  setLoggedIn(): void {
    try {
      localStorage.setItem(LOGIN_STATE_KEY, "true");
    } catch (error) {
      console.warn(
        "LoginState.setLoggedIn(): unable to access localStorage",
        error
      );
    }
  },

  /**
   * Clears the login status, marking the user as logged out.
   */
  clear(): void {
    try {
      localStorage.removeItem(LOGIN_STATE_KEY);
    } catch (error) {
      console.warn("LoginState.clear(): unable to access localStorage", error);
    }
  },
};
