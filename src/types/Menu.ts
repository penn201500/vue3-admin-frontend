// types.ts
import type { Component } from 'vue'

export interface MenuItem {
  id: number
  name: string
  icon?: string
  parent_id?: number | null
  path?: string
  component?: string
  order_num: number
  perms?: string
  status: number
  remark?: string
  children?: MenuItem[]
}

export interface DragEvent {
  newIndex: number
  oldIndex: number
  item: MenuItem
}

export interface IconInfo {
  name: string
  component: Component
  provider: string
  keywords?: string[]
}

export interface MenuFormData {
  id?: number
  name: string
  icon?: string
  parent_id?: number | null
  path?: string
  component?: string
  order_num: number
  perms?: string
  status: number
  remark?: string
}
