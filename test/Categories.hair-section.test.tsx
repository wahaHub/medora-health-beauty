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
      };

      return dictionary[key] ?? key;
    },
  }),
}));

vi.mock('@/utils/imageUtils', () => ({
  getHomepageImage: (key: string) => `/fallback-${key}.jpg`,
}));

describe('Categories hair section', () => {
  it('renders Hair after Non-Surgical with the local homepage video', () => {
    const { container } = render(<Categories />);

    const categoryIds = Array.from(container.querySelectorAll('div[id]')).map((node) => node.id);
    expect(categoryIds).toEqual(['face', 'body', 'nonsurgical', 'hair']);
    expect(screen.getByRole('heading', { name: 'Hair' })).toBeInTheDocument();
    expect(screen.getByText('"Personalized Hair Restorations"')).toBeInTheDocument();
    expect(screen.getByText('Hair Transplant')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explore Hair' })).toBeInTheDocument();
    expect(container.querySelector('source[src="/homepage/hair.mp4"]')).toBeInTheDocument();
  });
});
