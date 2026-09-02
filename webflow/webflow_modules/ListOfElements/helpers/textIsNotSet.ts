import type { ReactNode } from "react";

import { isNotSet } from "../../Text/helpers/isNotSet";
import { toText } from "./toText";

export const textIsNotSet = (value: ReactNode | undefined): boolean =>
  isNotSet(toText(value));
