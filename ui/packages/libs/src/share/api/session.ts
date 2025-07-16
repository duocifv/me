const COOKIE_NAME = "session";

export class Session {
  static start(days = 1): void {
    const expires = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toUTCString();
    document.cookie = `${COOKIE_NAME}=1;expires=${expires};path=/`;
  }

  static end(): void {
    document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }

  static isActive(): boolean {
    return document.cookie
      .split(";")
      .some((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
  }
}
