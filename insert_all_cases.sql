-- SQL to insert all missing cases
-- Run this in Supabase Dashboard SQL Editor

-- Cases for arm-lift
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '138866', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'arm-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '178341', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'arm-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '185670', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'arm-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '394207', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'arm-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '698909', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'arm-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for breast-augmentation
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '278004', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'breast-augmentation'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '397463', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'breast-augmentation'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '398392', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'breast-augmentation'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '513230', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'breast-augmentation'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '884033', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'breast-augmentation'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for breast-lift
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '430648', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'breast-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '727272', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'breast-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '730405', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'breast-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '864226', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'breast-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for breast-reduction
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '151139', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'breast-reduction'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '416406', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'breast-reduction'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '831879', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'breast-reduction'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '895846', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'breast-reduction'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '988504', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'breast-reduction'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for brow-lift
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '167835', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'brow-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '531647', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'brow-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '583182', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'brow-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '670310', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'brow-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '680980', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'brow-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for cervicoplasty
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '155715', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'cervicoplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '297453', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'cervicoplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '307463', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'cervicoplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '874534', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'cervicoplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '924357', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'cervicoplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for chin-augmentation
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '117356', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'chin-augmentation'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '215087', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'chin-augmentation'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '487018', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'chin-augmentation'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '771856', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'chin-augmentation'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '898721', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'chin-augmentation'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for eyelid-surgery
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '140856', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'eyelid-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '323501', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'eyelid-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '496116', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'eyelid-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '830402', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'eyelid-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '951908', 'Before and after photos', 'Dr. Heather Lee', 2, 5
FROM procedures WHERE slug = 'eyelid-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for facelift
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '379657', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'facelift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '520884', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'facelift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '621304', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'facelift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '742940', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'facelift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '995139', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'facelift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for facial-rejuvenation-with-prp
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '207187', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'facial-rejuvenation-with-prp'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '280652', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'facial-rejuvenation-with-prp'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '581703', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'facial-rejuvenation-with-prp'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '708442', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'facial-rejuvenation-with-prp'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '849604', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'facial-rejuvenation-with-prp'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for forehead-reduction-surgery
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '254213', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'forehead-reduction-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '334465', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'forehead-reduction-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '409153', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'forehead-reduction-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '574039', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'forehead-reduction-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '734553', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'forehead-reduction-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for gynecomastia-surgery
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '151243', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'gynecomastia-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '210084', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'gynecomastia-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '256051', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'gynecomastia-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '486375', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'gynecomastia-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '646367', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'gynecomastia-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for hair-restoration
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '184465', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'hair-restoration'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '300910', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'hair-restoration'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '317661', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'hair-restoration'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '371117', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'hair-restoration'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '465996', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'hair-restoration'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for ipl-photofacial
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '163338', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'ipl-photofacial'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '217359', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'ipl-photofacial'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '630767', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'ipl-photofacial'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '701602', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'ipl-photofacial'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '815122', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'ipl-photofacial'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for lip-filler
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '227551', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'lip-filler'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '353524', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'lip-filler'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '383453', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'lip-filler'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '488918', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'lip-filler'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '716616', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'lip-filler'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for microneedling
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '197750', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'microneedling'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '518511', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'microneedling'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '521299', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'microneedling'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '525862', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'microneedling'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '979814', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'microneedling'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for neck-lift
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '111627', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'neck-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '512410', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'neck-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '851416', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'neck-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '955346', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'neck-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '980873', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'neck-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for neck-liposuction
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '123516', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'neck-liposuction'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '177130', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'neck-liposuction'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '291886', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'neck-liposuction'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '394810', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'neck-liposuction'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '897830', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'neck-liposuction'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for platysmaplasty
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '249497', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'platysmaplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '478133', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'platysmaplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '764229', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'platysmaplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '767533', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'platysmaplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '956184', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'platysmaplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for prp-prf
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '118770', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'prp-prf'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '204658', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'prp-prf'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '277789', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'prp-prf'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '447096', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'prp-prf'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '930393', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'prp-prf'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for rhinoplasty
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '151620', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'rhinoplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '397239', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'rhinoplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '482451', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'rhinoplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '537122', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'rhinoplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '740729', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'rhinoplasty'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for thigh-lift
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '268999', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'thigh-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '359879', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'thigh-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '549312', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'thigh-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '835118', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'thigh-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '839910', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'thigh-lift'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for tummy-tuck
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '118225', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'tummy-tuck'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '220776', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'tummy-tuck'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '492633', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'tummy-tuck'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '508166', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'tummy-tuck'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '762163', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'tummy-tuck'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '783284', 'Before and after photos', 'Dr. Heather Lee', 1, 6
FROM procedures WHERE slug = 'tummy-tuck'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- Cases for lip-injections (补充)
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '123823', 'Before and after photos', 'Dr. Heather Lee', 1, 1
FROM procedures WHERE slug = 'lip-injections'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '129513', 'Before and after photos', 'Dr. Heather Lee', 1, 2
FROM procedures WHERE slug = 'lip-injections'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '276797', 'Before and after photos', 'Dr. Heather Lee', 1, 3
FROM procedures WHERE slug = 'lip-injections'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '605007', 'Before and after photos', 'Dr. Heather Lee', 1, 4
FROM procedures WHERE slug = 'lip-injections'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT id, '756953', 'Before and after photos', 'Dr. Heather Lee', 1, 5
FROM procedures WHERE slug = 'lip-injections'
ON CONFLICT (procedure_id, case_number) DO NOTHING;
