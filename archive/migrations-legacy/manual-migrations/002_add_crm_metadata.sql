-- =====================================================
-- Medora Health & Beauty - CRM Metadata Migration
-- 为 CRM 系统添加元数据字段
-- =====================================================
-- Version: 1.0
-- Date: 2026-02-09
-- =====================================================
--
-- 目的:
--   CRM 系统需要存储一些前端展示字段，这些字段在主站数据库
--   schema 中没有对应的列。为了不污染主表结构，我们使用一个
--   JSONB 列来存储这些 CRM 专用字段。
--
-- crm_metadata 将存储:
--   - bedCount: 床位数
--   - patientCapacity: 患者容量
--   - multilingualStaff: 多语言员工支持
--   - airportServices: 机场服务
--   - followUpCare: 术后跟踪服务
--   - amenities: 设施/便利设施
--   - certifications: 认证信息（详细版）
--   - videoTestimonials: 视频见证（CRM管理的）
--
-- 未来计划:
--   将从 highlights JSONB 中提取数据，通过 crm_metadata 生成
--   highlights，实现数据的结构化管理。
--
-- =====================================================

-- 为 hospitals 表添加 crm_metadata 列
ALTER TABLE hospitals
ADD COLUMN IF NOT EXISTS crm_metadata JSONB DEFAULT '{}'::jsonb;

-- 添加注释说明该列用途
COMMENT ON COLUMN hospitals.crm_metadata IS 'CRM系统专用元数据字段，存储床位数、设施、认证等CRM管理的信息';

-- 创建索引以优化查询（可选，如果经常查询 crm_metadata 中的特定字段）
-- CREATE INDEX IF NOT EXISTS idx_hospitals_crm_metadata ON hospitals USING gin(crm_metadata);
