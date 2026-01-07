import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// 🔍 部署版本标识 - 用于验证 Vercel 部署
const DEPLOYMENT_VERSION = '2026-01-07-R2-INTEGRATION';
const DEPLOYMENT_TIME = new Date().toISOString();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🏥 Medora Health & Beauty');
console.log('📦 部署版本:', DEPLOYMENT_VERSION);
console.log('⏰ 构建时间:', DEPLOYMENT_TIME);
console.log('🖼️  R2 图片集成: ✅ 已启用');
console.log('🌐 R2 URL:', import.meta.env.VITE_R2_PUBLIC_URL || '未配置');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </React.StrictMode>
);