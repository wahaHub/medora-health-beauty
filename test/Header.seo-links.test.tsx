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

  it('renders desktop Rhinoplasty procedure links with video-gallery hrefs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );

    const rhinoplastyLinks = screen.getAllByRole('link', { name: 'Rhinoplasty' });

    expect(rhinoplastyLinks.length).toBeGreaterThan(0);
    expect(rhinoplastyLinks[0]).toHaveAttribute(
      'href',
      '/procedure/videos?procedure=Rhinoplasty&area=face',
    );
    expect(rhinoplastyLinks.every((link) => link.getAttribute('href') !== '#')).toBe(true);
  });

  it('opens the mobile menu by accessible name and includes a real Rhinoplasty link', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link', { name: 'Rhinoplasty' })
        .some((link) => link.getAttribute('href') === '/procedure/videos?procedure=Rhinoplasty&area=face'),
    ).toBe(true);
  });
});
