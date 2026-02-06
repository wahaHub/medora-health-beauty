-- =====================================================
-- Medora Health & Beauty - Hospital Seed Data
-- Auto-generated from seed_data.json
-- =====================================================

-- =====================================================
-- 1. Hospitals
-- =====================================================

INSERT INTO hospitals (slug, name, year_established, rating, review_count, hero_image, total_patients, recommend_rate, photos, payment_methods, highlights, is_active, sort_order)
VALUES (
  'bangkok-aesthetic-center',
  'Bangkok Aesthetic Surgery Center',
  2005,
  4.9,
  847,
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2670&auto=format&fit=crop',
  6740,
  94,
  '["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2670&auto=format&fit=crop", "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2670&auto=format&fit=crop", "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2670&auto=format&fit=crop", "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=2670&auto=format&fit=crop", "https://images.unsplash.com/photo-1551190822-a9ce113ac100?q=80&w=2670&auto=format&fit=crop"]'::jsonb,
  '["Visa", "Mastercard", "American Express", "UnionPay", "Wire Transfer", "Cash (THB/USD)", "Medical Financing", "Cryptocurrency"]'::jsonb,
  '[{"icon": "award", "text": "JCI Accredited since 2012"}, {"icon": "shield", "text": "ISO 9001:2015 Certified"}, {"icon": "users", "text": "50,000+ International Patients Served"}, {"icon": "globe", "text": "Multilingual Staff (EN, ZH, KR, JP, AR)"}, {"icon": "wifi", "text": "Private Recovery Suites with Wi-Fi"}, {"icon": "car", "text": "Complimentary Airport Transfer"}, {"icon": "plane", "text": "Medical Tourism Concierge Service"}, {"icon": "heart", "text": "Lifetime Follow-up Care Program"}]'::jsonb,
  true,
  1
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  year_established = EXCLUDED.year_established,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  hero_image = EXCLUDED.hero_image,
  total_patients = EXCLUDED.total_patients,
  recommend_rate = EXCLUDED.recommend_rate,
  photos = EXCLUDED.photos,
  payment_methods = EXCLUDED.payment_methods,
  highlights = EXCLUDED.highlights,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- =====================================================
-- 2. Hospital Translations
-- =====================================================

INSERT INTO hospital_translations (hospital_id, language_code, tagline, description, highlights)
SELECT h.id, 'en', 'World-Class Cosmetic Surgery in the Heart of Bangkok', 'Bangkok Aesthetic Surgery Center is one of Southeast Asia''s most prestigious cosmetic surgery destinations, offering world-class surgical and non-surgical procedures in a state-of-the-art facility. Our center combines the expertise of internationally trained surgeons with cutting-edge technology and the renowned warmth of Thai hospitality.

With nearly two decades of experience serving international patients, we have developed comprehensive care protocols that ensure safety, comfort, and exceptional results. Our facility is JCI-accredited and meets the highest international standards for patient care and safety.', '[{"icon": "award", "text": "JCI Accredited since 2012"}, {"icon": "shield", "text": "ISO 9001:2015 Certified"}, {"icon": "users", "text": "50,000+ International Patients Served"}, {"icon": "globe", "text": "Multilingual Staff (EN, ZH, KR, JP, AR)"}, {"icon": "wifi", "text": "Private Recovery Suites with Wi-Fi"}, {"icon": "car", "text": "Complimentary Airport Transfer"}, {"icon": "plane", "text": "Medical Tourism Concierge Service"}, {"icon": "heart", "text": "Lifetime Follow-up Care Program"}]'::jsonb
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (hospital_id, language_code) DO UPDATE SET
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  updated_at = NOW();


INSERT INTO hospital_translations (hospital_id, language_code, tagline, description, highlights)
SELECT h.id, 'zh', '曼谷心脏地带的世界级整形手术', '曼谷美学外科中心是东南亚最负盛名的整形手术目的地之一，在最先进的设施中提供世界一流的手术和非手术治疗。我们的中心将国际培训的外科医生的专业知识与尖端技术和泰国热情好客的声誉相结合。

凭借近二十年服务国际患者的经验，我们制定了全面的护理协议，确保安全、舒适和卓越的效果。我们的设施获得了 JCI 认证，并符合最高的国际患者护理和安全标准。', '[{"icon": "award", "text": "2012年起获得JCI认证"}, {"icon": "shield", "text": "ISO 9001:2015认证"}, {"icon": "users", "text": "已服务50,000+国际患者"}, {"icon": "globe", "text": "多语言员工(英/中/韩/日/阿)"}, {"icon": "wifi", "text": "带Wi-Fi的私人康复套房"}, {"icon": "car", "text": "免费机场接送"}, {"icon": "plane", "text": "医疗旅游礼宾服务"}, {"icon": "heart", "text": "终身随访护理计划"}]'::jsonb
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (hospital_id, language_code) DO UPDATE SET
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  updated_at = NOW();

-- =====================================================
-- 3. Hospital Rating Breakdown
-- =====================================================

INSERT INTO hospital_rating_breakdown (hospital_id, language_code, label, score, sort_order)
SELECT h.id, 'en', 'Doctor', 4.9, 1
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (hospital_id, language_code, label) DO UPDATE SET
  score = EXCLUDED.score,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_rating_breakdown (hospital_id, language_code, label, score, sort_order)
SELECT h.id, 'en', 'Facilities', 4.8, 2
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (hospital_id, language_code, label) DO UPDATE SET
  score = EXCLUDED.score,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_rating_breakdown (hospital_id, language_code, label, score, sort_order)
SELECT h.id, 'en', 'Staff', 4.9, 3
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (hospital_id, language_code, label) DO UPDATE SET
  score = EXCLUDED.score,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_rating_breakdown (hospital_id, language_code, label, score, sort_order)
SELECT h.id, 'en', 'Language Assistance', 4.8, 4
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (hospital_id, language_code, label) DO UPDATE SET
  score = EXCLUDED.score,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_rating_breakdown (hospital_id, language_code, label, score, sort_order)
SELECT h.id, 'en', 'Support', 4.7, 5
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (hospital_id, language_code, label) DO UPDATE SET
  score = EXCLUDED.score,
  sort_order = EXCLUDED.sort_order;

-- =====================================================
-- 4. Hospital Procedures
-- (Assumes procedures table already has matching procedure_name)
-- =====================================================

INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$2,800 – $5,500', 2800, 5500, true, 1
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Rhinoplasty'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$4,500 – $8,000', 4500, 8000, true, 2
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Facelift'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$3,500 – $6,000', 3500, 6000, true, 3
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Breast Augmentation'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$2,000 – $5,000', 2000, 5000, false, 4
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Liposuction'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$4,000 – $7,500', 4000, 7500, false, 5
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Tummy Tuck'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$1,500 – $3,000', 1500, 3000, true, 6
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Eyelid Surgery'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$4,500 – $8,500', 4500, 8500, false, 7
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Brazilian Butt Lift'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$3,000 – $6,000', 3000, 6000, false, 8
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Hair Transplant (FUE)'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$2,000 – $4,000', 2000, 4000, false, 9
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Chin Augmentation'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$3,500 – $6,500', 3500, 6500, false, 10
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Neck Lift'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$1,200 – $2,500', 1200, 2500, false, 11
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Lip Lift'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;


INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, '$150 – $350', 150, 350, true, 12
FROM hospitals h, procedures p
WHERE h.slug = 'bangkok-aesthetic-center' AND p.procedure_name = 'Botox (per area)'
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;

-- =====================================================
-- 5. Hospital Location
-- =====================================================

INSERT INTO hospital_location (hospital_id, address, phone, email, website, hours, map_embed, latitude, longitude)
SELECT h.id, '888 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand', '+66 2 XXX XXXX', 'info@bangkokaesthetic.com', 'www.bangkokaesthetic.com', 'Mon–Sat: 9:00 AM – 6:00 PM', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.6!2d100.56!3d13.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQzJzQ4LjAiTiAxMDDCsDMzJzM2LjAiRQ!5e0!3m2!1sen!2sth!4v1', 13.73, 100.56
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (hospital_id) DO UPDATE SET
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  hours = EXCLUDED.hours,
  map_embed = EXCLUDED.map_embed,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = NOW();

-- =====================================================
-- 6. Hospital Nearby Attractions
-- =====================================================
-- Clear existing and re-insert
DELETE FROM hospital_nearby_attractions WHERE hospital_id IN (SELECT id FROM hospitals WHERE slug = 'bangkok-aesthetic-center');

INSERT INTO hospital_nearby_attractions (hospital_id, language_code, name, distance, sort_order)
SELECT h.id, 'en', '5 min from BTS Asok Station', '5 min', 1
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO hospital_nearby_attractions (hospital_id, language_code, name, distance, sort_order)
SELECT h.id, 'en', '20 min from Suvarnabhumi Airport', '20 min', 2
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO hospital_nearby_attractions (hospital_id, language_code, name, distance, sort_order)
SELECT h.id, 'en', 'Walking distance to Terminal 21 Shopping Mall', 'walking', 3
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO hospital_nearby_attractions (hospital_id, language_code, name, distance, sort_order)
SELECT h.id, 'en', 'Adjacent to 5-star Sheraton Grande Hotel', 'adjacent', 4
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center';

-- =====================================================
-- 7. Surgeons (Update existing or insert new)
-- =====================================================

-- Surgeon: Dr. Somchai Rattanaphan
INSERT INTO surgeons (surgeon_id, name, title, specialties, experience_years, images, hospital_id)
SELECT 'dr-somchai', 'Dr. Somchai Rattanaphan', 'Chief Plastic Surgeon', '["Rhinoplasty", "Facelift", "Revision Surgery"]'::jsonb, 22, '["https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2670&auto=format&fit=crop"]'::jsonb, h.id
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (surgeon_id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  specialties = EXCLUDED.specialties,
  experience_years = EXCLUDED.experience_years,
  images = EXCLUDED.images,
  hospital_id = EXCLUDED.hospital_id,
  updated_at = NOW();


-- Surgeon: Dr. Narin Kongkiat
INSERT INTO surgeons (surgeon_id, name, title, specialties, experience_years, images, hospital_id)
SELECT 'dr-narin', 'Dr. Narin Kongkiat', 'Senior Cosmetic Surgeon', '["Breast Surgery", "Body Contouring", "Liposuction"]'::jsonb, 18, '["https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2670&auto=format&fit=crop"]'::jsonb, h.id
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (surgeon_id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  specialties = EXCLUDED.specialties,
  experience_years = EXCLUDED.experience_years,
  images = EXCLUDED.images,
  hospital_id = EXCLUDED.hospital_id,
  updated_at = NOW();


-- Surgeon: Dr. Anong Srisawat
INSERT INTO surgeons (surgeon_id, name, title, specialties, experience_years, images, hospital_id)
SELECT 'dr-anong', 'Dr. Anong Srisawat', 'Oculoplastic Specialist', '["Eyelid Surgery", "Brow Lift", "Under-eye Rejuvenation"]'::jsonb, 15, '["https://images.unsplash.com/photo-1594824476967-48c8b964ac31?q=80&w=2670&auto=format&fit=crop"]'::jsonb, h.id
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (surgeon_id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  specialties = EXCLUDED.specialties,
  experience_years = EXCLUDED.experience_years,
  images = EXCLUDED.images,
  hospital_id = EXCLUDED.hospital_id,
  updated_at = NOW();


-- Surgeon: Dr. Piyarat Chaiyakul
INSERT INTO surgeons (surgeon_id, name, title, specialties, experience_years, images, hospital_id)
SELECT 'dr-piyarat', 'Dr. Piyarat Chaiyakul', 'Non-Surgical Aesthetics Director', '["Injectables", "Laser Treatments", "Skin Rejuvenation"]'::jsonb, 12, '["https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2670&auto=format&fit=crop"]'::jsonb, h.id
FROM hospitals h WHERE h.slug = 'bangkok-aesthetic-center'
ON CONFLICT (surgeon_id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  specialties = EXCLUDED.specialties,
  experience_years = EXCLUDED.experience_years,
  images = EXCLUDED.images,
  hospital_id = EXCLUDED.hospital_id,
  updated_at = NOW();

-- =====================================================
-- 8. Reviews
-- =====================================================

INSERT INTO reviews (hospital_id, author_name, country, rating, review_date, procedure_id, language_code, review_text, is_verified)
SELECT h.id, 'Sarah M.', 'Australia', 5, '2024-11-15'::date, p.id, 'en', 'Absolutely incredible experience from start to finish. The hospital is immaculate, the staff speaks perfect English, and Dr. Somchai is a true artist. My nose looks completely natural and I couldn''t be happier. The recovery suite felt like a luxury hotel.', true
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = 'Rhinoplasty'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO reviews (hospital_id, author_name, country, rating, review_date, procedure_id, language_code, review_text, is_verified)
SELECT h.id, 'James L.', 'United Kingdom', 5, '2024-10-28'::date, p.id, 'en', 'I traveled from London specifically for this clinic after extensive research. The results exceeded my expectations. The pre-op consultations were thorough, and the aftercare was world-class. I look 15 years younger and everyone thinks I just came back from holiday.', true
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = 'Facelift'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO reviews (hospital_id, author_name, country, rating, review_date, procedure_id, language_code, review_text, is_verified)
SELECT h.id, 'Yuki T.', 'Japan', 5, '2024-09-20'::date, p.id, 'en', 'Dr. Anong understood exactly what I wanted. The communication was seamless with Japanese-speaking coordinators. Surgery was quick and recovery was smooth. Very happy with the natural-looking results.', true
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = 'Eyelid Surgery'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO reviews (hospital_id, author_name, country, rating, review_date, procedure_id, language_code, review_text, is_verified)
SELECT h.id, 'Ahmed K.', 'UAE', 4, '2024-08-12'::date, p.id, 'en', 'Professional team and excellent facilities. The VIP package included everything from airport pickup to a private recovery suite. Results are great and the savings compared to Dubai are significant. Would definitely recommend.', true
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = 'Liposuction'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO reviews (hospital_id, author_name, country, rating, review_date, procedure_id, language_code, review_text, is_verified)
SELECT h.id, 'Maria G.', 'United States', 5, '2024-07-05'::date, p.id, 'en', 'Dr. Narin is exceptionally skilled. He took the time to understand my goals and recommended the perfect implant size. The facility is modern and clean, and the nursing staff checked on me constantly. Truly a five-star experience.', true
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = 'Breast Augmentation'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO reviews (hospital_id, author_name, country, rating, review_date, procedure_id, language_code, review_text, is_verified)
SELECT h.id, 'Chen Wei', 'China', 5, '2024-06-18'::date, p.id, 'en', 'I chose this hospital because of the Chinese-speaking staff and JCI accreditation. Everything was organized perfectly. My results are beautiful and very natural. The price was a fraction of what it would cost in Shanghai.', true
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = 'Rhinoplasty'
WHERE h.slug = 'bangkok-aesthetic-center';

-- =====================================================
-- 9. Video Testimonials
-- =====================================================

INSERT INTO video_testimonials (hospital_id, language_code, title, video_url, thumbnail_url, duration, procedure_id, country, sort_order)
SELECT h.id, 'en', 'Sarah''s Rhinoplasty Journey', 'https://www.youtube.com/watch?v=example1', 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop', '4:32', p.id, 'Australia', 1
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = 'Rhinoplasty'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO video_testimonials (hospital_id, language_code, title, video_url, thumbnail_url, duration, procedure_id, country, sort_order)
SELECT h.id, 'en', 'James''s Facelift Transformation', 'https://www.youtube.com/watch?v=example2', 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop', '6:15', p.id, 'UK', 2
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = 'Facelift'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO video_testimonials (hospital_id, language_code, title, video_url, thumbnail_url, duration, procedure_id, country, sort_order)
SELECT h.id, 'en', 'Maria''s Breast Augmentation Story', 'https://www.youtube.com/watch?v=example3', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop', '5:48', p.id, 'USA', 3
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = 'Breast Augmentation'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO video_testimonials (hospital_id, language_code, title, video_url, thumbnail_url, duration, procedure_id, country, sort_order)
SELECT h.id, 'en', 'Chen''s Experience from China', 'https://www.youtube.com/watch?v=example4', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop', '3:55', p.id, 'China', 4
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = 'Rhinoplasty'
WHERE h.slug = 'bangkok-aesthetic-center';

-- =====================================================
-- 10. Procedure Cases (Before/After)
-- =====================================================

INSERT INTO procedure_cases (case_number, procedure_id, surgeon_id, hospital_id, patient_age, patient_gender, before_image, after_image)
SELECT 'BAC-0001', p.id, s.surgeon_id, h.id, 32, 'Female', 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop'
FROM hospitals h
JOIN procedures p ON p.procedure_name = 'Rhinoplasty'
JOIN surgeons s ON s.surgeon_id = 'dr-somchai'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO procedure_cases (case_number, procedure_id, surgeon_id, hospital_id, patient_age, patient_gender, before_image, after_image)
SELECT 'BAC-0002', p.id, s.surgeon_id, h.id, 55, 'Female', 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800&auto=format&fit=crop'
FROM hospitals h
JOIN procedures p ON p.procedure_name = 'Facelift'
JOIN surgeons s ON s.surgeon_id = 'dr-somchai'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO procedure_cases (case_number, procedure_id, surgeon_id, hospital_id, patient_age, patient_gender, before_image, after_image)
SELECT 'BAC-0003', p.id, s.surgeon_id, h.id, 28, 'Female', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop'
FROM hospitals h
JOIN procedures p ON p.procedure_name = 'Breast Augmentation'
JOIN surgeons s ON s.surgeon_id = 'dr-narin'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO procedure_cases (case_number, procedure_id, surgeon_id, hospital_id, patient_age, patient_gender, before_image, after_image)
SELECT 'BAC-0004', p.id, s.surgeon_id, h.id, 41, 'Female', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop'
FROM hospitals h
JOIN procedures p ON p.procedure_name = 'Eyelid Surgery'
JOIN surgeons s ON s.surgeon_id = 'dr-anong'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO procedure_cases (case_number, procedure_id, surgeon_id, hospital_id, patient_age, patient_gender, before_image, after_image)
SELECT 'BAC-0005', p.id, s.surgeon_id, h.id, 38, 'Male', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop'
FROM hospitals h
JOIN procedures p ON p.procedure_name = 'Liposuction'
JOIN surgeons s ON s.surgeon_id = 'dr-narin'
WHERE h.slug = 'bangkok-aesthetic-center';


INSERT INTO procedure_cases (case_number, procedure_id, surgeon_id, hospital_id, patient_age, patient_gender, before_image, after_image)
SELECT 'BAC-0006', p.id, s.surgeon_id, h.id, 29, 'Male', 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop'
FROM hospitals h
JOIN procedures p ON p.procedure_name = 'Rhinoplasty'
JOIN surgeons s ON s.surgeon_id = 'dr-somchai'
WHERE h.slug = 'bangkok-aesthetic-center';
