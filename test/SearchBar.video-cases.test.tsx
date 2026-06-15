import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import SearchBar from '@/components/SearchBar';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        allProcedures: 'All Procedures',
        allCountries: 'All Countries',
        allPrices: 'All Prices',
        categoryFace: 'Face',
        categoryBody: 'Body',
        categoryBreast: 'Breast',
        categoryNonSurgical: 'Non-Surgical',
        searchCasesButton: 'Search',
        searchCountry: 'Country',
        searchPriceRange: 'Price',
        trustVerifiedDoctors: 'Verified doctors',
        trustRealResults: 'Real results',
        trustPrivateSecure: 'Private and secure',
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

describe('SearchBar video cases navigation', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    window.scrollTo = vi.fn();
  });

  it('routes a selected video procedure search to the matching project gallery', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /All Procedures/i }));
    expect(screen.queryByRole('button', { name: 'Invisalign' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eyes' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eyelids, eye bags/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Nose' }));
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    expect(navigateMock).toHaveBeenCalledWith('/procedure/videos?project=nose-surgery&area=face');
  });

  it('routes an empty homepage search directly to all video cases', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <SearchBar />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    expect(navigateMock).toHaveBeenCalledWith('/procedure/videos');
  });
});
