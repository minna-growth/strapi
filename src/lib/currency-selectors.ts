import type { Currency, CountryRef, RelatedDestination } from "./strapi";
import { SUPPORTED_CURRENCIES } from "./currencies-data";

/**
 * "You send" dropdown — same logic for both parent and corridor pages.
 * Filters the static Supported Currencies data down to isSourceCurrency
 * entries only, then puts whichever one matches the current page's origin
 * country first. The rest of the isSourceCurrency entries fill out the
 * remainder of the list.
 */
export function buildSendCurrencies(
  originCurrencyShortcode: string | undefined,
): Currency[] {
  const sourceCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) => c.isSourceCurrency,
  );

  if (!originCurrencyShortcode) return sourceCurrencies;

  const matchIndex = sourceCurrencies.findIndex(
    (c) => c.currencyShortcode === originCurrencyShortcode,
  );
  if (matchIndex <= 0) return sourceCurrencies;

  const matched = sourceCurrencies[matchIndex];
  const rest = sourceCurrencies.filter((_, i) => i !== matchIndex);
  return [matched, ...rest];
}

function countryToCurrency(country: CountryRef): Currency {
  return {
    name: country.currencyName || country.name,
    slug: country.slug,
    currencyShortcode: country.currencyShortcode ?? "",
    currencySymbol: country.currencySymbol,
    currencyFlag: country.countryFlag,
    isSourceCurrency: false,
  };
}

/**
 * "Recipient receives" dropdown for PARENT pages — built directly from the
 * related destination countries. Country name is the map key because several
 * countries can share a currency shortcode (for example, EUR), but each must
 * remain a distinct selectable destination. USD goes first if present, UNLESS
 * the origin country itself is USD, in which case EUR goes first instead.
 */
export function buildParentDestinationCurrencies(
  relatedDestinations: RelatedDestination[],
  originCurrencyShortcode: string | undefined,
): Currency[] {
  const seen = new Map<string, Currency>();

  console.log(relatedDestinations, "realateddd");

  for (const item of relatedDestinations) {
    const destination = item.destinationCountry;
    if (
      !destination?.name ||
      !destination.slug ||
      !destination.currencyName ||
      !destination.currencyShortcode
    ) {
      continue;
    }

    if (!seen.has(destination.name)) {
      seen.set(destination.name, countryToCurrency(destination));
    }
  }

  console.log(seen, "seeen")
  const list = Array.from(seen.values());
  //console.log(list);
  const priorityCode = originCurrencyShortcode === "USD" ? "EUR" : "USD";
  const priorityIndex = list.findIndex(
    (c) => c.currencyShortcode === priorityCode,
  );

  if (priorityIndex > 0) {
    const [priority] = list.splice(priorityIndex, 1);
    list.unshift(priority);
  }

  return list;
}

/**
 * "Recipient receives" dropdown for CORRIDOR pages — the current page's
 * own destination currency always goes first, then the other related
 * corridors' destination currencies fill in behind it (deduplicated,
 * since several corridors can share one currency — e.g. Eurozone
 * countries all resolving to EUR).
 */
export function buildCorridorDestinationCurrencies(
  currentDestinationCountry: CountryRef | undefined,
  relatedDestinations: RelatedDestination[],
): Currency[] {
  const seen = new Map<string, Currency>();

  function add(country: CountryRef | undefined) {
    if (!country?.currencyShortcode) return;
    if (!seen.has(country.currencyShortcode)) {
      seen.set(country.currencyShortcode, countryToCurrency(country));
    }
  }

  add(currentDestinationCountry);
  for (const item of relatedDestinations) {
    add(item.destinationCountry);
  }

  return Array.from(seen.values());
}
