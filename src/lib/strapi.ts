// src/lib/strapi.ts
//
// Matches the real "send-pages" content type. Each of the 13 content
// blocks maps to its own Webflow component, so blocks are exposed as
// named fields (block1..block13) rather than a generic looped array.
// Most blocks share one of two shapes (SectionBlock or GridBlock);
// block2 is a genuine one-off ("How it works" steps) with its own
// hand-named sub-fields in Strapi, so it gets its own type.

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

export type GridItem = {
  heading?: string;
  body?: string;
};

// Simple heading/body(/bodyTwo) block — blocks 1, 3, 4, 6, 7, 13
export type SectionBlock = {
  heading?: string;
  body?: string;
  bodyTwo?: string;
};

// Heading/body + a grid of items — blocks 5, 8, 9, 10, 11, 12
export type GridBlock = {
  heading?: string;
  body?: string;
  bodyTwo?: string;
  gridItems: GridItem[];
};

// Block 2 specifically: "Sign up / Fund / Send" steps, each with its own
// named body field in Strapi rather than a generic GridItem body.
export type StepsBlock = {
  heading?: string;
  steps: {
    heading?: string;
    body?: string;
  }[];
};

export type HighlightedCountry = {
  slug: string;
  heading?: string;
  body?: string;
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
  highlightedCountries: HighlightedCountry[];
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

function mapGridBlock(
  fields: Record<string, any>,
  n: number,
  itemCount: number,
): GridBlock | undefined {
  const heading = fields[`block${n}Heading`] || undefined;
  const body = fields[`block${n}Body`] || undefined;
  const bodyTwo = fields[`block${n}BodyTwo`] || undefined;

  const gridItems: GridItem[] = [];
  for (let j = 1; j <= itemCount; j++) {
    const gHeading = fields[`block${n}GridItem${j}Heading`] || undefined;
    const gBody = fields[`block${n}GridItem${j}Body`] || undefined;
    if (gHeading || gBody) {
      gridItems.push({ heading: gHeading, body: gBody });
    }
  }

  if (!heading && !body && !bodyTwo && gridItems.length === 0) return undefined;
  return { heading, body, bodyTwo, gridItems };
}

function mapStepsBlock2(fields: Record<string, any>): StepsBlock | undefined {
  const heading = fields.block2Heading || undefined;

  const steps = [
    { heading: fields.block2GridItem1Heading, body: fields.block2SignUpBody },
    { heading: fields.block2GridItem2Heading, body: fields.block2FundBody },
    { heading: fields.block2GridItem3Heading, body: fields.block2SendBody },
  ].filter((s) => s.heading || s.body);

  if (!heading && steps.length === 0) return undefined;
  return { heading, steps };
}

/**
 * Strapi returns highlightedCountry1, highlightedCountry1Heading,
 * highlightedCountry1Body, highlightedCountry2, ... as flat top-level
 * fields (currently seen up to 2). Only entries with an actual country
 * slug are kept.
 */
function buildHighlightedCountries(
  fields: Record<string, any>,
): HighlightedCountry[] {
  const countries: HighlightedCountry[] = [];

  for (let i = 1; i <= 2; i++) {
    const slug = fields[`highlightedCountry${i}`];
    if (slug) {
      countries.push({
        slug,
        heading: fields[`highlightedCountry${i}Heading`] || undefined,
        body: fields[`highlightedCountry${i}Body`] || undefined,
      });
    }
  }

  return countries;
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
      highlightedCountries: buildHighlightedCountries(fields),
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
