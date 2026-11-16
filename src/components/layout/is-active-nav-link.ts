function matchesPath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isActiveNavLink(
  pathname: string,
  href: string,
  alsoActiveOn: readonly string[] = [],
): boolean {
  return [href, ...alsoActiveOn].some((path) => matchesPath(pathname, path));
}
