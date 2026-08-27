"use client";
import * as React from "react";
import { useResizeObserver } from "../../utils";
import Container from "../../Layout/components/Container";
import { NavbarContext } from "../helpers/navbarContext";
import type { TagProps } from "../../types";

type NavbarContainerProps = TagProps & {
  toggleOpen?: () => void;
  isOpen?: boolean;
  children: React.ReactNode;
};

export type { NavbarContainerProps };

const NavbarContainer = React.forwardRef<HTMLElement, NavbarContainerProps>(
  function NavbarContainer({ children, ...props }, ref) {
    const innerRef = React.useRef<HTMLElement>(null);
    const { isOpen } = React.useContext(NavbarContext);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

    const updateLinkStyles = React.useCallback(
      (entry: ResizeObserverEntry) => {
        const { maxWidth: containerMaxWidth } = getComputedStyle(entry.target);

        document
          .querySelectorAll(".w-nav-menu>.w-dropdown,.w-nav-menu>.w-nav-link")
          .forEach((node) => {
            if (!(node instanceof HTMLElement)) return;

            if (!isOpen) {
              node.style.maxWidth = "";
              return;
            }

            const { maxWidth } = getComputedStyle(node);

            node.style.maxWidth =
              !maxWidth || maxWidth === "none" || maxWidth === containerMaxWidth
                ? containerMaxWidth
                : "";
          });
      },
      [isOpen]
    );

    useResizeObserver(innerRef, updateLinkStyles);

    return (
      <Container {...props} ref={innerRef}>
        {children}
      </Container>
    );
  }
);

export default NavbarContainer;
