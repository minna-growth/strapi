// src/components/SendMoneyHero.tsx
//
// Hand-authored replacement for the DevLink-generated SendHero, which
// cannot export the currency-picker Collection List (confirmed via the
// generated file's own `<NotSupported _atom={ Button } />`
// placeholder). Reuses the exact class names from the real Designer
// markup so it picks up the site's global CSS without any new styling.

import { Button } from "webflow/ds/Button";

import { ConvertWidget } from "./ConvertWidget";

import type { Currency } from "@/lib/strapi";
import { DEVLINK_SCOPE_CLASS } from "webflow/devlinkScope";

type LinkOptions = {
  href: string;
};

type SendMoneyHeroProps = {
  homeLink?: LinkOptions;
  homeLinkText?: React.ReactNode;
  breadcrumbThreeLink?: LinkOptions;
  breadcrumbThreeText?: React.ReactNode;
  breadcrumbOneLink?: LinkOptions;
  breadcrumbOneText?: React.ReactNode;
  breadcrumbTwo?: React.ReactNode;
  heroHeading?: React.ReactNode;
  heroSubheading?: React.ReactNode;
  originCountryShortcode?: React.ReactNode;
  destinationShortcode?: React.ReactNode;
  buttonPrimaryBtnText?: React.ReactNode;
  buttonLinkTo?: LinkOptions;
  buttonVariant?: "Primary" | "secondary" | "tertiary" | "stylized";
  bottomFlagImg?: string;
  chevronDown?: string;
  sendCurrencies: Currency[];
  receiveCurrencies: Currency[];
  isParent?: boolean;
};

const DEFAULT_CHEVRON =
  "https://cdn.prod.website-files.com/6360022338a81bd6fdbb1145/63754bf26e3ec367bc343968_drop-arrow.svg";
const DEFAULT_BOTTOM_FLAG =
  "https://cdn.prod.website-files.com/6360022338a81bd6fdbb1145/6a4e2a9d1bc1e3ae02b4d6df_prog-flags-hero.svg";

export function SendMoneyHero({
  homeLink = { href: "/" },
  homeLinkText = "HOME",
  breadcrumbThreeLink = { href: "/money-transfer" },
  breadcrumbThreeText = "MONEY TRANSFER",
  breadcrumbOneLink = { href: "#" },
  breadcrumbOneText,
  breadcrumbTwo,
  heroHeading,
  heroSubheading,
  originCountryShortcode,
  destinationShortcode,
  buttonPrimaryBtnText,
  buttonLinkTo = { href: "https://app.grey.co/auth/register" },
  buttonVariant = "Primary",
  bottomFlagImg = DEFAULT_BOTTOM_FLAG,
  chevronDown = DEFAULT_CHEVRON,
  sendCurrencies,
  receiveCurrencies,
  isParent,
}: SendMoneyHeroProps) {
  return (
    <div className={DEVLINK_SCOPE_CLASS} style={{ display: "contents" }}>
      <section className="prog-hero">
        <div className="prog-hero-container">
          <div className="prog-breadcrumb-wrapper">
            <a className="prog-breadcrumb" href={homeLink.href}>
              {homeLinkText}
            </a>
            <img className="image-210" src={chevronDown} alt="" />
            <a className="prog-breadcrumb" href={breadcrumbThreeLink.href}>
              {breadcrumbThreeText}
            </a>
            {!isParent && (
              <>
                <img className="image-210" src={chevronDown} alt="" />
                <a className="prog-breadcrumb" href={breadcrumbOneLink.href}>
                  {breadcrumbOneText}
                </a>
              </>
            )}
            <img className="image-210" src={chevronDown} alt="" />
            <div className="prog-breadcrumb">{breadcrumbTwo}</div>
          </div>

          <div className="prog-hero-content">
            <div className="prog-content_block">
              <div className={`prog-hero-copy ${isParent ? "parent" : ""}`}>
                <h1 className="new-hero-heading is-align-left">
                  {heroHeading}
                </h1>
                <div className="new-subheading is-align-left is-100 is-text-light">
                  {heroSubheading}
                </div>
                <div className="hidden-country">{originCountryShortcode}</div>
                <div className="hidden-country">{destinationShortcode}</div>
              </div>
              <Button
                label={buttonPrimaryBtnText}
                linkTo={buttonLinkTo}
                variant={buttonVariant}
              />
            </div>

            <div>
              <ConvertWidget
                sendCurrencies={sendCurrencies}
                receiveCurrencies={receiveCurrencies}
              />
            </div>
          </div>
        </div>

        <img
          className="prog-hero-image"
          src={bottomFlagImg}
          alt=""
          width={1462}
          height={284}
        />
      </section>
    </div>
  );
}
