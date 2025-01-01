import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'

export function showNotification(
  title: string,
  message: string,
  type: 'success' | 'error' | 'warning' | 'info',
) {
  const { t } = useI18n()

  ElNotification({
    title: t(`notifications.${type}.${title}`),
    message: t(`notifications.${type}.${message}`),
    type,
    duration: 2000,
  })
}
