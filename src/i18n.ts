import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    message: {
      hello: 'Hello World',
    },
  },
  'zh-hans': {
    message: {
      hello: '你好，世界',
    },
  },
};

export const i18n = createI18n({
  legacy: false,
  locale: 'en', // Set default locale
  fallbackLocale: 'en',
  messages,
});
