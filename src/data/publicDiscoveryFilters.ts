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

export const getDiscoveryAreaVideoUrl = (area: DiscoveryArea) => `/procedure/videos?area=${area}`;

export { getDiscoveryVideoUrl, procedureDiscoveryGroups };
