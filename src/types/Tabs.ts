export interface MenuItem {
  id: number;
  name: string;
  icon?: string | null;
  path: string;
  component: string;
  parent_id?: number | null;
  order_num?: number | null;
  menu_type: string;
  children?: MenuItem[];
}

export interface TabItem {
  id: string;
  title: string;
  path: string;
  component: string;
  icon?: string | null;
  closeable?: boolean;
  isDefault?: boolean;
}
