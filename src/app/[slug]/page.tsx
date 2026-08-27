// src/app/[slug]/page.tsx
//
// Renders a send-pages item: hero section, then each populated block in
// order (heading, body, optional bodyTwo, optional grid items), plus the
// JSON-LD schema and per-page SEO metadata.

import { notFound } from "next/navigation";
import { UpdatedNavbar } from "webflow/navbar/UpdatedNavbar";
import { SendHero } from "webflow/SendHero";
import { SendReviewScore } from "webflow/SendReviewScore";
import { SendBlock1 } from "webflow/SendBlock1";
import { Footer } from "webflow/Footer";

import type { Metadata } from "next";
import { getSendPage } from "@/lib/strapi";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getSendPage(slug);

  if (!page) {
    return { title: "Page not found" };
  }

  return {
    title: page.metaTitle || page.name,
    description: page.metaDescription,
  };
}

export default async function SendPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const page = await getSendPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="send-page">
      {/* JSON-LD structured data. `schema` already contains a full
          <script type="application/ld+json">...</script> string from Strapi,
          so we render it as-is. This is inert (won't execute), which is
          fine — search engines read it straight from the rendered HTML. */}
      {page.schema && (
        <div
          aria-hidden="true"
          style={{ display: "none" }}
          dangerouslySetInnerHTML={{ __html: page.schema }}
        />
      )}
      <UpdatedNavbar
        variant="Light"
        localeDropdownNewShowLocaleSwitcher={false}
      />
      <div className="visibility-container">
        <SendHero
          breadcrumbOneLink={
            page.parentPage
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/send-money/${page.parentPage.slug}`
              : undefined
          }
          breadcrumbOneText={page.parentPage?.name}
          breadcrumbTwo={page.name}
          heroHeading={page.heroHeading}
          heroSubheading={page.heroBody}
          buttonPrimaryBtnText={page.primaryCta}
          destinationCountryFlag={page.destinationCountry?.countryFlag}
          destinationShortcode={page.destinationCountry?.currencyShortcode}
          originCountryFlag={page.originCountry?.countryFlag}
          originCountryShortcode={page.originCountry?.currencyShortcode}
        />
        <SendReviewScore />
      <SendBlock1 block1Heading />
      </div>
      <Footer />
    </main>
  );
}
