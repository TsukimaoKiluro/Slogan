<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import TaskFloatPanel from './TaskFloatPanel.vue'

const route = useRoute()
const userName = ref('TestUser')
const avatarUrl = ref('')

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const loadUserInfo = () => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)
    if (settings.user) {
      userName.value = settings.user.username || settings.user.nickname || 'TestUser'
      avatarUrl.value = settings.user.avatar || ''
    }
  }
}

const handleStorageChange = (e) => {
  if (e.key === 'settings') {
    loadUserInfo()
  }
}

const handleSettingsChanged = () => {
  loadUserInfo()
}

onMounted(() => {
  loadUserInfo()
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('settings-changed', handleSettingsChanged)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('settings-changed', handleSettingsChanged)
})
</script>

<template>
  <div class="drawer lg:drawer-open">
    <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content page-color relative">
      <!-- 顶部导航栏 -->
      <nav class="navbar w-full bg-base-300">
        <label for="my-drawer-4" aria-label="open sidebar" class="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4">
            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
            <path d="M9 4v16"></path>
            <path d="M14 10l2 2l-2 2"></path>
          </svg>
        </label>
        <div class="px-6 font-bold">物化未觉</div>
        <div class="user-container">

          <!-- 工作进度按钮 -->
          <TaskFloatPanel />

          <div class="avatar avatar-online ml-2">
            <div class="w-12 rounded-full">
              <img :src="avatarUrl || 'https://img.daisyui.com/images/profile/demo/gordon@192.webp'" />
            </div>
          </div>
          <div class="dropdown dropdown-end ">
            <div tabindex="0" role="button" class="btn m-1 user-name-btn ">{{ userName }}</div>
            <ul tabindex="-1" class="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm menu1">
              <li><router-link to="/settings">设置</router-link></li>
            </ul>
          </div>

        </div>
      </nav>
      <!-- 路由匹配的页面组件将渲染在此处 -->
      <router-view @settings-changed="loadUserInfo" />
    </div>

    <div class="drawer-side is-drawer-close:overflow-visible">
      <label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
        <!-- Logo 区域 -->
        <div class="mt-4 flex w-full flex-col items-center is-drawer-open:items-start px-2">
          <div class="is-drawer-close:hidden mb-2 flex w-full items-center gap-2">
            <span class="text-2xl">🌸</span>
            <span class="font-bold text-primary">Slogan</span>
          </div>
          <div class="is-drawer-open:hidden tooltip tooltip-right" data-tip="Slogan">
            <span class="text-2xl">🌸</span>
          </div>
        </div>
        <div class="divider my-2 is-drawer-close:hidden"></div>

        <ul class="menu w-full grow">
          <li>
            <router-link
                to="/home"
                class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                :class="{ 'active bg-primary text-primary-content': isActive('/home') }"
                data-tip="首页|Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              <span class="is-drawer-close:hidden">首页|Home</span>
            </router-link>
          </li>
          <li>
            <router-link
                to="/tools"
                class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                :class="{ 'active bg-primary text-primary-content': isActive('/tools') }"
                data-tip="工具中心|Tools"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              <span class="is-drawer-close:hidden">工具中心|Tools</span>
            </router-link>
          </li>
          <li>
            <router-link
                to="/learn"
                class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                :class="{ 'active bg-primary text-primary-content': isActive('/learn') }"
                data-tip="学习中心|Learn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              <span class="is-drawer-close:hidden">学习中心|Learn</span>
            </router-link>
          </li>
          <li>
            <router-link
                to="/study-plan"
                class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                :class="{ 'active bg-primary text-primary-content': isActive('/study-plan') }"
                data-tip="学习计划|Study Plan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"></path>
                <rect x="9" y="3" width="6" height="4" rx="2"></rect>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
              <span class="is-drawer-close:hidden">学习计划|Study Plan</span>
            </router-link>
          </li>
          <li>
            <router-link
                to="/profile"
                class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                :class="{ 'active bg-primary text-primary-content': isActive('/profile') }"
                data-tip="个人面板|Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4">
                <path d="M3 3v18h18"></path>
                <path d="M18 17V9"></path>
                <path d="M13 17V5"></path>
                <path d="M8 17v-3"></path>
              </svg>
              <span class="is-drawer-close:hidden">个人面板|Profile</span>
            </router-link>
          </li>
          <li>
            <router-link
                to="/settings"
                class="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                :class="{ 'active bg-primary text-primary-content': isActive('/settings') }"
                data-tip="设置|Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4">
                <path d="M20 7h-9"></path>
                <path d="M14 17H5"></path>
                <circle cx="17" cy="17" r="3"></circle>
                <circle cx="7" cy="7" r="3"></circle>
              </svg>
              <span class="is-drawer-close:hidden">设置|Settings</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>

.drawer {
  height: 100vh;
  overflow: hidden;
}
.drawer-content {
  overflow-y: auto;
}

/* 可选：自定义激活状态的样式 */
.menu li > .active {
  border-radius: 25px;
}

.menu li{
  margin: 10px 0 10px 0;
}

.user-container {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.user-name-btn{
  border: none;
  border-radius: 25px;
  box-shadow: none;
}

.menu1{
  border: 2px deeppink;
  //background-color: #fff;
}

</style>
