import {
  getDiscoveryLabel,
  getDiscoveryVideoUrl,
  procedureDiscoveryGroups,
  type DiscoveryArea,
  type ProcedureDiscoveryGroup,
  type ProcedureDiscoveryItem,
} from './procedureDiscovery';

export type PublicProcedureOption = {
  id: string;
  name: string;
  zhName: string;
  category: DiscoveryArea;
  project: string;
};

export type PublicProcedureGroup = {
  category: DiscoveryArea;
  name: string;
  zhName: string;
  procedures: PublicProcedureOption[];
};

export type PublicDestinationOption = {
  value: string;
  label: string;
  zhLabel: string;
};

export const publicDestinationOptions: PublicDestinationOption[] = [
  { value: 'china', label: 'China', zhLabel: '中国' },
];

export const publicProcedureGroups: PublicProcedureGroup[] = procedureDiscoveryGroups.map((group) => ({
  category: group.id,
  name: group.label,
  zhName: group.zhLabel,
  procedures: group.items.map((item) => ({
    id: item.id,
    name: item.label,
    zhName: item.zhLabel,
    category: item.area,
    project: item.project,
  })),
}));

export const getPublicDestinationLabel = (option: PublicDestinationOption, language: string) =>
  language === 'zh' ? option.zhLabel : option.label;

export const getPublicProcedureGroupLabel = (
  group: PublicProcedureGroup | Pick<ProcedureDiscoveryGroup, 'label' | 'zhLabel'>,
  language: string,
) => ('name' in group ? (language === 'zh' ? group.zhName : group.name) : getDiscoveryLabel(group, language));

export const getPublicProcedureLabel = (
  procedure: PublicProcedureOption | ProcedureDiscoveryItem,
  language: string,
) => ('name' in procedure ? (language === 'zh' ? procedure.zhName : procedure.name) : getDiscoveryLabel(procedure, language));

export const getPublicProcedureOptionById = (procedureId: string) => {
  for (const group of publicProcedureGroups) {
    const procedure = group.procedures.find((item) => item.id === procedureId);
    if (procedure) return { group, procedure };
  }

  return null;
};

const legacyProcedureAliases: Record<string, string> = {
  'brow lift': 'facial-rejuvenation',
  'eyelid surgery': 'eyes',
  blepharoplasty: 'eyes',
  facelift: 'facial-rejuvenation',
  'midface lift': 'facial-rejuvenation',
  'mini facelift': 'facial-rejuvenation',
  'neck lift': 'facial-rejuvenation',
  'deep neck contouring': 'facial-rejuvenation',
  otoplasty: 'facial-rejuvenation',
  rhinoplasty: 'nose',
  'revision rhinoplasty': 'nose',
  'nose surgery': 'nose',
  'cheek augmentation': 'facial-rejuvenation',
  'chin augmentation': 'facial-rejuvenation',
  'jawline contouring': 'facial-rejuvenation',
  'facial implants': 'facial-rejuvenation',
  'buccal fat removal': 'facial-rejuvenation',
  'fat transfer': 'facial-rejuvenation',
  'lip augmentation': 'facial-rejuvenation',
  'lip lift': 'facial-rejuvenation',
  liposuction: 'body-contouring',
  'tummy tuck': 'body-contouring',
  'mommy makeover': 'body-contouring',
  'arm lift': 'body-contouring',
  'thigh lift': 'body-contouring',
  'brazilian butt lift': 'body-contouring',
  'buttock lift': 'body-contouring',
  labiaplasty: 'body-contouring',
  'breast augmentation': 'breast-surgery',
  'breast lift': 'breast-surgery',
  'breast reduction': 'breast-surgery',
  'gynecomastia surgery': 'breast-surgery',
  'botox cosmetic': 'botox-fillers',
  botox: 'botox-fillers',
  'dermal fillers': 'botox-fillers',
  'lip filler': 'botox-fillers',
  'chemical peels': 'laser-skin-treatment',
  'laser skin resurfacing': 'laser-skin-treatment',
  microneedling: 'skin-tightening',
  'hair restoration': 'hair-transplant',
  'hair transplant': 'hair-transplant',
};

const normalizePublicProcedureLookup = (value: string) =>
  value.trim().toLowerCase().replace(/[®™]/g, '').replace(/\s+/g, ' ');

export const getPublicProcedureOptionByLookup = (value: string) => {
  const normalized = normalizePublicProcedureLookup(value);
  if (!normalized) return null;

  for (const group of publicProcedureGroups) {
    const procedure = group.procedures.find((item) => (
      normalizePublicProcedureLookup(item.id) === normalized ||
      normalizePublicProcedureLookup(item.name) === normalized ||
      normalizePublicProcedureLookup(item.zhName) === normalized ||
      normalizePublicProcedureLookup(item.project) === normalized
    ));
    if (procedure) return { group, procedure };
  }

  const aliasedId = legacyProcedureAliases[normalized];
  return aliasedId ? getPublicProcedureOptionById(aliasedId) : null;
};

export const getDiscoveryAreaVideoUrl = (area: DiscoveryArea) => `/procedure/videos?area=${area}`;

export { getDiscoveryVideoUrl, procedureDiscoveryGroups };
