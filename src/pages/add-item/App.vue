<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const type = ref(route.query.type || 'todo')
const isLoading = ref(false)
const error = ref('')
const success = ref(false)

const todoForm = ref({
  text: '',
  subject: '',
  priority: 'medium'
})

const scheduleForm = ref({
  text: '',
  date: '',
  time: '',
  endTime: '',
  subject: '',
  duration: 60
})

const subjects = ref([])
const existingTodos = ref([])
const existingSchedules = ref([])
const selectedDate = ref(new Date().toISOString().split('T')[0])

const loadSubjects = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/subjects')
    const data = await response.json()
    if (data.success) {
      subjects.value = data.data.filter(s => s.enabled)
    }
  } catch (e) {
    console.error('加载学科失败:', e)
  }
}

const loadExistingData = async () => {
  try {
    const [todosRes, schedulesRes] = await Promise.all([
      fetch('http://localhost:3001/api/study/todos'),
      fetch('http://localhost:3001/api/study/schedules')
    ])
    const todosData = await todosRes.json()
    const schedulesData = await schedulesRes.json()
    
    if (todosData.success) {
      existingTodos.value = todosData.data
    }
    if (schedulesData.success) {
      existingSchedules.value = schedulesData.data
    }
  } catch (e) {
    console.error('加载数据失败:', e)
  }
}

onMounted(() => {
  loadSubjects()
  loadExistingData()
  if (type.value === 'schedule') {
    const now = new Date()
    scheduleForm.value.date = now.toISOString().split('T')[0]
    scheduleForm.value.time = '09:00'
    scheduleForm.value.endTime = '10:00'
  }
})

const handleSubmit = async () => {
  if (type.value === 'todo') {
    if (!todoForm.value.text.trim()) {
      error.value = '请输入待办内容'
      return
    }
    isLoading.value = true
    error.value = ''
    try {
      const response = await fetch('http://localhost:3001/api/study/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: todoForm.value.text.trim(),
          subject: todoForm.value.subject,
          priority: todoForm.value.priority
        })
      })
      const data = await response.json()
      if (data.success) {
        success.value = true
        todoForm.value.text = ''
        todoForm.value.priority = 'medium'
        await loadExistingData()
        setTimeout(() => { success.value = false }, 2000)
      } else {
        error.value = data.error || '添加失败'
      }
    } catch (e) {
      error.value = '网络错误，请检查后端服务'
    } finally {
      isLoading.value = false
    }
  } else {
    if (!scheduleForm.value.text.trim()) {
      error.value = '请输入日程内容'
      return
    }
    if (!scheduleForm.value.date) {
      error.value = '请选择日期'
      return
    }
    isLoading.value = true
    error.value = ''
    try {
      const response = await fetch('http://localhost:3001/api/study/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scheduleForm.value.text.trim(),
          date: scheduleForm.value.date,
          time: scheduleForm.value.time,
          endTime: scheduleForm.value.endTime,
          subject: scheduleForm.value.subject
        })
      })
      const data = await response.json()
      if (data.success) {
        success.value = true
        scheduleForm.value.text = ''
        await loadExistingData()
        setTimeout(() => { success.value = false }, 2000)
      } else {
        error.value = data.error || '添加失败'
      }
    } catch (e) {
      error.value = '网络错误，请检查后端服务'
    } finally {
      isLoading.value = false
    }
  }
}

const deleteTodo = async (id) => {
  try {
    await fetch(`http://localhost:3001/api/study/todos/${id}`, { method: 'DELETE' })
    await loadExistingData()
  } catch (e) {
    console.error('删除失败:', e)
  }
}

const deleteSchedule = async (id) => {
  try {
    await fetch(`http://localhost:3001/api/study/schedules/${id}`, { method: 'DELETE' })
    await loadExistingData()
  } catch (e) {
    console.error('删除失败:', e)
  }
}

const goBack = () => {
  router.push('/study-plan')
}

// 待办统计
const todoStats = computed(() => {
  const total = existingTodos.value.length
  const completed = existingTodos.value.filter(t => t.completed).length
  const pending = total - completed
  return { total, completed, pending }
})

// 日程统计
const scheduleStats = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todaySchedules = existingSchedules.value.filter(s => s.schedule_date === today)
  return {
    total: existingSchedules.value.length,
    today: todaySchedules.length
  }
})

// 日历周视图数据
const calendarWeekDays = computed(() => {
  const days = []
  const date = new Date(selectedDate.value)
  const dayOfWeek = date.getDay() || 7
  const monday = new Date(date)
  monday.setDate(date.getDate() - dayOfWeek + 1)
  
  const dayNames = ['一', '二', '三', '四', '五', '六', '日']
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const isToday = dateStr === new Date().toISOString().split('T')[0]
    const isSelected = dateStr === scheduleForm.value.date
    const daySchedules = existingSchedules.value.filter(s => s.schedule_date === dateStr)
    
    days.push({
      date: dateStr,
      dayName: dayNames[i],
      dayNum: d.getDate(),
      isToday,
      isSelected,
      isWeekend: i >= 5,
      schedules: daySchedules
    })
  }
  return days
})

// 周导航
const prevWeek = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 7)
  selectedDate.value = date.toISOString().split('T')[0]
}

const nextWeek = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 7)
  selectedDate.value = date.toISOString().split('T')[0]
}

const selectDate = (dateStr) => {
  scheduleForm.value.date = dateStr
}

const getSubjectDisplay = (name) => {
  const subject = subjects.value.find(s => s.name === name)
  return subject ? subject.displayName : name || '通用'
}

const getPriorityClass = (priority) => {
  const classes = {
    high: 'badge-error',
    medium: 'badge-warning',
    low: 'badge-info'
  }
  return classes[priority] || 'badge-ghost'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 via-base-100 to-base-200 pt-16 px-4 pb-8">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <div class="avatar placeholder">
          <div :class="type === 'todo' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'" class="rounded-full w-12 flex items-center justify-center">
            <svg v-if="type === 'todo'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-bold">
            {{ type === 'todo' ? '添加待办事项' : '添加学习日程' }}
          </h1>
          <p class="text-base-content/60 text-sm flex items-center gap-2 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ type === 'todo' ? '记录需要完成的学习任务' : '规划你的学习时间安排' }}
          </p>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm gap-2" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        返回
      </button>
    </div>

    <!-- 待办清单 -->
    <div v-if="type === 'todo'" class="space-y-6">
      <!-- 顶部三列统计卡片 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 表单卡片 -->
        <div class="card bg-base-100 shadow-xl border-t-4 border-t-primary">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-4">
              <div class="avatar placeholder">
                <div class="bg-primary/10 text-primary rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-base">新建待办</h2>
            </div>

            <div class="form-control w-full">
              <label class="label py-1">
                <span class="label-text font-medium">待办内容</span>
              </label>
              <textarea 
                v-model="todoForm.text"
                class="textarea textarea-bordered h-20 focus:border-primary focus:outline-none"
                placeholder="输入待办事项..."
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-2">
              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text font-medium text-xs">关联学科</span>
                </label>
                <select v-model="todoForm.subject" class="select select-bordered select-sm focus:border-primary">
                  <option value="">无（通用）</option>
                  <option v-for="sub in subjects" :key="sub.name" :value="sub.name">
                    {{ sub.displayName }}
                  </option>
                </select>
              </div>

              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text font-medium text-xs">优先级</span>
                </label>
                <select v-model="todoForm.priority" class="select select-bordered select-sm focus:border-primary">
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>

            <div v-if="error" class="alert alert-error mt-3 py-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ error }}</span>
            </div>

            <div v-if="success" class="alert alert-success mt-3 py-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>添加成功！</span>
            </div>

            <button class="btn btn-primary w-full mt-4" @click="handleSubmit" :disabled="isLoading || success">
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ isLoading ? '添加中...' : '添加待办' }}
            </button>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="card bg-base-100 shadow-xl border-t-4 border-t-info">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-4">
              <div class="avatar placeholder">
                <div class="bg-info/10 text-info rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-base">待办统计</h2>
            </div>
            
            <!-- 统计数据行 -->
            <div class="stats stats-horizontal bg-base-200/50 w-full mb-4">
              <div class="stat py-2 px-3">
                <div class="stat-title text-xs opacity-60">总数</div>
                <div class="stat-value text-2xl text-primary">{{ todoStats.total }}</div>
              </div>
              <div class="stat py-2 px-3">
                <div class="stat-title text-xs opacity-60">已完成</div>
                <div class="stat-value text-xl text-success">{{ todoStats.completed }}</div>
              </div>
              <div class="stat py-2 px-3">
                <div class="stat-title text-xs opacity-60">待完成</div>
                <div class="stat-value text-xl text-warning">{{ todoStats.pending }}</div>
              </div>
            </div>

            <!-- 完成率环形图 -->
            <div class="flex justify-center">
              <div class="relative w-28 h-28">
                <svg class="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="currentColor" stroke-width="8" fill="none" class="text-base-300" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    stroke="currentColor" 
                    stroke-width="8" 
                    fill="none"
                    class="text-success transition-all duration-500"
                    :stroke-dasharray="301"
                    :stroke-dashoffset="301 - (301 * (todoStats.completed / (todoStats.total || 1)))"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-2xl font-bold text-success">{{ Math.round((todoStats.completed / (todoStats.total || 1)) * 100) }}%</span>
                  <span class="text-xs opacity-60">完成率</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 学科分布 -->
        <div class="card bg-base-100 shadow-xl border-t-4 border-t-secondary">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-4">
              <div class="avatar placeholder">
                <div class="bg-secondary/10 text-secondary rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-base">学科分布</h2>
            </div>
            
            <div v-if="subjects.length === 0" class="text-center py-8">
              <div class="badge badge-ghost badge-lg">暂无学科数据</div>
            </div>
            <div v-else class="space-y-3">
              <div v-for="sub in subjects" :key="sub.name" class="flex items-center gap-3 py-1">
                <div class="w-4 h-4 rounded-full shadow-sm" :style="{ backgroundColor: sub.color || '#8B5CF6' }"></div>
                <span class="flex-1 text-sm font-medium">{{ sub.displayName }}</span>
                <div class="badge badge-outline badge-sm">
                  {{ existingTodos.filter(t => t.subject === sub.name).length }} 个
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 待办列表表格 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="avatar placeholder">
                <div class="bg-primary/10 text-primary rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-base">待办列表</h2>
            </div>
            <div class="badge badge-primary badge-outline">{{ existingTodos.length }} 条</div>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-zebra table-compact w-full">
              <thead>
                <tr class="bg-base-200/80">
                  <th class="w-12 text-center">状态</th>
                  <th>内容</th>
                  <th class="w-28 text-center">学科</th>
                  <th class="w-24 text-center">优先级</th>
                  <th class="w-16 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="todo in existingTodos" :key="todo.id" :class="{ 'opacity-60': todo.completed }" class="hover:bg-base-200/30 transition-colors">
                  <td class="text-center">
                    <div class="flex justify-center">
                      <input type="checkbox" class="checkbox checkbox-success checkbox-sm" :checked="todo.completed" disabled />
                    </div>
                  </td>
                  <td>
                    <span class="text-sm" :class="{ 'line-through decoration-success': todo.completed }">{{ todo.text }}</span>
                  </td>
                  <td class="text-center">
                    <span v-if="todo.subject" class="badge badge-ghost badge-sm">
                      {{ getSubjectDisplay(todo.subject) }}
                    </span>
                    <span v-else class="text-base-content/30 text-xs">-</span>
                  </td>
                  <td class="text-center">
                    <div class="flex justify-center">
                      <span class="badge badge-sm" :class="getPriorityClass(todo.priority || 'medium')">
                        {{ (todo.priority || 'medium') === 'high' ? '高' : (todo.priority || 'medium') === 'medium' ? '中' : '低' }}
                      </span>
                    </div>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-ghost btn-xs text-error" @click="deleteTodo(todo.id)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="existingTodos.length === 0">
                  <td colspan="5" class="text-center py-12">
                    <div class="flex flex-col items-center gap-2">
                      <div class="badge badge-ghost badge-lg">暂无待办事项</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习日程 -->
    <div v-else class="space-y-6">
      <!-- 顶部表单和周历 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 表单卡片 -->
        <div class="card bg-base-100 shadow-xl border-t-4 border-t-secondary">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-4">
              <div class="avatar placeholder">
                <div class="bg-secondary/10 text-secondary rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-base">新建日程</h2>
            </div>

            <div class="form-control w-full">
              <label class="label py-1">
                <span class="label-text font-medium">日程内容</span>
              </label>
              <textarea 
                v-model="scheduleForm.text"
                class="textarea textarea-bordered h-16 focus:border-secondary focus:outline-none"
                placeholder="输入学习日程安排..."
              ></textarea>
            </div>

            <div class="form-control mt-2">
              <label class="label py-1">
                <span class="label-text font-medium text-xs">日期</span>
              </label>
              <input 
                v-model="scheduleForm.date"
                type="date" 
                class="input input-bordered input-sm focus:border-secondary focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-3 mt-2">
              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text font-medium text-xs">开始时间</span>
                </label>
                <input 
                  v-model="scheduleForm.time"
                  type="time" 
                  class="input input-bordered input-sm focus:border-secondary focus:outline-none"
                />
              </div>
              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text font-medium text-xs">结束时间</span>
                </label>
                <input 
                  v-model="scheduleForm.endTime"
                  type="time" 
                  class="input input-bordered input-sm focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            <div class="form-control mt-2">
              <label class="label py-1">
                <span class="label-text font-medium text-xs">关联学科</span>
              </label>
              <select v-model="scheduleForm.subject" class="select select-bordered select-sm focus:border-secondary">
                <option value="">通用</option>
                <option v-for="sub in subjects" :key="sub.name" :value="sub.name">
                  {{ sub.displayName }}
                </option>
              </select>
            </div>

            <div v-if="error" class="alert alert-error mt-3 py-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ error }}</span>
            </div>

            <div v-if="success" class="alert alert-success mt-3 py-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>添加成功！</span>
            </div>

            <button class="btn btn-secondary w-full mt-4" @click="handleSubmit" :disabled="isLoading || success">
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ isLoading ? '添加中...' : '添加日程' }}
            </button>
          </div>
        </div>

        <!-- 周历视图 -->
        <div class="card bg-base-100 shadow-xl lg:col-span-2 border-t-4 border-t-accent">
          <div class="card-body">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="avatar placeholder">
                  <div class="bg-accent/10 text-accent rounded-full w-8 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h2 class="card-title text-base">周历视图</h2>
              </div>
              <div class="join">
                <button class="btn btn-ghost btn-sm join-item" @click="prevWeek">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button class="btn btn-ghost btn-sm join-item">
                  <span class="text-sm font-medium min-w-[80px]">
                    {{ new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' }) }}
                  </span>
                </button>
                <button class="btn btn-ghost btn-sm join-item" @click="nextWeek">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 周日期网格 - 统一大小 -->
            <div class="grid grid-cols-7 gap-2">
              <div 
                v-for="day in calendarWeekDays" 
                :key="day.date"
                class="min-h-[100px] rounded-lg p-2 text-center transition-all cursor-pointer border-2 flex flex-col"
                :class="{
                  'border-secondary bg-secondary/10': day.isSelected,
                  'border-base-200 hover:border-base-300 hover:bg-base-200/30': !day.isSelected,
                  'border-error bg-error/10': day.isToday && !day.isSelected,
                  'bg-base-200/30': day.isWeekend && !day.isSelected && !day.isToday
                }"
                @click="selectDate(day.date)"
              >
                <div class="text-xs font-medium text-base-content/60 mb-1">{{ day.dayName }}</div>
                <div class="text-xl font-bold mx-auto" :class="{ 'text-error': day.isToday }">{{ day.dayNum }}</div>
                <div class="mt-auto space-y-1">
                  <div 
                    v-for="(schedule, idx) in day.schedules.slice(0, 2)" 
                    :key="idx"
                    class="text-xs truncate bg-secondary/20 text-secondary-content rounded px-1 py-0.5"
                  >
                    {{ schedule.text }}
                  </div>
                  <div v-if="day.schedules.length > 2" class="text-xs text-base-content/50 font-medium">
                    +{{ day.schedules.length - 2 }} 更多
                  </div>
                </div>
              </div>
            </div>

            <!-- 选中日期的日程 -->
            <div class="mt-4 p-3 bg-base-200/50 rounded-lg">
              <div class="text-sm font-medium mb-3 flex items-center gap-2">
                <span class="badge badge-secondary badge-sm">选中日期</span>
                {{ new Date(scheduleForm.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }) }}
              </div>
              <div v-if="existingSchedules.filter(s => s.schedule_date === scheduleForm.date).length === 0" 
                   class="text-center py-6">
                <div class="badge badge-ghost">暂无日程安排</div>
              </div>
              <div v-else class="space-y-2 max-h-48 overflow-y-auto">
                <div 
                  v-for="schedule in existingSchedules.filter(s => s.schedule_date === scheduleForm.date)" 
                  :key="schedule.id"
                  class="flex items-center gap-3 p-2 bg-base-100 rounded-lg hover:bg-base-200/50 transition-colors"
                >
                  <div class="w-1 h-10 bg-secondary rounded-full"></div>
                  <div class="flex-1">
                    <div class="text-sm font-medium">{{ schedule.text }}</div>
                    <div class="text-xs text-base-content/60 flex items-center gap-2">
                      <span class="badge badge-ghost badge-xs">{{ schedule.time || '09:00' }}</span>
                      <span>-</span>
                      <span class="badge badge-ghost badge-xs">{{ schedule.end_time || schedule.time || '10:00' }}</span>
                    </div>
                  </div>
                  <span v-if="schedule.subject" class="badge badge-outline badge-xs">
                    {{ getSubjectDisplay(schedule.subject) }}
                  </span>
                  <button class="btn btn-ghost btn-xs text-error" @click="deleteSchedule(schedule.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 日程列表表格 -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="avatar placeholder">
                <div class="bg-secondary/10 text-secondary rounded-full w-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
              </div>
              <h2 class="card-title text-base">日程列表</h2>
            </div>
            <div class="flex gap-2">
              <div class="badge badge-secondary badge-outline">{{ scheduleStats.total }} 条</div>
              <div class="badge badge-ghost">今日 {{ scheduleStats.today }} 条</div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-zebra table-compact w-full">
              <thead>
                <tr class="bg-base-200/80">
                  <th class="w-28 text-center">日期</th>
                  <th class="w-32 text-center">时间</th>
                  <th>内容</th>
                  <th class="w-28 text-center">学科</th>
                  <th class="w-16 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="schedule in existingSchedules" :key="schedule.id" class="hover:bg-base-200/30 transition-colors">
                  <td class="text-center">
                    <span :class="{ 'text-error font-medium badge badge-error badge-outline badge-sm timecontainer': schedule.schedule_date === new Date().toISOString().split('T')[0] }">
                      {{ schedule.schedule_date }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="badge badge-ghost badge-sm">
                      {{ schedule.time || '--:--' }} ~ {{ schedule.end_time || '--:--' }}
                    </div>
                  </td>
                  <td>
                    <span class="text-sm font-medium">{{ schedule.text }}</span>
                  </td>
                  <td class="text-center">
                    <span v-if="schedule.subject" class="badge badge-outline badge-xs">
                      {{ getSubjectDisplay(schedule.subject) }}
                    </span>
                    <span v-else class="text-base-content/30 text-xs">-</span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-ghost btn-xs text-error" @click="deleteSchedule(schedule.id)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="existingSchedules.length === 0">
                  <td colspan="5" class="text-center py-12">
                    <div class="flex flex-col items-center gap-2">
                      <div class="badge badge-ghost badge-lg">暂无日程安排</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
  .timecontainer {
    padding: 1rem 5rem;
    white-space: nowrap;

  }
</style>
