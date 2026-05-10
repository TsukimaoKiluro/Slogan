<template>
  <div class="h-full bg-base-100 flex items-center justify-center p-4">
    <div class="w-full max-w-6xl h-full shadow-2xl rounded-2xl overflow-hidden bg-base-200 flex flex-col">
      <!-- 顶部导航栏 -->
      <div class="navbar bg-primary text-primary-content shadow-lg px-4">
        <div class="flex-1">
          <button class="btn btn-ghost btn-circle btn-sm" @click="goBack" title="返回">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <span class="text-lg font-bold ml-2">Markdown 编辑器</span>
        </div>
        <div class="flex-none gap-2">
          <div v-if="!isEditing" class="text-sm opacity-80">
            {{ fileName || '未命名文档' }}.md
          </div>
          <input v-else v-model="fileName" type="text" class="input input-sm input-bordered w-48" placeholder="文件名" />
          
          <button v-if="!isEditing" class="btn btn-ghost btn-sm gap-1" @click="toggleEdit">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            编辑
          </button>
          <template v-if="isEditing">
            <button class="btn btn-ghost btn-sm" @click="cancelEdit">取消</button>
            <button class="btn btn-secondary btn-sm gap-1" @click="saveMarkdown" :disabled="saving">
              <span v-if="saving" class="loading loading-spinner loading-xs"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              保存
            </button>
          </template>
        </div>
      </div>

      <!-- 编辑/预览区域 -->
      <div class="flex-1 overflow-hidden">
        <!-- 编辑模式：左右分屏 -->
        <div v-if="isEditing" class="h-full grid grid-cols-2 divide-x divide-base-300">
          <!-- 左侧：编辑器 -->
          <div class="flex flex-col">
            <div class="p-3 border-b border-base-300 bg-base-100">
              <div class="flex items-center gap-2">
                <span class="badge badge-ghost badge-sm">编辑</span>
                <div class="flex gap-1">
                  <button class="btn btn-ghost btn-xs" @click="insertBold" title="加粗 (Ctrl+B)">B</button>
                  <button class="btn btn-ghost btn-xs italic" @click="insertItalic" title="斜体">I</button>
                  <button class="btn btn-ghost btn-xs" @click="insertHeading" title="标题">H</button>
                  <button class="btn btn-ghost btn-xs" @click="insertLink" title="链接">链</button>
                  <button class="btn btn-ghost btn-xs" @click="insertCode" title="代码">码</button>
                  <button class="btn btn-ghost btn-xs" @click="insertList" title="列表">列</button>
                  <button class="btn btn-ghost btn-xs" @click="insertQuote" title="引用">引</button>
                </div>
              </div>
            </div>
            <textarea
              ref="editorRef"
              v-model="markdownContent"
              class="flex-1 p-4 bg-base-100 resize-none focus:outline-none font-mono text-sm leading-relaxed"
              placeholder="在此输入 Markdown 内容..."
              @keydown.ctrl.b.prevent="insertBold"
              @keydown.meta.b.prevent="insertBold"
            ></textarea>
          </div>

          <!-- 右侧：预览 -->
          <div class="flex flex-col overflow-hidden">
            <div class="p-3 border-b border-base-300 bg-base-100">
              <span class="badge badge-ghost badge-sm">预览</span>
            </div>
            <div class="flex-1 p-4 overflow-y-auto prose max-w-none bg-base-100" v-html="renderedHtml"></div>
          </div>
        </div>

        <!-- 预览模式 -->
        <div v-else class="h-full overflow-y-auto p-6 bg-base-100">
          <div v-if="renderedHtml" class="prose max-w-none" v-html="renderedHtml"></div>
          <div v-else class="flex items-center justify-center h-full text-base-content/50">
            <div class="text-center">
              <div class="text-6xl mb-4">📄</div>
              <div>暂无内容</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="showToast" class="toast toast-top toast-center">
      <div class="alert" :class="toastType === 'success' ? 'alert-success' : 'alert-error'">
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const apiBaseUrl = 'http://localhost:3001'

// 状态
const fileName = ref('')           // 显示的文件名/标题（用户自定义）
const originalFileName = ref('')   // 原始文件名（内部使用）
const materialId = ref(null)       // 学习资料ID（如果有）
const materialUrl = ref('')         // 学习资料的文件路径
const markdownContent = ref('')
const isEditing = ref(false)
const saving = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const editorRef = ref(null)

// 计算属性：渲染后的 HTML
const renderedHtml = computed(() => {
  if (!markdownContent.value) return ''
  return renderMarkdown(markdownContent.value)
})

// 简单的 Markdown 渲染函数
const renderMarkdown = (text) => {
  let html = text
    // 转义 HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 标题
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 粗体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 删除线
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    // 代码块
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-neutral text-neutral-content p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code class="bg-base-300 px-1 rounded text-sm">$1</code>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="link link-primary">$1</a>')
    // 图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full" />')
    // 引用
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 my-2 bg-base-200 py-2 rounded-r-lg">$1</blockquote>')
    // 无序列表
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    // 有序列表
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    // 水平线
    .replace(/^---$/gm, '<hr class="my-4" />')
    // 表格（简单支持）
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      if (cells.every(c => c.trim().match(/^-+$/))) {
        return '' // 跳过分隔行
      }
      return '<tr>' + cells.map(c => `<td class="px-4 py-2 border border-base-300">${c.trim()}</td>`).join('') + '</tr>'
    })
    // 换行处理
    .split('\n\n')
    .map(para => {
      if (para.startsWith('<h') || para.startsWith('<pre') || para.startsWith('<blockquote') || para.startsWith('<ul') || para.startsWith('<ol') || para.startsWith('<li') || para.startsWith('<hr') || para.startsWith('<tr')) {
        return para
      }
      return `<p class="my-2">${para.replace(/\n/g, '<br>')}</p>`
    })
    .join('')
  
  // 处理列表包裹
  html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul class="list-disc list-inside my-2 space-y-1">$&</ul>')
  
  // 处理表格
  if (html.includes('<tr>')) {
    html = '<table class="table table-zebra my-4">' + html + '</table>'
  }
  
  return html
}

// 显示 Toast
const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 加载文件
const loadFile = async (filePath) => {
  console.log('【Markdown编辑器】加载文件, path:', filePath)
  try {
    const url = `${apiBaseUrl}/api/markdown/file?path=${encodeURIComponent(filePath)}`
    console.log('【Markdown编辑器】请求URL:', url)
    const response = await fetch(url)
    console.log('【Markdown编辑器】响应状态:', response.status)
    const data = await response.json()
    console.log('【Markdown编辑器】响应数据:', data)
    if (data.success) {
      markdownContent.value = data.content
      const parts = filePath.replace(/\\/g, '/').split('/')
      originalFileName.value = parts[parts.length - 1].replace('.md', '')
      fileName.value = originalFileName.value
    } else {
      showToastMessage('文件加载失败: ' + (data.error || '未知错误'), 'error')
    }
  } catch (error) {
    console.error('加载文件失败:', error)
    showToastMessage('文件加载失败', 'error')
  }
}

// 保存文件
const saveMarkdown = async () => {
  saving.value = true
  
  try {
    let requestBody = {
      content: markdownContent.value
    }
    
    // 有学习资料ID时：保持原文件名，只更新内容和标题
    if (materialId.value && materialUrl.value) {
      // 从 URL 提取原文件名
      const parts = materialUrl.value.replace(/\\/g, '/').split('/')
      const fileName = parts[parts.length - 1]
      requestBody.fileName = fileName
      requestBody.originalFileName = null  // 不重命名
      requestBody.materialId = materialId.value
      requestBody.newTitle = fileName.value  // 新标题
    } else {
      // 新建文档：使用用户输入的名称
      const saveFileName = fileName.value || 'untitled'
      const fullFileName = saveFileName.endsWith('.md') ? saveFileName : saveFileName + '.md'
      requestBody.fileName = fullFileName
      requestBody.originalFileName = originalFileName.value ? originalFileName.value + '.md' : null
    }
    
    const response = await fetch(`${apiBaseUrl}/api/markdown/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    const data = await response.json()
    if (data.success) {
      // 更新标题显示
      fileName.value = data.title || fileName.value
      isEditing.value = false
      showToastMessage('保存成功！')
    } else {
      showToastMessage('保存失败: ' + (data.error || '未知错误'), 'error')
    }
  } catch (error) {
    console.error('保存失败:', error)
    showToastMessage('保存失败，请重试', 'error')
  } finally {
    saving.value = false
  }
}

// 切换编辑模式
const toggleEdit = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  fileName.value = originalFileName.value
}

// 返回
const goBack = () => {
  router.back()
}

// 快捷插入函数
const insertAtCursor = (before, after = '') => {
  const textarea = editorRef.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = markdownContent.value
    const selected = text.substring(start, end)
    markdownContent.value = text.substring(0, start) + before + selected + after + text.substring(end)
    // 设置光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }
}

const insertBold = () => insertAtCursor('**', '**')
const insertItalic = () => insertAtCursor('*', '*')

const insertHeading = () => {
  const textarea = editorRef.value
  if (textarea) {
    const start = textarea.selectionStart
    const text = markdownContent.value
    const lineStart = text.lastIndexOf('\n', start - 1) + 1
    markdownContent.value = text.substring(0, lineStart) + '## ' + text.substring(lineStart)
  }
}

const insertLink = () => insertAtCursor('[', '](url)')

const insertCode = () => {
  const textarea = editorRef.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = markdownContent.value
    const selected = text.substring(start, end)
    if (selected.includes('\n')) {
      insertAtCursor('```\n', '\n```')
    } else {
      insertAtCursor('`', '`')
    }
  }
}

const insertList = () => {
  const textarea = editorRef.value
  if (textarea) {
    const start = textarea.selectionStart
    const text = markdownContent.value
    const lineStart = text.lastIndexOf('\n', start - 1) + 1
    markdownContent.value = text.substring(0, lineStart) + '- ' + text.substring(lineStart)
  }
}

const insertQuote = () => insertAtCursor('> ')

onMounted(() => {
  const filePath = route.query.path
  const title = route.query.title
  const matId = route.query.materialId
  
  // 保存学习资料ID
  if (matId) {
    materialId.value = parseInt(matId) || null
  }
  
  if (filePath) {
    materialUrl.value = filePath
    // 从 URL 中提取原始文件名
    const parts = filePath.replace(/\\/g, '/').split('/')
    originalFileName.value = parts[parts.length - 1].replace('.md', '')
    // 使用学习资料的标题作为显示名称
    fileName.value = title || originalFileName.value
    loadFile(filePath)
  } else {
    // 新建模式
    isEditing.value = true
    markdownContent.value = '# 新文档\n\n在这里开始编写...\n'
    fileName.value = '未命名文档'
    originalFileName.value = ''
  }
})
</script>

<style scoped>
/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: oklch(var(--b3));
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: oklch(var(--b2));
}

/* Prose 样式增强 */
.prose :deep(h1) {
  font-size: 1.75rem;
  font-weight: bold;
  margin: 1.5rem 0 1rem;
  border-bottom: 2px solid oklch(var(--b3));
  padding-bottom: 0.5rem;
}
.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1.25rem 0 0.75rem;
}
.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem;
}
.prose :deep(pre) {
  font-family: 'Fira Code', 'Consolas', monospace;
}
.prose :deep(code) {
  font-family: 'Fira Code', 'Consolas', monospace;
}
.prose :deep(a) {
  text-decoration: underline;
}
.prose :deep(img) {
  margin: 1rem 0;
}
</style>
