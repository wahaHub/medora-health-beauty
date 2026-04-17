import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Header from '../components/Header';

const patientAuthState = vi.hoisted(() => ({
  isAuthenticated: false,
  isLoading: false,
  patient: null,
}));

vi.mock('../contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        navAbout: 'ABOUT',
        navFace: 'FACE',
        navBody: 'BODY',
        navNonSurgical: 'NON-SURGICAL',
        navGallery: 'GALLERY',
        navTravel: 'TRAVEL',
        navResources: 'RESOURCES',
        navContact: 'CONTACT',
      };
      return dictionary[key] ?? key;
    },
  }),
}));

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'en',
    setLanguage: vi.fn(),
    languages: {
      en: { code: 'EN', flag: '🇺🇸', nativeName: 'English' },
      zh: { code: 'ZH', flag: '🇨🇳', nativeName: '中文' },
    },
  }),
}));

vi.mock('../hooks/useData', () => ({
  useSurgeonsList: () => ({
    data: { surgeons: [] },
    isLoading: false,
  }),
}));

describe('Header patient auth CTA', () => {
  beforeEach(() => {
    patientAuthState.isAuthenticated = false;
    patientAuthState.isLoading = false;
    patientAuthState.patient = null;
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    window.scrollTo = vi.fn();
  });

  it('shows Login and the language selector when the patient is unauthenticated', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('link', { name: 'Dashboard' })).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Select Language' }).length).toBeGreaterThan(0);
  });

  it('shows Dashboard and the language selector when the patient is authenticated', () => {
    patientAuthState.isAuthenticated = true;
    patientAuthState.patient = { id: 'patient-1', name: 'Beauty Patient' };

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.queryByRole('link', { name: 'Login' })).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Select Language' }).length).toBeGreaterThan(0);
  });

  it('does not show a clickable Login CTA while patient auth is still bootstrapping', () => {
    patientAuthState.isLoading = true;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link', { name: 'Login' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Dashboard' })).toBeNull();
    expect(screen.getAllByText('Account').length).toBeGreaterThan(0);
  });

  it('exposes language menu expanded state and closes on Escape', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );

    const selector = screen.getAllByRole('button', { name: 'Select Language' })[0];
    expect(selector).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(selector);

    expect(selector).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(selector, { key: 'Escape' });

    expect(selector).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
