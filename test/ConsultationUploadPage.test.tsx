import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { LANGUAGES, LanguageProvider, type LanguageCode } from '@/contexts/LanguageContext';
import { getConsultationUploadCopy } from '@/i18n/consultationUploadCopy';
import ConsultationUpload from '@/pages/ConsultationUpload';

const { crmApiState, patientAuthState, patientEntryState } = vi.hoisted(() => ({
  crmApiState: {
    getConversations: vi.fn(),
    initConversationAttachmentUpload: vi.fn(),
    sendMessage: vi.fn(),
  },
  patientAuthState: {
    patient: {
      id: 'patient-1',
      caseId: 'case-1',
    } as { id: string; caseId?: string } | null,
  },
  patientEntryState: {
    caseId: 'case-1' as string | null,
  },
}));

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => ({
    patient: patientAuthState.patient,
  }),
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: () => ({
    caseId: patientEntryState.caseId,
  }),
}));

vi.mock('@/services/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('@/services/crmApiClient')>('@/services/crmApiClient');
  return {
    ...actual,
    crmApi: {
      getConversations: crmApiState.getConversations,
      initConversationAttachmentUpload: crmApiState.initConversationAttachmentUpload,
      sendMessage: crmApiState.sendMessage,
    },
  };
});

const renderPage = () =>
  render(
    <LanguageProvider>
      <MemoryRouter>
        <ConsultationUpload />
      </MemoryRouter>
    </LanguageProvider>,
  );

describe('ConsultationUpload page', () => {
  beforeEach(() => {
    localStorage.clear();
    crmApiState.getConversations.mockReset();
    crmApiState.initConversationAttachmentUpload.mockReset();
    crmApiState.sendMessage.mockReset();
    patientAuthState.patient = {
      id: 'patient-1',
      caseId: 'case-1',
    };
    patientEntryState.caseId = 'case-1';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the migrated online consultation upload flow', () => {
    localStorage.setItem('medora-language', 'zh');
    renderPage();

    expect(screen.getByRole('heading', { name: /开启您的专属/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /免费图文咨询/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /专家视频面诊/ })).toBeInTheDocument();
    expect(screen.getByText('隐私加密传输')).toBeInTheDocument();
  });

  it('uses localized Step 1 consultation cards and Step 2 image icons', () => {
    localStorage.setItem('medora-language', 'en');
    renderPage();

    expect(screen.getByRole('heading', { name: /Start Your Private\s*Beauty Consultation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Free text consultation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dr\. Li video consultation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Choose a hospital \/ doctor/i })).toBeInTheDocument();
    expect(screen.queryByText('请选择问诊通道')).not.toBeInTheDocument();

    screen.getByRole('button', { name: /Free text consultation/i }).click();

    for (const label of ['Eyes', 'Nose', 'Lips', 'Facial contour', 'Hair restoration', 'Body contouring', 'Other area']) {
      expect(screen.getByRole('img', { name: `${label} consultation icon` })).toBeInTheDocument();
    }
  });

  it('defines consultation upload step translations for every supported language', () => {
    const languages = Object.keys(LANGUAGES) as LanguageCode[];

    for (const language of languages) {
      const dictionary = getConsultationUploadCopy(language);
      expect(dictionary.heroTitle, `${language}.heroTitle`).toBeTruthy();
      expect(dictionary.step1Title, `${language}.step1Title`).toBeTruthy();
      expect(dictionary.channels.free.title, `${language}.channels.free.title`).toBeTruthy();
      expect(dictionary.channels['doctor-li'].title, `${language}.channels.doctor-li.title`).toBeTruthy();
      expect(dictionary.channels['custom-doctor'].title, `${language}.channels.custom-doctor.title`).toBeTruthy();
      expect(dictionary.step2Title, `${language}.step2Title`).toBeTruthy();
      expect(dictionary.parts.eyes.name, `${language}.parts.eyes.name`).toBeTruthy();
      expect(dictionary.step3Title, `${language}.step3Title`).toBeTruthy();
      expect(dictionary.step4Title, `${language}.step4Title`).toBeTruthy();
      expect(dictionary.successTitle, `${language}.successTitle`).toBeTruthy();
      expect(dictionary.sessionRequiredTitle, `${language}.sessionRequiredTitle`).toBeTruthy();
    }
  });

  it('blocks direct uploads until a CRM consultation session exists', () => {
    localStorage.setItem('medora-language', 'en');
    patientAuthState.patient = null;
    patientEntryState.caseId = null;

    renderPage();

    expect(screen.getByRole('heading', { name: /Start from a video case first/i })).toBeInTheDocument();
    expect(screen.getByText(/create your secure CRM consultation record/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse video cases/i })).toHaveAttribute('href', '/procedure/videos');
    expect(screen.queryByRole('button', { name: /Free text consultation/i })).not.toBeInTheDocument();
  });

  it('uploads five consultation views into the CRM patient conversation', async () => {
    const copy = getConsultationUploadCopy('en');
    const uploadFetch = vi.fn().mockResolvedValue({ ok: true });
    const originalCreateElement = document.createElement.bind(document);

    localStorage.setItem('medora-language', 'en');
    crmApiState.getConversations.mockResolvedValue([
      {
        id: 'widget-chat:patient-1:case-1',
        caseId: 'case-1',
        category: 'ADMIN_PATIENT',
        type: 'patient-admin',
      },
    ]);
    crmApiState.initConversationAttachmentUpload.mockImplementation(
      ({ fileName, fileSize, mimeType }: { fileName: string; fileSize: number; mimeType: string }) =>
        Promise.resolve({
          upload: {
            uploadUrl: `https://uploads.example/${fileName}`,
            storageKey: `crm/beauty/${fileName}`,
            expiresIn: 900,
          },
          asset: {
            fileName,
            fileSize,
            mimeType,
            storageKey: `crm/beauty/${fileName}`,
          },
        }),
    );
    crmApiState.sendMessage.mockResolvedValue({ id: 'message-1' });
    vi.stubGlobal('fetch', uploadFetch);
    vi.stubGlobal('Image', class {
      width = 1200;
      height = 1200;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    });
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:consultation-photo'),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
      const element = originalCreateElement(tagName, options);
      if (tagName.toLowerCase() === 'canvas') {
        Object.defineProperty(element, 'getContext', {
          value: vi.fn(() => ({ drawImage: vi.fn() })),
        });
        Object.defineProperty(element, 'toDataURL', {
          value: vi.fn(() => 'data:image/jpeg;base64,AAAA'),
        });
      }
      return element;
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Free text consultation/i }));
    fireEvent.click(screen.getByRole('button', { name: /Hair restoration/i }));

    const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(fileInputs).toHaveLength(5);
    fileInputs.forEach((input, index) => {
      fireEvent.change(input, {
        target: {
          files: [new File(['photo'], `view-${index + 1}.jpg`, { type: 'image/jpeg' })],
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: new RegExp(copy.nextToForm, 'i') })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.nextToForm, 'i') }));
    fireEvent.change(screen.getByPlaceholderText(copy.namePlaceholder), { target: { value: 'Alice Beauty' } });
    fireEvent.change(screen.getByPlaceholderText(copy.countryPlaceholder), { target: { value: 'United States' } });
    fireEvent.change(screen.getByPlaceholderText(copy.contactPlaceholder), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(copy.concernsPlaceholder), {
      target: { value: 'Hairline density and donor area review.' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: copy.submitIdle }));

    await waitFor(() => {
      expect(crmApiState.sendMessage).toHaveBeenCalledTimes(1);
    });
    expect(crmApiState.initConversationAttachmentUpload).toHaveBeenCalledTimes(5);
    expect(uploadFetch).toHaveBeenCalledTimes(5);
    expect(crmApiState.sendMessage).toHaveBeenCalledWith(
      'widget-chat:patient-1:case-1',
      expect.stringContaining('[Beauty Consultation Upload]'),
      expect.objectContaining({
        messageType: 'IMAGE',
        attachments: expect.arrayContaining([
          expect.objectContaining({
            fileName: expect.stringMatching(/^beauty-hair-/),
            mimeType: 'image/jpeg',
          }),
        ]),
      }),
    );
    expect(crmApiState.sendMessage.mock.calls[0][2].attachments).toHaveLength(5);
    expect(await screen.findByText('case-1')).toBeInTheDocument();
  });
});
