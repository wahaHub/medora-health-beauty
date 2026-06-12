import { getP1StaticPublicRoutes } from '../seo/routes.js';
import { loadPublicSeoFallbackData } from './publicSeoFallbacks.js';
import { loadPublicSeoSupabaseData } from './publicSeoSupabase.js';

const defaultLogger = {
  warn: (message) => console.warn(message),
};

const uniqueRoutes = (routes) => Array.from(new Set(routes.filter(Boolean)));

const reportWarnings = (warnings, logger) => {
  warnings.forEach((warning) => {
    logger.warn(`[public-seo] ${warning}`);
  });
};

/**
 * @typedef {Object} SeoProcedure
 * @property {string} label
 * @property {string} slug
 * @property {string} area
 * @property {string=} category
 * @property {string} guideUrl
 * @property {string} videoUrl
 * @property {string} title
 * @property {string} description
 * @property {string=} overview
 * @property {string[]} benefits
 * @property {string[]} candidacy
 * @property {string[]} risks
 * @property {string=} recovery
 * @property {string=} imageUrl
 */

export async function loadPublicSeoData(config = {}) {
  const logger = config.logger || defaultLogger;
  const [fallbackData, supabaseData] = await Promise.all([
    loadPublicSeoFallbackData(),
    loadPublicSeoSupabaseData({ env: config.env }),
  ]);

  const surgeons = supabaseData.surgeons.length > 0 ? supabaseData.surgeons : fallbackData.surgeons;
  const hospitals = supabaseData.hospitals;
  const routeExtras = uniqueRoutes([
    ...surgeons.map((surgeon) => surgeon.route),
    ...hospitals.flatMap((hospital) => [hospital.route, hospital.galleryRoute]),
  ]);
  const warnings = [...fallbackData.warnings, ...supabaseData.warnings];

  reportWarnings(warnings, logger);

  return {
    staticPages: getP1StaticPublicRoutes(),
    procedures: fallbackData.procedures,
    surgeons,
    hospitals,
    routeExtras,
    warnings,
  };
}
