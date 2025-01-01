<template>
  <el-dropdown @command="handleLanguageChange">
    <el-button link class="flex items-center">
      <el-icon><Switch /></el-icon>
      <span class="ml-1">{{ getCurrentLangLabel }}</span>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="lang in languages"
          :key="lang.value"
          :command="lang.value"
          :disabled="lang.value === currentLang"
        >
          {{ lang.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLangStore } from '@/stores/languageStore'
import { Switch } from '@element-plus/icons-vue'

const langStore = useLangStore()
const currentLang = computed(() => langStore.currentLang)

const languages = [
  { label: 'English', value: 'en' },
  { label: '中文', value: 'zh-hans' },
]

const getCurrentLangLabel = computed(
  () => languages.find((l) => l.value === currentLang.value)?.label,
)

const handleLanguageChange = (lang: string) => {
  if (lang !== currentLang.value) {
    langStore.setLanguage(lang)
  }
}
</script>
