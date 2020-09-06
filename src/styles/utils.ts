export function classes(classNames: { [key: string]: any }): string {
  return Object.entries(classNames)
    .filter(([, v]) => !!v)
    .map(([k]) => k)
    .join(' ');
}
