import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { events } from '@/data/events';

const BASE_URL = 'https://www.elwahapumps.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  const staticRoutes = [
    '',
    '/about',
    '/agents',
    '/careers',
    '/catalogues',
    '/contact',
    '/events',
    '/locations',
    '/products',
    '/selector',
    '/services',
    '/support',
  ];

  const agentSlugs = ['astral-pipes', 'jee-pumps', 'pmc', 'kurlar', 'alka'];
  const serviceSlugs = [
    'pump-supply',
    'panel-design',
    'marine-cable-supply',
    'well-pipe-supply',
    'spare-parts-supply',
    'pump-maintenance',
    'motor-maintenance',
    'panel-maintenance',
  ];

  const allRoutes = [
    ...staticRoutes,
    ...agentSlugs.map((slug) => `/agents/${slug}`),
    ...serviceSlugs.map((slug) => `/services/${slug}`),
    ...events.map((event) => `/events/${event.id}`),
    ...categories.map((cat) => `/products/category/${cat.slug}`),
  ];

  const sitemapRoutes: MetadataRoute.Sitemap = allRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
    alternates: {
      languages: {
        en: `${BASE_URL}/en${route}`,
        ar: `${BASE_URL}/ar${route}`,
      },
    },
  }));

  const sitemapProducts: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
    alternates: {
      languages: {
        en: `${BASE_URL}/en/products/${product.slug}`,
        ar: `${BASE_URL}/ar/products/${product.slug}`,
      },
    },
  }));

  return [...sitemapRoutes, ...sitemapProducts];
}
