// src/lib/strapi.ts
//
// Matches the real "send-pages" content type: hero fields, a numbered set
// of content blocks (block1..block13, each optionally with a heading, body,
// bodyTwo, and up to 5 grid items), a JSON-LD schema string, and related
// origin/destination country objects.

export type CountryRef = {
  name: string;
  slug: string;
  countryFlag?: string;
  currencyName?: string;
  currencyShortcode?: string;
  currencySymbol?: string;
};

export type BlockGridItem = {
  heading?: string;
  body?: string;
};

export type Block = {
  index: number;
  heading?: string;
  body?: string;
  bodyTwo?: string;
  gridItems: BlockGridItem[];
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
  blocks: Block[];
  originCountry?: CountryRef;
  destinationCountry?: CountryRef;
};

const STRAPI_API_URL = process.env.STRAPI_API_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Strapi returns block1Heading, block1Body, block1BodyTwo,
 * block1GridItem1Heading, block1GridItem1Body, block1GridItem2Heading, ...
 * as flat top-level fields. This walks block numbers 1-13 and grid items
 * 1-5, and only keeps blocks/grid items that actually have content, so the
 * page doesn't render a wall of empty <section> tags.
 */
function buildBlocks(fields: Record<string, any>): Block[] {
  const blocks: Block[] = [];

  for (let i = 1; i <= 13; i++) {
    const heading = fields[`block${i}Heading`];
    const body = fields[`block${i}Body`];
    const bodyTwo = fields[`block${i}BodyTwo`];

    const gridItems: BlockGridItem[] = [];
    for (let j = 1; j <= 5; j++) {
      const gHeading = fields[`block${i}GridItem${j}Heading`];
      const gBody = fields[`block${i}GridItem${j}Body`];
      if (gHeading || gBody) {
        gridItems.push({
          heading: gHeading || undefined,
          body: gBody || undefined,
        });
      }
    }

    const hasContent = heading || body || bodyTwo || gridItems.length > 0;
    if (hasContent) {
      blocks.push({
        index: i,
        heading: heading || undefined,
        body: body || undefined,
        bodyTwo: bodyTwo || undefined,
        gridItems,
      });
    }
  }

  return blocks;
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

    const json = await res.json();
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
      blocks: buildBlocks(fields),
      originCountry: mapCountry(fields.originCountry),
      destinationCountry: mapCountry(fields.destinationCountry),
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
    const json = await res.json();
    return (json?.data ?? []).map(
      (item: any) => item.attributes?.slug ?? item.slug,
    );
  } catch (err) {
    console.error("Failed to fetch send-page slugs:", err);
    return [];
  }
}
