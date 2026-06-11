import { describe, expect, it } from 'vitest';

import { translations, type LanguageCode } from '@/i18n/translations';

describe('procedure video CTA translations', () => {
  it('defines the View All Video Cases CTA for every supported language', () => {
    expect(translations.en.viewAllVideoCases).toBe('View All Video Cases');
    expect(translations.zh.viewAllVideoCases).toBe('查看全部视频案例');

    for (const [language, dictionary] of Object.entries(translations) as Array<[LanguageCode, typeof translations.en]>) {
      expect(dictionary.viewAllVideoCases, `${language}.viewAllVideoCases`).toBeTruthy();
      expect(dictionary.viewAllVideoCases, `${language}.viewAllVideoCases`).not.toBe('viewAllVideoCases');
    }
  });
});
