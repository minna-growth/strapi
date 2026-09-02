import { isSet } from "./isSet";

export const isNotSet = (value: string | undefined): boolean => !isSet(value);
