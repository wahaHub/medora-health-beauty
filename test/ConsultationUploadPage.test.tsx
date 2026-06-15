import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ConsultationUpload from '@/pages/ConsultationUpload';

describe('ConsultationUpload page', () => {
  it('renders the migrated online consultation upload flow', () => {
    render(
      <MemoryRouter>
        <ConsultationUpload />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /开启您的专属/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /免费图文问诊/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /李医生视频面诊/ })).toBeInTheDocument();
    expect(screen.getByText('隐私加密传输')).toBeInTheDocument();
  });
});
