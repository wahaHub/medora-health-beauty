# CASE_ALLOCATION_PLAN 驴唇不对马嘴匹配分析

## 结论摘要
- 总案例数: 332
- 完全驴唇不对马嘴: 32

## 判定规则(保守版)
- 将手术与医生专长按区域粗分: face/neck、body/breast、skin/injectables、hair、reconstructive
- 允许的“差不多”匹配: body 与 breast 互相视为可接受; face 与 skin/injectables 互相视为可接受
- 其余区域无重叠时判为“完全不匹配”

## 数据来源
- CASE_ALLOCATION_PLAN.md (生成日期 2026-01-23; 含每个 case 的 surgeon specialties)

## 不匹配类型分布
- face/neck -> body/breast: 13
- body/breast -> face/neck: 12
- skin/injectables -> reconstructive: 3
- hair -> body/breast: 2
- skin/injectables -> body/breast: 2

## 具体清单
| Procedure | Case # | Surgeon | Surgeon Specialties | Mismatch Type |
|---|---|---|---|---|
| Arm Lift | 185670 | Dr. Andrew Marshall | Advanced Lip Fillers, Lip Lift Techniques, Perioral Rejuvenation | body/breast -> face/neck |
| Arm Lift | 698909 | Dr. Amanda Brooks | Neck Lift, Cervicoplasty, Platysmaplasty | body/breast -> face/neck |
| Breast Implant Removal / Exchange & Revision | 610002 | Dr. Li Wang | Revision Rhinoplasty, Nose Tip Refinement, Rhinoplasty | body/breast -> face/neck |
| Breast Implant Removal / Exchange & Revision | 633193 | Dr. Hong Liu | IPL/Photofacial, Laser Hair Removal, Skin Tightening | body/breast -> face/neck |
| Breast Implant Removal / Exchange & Revision | 684069 | Dr. Sarah Thompson | Mohs Skin Cancer Reconstruction, Scar Reduction & Revision, Facial Trauma | body/breast -> face/neck |
| Breast Implant Removal / Exchange & Revision | 876007 | Dr. Hong Liu | IPL/Photofacial, Laser Hair Removal, Skin Tightening | body/breast -> face/neck |
| Breast Reduction | 831879 | Dr. Sarah Thompson | Mohs Skin Cancer Reconstruction, Scar Reduction & Revision, Facial Trauma | body/breast -> face/neck |
| Brow Lift | 670310 | Dr. William Foster | 360 Body Lift, Upper Body Lift, Lower Body Lift | face/neck -> body/breast |
| Buttock Lift | 664362 | Dr. Robert Harrison | Midface Lift, Cheek Augmentation, Submalar Implants | body/breast -> face/neck |
| Facial Implants | 822872 | Dr. Stephanie Powell | Male Breast Reduction, Chest Masculinization, Pectoral Implants | face/neck -> body/breast |
| Forehead Reduction Surgery | 409153 | Dr. Hua Xu | Breast Augmentation, Breast Lift, Breast Reduction | face/neck -> body/breast |
| Hair Restoration | 300910 | Dr. Nathan Phillips | Post-Pregnancy Body Restoration, Combined Body Procedures, Abdominal Restoration | hair -> body/breast |
| Hair Restoration | 465996 | Dr. Nathan Phillips | Post-Pregnancy Body Restoration, Combined Body Procedures, Abdominal Restoration | hair -> body/breast |
| Laser Hair Removal | 338627 | Dr. Qing Ma | Breast Implant Removal, Breast Revision, Gynecomastia Surgery | skin/injectables -> body/breast |
| Lip Augmentation | 191649 | Dr. Samantha Wood | BBL, Buttock Enhancement, Hip Augmentation | face/neck -> body/breast |
| Microneedling | 197750 | Dr. Joseph Reynolds | Microsurgical Reconstruction, Free Flap Surgery, Lymphedema Treatment | skin/injectables -> reconstructive |
| Microneedling | 525862 | Dr. Joseph Reynolds | Microsurgical Reconstruction, Free Flap Surgery, Lymphedema Treatment | skin/injectables -> reconstructive |
| Microneedling | 979814 | Dr. Joseph Reynolds | Microsurgical Reconstruction, Free Flap Surgery, Lymphedema Treatment | skin/injectables -> reconstructive |
| Midface Lift | 114083 | Dr. Hua Xu | Breast Augmentation, Breast Lift, Breast Reduction | face/neck -> body/breast |
| Midface Lift | 704424 | Dr. Samantha Wood | BBL, Buttock Enhancement, Hip Augmentation | face/neck -> body/breast |
| Mini Facelift | 898835 | Dr. Ryan Barnes | Extended Tummy Tuck, Mini Abdominoplasty, Fleur-de-Lis Tummy Tuck | face/neck -> body/breast |
| Mons Pubis Reduction / Lift | 108891 | Dr. Andrew Marshall | Advanced Lip Fillers, Lip Lift Techniques, Perioral Rejuvenation | body/breast -> face/neck |
| Mons Pubis Reduction / Lift | 296904 | Dr. Jennifer Coleman | Forehead Reduction Surgery, Brow Lift, Temples Lift | body/breast -> face/neck |
| Neck Lift | 111627 | Dr. Jun Yang | Arm Lift (Brachioplasty), Thigh Lift, Bra Line Back Lift | face/neck -> body/breast |
| Scar Reduction & Revision | 912455 | Dr. Hua Xu | Breast Augmentation, Breast Lift, Breast Reduction | skin/injectables -> body/breast |
| Submalar Implants | 248806 | Dr. Stephanie Powell | Male Breast Reduction, Chest Masculinization, Pectoral Implants | face/neck -> body/breast |
| Submalar Implants | 269626 | Dr. Stephanie Powell | Male Breast Reduction, Chest Masculinization, Pectoral Implants | face/neck -> body/breast |
| Submalar Implants | 591422 | Dr. Stephanie Powell | Male Breast Reduction, Chest Masculinization, Pectoral Implants | face/neck -> body/breast |
| Temples Lift / Temporofrontal Lift | 437902 | Dr. Samantha Wood | BBL, Buttock Enhancement, Hip Augmentation | face/neck -> body/breast |
| Temples Lift / Temporofrontal Lift | 654108 | Dr. Hua Xu | Breast Augmentation, Breast Lift, Breast Reduction | face/neck -> body/breast |
| Thigh Lift | 268999 | Dr. Amanda Brooks | Neck Lift, Cervicoplasty, Platysmaplasty | body/breast -> face/neck |
| Upper Body Lift | 550666 | Dr. Yue Liu | Eyelid Surgery, Brow Lift, Temples Lift | body/breast -> face/neck |
