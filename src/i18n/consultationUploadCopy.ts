import type { LanguageCode } from '@/contexts/LanguageContext';

export type ConsultationChannel = 'free' | 'doctor-li' | 'custom-doctor';
export type ConsultationBodyPart = 'eyes' | 'nose' | 'lips' | 'face' | 'hair' | 'body' | 'other';

type ChannelCopy = {
  tag: string;
  title: string;
  price: string;
  description: string;
  bullets: string[];
  cta: string;
};

type PartCopy = {
  name: string;
  description: string;
  guidance: string;
  privacy: string;
  iconAlt: string;
};

type AngleCopy = {
  title: string;
  subtitle: string;
};

export type ConsultationUploadCopy = {
  secureLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  trustItems: string[];
  progressLabel: string;
  stepNumbers: string[];
  steps: string[];
  step1Title: string;
  step1Subtitle: string;
  channels: Record<ConsultationChannel, ChannelCopy>;
  doctorName: string;
  doctorRoleShort: string;
  doctorRoleFull: string;
  doctorStatCases: string;
  doctorStatCasesLabel: string;
  doctorStatYears: string;
  doctorStatYearsLabel: string;
  step2Title: string;
  step2Subtitle: string;
  parts: Record<ConsultationBodyPart, PartCopy>;
  back: string;
  step3Title: string;
  minimumScopeTitle: string;
  uploadDefault: string;
  uploadProcessing: string;
  uploadCropped: string;
  uploadConfirmed: string;
  fileTypeAlert: string;
  fileSizeAlert: string;
  imageFailedAlert: string;
  faceAngles: AngleCopy[];
  hairAngles: AngleCopy[];
  qualityItems: string[];
  nextToForm: string;
  step4Title: string;
  step4Subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  ageLabel: string;
  countryLabel: string;
  countryPlaceholder: string;
  contactLabel: string;
  contactPlaceholder: string;
  concernsLabel: string;
  concernsPlaceholder: string;
  preferredDoctorLabel: string;
  preferredDoctorPlaceholder: string;
  consent: string;
  incompletePhotosError: string;
  sessionRequiredTitle: string;
  sessionRequiredDescription: string;
  sessionRequiredCta: string;
  orderChannelLabel: string;
  orderAmountLabel: string;
  submitIdle: string;
  submitBusy: string;
  successEyebrow: string;
  successTitle: string;
  successMessagePrefix: string;
  successMessageSuffix: string;
  paymentPaid: (amount: number) => string;
  paymentFree: string;
  returnHome: string;
  modalCloseLabel: string;
  modalKicker: string;
  modalPhilosophyLabel: string;
  modalPhilosophyTitle: string;
  modalPhilosophyBody: string;
  modalIncludesTitle: string;
  modalIncludes: string[];
  modalExperienceLabel: string;
  modalTimeline: Array<{ time: string; title: string; body: string }>;
  modalFooter: string;
  modalChoose: string;
  footerCopyright: string;
  disclaimer: string;
};

const en: ConsultationUploadCopy = {
  secureLabel: 'Encrypted private transfer',
  heroEyebrow: 'PRIVATE ONLINE CONSULTATION',
  heroTitle: 'Start Your Private',
  heroAccent: 'Beauty Consultation',
  heroDescription: 'Upload photos with clear guidance. Our medical team will provide professional suggestions based on your real situation.',
  trustItems: ['Medical team review', 'Strict data privacy', 'Global patient support'],
  progressLabel: 'Submission progress',
  stepNumbers: ['STEP 01', 'STEP 02', 'STEP 03', 'STEP 04'],
  steps: ['Choose consultation', 'Choose area', 'Upload photos', 'Submit details'],
  step1Title: 'Choose a consultation channel',
  step1Subtitle: 'Three options, all protected by our professional team.',
  channels: {
    free: {
      tag: 'Initial guidance',
      title: 'Free text consultation',
      price: 'Free',
      description: 'Receive initial suggestions, reference pricing, and possible treatment directions.',
      bullets: ['One-on-one advisor response', 'Personalized plan suggestions', 'Reference price range'],
      cta: 'Start free consultation',
    },
    'doctor-li': {
      tag: 'Recommended',
      title: 'Dr. Li video consultation',
      price: '$49 USD',
      description: 'Speak with Dr. Li one-on-one for a deeper professional video assessment.',
      bullets: ['Doctor-led video consultation', 'Full assessment and plan direction', 'Post-consultation care advice'],
      cta: 'Book video consultation',
    },
    'custom-doctor': {
      tag: 'Full assessment',
      title: 'Choose a hospital / doctor',
      price: '$199 USD',
      description: 'Request the specific hospital or plastic surgeon you would like to consult.',
      bullets: ['Named expert consultation', 'Detailed case assessment', 'Dedicated coordination'],
      cta: 'Choose specialist',
    },
  },
  doctorName: 'Dr. Li',
  doctorRoleShort: 'Medical Director | Plastic Surgery Advisor',
  doctorRoleFull: 'Plastic surgery physician at a public tertiary hospital',
  doctorStatCases: '7000+',
  doctorStatCasesLabel: 'consultations',
  doctorStatYears: '10+ yrs',
  doctorStatYearsLabel: 'clinical experience',
  step2Title: 'Which area would you like to improve?',
  step2Subtitle: 'Choose one main consultation area and we will show the photo guide for it.',
  parts: {
    eyes: {
      name: 'Eyes',
      description: 'Eyelids · eye bags · brow lift',
      guidance: 'Only include both eyes and eyebrows. Keep your eyes naturally open and avoid glasses or colored contacts.',
      privacy: 'Keep the area from brows to under-eyes only. You do not need to upload your nose, lips, or full face.',
      iconAlt: 'Eyes consultation icon',
    },
    nose: {
      name: 'Nose',
      description: 'Rhinoplasty · revision · tip shape',
      guidance: 'Only include the bridge, tip, and nostrils. Side views should clearly show the nose profile.',
      privacy: 'Keep the area from below the brow to below the nostrils only. A full face photo is not required.',
      iconAlt: 'Nose consultation icon',
    },
    lips: {
      name: 'Lips',
      description: 'Lip shape · philtrum · corners',
      guidance: 'Only include the philtrum, lips, and a small upper-chin area. Keep lips naturally closed.',
      privacy: 'Keep the area from the base of the nose to the upper chin only. Eyes or full face are not required.',
      iconAlt: 'Lips consultation icon',
    },
    face: {
      name: 'Facial contour',
      description: 'Jaw · cheekbones · facial fat',
      guidance: 'For contour assessment, show the forehead, ears, and jawline clearly. Tie hair back if possible.',
      privacy: 'Facial contour review needs the full face shape, but the system removes shoulders and extra background.',
      iconAlt: 'Facial contour consultation icon',
    },
    hair: {
      name: 'Hair restoration',
      description: 'Hairline · crown · density',
      guidance: 'Photograph the hairline, crown, or donor area. Your face is not the focus for this assessment.',
      privacy: 'The system keeps the hair and scalp area. Crown and donor photos do not need to show the full face.',
      iconAlt: 'Hair restoration consultation icon',
    },
    body: {
      name: 'Body contouring',
      description: 'Breast · waist · limbs',
      guidance: 'Photograph only the body area you want to discuss. Avoid including your face or unrelated areas.',
      privacy: 'Only keep the target body area. Avoid the face and identifying features while taking photos.',
      iconAlt: 'Body contouring consultation icon',
    },
    other: {
      name: 'Other area',
      description: 'Describe it in your notes',
      guidance: 'Photograph only the area you want to consult about. Avoid the face and unrelated background.',
      privacy: 'Upload only the minimum local area needed for this consultation and avoid identifiable information.',
      iconAlt: 'Other area consultation icon',
    },
  },
  back: 'Back',
  step3Title: 'Upload 5 clear photos',
  minimumScopeTitle: 'Minimum necessary area',
  uploadDefault: '+ Upload photo',
  uploadProcessing: 'Processing...',
  uploadCropped: 'Cropped to necessary area · click to replace',
  uploadConfirmed: 'Necessary area confirmed · click to replace',
  fileTypeAlert: 'Only JPG, PNG, or WebP images are supported.',
  fileSizeAlert: 'Each original photo must be under 15MB.',
  imageFailedAlert: 'Photo processing failed. Please try another image.',
  faceAngles: [
    { title: 'Front', subtitle: 'Face camera' },
    { title: 'Left 45°', subtitle: 'Turn slightly right' },
    { title: 'Left 90°', subtitle: 'Full side view' },
    { title: 'Right 45°', subtitle: 'Turn slightly left' },
    { title: 'Right 90°', subtitle: 'Full side view' },
  ],
  hairAngles: [
    { title: 'Front hairline', subtitle: 'Look straight ahead' },
    { title: 'Left hairline', subtitle: 'Show temple area' },
    { title: 'Right hairline', subtitle: 'Show temple area' },
    { title: 'Crown top view', subtitle: 'Show thinning area' },
    { title: 'Donor area', subtitle: 'Show back hair' },
  ],
  qualityItems: ['Use natural or bright indoor light', 'Keep camera level with the area', 'Do not use filters, beauty apps, or screenshots'],
  nextToForm: 'Next: fill details',
  step4Title: 'Finally, leave your contact details',
  step4Subtitle: 'A medical advisor will follow up through your preferred contact method.',
  nameLabel: 'Name / preferred name',
  namePlaceholder: 'Enter your preferred name',
  ageLabel: 'Age range',
  countryLabel: 'Country / region',
  countryPlaceholder: 'e.g. United States, Canada',
  contactLabel: 'WeChat / WhatsApp / email',
  contactPlaceholder: 'Enter your usual contact method',
  concernsLabel: 'Main goals and previous procedure history',
  concernsPlaceholder: 'Describe what you want to improve, any related procedures, and timing',
  preferredDoctorLabel: 'Preferred hospital or doctor',
  preferredDoctorPlaceholder: 'Enter hospital or doctor name',
  consent: 'I have read and agree that Medora Beauty may collect and process my submitted details and photos for this medical consultation.',
  incompletePhotosError: 'Please upload all 5 photos.',
  sessionRequiredTitle: 'Start from a video case first',
  sessionRequiredDescription: 'Please choose a procedure video or case first so we can create your secure CRM consultation record before collecting photos.',
  sessionRequiredCta: 'Browse video cases',
  orderChannelLabel: 'Consultation',
  orderAmountLabel: 'Amount due',
  submitIdle: 'Securely submit details',
  submitBusy: 'Submitting securely...',
  successEyebrow: 'SUBMISSION COMPLETE',
  successTitle: 'Details submitted securely',
  successMessagePrefix: 'Your consultation ID is',
  successMessageSuffix: 'A medical advisor will contact you through the details you provided.',
  paymentPaid: (amount) => `This channel costs $${amount} USD. Once payment is enabled, your advisor will send a secure payment link.`,
  paymentFree: 'This text consultation is free. No payment is required.',
  returnHome: 'Return to Medora Beauty',
  modalCloseLabel: 'Close doctor details',
  modalKicker: 'MEDORA APPOINTED CONSULTANT',
  modalPhilosophyLabel: 'Clinical philosophy',
  modalPhilosophyTitle: 'Anatomy-led advice for realistic, natural improvement',
  modalPhilosophyBody: 'Dr. Li has long worked in aesthetic consultation, facial design, and minimally invasive aesthetic training. Her recommendations begin with anatomy and are tailored to each person’s facial foundation, proportions, and goals.',
  modalIncludesTitle: 'This consultation includes',
  modalIncludes: ['Facial foundation and goals analysis', 'Suitable treatment and procedure suggestions', 'Treatment sequence, recovery, and reference pricing'],
  modalExperienceLabel: 'Experience',
  modalTimeline: [
    { time: '2022.03-present', title: 'Public tertiary hospital', body: 'Plastic surgery physician.' },
    { time: '2019.01-2021.12', title: 'Shenzhen Namei Medical Aesthetics', body: 'Co-founded the clinic and served as aesthetic medicine physician.' },
    { time: '2016.12-2018.12', title: 'Shenyang Juemei Medical Aesthetics', body: 'Founded the clinic and led the plastic surgery consultation department.' },
    { time: '2014.09-2016.11', title: 'Beijing Huashang Plastic Surgery Hospital', body: 'Plastic surgery consultant.' },
    { time: '2015.09-present', title: 'Aesthetic design training', body: 'Aesthetic design consultant trainer and minimally invasive aesthetic lecturer.' },
  ],
  modalFooter: 'Dr. Li one-on-one video consultation',
  modalChoose: 'Choose Dr. Li consultation',
  footerCopyright: '© 2026 Medora Beauty',
  disclaimer: 'This service does not replace an in-person medical diagnosis. Final plans depend on formal physician evaluation.',
};

const zh: ConsultationUploadCopy = {
  ...en,
  secureLabel: '隐私加密传输',
  heroTitle: '开启您的专属',
  heroAccent: '美学咨询',
  heroDescription: '由专业团队根据您的真实情况，提供个性化的美学建议与方案。',
  trustItems: ['医疗团队评估', '资料严格保密', '全球患者服务'],
  progressLabel: '提交进度',
  steps: ['选择咨询', '选择部位', '上传资料', '提交资料'],
  step1Title: '请选择咨询通道',
  step1Subtitle: '三种方式，专业团队为您提供个性化方案。',
  channels: {
    free: {
      tag: '了解初步方案',
      title: '免费图文咨询',
      price: '免费',
      description: '获取初步建议与方案、参考报价及手术方式说明。',
      bullets: ['专业顾问一对一解答', '个性化方案建议', '参考费用区间'],
      cta: '立即咨询',
    },
    'doctor-li': {
      tag: '推荐',
      title: '专家视频面诊',
      price: '$49 USD',
      description: '与专业医生视频沟通，深度评估并制定方案。',
      bullets: ['医生一对一视频面诊', '全面评估与方案制定', '术后护理建议'],
      cta: '预约视频面诊',
    },
    'custom-doctor': {
      tag: '全面评估',
      title: '指定医院 / 医生',
      price: '$199 USD',
      description: '指定专家面诊，获取更全面的诊疗方案。',
      bullets: ['指定专家面诊', '详细方案评估', '专人协调安排'],
      cta: '选择专家',
    },
  },
  doctorName: '李医生',
  doctorRoleShort: '医疗总监 | 整形外科专家',
  doctorRoleFull: '国内公立三级医院烧伤整形科医师',
  doctorStatCasesLabel: '成功案例',
  doctorStatYears: '10+ 年',
  doctorStatYearsLabel: '临床经验',
  step2Title: '您希望改善哪个部位？',
  step2Subtitle: '请选择一个主要咨询部位，我们会展示对应的拍摄要求。',
  parts: {
    eyes: { ...en.parts.eyes, name: '眼部', description: '双眼皮 · 眼袋 · 提眉', guidance: '画面只需包含双眼和眉毛，保持自然睁眼，不佩戴眼镜或美瞳。', privacy: '仅保留眉毛至眼下区域，不需要上传鼻子、嘴唇或完整面部。', iconAlt: '眼部咨询图标' },
    nose: { ...en.parts.nose, name: '鼻部', description: '隆鼻 · 鼻综合 · 鼻修复', guidance: '画面只需包含鼻梁、鼻尖和鼻翼，侧面需清楚呈现鼻部轮廓。', privacy: '仅保留眉间下方至鼻翼下方区域，不需要上传完整面部。', iconAlt: '鼻部咨询图标' },
    lips: { ...en.parts.lips, name: '口唇', description: '唇形 · 人中 · 嘴角', guidance: '画面只需包含人中、嘴唇和少量下巴上缘，请保持嘴唇自然闭合。', privacy: '仅保留鼻底至下巴上缘区域，不需要上传眼睛或完整面部。', iconAlt: '口唇咨询图标' },
    face: { ...en.parts.face, name: '面部轮廓', description: '下颌 · 颧骨 · 脂肪', guidance: '轮廓评估需要完整露出额头、耳朵和下颌线，请将头发束起。', privacy: '面部轮廓评估需要保留完整脸型，但系统会裁掉肩部和多余背景。', iconAlt: '面部轮廓咨询图标' },
    hair: { ...en.parts.hair, name: '植发', description: '发际线 · 头顶 · 加密', guidance: '只拍摄发际线、头顶或后枕供发区，脸部不是评估重点。', privacy: '系统重点保留头发和头皮区域，头顶及后枕照片无需出现正脸。', iconAlt: '植发咨询图标' },
    body: { ...en.parts.body, name: '身体塑形', description: '胸部 · 腰腹 · 四肢', guidance: '只拍摄需要咨询的身体部位，请勿包含面部或其他无关区域。', privacy: '仅保留目标身体部位；拍摄时请主动避开脸部和身份特征。', iconAlt: '身体塑形咨询图标' },
    other: { ...en.parts.other, name: '其他部位', description: '请选择后在备注中说明', guidance: '请只围绕需要咨询的部位拍摄，避免出现面部及其他无关区域。', privacy: '仅上传本次咨询必需的局部范围，避免包含可识别身份的信息。', iconAlt: '其他部位咨询图标' },
  },
  back: '返回',
  step3Title: '请上传 5 张清晰照片',
  minimumScopeTitle: '最小必要范围',
  uploadDefault: '+ 点击上传',
  uploadProcessing: '正在处理...',
  uploadCropped: '已裁为必要范围 · 点击更换',
  uploadConfirmed: '必要范围已确认 · 点击更换',
  fileTypeAlert: '仅支持 JPG、PNG 或 WebP 图片。',
  fileSizeAlert: '单张原始照片不能超过 15MB。',
  imageFailedAlert: '照片处理失败，请换一张照片重试。',
  faceAngles: [
    { title: '正面', subtitle: '镜头正对' },
    { title: '左侧 45°', subtitle: '轻转向右' },
    { title: '左侧 90°', subtitle: '完整侧面' },
    { title: '右侧 45°', subtitle: '轻转向左' },
    { title: '右侧 90°', subtitle: '完整侧面' },
  ],
  hairAngles: [
    { title: '正面发际线', subtitle: '平视镜头' },
    { title: '左侧发际线', subtitle: '露出鬓角' },
    { title: '右侧发际线', subtitle: '露出鬓角' },
    { title: '头顶俯拍', subtitle: '展示稀疏区域' },
    { title: '后枕供发区', subtitle: '展示后脑头发' },
  ],
  qualityItems: ['使用自然光或明亮室内光', '保持镜头与拍摄部位平齐', '请勿使用滤镜、美颜或截图'],
  nextToForm: '下一步：填写资料',
  step4Title: '最后，请留下联系信息',
  step4Subtitle: '医疗顾问将通过您选择的联系方式跟进。',
  nameLabel: '姓名 / 称呼',
  namePlaceholder: '请输入您的称呼',
  ageLabel: '年龄范围',
  countryLabel: '国家 / 地区',
  countryPlaceholder: '例如：美国、加拿大',
  contactLabel: '微信 / WhatsApp / 邮箱',
  contactPlaceholder: '请输入常用联系方式',
  concernsLabel: '主要诉求及既往手术经历',
  concernsPlaceholder: '请描述您希望改善的问题、做过的相关手术及时间',
  preferredDoctorLabel: '指定医院或医生名称',
  preferredDoctorPlaceholder: '请输入医院或医生名称',
  consent: '我已阅读并同意 Medora Beauty 为本次医疗咨询收集和处理我提交的资料及照片。',
  incompletePhotosError: '请上传完整的 5 张照片。',
  sessionRequiredTitle: '请先从案例视频开始',
  sessionRequiredDescription: '请先选择一个项目视频或案例，我们会先为您创建安全的 CRM 咨询记录，再收集照片资料。',
  sessionRequiredCta: '浏览案例视频',
  orderChannelLabel: '本次问诊',
  orderAmountLabel: '应付金额',
  submitIdle: '安全提交资料',
  submitBusy: '正在安全提交...',
  successTitle: '资料已安全提交',
  successMessagePrefix: '您的咨询编号为',
  successMessageSuffix: '医疗顾问会尽快通过您留下的联系方式与您联系。',
  paymentPaid: (amount) => `本通道费用为 $${amount} USD。支付功能接入后，顾问会向您发送安全支付链接。`,
  paymentFree: '本次图文问诊免费，无需支付。',
  returnHome: '返回 Medora Beauty 官网',
  modalCloseLabel: '关闭医生详情',
  modalPhilosophyLabel: '专业理念',
  modalPhilosophyTitle: '从医学解剖出发，提供真实、自然的改善建议',
  modalPhilosophyBody: '李医生长期从事医学美容面诊、美学设计咨询及轻医美培训。她以医学解剖理论为基础，结合求美者的面部基础、比例与个人诉求，提供客观、自然且具有可执行性的面部调整建议。',
  modalIncludesTitle: '本次面诊包括',
  modalIncludes: ['面部基础与诉求分析', '适合的改善方式及手术建议', '治疗顺序、恢复期与参考报价说明'],
  modalExperienceLabel: '专业经历',
  modalTimeline: [
    { time: '2022.03 至今', title: '国内公立三级医院', body: '就职烧伤整形科，任医师。' },
    { time: '2019.01-2021.12', title: '深圳娜美整形医疗门诊', body: '参与创立门诊并任医学美容科医师。' },
    { time: '2016.12-2018.12', title: '沈阳觉美医疗美容门诊', body: '创立门诊并任整形咨询部主任。' },
    { time: '2014.09-2016.11', title: '北京华尚整形医院', body: '任整形咨询师。' },
    { time: '2015.09 至今', title: '美学设计与轻医美培训', body: '从事美学设计咨询师培训及轻医美培训讲师工作。' },
  ],
  modalFooter: '李医生一对一视频面诊',
  modalChoose: '选择李医生问诊',
  footerCopyright: '© 2026 Medora Beauty',
  disclaimer: '本服务不能替代医生面对面诊断，最终方案以医生正式评估为准。',
};

const partialTranslations: Partial<Record<LanguageCode, Partial<ConsultationUploadCopy>>> = {
  zh,
  es: {
    heroTitle: 'Inicia tu consulta',
    heroAccent: 'estética privada',
    step1Title: 'Elige un canal de consulta',
    step2Title: '¿Qué zona quieres mejorar?',
    step3Title: 'Sube 5 fotos claras',
    step4Title: 'Por último, deja tus datos de contacto',
    successTitle: 'Datos enviados de forma segura',
    steps: ['Elegir consulta', 'Elegir zona', 'Subir fotos', 'Enviar datos'],
  },
  fr: {
    heroTitle: 'Commencez votre consultation',
    heroAccent: 'esthétique privée',
    step1Title: 'Choisissez un canal de consultation',
    step2Title: 'Quelle zone souhaitez-vous améliorer ?',
    step3Title: 'Téléversez 5 photos nettes',
    step4Title: 'Enfin, laissez vos coordonnées',
    successTitle: 'Informations envoyées en sécurité',
    steps: ['Choisir la consultation', 'Choisir la zone', 'Téléverser', 'Envoyer'],
  },
  de: {
    heroTitle: 'Starten Sie Ihre private',
    heroAccent: 'Ästhetikberatung',
    step1Title: 'Beratungskanal wählen',
    step2Title: 'Welchen Bereich möchten Sie verbessern?',
    step3Title: '5 klare Fotos hochladen',
    step4Title: 'Zum Schluss Kontaktdaten hinterlassen',
    successTitle: 'Daten sicher übermittelt',
    steps: ['Beratung wählen', 'Bereich wählen', 'Fotos hochladen', 'Daten senden'],
  },
  ru: {
    heroTitle: 'Начните личную',
    heroAccent: 'эстетическую консультацию',
    step1Title: 'Выберите формат консультации',
    step2Title: 'Какую зону вы хотите улучшить?',
    step3Title: 'Загрузите 5 четких фото',
    step4Title: 'Оставьте контактные данные',
    successTitle: 'Данные безопасно отправлены',
    steps: ['Выбор консультации', 'Выбор зоны', 'Загрузка фото', 'Отправка данных'],
  },
  ar: {
    heroTitle: 'ابدأ استشارتك',
    heroAccent: 'التجميلية الخاصة',
    step1Title: 'اختر قناة الاستشارة',
    step2Title: 'أي منطقة ترغب في تحسينها؟',
    step3Title: 'حمّل 5 صور واضحة',
    step4Title: 'أخيراً، اترك بيانات التواصل',
    successTitle: 'تم إرسال البيانات بأمان',
    steps: ['اختر الاستشارة', 'اختر المنطقة', 'حمّل الصور', 'أرسل البيانات'],
  },
  vi: {
    heroTitle: 'Bắt đầu buổi tư vấn',
    heroAccent: 'thẩm mỹ riêng của bạn',
    step1Title: 'Chọn kênh tư vấn',
    step2Title: 'Bạn muốn cải thiện vùng nào?',
    step3Title: 'Tải lên 5 ảnh rõ nét',
    step4Title: 'Cuối cùng, để lại thông tin liên hệ',
    successTitle: 'Thông tin đã được gửi an toàn',
    steps: ['Chọn tư vấn', 'Chọn vùng', 'Tải ảnh', 'Gửi thông tin'],
  },
  id: {
    heroTitle: 'Mulai konsultasi',
    heroAccent: 'estetika pribadi Anda',
    step1Title: 'Pilih kanal konsultasi',
    step2Title: 'Area mana yang ingin Anda perbaiki?',
    step3Title: 'Unggah 5 foto yang jelas',
    step4Title: 'Terakhir, tinggalkan kontak Anda',
    successTitle: 'Data berhasil dikirim dengan aman',
    steps: ['Pilih konsultasi', 'Pilih area', 'Unggah foto', 'Kirim data'],
  },
};

export function getConsultationUploadCopy(language: LanguageCode): ConsultationUploadCopy {
  const override = partialTranslations[language];
  if (!override) return en;
  return {
    ...en,
    ...override,
    channels: { ...en.channels, ...override.channels },
    parts: { ...en.parts, ...override.parts },
  };
}
