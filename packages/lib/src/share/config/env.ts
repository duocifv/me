import * as dotenv from 'dotenv';

// Load các biến môi trường từ file .env
dotenv.config();

// Định nghĩa cấu trúc kiểu dữ liệu cho các biến môi trường
interface EnvConfig {
  API_URL: string;
  API_KEY: string;
  LOG_LEVEL: string;
  NODE_ENV: string;
}

// Cung cấp giá trị mặc định cho các biến môi trường
const defaultConfig: EnvConfig = {
  API_URL: 'http://localhost:8100/api', // Secret key cho JWT
  API_KEY: '', // API Key
  LOG_LEVEL: 'info', // Cấp độ log
  NODE_ENV: 'development',
};

// Trả về các giá trị từ process.env hoặc giá trị mặc định
export const $config: EnvConfig = {
  API_URL: process.env.DB_FILE_NAME || defaultConfig.API_URL,
  API_KEY: process.env.API_KEY || defaultConfig.API_KEY,
  LOG_LEVEL: process.env.LOG_LEVEL || defaultConfig.LOG_LEVEL,
  NODE_ENV: process.env.NODE_ENV || defaultConfig.NODE_ENV,
};
