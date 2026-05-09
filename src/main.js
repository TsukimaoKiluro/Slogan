import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'      // 新建的总布局组件
import './style.css'
import 'katex/dist/katex.min.css'  // KaTeX 公式渲染样式

// 定义路由：把原来的页面组件导入
import HomePage from './pages/home/App.vue'
import SettingsPage from './pages/settings/App.vue'
import ProfilePage from './pages/profile/App.vue'
import LearnPage from './pages/learn/App.vue'
import MarkdownPage from './pages/markdown/App.vue'
import StudyPlanPage from './pages/study-plan/App.vue'
import AddItemPage from './pages/add-item/App.vue'
import PPTEditorPage from './pages/ppt-editor/App.vue'
import PPTViewerPage from './pages/ppt-viewer/App.vue'
import ToolsPage from './pages/tools/App.vue'
import ExamPage from './pages/exam/App.vue'
import ErrorBookPage from './pages/error-book/App.vue'

const routes = [
    { path: '/', redirect: '/home' },           // 默认跳转到首页
    { path: '/home', component: HomePage },
    { path: '/settings', component: SettingsPage },
    { path: '/profile', component: ProfilePage },
    { path: '/learn', component: LearnPage },
    { path: '/markdown', component: MarkdownPage },
    { path: '/study-plan', component: StudyPlanPage },
    { path: '/add-item', component: AddItemPage },
    { path: '/ppt-editor', component: PPTEditorPage },
    { path: '/ppt-viewer', component: PPTViewerPage },
    { path: '/tools', component: ToolsPage },
    { path: '/exam', component: ExamPage },
    { path: '/error-book', component: ErrorBookPage },
]

const router = createRouter({
    history: createWebHistory(),   // 使用 HTML5 模式，路径看起来正常
    routes,
})

const app = createApp(App)
app.use(router)

// 应用启动时加载保存的主题
const savedSettings = localStorage.getItem('settings')
if (savedSettings) {
  try {
    const settings = JSON.parse(savedSettings)
    if (settings.appearance?.theme && settings.appearance.theme !== 'auto') {
      document.documentElement.setAttribute('data-theme', settings.appearance.theme)
    }
  } catch (e) {
    console.error('加载主题失败:', e)
  }
}

app.mount('#app')