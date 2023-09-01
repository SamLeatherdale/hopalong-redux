export function classes(classNames: { [key: string]: unknown }): string {
  return Object.entries(classNames)
    .filter(([, v]) => !!v)
    .map(([k]) => k)
    .join(' ');
}
