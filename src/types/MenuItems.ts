export interface MenuItem {
    id: number
    name: string
    icon?: string | null
    parent_id?: number | null
    order_num?: number | null
    path?: string | null
    component?: string | null
    menu_type?: string | null
    perms?: string | null
    create_time?: string | null
    update_time?: string | null
    remark?: string | null
    children?: MenuItem[] // This allows for nested menus
  }
