import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Header from '@/components/Header';

const navigateMock = vi.hoisted(() => vi.fn());

const patientAuthState = vi.hoisted(() => ({
  isAuthenticated: false,
  isLoading: false,
  patient: null,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        navGallery: 'GALLERY',
        navTravel: 'TRAVEL',
        navResources: 'RESOURCES',
        navContact: 'CONTACT',
      };
      return dictionary[key] ?? key;
    },
  }),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'en',
    setLanguage: vi.fn(),
    languages: {
      en: { code: 'EN', flag: '🇺🇸', nativeName: 'English' },
      zh: { code: 'ZH', flag: '🇨🇳', nativeName: '中文' },
    },
  }),
}));

vi.mock('@/hooks/useData', () => ({
  useSurgeonsList: () => ({
    data: { surgeons: [] },
    isLoading: false,
  }),
}));

describe('Header SEO links', () => {
  beforeEach(() => {
    patientAuthState.isAuthenticated = false;
    patientAuthState.isLoading = false;
    patientAuthState.patient = null;
    navigateMock.mockClear();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    window.scrollTo = vi.fn();
  });

  it('renders desktop case links from the homepage discovery taxonomy with query filter hrefs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'CASES' })).toHaveAttribute('href', '/procedure/videos');
    expect(screen.getByRole('heading', { name: 'Skin & Injectables' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Rhinoplasty' })).toBeNull();

    const noseLinks = screen.getAllByRole('link', { name: 'Nose' });

    expect(noseLinks.length).toBeGreaterThan(0);
    expect(noseLinks[0]).toHaveAttribute(
      'href',
      '/procedure/videos?project=nose-surgery&area=face',
    );
    expect(noseLinks.every((link) => link.getAttribute('href') !== '#')).toBe(true);
  });

  it('renders crawl-critical top-level public links with real hrefs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'GALLERY' })).toHaveAttribute('href', '/gallery');
    expect(screen.getByRole('link', { name: 'TRAVEL' })).toHaveAttribute('href', '/travel');
  });

  it('opens the mobile menu by accessible name and includes query-filtered case links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link', { name: 'Nose' })
        .some((link) => link.getAttribute('href') === '/procedure/videos?project=nose-surgery&area=face'),
    ).toBe(true);
  });
});
