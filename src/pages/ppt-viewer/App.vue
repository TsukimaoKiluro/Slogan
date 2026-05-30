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
          <span class="text-lg font-bold ml-2">PPT 阅览器</span>
        </div>
        <div class="flex-none gap-2">
          <div class="text-sm opacity-80">
            {{ fileName || '未命名文件' }}
          </div>
          <div class="divider divider-horizontal mx-1"></div>
          <button class="btn btn-ghost btn-sm gap-1" @click="downloadFile" title="下载">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            下载
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-hidden">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex items-center justify-center h-full">
          <div class="text-center">
            <span class="loading loading-spinner loading-lg text-primary"></span>
            <p class="mt-4 text-base-content/60">正在加载 PPT...</p>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="text-6xl mb-4">⚠️</div>
            <p class="text-error font-medium">{{ error }}</p>
            <button class="btn btn-primary btn-sm mt-4" @click="loadPPT">重试</button>
          </div>
        </div>

        <!-- PPT 预览区域 -->
        <div v-else class="h-full flex flex-col">
          <!-- 工具栏 -->
          <div class="p-3 border-b border-base-300 bg-base-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button class="btn btn-sm btn-ghost" @click="prevSlide" :disabled="currentSlide <= 0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M15 19l-7-7 7-7"></path>
                </svg>
                上一页
              </button>
              <div class="text-sm">
                <span class="font-medium">{{ currentSlide + 1 }}</span>
                <span class="text-base-content/50"> / {{ totalSlides }}</span>
              </div>
              <button class="btn btn-sm btn-ghost" @click="nextSlide" :disabled="currentSlide >= totalSlides - 1">
                下一页
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn btn-sm btn-ghost" @click="zoomOut" title="缩小">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
                </svg>
              </button>
              <span class="text-sm w-12 text-center">{{ Math.round(zoom * 100) }}%</span>
              <button class="btn btn-sm btn-ghost" @click="zoomIn" title="放大">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
                </svg>
              </button>
              <button class="btn btn-sm btn-ghost" @click="fitToScreen" title="适应屏幕">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                </svg>
              </button>
              <div class="divider divider-horizontal mx-1"></div>
              <button class="btn btn-sm" :class="isFullscreen ? 'btn-active' : 'btn-ghost'" @click="toggleFullscreen" title="全屏">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- 幻灯片预览区 -->
          <div class="flex-1 overflow-auto bg-base-300 p-6">
            <div class="flex items-center justify-center min-h-full">
              <div 
                class="bg-white rounded-lg shadow-2xl transition-transform duration-300"
                :style="{ 
                  width: slideWidth + 'px', 
                  height: slideHeight + 'px',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center'
                }"
              >
                <!-- 幻灯片内容 -->
                <div class="w-full h-full p-8 flex flex-col" :style="{ backgroundColor: currentSlideData?.background || '#ffffff' }">
                  <!-- 标题 -->
                  <div v-if="currentSlideData?.title" class="mb-6">
                    <h1 
                      class="font-bold leading-tight"
                      :style="{
                        fontSize: (32 * (currentSlideData.titleFontSize || 1)) + 'px',
                        color: currentSlideData.titleColor || '#333333'
                      }"
                    >{{ currentSlideData.title }}</h1>
                  </div>
                  
                  <!-- 内容 -->
                  <div class="flex-1 overflow-hidden">
                    <div 
                      v-for="(item, idx) in currentSlideData?.content" 
                      :key="idx"
                      class="mb-3 flex items-start"
                    >
                      <span 
                        class="mr-3 mt-1 flex-shrink-0"
                        :style="{ color: currentSlideData?.bulletColor || '#0078d4' }"
                      >●</span>
                      <span 
                        class="leading-relaxed"
                        :style="{
                          fontSize: (18 * (currentSlideData.contentFontSize || 1)) + 'px',
                          color: currentSlideData.contentColor || '#333333'
                        }"
                      >{{ item }}</span>
                    </div>
                  </div>

                  <!-- 页码 -->
                  <div class="text-right text-sm text-base-content/50 pt-4">
                    {{ currentSlide + 1 }} / {{ totalSlides }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 缩略图导航 -->
          <div class="p-3 border-t border-base-300 bg-base-100">
            <div class="flex gap-2 overflow-x-auto pb-2">
              <div 
                v-for="(slide, index) in slides" 
                :key="index"
                class="flex-shrink-0 cursor-pointer rounded border-2 transition-all"
                :class="currentSlide === index ? 'border-primary' : 'border-transparent hover:border-base-content/30'"
                @click="goToSlide(index)"
              >
                <div 
                  class="w-24 h-16 bg-white rounded shadow overflow-hidden"
                >
                  <div class="p-1 text-xs">
                    <div class="font-medium truncate text-[10px]">{{ slide.title || '幻灯片 ' + (index + 1) }}</div>
                    <div class="truncate text-[8px] text-base-content/50">
                      {{ slide.content?.slice(0, 2).join('、') || '' }}
                    </div>
                  </div>
                </div>
                <div class="text-center text-[10px] mt-1" :class="currentSlide === index ? 'text-primary font-medium' : 'text-base-content/50'">
                  {{ index + 1 }}
                </div>
              </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import JSZip from 'jszip'

const router = useRouter()
const route = useRoute()

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// 状态
const loading = ref(true)
const error = ref('')
const fileName = ref('')
const fileUrl = ref('')
const materialId = ref(null)
const slides = ref([])
const currentSlide = ref(0)
const zoom = ref(1)
const isFullscreen = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// 幻灯片尺寸（标准 PPT 比例 16:9）
const baseWidth = 960
const baseHeight = 540
const slideWidth = computed(() => baseWidth * zoom.value)
const slideHeight = computed(() => baseHeight * zoom.value)
const totalSlides = computed(() => slides.value.length)
const currentSlideData = computed(() => slides.value[currentSlide.value] || {})

// Toast 提示
const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 加载 PPT 文件
const loadPPT = async () => {
  loading.value = true
  error.value = ''

  try {
    // 从路由参数获取文件信息
    const filePath = route.query.path
    const title = route.query.title
    const matId = route.query.materialId

    if (matId) {
      materialId.value = parseInt(matId) || null
    }

    if (!filePath) {
      throw new Error('未提供文件路径')
    }

    fileUrl.value = filePath
    const extractedFileName = title || filePath.split('/').pop().replace('.pptx', '')
    fileName.value = extractedFileName

    // 获取 PPT 文件内容
    const pptFileName = filePath.split('/').pop()
    const response = await fetch(`${apiBaseUrl}/api/ppt/file?file=${encodeURIComponent(pptFileName)}`)
    
    if (!response.ok) {
      throw new Error('文件加载失败')
    }

    const blob = await response.blob()
    
    // 使用 JSZip 解析 PPTX 文件
    const zip = await JSZip.loadAsync(blob)
    
    // 解析幻灯片 XML 文件
    const slidesData = []
    let slideIndex = 1
    
    while (true) {
      const slideFileName = `ppt/slides/slide${slideIndex}.xml`
      const slideRelFileName = `ppt/slides/_rels/slide${slideIndex}.xml.rels`
      
      const slideXml = zip.file(slideFileName)
      if (!slideXml) break

      // 解析幻灯片内容
      const slideContent = await slideXml.async('text')
      const slideData = parseSlideXml(slideContent, slideIndex)
      
      slidesData.push(slideData)
      slideIndex++
    }

    if (slidesData.length === 0) {
      throw new Error('未能解析到任何幻灯片')
    }

    slides.value = slidesData
    currentSlide.value = 0
    
  } catch (err) {
    console.error('加载 PPT 失败:', err)
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

// 解析单张幻灯片 XML
const parseSlideXml = (xmlContent, slideNum) => {
  const slideData = {
    title: '',
    content: [],
    background: '#ffffff',
    titleColor: '#333333',
    contentColor: '#333333',
    bulletColor: '#0078d4',
    titleFontSize: 1,
    contentFontSize: 1
  }

  try {
    // 解析标题 (使用简单的正则匹配)
    const titleMatch = xmlContent.match(/<p:sp>.*?<p:ph type=\"title\".*?<a:t>([^<]+)<\/a:t>/s)
    if (titleMatch) {
      slideData.title = titleMatch[1].trim()
    }

    // 如果没有找到标题，尝试其他方式
    if (!slideData.title) {
      const altTitleMatch = xmlContent.match(/<p:sp>.*?<a:t>([^<]+)<\/a:t>.*?<\/p:sp>/s)
      if (altTitleMatch && altTitleMatch[1].length < 50) {
        slideData.title = altTitleMatch[1].trim()
      }
    }

    // 解析正文内容
    const bodyMatch = xmlContent.match(/<p:sp>.*?<p:ph type=\"body\".*?>([\s\S]*?)<\/p:sp>/)
    if (bodyMatch) {
      const bodyContent = bodyMatch[1]
      // 提取所有文本
      const textMatches = bodyContent.matchAll(/<a:t>([^<]+)<\/a:t>/g)
      for (const match of textMatches) {
        const text = match[1].trim()
        if (text) {
          slideData.content.push(text)
        }
      }
    }

    // 如果没有找到 body 内容，尝试提取所有文本
    if (slideData.content.length === 0) {
      const allTextMatches = xmlContent.matchAll(/<a:t>([^<]+)<\/a:t>/g)
      for (const match of allTextMatches) {
        const text = match[1].trim()
        if (text && text.length < 100 && !slideData.title.includes(text)) {
          slideData.content.push(text)
        }
      }
    }

    // 解析背景色
    const bgMatch = xmlContent.match(/<a:srgbClr val=\"([A-Fa-f0-9]{6})\"/)
    if (bgMatch) {
      slideData.background = '#' + bgMatch[1]
    }

    // 解析主色调
    const accentMatch = xmlContent.match(/<a:schemeClr val=\"accent1\"/)
    if (accentMatch) {
      slideData.bulletColor = '#0078d4' // Office 默认主题色
    }

  } catch (err) {
    console.error('解析幻灯片失败:', err)
  }

  return slideData
}

// 幻灯片导航
const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const nextSlide = () => {
  if (currentSlide.value < totalSlides.value - 1) {
    currentSlide.value++
  }
}

const goToSlide = (index) => {
  currentSlide.value = index
}

// 缩放控制
const zoomIn = () => {
  if (zoom.value < 2) {
    zoom.value = Math.min(2, zoom.value + 0.1)
  }
}

const zoomOut = () => {
  if (zoom.value > 0.5) {
    zoom.value = Math.max(0.5, zoom.value - 0.1)
  }
}

const fitToScreen = () => {
  zoom.value = 1
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 下载文件
const downloadFile = () => {
  if (fileUrl.value) {
    const link = document.createElement('a')
    link.href = fileUrl.value
    link.download = fileName.value + '.pptx'
    link.click()
    showToastMessage('开始下载')
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 键盘快捷键
const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    prevSlide()
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    nextSlide()
  } else if (e.key === 'Home') {
    currentSlide.value = 0
  } else if (e.key === 'End') {
    currentSlide.value = totalSlides.value - 1
  } else if (e.key === '+' || e.key === '=') {
    zoomIn()
  } else if (e.key === '-') {
    zoomOut()
  } else if (e.key === 'Escape' && document.fullscreenElement) {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

onMounted(() => {
  loadPPT()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
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
</style>
