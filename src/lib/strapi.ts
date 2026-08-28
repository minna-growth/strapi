// src/lib/strapi.ts
//
// Matches the real "send-pages" content type. Each of the 13 content
// blocks maps to its own Webflow component, so blocks are exposed as
// named fields (block1..block13) rather than a generic looped array.
// Grid items, steps, and highlighted countries are likewise exposed as
// individually named props (grid1Heading, grid1Body, ...) rather than
// an array, so components can pull exactly the prop they need.

export type Faq = {
  id: number;
  question: string;
  answer: string;
  slug: string;
};

export type RelatedDestination = {
  slug: string;
  name: string;
  destinationCountry?: CountryRef;
};

export type CountryRef = {
  name: string;
  slug: string;
  countryFlag?: string;
  currencyName?: string;
  currencyShortcode?: string;
  currencySymbol?: string;
};

export type ParentPageRef = {
  name: string;
  slug: string;
};

// Simple heading/body(/bodyTwo) block — blocks 1, 3, 4, 6, 7, 13
export type SectionBlock = {
  heading?: string;
  body?: string;
  bodyTwo?: string;
};

// Heading/body + up to 5 individually named grid items — blocks 5, 8, 9, 10, 11, 12
// Not every block uses all 5; unused ones are simply undefined.
export type GridBlock = {
  heading?: string;
  body?: string;
  bodyTwo?: string;
  grid1Heading?: string;
  grid1Body?: string;
  grid2Heading?: string;
  grid2Body?: string;
  grid3Heading?: string;
  grid3Body?: string;
  grid4Heading?: string;
  grid4Body?: string;
  grid5Heading?: string;
  grid5Body?: string;
};

// Block 2 specifically: "Sign up / Fund / Send" steps, each with its own
// named body field in Strapi rather than a generic grid item body.
export type StepsBlock = {
  heading?: string;
  step1Heading?: string;
  step1Body?: string;
  step2Heading?: string;
  step2Body?: string;
  step3Heading?: string;
  step3Body?: string;
};

// Flat, individually named highlighted-country slots — currently seen up
// to 2 (highlightedCountry1 / highlightedCountry2 in Strapi). Each can be
// entirely different, so these are picked directly rather than looped.
export type HighlightedCountries = {
  country1Slug?: string;
  country1Heading?: string;
  country1Body?: string;
  country2Slug?: string;
  country2Heading?: string;
  country2Body?: string;
};

export type SendPage = {
  slug: string;
  name: string;
  metaTitle?: string;
  metaDescription?: string;
  schema?: string; // raw "<script type='application/ld+json'>...</script>" string
  heroHeading?: string;
  heroBody?: string;
  primaryCta?: string;
  isParentPage: boolean;
  isCorridorPage: boolean;
  faqSourceTag?: string;
  hreflang?: string;
  block1?: SectionBlock;
  block2?: StepsBlock;
  block3?: SectionBlock;
  block4?: SectionBlock;
  block5?: GridBlock;
  block6?: SectionBlock;
  block7?: SectionBlock;
  block8?: GridBlock;
  block9?: GridBlock;
  block10?: GridBlock;
  block11?: GridBlock;
  block12?: GridBlock;
  block13?: SectionBlock;
  highlightedCountries?: HighlightedCountries;
  originCountry?: CountryRef;
  destinationCountry?: CountryRef;
  parentPage?: ParentPageRef;
};

const STRAPI_API_URL = process.env.STRAPI_API_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

function mapSectionBlock(
  fields: Record<string, any>,
  n: number,
): SectionBlock | undefined {
  const heading = fields[`block${n}Heading`] || undefined;
  const body = fields[`block${n}Body`] || undefined;
  const bodyTwo = fields[`block${n}BodyTwo`] || undefined;

  if (!heading && !body && !bodyTwo) return undefined;
  return { heading, body, bodyTwo };
}

/**
 * Maps a grid block (5, 8, 9, 10, 11, 12) to individually named props.
 * `itemCount` controls how many grid slots actually exist in Strapi for
 * this block (e.g. 3 for block5, 5 for block11) — slots beyond that stay
 * undefined rather than being generated, since Strapi doesn't have them.
 */
function mapGridBlock(
  fields: Record<string, any>,
  n: number,
  itemCount: number,
): GridBlock | undefined {
  const heading = fields[`block${n}Heading`] || undefined;
  const body = fields[`block${n}Body`] || undefined;
  const bodyTwo = fields[`block${n}BodyTwo`] || undefined;

  const block: GridBlock = { heading, body, bodyTwo };
  let hasAny = Boolean(heading || body || bodyTwo);

  for (let j = 1; j <= itemCount; j++) {
    const gHeading = fields[`block${n}GridItem${j}Heading`] || undefined;
    const gBody = fields[`block${n}GridItem${j}Body`] || undefined;
    (block as any)[`grid${j}Heading`] = gHeading;
    (block as any)[`grid${j}Body`] = gBody;
    if (gHeading || gBody) hasAny = true;
  }

  return hasAny ? block : undefined;
}

function mapStepsBlock2(fields: Record<string, any>): StepsBlock | undefined {
  const heading = fields.block2Heading || undefined;
  const step1Heading = fields.block2GridItem1Heading || undefined;
  const step1Body = fields.block2SignUpBody || undefined;
  const step2Heading = fields.block2GridItem2Heading || undefined;
  const step2Body = fields.block2FundBody || undefined;
  const step3Heading = fields.block2GridItem3Heading || undefined;
  const step3Body = fields.block2SendBody || undefined;

  const hasAny = Boolean(
    heading ||
    step1Heading ||
    step1Body ||
    step2Heading ||
    step2Body ||
    step3Heading ||
    step3Body,
  );
  if (!hasAny) return undefined;

  return {
    heading,
    step1Heading,
    step1Body,
    step2Heading,
    step2Body,
    step3Heading,
    step3Body,
  };
}

/**
 * Strapi returns highlightedCountry1, highlightedCountry1Heading,
 * highlightedCountry1Body, highlightedCountry2, ... as flat top-level
 * fields (currently seen up to 2). Each slot is picked directly rather
 * than looped, since the two can be entirely unrelated.
 */
function mapHighlightedCountries(
  fields: Record<string, any>,
): HighlightedCountries | undefined {
  const country1Slug = fields.highlightedCountry1 || undefined;
  const country1Heading = fields.highlightedCountry1Heading || undefined;
  const country1Body = fields.highlightedCountry1Body || undefined;
  const country2Slug = fields.highlightedCountry2 || undefined;
  const country2Heading = fields.highlightedCountry2Heading || undefined;
  const country2Body = fields.highlightedCountry2Body || undefined;

  const hasAny = Boolean(
    country1Slug ||
    country1Heading ||
    country1Body ||
    country2Slug ||
    country2Heading ||
    country2Body,
  );
  if (!hasAny) return undefined;

  return {
    country1Slug,
    country1Heading,
    country1Body,
    country2Slug,
    country2Heading,
    country2Body,
  };
}

function mapCountry(raw: any): CountryRef | undefined {
  if (!raw) return undefined;
  const c = raw.attributes ?? raw; // handles both populated shapes
  if (!c?.name) return undefined;
  return {
    name: c.name,
    slug: c.slug,
    countryFlag: c.countryFlag,
    currencyName: c.currencyName,
    currencyShortcode: c.currencyShortcode,
    currencySymbol: c.currencySymbol,
  };
}

function mapParentPage(raw: any): ParentPageRef | undefined {
  if (!raw) return undefined;
  const p = raw.attributes ?? raw; // handles both populated shapes
  if (!p?.slug) return undefined;
  return {
    name: p.name,
    slug: p.slug,
  };
}

export async function getSendPage(slug: string): Promise<SendPage | null> {
  if (!STRAPI_API_URL || !STRAPI_API_TOKEN) {
    console.error("Missing STRAPI_API_URL or STRAPI_API_TOKEN.");
    return null;
  }

  const url = `${STRAPI_API_URL}/send-pages?filters[slug][$eq]=${encodeURIComponent(
    slug,
  )}&populate=*`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`Strapi responded with ${res.status} for slug "${slug}"`);
      return null;
    }

    const json: any = await res.json();
    const raw = json?.data?.[0];
    if (!raw) return null;

    const fields = raw.attributes ?? raw;

    return {
      slug: fields.slug,
      name: fields.name,
      metaTitle: fields.metaTitle,
      metaDescription: fields.metaDescription,
      schema: fields.schema,
      heroHeading: fields.heroHeading,
      heroBody: fields.heroBody,
      primaryCta: fields.primaryCta,
      isParentPage: Boolean(fields.isParentPage),
      isCorridorPage: Boolean(fields.isCorridorPage),
      faqSourceTag: fields.faqSourceTag || undefined,
      hreflang: fields.hreflang || undefined,
      block1: mapSectionBlock(fields, 1),
      block2: mapStepsBlock2(fields),
      block3: mapSectionBlock(fields, 3),
      block4: mapSectionBlock(fields, 4),
      block5: mapGridBlock(fields, 5, 3),
      block6: mapSectionBlock(fields, 6),
      block7: mapSectionBlock(fields, 7),
      block8: mapGridBlock(fields, 8, 3),
      block9: mapGridBlock(fields, 9, 3),
      block10: mapGridBlock(fields, 10, 4),
      block11: mapGridBlock(fields, 11, 5),
      block12: mapGridBlock(fields, 12, 4),
      block13: mapSectionBlock(fields, 13),
      highlightedCountries: mapHighlightedCountries(fields),
      originCountry: mapCountry(fields.originCountry),
      destinationCountry: mapCountry(fields.destinationCountry),
      parentPage: mapParentPage(fields.parentPage),
    };
  } catch (err) {
    console.error(`Failed to fetch send-page "${slug}":`, err);
    return null;
  }
}

export async function getAllSendPageSlugs(): Promise<string[]> {
  if (!STRAPI_API_URL || !STRAPI_API_TOKEN) return [];
  try {
    const res = await fetch(`${STRAPI_API_URL}/send-pages?fields[0]=slug`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json: any = await res.json();
    return (json?.data ?? []).map(
      (item: any) => item.attributes?.slug ?? item.slug,
    );
  } catch (err) {
    console.error("Failed to fetch send-page slugs:", err);
    return [];
  }
}

/**
 * Fetches other send-pages sharing the same originCountry as `currentSlug`,
 * for the "More destinations" section. Only called when the current page
 * has a destinationCountry set (i.e. it's a corridor page) — the section
 * doesn't apply to parent/origin-only pages.
 */
export async function getRelatedDestinations(
  originCountrySlug: string,
  currentSlug: string,
): Promise<RelatedDestination[]> {
  if (!STRAPI_API_URL || !STRAPI_API_TOKEN) return [];

  const url =
    `${STRAPI_API_URL}/send-pages` +
    `?filters[originCountry][slug][$eq]=${encodeURIComponent(originCountrySlug)}` +
    `&filters[slug][$ne]=${encodeURIComponent(currentSlug)}` +
    `&filters[destinationCountry][id][$notNull]=true` +
    `&populate[destinationCountry]=*`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];

    const json: any = await res.json();
    return (json?.data ?? []).map((raw: any) => {
      const fields = raw.attributes ?? raw;
      return {
        slug: fields.slug,
        name: fields.name,
        destinationCountry: mapCountry(fields.destinationCountry),
      };
    });
  } catch (err) {
    console.error(
      `Failed to fetch related destinations for "${originCountrySlug}":`,
      err,
    );
    return [];
  }
}

/**
 * FAQs aren't queried directly by tag — they're related FROM a Tag entry.
 * We look up the Tag matching the current page's faqSourceTag (case-insensitive),
 * then read its populated `faqs` relation to get the actual FAQ items.
 */
export async function getFaqsByTag(tagName: string): Promise<Faq[]> {
  if (!STRAPI_API_URL || !STRAPI_API_TOKEN || !tagName) return [];

  const url =
    `${STRAPI_API_URL}/tags` +
    `?filters[name][$eqi]=${encodeURIComponent(tagName)}` +
    `&populate=*`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(
        `getFaqsByTag: Strapi responded with ${res.status} for tag "${tagName}"`,
      );
      return [];
    }

    const json: any = await res.json();
    const tagEntry = json?.data?.[0];
    if (!tagEntry) return [];

    const tagFields = tagEntry.attributes ?? tagEntry;
    const rawFaqs = tagFields.faqs?.data ?? tagFields.faqs ?? [];

    return rawFaqs.map((raw: any) => {
      const fields = raw.attributes ?? raw;
      return {
        id: raw.id,
        question: fields.question,
        answer: fields.answer,
        slug: fields.slug,
      };
    });
  } catch (err) {
    console.error(`Failed to fetch FAQs for tag "${tagName}":`, err);
    return [];
  }
}

/**
 * Fetches related destinations for the PARENT page's related-countries
 * section (block9 there, vs block12 on corridor pages). Filters:
 *   - originCountry matches the current page's originCountry
 *   - destinationCountry is set (i.e. it's a real corridor entry)
 *   - destinationCountry is NOT highlightedCountry1 or highlightedCountry2
 *     of the current page (those get their own dedicated spot elsewhere)
 *   - the current page itself is excluded
 */
export async function getParentRelatedDestinations(
  originCountrySlug: string,
  currentSlug: string,
  excludeDestinationSlugs: (string | undefined)[],
): Promise<RelatedDestination[]> {
  if (!STRAPI_API_URL || !STRAPI_API_TOKEN) return [];

  const andClauses: string[] = [];
  let i = 0;

  andClauses.push(
    `filters[$and][${i++}][originCountry][slug][$eq]=${encodeURIComponent(originCountrySlug)}`,
  );
  andClauses.push(`filters[$and][${i++}][slug][$ne]=${encodeURIComponent(currentSlug)}`);
  andClauses.push(`filters[$and][${i++}][destinationCountry][id][$notNull]=true`);

  for (const slug of excludeDestinationSlugs) {
    if (slug) {
      andClauses.push(
        `filters[$and][${i++}][destinationCountry][slug][$ne]=${encodeURIComponent(slug)}`,
      );
    }
  }

  const url =
    `${STRAPI_API_URL}/send-pages?${andClauses.join("&")}` +
    `&populate[destinationCountry]=*`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error(
        `getParentRelatedDestinations: Strapi responded with ${res.status}`,
      );
      return [];
    }

    const json: any = await res.json();
    return (json?.data ?? []).map((raw: any) => {
      const fields = raw.attributes ?? raw;
      return {
        slug: fields.slug,
        name: fields.name,
        destinationCountry: mapCountry(fields.destinationCountry),
      };
    });
  } catch (err) {
    console.error(
      `Failed to fetch parent-related destinations for "${originCountrySlug}":`,
      err,
    );
    return [];
  }
}
