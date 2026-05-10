<template>
  <div class="h-full bg-base-100 p-6 overflow-y-auto">
    <div class="max-w-6xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">工具中心</h1>
        <p class="text-base-content/60">高效学习工具集合，提升你的学习效率</p>
      </div>

      <!-- 工具网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="tool in tools" 
          :key="tool.id"
          class="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          @click="openTool(tool)"
        >
          <div class="card-body">
            <div class="flex items-start gap-4">
              <!-- 工具图标 -->
              <div 
                class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                :style="{ backgroundColor: tool.bgColor }"
              >
                {{ tool.icon }}
              </div>
              
              <div class="flex-1">
                <!-- 工具名称 -->
                <h2 class="card-title text-lg">{{ tool.name }}</h2>
                <!-- 工具描述 -->
                <p class="text-sm text-base-content/60 line-clamp-2">{{ tool.description }}</p>
              </div>
            </div>

            <!-- 工具标签 -->
            <div class="flex flex-wrap gap-2 mt-4">
              <span 
                v-for="tag in tool.tags" 
                :key="tag"
                class="badge badge-sm"
                :class="tag === '推荐' ? 'badge-primary' : 'badge-ghost'"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- 添加更多工具卡片（占位） -->
        <div 
          class="card bg-base-200 shadow-lg border-2 border-dashed border-base-300 hover:border-primary transition-colors cursor-pointer opacity-60 hover:opacity-100"
          @click="comingSoon"
        >
          <div class="card-body items-center justify-center min-h-[200px]">
            <div class="w-14 h-14 rounded-xl bg-base-300 flex items-center justify-center text-2xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span class="text-base-content/50">更多工具即将上线</span>
          </div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold mb-4">快速入口</h3>
        <div class="flex flex-wrap gap-3">
          <button 
            v-for="tool in quickTools" 
            :key="tool.path"
            class="btn btn-outline btn-sm gap-2"
            @click="router.push(tool.path)"
          >
            <span>{{ tool.icon }}</span>
            {{ tool.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="showToast" class="toast toast-top toast-center">
      <div class="alert alert-info">
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 工具列表配置
const tools = ref([
  {
    id: 'markdown',
    name: 'Markdown 编辑器',
    icon: '📝',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    description: '支持实时预览、LaTeX 公式、代码高亮的 Markdown 编辑器，适合编写学习笔记和文档',
    tags: ['推荐', '笔记', '文档'],
    path: '/markdown'
  },
  {
    id: 'ppt-editor',
    name: 'PPT 生成器',
    icon: '📊',
    bgColor: 'rgba(234, 88, 12, 0.15)',
    description: '通过简单的大纲编辑，自动生成专业的 PPT 演示文稿，支持下载和分享',
    tags: ['推荐', '演示', 'AI'],
    path: '/ppt-editor'
  },
  {
    id: 'ppt-viewer',
    name: 'PPT 阅览器',
    icon: '📑',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    description: '在线预览 PPT 文件，支持幻灯片导航、缩放、全屏浏览，方便查看和管理 PPT 资料',
    tags: ['预览', '幻灯片', '查看'],
    path: '/ppt-viewer'
  },
  {
    id: 'ai-chat',
    name: 'AI 助手',
    icon: '🤖',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    description: '智能对话助手，支持多轮对话、拍照搜题、资料生成，助力高效学习',
    tags: ['AI', '对话', '搜题'],
    path: '/home'
  },
  {
    id: 'wrong-questions',
    name: '错题本',
    icon: '📚',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    description: '记录学习过程中的错题，按学科分类，方便复习和巩固知识点',
    tags: ['复习', '巩固'],
    path: '/wrong'
  }
])

// 快速入口
const quickTools = computed(() => [
  { name: '新建笔记', icon: '📄', path: '/markdown' },
  { name: '生成 PPT', icon: '📊', path: '/ppt-editor' },
  { name: 'AI 对话', icon: '💬', path: '/home' },
  { name: '查看错题', icon: '📖', path: '/wrong' }
])

// Toast 状态
const showToast = ref(false)
const toastMessage = ref('')

// 打开工具
const openTool = (tool) => {
  router.push(tool.path)
}

// 即将上线提示
const comingSoon = () => {
  toastMessage.value = '更多工具正在开发中，敬请期待！'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}
</script>

<style scoped>
/* 卡片悬停效果 */
.card:hover {
  border-color: oklch(var(--p));
}

/* 行数限制 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
