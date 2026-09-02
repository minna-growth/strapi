import type { ReactNode } from "react";

import { toText } from "./toText";

export const resolveText = (value: ReactNode | undefined): string =>
  toText(value) ?? "";
