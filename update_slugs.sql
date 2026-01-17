-- 在 Supabase SQL Editor 中执行此脚本来更新所有 slug
-- 使 slug 与 R2 文件夹名称匹配

UPDATE procedures SET slug = 'arm-lift' WHERE slug = 'arm-lift-brachioplasty';
UPDATE procedures SET slug = 'brazilian-butt-lift' WHERE slug = 'brazilian-butt-lift-buttock-fat-transfer-buttock-enhancement';
UPDATE procedures SET slug = 'breast-augmentation' WHERE slug = 'breast-augmentation-augmentation-mammoplasty';
UPDATE procedures SET slug = 'breast-lift' WHERE slug = 'breast-lift-mastopexy';
UPDATE procedures SET slug = 'breast-reduction' WHERE slug = 'breast-reduction-reduction-mammaplasty';
UPDATE procedures SET slug = 'brow-lift' WHERE slug = 'brow-lift-forehead-lift';
UPDATE procedures SET slug = 'cervicoplasty' WHERE slug = 'cervicoplasty-neck-lift-neck-contouring-surgery';
UPDATE procedures SET slug = 'chin-augmentation' WHERE slug = 'chin-augmentation-genioplasty-chin-implant';
UPDATE procedures SET slug = 'eyelid-surgery' WHERE slug = 'eyelid-surgery-including-transconjunctival-blepharoplasty';
UPDATE procedures SET slug = 'facelift' WHERE slug = 'facelift-rhytidectomy';
UPDATE procedures SET slug = 'facial-rejuvenation-with-prp' WHERE slug = 'facial-rejuvenation-with-prp-platelet-rich-plasma';
UPDATE procedures SET slug = 'fat-transfer' WHERE slug = 'fat-transfer-facial-fat-grafting';
UPDATE procedures SET slug = 'forehead-reduction-surgery' WHERE slug = 'forehead-reduction-surgery-hairline-lowering';
UPDATE procedures SET slug = 'gynecomastia-surgery' WHERE slug = 'gynecomastia-surgery-male-chest-contouring';
UPDATE procedures SET slug = 'hair-restoration' WHERE slug = 'hair-restoration-hair-transplant-and-medical-therapy';
UPDATE procedures SET slug = 'ipl-photofacial' WHERE slug = 'ipl-photofacial-intense-pulsed-light-treatment';
UPDATE procedures SET slug = 'lip-filler' WHERE slug = 'lip-filler-hyaluronic-acid-lip-augmentation';
UPDATE procedures SET slug = 'lip-injections' WHERE slug = 'lip-injections-non-surgical-lip-augmentation-with-fillers';
UPDATE procedures SET slug = 'lip-injections' WHERE slug = 'lip-injections-hyaluronic-acid-lip-fillers';
UPDATE procedures SET slug = 'lower-body-lift' WHERE slug = 'lower-body-lift-360-body-lift-body-lift';
UPDATE procedures SET slug = 'microneedling' WHERE slug = 'microneedling-collagen-induction-therapy';
UPDATE procedures SET slug = 'midface-lift' WHERE slug = 'midface-lift-mid-facelift';
UPDATE procedures SET slug = 'neck-lift' WHERE slug = 'neck-lift-lower-rhytidectomy-cervicoplasty-platysmaplasty';
UPDATE procedures SET slug = 'neck-liposuction' WHERE slug = 'neck-liposuction-submental-liposuction';
UPDATE procedures SET slug = 'otoplasty' WHERE slug = 'otoplasty-ear-pinning';
UPDATE procedures SET slug = 'platysmaplasty' WHERE slug = 'platysmaplasty-neck-muscle-tightening';
UPDATE procedures SET slug = 'prp-prf' WHERE slug = 'prp-prf-platelet-rich-plasma-platelet-rich-fibrin';
UPDATE procedures SET slug = 'renuvion-skin-tightening' WHERE slug = 'renuvion-skin-tightening-treatment';
UPDATE procedures SET slug = 'rhinoplasty' WHERE slug = 'rhinoplasty-nose-reshaping-surgery';
UPDATE procedures SET slug = 'scar-reduction' WHERE slug = 'scar-reduction-revision';
UPDATE procedures SET slug = 'skin-resurfacing' WHERE slug = 'skin-resurfacing-including-laser-skin-resurfacing';
UPDATE procedures SET slug = 'temples-lift' WHERE slug = 'temples-lift-temporofrontal-lift';
UPDATE procedures SET slug = 'thigh-lift' WHERE slug = 'thigh-lift-thighplasty';
UPDATE procedures SET slug = 'tummy-tuck' WHERE slug = 'tummy-tuck-abdominoplasty';

-- 验证更新结果
SELECT procedure_name, slug FROM procedures ORDER BY procedure_name;

-- 为 Eyelid Surgery 添加 cases（在 slug 更新后执行）
-- 先获取 eyelid-surgery 的 procedure_id
INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT
  id,
  '140856',
  'Upper and lower eyelid surgery with excellent results',
  'Dr. Heather Lee',
  1,
  1
FROM procedures WHERE slug = 'eyelid-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT
  id,
  '323501',
  'Transconjunctival blepharoplasty with natural-looking outcome',
  'Dr. Heather Lee',
  1,
  2
FROM procedures WHERE slug = 'eyelid-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT
  id,
  '496116',
  'Upper eyelid surgery for hooding correction',
  'Dr. Heather Lee',
  1,
  3
FROM procedures WHERE slug = 'eyelid-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT
  id,
  '830402',
  'Lower eyelid surgery for under-eye bags',
  'Dr. Heather Lee',
  1,
  4
FROM procedures WHERE slug = 'eyelid-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

INSERT INTO procedure_cases (procedure_id, case_number, description, provider_name, image_count, sort_order)
SELECT
  id,
  '951908',
  'Combined upper and lower blepharoplasty',
  'Dr. Heather Lee',
  1,
  5
FROM procedures WHERE slug = 'eyelid-surgery'
ON CONFLICT (procedure_id, case_number) DO NOTHING;

-- 验证 cases 添加结果
SELECT pc.case_number, pc.description, p.procedure_name
FROM procedure_cases pc
JOIN procedures p ON p.id = pc.procedure_id
WHERE p.slug = 'eyelid-surgery';
