import { ElNotification } from 'element-plus'
import {i18n} from '../i18n'

export function showNotification(
  title: string,
  message: string,
  type: 'success' | 'error' | 'warning' | 'info',
) {
  const { t } = i18n.global

  ElNotification({
    title: t(`notifications.${type}.${title}`) || title,
    message: t(`notifications.${type}.${message}`) || message,
    type,
    duration: 2000,
  })
}
