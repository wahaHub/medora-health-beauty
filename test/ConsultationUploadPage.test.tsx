import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { LANGUAGES, LanguageProvider, type LanguageCode } from '@/contexts/LanguageContext';
import { getConsultationUploadCopy } from '@/i18n/consultationUploadCopy';
import ConsultationUpload from '@/pages/ConsultationUpload';

const renderPage = () =>
  render(
    <LanguageProvider>
      <MemoryRouter>
        <ConsultationUpload />
      </MemoryRouter>
    </LanguageProvider>,
  );

describe('ConsultationUpload page', () => {
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
    }
  });
});
