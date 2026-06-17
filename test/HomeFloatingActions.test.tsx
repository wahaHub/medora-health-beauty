import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import HomeFloatingActions from '@/components/HomeFloatingActions';
import { ConsultationProvider } from '@/contexts/ConsultationContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

const patientAuthState = vi.hoisted(() => ({
  isAuthenticated: false,
}));

const uploadStatusState = vi.hoisted(() => ({
  hasCompletedFiveViewUpload: false,
  isLoading: false,
}));

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/hooks/useBeautyConsultationUploadStatus', () => ({
  useBeautyConsultationUploadStatus: () => uploadStatusState,
}));

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
    patientAuthState.isAuthenticated = false;
    uploadStatusState.hasCompletedFiveViewUpload = false;
    uploadStatusState.isLoading = false;
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

  it('renders on the procedure videos gallery pages', () => {
    renderActions('/procedure/videos?project=body-contouring&area=body');

    expect(screen.getByRole('button', { name: /start consultation/i })).toBeInTheDocument();
  });

  it('renders wherever the floating chat entry is available', () => {
    renderActions('/gallery');

    expect(screen.getByRole('button', { name: /start consultation/i })).toBeInTheDocument();
  });

  it('does not render on login or unauthenticated dashboard pages', () => {
    const loginView = renderActions('/login');

    expect(screen.queryByRole('button', { name: /start consultation/i })).toBeNull();

    loginView.unmount();
    renderActions('/dashboard');

    expect(screen.queryByRole('button', { name: /start consultation/i })).toBeNull();
  });

  it('renders on authenticated dashboard pages where chat is available', () => {
    patientAuthState.isAuthenticated = true;

    renderActions('/dashboard/messages');

    expect(screen.getByRole('button', { name: /start consultation/i })).toBeInTheDocument();
  });

  it('hides after the patient has completed the 5-view upload', () => {
    uploadStatusState.hasCompletedFiveViewUpload = true;

    renderActions('/gallery');

    expect(screen.queryByRole('button', { name: /start consultation/i })).toBeNull();
  });
});
