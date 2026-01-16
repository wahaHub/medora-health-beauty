# 重复文件夹分析报告

> 分析目录: `generated_procedure_hero_images/`
> 分析时间: 2026-01-16

---

## 问题概述

文件夹中存在 **两套编号系统**，导致大量重复：
- **旧编号系统**: 19-47 (按原始 PROCEDURES 列表顺序)
- **新编号系统**: 48-69 (按新的 PROCEDURES 列表顺序)

这两套编号系统在同一手术上产生了冲突。

---

## 重复文件夹详细列表

| 手术名称 | 重复文件夹 1 | 重复文件夹 2 | 建议保留 |
|---------|-------------|-------------|---------|
| Renuvion Skin Tightening | `19_renuvion_skin_tightening` | `21_renuvion_skin_tightening` | 保留一个 |
| Submalar Implants | `20_submalar_implants` | - | 无重复 |
| Laser Liposuction | `20_laser_liposuction` | `22_laser_liposuction` | 保留一个 |
| Skin Resurfacing | `21_skin_resurfacing` | `23_skin_resurfacing` | 保留一个 |
| Fat Transfer | `22_fat_transfer` | `31_fat_transfer` | 保留一个 |
| Lip Filler | `23_lip_filler` | `33_lip_filler` | 保留一个 |
| Laser Skin Resurfacing | `24_laser_skin_resurfacing` | - | 无重复 |
| Lip Lift | `24_lip_lift` | `36_lip_lift` | 保留一个 |
| Microdermabrasion | `25_microdermabrasion` | - | 无重复 |
| Neck Liposuction | `25_neck_liposuction` | `37_neck_liposuction` | 保留一个 |
| Chemical Peels | `26_chemical_peels` | - | 无重复 |
| Neck Tightening | `26_neck_tightening` | `38_neck_tightening` | 保留一个 |
| Non-surgical Skin Tightening | `27_non-surgical_skin_tightening` | - | 无重复 |
| Platysmaplasty | `27_platysmaplasty` | `39_platysmaplasty` | 保留一个 |
| BOTOX & Neurotoxins | `28_botox_&_neurotoxins` | - | 无重复 |
| Cervicoplasty | `28_cervicoplasty` | `40_cervicoplasty` | 保留一个 |
| Dermal Fillers | `29_dermal_fillers` | - | 无重复 |
| Hair Restoration | `29_hair_restoration` | `41_hair_restoration` | 保留一个 |
| Fat Dissolving Injections | `30_fat_dissolving_injections` | - | 无重复 |
| Liposuction | `30_liposuction` | `48_liposuction` | 保留一个 |
| Tummy Tuck | `31_tummy_tuck` | `49_tummy_tuck` | 保留一个 |
| Facial Rejuvenation with PRP | `32_facial_rejuvenation_with_prp` | - | 无重复 |
| Mommy Makeover | `32_mommy_makeover` | `50_mommy_makeover` | 保留一个 |
| Scar Reduction | `33_scar_reduction` | `51_scar_reduction` | 保留一个 |
| Lip Injections | `34_lip_injections` | - | 无重复 |
| Arm Lift | `34_arm_lift` | `53_arm_lift` | 保留一个 |
| Lip Augmentation | `35_lip_augmentation` | - | 无重复 |
| Thigh Lift | `35_thigh_lift` | `54_thigh_lift` | 保留一个 |
| Bra Line Back Lift | `36_bra_line_back_lift` | `55_bra_line_back_lift` | 保留一个 |
| Body Contouring After Weight Loss | `37_body_contouring_after_weight_loss` | `56_body_contouring_after_weight_loss` | 保留一个 |
| Lower Body Lift | `38_lower_body_lift` | `57_lower_body_lift` | 保留一个 |
| Upper Body Lift | `39_upper_body_lift` | `58_upper_body_lift` | 保留一个 |
| Panniculectomy | `40_panniculectomy` | `59_panniculectomy` | 保留一个 |
| Breast Augmentation | `41_breast_augmentation` | `61_breast_augmentation` | 保留一个 |
| Laser Hair Removal | `42_laser_hair_removal` | - | 无重复 |
| Breast Lift | `42_breast_lift` | `62_breast_lift` | 保留一个 |
| IPL / Photofacial | `43_ipl___photofacial` | - | 无重复 |
| Breast Reduction | `43_breast_reduction` | `63_breast_reduction` | 保留一个 |
| Collagen Stimulators | `44_collagen_stimulators___non-ha_fillers` | - | 无重复 |
| Gynecomastia Surgery | `44_gynecomastia_surgery` | `65_gynecomastia_surgery` | 保留一个 |
| Microneedling | `45_microneedling` | - | 无重复 |
| Brazilian Butt Lift | `45_brazilian_butt_lift` | `66_brazilian_butt_lift` | 保留一个 |
| PRP / PRF | `46_prp___prf` | - | 无重复 |
| Buttock Lift | `46_buttock_lift` | `67_buttock_lift` | 保留一个 |
| Mohs Skin Cancer Reconstruction | `47_mohs_skin_cancer_reconstruction` | - | 无重复 |
| Labiaplasty | `47_labiaplasty` | `68_labiaplasty` | 保留一个 |

---

## 重复统计

| 类型 | 数量 |
|-----|------|
| **总文件夹数** | 96 个 |
| **唯一手术数** | 69 个 |
| **重复的文件夹对** | 27 对 |
| **需要删除的文件夹** | 27 个 |

---

## 重复文件夹分组 (按手术名称)

### 1. Renuvion Skin Tightening
- `19_renuvion_skin_tightening`
- `21_renuvion_skin_tightening`

### 2. Laser Liposuction
- `20_laser_liposuction`
- `22_laser_liposuction`

### 3. Skin Resurfacing
- `21_skin_resurfacing`
- `23_skin_resurfacing`

### 4. Fat Transfer
- `22_fat_transfer`
- `31_fat_transfer`

### 5. Lip Filler
- `23_lip_filler`
- `33_lip_filler`

### 6. Lip Lift
- `24_lip_lift`
- `36_lip_lift`

### 7. Neck Liposuction
- `25_neck_liposuction`
- `37_neck_liposuction`

### 8. Neck Tightening
- `26_neck_tightening`
- `38_neck_tightening`

### 9. Platysmaplasty
- `27_platysmaplasty`
- `39_platysmaplasty`

### 10. Cervicoplasty
- `28_cervicoplasty`
- `40_cervicoplasty`

### 11. Hair Restoration
- `29_hair_restoration`
- `41_hair_restoration`

### 12. Liposuction
- `30_liposuction`
- `48_liposuction`

### 13. Tummy Tuck
- `31_tummy_tuck`
- `49_tummy_tuck`

### 14. Mommy Makeover
- `32_mommy_makeover`
- `50_mommy_makeover`

### 15. Scar Reduction
- `33_scar_reduction`
- `51_scar_reduction`

### 16. Arm Lift
- `34_arm_lift`
- `53_arm_lift`

### 17. Thigh Lift
- `35_thigh_lift`
- `54_thigh_lift`

### 18. Bra Line Back Lift
- `36_bra_line_back_lift`
- `55_bra_line_back_lift`

### 19. Body Contouring After Weight Loss
- `37_body_contouring_after_weight_loss`
- `56_body_contouring_after_weight_loss`

### 20. Lower Body Lift
- `38_lower_body_lift`
- `57_lower_body_lift`

### 21. Upper Body Lift
- `39_upper_body_lift`
- `58_upper_body_lift`

### 22. Panniculectomy
- `40_panniculectomy`
- `59_panniculectomy`

### 23. Breast Augmentation
- `41_breast_augmentation`
- `61_breast_augmentation`

### 24. Breast Lift
- `42_breast_lift`
- `62_breast_lift`

### 25. Breast Reduction
- `43_breast_reduction`
- `63_breast_reduction`

### 26. Gynecomastia Surgery
- `44_gynecomastia_surgery`
- `65_gynecomastia_surgery`

### 27. Brazilian Butt Lift
- `45_brazilian_butt_lift`
- `66_brazilian_butt_lift`

### 28. Buttock Lift
- `46_buttock_lift`
- `67_buttock_lift`

### 29. Labiaplasty
- `47_labiaplasty`
- `68_labiaplasty`

---

## 建议操作

### 方案 1: 保留新编号系统 (48-69)，删除旧编号中的重复项

需要删除的旧编号文件夹：
```
19_renuvion_skin_tightening
20_laser_liposuction
21_skin_resurfacing
22_fat_transfer
23_lip_filler
24_lip_lift
25_neck_liposuction
26_neck_tightening
27_platysmaplasty
28_cervicoplasty
29_hair_restoration
30_liposuction
31_tummy_tuck
32_mommy_makeover
33_scar_reduction
34_arm_lift
35_thigh_lift
36_bra_line_back_lift
37_body_contouring_after_weight_loss
38_lower_body_lift
39_upper_body_lift
40_panniculectomy
41_breast_augmentation
42_breast_lift
43_breast_reduction
44_gynecomastia_surgery
45_brazilian_butt_lift
46_buttock_lift
47_labiaplasty
```

### 方案 2: 统一重新编号

建议按照 `PROCEDURE_PROMPTS_REVIEW.md` 中的 1-71 编号重新整理所有文件夹。

---

## 正确的文件夹编号对照表 (按 PROCEDURE_PROMPTS_REVIEW.md)

| 编号 | 手术名称 | 正确文件夹名 |
|-----|---------|-------------|
| 01 | Eyelid Surgery | `01_eyelid_surgery` |
| 02 | Rhinoplasty | `02_rhinoplasty` |
| 03 | Revision Rhinoplasty | `03_revision_rhinoplasty` |
| 04 | Nose Tip Refinement | `04_nose_tip_refinement` |
| 05 | Facelift | `05_facelift` |
| 06 | Mini Facelift | `06_mini_facelift` |
| 07 | Midface Lift | `07_midface_lift` |
| 08 | Neck Lift | `08_neck_lift` |
| 09 | Deep Neck Contouring | `09_deep_neck_contouring` |
| 10 | Brow Lift | `10_brow_lift` |
| 11 | Temples Lift | `11_temples_lift` |
| 12 | Forehead Reduction Surgery | `12_forehead_reduction_surgery` |
| 13 | Cheek Augmentation | `13_cheek_augmentation` |
| 14 | Chin Augmentation | `14_chin_augmentation` |
| 15 | Jawline Contouring | `15_jawline_contouring` |
| 16 | Zygomatic Arch Contouring | `16_zygomatic_arch_contouring` |
| 17 | Otoplasty | `17_otoplasty` |
| 18 | Buccal Fat Removal | `18_buccal_fat_removal` |
| 19 | Facial Implants | `19_facial_implants` |
| 20 | Submalar Implants | `20_submalar_implants` |
| 21 | Renuvion Skin Tightening | `21_renuvion_skin_tightening` |
| 22 | Laser Liposuction | `22_laser_liposuction` |
| 23 | Skin Resurfacing | `23_skin_resurfacing` |
| 24 | Laser Skin Resurfacing | `24_laser_skin_resurfacing` |
| 25 | Microdermabrasion | `25_microdermabrasion` |
| 26 | Chemical Peels | `26_chemical_peels` |
| 27 | Non-surgical Skin Tightening | `27_non-surgical_skin_tightening` |
| 28 | BOTOX & Neurotoxins | `28_botox_&_neurotoxins` |
| 29 | Dermal Fillers | `29_dermal_fillers` |
| 30 | Fat Dissolving Injections | `30_fat_dissolving_injections` |
| 31 | Fat Transfer | `31_fat_transfer` |
| 32 | Facial Rejuvenation with PRP | `32_facial_rejuvenation_with_prp` |
| 33 | Lip Filler | `33_lip_filler` |
| 34 | Lip Injections | `34_lip_injections` |
| 35 | Lip Augmentation | `35_lip_augmentation` |
| 36 | Lip Lift | `36_lip_lift` |
| 37 | Neck Liposuction | `37_neck_liposuction` |
| 38 | Neck Tightening | `38_neck_tightening` |
| 39 | Platysmaplasty | `39_platysmaplasty` |
| 40 | Cervicoplasty | `40_cervicoplasty` |
| 41 | Hair Restoration | `41_hair_restoration` |
| 42 | Laser Hair Removal | `42_laser_hair_removal` |
| 43 | IPL / Photofacial | `43_ipl___photofacial` |
| 44 | Collagen Stimulators / Non-HA Fillers | `44_collagen_stimulators___non-ha_fillers` |
| 45 | Microneedling | `45_microneedling` |
| 46 | PRP / PRF | `46_prp___prf` |
| 47 | Mohs Skin Cancer Reconstruction | `47_mohs_skin_cancer_reconstruction` |
| 48 | Liposuction | `48_liposuction` |
| 49 | Tummy Tuck | `49_tummy_tuck` |
| 50 | Mommy Makeover | `50_mommy_makeover` |
| 51 | Scar Reduction | `51_scar_reduction` |
| 52 | Weight Loss Injections | `52_weight_loss_injections` |
| 53 | Arm Lift | `53_arm_lift` |
| 54 | Thigh Lift | `54_thigh_lift` |
| 55 | Bra Line Back Lift | `55_bra_line_back_lift` |
| 56 | Body Contouring After Weight Loss | `56_body_contouring_after_weight_loss` |
| 57 | Lower Body Lift | `57_lower_body_lift` |
| 58 | Upper Body Lift | `58_upper_body_lift` |
| 59 | Panniculectomy | `59_panniculectomy` |
| 60 | Mons Pubis Reduction / Lift | `60_mons_pubis_reduction___lift` |
| 61 | Breast Augmentation | `61_breast_augmentation` |
| 62 | Breast Lift | `62_breast_lift` |
| 63 | Breast Reduction | `63_breast_reduction` |
| 64 | Breast Implant Removal / Exchange & Revision | `64_breast_implant_removal___exchange_&_revision` |
| 65 | Gynecomastia Surgery | `65_gynecomastia_surgery` |
| 66 | Brazilian Butt Lift | `66_brazilian_butt_lift` |
| 67 | Buttock Lift | `67_buttock_lift` |
| 68 | Labiaplasty | `68_labiaplasty` |
| 69 | Aveli Cellulite Treatment | `69_aveli_cellulite_treatment` |

---

**生成时间**: 2026-01-16
