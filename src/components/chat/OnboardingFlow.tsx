import { useRef, useEffect, useState, type KeyboardEvent, type ChangeEvent } from 'react';
import { CheckCircle2, MessageSquare, Paperclip, RefreshCw, Send } from 'lucide-react';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { useLanguage, type LanguageCode } from '@/contexts/LanguageContext';
import { usePatientConversations } from '@/hooks/usePatientConversations';
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation';
import { MessageInput } from '../messaging/MessageInput';
import { ContactInfoStep } from './ContactInfoStep';
import { HospitalCards } from './HospitalCards';
import type { PreBootstrapMessage } from '@/services/patientEntryStorage';
import { isAdminPatientConversation, type Conversation } from '@/services/crmApiClient';

// ---------------------------------------------------------------------------
// Pre-bootstrap message bubble
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: PreBootstrapMessage }) {
  const isUser = message.role === 'patient';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-gold-600 text-white rounded-br-sm'
            : 'bg-stone-100 text-stone-800 rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pre-bootstrap message input (no conversationId yet)
// ---------------------------------------------------------------------------

function PreBootstrapInput() {
  const { dt } = useDashboardTranslation();
  const { appendPreBootstrapMessage } = usePatientEntry();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = content.trim();
    if (!text) return;
    appendPreBootstrapMessage({
      clientId: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: 'patient',
      content: text,
      createdAt: new Date().toISOString(),
    });
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div className="px-4 py-3 border-t border-stone-200 shrink-0 bg-white">
      <div className="flex items-end gap-2 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-200 focus-within:border-gold-500 transition-colors">
        <button
          type="button"
          disabled
          aria-label={dt('messageAttachFiles')}
          title={dt('chatAttachUnavailable')}
          className="rounded-full p-2 text-stone-300"
        >
          <Paperclip size={16} />
        </button>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={dt('messagePlaceholder')}
          rows={1}
          className="flex-1 bg-transparent outline-none text-sm text-stone-700 placeholder-stone-400 resize-none max-h-[120px]"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          aria-label={dt('messageSend')}
          className={`p-2 rounded-full transition-colors shrink-0 ${
            content.trim()
              ? 'bg-gold-600 text-white hover:bg-gold-700'
              : 'bg-stone-200 text-stone-400'
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main OnboardingFlow
// ---------------------------------------------------------------------------

interface OnboardingFlowProps {
  onClose?: () => void;
  onComplete?: (result: { patientId: string; caseId: string }) => void;
  showPreBootstrapInput?: boolean;
}

function SubmittedDetailsCard() {
  const { dt } = useDashboardTranslation();
  const { patient } = usePatientAuth();
  const { profileDraft } = usePatientEntry();

  const mergedProfile = {
    name: profileDraft.name.trim() || patient?.name || '',
    email: profileDraft.email.trim() || patient?.email || '',
    disease: profileDraft.disease.trim() || '',
    destination: profileDraft.destination.trim() || '',
  };

  const rows = [
    [dt('chatName').replace(' *', ''), mergedProfile.name],
    [dt('emailAddress'), mergedProfile.email],
    [dt('chatConditionProcedure'), mergedProfile.disease],
    [dt('chatDestination'), mergedProfile.destination],
  ].filter(([, value]) => value.trim() !== '');

  return (
    <div className="mx-3 my-2 rounded-[26px] border border-stone-200 bg-white px-5 py-5 shadow-[0_22px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-stone-900">{dt('chatSubmittedDetails')}</div>
          <p className="mt-1 text-sm text-stone-500">
            {dt('chatSubmittedDetailsDescription')}
          </p>
          <div className="mt-4 space-y-2">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[130px_1fr] gap-3 text-sm leading-6">
                <span className="text-stone-500">{label}:</span>
                <span className="font-medium text-stone-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type MaterialCollectionCopy = {
  rulesTitle: string;
  rulesBody: string;
  consentLabel: string;
  materialsTitle: string;
  materialsLead: string;
  materials: string[];
  uploadPrompt: string;
  waitingForConversation: string;
  noConversation: string;
  messagePlaceholder: string;
  attachFilesLabel: string;
  sendLabel: string;
};

const MATERIAL_COLLECTION_COPY: Record<LanguageCode, MaterialCollectionCopy> = {
  en: {
    rulesTitle: 'Please confirm our service rules',
    rulesBody: 'Medora is not an emergency service. If symptoms are urgent or rapidly worsening, please seek local emergency care first. Our team reviews the case materials you submit and follows up through CRM.',
    consentLabel: 'I understand and agree to these rules.',
    materialsTitle: 'What materials can you upload?',
    materialsLead: 'Upload or describe any materials you already have. The text and files go directly into your CRM case for the human team.',
    materials: ['Diagnosis or referral note', 'CT, MRI, X-ray, ultrasound, or imaging report', 'Pathology report', 'Blood test or lab report', 'Discharge summary', 'Medication list', 'Prior treatment or surgery summary'],
    uploadPrompt: 'After confirming, use the box below to upload files or describe what you have.',
    waitingForConversation: 'Preparing your CRM case workspace...',
    noConversation: 'Your case was created, but the CRM conversation is not ready yet. Please close and reopen this panel in a moment.',
    messagePlaceholder: 'Describe your available records or attach files...',
    attachFilesLabel: 'Attach medical files',
    sendLabel: 'Send materials to CRM',
  },
  zh: {
    rulesTitle: '请先确认服务规则',
    rulesBody: 'Medora 不是急诊服务。如果症状紧急或快速恶化，请先在当地寻求急诊或紧急医疗帮助。我们的人工作业团队会审核您提交到 CRM case 里的资料，并继续跟进。',
    consentLabel: '我已理解并同意以上规则。',
    materialsTitle: '您现在有什么资料可以上传？',
    materialsLead: '请上传或文字说明您已有的资料。所有文字和文件都会直接进入 CRM v2 的 case，供人工团队查看。',
    materials: ['诊断证明或转诊记录', 'CT、MRI、X 光、超声等影像报告', '病理报告', '血液检查或其他检验报告', '出院小结', '当前用药清单', '既往治疗或手术记录'],
    uploadPrompt: '确认规则后，可在下方上传文件或说明您手头有什么资料。',
    waitingForConversation: '正在准备 CRM 病例工作区...',
    noConversation: '病例已建立，但 CRM 对话暂时还没准备好。请稍后关闭并重新打开此窗口。',
    messagePlaceholder: '请说明已有资料，或直接添加附件...',
    attachFilesLabel: '添加医疗资料附件',
    sendLabel: '发送资料到 CRM',
  },
  es: {
    rulesTitle: 'Confirme primero nuestras reglas de servicio',
    rulesBody: 'Medora no es un servicio de emergencia. Si los síntomas son urgentes o empeoran rápidamente, busque atención local de emergencia primero. Nuestro equipo revisará los materiales enviados en su caso de CRM.',
    consentLabel: 'Entiendo y acepto estas reglas.',
    materialsTitle: 'Qué materiales puede subir?',
    materialsLead: 'Suba o describa los materiales que ya tiene. El texto y los archivos irán directamente a su caso de CRM para revisión humana.',
    materials: ['Diagnóstico o derivación', 'Informe de CT, MRI, rayos X, ultrasonido u otra imagen', 'Informe de patología', 'Análisis de sangre o laboratorio', 'Resumen de alta', 'Lista de medicamentos', 'Resumen de tratamientos o cirugías previas'],
    uploadPrompt: 'Después de confirmar, use el cuadro de abajo para subir archivos o describir lo que tiene.',
    waitingForConversation: 'Preparando su espacio de caso en CRM...',
    noConversation: 'Su caso fue creado, pero la conversación de CRM aún no está lista. Cierre y vuelva a abrir este panel en un momento.',
    messagePlaceholder: 'Describa sus registros disponibles o adjunte archivos...',
    attachFilesLabel: 'Adjuntar archivos médicos',
    sendLabel: 'Enviar materiales al CRM',
  },
  fr: {
    rulesTitle: 'Veuillez confirmer nos règles de service',
    rulesBody: 'Medora n’est pas un service d’urgence. Si les symptômes sont urgents ou s’aggravent rapidement, consultez d’abord les urgences locales. Notre équipe examinera les documents envoyés dans votre dossier CRM.',
    consentLabel: 'Je comprends et j’accepte ces règles.',
    materialsTitle: 'Quels documents pouvez-vous téléverser?',
    materialsLead: 'Téléversez ou décrivez les documents déjà disponibles. Le texte et les fichiers iront directement dans votre dossier CRM pour examen humain.',
    materials: ['Diagnostic ou lettre de référence', 'Compte rendu CT, IRM, radio, échographie ou imagerie', 'Compte rendu de pathologie', 'Analyses sanguines ou laboratoire', 'Compte rendu de sortie', 'Liste des médicaments', 'Résumé des traitements ou chirurgies antérieurs'],
    uploadPrompt: 'Après confirmation, utilisez la zone ci-dessous pour téléverser des fichiers ou décrire ce que vous avez.',
    waitingForConversation: 'Préparation de votre espace dossier CRM...',
    noConversation: 'Votre dossier a été créé, mais la conversation CRM n’est pas encore prête. Fermez et rouvrez ce panneau dans un instant.',
    messagePlaceholder: 'Décrivez vos documents disponibles ou joignez des fichiers...',
    attachFilesLabel: 'Joindre des documents médicaux',
    sendLabel: 'Envoyer au CRM',
  },
  de: {
    rulesTitle: 'Bitte bestätigen Sie unsere Serviceregeln',
    rulesBody: 'Medora ist kein Notfalldienst. Wenn Symptome dringend sind oder sich schnell verschlechtern, suchen Sie zuerst lokale Notfallversorgung auf. Unser Team prüft die eingereichten Unterlagen in Ihrem CRM-Fall.',
    consentLabel: 'Ich verstehe und akzeptiere diese Regeln.',
    materialsTitle: 'Welche Unterlagen können Sie hochladen?',
    materialsLead: 'Laden Sie vorhandene Unterlagen hoch oder beschreiben Sie sie. Text und Dateien gehen direkt in Ihren CRM-Fall zur Prüfung durch das Team.',
    materials: ['Diagnose oder Überweisung', 'CT-, MRT-, Röntgen-, Ultraschall- oder Bildgebungsbericht', 'Pathologiebericht', 'Bluttest oder Laborbericht', 'Entlassungsbericht', 'Medikamentenliste', 'Zusammenfassung früherer Behandlungen oder Operationen'],
    uploadPrompt: 'Nach der Bestätigung können Sie unten Dateien hochladen oder beschreiben, was vorhanden ist.',
    waitingForConversation: 'CRM-Fallarbeitsbereich wird vorbereitet...',
    noConversation: 'Ihr Fall wurde erstellt, aber die CRM-Konversation ist noch nicht bereit. Bitte schließen und öffnen Sie dieses Fenster gleich erneut.',
    messagePlaceholder: 'Beschreiben Sie vorhandene Unterlagen oder hängen Sie Dateien an...',
    attachFilesLabel: 'Medizinische Dateien anhängen',
    sendLabel: 'Unterlagen an CRM senden',
  },
  ru: {
    rulesTitle: 'Подтвердите правила сервиса',
    rulesBody: 'Medora не является экстренной службой. Если симптомы срочные или быстро ухудшаются, сначала обратитесь за местной неотложной помощью. Наша команда рассмотрит материалы, отправленные в ваш CRM-кейс.',
    consentLabel: 'Я понимаю и принимаю эти правила.',
    materialsTitle: 'Какие материалы можно загрузить?',
    materialsLead: 'Загрузите или опишите уже имеющиеся материалы. Текст и файлы попадут напрямую в ваш CRM-кейс для проверки командой.',
    materials: ['Диагноз или направление', 'Отчет CT, MRI, рентген, УЗИ или другой визуализации', 'Патологический отчет', 'Анализы крови или лабораторные результаты', 'Выписка', 'Список лекарств', 'Сводка предыдущего лечения или операций'],
    uploadPrompt: 'После подтверждения используйте поле ниже, чтобы загрузить файлы или описать материалы.',
    waitingForConversation: 'Подготовка рабочего пространства CRM...',
    noConversation: 'Кейс создан, но CRM-диалог еще не готов. Закройте и откройте панель немного позже.',
    messagePlaceholder: 'Опишите имеющиеся документы или прикрепите файлы...',
    attachFilesLabel: 'Прикрепить медицинские файлы',
    sendLabel: 'Отправить материалы в CRM',
  },
  ar: {
    rulesTitle: 'يرجى تأكيد قواعد الخدمة',
    rulesBody: 'Medora ليست خدمة طوارئ. إذا كانت الأعراض عاجلة أو تزداد بسرعة، يرجى طلب رعاية طارئة محلية أولا. سيراجع فريقنا المواد التي ترسلها داخل ملف CRM.',
    consentLabel: 'أفهم هذه القواعد وأوافق عليها.',
    materialsTitle: 'ما المواد التي يمكنك رفعها؟',
    materialsLead: 'ارفع أو صف أي مواد متوفرة لديك. ستذهب النصوص والملفات مباشرة إلى ملفك في CRM لمراجعة الفريق.',
    materials: ['تشخيص أو خطاب إحالة', 'تقرير CT أو MRI أو أشعة أو موجات فوق صوتية', 'تقرير علم الأمراض', 'تحاليل دم أو مختبر', 'ملخص الخروج', 'قائمة الأدوية', 'ملخص علاجات أو عمليات سابقة'],
    uploadPrompt: 'بعد التأكيد، استخدم المربع أدناه لرفع الملفات أو وصف ما لديك.',
    waitingForConversation: 'جار تجهيز مساحة ملف CRM...',
    noConversation: 'تم إنشاء الملف، لكن محادثة CRM ليست جاهزة بعد. يرجى إغلاق هذه النافذة وفتحها بعد قليل.',
    messagePlaceholder: 'صف السجلات المتاحة أو أرفق الملفات...',
    attachFilesLabel: 'إرفاق ملفات طبية',
    sendLabel: 'إرسال المواد إلى CRM',
  },
  vi: {
    rulesTitle: 'Vui lòng xác nhận quy tắc dịch vụ',
    rulesBody: 'Medora không phải là dịch vụ cấp cứu. Nếu triệu chứng khẩn cấp hoặc xấu đi nhanh, vui lòng đi cấp cứu tại địa phương trước. Đội ngũ của chúng tôi sẽ xem tài liệu bạn gửi trong hồ sơ CRM.',
    consentLabel: 'Tôi hiểu và đồng ý với các quy tắc này.',
    materialsTitle: 'Bạn có thể tải lên tài liệu nào?',
    materialsLead: 'Tải lên hoặc mô tả tài liệu bạn đã có. Văn bản và tệp sẽ đi trực tiếp vào hồ sơ CRM để đội ngũ xem xét.',
    materials: ['Chẩn đoán hoặc giấy giới thiệu', 'Báo cáo CT, MRI, X-quang, siêu âm hoặc hình ảnh', 'Báo cáo giải phẫu bệnh', 'Xét nghiệm máu hoặc phòng xét nghiệm', 'Tóm tắt xuất viện', 'Danh sách thuốc', 'Tóm tắt điều trị hoặc phẫu thuật trước đây'],
    uploadPrompt: 'Sau khi xác nhận, dùng ô bên dưới để tải tệp lên hoặc mô tả tài liệu bạn có.',
    waitingForConversation: 'Đang chuẩn bị không gian hồ sơ CRM...',
    noConversation: 'Hồ sơ đã được tạo, nhưng cuộc trò chuyện CRM chưa sẵn sàng. Vui lòng đóng và mở lại bảng này sau ít phút.',
    messagePlaceholder: 'Mô tả hồ sơ hiện có hoặc đính kèm tệp...',
    attachFilesLabel: 'Đính kèm tệp y tế',
    sendLabel: 'Gửi tài liệu vào CRM',
  },
  id: {
    rulesTitle: 'Konfirmasi aturan layanan kami',
    rulesBody: 'Medora bukan layanan darurat. Jika gejala mendesak atau memburuk cepat, cari bantuan darurat lokal terlebih dahulu. Tim kami akan meninjau materi yang Anda kirim di case CRM.',
    consentLabel: 'Saya memahami dan menyetujui aturan ini.',
    materialsTitle: 'Materi apa yang dapat Anda unggah?',
    materialsLead: 'Unggah atau jelaskan materi yang sudah Anda miliki. Teks dan file akan langsung masuk ke case CRM untuk ditinjau tim manusia.',
    materials: ['Diagnosis atau surat rujukan', 'Laporan CT, MRI, X-ray, ultrasound, atau pencitraan', 'Laporan patologi', 'Tes darah atau laporan lab', 'Ringkasan pulang rawat', 'Daftar obat', 'Ringkasan pengobatan atau operasi sebelumnya'],
    uploadPrompt: 'Setelah konfirmasi, gunakan kotak di bawah untuk mengunggah file atau menjelaskan materi yang Anda miliki.',
    waitingForConversation: 'Menyiapkan ruang case CRM...',
    noConversation: 'Case Anda sudah dibuat, tetapi percakapan CRM belum siap. Tutup dan buka kembali panel ini sebentar lagi.',
    messagePlaceholder: 'Jelaskan rekam medis yang tersedia atau lampirkan file...',
    attachFilesLabel: 'Lampirkan file medis',
    sendLabel: 'Kirim materi ke CRM',
  },
};

function selectMaterialConversation(
  conversations: Conversation[],
  caseId: string | null,
): Conversation | null {
  const caseConversations = caseId
    ? conversations.filter((conversation) => !conversation.caseId || conversation.caseId === caseId)
    : conversations;
  return caseConversations.find(isAdminPatientConversation) ?? caseConversations[0] ?? null;
}

function MaterialCollectionPanel() {
  const { currentLanguage } = useLanguage();
  const { caseId } = usePatientEntry();
  const { data: conversations = [], isLoading } = usePatientConversations();
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false);
  const copy = MATERIAL_COLLECTION_COPY[currentLanguage] ?? MATERIAL_COLLECTION_COPY.en;
  const conversation = selectMaterialConversation(conversations, caseId);

  return (
    <div className="mx-3 my-2 rounded-[26px] border border-gold-200 bg-gold-50/60 px-5 py-5 shadow-[0_22px_45px_rgba(15,23,42,0.08)]">
      <div className="space-y-4">
        <section>
          <h4 className="font-serif text-lg text-stone-900">{copy.rulesTitle}</h4>
          <p className="mt-2 text-sm leading-6 text-stone-600">{copy.rulesBody}</p>
          <label className="mt-3 flex items-start gap-2 rounded-2xl border border-gold-200 bg-white px-3 py-3 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={hasAcceptedRules}
              onChange={(event) => setHasAcceptedRules(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-gold-600 focus:ring-gold-500"
            />
            <span>{copy.consentLabel}</span>
          </label>
        </section>

        <section>
          <h4 className="font-serif text-lg text-stone-900">{copy.materialsTitle}</h4>
          <p className="mt-2 text-sm leading-6 text-stone-600">{copy.materialsLead}</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-700">
            {copy.materials.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-stone-500">{copy.uploadPrompt}</p>
        </section>
      </div>

      {hasAcceptedRules ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {isLoading ? (
            <p className="px-4 py-4 text-sm text-stone-500">{copy.waitingForConversation}</p>
          ) : conversation ? (
            <MessageInput
              conversationId={conversation.id}
              placeholder={copy.messagePlaceholder}
              attachFilesLabel={copy.attachFilesLabel}
              sendLabel={copy.sendLabel}
            />
          ) : (
            <p className="px-4 py-4 text-sm text-red-600">{copy.noConversation}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function OnboardingFlow({ onClose, onComplete, showPreBootstrapInput = true }: OnboardingFlowProps = {}) {
  const { dt } = useDashboardTranslation();
  const {
    phase,
    preBootstrapMessages,
    bootstrapError,
    clearBootstrapError,
    openPanel,
  } = usePatientEntry();
  const { patient } = usePatientAuth();

  const scrollRef = useRef<HTMLDivElement>(null);
  const isBackendOwnedHospitalSelection = phase === 'select-hospitals'
    && patient?.widgetChatTarget?.kind === 'CHATBOT_SESSION';

  // Auto-scroll to bottom whenever messages or phase changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = phase === 'collect-profile' ? 0 : scrollRef.current.scrollHeight;
    }
  }, [preBootstrapMessages.length, phase]);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable chat stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-3 space-y-2 min-h-0"
      >
        {/* Pre-bootstrap message history */}
        {preBootstrapMessages.map((msg) => (
          <MessageBubble key={msg.clientId} message={msg} />
        ))}

        {/* Phase-specific embedded control */}
        {phase === 'collect-profile' && (
          <div className="px-2">
            <ContactInfoStep onComplete={onComplete} />
          </div>
        )}

        {phase === 'select-hospitals' && isBackendOwnedHospitalSelection && (
          <div className="px-2 space-y-2">
            <SubmittedDetailsCard />
            <MaterialCollectionPanel />
          </div>
        )}

        {phase === 'select-hospitals' && !isBackendOwnedHospitalSelection && (
          <div className="px-2">
            <HospitalCards />
          </div>
        )}

        {phase === 'messages-ready' && (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gold-600" />
            </div>
            <div>
              <h4 className="text-stone-800 font-serif text-lg mb-1">{dt('chatWelcomeBack')}</h4>
              <p className="text-stone-500 text-sm">{dt('chatViewHospitalConversations')}</p>
            </div>
            <button
              onClick={() => {
                openPanel();
                onClose?.();
              }}
              className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300"
            >
              {dt('dashboardOpenMessages')}
            </button>
          </div>
        )}

        {phase === 'bootstrap-error' && (
          <div className="mx-3 my-2 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-700 text-sm font-medium mb-1">{dt('chatSomethingWentWrong')}</p>
            <p className="text-red-600 text-xs mb-3">
              {bootstrapError ?? dt('chatUnableSetup')}
            </p>
            <button
              onClick={clearBootstrapError}
              className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {dt('chatTryAgain')}
            </button>
          </div>
        )}
      </div>

      {/* Message input — hidden for returning patients who already have conversations */}
      {showPreBootstrapInput && phase !== 'messages-ready' && !isBackendOwnedHospitalSelection && <PreBootstrapInput />}
    </div>
  );
}
