import { ElNotification } from 'element-plus';

export function showNotification(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') {
  ElNotification({
    title,
    message,
    type,
    duration: 2000,
  });
}
