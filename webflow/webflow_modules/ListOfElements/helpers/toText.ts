import type { ReactNode } from "react";

export const toText = (value: ReactNode | undefined): string | undefined =>
  typeof value === "string" ? value : undefined;
