export type DiscoveryArea = 'face' | 'body' | 'nonsurgical' | 'hair' | 'dental';

export type ProcedureDiscoverySubtype = {
  id: string;
  label: string;
  zhLabel: string;
  includeAny: RegExp[];
  excludeAny?: RegExp[];
};

export type ProcedureDiscoveryItem = {
  id: string;
  label: string;
  zhLabel: string;
  area: DiscoveryArea;
  project: string;
  subtypes?: ProcedureDiscoverySubtype[];
};

export type ProcedureDiscoveryGroup = {
  id: DiscoveryArea;
  label: string;
  zhLabel: string;
  items: ProcedureDiscoveryItem[];
};

type SearchableVideoCase = {
  project?: string;
  projectName?: string;
  doctorName?: string;
  objectKey?: string;
  videoUrl?: string;
  sourcePath?: string;
  sourceSet?: string;
  sourceKind?: string;
  classificationSource?: string;
};

export const procedureDiscoveryGroups: ProcedureDiscoveryGroup[] = [
  {
    id: 'face',
    label: 'Face',
    zhLabel: '面部',
    items: [
      {
        id: 'eyes',
        label: 'Eyes',
        zhLabel: '眼睛',
        area: 'face',
        project: 'eye-surgery',
        subtypes: [
          {
            id: 'eyelids',
            label: 'Eyelids',
            zhLabel: '眼睑',
            includeAny: [/眼睛/i, /眼案例/i, /双眼皮/i, /眼睑/i, /眼皮/i, /重睑/i, /上睑/i, /提肌/i, /eyelids?/i, /\blids?\b/i],
            excludeAny: [/眼袋/i, /泪沟/i, /眼部综合/i, /眼综合/i, /年轻/i, /抗衰/i, /提眉/i],
          },
          {
            id: 'eye-bags',
            label: 'Eye Bags',
            zhLabel: '眼袋',
            includeAny: [/眼袋/i, /泪沟/i, /eye\s*bags?/i, /under.?eye/i],
          },
          {
            id: 'eye-rejuvenation',
            label: 'Eye Rejuvenation',
            zhLabel: '眼部年轻化',
            includeAny: [/眼部综合/i, /眼综合/i, /年轻/i, /抗衰/i, /提眉/i, /rejuven/i, /refresh/i],
          },
        ],
      },
      {
        id: 'nose',
        label: 'Nose',
        zhLabel: '鼻子',
        area: 'face',
        project: 'nose-surgery',
      },
      {
        id: 'facial-rejuvenation',
        label: 'Facial Rejuvenation',
        zhLabel: '面部年轻化',
        area: 'face',
        project: 'facial-contouring',
      },
    ],
  },
  {
    id: 'body',
    label: 'Body',
    zhLabel: '身体',
    items: [
      {
        id: 'body-contouring',
        label: 'Body Contouring',
        zhLabel: '身体塑形',
        area: 'body',
        project: 'body-contouring',
      },
      {
        id: 'breast-surgery',
        label: 'Breast Surgery',
        zhLabel: '胸部手术',
        area: 'body',
        project: 'breast',
      },
    ],
  },
  {
    id: 'nonsurgical',
    label: 'Skin & Injectables',
    zhLabel: '皮肤与注射',
    items: [
      {
        id: 'botox-fillers',
        label: 'Botox & Fillers',
        zhLabel: '肉毒与填充',
        area: 'nonsurgical',
        project: 'injectables',
      },
      {
        id: 'laser-skin-treatment',
        label: 'Laser Skin Treatment',
        zhLabel: '激光皮肤治疗',
        area: 'nonsurgical',
        project: 'laser-treatments',
      },
      {
        id: 'skin-tightening',
        label: 'Skin Tightening',
        zhLabel: '皮肤紧致',
        area: 'nonsurgical',
        project: 'skin-tightening-ns',
      },
      {
        id: 'anti-aging-treatments',
        label: 'Anti-aging Treatments',
        zhLabel: '抗衰治疗',
        area: 'nonsurgical',
        project: 'collagen',
      },
    ],
  },
  {
    id: 'hair',
    label: 'Hair',
    zhLabel: '毛发',
    items: [
      {
        id: 'hair-transplant',
        label: 'Hair Transplant',
        zhLabel: '植发',
        area: 'hair',
        project: 'hair-transplant',
      },
    ],
  },
  {
    id: 'dental',
    label: 'Dental / Smile',
    zhLabel: '牙齿 / 微笑',
    items: [
      {
        id: 'veneers',
        label: 'Veneers',
        zhLabel: '瓷贴面',
        area: 'dental',
        project: 'porcelain-veneers',
      },
      {
        id: 'teeth-whitening',
        label: 'Teeth Whitening',
        zhLabel: '牙齿美白',
        area: 'dental',
        project: 'teeth-whitening',
      },
      {
        id: 'smile-design',
        label: 'Smile Design',
        zhLabel: '微笑设计',
        area: 'dental',
        project: 'smile-design',
      },
    ],
  },
];

export const discoveryItemsWithVideos = procedureDiscoveryGroups.flatMap((group) => group.items);

export const getDiscoveryLabel = (
  item: Pick<ProcedureDiscoveryItem | ProcedureDiscoveryGroup, 'label' | 'zhLabel'>,
  language: string,
) => (language === 'zh' ? item.zhLabel : item.label);

export const getDiscoveryVideoUrl = (item: ProcedureDiscoveryItem, subtype?: ProcedureDiscoverySubtype) => {
  const params = new URLSearchParams({
    area: item.area,
    project: item.project,
  });
  if (subtype) params.set('subtype', subtype.id);

  return `/procedure/videos?${params.toString()}`;
};

export const getDiscoverySubtype = (item: ProcedureDiscoveryItem | undefined, subtypeId: string | null) =>
  item?.subtypes?.find((subtype) => subtype.id === subtypeId) || null;

const searchableCaseText = (item: SearchableVideoCase) =>
  [
    item.project,
    item.projectName,
    item.doctorName,
    item.objectKey,
    item.videoUrl,
    item.sourcePath,
    item.sourceSet,
    item.sourceKind,
    item.classificationSource,
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ');

export const matchesDiscoverySubtype = (
  item: SearchableVideoCase,
  subtype: ProcedureDiscoverySubtype,
) => {
  const text = searchableCaseText(item);
  if (subtype.excludeAny?.some((pattern) => pattern.test(text))) return false;
  return subtype.includeAny.some((pattern) => pattern.test(text));
};
