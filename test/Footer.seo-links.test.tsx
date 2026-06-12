import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Footer from '@/components/Footer';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        footerDescription: 'Expert cosmetic surgery guidance.',
        footerQuickLinks: 'Quick Links',
        footerAboutUs: 'About Us',
        footerOurTeam: 'Our Team',
        footerProcedures: 'Procedures',
        footerReviews: 'Reviews',
        footerTravel: 'Travel',
        footerContactInfo: 'Contact Info',
        footerAllRightsReserved: 'All rights reserved.',
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

describe('Footer SEO links', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('renders supported procedures and crawl-critical quick links as links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Rhinoplasty' })).toHaveAttribute(
      'href',
      '/procedure/Rhinoplasty',
    );
    expect(screen.getByRole('link', { name: 'Procedures' })).toHaveAttribute('href', '/procedures/face');
    expect(screen.getByRole('link', { name: 'Reviews' })).toHaveAttribute('href', '/reviews');
    expect(screen.getByRole('link', { name: 'Travel' })).toHaveAttribute('href', '/travel');
  });
});
