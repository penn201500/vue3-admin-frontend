<template>
  <el-dialog
    v-model="dialogVisible"
    :title="menu ? 'Edit Menu' : 'Add Menu'"
    class="w-[90%] sm:w-[500px] mx-auto"
    destroy-on-close
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="px-4">
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" placeholder="Enter menu name" />
      </el-form-item>

      <div class="flex justify-between">
        <el-form-item label="Status">
          <el-radio-group v-model="form.status" class="w-full">
            <el-radio-button :label="1">Enabled</el-radio-button>
            <el-radio-button :label="0">Disabled</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="Permission String">
        <div class="flex items-center gap-2">
          <el-input v-model="form.perms" placeholder="Enter permission string" />
          <el-tooltip content="Permission string format example: system:menu:list">
            <el-icon class="text-gray-400"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </el-form-item> -->
      </div>

      <el-form-item label="Comment" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          rows="3"
          placeholder="Enter comment"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ menu ? 'Update' : 'Create' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
// import { QuestionFilled } from '@element-plus/icons-vue'
import type { MenuItem, MenuFormData } from '@/types/Menu'

const props = defineProps<{
  visible: boolean
  menu?: MenuItem | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', value: Partial<MenuItem>): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const formRef = ref<FormInstance>()
const form = ref<MenuFormData>({
  name: '',
  icon: '',
  perms: '',
  order_num: 0,
  status: 1,
  remark: '',
})

const rules: FormRules = {
  name: [
    { required: true, message: 'Please enter menu name', trigger: 'blur' },
    { min: 2, max: 50, message: 'Length should be 2 to 50 characters', trigger: 'blur' },
  ],
  perms: [
    {
      pattern: /^[a-zA-Z0-9\-_:]*$/,
      message: 'Only letters, numbers, hyphens, underscores and colons',
      trigger: 'blur',
    },
  ],
}

watch(
  () => props.menu,
  (menu) => {
    if (menu) {
      form.value = {
        name: menu.name,
        icon: menu.icon,
        perms: menu.perms,
        order_num: 0,
        status: menu.status,
        remark: menu.remark,
      }
    } else {
      form.value = {
        name: '',
        icon: '',
        perms: '',
        order_num: 0,
        status: 1,
        remark: '',
      }
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', form.value)
    }
  })
}

const handleClose = () => {
  form.value = {
    name: '',
    icon: '',
    perms: '',
    order_num: 0,
    status: 1,
    remark: '',
  }
}
</script>
