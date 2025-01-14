import React from 'react';
import { createRoot } from 'react-dom/client'; // 注意这里的变化
import './index.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container); // 创建根实例
root.render( // 使用根实例的 render 方法
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
