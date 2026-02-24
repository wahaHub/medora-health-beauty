/**
 * Hospital Utility Functions
 * Includes smart highlights generation from CRM metadata
 *
 * IMPORTANT: All mapping tables must match CRM definitions in:
 * medical-crm/app/hospital/materials/page.tsx
 */

import type { CRMMetadata } from '../hooks/useData';

// ============================================================================
// CRM Option Mapping Tables (must match CRM definitions)
// ============================================================================

/**
 * Language options - matches LANGUAGE_OPTIONS in CRM
 */
export const LANGUAGE_MAP: Record<string, { en: string; zh: string; native: string }> = {
  'en': { en: 'English', zh: '英语', native: 'English' },
  'zh': { en: 'Chinese', zh: '中文', native: '中文' },
  'kr': { en: 'Korean', zh: '韩语', native: '한국어' },
  'jp': { en: 'Japanese', zh: '日语', native: '日本語' },
  'ar': { en: 'Arabic', zh: '阿拉伯语', native: 'العربية' },
  'th': { en: 'Thai', zh: '泰语', native: 'ไทย' },
  'es': { en: 'Spanish', zh: '西班牙语', native: 'Español' },
  'ru': { en: 'Russian', zh: '俄语', native: 'Русский' },
  'fr': { en: 'French', zh: '法语', native: 'Français' },
  'de': { en: 'German', zh: '德语', native: 'Deutsch' },
};

/**
 * Airport service options - matches AIRPORT_SERVICE_OPTIONS in CRM
 */
export const AIRPORT_SERVICE_MAP: Record<string, { en: string; zh: string }> = {
  'complimentary_transfer': { en: 'Complimentary Airport Transfer', zh: '免费机场接送' },
  'paid_transfer': { en: 'Paid Airport Pickup', zh: '付费机场接送' },
  'airport_assistance': { en: 'Airport Assistance', zh: '机场协助服务' },
  'visa_on_arrival': { en: 'Visa on Arrival Assistance', zh: '落地签协助' },
};

/**
 * Follow-up care options - matches FOLLOWUP_OPTIONS in CRM
 */
export const FOLLOWUP_MAP: Record<string, { en: string; zh: string }> = {
  'lifetime': { en: 'Lifetime Follow-up Care', zh: '终身随访' },
  '1_year': { en: '1 Year Follow-up', zh: '1年随访' },
  '6_months': { en: '6 Months Follow-up', zh: '6个月随访' },
  'telemedicine': { en: 'Remote Telemedicine', zh: '远程医疗' },
  'local_partner': { en: 'Local Partner Clinic Referral', zh: '当地合作诊所转介' },
};

/**
 * Amenity options - matches AMENITY_OPTIONS in CRM
 */
export const AMENITY_MAP: Record<string, { en: string; zh: string; icon: string }> = {
  'private_suite': { en: 'Private Recovery Suites', zh: '私人康复套房', icon: 'bed' },
  'wifi': { en: 'Free Wi-Fi', zh: '免费WiFi', icon: 'wifi' },
  'concierge': { en: 'Medical Tourism Concierge', zh: '医疗旅游管家', icon: 'user' },
  'insurance_coord': { en: 'International Insurance Coordination', zh: '国际保险协调', icon: 'shield' },
  'visa_assistance': { en: 'Visa Assistance', zh: '签证协助', icon: 'plane' },
  'interpreter': { en: 'Interpreter Services', zh: '翻译服务', icon: 'globe' },
  'halal_food': { en: 'Halal Food Available', zh: '清真餐食', icon: 'coffee' },
  'vegetarian': { en: 'Vegetarian Options', zh: '素食选项', icon: 'coffee' },
  'family_accommodation': { en: 'Family Accommodation', zh: '家属住宿', icon: 'building' },
  'pharmacy': { en: '24/7 Pharmacy', zh: '24小时药房', icon: 'pill' },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get display label for a language code
 */
export function getLanguageLabel(code: string, language: 'en' | 'zh' = 'en', useNative: boolean = true): string {
  const lang = LANGUAGE_MAP[code];
  if (!lang) return code;
  if (useNative && language === 'en') return lang.native;
  return language === 'zh' ? lang.zh : lang.en;
}

/**
 * Get display label for an airport service code
 */
export function getAirportServiceLabel(code: string, language: 'en' | 'zh' = 'en'): string {
  const service = AIRPORT_SERVICE_MAP[code];
  if (!service) return code;
  return language === 'zh' ? service.zh : service.en;
}

/**
 * Get display label for a follow-up care code
 */
export function getFollowupLabel(code: string, language: 'en' | 'zh' = 'en'): string {
  const option = FOLLOWUP_MAP[code];
  if (!option) return code;
  return language === 'zh' ? option.zh : option.en;
}

/**
 * Get display label for an amenity code
 */
export function getAmenityLabel(code: string, language: 'en' | 'zh' = 'en'): string {
  const amenity = AMENITY_MAP[code];
  if (!amenity) return code;
  return language === 'zh' ? amenity.zh : amenity.en;
}

// ============================================================================
// Highlight Generation
// ============================================================================

interface Highlight {
  icon: string;
  text: string;
}

/**
 * Generate smart highlights from CRM metadata
 * This algorithm intelligently picks the most relevant highlights
 * based on what data is available in the hospital's metadata
 */
export function generateSmartHighlights(
  crmMetadata: CRMMetadata | null,
  existingHighlights: Highlight[] = [],
  options: {
    maxItems?: number;
    language?: 'en' | 'zh';
  } = {}
): Highlight[] {
  const { maxItems = 8, language = 'en' } = options;
  const highlights: Highlight[] = [];

  if (!crmMetadata) {
    return existingHighlights.slice(0, maxItems);
  }

  // 1. Certifications (highest priority - these are trust signals)
  if (crmMetadata.certifications && crmMetadata.certifications.length > 0) {
    const activeCerts = crmMetadata.certifications.filter(c => c.isActive);
    // Add top 2 certifications
    activeCerts.slice(0, 2).forEach(cert => {
      const yearText = cert.year ? ` since ${cert.year}` : '';
      highlights.push({
        icon: cert.name.toLowerCase().includes('jci') ? 'award' : 'shield',
        text: `${cert.nameEn || cert.name}${yearText}`,
      });
    });
  }

  // 2. Hospital Capacity (shows scale/capacity)
  if (crmMetadata.bedCount && crmMetadata.bedCount > 0) {
    highlights.push({
      icon: 'bed',
      text: language === 'zh'
        ? `${crmMetadata.bedCount} 张床位`
        : `${crmMetadata.bedCount} Private Beds`,
    });
  }

  if (crmMetadata.patientCapacity && crmMetadata.patientCapacity > 0) {
    highlights.push({
      icon: 'users',
      text: language === 'zh'
        ? `每年服务 ${crmMetadata.patientCapacity.toLocaleString()}+ 患者`
        : `${crmMetadata.patientCapacity.toLocaleString()}+ Patients Annually`,
    });
  }

  // 3. Multilingual Staff (important for international patients)
  if (crmMetadata.multilingualStaff && crmMetadata.multilingualStaff.length > 0) {
    const langCount = crmMetadata.multilingualStaff.length;
    highlights.push({
      icon: 'globe',
      text: language === 'zh'
        ? `${langCount} 种语言服务`
        : `${langCount} Languages Available`,
    });
  }

  // 4. Airport Services (convenience for medical tourists)
  if (crmMetadata.airportServices && crmMetadata.airportServices.length > 0) {
    // Show first service as highlight
    const firstService = crmMetadata.airportServices[0];
    highlights.push({
      icon: 'plane',
      text: getAirportServiceLabel(firstService, language),
    });
  }

  // 5. Follow-up Care (shows commitment to patient care)
  if (crmMetadata.followUpCare && crmMetadata.followUpCare.length > 0) {
    // Show first follow-up option as highlight
    const firstOption = crmMetadata.followUpCare[0];
    highlights.push({
      icon: 'heart',
      text: getFollowupLabel(firstOption, language),
    });
  }

  // 6. Amenities (comfort features)
  if (crmMetadata.amenities && crmMetadata.amenities.length > 0) {
    // Pick first 2 amenities with their full labels
    crmMetadata.amenities.slice(0, 2).forEach(code => {
      const amenity = AMENITY_MAP[code];
      highlights.push({
        icon: amenity?.icon || 'check',
        text: getAmenityLabel(code, language),
      });
    });
  }

  // Merge with existing highlights (remove duplicates)
  const existingTexts = new Set(highlights.map(h => h.text.toLowerCase()));
  const uniqueExisting = existingHighlights.filter(
    h => !existingTexts.has(h.text.toLowerCase())
  );

  // Combine and limit
  return [...highlights, ...uniqueExisting].slice(0, maxItems);
}

// ============================================================================
// Certification Badge
// ============================================================================

/**
 * Get certification badge info for display
 */
export function getCertificationBadgeInfo(certName: string): {
  icon: string;
  color: string;
  shortName: string;
} {
  const name = certName.toLowerCase();

  if (name.includes('jci')) {
    return { icon: 'award', color: 'gold', shortName: 'JCI' };
  }
  if (name.includes('iso')) {
    const isoNum = certName.match(/iso\s*(\d+)/i)?.[1] || '';
    return { icon: 'shield', color: 'blue', shortName: `ISO ${isoNum}` };
  }
  if (name.includes('aaahc')) {
    return { icon: 'check-circle', color: 'green', shortName: 'AAAHC' };
  }
  if (name.includes('thai')) {
    return { icon: 'star', color: 'purple', shortName: 'HA Thai' };
  }

  return { icon: 'award', color: 'gray', shortName: certName.slice(0, 10) };
}

// ============================================================================
// Facility Features
// ============================================================================

export interface FacilityFeature {
  icon: string;
  title: string;
  description: string;
  available: boolean;
}

/**
 * Format facility features for display
 * Reads actual data from CRM metadata and displays it correctly
 */
export function getFacilityFeatures(
  crmMetadata: CRMMetadata | null,
  language: 'en' | 'zh' = 'en'
): FacilityFeature[] {
  if (!crmMetadata) return [];

  const features: FacilityFeature[] = [];

  // 1. Bed Count
  if (crmMetadata.bedCount !== undefined) {
    features.push({
      icon: 'bed',
      title: language === 'zh' ? '床位数' : 'Private Beds',
      description: `${crmMetadata.bedCount}`,
      available: crmMetadata.bedCount > 0,
    });
  }

  // 2. Patient Capacity (Total Patients Served)
  if (crmMetadata.patientCapacity !== undefined) {
    features.push({
      icon: 'users',
      title: language === 'zh' ? '年服务量' : 'Patients Served',
      description: `${crmMetadata.patientCapacity.toLocaleString()}+`,
      available: crmMetadata.patientCapacity > 0,
    });
  }

  // 3. Multilingual Staff - show actual languages from CRM
  const languages = crmMetadata.multilingualStaff || [];
  const hasLanguages = languages.length > 0;

  // Build language display string using native names
  const languageDisplay = hasLanguages
    ? languages.map(code => getLanguageLabel(code, language, true)).join(' · ')
    : (language === 'zh' ? '未配置' : 'Not configured');

  features.push({
    icon: 'globe',
    title: language === 'zh' ? '多语言服务' : 'Multilingual Staff',
    description: languageDisplay,
    available: hasLanguages,
  });

  // 4. Airport Services - show actual services from CRM
  const airportServices = crmMetadata.airportServices || [];
  const hasAirportServices = airportServices.length > 0;

  // Show all services, separated by commas
  const airportDisplay = hasAirportServices
    ? airportServices.map(code => getAirportServiceLabel(code, language)).join(', ')
    : (language === 'zh' ? '未配置' : 'Not configured');

  features.push({
    icon: 'plane',
    title: language === 'zh' ? '机场服务' : 'Airport Services',
    description: airportDisplay,
    available: hasAirportServices,
  });

  // 5. Follow-up Care - show actual options from CRM
  const followUpOptions = crmMetadata.followUpCare || [];
  const hasFollowUp = followUpOptions.length > 0;

  // Show all follow-up options
  const followUpDisplay = hasFollowUp
    ? followUpOptions.map(code => getFollowupLabel(code, language)).join(', ')
    : (language === 'zh' ? '未配置' : 'Not configured');

  features.push({
    icon: 'heart',
    title: language === 'zh' ? '随访护理' : 'Follow-up Care',
    description: followUpDisplay,
    available: hasFollowUp,
  });

  return features;
}

/**
 * Get amenities with full labels for display
 * Returns the actual amenity names from CRM, not abbreviations
 */
export function getAmenitiesDisplay(
  crmMetadata: CRMMetadata | null,
  language: 'en' | 'zh' = 'en'
): string[] {
  if (!crmMetadata?.amenities) return [];

  return crmMetadata.amenities.map(code => getAmenityLabel(code, language));
}
