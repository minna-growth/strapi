"use client";

import { useEffect, useRef, useState } from "react";
import type { Currency } from "@/lib/strapi";

type ConversionResponse = {
  destination_amount: number;
  swap_fee: number;
  source_amount: number;
  source_destination_rate: number;
  source_currency: string;
  destination_currency: string;
};

type ConvertWidgetProps = {
  sendCurrencies: Currency[];
  receiveCurrencies: Currency[];
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  EGP: "e£",
  EUR: "€",
  GBP: "£",
  GHS: "GH₵",
  KES: "KSh",
  NGN: "N",
  TZS: "TSh",
  UGX: "USh",
  USD: "$",
};

function getCurrencySymbol(code?: string) {
  return code ? CURRENCY_SYMBOLS[code.toUpperCase()] || code : "";
}

function formatNumberToMoney(
  number = 0,
  {
    countryCode = "NG",
    currencyCode = "NGN",
    minimumFractionDigits = 2,
    maximumFractionDigits = 4,
    formatDecimals = true,
    showSymbol = false,
  }: {
    countryCode?: string;
    currencyCode?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    formatDecimals?: boolean;
    showSymbol?: boolean;
  } = {},
) {
  const formatter = new Intl.NumberFormat(`en-${countryCode}`, {
    style: currencyCode ? "currency" : undefined,
    currency: currencyCode,
    minimumFractionDigits: formatDecimals ? minimumFractionDigits : undefined,
    maximumFractionDigits: formatDecimals ? maximumFractionDigits : 0,
  });
  return showSymbol
    ? formatter.format(number).replace(/[a-zA-Z]/gi, "")
    : formatter.format(number).replace(/[a-zA-Z$€£₦]/gi, "");
}

/**
 * Type guard confirming the parsed response actually has the numeric/string
 * fields we need before we trust it. A failed or malformed API response
 * (error body, unexpected shape) still parses as JSON successfully — this
 * is what stops that from rendering "undefined" strings into the UI.
 */
function isValidConversionResponse(data: unknown): data is ConversionResponse {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.destination_amount === "number" &&
    typeof d.swap_fee === "number" &&
    typeof d.source_amount === "number" &&
    typeof d.source_destination_rate === "number" &&
    typeof d.source_currency === "string" &&
    typeof d.destination_currency === "string"
  );
}

const EXCHANGE_BASE_URL = process.env.NEXT_PUBLIC_GREY_EXCHANGE_BASE_URL;

export function ConvertWidget({
  sendCurrencies,
  receiveCurrencies,
}: ConvertWidgetProps) {
  const [sourceCode, setSourceCode] = useState(
    sendCurrencies[0]?.currencyShortcode || "",
  );
  const [destinationCode, setDestinationCode] = useState(
    receiveCurrencies[0]?.currencyShortcode || "",
  );

  useEffect(() => {
    setSourceCode(sendCurrencies[0]?.currencyShortcode || "");
  }, [sendCurrencies]);

  useEffect(() => {
    setDestinationCode(receiveCurrencies[0]?.currencyShortcode || "");
  }, [receiveCurrencies]);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [sourceSearch, setSourceSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");

  const [hasResult, setHasResult] = useState(false);
  const [outputAmount, setOutputAmount] = useState("");
  const [conversionFee, setConversionFee] = useState("-");
  const [sendAmount, setSendAmount] = useState("-");
  const [todayRate, setTodayRate] = useState("-");

  const amountInputRef = useRef<HTMLInputElement>(null);
  const sourceWrapperRef = useRef<HTMLDivElement>(null);
  const destinationWrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const sourceCurrency = sendCurrencies.find(
    (c) => c.currencyShortcode === sourceCode,
  );
  const destinationCurrency = receiveCurrencies.find(
    (c) => c.currencyShortcode === destinationCode,
  );

  const filteredSource = sendCurrencies.filter(
    (c) =>
      c.currencyShortcode.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(sourceSearch.toLowerCase()),
  );
  const filteredDestination = receiveCurrencies.filter(
    (c) =>
      c.currencyShortcode
        .toLowerCase()
        .includes(destinationSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(destinationSearch.toLowerCase()),
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        sourceWrapperRef.current &&
        !sourceWrapperRef.current.contains(e.target as Node)
      ) {
        setSourceOpen(false);
      }
      if (
        destinationWrapperRef.current &&
        !destinationWrapperRef.current.contains(e.target as Node)
      ) {
        setDestinationOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function scheduleFetch() {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(fetchConversion, 300);
  }

  function resetResult() {
    setHasResult(false);
    setOutputAmount("");
    setConversionFee("-");
    setSendAmount("-");
    setTodayRate("-");
  }

  function handleAmountInput(e: React.FormEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const value = input.value;
    if (!value) {
      resetResult();
      return;
    }

    const selectionStart = input.selectionStart ?? value.length;
    const digits = value.replace(/\D/g, "");
    const formatted = digits ? Number(digits).toLocaleString("en-US") : "";

    input.value = formatted;
    const newCursor = selectionStart + (formatted.length - value.length);
    input.setSelectionRange(newCursor, newCursor);

    scheduleFetch();
  }

  async function fetchConversion() {
    const amount = amountInputRef.current?.value ?? "";
    if (amount.trim() === "") {
      resetResult();
      return;
    }

    if (!EXCHANGE_BASE_URL) {
      console.error(
        "ConvertWidget: NEXT_PUBLIC_GREY_EXCHANGE_BASE_URL is not set.",
      );
      resetResult();
      return;
    }

    try {
      const res = await fetch(
        `${EXCHANGE_BASE_URL}/v2/transaction/fee/landing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_amount: Number(amount.replace(/,/g, "").trim()),
            destination_currency: destinationCode,
            source_currency: sourceCode,
            transaction_type: "swap",
          }),
        },
      );

      if (!res.ok) {
        console.error(
          `ConvertWidget: exchange API responded with ${res.status}`,
        );
        resetResult();
        return;
      }

      const data: unknown = await res.json();

      if (!isValidConversionResponse(data)) {
        console.error(
          "ConvertWidget: unexpected response shape from exchange API",
          data,
        );
        resetResult();
        return;
      }

      setOutputAmount(formatNumberToMoney(data.destination_amount));
      setConversionFee(`-${getCurrencySymbol(sourceCode)}${data.swap_fee}`);
      setSendAmount(
        `= ${getCurrencySymbol(sourceCode)}${formatNumberToMoney(data.source_amount - data.swap_fee)}`,
      );
      setTodayRate(
        `1 ${data.source_currency} → ${formatNumberToMoney(data.source_destination_rate)} ${data.destination_currency}`,
      );
      setHasResult(true);
    } catch (err) {
      console.error("ConvertWidget: error fetching conversion:", err);
      resetResult();
    }
  }

  function handleSwap() {
    const newSource = sendCurrencies.find(
      (c) => c.currencyShortcode === destinationCode,
    )
      ? destinationCode
      : sourceCode;
    const newDestination = receiveCurrencies.find(
      (c) => c.currencyShortcode === sourceCode,
    )
      ? sourceCode
      : destinationCode;
    setSourceCode(newSource);
    setDestinationCode(newDestination);
    scheduleFetch();
  }

  function selectSource(code: string) {
    setSourceCode(code);
    setSourceOpen(false);
    setSourceSearch("");
    scheduleFetch();
  }

  function selectDestination(code: string) {
    setDestinationCode(code);
    setDestinationOpen(false);
    setDestinationSearch("");
    scheduleFetch();
  }

  return (
    <div className="convert-widget">
      <div className="atswrapper">
        <div className="outputamount center">
          <div className="div-block-263">
            <label htmlFor="amount" className="atscopy">
              YOU SEND
            </label>
            <input
              ref={amountInputRef}
              id="amount"
              className="outputamount custom drop_amount head amount"
              type="text"
              inputMode="numeric"
              placeholder="Enter amount"
              onInput={handleAmountInput}
              style={{ outline: "none", boxShadow: "none" }}
            />
          </div>

          <div className="currency_drop first" ref={sourceWrapperRef}>
            <div
              className="source"
              onClick={() => setSourceOpen((v) => !v)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {sourceCurrency?.currencyFlag && (
                <img
                  id="source_currency_img"
                  className="source_currency_img"
                  src={sourceCurrency.currencyFlag}
                  alt="flag"
                  width={18}
                  height={18}
                />
              )}
              <select
                id="source_currency"
                name="source_currency"
                className="dropdown_s source_c"
                value={sourceCode}
                onChange={() => {}}
                style={{ pointerEvents: "none" }}
              >
                {sendCurrencies.map((c) => (
                  <option key={c.currencyShortcode} value={c.currencyShortcode}>
                    {c.currencyShortcode}
                  </option>
                ))}
              </select>
            </div>

            {sourceOpen && (
              <div
                className="list_container"
                style={{ opacity: 1, display: "block", transform: "none" }}
              >
                <div className="search_container">
                  <input
                    id="field"
                    className="text-field-3"
                    type="text"
                    placeholder="Search..."
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    autoFocus
                    style={{ outline: "none", boxShadow: "none" }}
                  />
                </div>
                <div className="list_group">
                  <div className="list_group_block" data-target="source">
                    <div className="collection-list-15">
                      {filteredSource.map((c) => (
                        <div
                          key={c.currencyShortcode}
                          className="currency_item"
                          data-target="source"
                          data-currency={c.currencyShortcode}
                          onClick={() => selectSource(c.currencyShortcode)}
                        >
                          {c.currencyFlag && (
                            <img
                              className="image-193"
                              src={c.currencyFlag}
                              alt=""
                            />
                          )}
                          <div className="text-block-117">
                            {c.currencyShortcode}
                          </div>
                          <div className="currency-name">{c.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <img
        src="https://cdn.prod.website-files.com/6360022338a81bd6fdbb1145/672350abb2285df709050b61_swapIcon.svg"
        alt="swapIcon"
        className="widget-swap_icon"
        onClick={handleSwap}
        style={{ cursor: "pointer" }}
      />

      <div className="atswrapper">
        <div className="outputamount center">
          <div className="div-block-263">
            <label htmlFor="outputAmount" className="atscopy">
              RECIPIENT RECEIVES
            </label>
            <input
              id="outputAmount"
              className="outputamount custom readonly head output_a"
              type="text"
              placeholder="0.00"
              value={outputAmount}
              readOnly
              style={{ outline: "none", boxShadow: "none" }}
            />
          </div>

          <div className="currency_drop" ref={destinationWrapperRef}>
            <div
              className="destination"
              onClick={() => setDestinationOpen((v) => !v)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {destinationCurrency?.currencyFlag && (
                <img
                  id="destination_currency_img"
                  className="destination_currency_img"
                  src={destinationCurrency.currencyFlag}
                  alt="flag"
                  width={18}
                  height={18}
                />
              )}
              <select
                id="destination_currency"
                name="destination_currency"
                className="dropdown_s destination_c"
                value={destinationCode}
                onChange={() => {}}
                style={{ pointerEvents: "none" }}
              >
                {receiveCurrencies.map((c) => (
                  <option key={c.currencyShortcode} value={c.currencyShortcode}>
                    {c.currencyShortcode}
                  </option>
                ))}
              </select>
            </div>

            {destinationOpen && (
              <div
                className="list_container _2"
                style={{ opacity: 1, display: "block", transform: "none" }}
              >
                <div className="search_container">
                  <input
                    id="field"
                    className="text-field-3"
                    type="text"
                    placeholder="Search..."
                    value={destinationSearch}
                    onChange={(e) => setDestinationSearch(e.target.value)}
                    autoFocus
                    style={{ outline: "none", boxShadow: "none" }}
                  />
                </div>
                <div className="list_group">
                  <div className="list_group_block" data-target="destination">
                    <div className="collection-list-15">
                      {filteredDestination.map((c) => (
                        <div
                          key={c.currencyShortcode}
                          className="currency_item"
                          data-target="destination"
                          data-currency={c.currencyShortcode}
                          onClick={() => selectDestination(c.currencyShortcode)}
                        >
                          {c.currencyFlag && (
                            <img
                              className="image-193"
                              src={c.currencyFlag}
                              alt=""
                            />
                          )}
                          <div className="text-block-117">
                            {c.currencyShortcode}
                          </div>
                          <div className="currency-name">{c.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="feeblock-2">
        <div className="feewrapper">
          <div className="widget-label">TODAY'S RATE</div>
          <div id="todayRate" className="feeamount2 rate">
            {todayRate}
          </div>
        </div>
        {/* Fee and send-amount rows temporarily hidden per request — keep
            for future re-enable, just uncomment when needed.
        <div className={hasResult ? "feewrapper" : "feewrapper hide"}>
          <div className="feecopy">Send fee</div>
          <div className="feeamount2">{conversionFee}</div>
        </div>
        <div className={hasResult ? "feewrapper" : "feewrapper hide"}>
          <div className="feecopy highlighted">Amount we'll send</div>
          <div className="feeamount2 highlighted">{sendAmount}</div>
        </div>
        */}
      </div>

      <button
        type="button"
        id="getDataBtn"
        className="widget-button"
        onClick={fetchConversion}
      >
        Send money
      </button>
    </div>
  );
}
