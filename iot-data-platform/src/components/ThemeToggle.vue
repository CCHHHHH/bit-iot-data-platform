<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'

type ThemeMode = 'light' | 'dark'

const currentTheme = ref<ThemeMode>('light')

const applyTheme = (theme: ThemeMode) => {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  currentTheme.value = theme
}

const toggleTheme = () => {
  if (currentTheme.value === 'light') {
    applyTheme('dark')
  } else {
    applyTheme('light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') as ThemeMode || 'light'
  applyTheme(savedTheme)
})
</script>

<template>
  <div class="theme-toggle">
    <el-button
      class="theme-toggle__button"
      @click="toggleTheme"
      circle
      size="default"
    >
      <el-icon :size="18">
        <component :is="currentTheme === 'dark' ? Moon : Sunny" />
      </el-icon>
    </el-button>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: inline-block;
}

.theme-toggle__button {
  background-color: var(--color-bg-secondary, #F8F9FA);
  border: 1px solid var(--color-border, #CED4DA);
  color: var(--color-text-primary, #212529);
  transition: all 150ms ease;
}

.theme-toggle__button:hover {
  background-color: var(--color-bg-hover, #F1F3F4);
  border-color: var(--color-primary-300, #68B3FF);
  color: var(--color-primary-600, #1274E6);
}

[data-theme='dark'] .theme-toggle__button {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

[data-theme='dark'] .theme-toggle__button:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-primary-300);
  color: var(--color-primary-400);
}
</style>
