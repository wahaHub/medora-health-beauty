/**
 * Surgeons Data Module
 * 静态医生数据，用于 admin 页面管理
 */

import surgeonsData from './surgeons-data.json' assert { type: 'json' };

/**
 * 获取所有医生数据
 * @returns {Array} 医生列表
 */
export function getAllSurgeons() {
  return surgeonsData.map(surgeon => ({
    ...surgeon,
    surgeon_id: surgeon.id,
    images: {} // 默认空的 images 对象
  }));
}

/**
 * 根据 ID 获取单个医生
 * @param {string} surgeonId - 医生 ID
 * @returns {Object|null} 医生对象
 */
export function getSurgeonById(surgeonId) {
  const surgeon = surgeonsData.find(s => s.id === surgeonId);
  if (!surgeon) return null;

  return {
    ...surgeon,
    surgeon_id: surgeon.id,
    images: {}
  };
}

/**
 * 获取医生总数
 * @returns {number} 医生数量
 */
export function getSurgeonsCount() {
  return surgeonsData.length;
}
