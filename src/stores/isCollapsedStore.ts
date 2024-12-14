import { defineStore } from 'pinia'

export const useIsCollapsedStore = defineStore('isCollapsed', {
  state: () => ({
    isCollapsed: false,
  }),
  actions: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
  },
})
