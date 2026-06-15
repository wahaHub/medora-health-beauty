export type DiscoveryArea = 'face' | 'body' | 'nonsurgical' | 'hair' | 'dental';

export type ProcedureDiscoveryItem = {
  id: string;
  label: string;
  zhLabel: string;
  area: DiscoveryArea;
  project: string;
};

export type ProcedureDiscoveryGroup = {
  id: DiscoveryArea;
  label: string;
  zhLabel: string;
  items: ProcedureDiscoveryItem[];
};

export const procedureDiscoveryGroups: ProcedureDiscoveryGroup[] = [
  {
    id: 'face',
    label: 'Face',
    zhLabel: '面部',
    items: [
      {
        id: 'eyes',
        label: 'Eyes: eyelids, eye bags, eye rejuvenation',
        zhLabel: '眼睛：眼睑、眼袋、眼部年轻化',
        area: 'face',
        project: 'eye-surgery',
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

export const getDiscoveryVideoUrl = (item: ProcedureDiscoveryItem) => {
  const params = new URLSearchParams({
    project: item.project,
    area: item.area,
  });

  return `/procedure/videos?${params.toString()}`;
};
