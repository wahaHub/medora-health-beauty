import React, { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import doctorLi from '@/assets/consultation-upload/doctor-li.jpg';
import face1 from '@/assets/consultation-upload/examples/face-1.jpg';
import face2 from '@/assets/consultation-upload/examples/face-2.jpg';
import face3 from '@/assets/consultation-upload/examples/face-3.jpg';
import face4 from '@/assets/consultation-upload/examples/face-4.jpg';
import face5 from '@/assets/consultation-upload/examples/face-5.jpg';
import hair1 from '@/assets/consultation-upload/examples/hair-1.jpg';
import hair2 from '@/assets/consultation-upload/examples/hair-2.jpg';
import hair3 from '@/assets/consultation-upload/examples/hair-3.jpg';
import hair4 from '@/assets/consultation-upload/examples/hair-4.jpg';
import hair5 from '@/assets/consultation-upload/examples/hair-5.jpg';
import './ConsultationUpload.css';

type Channel = 'free' | 'doctor-li' | 'custom-doctor';
type BodyPart = 'eyes' | 'nose' | 'lips' | 'face' | 'hair' | 'body' | 'other';
type Step = 1 | 2 | 3 | 4 | 5;

type PhotoRecord = {
  data: string;
  type: string;
  angle: string;
};

type CropConfig = {
  width: number;
  height: number;
  centerY: number;
};

const channelNames: Record<Channel, string> = {
  free: '免费图文问诊',
  'doctor-li': '李医生视频面诊',
  'custom-doctor': '指定医院 / 医生问诊',
};

const channelPrices: Record<Channel, number> = {
  free: 0,
  'doctor-li': 49,
  'custom-doctor': 199,
};

const partConfig: Record<BodyPart, { name: string; guidance: string; privacy: string; crop: CropConfig }> = {
  eyes: {
    name: '眼部',
    guidance: '画面只需包含双眼和眉毛，保持自然睁眼，不佩戴眼镜或美瞳。',
    privacy: '仅保留眉毛至眼下区域，不需要上传鼻子、嘴唇或完整面部。',
    crop: { width: 0.92, height: 0.24, centerY: 0.34 },
  },
  nose: {
    name: '鼻部',
    guidance: '画面只需包含鼻梁、鼻尖和鼻翼，侧面需清楚呈现鼻部轮廓。',
    privacy: '仅保留眉间下方至鼻翼下方区域，不需要上传完整面部。',
    crop: { width: 0.58, height: 0.38, centerY: 0.47 },
  },
  lips: {
    name: '口唇',
    guidance: '画面只需包含人中、嘴唇和少量下巴上缘，请保持嘴唇自然闭合。',
    privacy: '仅保留鼻底至下巴上缘区域，不需要上传眼睛或完整面部。',
    crop: { width: 0.72, height: 0.27, centerY: 0.64 },
  },
  face: {
    name: '面部轮廓',
    guidance: '轮廓评估需要完整露出额头、耳朵和下颌线，请将头发束起。',
    privacy: '面部轮廓评估需要保留完整脸型，但系统会裁掉肩部和多余背景。',
    crop: { width: 0.84, height: 0.88, centerY: 0.47 },
  },
  hair: {
    name: '植发',
    guidance: '只拍摄发际线、头顶或后枕供发区，脸部不是评估重点。',
    privacy: '系统重点保留头发和头皮区域，头顶及后枕照片无需出现正脸。',
    crop: { width: 0.94, height: 0.7, centerY: 0.29 },
  },
  body: {
    name: '身体塑形',
    guidance: '只拍摄需要咨询的身体部位，请勿包含面部或其他无关区域。',
    privacy: '仅保留目标身体部位；拍摄时请主动避开脸部和身份特征。',
    crop: { width: 0.86, height: 0.86, centerY: 0.5 },
  },
  other: {
    name: '其他部位',
    guidance: '请只围绕需要咨询的部位拍摄，避免出现面部及其他无关区域。',
    privacy: '仅上传本次咨询必需的局部范围，避免包含可识别身份的信息。',
    crop: { width: 0.86, height: 0.86, centerY: 0.5 },
  },
};

const faceAngles = [
  ['front', '正面', '镜头正对'],
  ['angle-left', '左侧 45°', '轻转向右'],
  ['side-left', '左侧 90°', '完整侧面'],
  ['angle-right', '右侧 45°', '轻转向左'],
  ['side-right', '右侧 90°', '完整侧面'],
] as const;

const hairAngles = [
  ['front', '正面发际线', '平视镜头'],
  ['angle-left', '左侧发际线', '露出鬓角'],
  ['angle-right', '右侧发际线', '露出鬓角'],
  ['top', '头顶俯拍', '展示稀疏区域'],
  ['back', '后枕供发区', '展示后脑头发'],
] as const;

const faceExamples = [face1, face2, face3, face4, face5];
const hairExamples = [hair1, hair2, hair3, hair4, hair5];

const emptyPhotos = () => new Array<PhotoRecord | null>(5).fill(null);

const createConsultationId = () =>
  `MB-WEB-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.random()
    .toString(16)
    .slice(2, 8)
    .toUpperCase()}`;

const cropAndCompressImage = (file: File, bodyPart: BodyPart, crop: CropConfig) =>
  new Promise<{ data: string; type: string; cropped: boolean }>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const aspectRatio = image.width / image.height;
      const isAlreadyTight =
        ((bodyPart === 'eyes' || bodyPart === 'lips') && aspectRatio >= 1.55) ||
        (bodyPart === 'nose' && aspectRatio >= 0.75 && aspectRatio <= 1.35);
      const effectiveCrop = isAlreadyTight ? { width: 1, height: 1, centerY: 0.5 } : crop;
      const sourceWidth = Math.round(image.width * effectiveCrop.width);
      const sourceHeight = Math.round(image.height * effectiveCrop.height);
      const sourceX = Math.max(0, Math.round((image.width - sourceWidth) / 2));
      const sourceY = Math.max(
        0,
        Math.min(image.height - sourceHeight, Math.round(image.height * effectiveCrop.centerY - sourceHeight / 2)),
      );
      const maxEdge = 1200;
      const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(sourceWidth * scale);
      canvas.height = Math.round(sourceHeight * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('IMAGE_CONTEXT_FAILED'));
        return;
      }
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve({
        data: canvas.toDataURL('image/jpeg', 0.82),
        type: 'image/jpeg',
        cropped: !isAlreadyTight,
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('IMAGE_LOAD_FAILED'));
    };
    image.src = objectUrl;
  });

export default function ConsultationUpload() {
  const [step, setStep] = useState<Step>(1);
  const [channel, setChannel] = useState<Channel>('free');
  const [bodyPart, setBodyPart] = useState<BodyPart>('hair');
  const [photos, setPhotos] = useState<Array<PhotoRecord | null>>(emptyPhotos);
  const [uploadStates, setUploadStates] = useState<string[]>(new Array(5).fill('＋ 点击上传'));
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [caseId, setCaseId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedPartConfig = partConfig[bodyPart];
  const activeAngles = bodyPart === 'hair' ? hairAngles : faceAngles;
  const activeExamples = bodyPart === 'hair' ? hairExamples : faceExamples;
  const allPhotosReady = photos.every(Boolean);
  const amount = channelPrices[channel];
  const paymentNote =
    amount > 0
      ? `本通道费用为 $${amount} USD。支付功能接入后，顾问会向您发送安全支付链接。`
      : '本次图文问诊免费，无需支付。';

  const steps = useMemo(
    () => [
      [1, '选择通道'],
      [2, '选择部位'],
      [3, '上传照片'],
      [4, '提交资料'],
    ] as const,
    [],
  );

  const goToStep = (nextStep: Step) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chooseChannel = (nextChannel: Channel) => {
    setChannel(nextChannel);
    goToStep(2);
  };

  const chooseBodyPart = (nextBodyPart: BodyPart) => {
    setBodyPart(nextBodyPart);
    setPhotos(emptyPhotos());
    setUploadStates(new Array(5).fill('＋ 点击上传'));
    goToStep(3);
  };

  const handlePhoto = async (fileList: FileList | null, index: number) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      window.alert('仅支持 JPG、PNG 或 WebP 图片。');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      window.alert('单张原始照片不能超过 15MB。');
      return;
    }

    setUploadStates((current) => current.map((value, itemIndex) => (itemIndex === index ? '正在处理...' : value)));
    try {
      const compressed = await cropAndCompressImage(file, bodyPart, selectedPartConfig.crop);
      setPhotos((current) =>
        current.map((value, itemIndex) =>
          itemIndex === index ? { data: compressed.data, type: compressed.type, angle: activeAngles[index][0] } : value,
        ),
      );
      setUploadStates((current) =>
        current.map((value, itemIndex) =>
          itemIndex === index
            ? compressed.cropped
              ? '✓ 已裁为必要范围 · 点击更换'
              : '✓ 必要范围已确认 · 点击更换'
            : value,
        ),
      );
    } catch {
      window.alert('照片处理失败，请换一张照片重试。');
      setUploadStates((current) => current.map((value, itemIndex) => (itemIndex === index ? '＋ 点击上传' : value)));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!allPhotosReady) {
      setFormError('请上传完整的 5 张照片。');
      return;
    }

    setSubmitting(true);
    setFormError('');
    await new Promise((resolve) => setTimeout(resolve, 350));
    setCaseId(createConsultationId());
    setSubmitting(false);
    goToStep(5);
  };

  return (
    <div className="consultation-upload">
      <div className="cu-security-bar">
        <div className="cu-secure-label">
          <span>✓</span> 隐私加密传输
        </div>
      </div>

      <main>
        <section className="cu-hero">
          <div className="cu-eyebrow">PRIVATE ONLINE CONSULTATION</div>
          <h1>
            开启您的专属
            <br />
            <em>美学咨询</em>
          </h1>
          <p>按照清晰指引上传照片，我们的医疗团队将根据您的真实情况提供专业建议。</p>
          <div className="cu-trust-row">
            <span>医疗团队评估</span>
            <i />
            <span>资料严格保密</span>
            <i />
            <span>全球患者服务</span>
          </div>
        </section>

        <section className="cu-portal" aria-live="polite">
          <nav className="cu-steps" aria-label="提交进度">
            {steps.map(([itemStep, label], index) => (
              <React.Fragment key={itemStep}>
                <button
                  type="button"
                  className={`cu-step ${step === itemStep ? 'active' : ''} ${step > itemStep ? 'complete' : ''}`}
                >
                  <b>{itemStep}</b>
                  <span>{label}</span>
                </button>
                {index < steps.length - 1 && <span className="cu-step-line" />}
              </React.Fragment>
            ))}
          </nav>

          <div className={`cu-panel ${step === 1 ? 'active' : ''}`}>
            <div className="cu-section-heading">
              <span>STEP 01</span>
              <h2>请选择问诊通道</h2>
              <p>三种方式均由专业团队保护您的个人资料。</p>
            </div>
            <div className="cu-channel-grid">
              <button className="cu-channel-card" type="button" onClick={() => chooseChannel('free')}>
                <span className="cu-card-tag">适合初步了解</span>
                <div className="cu-channel-icon">✦</div>
                <h3>免费图文问诊</h3>
                <div className="cu-price">免费</div>
                <p>获得初步方案、参考报价及建议手术方式。</p>
                <ul>
                  <li>专业顾问初筛</li>
                  <li>个性化方案建议</li>
                  <li>参考费用区间</li>
                </ul>
                <span className="cu-select-cta">
                  选择免费问诊 <b>→</b>
                </span>
              </button>

              <button className="cu-channel-card featured" type="button" onClick={() => setDoctorModalOpen(true)}>
                <span className="cu-card-tag">推荐</span>
                <div className="cu-doctor-profile">
                  <img src={doctorLi} alt="李医生" />
                  <span>
                    <b>李医生</b>
                    <small>公立三级医院烧伤整形科医师</small>
                  </span>
                </div>
                <h3>李医生视频面诊</h3>
                <div className="cu-price">
                  <sup>$</sup>49 <small>USD</small>
                </div>
                <p>由指定的李医生进行一对一专业面诊。</p>
                <div className="cu-doctor-stats">
                  <span>
                    <b>7000+</b>
                    <small>累计面诊</small>
                  </span>
                  <span>
                    <b>10+ 年</b>
                    <small>美学咨询培训</small>
                  </span>
                </div>
                <ul>
                  <li>医生本人专业评估</li>
                  <li>一对一视频深度沟通</li>
                  <li>个性化改善方案</li>
                </ul>
                <span className="cu-select-cta">
                  查看医生详情 <b>→</b>
                </span>
              </button>

              <button className="cu-channel-card" type="button" onClick={() => chooseChannel('custom-doctor')}>
                <span className="cu-card-tag">全球专家</span>
                <div className="cu-channel-icon">＋</div>
                <h3>指定医院 / 医生</h3>
                <div className="cu-price">
                  <sup>$</sup>199 <small>USD</small>
                </div>
                <p>指定您希望咨询的医院或整形医生。</p>
                <ul>
                  <li>按您的要求对接</li>
                  <li>跨院专家咨询</li>
                  <li>专人协调安排</li>
                </ul>
                <span className="cu-select-cta">
                  指定专家问诊 <b>→</b>
                </span>
              </button>
            </div>
          </div>

          <div className={`cu-panel ${step === 2 ? 'active' : ''}`}>
            <div className="cu-section-heading">
              <span>STEP 02</span>
              <h2>您希望改善哪个部位？</h2>
              <p>请选择一个主要咨询部位，我们会展示对应的拍摄要求。</p>
            </div>
            <div className="cu-body-parts">
              {[
                ['eyes', '◉', '眼部', '双眼皮 · 眼袋 · 提眉'],
                ['nose', '△', '鼻部', '隆鼻 · 鼻综合 · 鼻修复'],
                ['lips', '≈', '口唇', '唇形 · 人中 · 嘴角'],
                ['face', '○', '面部轮廓', '下颌 · 颧骨 · 脂肪'],
                ['hair', '⌁', '植发', '发际线 · 头顶 · 加密'],
                ['body', '◇', '身体塑形', '胸部 · 腰腹 · 四肢'],
                ['other', '＋', '其他部位', '请选择后在备注中说明'],
              ].map(([part, icon, title, description]) => (
                <button key={part} type="button" onClick={() => chooseBodyPart(part as BodyPart)}>
                  <span className="cu-part-icon">{icon}</span>
                  <b>{title}</b>
                  <small>{description}</small>
                </button>
              ))}
            </div>
            <div className="cu-panel-actions">
              <button className="cu-back-btn" type="button" onClick={() => goToStep(1)}>
                ← 返回
              </button>
            </div>
          </div>

          <div className={`cu-panel ${step === 3 ? 'active' : ''}`}>
            <div className="cu-section-heading compact">
              <span>STEP 03</span>
              <h2>请上传 5 张清晰照片</h2>
              <p>{selectedPartConfig.guidance}</p>
            </div>
            <div className="cu-privacy-tip">
              <b>最小必要范围</b>
              <span>{selectedPartConfig.privacy}</span>
            </div>
            <div className="cu-photo-grid">
              {activeAngles.map(([angle, title, subtitle], index) => {
                const photo = photos[index];
                return (
                  <div className="cu-photo-slot" key={angle}>
                    <input
                      className="cu-photo-input"
                      id={`photo-${index}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => handlePhoto(event.currentTarget.files, index)}
                    />
                    <label className={`cu-photo-label ${photo ? 'has-photo' : ''}`} htmlFor={`photo-${index}`}>
                      <span
                        className={`cu-pose-guide real-example example-${bodyPart}`}
                        style={{ backgroundImage: `url("${photo?.data || activeExamples[index]}")` }}
                      />
                      <span className="cu-photo-meta">
                        <b>{title}</b>
                        <small>{subtitle}</small>
                      </span>
                      <span className="cu-upload-state">{uploadStates[index]}</span>
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="cu-quality-list">
              <span>✓ 使用自然光或明亮室内光</span>
              <span>✓ 保持镜头与拍摄部位平齐</span>
              <span>× 请勿使用滤镜、美颜或截图</span>
            </div>
            <div className="cu-panel-actions">
              <button className="cu-back-btn" type="button" onClick={() => goToStep(2)}>
                ← 返回
              </button>
              <button className="cu-primary-btn" type="button" disabled={!allPhotosReady} onClick={() => goToStep(4)}>
                下一步：填写资料 →
              </button>
            </div>
          </div>

          <div className={`cu-panel ${step === 4 ? 'active' : ''}`}>
            <div className="cu-section-heading compact">
              <span>STEP 04</span>
              <h2>最后，请留下联系信息</h2>
              <p>医疗顾问将通过您选择的联系方式跟进。</p>
            </div>
            <form className="cu-form" onSubmit={handleSubmit}>
              <div className="cu-form-grid">
                <label>
                  姓名 / 称呼 <em>*</em>
                  <input name="name" required placeholder="请输入您的称呼" />
                </label>
                <label>
                  年龄范围
                  <select name="ageRange">
                    <option>18-25</option>
                    <option>26-35</option>
                    <option>36-45</option>
                    <option>46-55</option>
                    <option>56+</option>
                  </select>
                </label>
                <label>
                  国家 / 地区
                  <input name="country" placeholder="例如：美国、加拿大" />
                </label>
                <label>
                  微信 / WhatsApp / 邮箱 <em>*</em>
                  <input name="contact" required placeholder="请输入常用联系方式" />
                </label>
                <label className="cu-full">
                  主要诉求及既往手术经历
                  <textarea name="concerns" rows={4} placeholder="请描述您希望改善的问题、做过的相关手术及时间" />
                </label>
                <label className={`cu-full cu-custom-doctor-field ${channel === 'custom-doctor' ? 'visible' : ''}`}>
                  指定医院或医生名称 <em>*</em>
                  <input
                    name="preferredHospitalOrDoctor"
                    required={channel === 'custom-doctor'}
                    placeholder="请输入医院或医生名称"
                  />
                </label>
              </div>
              <label className="cu-consent">
                <input type="checkbox" name="consent" required />
                <span>
                  我已阅读并同意 Medora Beauty 为本次医疗咨询收集和处理我提交的资料及照片。<em>*</em>
                </span>
              </label>
              <div className="cu-order-summary">
                <span>本次问诊</span>
                <b>{channelNames[channel]}</b>
                <span>应付金额</span>
                <strong>${amount} USD</strong>
              </div>
              <div className="cu-form-error" role="alert">
                {formError}
              </div>
              <div className="cu-panel-actions">
                <button className="cu-back-btn" type="button" onClick={() => goToStep(3)}>
                  ← 返回
                </button>
                <button className="cu-primary-btn" type="submit" disabled={submitting}>
                  {submitting ? '正在安全提交...' : '安全提交资料'}
                </button>
              </div>
            </form>
          </div>

          <div className={`cu-panel cu-success-panel ${step === 5 ? 'active' : ''}`}>
            <div className="cu-success-check">✓</div>
            <span className="cu-eyebrow">SUBMISSION COMPLETE</span>
            <h2>资料已安全提交</h2>
            <p>
              您的咨询编号为 <b>{caseId}</b>。医疗顾问会尽快通过您留下的联系方式与您联系。
            </p>
            <div className="cu-payment-note">{paymentNote}</div>
            <Link to="/" className="cu-primary-btn cu-link-btn">
              返回 Medora Beauty 官网
            </Link>
          </div>
        </section>
      </main>

      {doctorModalOpen && (
        <div className="cu-modal-backdrop" role="presentation" onMouseDown={() => setDoctorModalOpen(false)}>
          <div
            className="cu-doctor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-li-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cu-doctor-modal-shell">
              <button className="cu-modal-close" type="button" aria-label="关闭医生详情" onClick={() => setDoctorModalOpen(false)}>
                ×
              </button>
              <div className="cu-doctor-modal-hero">
                <img src={doctorLi} alt="李医生个人照片" />
                <div>
                  <span className="cu-modal-kicker">MEDORA APPOINTED CONSULTANT</span>
                  <h2 id="doctor-li-modal-title">李医生</h2>
                  <p className="cu-modal-role">国内公立三级医院烧伤整形科医师</p>
                  <div className="cu-modal-badges">
                    <span>
                      <b>7000+</b> 累计面诊患者
                    </span>
                    <span>
                      <b>10+ 年</b> 美学咨询与培训
                    </span>
                    <span>
                      <b>$49</b> 一对一视频面诊
                    </span>
                  </div>
                </div>
              </div>
              <div className="cu-doctor-modal-content">
                <section>
                  <span className="cu-modal-section-label">专业理念</span>
                  <h3>从医学解剖出发，提供真实、自然的改善建议</h3>
                  <p>
                    李医生长期从事医学美容面诊、美学设计咨询及轻医美培训。她以医学解剖理论为基础，结合求美者的面部基础、比例与个人诉求，提供客观、自然且具有可执行性的面部调整建议。
                  </p>
                  <div className="cu-modal-service">
                    <b>本次面诊包括</b>
                    <span>面部基础与诉求分析</span>
                    <span>适合的改善方式及手术建议</span>
                    <span>治疗顺序、恢复期与参考报价说明</span>
                  </div>
                </section>
                <section>
                  <span className="cu-modal-section-label">专业经历</span>
                  <div className="cu-modal-timeline">
                    <article>
                      <time>2022.03 至今</time>
                      <div>
                        <b>国内公立三级医院</b>
                        <p>就职烧伤整形科，任医师。</p>
                      </div>
                    </article>
                    <article>
                      <time>2019.01-2021.12</time>
                      <div>
                        <b>深圳娜美整形医疗门诊</b>
                        <p>参与创立门诊并任医学美容科医师。</p>
                      </div>
                    </article>
                    <article>
                      <time>2016.12-2018.12</time>
                      <div>
                        <b>沈阳觉美医疗美容门诊</b>
                        <p>创立门诊并任整形咨询部主任。</p>
                      </div>
                    </article>
                    <article>
                      <time>2014.09-2016.11</time>
                      <div>
                        <b>北京华尚整形医院</b>
                        <p>任整形咨询师。</p>
                      </div>
                    </article>
                    <article>
                      <time>2015.09 至今</time>
                      <div>
                        <b>美学设计与轻医美培训</b>
                        <p>从事美学设计咨询师培训及轻医美培训讲师工作。</p>
                      </div>
                    </article>
                  </div>
                </section>
              </div>
              <div className="cu-doctor-modal-footer">
                <p>
                  <b>$49 USD</b>
                  <span>李医生一对一视频面诊</span>
                </p>
                <button
                  className="cu-primary-btn"
                  type="button"
                  onClick={() => {
                    setDoctorModalOpen(false);
                    chooseChannel('doctor-li');
                  }}
                >
                  选择李医生问诊 →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="cu-disclaimer">
        <span>© 2026 Medora Beauty</span>
        <span>本服务不能替代医生面对面诊断，最终方案以医生正式评估为准。</span>
      </footer>
    </div>
  );
}
