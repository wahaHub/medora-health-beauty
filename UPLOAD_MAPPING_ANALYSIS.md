# 本地文件夹 → R2 上传映射分析

> 分析时间: 2026-01-16
> 本地图片总数: **207 张**（69 个手术 × 3 张图片）
> 图片状态: **全部完整** ✅

---

## 映射规则说明

根据 `utils/imageUtils.ts` 中的 `createSlug` 函数：
```typescript
name.toLowerCase()
    .replace(/[®™©]/g, '')      // 移除特殊符号
    .replace(/[^a-z0-9]+/g, '-') // 非字母数字替换为连字符
    .replace(/^-+|-+$/g, '')     // 移除首尾连字符
```

**R2 路径格式**: `procedures/{slug}/hero.jpg`, `procedures/{slug}/benefits.jpg`, `procedures/{slug}/candidate.jpg`

---

## 完整映射表

| # | 本地文件夹 | R2 目标路径 (slug) | 图片 |
|---|-----------|-------------------|------|
| 01 | `01_eyelid_surgery` | `procedures/eyelid-surgery/` | ✅ hero, benefits, candidate |
| 02 | `02_rhinoplasty` | `procedures/rhinoplasty/` | ✅ hero, benefits, candidate |
| 03 | `03_revision_rhinoplasty` | `procedures/revision-rhinoplasty/` | ✅ hero, benefits, candidate |
| 04 | `04_nose_tip_refinement` | `procedures/nose-tip-refinement/` | ✅ hero, benefits, candidate |
| 05 | `05_facelift` | `procedures/facelift/` | ✅ hero, benefits, candidate |
| 06 | `06_mini_facelift` | `procedures/mini-facelift/` | ✅ hero, benefits, candidate |
| 07 | `07_midface_lift` | `procedures/midface-lift/` | ✅ hero, benefits, candidate |
| 08 | `08_neck_lift` | `procedures/neck-lift/` | ✅ hero, benefits, candidate |
| 09 | `09_deep_neck_contouring` | `procedures/deep-neck-contouring/` | ✅ hero, benefits, candidate |
| 10 | `10_brow_lift` | `procedures/brow-lift/` | ✅ hero, benefits, candidate |
| 11 | `11_temples_lift` | `procedures/temples-lift/` | ✅ hero, benefits, candidate |
| 12 | `12_forehead_reduction_surgery` | `procedures/forehead-reduction-surgery/` | ✅ hero, benefits, candidate |
| 13 | `13_cheek_augmentation` | `procedures/cheek-augmentation/` | ✅ hero, benefits, candidate |
| 14 | `14_chin_augmentation` | `procedures/chin-augmentation/` | ✅ hero, benefits, candidate |
| 15 | `15_jawline_contouring` | `procedures/jawline-contouring/` | ✅ hero, benefits, candidate |
| 16 | `16_zygomatic_arch_contouring` | `procedures/zygomatic-arch-contouring/` | ✅ hero, benefits, candidate |
| 17 | `17_otoplasty` | `procedures/otoplasty/` | ✅ hero, benefits, candidate |
| 18 | `18_buccal_fat_removal` | `procedures/buccal-fat-removal/` | ✅ hero, benefits, candidate |
| 19a | `19_facial_implants` | `procedures/facial-implants/` | ✅ hero, benefits, candidate |
| 19b | `19_renuvion_skin_tightening` | `procedures/renuvion-skin-tightening/` | ✅ hero, benefits, candidate |
| 20a | `20_submalar_implants` | `procedures/submalar-implants/` | ✅ hero, benefits, candidate |
| 20b | `20_laser_liposuction` | `procedures/laser-liposuction/` | ✅ hero, benefits, candidate |
| 21 | `21_skin_resurfacing` | `procedures/skin-resurfacing/` | ✅ hero, benefits, candidate |
| 24 | `24_laser_skin_resurfacing` | `procedures/laser-skin-resurfacing/` | ✅ hero, benefits, candidate |
| 25 | `25_microdermabrasion` | `procedures/microdermabrasion/` | ✅ hero, benefits, candidate |
| 26 | `26_chemical_peels` | `procedures/chemical-peels/` | ✅ hero, benefits, candidate |
| 27 | `27_non-surgical_skin_tightening` | `procedures/non-surgical-skin-tightening/` | ✅ hero, benefits, candidate |
| 28 | `28_botox_&_neurotoxins` | `procedures/botox-neurotoxins/` | ✅ hero, benefits, candidate |
| 29 | `29_dermal_fillers` | `procedures/dermal-fillers/` | ✅ hero, benefits, candidate |
| 30 | `30_fat_dissolving_injections` | `procedures/fat-dissolving-injections/` | ✅ hero, benefits, candidate |
| 31 | `31_fat_transfer` | `procedures/fat-transfer/` | ✅ hero, benefits, candidate |
| 32 | `32_facial_rejuvenation_with_prp` | `procedures/facial-rejuvenation-with-prp/` | ✅ hero, benefits, candidate |
| 33 | `33_lip_filler` | `procedures/lip-filler/` | ✅ hero, benefits, candidate |
| 34 | `34_lip_injections` | `procedures/lip-injections/` | ✅ hero, benefits, candidate |
| 35 | `35_lip_augmentation` | `procedures/lip-augmentation/` | ✅ hero, benefits, candidate |
| 36 | `36_lip_lift` | `procedures/lip-lift/` | ✅ hero, benefits, candidate |
| 37 | `37_neck_liposuction` | `procedures/neck-liposuction/` | ✅ hero, benefits, candidate |
| 38 | `38_neck_tightening` | `procedures/neck-tightening/` | ✅ hero, benefits, candidate |
| 39 | `39_platysmaplasty` | `procedures/platysmaplasty/` | ✅ hero, benefits, candidate |
| 40 | `40_cervicoplasty` | `procedures/cervicoplasty/` | ✅ hero, benefits, candidate |
| 41 | `41_hair_restoration` | `procedures/hair-restoration/` | ✅ hero, benefits, candidate |
| 42 | `42_laser_hair_removal` | `procedures/laser-hair-removal/` | ✅ hero, benefits, candidate |
| 43 | `43_ipl___photofacial` | `procedures/ipl-photofacial/` | ✅ hero, benefits, candidate |
| 44 | `44_collagen_stimulators___non-ha_fillers` | `procedures/collagen-stimulators-non-ha-fillers/` | ✅ hero, benefits, candidate |
| 45 | `45_microneedling` | `procedures/microneedling/` | ✅ hero, benefits, candidate |
| 46 | `46_prp___prf` | `procedures/prp-prf/` | ✅ hero, benefits, candidate |
| 47 | `47_mohs_skin_cancer_reconstruction` | `procedures/mohs-skin-cancer-reconstruction/` | ✅ hero, benefits, candidate |
| 48 | `48_liposuction` | `procedures/liposuction/` | ✅ hero, benefits, candidate |
| 49 | `49_tummy_tuck` | `procedures/tummy-tuck/` | ✅ hero, benefits, candidate |
| 50 | `50_mommy_makeover` | `procedures/mommy-makeover/` | ✅ hero, benefits, candidate |
| 51 | `51_scar_reduction` | `procedures/scar-reduction/` | ✅ hero, benefits, candidate |
| 52 | `52_weight_loss_injections` | `procedures/weight-loss-injections/` | ✅ hero, benefits, candidate |
| 53 | `53_arm_lift` | `procedures/arm-lift/` | ✅ hero, benefits, candidate |
| 54 | `54_thigh_lift` | `procedures/thigh-lift/` | ✅ hero, benefits, candidate |
| 55 | `55_bra_line_back_lift` | `procedures/bra-line-back-lift/` | ✅ hero, benefits, candidate |
| 56 | `56_body_contouring_after_weight_loss` | `procedures/body-contouring-after-weight-loss/` | ✅ hero, benefits, candidate |
| 57 | `57_lower_body_lift` | `procedures/lower-body-lift/` | ✅ hero, benefits, candidate |
| 58 | `58_upper_body_lift` | `procedures/upper-body-lift/` | ✅ hero, benefits, candidate |
| 59 | `59_panniculectomy` | `procedures/panniculectomy/` | ✅ hero, benefits, candidate |
| 60 | `60_mons_pubis_reduction___lift` | `procedures/mons-pubis-reduction-lift/` | ✅ hero, benefits, candidate |
| 61 | `61_breast_augmentation` | `procedures/breast-augmentation/` | ✅ hero, benefits, candidate |
| 62 | `62_breast_lift` | `procedures/breast-lift/` | ✅ hero, benefits, candidate |
| 63 | `63_breast_reduction` | `procedures/breast-reduction/` | ✅ hero, benefits, candidate |
| 64 | `64_breast_implant_removal___exchange_&_revision` | `procedures/breast-implant-removal-exchange-revision/` | ✅ hero, benefits, candidate |
| 65 | `65_gynecomastia_surgery` | `procedures/gynecomastia-surgery/` | ✅ hero, benefits, candidate |
| 66 | `66_brazilian_butt_lift` | `procedures/brazilian-butt-lift/` | ✅ hero, benefits, candidate |
| 67 | `67_buttock_lift` | `procedures/buttock-lift/` | ✅ hero, benefits, candidate |
| 68 | `68_labiaplasty` | `procedures/labiaplasty/` | ✅ hero, benefits, candidate |
| 69 | `69_aveli_cellulite_treatment` | `procedures/aveli-cellulite-treatment/` | ✅ hero, benefits, candidate |

---

## ⚠️ 注意事项

### 编号相同但手术不同（不是重复！）

以下本地文件夹有相同编号但是**不同手术**，都需要上传：

| 编号 | 文件夹 | R2 slug |
|-----|-------|---------|
| 19a | `19_facial_implants` | `facial-implants` |
| 19b | `19_renuvion_skin_tightening` | `renuvion-skin-tightening` |
| 20a | `20_submalar_implants` | `submalar-implants` |
| 20b | `20_laser_liposuction` | `laser-liposuction` |

**这些不会冲突**，因为 R2 的 slug 是根据手术名称生成的，不是根据本地编号。

---

## 统计汇总

| 项目 | 数量 |
|-----|------|
| 本地文件夹总数 | 69 个 |
| 完整手术 (3张图) | **69 个** ✅ |
| 图片总数 | **207 张** |

---

## 上传示例

```
本地: generated_procedure_hero_images/01_eyelid_surgery/hero.jpg
R2:   procedures/eyelid-surgery/hero.jpg

本地: generated_procedure_hero_images/19_facial_implants/hero.jpg
R2:   procedures/facial-implants/hero.jpg

本地: generated_procedure_hero_images/19_renuvion_skin_tightening/hero.jpg
R2:   procedures/renuvion-skin-tightening/hero.jpg

本地: generated_procedure_hero_images/28_botox_&_neurotoxins/hero.jpg
R2:   procedures/botox-neurotoxins/hero.jpg
```

---

## 确认清单

请确认以下内容后再执行上传：

- [ ] 确认 69 个文件夹、207 张图片都要上传
- [ ] 确认编号 19 和 20 的两组文件夹都需要上传（它们是不同手术）
- [ ] 确认 R2 目标路径的 slug 格式正确

---

**生成时间**: 2026-01-16
