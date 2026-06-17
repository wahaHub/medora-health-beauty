import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import ProcedureVideoGallery from '@/pages/ProcedureVideoGallery';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        allProcedures: 'All Procedures',
        results: 'results',
        videoCasesVideos: 'videos',
        videoCasesShowing: 'Showing',
        videoCasesOf: 'of',
        videoCasesNoCasesTitle: 'No cases found',
        videoCasesNoCasesDescription: 'Try another filter.',
        videoCasesSubtype: 'Treatment Focus',
        videoCasesAllSubtypes: 'All Focuses',
        consultationNow: 'Start Consultation',
      };
      return dictionary[key] ?? key;
    },
  }),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'en',
  }),
}));

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

const emptyVideoCasePayload = {
  count: 0,
  doctors: [],
  projects: [],
  cases: [],
};

const makeVideoCase = (id: string, sourcePath: string) => ({
  id,
  doctor: 'medora',
  doctorName: 'Medora',
  project: 'eye-surgery',
  projectName: 'Eye Surgery',
  objectKey: `video_cases_v4/videos/eye-surgery/medora/${id}/video.mp4`,
  videoUrl: `https://videos.example/${id}.mp4`,
  size: 1000,
  sourceSet: 'test',
  sourcePath,
  sourceKind: 'test',
  classificationSource: 'test',
  classificationConfidence: 'high',
});

const renderGalleryAt = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationProbe />
      <Routes>
        <Route path="/procedure/videos" element={<ProcedureVideoGallery />} />
        <Route path="/procedure/:procedureName/videos" element={<ProcedureVideoGallery />} />
        <Route path="/consultation-upload" element={<div>Consultation Upload Page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('ProcedureVideoGallery SEO route stability', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue(emptyVideoCasePayload),
      }),
    );
  });

  it('keeps a canonical procedure video path stable after hydration', async () => {
    renderGalleryAt('/procedure/Rhinoplasty/videos');

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/procedure/Rhinoplasty/videos');
    });

    expect(await screen.findByText(/Rhinoplasty videos/i)).toBeInTheDocument();
  });

  it('supports the compatibility query filter route', async () => {
    renderGalleryAt('/procedure/videos?procedure=Rhinoplasty&area=face');

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/procedure/videos?procedure=Rhinoplasty&area=face');
    });

    expect(await screen.findByText(/Rhinoplasty videos/i)).toBeInTheDocument();
  });

  it('keeps the generic video gallery route unfiltered', async () => {
    renderGalleryAt('/procedure/videos');

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/procedure/videos');
    });

    expect(await screen.findByText(/All Procedures videos/i)).toBeInTheDocument();
  });

  it('lets Hair Restoration visitors start a consultation from the query-filtered video gallery', async () => {
    const user = userEvent.setup();
    renderGalleryAt('/procedure/videos?procedure=Hair%20Restoration&area=hair');

    const consultationButton = await screen.findByRole('button', { name: 'Start Consultation' });
    await user.click(consultationButton);

    expect(screen.getByTestId('location')).toHaveTextContent('/consultation-upload');
    expect(screen.getByText('Consultation Upload Page')).toBeInTheDocument();
  });

  it('does not add the consultation CTA to the legacy procedure-name video route', async () => {
    renderGalleryAt('/procedure/Hair%20Restoration/videos');

    await screen.findByText(/Hair Restoration videos/i);

    expect(screen.queryByRole('button', { name: 'Start Consultation' })).not.toBeInTheDocument();
  });

  it('filters eye videos by treatment focus subtype', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({
        count: 2,
        doctors: [],
        projects: [],
        cases: [
          makeVideoCase('eyelid-case', '/Users/haowang/Desktop/雷鸣视频下载/Dr.刘春案例【眼睛】1/video.mp4'),
          makeVideoCase('eye-bag-case', '/Users/haowang/Desktop/雷鸣视频下载/提眉眼袋合集/video.mp4'),
        ],
      }),
    } as unknown as Response);
    const user = userEvent.setup();
    renderGalleryAt('/procedure/videos?area=face&project=eye-surgery');

    expect(await screen.findByText('Treatment Focus')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eye Bags' })).toBeInTheDocument();
    const filterText = document.body.textContent || '';
    expect(filterText.indexOf('procedureType')).toBeLessThan(filterText.indexOf('Treatment Focus'));
    expect(filterText.indexOf('Treatment Focus')).toBeLessThan(filterText.indexOf('videoCasesConcern'));

    await user.click(screen.getByRole('button', { name: 'Eye Bags' }));

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/procedure/videos?area=face&project=eye-surgery&subtype=eye-bags',
    );
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/Showing\s+1-1\s+of\s+1\s+Eyes\s+videos/i);
    });
  });
});
