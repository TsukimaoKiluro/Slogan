<template>
  <div class="flex h-[calc(100vh-4rem)] bg-base-200">
    <!-- 左侧模板面板 -->
    <div class="w-80 bg-base-100 border-r border-base-300 flex flex-col">
      <div class="p-4 border-b border-base-300">
        <h2 class="text-lg font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          模板库
        </h2>
      </div>

      <!-- 模板分类 -->
      <div class="tabs tabs-boxed bg-base-200 m-3">
        <a class="tab tab-sm" :class="{ 'tab-active': templateTab === 'preset' }" @click="templateTab = 'preset'">预设模板</a>
        <a class="tab tab-sm" :class="{ 'tab-active': templateTab === 'user' }" @click="templateTab = 'user'">我的模板</a>
      </div>

      <!-- 预设模板列表 -->
      <div v-if="templateTab === 'preset'" class="flex-1 overflow-y-auto p-3 space-y-2">
        <div
          v-for="tpl in presetTemplates"
          :key="tpl.id"
          class="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors"
          :class="{ 'ring-2 ring-primary': selectedTemplate?.id === tpl.id }"
          @click="selectTemplate(tpl)"
        >
          <div class="card-body p-3">
            <h3 class="card-title text-sm">{{ tpl.name }}</h3>
            <p class="text-xs text-base-content/60">{{ tpl.description }}</p>
          </div>
        </div>
      </div>

      <!-- 用户模板列表 -->
      <div v-else class="flex-1 overflow-y-auto p-3 space-y-2">
        <div v-if="userTemplates.length === 0" class="text-center text-base-content/50 py-8">
          <p class="text-sm">暂无自定义模板</p>
          <p class="text-xs mt-1">生成 PPT 后可保存为模板</p>
        </div>
        <div
          v-for="tpl in userTemplates"
          :key="tpl.id"
          class="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors"
          :class="{ 'ring-2 ring-primary': selectedTemplate?.id === tpl.id }"
          @click="selectTemplate(tpl)"
        >
          <div class="card-body p-3">
            <div class="flex justify-between items-start">
              <h3 class="card-title text-sm">{{ tpl.name }}</h3>
              <button class="btn btn-ghost btn-xs btn-circle" @click.stop="deleteTemplate(tpl.id)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-base-content/60">{{ tpl.description || '无描述' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col">
      <!-- 工具栏 -->
      <div class="bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold">PPT 生成器</h1>
          <div class="text-sm text-base-content/60">
            共 <span class="text-primary font-bold">{{ slideCount }}</span> 张幻灯片
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-ghost" @click="previewMode = !previewMode">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ previewMode ? '编辑模式' : '预览模式' }}
          </button>
          <button class="btn btn-sm btn-primary" :disabled="isGenerating" @click="generatePPT">
            <span v-if="isGenerating" class="loading loading-spinner loading-xs"></span>
            {{ isGenerating ? '生成中...' : '生成 PPT' }}
          </button>
        </div>
      </div>

      <!-- 编辑/预览区域 -->
      <div class="flex-1 overflow-hidden">
        <!-- 编辑模式 -->
        <div v-if="!previewMode" class="h-full flex">
          <!-- 大纲编辑器 -->
          <div class="w-1/2 border-r border-base-300 overflow-y-auto p-6 bg-base-200">
            <div class="max-w-2xl mx-auto space-y-4">
              <!-- 基本信息 -->
              <div class="card bg-base-100">
                <div class="card-body">
                  <h3 class="card-title text-sm">基本信息</h3>
                  <div class="form-control">
                    <label class="label"><span class="label-text">PPT 标题</span></label>
                    <input v-model="formData.title" type="text" placeholder="请输入 PPT 标题" class="input input-bordered" />
                  </div>
                  <div class="form-control mt-2">
                    <label class="label"><span class="label-text">副标题</span></label>
                    <input v-model="formData.subtitle" type="text" placeholder="请输入副标题（可选）" class="input input-bordered input-sm" />
                  </div>
                </div>
              </div>

              <!-- 内容大纲 -->
              <div class="card bg-base-100">
                <div class="card-body">
                  <div class="flex justify-between items-center">
                    <h3 class="card-title text-sm">内容大纲</h3>
                    <button class="btn btn-xs btn-ghost" @click="addSlide">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      添加幻灯片
                    </button>
                  </div>
                  <div class="space-y-3 mt-2">
                    <div v-for="(slide, index) in formData.slides" :key="index" class="bg-base-200 rounded-lg p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="badge badge-primary badge-sm">第 {{ index + 1 }} 张</span>
                        <button class="btn btn-ghost btn-xs btn-circle" @click="removeSlide(index)" :disabled="formData.slides.length <= 1">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <input v-model="slide.title" type="text" placeholder="幻灯片标题" class="input input-bordered input-sm w-full mb-2" />
                      <textarea v-model="slide.content" placeholder="内容（每行一个要点）" class="textarea textarea-bordered textarea-sm w-full h-24"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 高级选项 -->
              <div class="card bg-base-100">
                <div class="card-body">
                  <h3 class="card-title text-sm">高级选项</h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="form-control">
                      <label class="label"><span class="label-text text-xs">主题风格</span></label>
                      <select v-model="formData.theme" class="select select-bordered select-sm">
                        <option value="academic-blue">学术蓝调</option>
                        <option value="math-purple">数学紫韵</option>
                        <option value="physics-green">物理绿光</option>
                        <option value="english-gold">英伦金风</option>
                        <option value="program-dark">编程深空</option>
                        <option value="politics-red">政治红韵</option>
                      </select>
                    </div>
                    <div class="form-control">
                      <label class="label"><span class="label-text text-xs">配色方案</span></label>
                      <select v-model="formData.colorScheme" class="select select-bordered select-sm">
                        <option value="blue">蓝色系 - 理性严谨</option>
                        <option value="purple">紫色系 - 学术典雅</option>
                        <option value="green">绿色系 - 自然和谐</option>
                        <option value="red">红色系 - 热情活力</option>
                        <option value="gold">金色系 - 温暖智慧</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 保存选项 -->
              <div class="card bg-base-100">
                <div class="card-body">
                  <h3 class="card-title text-sm">保存选项</h3>
                  <div class="form-control">
                    <label class="cursor-pointer label justify-start gap-3">
                      <input type="checkbox" v-model="formData.saveToLearningCenter" class="checkbox checkbox-primary checkbox-sm" />
                      <span class="label-text">同时保存到学习中心</span>
                    </label>
                  </div>
                  <div class="form-control mt-2">
                    <label class="cursor-pointer label justify-start gap-3">
                      <input type="checkbox" v-model="formData.saveAsTemplate" class="checkbox checkbox-primary checkbox-sm" />
                      <span class="label-text">保存为模板</span>
                    </label>
                  </div>
                  <div v-if="formData.saveAsTemplate" class="mt-3 space-y-2">
                    <input v-model="formData.templateName" type="text" placeholder="模板名称" class="input input-bordered input-sm w-full" />
                    <input v-model="formData.templateDesc" type="text" placeholder="模板描述（可选）" class="input input-bordered input-sm w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 实时预览 -->
          <div class="w-1/2 p-6 bg-base-300 overflow-y-auto">
            <div class="max-w-xl mx-auto">
              <div class="text-center mb-4">
                <span class="badge badge-ghost">实时预览</span>
              </div>
              <div class="space-y-4">
                <div v-for="(slide, index) in formData.slides" :key="index" class="bg-white rounded-lg shadow-lg p-6 aspect-video flex flex-col">
                  <div class="text-xs text-gray-400 mb-2">第 {{ index + 1 }} 张</div>
                  <h3 class="text-lg font-bold text-gray-800 mb-2">{{ slide.title || '无标题' }}</h3>
                  <div class="text-sm text-gray-600 flex-1">
                    <div v-for="(line, li) in (slide.content || '').split('\n').filter(l => l.trim())" :key="li" class="mb-1">
                      • {{ line }}
                    </div>
                    <div v-if="!slide.content" class="text-gray-300 italic">请输入内容...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 预览模式 -->
        <div v-else class="h-full flex items-center justify-center bg-base-300 p-8 overflow-auto">
          <div class="max-w-4xl w-full space-y-6">
            <div v-for="(slide, index) in formData.slides" :key="index" class="bg-white rounded-xl shadow-2xl p-12 aspect-video">
              <div class="text-xs text-gray-400 mb-4">第 {{ index + 1 }} / {{ slideCount }} 张</div>
              <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ slide.title || '无标题' }}</h2>
              <div class="text-base text-gray-600 space-y-2">
                <div v-for="(line, li) in (slide.content || '').split('\n').filter(l => l.trim())" :key="li" class="flex items-start gap-2">
                  <span class="text-primary mt-1">●</span>
                  <span>{{ line }}</span>
                </div>
                <div v-if="!slide.content" class="text-gray-300 italic">暂无内容</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" class="toast toast-end toast-bottom z-50">
      <div class="alert" :class="toast.class">
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 模板相关
const templateTab = ref('preset')
const presetTemplates = ref([])
const userTemplates = ref([])
const selectedTemplate = ref(null)

// 表单数据
const formData = ref({
  title: '',
  subtitle: '',
  slides: [{ title: '', content: '' }],
  theme: 'professional',
  colorScheme: 'blue',
  saveToLearningCenter: false,
  saveAsTemplate: false,
  templateName: '',
  templateDesc: ''
})

const isGenerating = ref(false)
const previewMode = ref(false)

// 计算幻灯片数量
const slideCount = computed(() => formData.value.slides.length)

// Toast
const toast = ref({ show: false, message: '', class: 'alert-info' })
const showToast = (message, type = 'info') => {
  toast.value = { show: true, message, class: `alert-${type}` }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// 加载模板
const loadTemplates = async () => {
  try {
    const res = await fetch('/api/ppt/templates?type=preset')
    const data = await res.json()
    if (data.success) presetTemplates.value = data.data
  } catch (e) {
    console.error('加载预设模板失败:', e)
  }
  try {
    const res = await fetch('/api/ppt/templates?type=user')
    const data = await res.json()
    if (data.success) userTemplates.value = data.data
  } catch (e) {
    console.error('加载用户模板失败:', e)
  }
}

// 选择模板
const selectTemplate = (tpl) => {
  selectedTemplate.value = tpl
  // 解析模板内容
  const lines = tpl.content.split('\n')
  const slides = []
  let currentSlide = null

  lines.forEach(line => {
    const match = line.match(/^##\s*第?\s*(\d+)\s*页[：:]\s*(.+)/)
    if (match) {
      if (currentSlide) slides.push(currentSlide)
      currentSlide = { title: match[2], content: '' }
    } else if (line.trim() && currentSlide) {
      currentSlide.content += (currentSlide.content ? '\n' : '') + line.replace(/^[-•]\s*/, '')
    }
  })
  if (currentSlide) slides.push(currentSlide)

  if (slides.length > 0) {
    formData.value.slides = slides
    showToast(`已加载「${tpl.name}」模板`, 'success')
  }
}

// 添加幻灯片
const addSlide = () => {
  formData.value.slides.push({ title: '', content: '' })
}

// 删除幻灯片
const removeSlide = (index) => {
  if (formData.value.slides.length > 1) {
    formData.value.slides.splice(index, 1)
  }
}

// 删除用户模板
const deleteTemplate = async (id) => {
  if (!confirm('确定要删除这个模板吗？')) return
  try {
    const res = await fetch(`/api/ppt/templates/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      userTemplates.value = userTemplates.value.filter(t => t.id !== id)
      if (selectedTemplate.value?.id === id) selectedTemplate.value = null
      showToast('模板已删除', 'success')
    }
  } catch (e) {
    showToast('删除失败', 'error')
  }
}

// 生成 PPT
const generatePPT = async () => {
  if (!formData.value.title.trim()) {
    showToast('请输入 PPT 标题', 'warning')
    return
  }

  isGenerating.value = true

  try {
    // 创建 AI 任务
    const taskRes = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'ppt',
        title: `生成 PPT：${formData.value.title}`,
        description: `${formData.value.slides.length} 张幻灯片`
      })
    })
    const taskData = await taskRes.json()
    const taskId = taskData.taskId

    // 更新任务状态
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'processing', progress: 20 })
    })

    // 构建 PPT 生成请求
    const pptRequest = {
      title: formData.value.title,
      subtitle: formData.value.subtitle,
      slides: formData.value.slides.map((s, i) => ({
        title: s.title,
        content: s.content.split('\n').filter(l => l.trim())
      })),
      theme: formData.value.theme,
      colorScheme: formData.value.colorScheme
    }

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'processing', progress: 50 })
    })

    // 调用 PPT 生成 API
    const res = await fetch('/api/ppt/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pptRequest)
    })

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'processing', progress: 80 })
    })

    const data = await res.json()

    if (data.success) {
      // 保存到学习中心
      if (formData.value.saveToLearningCenter) {
        await fetch('/api/learning/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.value.title,
            type: 'ppt',
            subject: '通用',
            content: JSON.stringify(pptRequest),
            filePath: data.filePath
          })
        })
      }

      // 保存为模板
      if (formData.value.saveAsTemplate && formData.value.templateName) {
        const templateContent = formData.value.slides.map((s, i) => 
          `## 第${i + 1}页：${s.title}\n\n${s.content.split('\n').filter(l => l.trim()).map(l => '- ' + l).join('\n')}`
        ).join('\n\n')

        await fetch('/api/ppt/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.value.templateName,
            content: templateContent,
            description: formData.value.templateDesc,
            subject: '通用'
          })
        })

        loadTemplates() // 刷新模板列表
      }

      // 更新任务为完成
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'completed', 
          progress: 100,
          result: JSON.stringify({ filePath: data.filePath })
        })
      })

      // 下载文件
      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.download = `${formData.value.title}.pptx`
      link.click()

      showToast('PPT 生成成功！', 'success')
    } else {
      throw new Error(data.error || '生成失败')
    }
  } catch (e) {
    showToast(e.message || '生成失败，请重试', 'error')
    console.error('PPT 生成错误:', e)
  } finally {
    isGenerating.value = false
  }
}

onMounted(() => {
  loadTemplates()
})
</script>
