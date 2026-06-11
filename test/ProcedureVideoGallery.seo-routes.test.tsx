import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

const renderGalleryAt = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationProbe />
      <Routes>
        <Route path="/procedure/videos" element={<ProcedureVideoGallery />} />
        <Route path="/procedure/:procedureName/videos" element={<ProcedureVideoGallery />} />
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
});
