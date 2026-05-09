<template>
  <div class="task-float-panel" :class="{ expanded: isExpanded }">
    <!-- 收缩状态的圆环按钮 -->
    <div 
      v-if="!isExpanded"
      class="relative cursor-pointer group"
      @click="togglePanel"
    >
      <!-- 圆环进度条 -->
      <div class="radial-progress text-primary" 
           :style=" `--value:${latestProgress}; --size:3rem; --thickness:3px;`" 
           role="progressbar">
      </div>
      
      <!-- 悬浮提示 -->
      <div class="absolute -top-1 -right-1">
        <span v-if="activeCount > 0" class="badge badge-primary badge-xs">{{ activeCount }}</span>
      </div>
      
      <!-- Tooltip -->
      <div class="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div class="bg-base-300 rounded-lg p-2 shadow-lg text-sm whitespace-nowrap">
          <div class="font-medium">工作进度</div>
          <div v-if="latestTask" class="text-xs text-base-content/60 mt-1">
            {{ latestTask.title }}
          </div>
          <div v-else class="text-xs text-base-content/60 mt-1">
            暂无进行中的任务
          </div>
        </div>
      </div>
    </div>

    <!-- 展开状态的面板 -->
    <Transition name="slide">
      <div v-if="isExpanded" class="bg-base-100 rounded-lg shadow-xl border border-base-300 w-80 overflow-hidden">
        <!-- 头部 -->
        <div class="bg-base-200 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="font-medium">工作进度</span>
            <span v-if="activeCount > 0" class="badge badge-primary badge-sm">{{ activeCount }}</span>
          </div>
          <button class="btn btn-ghost btn-xs btn-circle" @click="togglePanel">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 内容区 -->
        <div class="max-h-80 overflow-y-auto">
          <!-- 加载状态 -->
          <div v-if="loading" class="p-6 text-center">
            <span class="loading loading-spinner loading-md text-primary"></span>
          </div>

          <!-- 空状态 -->
          <div v-else-if="tasks.length === 0" class="p-6 text-center text-base-content/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="text-sm">暂无任务记录</p>
            <p class="text-xs mt-1">开始使用 AI 功能吧</p>
          </div>

          <!-- 任务列表 -->
          <ul v-else class="menu menu-sm p-2">
            <li v-for="task in tasks" :key="task.taskId" class="mb-1">
              <div class="flex items-start gap-2 py-2">
                <!-- 状态图标 -->
                <div class="mt-1">
                  <span v-if="task.status === 'pending'" class="loading loading-spinner loading-xs text-warning"></span>
                  <span v-else-if="task.status === 'processing'" class="loading loading-spinner loading-xs text-primary"></span>
                  <span v-else-if="task.status === 'completed'" class="text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span v-else-if="task.status === 'failed'" class="text-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                </div>

                <!-- 任务信息 -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">{{ task.title }}</div>
                  
                  <!-- 进度条 -->
                  <div v-if="task.status === 'processing'" class="mt-1">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-1.5 bg-base-300 rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-primary transition-all duration-300"
                          :style="{ width: task.progress + '%' }"
                        ></div>
                      </div>
                      <span class="text-xs text-base-content/50">{{ task.progress }}%</span>
                    </div>
                  </div>

                  <!-- 状态文本 -->
                  <div class="text-xs text-base-content/50 mt-1">
                    <span v-if="task.status === 'pending'" class="badge badge-ghost badge-xs">等待中</span>
                    <span v-else-if="task.status === 'processing'" class="badge badge-primary badge-xs">处理中</span>
                    <span v-else-if="task.status === 'completed'" class="badge badge-success badge-xs">已完成</span>
                    <span v-else-if="task.status === 'failed'" class="badge badge-error badge-xs">{{ task.error || '失败' }}</span>
                    <span class="mx-1">·</span>
                    <span>{{ formatTime(task.updatedAt || task.createdAt) }}</span>
                  </div>
                </div>

                <!-- 删除按钮 -->
                <button 
                  class="btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100 hover:text-error"
                  @click.stop="removeTask(task.taskId)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- 底部操作 -->
        <div class="border-t border-base-200 px-4 py-2 flex justify-between items-center bg-base-50">
          <div class="text-xs text-base-content/50">
            {{ completedCount }} / {{ tasks.length }} 完成
          </div>
          <button 
            class="btn btn-ghost btn-xs text-error" 
            @click="clearCompleted" 
            :disabled="completedCount === 0"
          >
            清除已完成
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const tasks = ref([])
const loading = ref(true)
const isExpanded = ref(false)

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

const togglePanel = () => {
  isExpanded.value = !isExpanded.value
}

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

const startPolling = () => {
  pollInterval = setInterval(() => {
    if (activeCount.value > 0) {
      loadTasks()
    }
  }, 3000)
}

// 监听事件 - 当有新任务时自动展开
const handleNewTask = () => {
  loadTasks()
}

onMounted(() => {
  loadTasks()
  startPolling()
  window.addEventListener('task-created', handleNewTask)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  window.removeEventListener('task-created', handleNewTask)
})
</script>

<style scoped>
.task-float-panel {
  position: relative;
}

.task-float-panel.expanded {
  position: absolute;
  bottom-0 left-full ml-2;
}

/* 过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
