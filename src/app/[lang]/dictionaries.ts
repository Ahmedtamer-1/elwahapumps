const dictionaries = {
  ar: () => import('../../dictionaries/ar.json').then((module) => module.default),
  en: () => import('../../dictionaries/en.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

/**
 * The shape returned by getDictionary(). Components should take a slice of
 * this (e.g. `Dictionary["contactPage"]`) rather than the whole object —
 * narrower props are easier to typecheck and cheaper to pass down.
 *
 * Previously several components typed this prop `any`, which meant a
 * renamed or missing dictionary key failed silently at runtime in one
 * locale only, instead of at build time in both.
 */
export type Dictionary = Awaited<ReturnType<typeof getDictionary>>

// `Object.hasOwn`, not `in` — `in` walks the prototype chain, so values like
// "constructor" or "toString" would pass this guard and `getDictionary`
// would then call `dictionaries["constructor"]()`, returning `{}` instead
// of 404ing. That renders every prototype-key path as a soft 404: an
// indexable, near-empty page a crawler can reach.
export const hasLocale = (locale: string): locale is Locale =>
  Object.hasOwn(dictionaries, locale)

export const getDictionary = async (locale: Locale) => {
  // Safe fallback if locale is invalid
  if (!hasLocale(locale)) {
    return dictionaries.ar()
  }
  return dictionaries[locale]()
}
