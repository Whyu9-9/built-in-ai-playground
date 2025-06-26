<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import Footer from './components/Footer.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { useThemeStore } from './stores/theme.js'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<template>
  <div class="flex min-h-screen flex-col transition-colors" style="background-color: var(--ui-bg)">
    <div class="flex flex-1">
      <!-- Sidebar -->
      <div class="w-72 shadow-sm transition-colors"
        style="background-color: var(--ui-bg); border-right: 1px solid var(--ui-border)">
        <!-- Header -->
        <div class="p-6" style="border-bottom: 1px solid var(--ui-border)">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h1 class="text-lg font-bold" style="color: var(--ui-text)">Built-in AI</h1>
              <p class="text-xs" style="color: var(--ui-text-muted)">Playground</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <!-- Navigation -->
        <div class="p-4 space-y-2">
          <router-link to="/"
            class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg font-medium transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            style="color: var(--ui-text-muted)"
            active-class="!bg-primary-50 dark:!bg-primary-950 !text-primary-600 dark:!text-primary-400 !border !border-primary-200 dark:!border-primary-800">
            <UIcon name="i-heroicons-home" class="text-lg" />
            Home
          </router-link>

          <div class="pt-4">
            <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style="color: var(--ui-text-muted)">
              High-Level APIs
            </div>
            <div class="mt-2 space-y-1">
              <router-link to="/summarizer"
                class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                style="color: var(--ui-text-muted)"
                active-class="!bg-primary-50 dark:!bg-primary-950 !text-primary-600 dark:!text-primary-400 !border !border-primary-200 dark:!border-primary-800">
                <UIcon name="i-heroicons-document-text" class="text-lg" />
                Summarizer
              </router-link>
              <router-link to="/writer"
                class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                style="color: var(--ui-text-muted)"
                active-class="!bg-primary-50 dark:!bg-primary-950 !text-primary-600 dark:!text-primary-400 !border !border-primary-200 dark:!border-primary-800">
                <UIcon name="i-heroicons-pencil" class="text-lg" />
                Writer
              </router-link>
              <router-link to="/rewriter"
                class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                style="color: var(--ui-text-muted)"
                active-class="!bg-primary-50 dark:!bg-primary-950 !text-primary-600 dark:!text-primary-400 !border !border-primary-200 dark:!border-primary-800">
                <UIcon name="i-heroicons-arrow-path" class="text-lg" />
                Rewriter
              </router-link>
              <router-link to="/translator"
                class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                style="color: var(--ui-text-muted)"
                active-class="!bg-primary-50 dark:!bg-primary-950 !text-primary-600 dark:!text-primary-400 !border !border-primary-200 dark:!border-primary-800">
                <UIcon name="i-heroicons-language" class="text-lg" />
                Translator
              </router-link>
              <router-link to="/language-detector"
                class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                style="color: var(--ui-text-muted)"
                active-class="!bg-primary-50 dark:!bg-primary-950 !text-primary-600 dark:!text-primary-400 !border !border-primary-200 dark:!border-primary-800">
                <UIcon name="i-heroicons-document-check" class="text-lg" />
                Language Detector
              </router-link>
            </div>
          </div>

          <div class="pt-4">
            <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style="color: var(--ui-text-muted)">
              Prompt APIs
            </div>
            <div class="mt-2 space-y-1">
              <router-link to="/prompt"
                class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                style="color: var(--ui-text-muted)"
                active-class="!bg-primary-50 dark:!bg-primary-950 !text-primary-600 dark:!text-primary-400 !border !border-primary-200 dark:!border-primary-800">
                <UIcon name="i-heroicons-chat-bubble-left-right" class="text-lg" />
                Text Prompt
              </router-link>
              <router-link to="/prompt-image"
                class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                style="color: var(--ui-text-muted)"
                active-class="!bg-primary-50 dark:!bg-primary-950 !text-primary-600 dark:!text-primary-400 !border !border-primary-200 dark:!border-primary-800">
                <UIcon name="i-heroicons-photo" class="text-lg" />
                Image Prompt
              </router-link>
              <router-link to="/prompt-audio"
                class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                style="color: var(--ui-text-muted)"
                active-class="!bg-primary-50 dark:!bg-primary-950 !text-primary-600 dark:!text-primary-400 !border !border-primary-200 dark:!border-primary-800">
                <UIcon name="i-heroicons-musical-note" class="text-lg" />
                Audio Prompt
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 min-w-0 flex flex-col">
        <main class="flex-1 p-8">
          <div class="max-w-5xl mx-auto">
            <RouterView />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  </div>
</template>

<style>
/* Global link styles */
a {
  color: var(--color-primary-500);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--color-primary-600);
}

.dark a:hover {
  color: var(--color-primary-400);
}
</style>

<style scoped>
/* Custom scrollbar for sidebar */
.sidebar-scroll::-webkit-scrollbar {
  width: 4px;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: var(--ui-border);
  border-radius: 2px;
}

.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--ui-text-muted);
}
</style>