const dictionaries = {
  ar: () => import('../../dictionaries/ar.json').then((module) => module.default),
  en: () => import('../../dictionaries/en.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async (locale: Locale) => {
  // Safe fallback if locale is invalid
  if (!hasLocale(locale)) {
    return dictionaries.ar()
  }
  return dictionaries[locale]()
}
