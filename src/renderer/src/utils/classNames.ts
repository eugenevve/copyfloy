/**
 * Combines multiple styles into one line
 * @param mainCName main style of the component
 * @param rest additional styles (optional)
 */
export function classNames(main: string, ...rest: string[]) {
  return [main, ...rest].filter((x) => !!x).join(" ");
}
