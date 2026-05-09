<template>
  <div class="pptx-generator">
    <div class="header">
      <h2>PPT 生成器</h2>
      <button @click="generateSamplePPT" class="btn-primary" :disabled="loading">
        {{ loading ? '生成中...' : '生成示例 PPT' }}
      </button>
    </div>

    <div class="preview-section">
      <h3>Markdown 大纲预览</h3>
      <textarea
        v-model="markdownContent"
        placeholder="输入 PPT 大纲内容..."
        class="markdown-input"
      ></textarea>
    </div>

    <div class="action-bar">
      <input
        v-model="pptTitle"
        type="text"
        placeholder="PPT 标题"
        class="title-input"
      />
      <button @click="generateFromMarkdown" class="btn-success" :disabled="loading">
        生成 PPT
      </button>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createPptFromMarkdown } from '@/plugins/pptxgen/index.js'

const markdownContent = ref(`## 第1页：欢迎页
- 欢迎学习本课程
- 今天我们将学习新知识

## 第2页：课程大纲
- 第一部分：基础知识
- 第二部分：核心概念
- 第三部分：实践应用

## 第3页：基础知识
- 基础知识要点1
- 基础知识要点2
- 基础知识要点3

## 第4页：核心概念
- 核心概念详解
- 案例分析
- 注意事项

## 第5页：实践应用
- 实际操作步骤
- 练习题
- 总结`)

const pptTitle = ref('我的 PPT')
const loading = ref(false)
const message = ref('')
const messageType = ref('success')

const generateSamplePPT = async () => {
  loading.value = true
  message.value = ''

  try {
    await createPptFromMarkdown(markdownContent.value, {
      title: pptTitle.value || '示例 PPT',
      filename: 'sample-presentation.pptx',
      autoDownload: true
    })
    message.value = 'PPT 已下载！'
    messageType.value = 'success'
  } catch (error) {
    message.value = '生成失败: ' + error.message
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

const generateFromMarkdown = async () => {
  if (!markdownContent.value.trim()) {
    message.value = '请输入内容'
    messageType.value = 'error'
    return
  }

  loading.value = true
  message.value = ''

  try {
    await createPptFromMarkdown(markdownContent.value, {
      title: pptTitle.value || 'PPT 演示文稿',
      filename: `${pptTitle.value || 'presentation'}.pptx`,
      autoDownload: true
    })
    message.value = 'PPT 生成成功！'
    messageType.value = 'success'
  } catch (error) {
    message.value = '生成失败: ' + error.message
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.pptx-generator {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #2B579A;
}

.preview-section h3 {
  margin-bottom: 10px;
  color: #333;
}

.markdown-input {
  width: 100%;
  height: 300px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.action-bar {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.title-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.btn-primary,
.btn-success {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #2B579A;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1e3f6f;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-primary:disabled,
.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 15px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.message.success {
  background: #d4edda;
  color: #155724;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
}
</style>
