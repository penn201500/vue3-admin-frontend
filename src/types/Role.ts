export interface Role {
  id: number
  name: string
  code: string
  status: number
  is_system: boolean
  is_active: boolean
  create_time: string
  update_time: string
  remark: string | null
}

export interface RoleForm {
  name: string
  code: string
  status: number
  remark: string | null
}

export interface RoleQuery {
  search?: string
  ordering?: string
}
