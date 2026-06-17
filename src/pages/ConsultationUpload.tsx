import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getConsultationUploadCopy,
  type ConsultationBodyPart,
  type ConsultationChannel,
} from '@/i18n/consultationUploadCopy';
import {
  crmApi,
  getPreferredPatientConversationId,
  isAdminPatientConversation,
  uploadFileToSignedUrl,
  type Conversation,
} from '@/services/crmApiClient';
import doctorLi from '@/assets/consultation-upload/doctor-li.jpg';
import bodyIcon from '@/assets/consultation-upload/body-icons/body.png';
import eyesIcon from '@/assets/consultation-upload/body-icons/eyes.png';
import faceIcon from '@/assets/consultation-upload/body-icons/face.png';
import hairIcon from '@/assets/consultation-upload/body-icons/hair.png';
import lipsIcon from '@/assets/consultation-upload/body-icons/lips.png';
import noseIcon from '@/assets/consultation-upload/body-icons/nose.png';
import otherIcon from '@/assets/consultation-upload/body-icons/other.png';
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

const channelPrices: Record<ConsultationChannel, number> = {
  free: 0,
  'doctor-li': 49,
  'custom-doctor': 199,
};

const bodyPartIcons: Record<ConsultationBodyPart, string> = {
  eyes: eyesIcon,
  nose: noseIcon,
  lips: lipsIcon,
  face: faceIcon,
  hair: hairIcon,
  body: bodyIcon,
  other: otherIcon,
};

const partCropConfig: Record<ConsultationBodyPart, CropConfig> = {
  eyes: {
    width: 0.92,
    height: 0.24,
    centerY: 0.34,
  },
  nose: {
    width: 0.58,
    height: 0.38,
    centerY: 0.47,
  },
  lips: {
    width: 0.72,
    height: 0.27,
    centerY: 0.64,
  },
  face: {
    width: 0.84,
    height: 0.88,
    centerY: 0.47,
  },
  hair: {
    width: 0.94,
    height: 0.7,
    centerY: 0.29,
  },
  body: {
    width: 0.86,
    height: 0.86,
    centerY: 0.5,
  },
  other: {
    width: 0.86,
    height: 0.86,
    centerY: 0.5,
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

const BEAUTY_UPLOAD_MARKER = '[Beauty Consultation Upload]';

const cropAndCompressImage = (file: File, bodyPart: ConsultationBodyPart, crop: CropConfig) =>
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

function dataUrlToFile(dataUrl: string, fileName: string, mimeType: string): File {
  const [header, payload] = dataUrl.split(',');
  const type = header.match(/data:(.*?);/)?.[1] || mimeType || 'image/jpeg';
  const binary = window.atob(payload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], fileName, { type });
}

function selectBeautyUploadConversation(conversations: Conversation[], caseId: string): Conversation | null {
  const caseConversations = conversations.filter((conversation) =>
    !conversation.caseId || conversation.caseId === caseId,
  );
  return caseConversations.find(isAdminPatientConversation)
    ?? caseConversations.find((conversation) => conversation.id.startsWith('widget-chat:'))
    ?? caseConversations.find((conversation) => conversation.id === getPreferredPatientConversationId(caseConversations))
    ?? null;
}

async function uploadBeautyAttachment(conversationId: string, file: File) {
  const init = await crmApi.initConversationAttachmentUpload({
    conversationId,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'image/jpeg',
  });

  await uploadFileToSignedUrl(init.upload.uploadUrl, file, file.type || 'image/jpeg');

  return init.asset;
}

export default function ConsultationUpload() {
  const { currentLanguage } = useLanguage();
  const { patient } = usePatientAuth();
  const { caseId: entryCaseId } = usePatientEntry();
  const copy = useMemo(() => getConsultationUploadCopy(currentLanguage), [currentLanguage]);
  const [step, setStep] = useState<Step>(1);
  const [channel, setChannel] = useState<ConsultationChannel>('free');
  const [bodyPart, setBodyPart] = useState<ConsultationBodyPart>('hair');
  const [photos, setPhotos] = useState<Array<PhotoRecord | null>>(emptyPhotos);
  const [uploadStates, setUploadStates] = useState<string[]>(new Array(5).fill(copy.uploadDefault));
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [caseId, setCaseId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedPartConfig = copy.parts[bodyPart];
  const activeAngles = bodyPart === 'hair' ? hairAngles : faceAngles;
  const activeAngleCopy = bodyPart === 'hair' ? copy.hairAngles : copy.faceAngles;
  const activeExamples = bodyPart === 'hair' ? hairExamples : faceExamples;
  const allPhotosReady = photos.every(Boolean);
  const amount = channelPrices[channel];
  const paymentNote = amount > 0 ? copy.paymentPaid(amount) : copy.paymentFree;
  const crmCaseId = entryCaseId ?? patient?.caseId ?? '';
  const hasUploadSession = Boolean(patient?.id && crmCaseId);

  const steps = useMemo(
    () => [
      [1, copy.steps[0]],
      [2, copy.steps[1]],
      [3, copy.steps[2]],
      [4, copy.steps[3]],
    ] as const,
    [copy.steps],
  );

  const channelCards = useMemo(
    () =>
      (['free', 'doctor-li', 'custom-doctor'] as const).map((id) => ({
        id,
        ...copy.channels[id],
      })),
    [copy.channels],
  );

  const bodyPartCards = useMemo(
    () =>
      (['eyes', 'nose', 'lips', 'face', 'hair', 'body', 'other'] as const).map((id) => ({
        id,
        icon: bodyPartIcons[id],
        ...copy.parts[id],
      })),
    [copy.parts],
  );

  useEffect(() => {
    setUploadStates((current) =>
      current.map((value, index) => (photos[index] ? value : copy.uploadDefault)),
    );
  }, [copy.uploadDefault, photos]);

  const goToStep = (nextStep: Step) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chooseChannel = (nextChannel: ConsultationChannel) => {
    setChannel(nextChannel);
    goToStep(2);
  };

  const chooseBodyPart = (nextBodyPart: ConsultationBodyPart) => {
    setBodyPart(nextBodyPart);
    setPhotos(emptyPhotos());
    setUploadStates(new Array(5).fill(copy.uploadDefault));
    goToStep(3);
  };

  const handlePhoto = async (fileList: FileList | null, index: number) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      window.alert(copy.fileTypeAlert);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      window.alert(copy.fileSizeAlert);
      return;
    }

    setUploadStates((current) => current.map((value, itemIndex) => (itemIndex === index ? copy.uploadProcessing : value)));
    try {
      const compressed = await cropAndCompressImage(file, bodyPart, partCropConfig[bodyPart]);
      setPhotos((current) =>
        current.map((value, itemIndex) =>
          itemIndex === index ? { data: compressed.data, type: compressed.type, angle: activeAngles[index][0] } : value,
        ),
      );
      setUploadStates((current) =>
        current.map((value, itemIndex) =>
          itemIndex === index
            ? compressed.cropped
              ? `✓ ${copy.uploadCropped}`
              : `✓ ${copy.uploadConfirmed}`
            : value,
        ),
      );
    } catch {
      window.alert(copy.imageFailedAlert);
      setUploadStates((current) => current.map((value, itemIndex) => (itemIndex === index ? copy.uploadDefault : value)));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!allPhotosReady) {
      setFormError(copy.incompletePhotosError);
      return;
    }
    if (!patient?.id || !crmCaseId) {
      setFormError(copy.sessionRequiredDescription);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const conversations = await crmApi.getConversations();
      const targetConversation = selectBeautyUploadConversation(conversations, crmCaseId);

      if (!targetConversation) {
        throw new Error('CRM conversation is not ready yet. Please refresh and try again in a moment.');
      }

      const formData = new FormData(form);
      const notes = String(formData.get('concerns') ?? '').trim();
      const preferredHospitalOrDoctor = String(formData.get('preferredHospitalOrDoctor') ?? '').trim();
      const ageRange = String(formData.get('ageRange') ?? '').trim();
      const country = String(formData.get('country') ?? '').trim();
      const contact = String(formData.get('contact') ?? '').trim();
      const displayName = String(formData.get('name') ?? '').trim();
      const uploadedPhotos = photos.filter((photo): photo is PhotoRecord => Boolean(photo));
      const files = uploadedPhotos.map((photo, index) => {
        const angleCopy = activeAngleCopy[index];
        const safeAngle = angleCopy.title
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase();
        return dataUrlToFile(
          photo.data,
          `beauty-${bodyPart}-${safeAngle || `view-${index + 1}`}.jpg`,
          photo.type,
        );
      });
      const attachments = await Promise.all(
        files.map((file) => uploadBeautyAttachment(targetConversation.id, file)),
      );
      const photoLabels = uploadedPhotos.map((_, index) => activeAngleCopy[index].title);
      const message = [
        BEAUTY_UPLOAD_MARKER,
        `Case ID: ${crmCaseId}`,
        `Patient name: ${displayName}`,
        `Contact: ${contact}`,
        `Channel: ${copy.channels[channel].title}`,
        `Area: ${selectedPartConfig.name}`,
        `Age range: ${ageRange || 'Not provided'}`,
        `Country / region: ${country || 'Not provided'}`,
        `Preferred hospital / doctor: ${preferredHospitalOrDoctor || 'Not provided'}`,
        `Five views: ${photoLabels.join(', ')}`,
        notes ? `Goals / history: ${notes}` : 'Goals / history: Not provided',
        `Submitted from: medorabeauty.com/consultation-upload`,
      ].join('\n');

      await crmApi.sendMessage(targetConversation.id, message, {
        messageType: 'IMAGE',
        attachments,
      });

      setCaseId(crmCaseId || createConsultationId());
      goToStep(5);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to submit to CRM. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="consultation-upload">
      <div className="cu-security-bar">
        <div className="cu-secure-label">
          <span>✓</span> {copy.secureLabel}
        </div>
      </div>

      <main>
        <section className="cu-hero">
          <div className="cu-eyebrow">{copy.heroEyebrow}</div>
          <h1>
            {copy.heroTitle}{' '}
            <br />
            <em>{copy.heroAccent}</em>
          </h1>
          <p>{copy.heroDescription}</p>
          <div className="cu-trust-row">
            {copy.trustItems.map((item, index) => (
              <React.Fragment key={item}>
                <span>{item}</span>
                {index < copy.trustItems.length - 1 && <i />}
              </React.Fragment>
            ))}
          </div>
        </section>

        {!hasUploadSession ? (
          <section className="cu-portal" aria-live="polite">
            <div className="cu-panel active">
              <div className="cu-section-heading">
                <span>{copy.stepNumbers[0]}</span>
                <h2>{copy.sessionRequiredTitle}</h2>
                <p>{copy.sessionRequiredDescription}</p>
              </div>
              <div className="cu-panel-actions">
                <Link to="/procedure/videos" className="cu-primary-btn cu-link-btn">
                  {copy.sessionRequiredCta}
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="cu-portal" aria-live="polite">
            <nav className="cu-steps" aria-label={copy.progressLabel}>
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
              <span>{copy.stepNumbers[0]}</span>
              <h2>{copy.step1Title}</h2>
              <p>{copy.step1Subtitle}</p>
            </div>
            <div className="cu-channel-grid">
              {channelCards.map((card) => (
                <button
                  className={`cu-channel-card ${card.id === 'doctor-li' ? 'featured' : ''}`}
                  type="button"
                  key={card.id}
                  onClick={() => (card.id === 'doctor-li' ? setDoctorModalOpen(true) : chooseChannel(card.id))}
                >
                  <span className="cu-card-tag">{card.tag}</span>
                  {card.id === 'doctor-li' ? (
                    <div className="cu-doctor-profile">
                      <img src={doctorLi} alt={copy.doctorName} />
                      <span>
                        <b>{copy.doctorName}</b>
                        <small>{copy.doctorRoleShort}</small>
                      </span>
                    </div>
                  ) : (
                    <div className="cu-channel-icon">{card.id === 'free' ? '☏' : '⌂'}</div>
                  )}
                  <h3>{card.title}</h3>
                  <div className="cu-price">{card.price}</div>
                  <p>{card.description}</p>
                  {card.id === 'doctor-li' && (
                    <div className="cu-doctor-stats">
                      <span>
                        <b>{copy.doctorStatCases}</b>
                        <small>{copy.doctorStatCasesLabel}</small>
                      </span>
                      <span>
                        <b>{copy.doctorStatYears}</b>
                        <small>{copy.doctorStatYearsLabel}</small>
                      </span>
                    </div>
                  )}
                  <ul>
                    {card.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <span className="cu-select-cta">
                    {card.cta} <b>→</b>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={`cu-panel ${step === 2 ? 'active' : ''}`}>
            <div className="cu-section-heading">
              <span>{copy.stepNumbers[1]}</span>
              <h2>{copy.step2Title}</h2>
              <p>{copy.step2Subtitle}</p>
            </div>
            <div className="cu-body-parts">
              {bodyPartCards.map((part) => (
                <button key={part.id} type="button" onClick={() => chooseBodyPart(part.id)}>
                  <span className="cu-part-icon">
                    <img src={part.icon} alt={part.iconAlt} />
                  </span>
                  <b>{part.name}</b>
                  <small>{part.description}</small>
                </button>
              ))}
            </div>
            <div className="cu-panel-actions">
              <button className="cu-back-btn" type="button" onClick={() => goToStep(1)}>
                ← {copy.back}
              </button>
            </div>
          </div>

          <div className={`cu-panel ${step === 3 ? 'active' : ''}`}>
            <div className="cu-section-heading compact">
              <span>{copy.stepNumbers[2]}</span>
              <h2>{copy.step3Title}</h2>
              <p>{selectedPartConfig.guidance}</p>
            </div>
            <div className="cu-privacy-tip">
              <b>{copy.minimumScopeTitle}</b>
              <span>{selectedPartConfig.privacy}</span>
            </div>
            <div className="cu-photo-grid">
              {activeAngles.map(([angle], index) => {
                const photo = photos[index];
                const angleCopy = activeAngleCopy[index];
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
                        <b>{angleCopy.title}</b>
                        <small>{angleCopy.subtitle}</small>
                      </span>
                      <span className="cu-upload-state">{uploadStates[index]}</span>
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="cu-quality-list">
              {copy.qualityItems.map((item, index) => (
                <span key={item}>{index < 2 ? '✓' : '×'} {item}</span>
              ))}
            </div>
            <div className="cu-panel-actions">
              <button className="cu-back-btn" type="button" onClick={() => goToStep(2)}>
                ← {copy.back}
              </button>
              <button className="cu-primary-btn" type="button" disabled={!allPhotosReady} onClick={() => goToStep(4)}>
                {copy.nextToForm} →
              </button>
            </div>
          </div>

          <div className={`cu-panel ${step === 4 ? 'active' : ''}`}>
            <div className="cu-section-heading compact">
              <span>{copy.stepNumbers[3]}</span>
              <h2>{copy.step4Title}</h2>
              <p>{copy.step4Subtitle}</p>
            </div>
            <form className="cu-form" onSubmit={handleSubmit}>
              <div className="cu-form-grid">
                <label>
                  {copy.nameLabel} <em>*</em>
                  <input name="name" required placeholder={copy.namePlaceholder} />
                </label>
                <label>
                  {copy.ageLabel}
                  <select name="ageRange">
                    <option>18-25</option>
                    <option>26-35</option>
                    <option>36-45</option>
                    <option>46-55</option>
                    <option>56+</option>
                  </select>
                </label>
                <label>
                  {copy.countryLabel}
                  <input name="country" placeholder={copy.countryPlaceholder} />
                </label>
                <label>
                  {copy.contactLabel} <em>*</em>
                  <input name="contact" required placeholder={copy.contactPlaceholder} />
                </label>
                <label className="cu-full">
                  {copy.concernsLabel}
                  <textarea name="concerns" rows={4} placeholder={copy.concernsPlaceholder} />
                </label>
                <label className={`cu-full cu-custom-doctor-field ${channel === 'custom-doctor' ? 'visible' : ''}`}>
                  {copy.preferredDoctorLabel} <em>*</em>
                  <input
                    name="preferredHospitalOrDoctor"
                    required={channel === 'custom-doctor'}
                    placeholder={copy.preferredDoctorPlaceholder}
                  />
                </label>
              </div>
              <label className="cu-consent">
                <input type="checkbox" name="consent" required />
                <span>
                  {copy.consent}<em>*</em>
                </span>
              </label>
              <div className="cu-order-summary">
                <span>{copy.orderChannelLabel}</span>
                <b>{copy.channels[channel].title}</b>
                <span>{copy.orderAmountLabel}</span>
                <strong>${amount} USD</strong>
              </div>
              <div className="cu-form-error" role="alert">
                {formError}
              </div>
              <div className="cu-panel-actions">
                <button className="cu-back-btn" type="button" onClick={() => goToStep(3)}>
                  ← {copy.back}
                </button>
                <button className="cu-primary-btn" type="submit" disabled={submitting}>
                  {submitting ? copy.submitBusy : copy.submitIdle}
                </button>
              </div>
            </form>
          </div>

          <div className={`cu-panel cu-success-panel ${step === 5 ? 'active' : ''}`}>
            <div className="cu-success-check">✓</div>
            <span className="cu-eyebrow">{copy.successEyebrow}</span>
            <h2>{copy.successTitle}</h2>
            <p>
              {copy.successMessagePrefix} <b>{caseId}</b>. {copy.successMessageSuffix}
            </p>
            <div className="cu-payment-note">{paymentNote}</div>
            <Link to="/" className="cu-primary-btn cu-link-btn">
              {copy.returnHome}
            </Link>
          </div>
        </section>
        )}
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
              <button className="cu-modal-close" type="button" aria-label={copy.modalCloseLabel} onClick={() => setDoctorModalOpen(false)}>
                ×
              </button>
              <div className="cu-doctor-modal-hero">
                <img src={doctorLi} alt={copy.doctorName} />
                <div>
                  <span className="cu-modal-kicker">{copy.modalKicker}</span>
                  <h2 id="doctor-li-modal-title">{copy.doctorName}</h2>
                  <p className="cu-modal-role">{copy.doctorRoleFull}</p>
                  <div className="cu-modal-badges">
                    <span>
                      <b>{copy.doctorStatCases}</b> {copy.doctorStatCasesLabel}
                    </span>
                    <span>
                      <b>{copy.doctorStatYears}</b> {copy.doctorStatYearsLabel}
                    </span>
                    <span>
                      <b>$49</b> {copy.modalFooter}
                    </span>
                  </div>
                </div>
              </div>
              <div className="cu-doctor-modal-content">
                <section>
                  <span className="cu-modal-section-label">{copy.modalPhilosophyLabel}</span>
                  <h3>{copy.modalPhilosophyTitle}</h3>
                  <p>{copy.modalPhilosophyBody}</p>
                  <div className="cu-modal-service">
                    <b>{copy.modalIncludesTitle}</b>
                    {copy.modalIncludes.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </section>
                <section>
                  <span className="cu-modal-section-label">{copy.modalExperienceLabel}</span>
                  <div className="cu-modal-timeline">
                    {copy.modalTimeline.map((item) => (
                      <article key={`${item.time}-${item.title}`}>
                        <time>{item.time}</time>
                        <div>
                          <b>{item.title}</b>
                          <p>{item.body}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
              <div className="cu-doctor-modal-footer">
                <p>
                  <b>$49 USD</b>
                  <span>{copy.modalFooter}</span>
                </p>
                <button
                  className="cu-primary-btn"
                  type="button"
                  onClick={() => {
                    setDoctorModalOpen(false);
                    chooseChannel('doctor-li');
                  }}
                >
                  {copy.modalChoose} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="cu-disclaimer">
        <span>{copy.footerCopyright}</span>
        <span>{copy.disclaimer}</span>
      </footer>
    </div>
  );
}
