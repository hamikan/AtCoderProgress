import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site-url';

const PUBLIC_PATHS = ['/dashboard', '/problems/contest', '/login'];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  return PUBLIC_PATHS.map((path) => ({ url: new URL(path, siteUrl).toString() }));
}
