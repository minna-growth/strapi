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
import { SendBlock1Parent } from "webflow/SendBlock1Parent";
import { SendBlock2 } from "webflow/SendBlock2";
import { SendBlock2Parent } from "webflow/SendBlock2Parent";
import { SendBlock3 } from "webflow/SendBlock3";
import { SendBlock4 } from "webflow/SendBlock4";
import { SendBlock5 } from "webflow/SendBlock5";
import { SendBlock7 } from "webflow/SendBlock7";
import { SendBlock8 } from "webflow/SendBlock8";
import { SendBlock9 } from "webflow/SendBlock9";
import { SendBlock9Parent } from "webflow/SendBlock9Parent";
import { SendBlock10 } from "webflow/SendBlock10";
import { SendBlock11 } from "webflow/SendBlock11";
import { SendBlock11Parent } from "webflow/SendBlock11Parent";
import { SendBlock13 } from "webflow/SendBlock13";
import { SendBlock12 } from "webflow/SendBlock12";
import { SendBlock12Parent } from "webflow/SendBlock12Parent";
import { SendBlock13Parent } from "webflow/SendBlock13Parent";
import { SendRelatedCountries } from "webflow/SendRelatedCountries";
import { SendFaq } from "webflow/SendFaq";
import { BbFaq } from "webflow/BbFaq";
import { Footer } from "webflow/Footer";

import type { Metadata } from "next";
import {
  getSendPage,
  getRelatedDestinations,
  getFaqsByTag,
  getParentRelatedDestinations,
} from "@/lib/strapi";

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

function RichText({ html }: { html?: string }) {
  if (!html) return null;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default async function SendPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const page = await getSendPage(slug);

  if (!page) {
    notFound();
  }

  const [relatedDestinations, faqs, parentRelatedDestinations] =
    await Promise.all([
      page.destinationCountry && page.originCountry
        ? getRelatedDestinations(page.originCountry.slug, page.slug)
        : Promise.resolve([]),
      page.faqSourceTag ? getFaqsByTag(page.faqSourceTag) : Promise.resolve([]),
      page.isParentPage && page.originCountry
        ? getParentRelatedDestinations(page.originCountry.slug, page.slug, [
            page.highlightedCountries?.country1Slug,
            page.highlightedCountries?.country2Slug,
          ])
        : Promise.resolve([]),
    ]);

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
      {/* PARENT PAGE */}
      {page.isParentPage && (
        <div className="visibility-container">
          <SendHero
            breadcrumbOneLink={
              page.parentPage
                ? {
                    href: `${process.env.NEXT_PUBLIC_SITE_URL}/send-money/${page.parentPage.slug}`,
                  }
                : undefined
            }
            breadcrumbOneText={page.originCountry?.name}
            breadcrumbTwo={page.name}
            heroHeading={page.heroHeading}
            heroSubheading={page.heroBody}
            buttonPrimaryBtnText={page.primaryCta}
            destinationCountryFlag={
              page.destinationCountry?.countryFlag
                ? { href: page.destinationCountry.countryFlag }
                : undefined
            }
            destinationShortcode={page.destinationCountry?.currencyShortcode}
            originCountryFlag={
              page.originCountry?.countryFlag
                ? { href: page.originCountry.countryFlag }
                : undefined
            }
            originCountryShortcode={page.originCountry?.currencyShortcode}
          />
          <SendReviewScore />
          <SendBlock1Parent
            block1Heading={page.block1?.heading}
            block1Body={<RichText html={page.block1?.body} />}
            originCountryCountryFlag={page.originCountry?.countryFlag}
          />

          <SendBlock2Parent
            showHeading={false}
            showBadge={true}
            block2GridItem1Heading={page.block2?.step1Heading}
            block2GridItem2Heading={page.block2?.step2Heading}
            block2GridItem3Heading={page.block2?.step3Heading}
            block2SignUpBody={page.block2?.step1Body}
            block2FundBody={page.block2?.step2Body}
            block2SendBody={page.block2?.step3Body}
          />

          <SendBlock5
            block5Heading={page.block5?.heading}
            block5Body={page.block5?.body}
            block5GridItem1Heading={page.block5?.grid1Heading}
            block5GridItem2Heading={page.block5?.grid2Heading}
            block5GridItem3Heading={page.block5?.grid3Heading}
            block5GridItem1Body={page.block5?.grid1Body}
            block5GridItem2Body={page.block5?.grid2Body}
            block5GridItem3Body={page.block5?.grid3Body}
          />

          <SendBlock3
            block3Heading={page.block3?.heading}
            block3BodyIi={<RichText html={page.block3?.bodyTwo} />}
          />

          {parentRelatedDestinations.length > 0 && (
            <SendBlock9Parent
              block9Heading={page.block9?.heading}
              block9Body={page.block9?.body}
              block9BodyIi={page.block9?.bodyTwo}
              highlightedCountry1Heading={
                page.highlightedCountries?.country1Heading
              }
              highlightedCountryIBody={page.highlightedCountries?.country1Body}
              highlightedCountryIiHeading={
                page.highlightedCountries?.country2Heading
              }
              highlightedCountryIiBody={page.highlightedCountries?.country2Body}
              block9GridItem1Body={page.block9?.grid1Body}
              block9GridItem2Body={page.block9?.grid2Body}
              moreDestinationsSlotParent={parentRelatedDestinations.map(
                (item) => (
                  <SendRelatedCountries
                  variant="Parent"
                    linkTextOne="From"
                    linkTextThree="To"
                    key={item.destinationCountry?.slug}
                    originCountryName={page.originCountry?.name}
                    destinationCountryName={item.destinationCountry?.name}
                    block12FlagImg={item.destinationCountry?.countryFlag}
                    currentPageLink={
                      item.destinationCountry?.slug
                        ? {
                            href: `${process.env.NEXT_PUBLIC_SITE_URL}/send-money/${item.destinationCountry.slug}`,
                          }
                        : undefined
                    }
                  />
                ),
              )}
            />
          )}

          <SendBlock11Parent
            block11Heading={page.block11?.heading}
            block11GridItem1Heading={page.block11?.grid1Heading}
            block11GridItem1Body={page.block11?.grid1Body}
            block11GridItem2Heading={page.block11?.grid2Heading}
            block11GridItem2Body={page.block11?.grid2Body}
            block11GridItem3Heading={page.block11?.grid3Heading}
            block11GridItem3Body={page.block11?.grid3Body}
            block11GridItem4Heading={page.block11?.grid4Heading}
            block11GridItem4Body={page.block11?.grid4Body}
          />
          <SendBlock12Parent
            block12Bodyy={<RichText html={page.block12?.body} />}
            block12Headingg={page.block12?.heading}
            block12GridItem1Bodyy={page.block12?.grid1Body}
            block12GridItem2Bodyy={page.block12?.grid2Body}
            block12GridItem3Bodyy={page.block12?.grid3Body}
            block12GridItem4Bodyy={page.block12?.grid4Body}
          />

          <SendBlock13Parent block13Heading={page.block13?.heading} />

          {faqs.length > 0 && (
            <SendFaq
              bbFaqSlot={faqs.map((faq) => (
                <BbFaq
                  key={faq.slug}
                  faqQuestion={faq.question}
                  faqAnswer={faq.answer}
                />
              ))}
            />
          )}
        </div>
      )}
      {/* CORRIDOR PAGE */}
      {page.isCorridorPage && (
        <div className="visibility-container">
          <SendHero
            breadcrumbOneLink={
              page.parentPage
                ? {
                    href: `${process.env.NEXT_PUBLIC_SITE_URL}/send-money/${page.parentPage.slug}`,
                  }
                : undefined
            }
            breadcrumbOneText={page.originCountry?.name}
            breadcrumbTwo={page.name}
            heroHeading={page.heroHeading}
            heroSubheading={page.heroBody}
            buttonPrimaryBtnText={page.primaryCta}
            destinationCountryFlag={
              page.destinationCountry?.countryFlag
                ? { href: page.destinationCountry.countryFlag }
                : undefined
            }
            destinationShortcode={page.destinationCountry?.currencyShortcode}
            originCountryFlag={
              page.originCountry?.countryFlag
                ? { href: page.originCountry.countryFlag }
                : undefined
            }
            originCountryShortcode={page.originCountry?.currencyShortcode}
          />
          <SendReviewScore />
          <SendBlock1
            block1Heading={page.block1?.heading}
            block1Body={<RichText html={page.block1?.body} />}
            originCountryCountryFlag={page.originCountry?.countryFlag}
            destinationCountryCountryFlag={page.destinationCountry?.countryFlag}
          />
          <SendBlock2
            block2Heading={page.block2?.heading}
            block2GridItem1Heading={page.block2?.step1Heading}
            block2GridItem2Heading={page.block2?.step2Heading}
            block2GridItem3Heading={page.block2?.step3Heading}
            block2SignUpBody={page.block2?.step1Body}
            block2FundBody={page.block2?.step2Body}
            block2SendBody={page.block2?.step3Body}
          />
          <SendBlock3
            block3Heading={page.block3?.heading}
            block3BodyIi={<RichText html={page.block3?.bodyTwo} />}
          />
          <SendBlock4
            block4Heading={page.block4?.heading}
            block4Body={<RichText html={page.block4?.body} />}
          />
          <SendBlock7
            block7Heading={page.block7?.heading}
            block7Body={<RichText html={page.block7?.body} />}
          />
          <SendBlock8
            block8Heading={page.block8?.heading}
            block8Body={page.block8?.body}
            block8GridItem1Heading={page.block8?.grid1Heading}
            block8GridItem2Heading={page.block8?.grid2Heading}
            block8GridItem3Heading={page.block8?.grid3Heading}
            block8GridItem1Body={page.block8?.grid1Body}
            block8GridItem2Body={page.block8?.grid2Body}
            block8GridItem3Body={page.block8?.grid3Body}
          />
          <SendBlock9
            visibility={true}
            block9Heading={page.block9?.heading}
            block9Body={page.block9?.body}
            block9BodyIi={page.block9?.bodyTwo}
            block9GridItem1Heading={page.block9?.grid1Heading}
            block9GridItem1Body={page.block9?.grid1Body}
            block9GridItem2Heading={page.block9?.grid2Heading}
            block9GridItem2Body={page.block9?.grid2Body}
            block9GridItem3Body={page.block9?.grid3Body}
            block9GridItem3Heading={page.block9?.grid3Heading}
          />
          <SendBlock10
            block10Heading={page.block10?.heading}
            block10Body={page.block10?.body}
            block10GridItem1Heading={page.block10?.grid1Heading}
            block10GridItem1Body={page.block10?.grid1Body}
            block10GridItem2Heading={page.block10?.grid2Heading}
            block10GridItem2Body={page.block10?.grid2Body}
            block10GridItem3Heading={page.block10?.grid3Heading}
            block10GridItem3Body={page.block10?.grid3Body}
            block10GridItem4Heading={page.block10?.grid4Heading}
            block10GridItem4Body={page.block10?.grid4Body}
            block10PrimaryCta={page.primaryCta}
          />
          <SendBlock11
            block11Heading={page.block11?.heading}
            block11GridItem1Heading={page.block11?.grid1Heading}
            block11GridItem1Body={page.block11?.grid1Body}
            block11GridItem2Heading={page.block11?.grid2Heading}
            block11GridItem2Body={page.block11?.grid2Body}
            block11GridItem3Heading={page.block11?.grid3Heading}
            block11GridItem3Body={page.block11?.grid3Body}
            block11GridItem4Heading={page.block11?.grid4Heading}
            block11GridItem4Body={page.block11?.grid4Body}
            block11GridItem5Heading={page.block11?.grid5Heading}
            block11GridItem5Body={page.block11?.grid5Body}
          />
          <SendBlock13
            block13Body={page.block13?.body}
            block13BodyIi={page.block13?.bodyTwo}
          />
          {relatedDestinations.length > 0 && (
            <SendBlock12
              block12Block12Heading={page.block12?.heading}
              relatedCountriesSlot={relatedDestinations.map((item) => (
                <SendRelatedCountries
                  key={item.destinationCountry?.slug}
                  destinationCountryName={item.destinationCountry?.name}
                  block12FlagImg={item.destinationCountry?.countryFlag}
                  currentPageLink={
                    item.destinationCountry?.slug
                      ? {
                          href: `${process.env.NEXT_PUBLIC_SITE_URL}/send-money/${item.destinationCountry.slug}`,
                        }
                      : undefined
                  }
                />
              ))}
            />
          )}
          {faqs.length > 0 && (
            <SendFaq
              bbFaqSlot={faqs.map((faq) => (
                <BbFaq
                  key={faq.slug}
                  faqQuestion={faq.question}
                  faqAnswer={faq.answer}
                />
              ))}
            />
          )}
        </div>
      )}

      <Footer />
    </main>
  );
}
