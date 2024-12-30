import * as ElementPlusIcons from '@element-plus/icons-vue'
import { h, type Component } from 'vue'

export interface IconInfo {
  name: string
  component: Component
  provider: string
  keywords?: string[]
}

export interface IconProvider {
  name: string
  getIcon: (name: string) => Component | null
  getAllIcons: () => IconInfo[]
}

// ElementPlus icon provider
const elementPlusProvider: IconProvider = {
  name: 'element-plus',
  getIcon: (name: string): Component | null => {
    return (ElementPlusIcons as Record<string, Component>)[name] || null
  },
  getAllIcons: () => {
    return Object.entries(ElementPlusIcons).map(([name, component]) => ({
      name,
      component: component as Component,
      provider: 'element-plus',
      keywords: [name.toLowerCase(), name.replace(/([A-Z])/g, ' $1').toLowerCase()],
    }))
  },
}

// Custom icons registry
interface CustomIcon {
  name: string
  svg: string
}

class CustomIconProvider implements IconProvider {
  private icons: Map<string, CustomIcon> = new Map()

  name = 'custom'

  registerIcon(name: string, svg: string) {
    this.icons.set(name, { name, svg })
  }

  getIcon(name: string): Component | null {
    const icon = this.icons.get(name)
    if (!icon) return null

    // Convert SVG to Vue component
    return {
      render() {
        return h('div', { innerHTML: icon.svg, class: 'custom-icon' })
      },
    } as Component
  }

  getAllIcons(): IconInfo[] {
    return Array.from(this.icons.values()).map((icon) => ({
      name: icon.name,
      component: this.getIcon(icon.name)!,
      provider: 'custom',
    }))
  }
}

// Icon registry
class IconRegistry {
  private providers: Map<string, IconProvider> = new Map()
  private customProvider: CustomIconProvider

  constructor() {
    this.providers.set('element-plus', elementPlusProvider)
    this.customProvider = new CustomIconProvider()
    this.providers.set('custom', this.customProvider)
  }

  getIcon(name: string): Component | null {
    for (const provider of this.providers.values()) {
      const icon = provider.getIcon(name)
      if (icon) return icon
    }
    return null
  }

  getAllIcons(): IconInfo[] {
    return Array.from(this.providers.values()).flatMap((provider) => provider.getAllIcons())
  }

  registerCustomIcon(name: string, svg: string) {
    this.customProvider.registerIcon(name, svg)
  }
}

export const iconRegistry = new IconRegistry()

// Helper functions
export const getIcon = (name: string) => iconRegistry.getIcon(name)
export const getAllIcons = () => iconRegistry.getAllIcons()
export const registerCustomIcon = (name: string, svg: string) =>
  iconRegistry.registerCustomIcon(name, svg)
