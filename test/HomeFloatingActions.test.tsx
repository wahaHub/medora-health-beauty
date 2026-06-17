import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import HomeFloatingActions from '@/components/HomeFloatingActions';
import { ConsultationProvider } from '@/contexts/ConsultationContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

function renderActions(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>
        <ConsultationProvider>
          <HomeFloatingActions />
        </ConsultationProvider>
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('HomeFloatingActions', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    window.localStorage.clear();
  });

  it('renders a large start consultation action on the homepage', () => {
    renderActions('/');

    const button = screen.getByRole('button', { name: /start consultation/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Start Consultation');
    expect(button.className).toContain('h-16');
  });

  it('opens the consultation flow when clicked', () => {
    renderActions('/');

    fireEvent.click(screen.getByRole('button', { name: /start consultation/i }));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('uses the active language for the homepage action copy', () => {
    window.localStorage.setItem('medora-language', 'zh');

    renderActions('/');

    expect(screen.getByRole('button', { name: '立即咨询' })).toBeInTheDocument();
    expect(screen.queryByText('Start Consultation')).toBeNull();
  });

  it('does not render away from the homepage', () => {
    renderActions('/gallery');

    expect(screen.queryByRole('button', { name: /start consultation/i })).toBeNull();
  });
});
