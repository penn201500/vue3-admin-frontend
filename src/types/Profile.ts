import type { User } from './User'
import type { FormInstance, UploadFile, UploadFiles } from 'element-plus'

export interface ProfileForm {
  username: string
  email: string | null
  phone: string | null
  comment: string | null
  language: string
}

export interface ProfileViewProps {
  user: User | null
}

// Add form instance type
export type ProfileFormInstance = FormInstance | undefined

export interface ProfileFormRules {
    email?: Array<{
      type: 'email'  // Specify the literal type
      message: string
      trigger: 'blur' | 'change'  // Limit to valid trigger types
    }>
    phone?: Array<{
      pattern: RegExp
      message: string
      trigger: 'blur' | 'change'
    }>
  }

// Define avatar upload handler type
export type AvatarChangeHandler = (uploadFile: UploadFile, uploadFiles: UploadFiles) => void
