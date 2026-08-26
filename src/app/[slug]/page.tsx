// src/app/[slug]/page.tsx
//
// Renders a send-pages item: hero section, then each populated block in
// order (heading, body, optional bodyTwo, optional grid items), plus the
// JSON-LD schema and per-page SEO metadata.

import { notFound } from "next/navigation";
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

      <header className="send-page-hero">
        {page.heroHeading && <h1>{page.heroHeading}</h1>}
        {page.heroBody && <p>{page.heroBody}</p>}
        {page.primaryCta && (
          <a className="primary-cta" href="https://app.grey.co/">
            {page.primaryCta}
          </a>
        )}
      </header>

      {page.blocks.map((block) => (
        <section key={block.index} className="send-page-block">
          {block.heading && <h2>{block.heading}</h2>}

          {/* Body fields sometimes contain HTML (e.g. "<p id=''>...</p>")
              and sometimes plain text — dangerouslySetInnerHTML handles
              both correctly since plain text has no tags to interpret. */}
          {block.body && (
            <div dangerouslySetInnerHTML={{ __html: block.body }} />
          )}
          {block.bodyTwo && (
            <div dangerouslySetInnerHTML={{ __html: block.bodyTwo }} />
          )}

          {block.gridItems.length > 0 && (
            <div className="send-page-grid">
              {block.gridItems.map((item, idx) => (
                <div className="send-page-grid-item" key={idx}>
                  {item.heading && <h3>{item.heading}</h3>}
                  {item.body && <p>{item.body}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </main>
  );
}
