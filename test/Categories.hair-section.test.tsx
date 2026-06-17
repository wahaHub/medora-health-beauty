import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Categories from '@/components/Categories';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        medoraHealthProcedures: 'Medora Health Procedures',
        exploreFace: 'Explore Face',
        exploreBody: 'Explore Body',
        exploreNonsurgical: 'Explore Nonsurgical',
        exploreHair: 'Explore Hair',
        exploreDental: 'Explore Dental',
        categoryFace: 'Face',
        categoryFaceSubtitle: 'Personalized Facial Rejuvenation',
        categoryFaceDescription: 'Face description',
        categoryFaceItem1: 'Facelift',
        categoryFaceItem2: 'Eyelid Surgery',
        categoryFaceItem3: 'Rhinoplasty',
        categoryFaceItem4: 'Deep Neck Contouring',
        categoryBody: 'Body',
        categoryBodySubtitle: 'Love your silhouette.',
        categoryBodyDescription: 'Body description',
        categoryBodyItem1: 'Tummy Tuck',
        categoryBodyItem2: 'Liposuction',
        categoryBodyItem3: 'Mommy Makeover',
        categoryBodyItem4: 'Body Contouring',
        categoryNonsurgical: 'Nonsurgical',
        categoryNonsurgicalSubtitle: 'A refined look',
        categoryNonsurgicalDescription: 'Nonsurgical description',
        categoryNonsurgicalItem1: 'BOTOX Cosmetic',
        categoryNonsurgicalItem2: 'Dermal Fillers',
        categoryNonsurgicalItem3: 'Lip Injections',
        categoryNonsurgicalItem4: 'Skin Rejuvenation',
        categoryHair: 'Hair',
        categoryHairSubtitle: 'Personalized Hair Restorations',
        categoryHairDescription: 'Hair description',
        categoryHairItem1: 'Hair Transplant',
        categoryHairItem2: 'Hairline Design',
        categoryHairItem3: 'Beard Transplant',
        categoryHairItem4: 'Eyebrow Restoration',
        categoryDental: 'Dental',
        categoryDentalSubtitle: 'A brighter smile',
        categoryDentalDescription: 'Dental description',
        categoryDentalItem1: 'Teeth Whitening',
        categoryDentalItem2: 'Porcelain Veneers',
        categoryDentalItem3: 'Invisalign / Clear Aligners',
        categoryDentalItem4: 'Smile Design',
      };

      return dictionary[key] ?? key;
    },
  }),
}));

vi.mock('@/utils/imageUtils', () => ({
  getHomepageImage: (key: string) => `/fallback-${key}.jpg`,
}));

describe('Homepage categories', () => {
  it('renders homepage sections from the latest public discovery taxonomy', () => {
    const { container } = render(<Categories />);

    const categoryIds = Array.from(container.querySelectorAll('div[id]')).map((node) => node.id);
    expect(categoryIds).toEqual(['face', 'body', 'nonsurgical', 'hair', 'dental']);
    expect(screen.getByRole('heading', { name: 'Face' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Body' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Skin & Injectables' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hair' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dental / Smile' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Eyes/i })).toHaveAttribute(
      'href',
      '/procedure/videos?project=eye-surgery&area=face',
    );
    expect(screen.getByRole('link', { name: /Nose/i })).toHaveAttribute(
      'href',
      '/procedure/videos?project=nose-surgery&area=face',
    );
    expect(screen.queryByRole('link', { name: /Facelift/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Rhinoplasty/i })).toBeNull();

    expect(screen.getByRole('link', { name: /Body Contouring/i })).toHaveAttribute(
      'href',
      '/procedure/videos?project=body-contouring&area=body',
    );
    expect(screen.getByRole('link', { name: /Breast Surgery/i })).toHaveAttribute(
      'href',
      '/procedure/videos?project=breast&area=body',
    );
    expect(screen.getByRole('link', { name: /Botox & Fillers/i })).toHaveAttribute(
      'href',
      '/procedure/videos?project=injectables&area=nonsurgical',
    );
    expect(screen.getByRole('link', { name: /Hair Transplant/i })).toHaveAttribute(
      'href',
      '/procedure/videos?project=hair-transplant&area=hair',
    );
    expect(screen.getByRole('link', { name: /Veneers/i })).toHaveAttribute(
      'href',
      '/procedure/videos?project=porcelain-veneers&area=dental',
    );

    expect(screen.getByRole('link', { name: 'Explore Face' })).toHaveAttribute('href', '/procedure/videos?area=face');
    expect(screen.getByRole('link', { name: 'Explore Dental' })).toHaveAttribute('href', '/procedure/videos?area=dental');
    expect(container.querySelector('source[src="https://videos.medorabeauty.com/homepage/hair.mp4"]')).toBeInTheDocument();
    expect(container.querySelector('source[src="https://videos.medorabeauty.com/homepage/dental.mp4"]')).toBeInTheDocument();
  });
});
