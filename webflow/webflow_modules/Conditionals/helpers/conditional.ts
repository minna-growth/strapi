type Rule<T> = { condition: boolean; output: T };

export function conditional<T>({
  rules,
  fallback,
}: {
  rules: Rule<T>[];
  fallback: T;
}): T {
  for (const rule of rules) {
    if (rule.condition) return rule.output;
  }
  return fallback;
}
