<template>
  <div class="app-layout">
    <!-- 导航栏组件（只初始化一次） -->
    <Navbar />
    <!-- 路由匹配到的组件将渲染在这里 -->
    <div class="page-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/navbar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
}
.page-content {
  //flex: 1;
  //padding: 1rem;
  //overflow-y: auto;
  //height: 100vh;
  display: none;
}
</style>