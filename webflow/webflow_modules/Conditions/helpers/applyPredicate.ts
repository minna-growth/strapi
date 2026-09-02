export function applyPredicate<T>(value: T) {
  return (predicate: (value: T) => boolean): boolean => predicate(value);
}
