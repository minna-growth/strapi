"use client";
import * as React from "react";
import { cj } from "../../utils";
import { tabsContext } from "../helpers/tabsContext";
import type { Props } from "../../types";

type TabsPaneProps = Props<
  "div",
  {
    tag?: React.ElementType;
    "data-w-tab": string;
  }
>;

export type { TabsPaneProps };

const TabsPane = React.forwardRef<HTMLElement, TabsPaneProps>(function TabsPane(
  { tag = "div", className = "", ...props },
  ref
) {
  const { current } = React.useContext(tabsContext);
  const isCurrent = current === props["data-w-tab"];

  return React.createElement(tag, {
    ...props,
    className: cj(className, "w-tab-pane", isCurrent && "w--tab-active"),
    role: "tabpanel",
    "aria-labelledby": props["data-w-tab"],
    ref,
  });
});

export default TabsPane;
