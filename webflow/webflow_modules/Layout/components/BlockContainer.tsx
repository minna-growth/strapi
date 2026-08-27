"use client";
import * as React from "react";
import type { TagProps } from "../../types";

const BlockContainer = React.forwardRef<HTMLElement, TagProps>(
  function BlockContainer({ tag = "div", className = "", ...props }, ref) {
    return React.createElement(tag, {
      className: className + " w-layout-blockcontainer",
      ...props,
      ref,
    });
  }
);

export default BlockContainer;
