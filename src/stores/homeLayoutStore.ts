import { defineStore } from 'pinia'

export const useHomeLayoutStore = defineStore('homeLayout', {
  state: () => ({
    isCollapsed: false,
  }),
  actions: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
  },
})
