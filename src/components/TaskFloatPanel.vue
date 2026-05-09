<template>
  <!-- 使用 daisyui dropdown 实现 -->
  <div class="dropdown dropdown-bottom dropdown-end">
    <!-- 触发按钮：圆环进度条 -->
    <div tabindex="0" role="button" class="btn btn-ghost btn-circle relative">
      <!-- 圆环进度 -->
      <div class="radial-progress text-primary transition-all hover:scale-110" 
           :style="`--value:${latestProgress}; --size:2.5rem; --thickness:3px;`" 
           role="progressbar">
      </div>
      
      <!-- 中心图标 -->
      <div class="absolute inset-0 flex items-center justify-center">
        <svg v-if="latestStatus === 'completed'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="latestStatus === 'failed'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      <!-- 活跃任务徽章 -->
      <div v-if="activeCount > 0" class="absolute -top-1 -right-1">
        <span class="badge badge-primary badge-xs">{{ activeCount }}</span>
      </div>
    </div>

    <!-- 下拉面板内容 -->
    <ul tabindex="0" class="dropdown-content z-50 menu p-3 shadow-2xl bg-base-100 rounded-box w-[28rem] max-w-[95vw] border border-base-300">
      <!-- 头部 -->
      <li class="menu-title px-2 py-1">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-sm">工作进度</span>
          <div class="badge badge-ghost badge-sm gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ tasks.length }}
          </div>
        </div>
      </li>
      
      <li class="divider my-0"></li>

      <!-- 内容区 -->
      <li v-if="loading" class="py-6 text-center">
        <span class="loading loading-spinner loading-md text-primary"></span>
      </li>

      <li v-else-if="tasks.length === 0" class="py-6 text-center text-base-content/50">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-sm">暂无任务记录</p>
          <p class="text-xs mt-1 opacity-60">开始使用 AI 功能吧</p>
        </div>
      </li>

      <!-- 任务列表 -->
      <template v-else>
        <li v-for="task in tasks" :key="task.taskId">
          <div class="flex items-start gap-3 py-2 px-1 hover:bg-base-200 rounded-lg transition-colors">
            <!-- 类型图标 -->
            <div class="mt-0.5 shrink-0">
              <span v-if="task.type === 'ppt'" class="text-base">📊</span>
              <span v-else-if="task.type === 'md' || task.type === 'markdown'" class="text-base">📝</span>
              <span v-else-if="task.type === 'video'" class="text-base">🎬</span>
              <span v-else-if="task.status === 'pending'" class="loading loading-spinner loading-sm text-warning"></span>
              <span v-else-if="task.status === 'processing'" class="loading loading-spinner loading-sm text-primary"></span>
              <span v-else-if="task.status === 'completed'">
                <div class="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </span>
              <span v-else-if="task.status === 'failed'">
                <div class="w-5 h-5 rounded-full bg-error/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </span>
            </div>

            <!-- 任务信息 -->
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate pr-2">{{ task.title }}</div>
              
              <!-- 进度条 -->
              <div v-if="task.status === 'processing'" class="flex items-center gap-3 mt-2 pr-2">
                <div class="flex-1">
                  <progress 
                    class="progress progress-primary w-full h-1.5" 
                    :value="task.progress" 
                    max="100"
                  ></progress>
                </div>
                <span class="text-xs text-base-content/60 font-medium shrink-0">{{ task.progress }}%</span>
              </div>

              <!-- 状态标签 -->
              <div class="flex items-center gap-2 mt-1.5">
                <span v-if="task.status === 'pending'" class="badge badge-ghost badge-sm py-1">等待中</span>
                <span v-else-if="task.status === 'processing'" class="badge badge-primary badge-sm py-1 animate-pulse">处理中</span>
                <span v-else-if="task.status === 'completed'" class="badge badge-success badge-sm py-1">已完成</span>
                <span v-else-if="task.status === 'failed'" class="badge badge-error badge-sm py-1">{{ task.error || '失败' }}</span>
                <span class="text-xs text-base-content/40 shrink-0">{{ formatTime(task.updatedAt || task.createdAt) }}</span>
              </div>
            </div>

            <!-- 删除按钮 -->
            <button 
              class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 hover:opacity-100 hover:text-error transition-all shrink-0 mt-1"
              @click.stop="removeTask(task.taskId)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </li>
      </template>

      <!-- 底部统计 -->
      <li class="divider my-0"></li>
      <li>
        <div class="flex justify-between items-center px-1 py-2">
          <div class="flex items-center gap-4 text-sm">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-success"></span>
              <span class="text-success font-medium">{{ completedCount }}</span>
              <span class="text-base-content/50">已完成</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span class="text-primary font-medium">{{ activeCount }}</span>
              <span class="text-base-content/50">进行中</span>
            </div>
          </div>
          <button 
            class="btn btn-ghost btn-xs text-error hover:bg-error/10" 
            @click="clearCompleted" 
            :disabled="completedCount === 0"
          >
            清除已完成
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const tasks = ref([])
const loading = ref(true)

const activeTasks = computed(() => 
  tasks.value.filter(t => t.status === 'pending' || t.status === 'processing')
)
const completedTasks = computed(() => 
  tasks.value.filter(t => t.status === 'completed' || t.status === 'failed')
)
const activeCount = computed(() => activeTasks.value.length)
const completedCount = computed(() => completedTasks.value.length)

const latestTask = computed(() => {
  const processing = tasks.value.find(t => t.status === 'processing')
  if (processing) return processing
  const pending = tasks.value.find(t => t.status === 'pending')
  if (pending) return pending
  return tasks.value[0] || null
})

const latestProgress = computed(() => {
  const task = latestTask.value
  if (!task) return 0
  if (task.status === 'completed') return 100
  if (task.status === 'failed') return 0
  return task.progress || 0
})

const latestStatus = computed(() => latestTask.value?.status || null)

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = (now - date) / 1000

  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const loadTasks = async () => {
  try {
    const res = await fetch('/api/tasks?limit=20')
    const data = await res.json()
    if (data.success) {
      tasks.value = data.data
    }
  } catch (e) {
    console.error('加载任务失败:', e)
  } finally {
    loading.value = false
  }
}

const removeTask = async (taskId) => {
  try {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    tasks.value = tasks.value.filter(t => t.taskId !== taskId)
  } catch (e) {
    console.error('删除任务失败:', e)
  }
}

const clearCompleted = async () => {
  try {
    await fetch('/api/tasks/completed', { method: 'DELETE' })
    tasks.value = tasks.value.filter(t => t.status !== 'completed' && t.status !== 'failed')
  } catch (e) {
    console.error('清除任务失败:', e)
  }
}

// 轮询更新任务状态
let pollInterval = null

// 监听任务创建事件
const handleNewTask = () => {
  loadTasks()
}

onMounted(() => {
  loadTasks()
  pollInterval = setInterval(() => {
    loadTasks()
  }, 3000)
  window.addEventListener('task-created', handleNewTask)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  window.removeEventListener('task-created', handleNewTask)
})
</script>
