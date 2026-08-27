"use client";
import * as React from "react";
import { cj } from "../../utils";
import type { Props } from "../../types";

type TabsMenuProps = Props<
  "div",
  {
    tag?: React.ElementType;
  }
>;

export type { TabsMenuProps };

const TabsMenu = React.forwardRef<HTMLElement, TabsMenuProps>(function TabsMenu(
  { tag = "div", className = "", ...props },
  ref
) {
  return React.createElement(tag, {
    ...props,
    className: cj(className, "w-tab-menu"),
    role: "tablist",
    ref,
  });
});

export default TabsMenu;
