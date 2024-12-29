import type { Role } from './Role'

export interface User {
  id: number
  username: string
  roles: Role[]
  email: string | null
  avatar: string | null
  phone: string | null
  last_login: string | null
  status: number | null
  create_time: string | null
  update_time: string | null
  comment: string | null
  avatar_url: string | null
  deleted_at: string | null
  is_active: boolean
}
