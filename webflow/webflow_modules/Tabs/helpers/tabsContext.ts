"use client";
import * as React from "react";

export const tabsContext = React.createContext<{
  current: string;
  onTabClick: (next: string) => void;
  onLinkKeyDown: React.KeyboardEventHandler<HTMLAnchorElement>;
}>({
  current: "",
  onTabClick: () => undefined,
  onLinkKeyDown: () => undefined,
});
