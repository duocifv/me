// import "server-only";
import crypto from "crypto";

type Locale = "en" | "de";

const dictionaries: Record<Locale, () => Promise<Record<string, string>>> = {
  en: () => import("../share/i18n/en/resource.json").then((m) => m.default),
  de: () => import("../share/i18n/de/resource.json").then((m) => m.default),
};

let cachedDictionary: Record<string, string> | null = null;
let cachedLocale: Locale | null = null;

export async function loadDictionaryOnce(locale: Locale = "en") {
  if (!(locale in dictionaries)) {
    locale = "en";
  }
  if (cachedLocale !== locale || !cachedDictionary) {
    cachedDictionary = await dictionaries[locale]();
    cachedLocale = locale;
  }
  return cachedDictionary;
}

function generateKey(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}

export function $t(strings: TemplateStringsArray): string {
  const message = strings[0].trim();
  const key = generateKey(message);
  if (!cachedDictionary) {
    return message;
  }
  return cachedDictionary[key] || message;
}
