export interface MenuItem {
  id: number;
  name: string;
  icon?: string;
  path: string;
  component: string;
  parent_id?: number;
  order_num?: number;
  menu_type: string;
  children?: MenuItem[];
}

export interface TabItem {
  id: string;
  title: string;
  path: string;
  component: string;
  icon?: string;
  closeable?: boolean;
  isDefault?: boolean;
}
