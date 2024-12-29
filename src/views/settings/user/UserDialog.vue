<!-- UserDialog.vue -->
<template>
    <el-dialog
      :title="title"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      @closed="handleClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="mt-4"
      >
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" placeholder="Enter username" />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Enter email" />
        </el-form-item>

        <el-form-item label="Phone" prop="phone">
          <el-input v-model="form.phone" placeholder="Enter phone number" />
        </el-form-item>

        <el-form-item label="Password" prop="password" v-if="isAdd">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Enter password"
            show-password
          />
        </el-form-item>

        <el-form-item label="Comment" prop="comment">
          <el-input
            v-model="form.comment"
            type="textarea"
            :rows="3"
            placeholder="Enter comment"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isAdd ? 'Create' : 'Update' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>

  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElNotification } from 'element-plus'
  import apiClient from '@/utils/apiClient'

  interface UserData {
    id: number
    username: string
    email: string
    phone: string
    comment?: string
    roles?: Array<{ id: number; code: string; name: string }>
  }

  interface UserForm {
    username: string
    email: string
    phone: string
    password: string
    comment: string
  }

  interface Props {
    modelValue: boolean
    mode: 'add' | 'edit'
    userData?: UserData
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    mode: 'add',
    userData: undefined
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const title = computed(() => (props.mode === 'add' ? 'Add User' : 'Edit User'))
  const isAdd = computed(() => props.mode === 'add')

  const formRef = ref<FormInstance>()
  const loading = ref(false)

  const form = ref<UserForm>({
    username: '',
    email: '',
    phone: '',
    password: '',
    comment: ''
  })

  const rules: FormRules = {
    username: [
      { required: true, message: 'Please enter username', trigger: 'blur' },
      { min: 3, message: 'Username must be at least 3 characters', trigger: 'blur' }
    ],
    email: [
      { required: true, message: 'Please enter email', trigger: 'blur' },
      { type: 'email', message: 'Please enter valid email', trigger: 'blur' }
    ],
    password: [
      { required: true, message: 'Please enter password', trigger: 'blur' },
      { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
    ],
    phone: [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: 'Please enter valid phone number',
        trigger: 'blur'
      }
    ]
  }

  interface Role {
    id: number
    code: string
    name: string
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      loading.value = true
      try {
        // Get the common role ID first
        const rolesResponse = await apiClient.get<{
          code: number
          data: Role[]
        }>('/role/api/roles/')

        const commonRole = rolesResponse.data.data.find((role) => role.code === 'common')

        if (!commonRole) {
          throw new Error('Common role not found')
        }

        const response = await apiClient.post('/user/api/users/', {
          ...form.value,
          role_ids: [commonRole.id]
        })

        if (response.data.code === 200) {
          ElNotification({
            title: 'Success',
            message: 'User created successfully',
            type: 'success'
          })
          emit('success')
          dialogVisible.value = false
        }
      } catch (error) {
        ElNotification({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to create user',
          type: 'error'
        })
      } finally {
        loading.value = false
      }
    })
  }

  const handleClose = () => {
    formRef.value?.resetFields()
    form.value = {
      username: '',
      email: '',
      phone: '',
      password: '',
      comment: ''
    }
  }
  </script>
