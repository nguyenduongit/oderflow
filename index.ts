// index.ts
import 'react-native-gesture-handler'; // QUAN TRỌNG: Luôn đặt ở dòng đầu tiên
import { registerRootComponent } from 'expo';

import App from './src/App';

// Đăng ký component App làm component gốc của ứng dụng
registerRootComponent(App);