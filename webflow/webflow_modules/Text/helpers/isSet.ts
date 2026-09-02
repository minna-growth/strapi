// The WFDL plugin runtime guarantees text values are always strings, but in
// DevLink compiled components props can be undefined when not provided by the
// consumer. We guard against nullish values here to match the plugin's intent.
export const isSet = (value: string | undefined): boolean =>
  value != null && value !== "";
