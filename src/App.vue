<script setup>
import { RouterView } from 'vue-router'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 flex-col">
    <div class="flex flex-1">
      <!-- Sidebar -->
      <div class="w-72 bg-white border-r border-gray-200 shadow-sm">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div class="i-heroicons-cpu-chip text-white text-lg" />
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">Built-in AI</h1>
              <p class="text-xs text-gray-500">Playground</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="p-4 space-y-2">
          <router-link to="/" class="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            active-class="bg-blue-50 text-blue-700 border border-blue-200">
            <div class="i-heroicons-home text-lg" />
            Home
          </router-link>
          
          <div class="pt-4">
            <div class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              AI APIs
            </div>
            <div class="mt-2 space-y-1">
              <router-link to="/summarizer" class="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                active-class="bg-blue-50 text-blue-700 border border-blue-200">
                <div class="i-heroicons-document-text text-lg" />
                Summarizer
              </router-link>
              <router-link to="/writer" class="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                active-class="bg-blue-50 text-blue-700 border border-blue-200">
                <div class="i-heroicons-pencil text-lg" />
                Writer
              </router-link>
              <router-link to="/rewriter" class="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                active-class="bg-blue-50 text-blue-700 border border-blue-200">
                <div class="i-heroicons-arrow-path text-lg" />
                Rewriter
              </router-link>
              <router-link to="/translator" class="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                active-class="bg-blue-50 text-blue-700 border border-blue-200">
                <div class="i-heroicons-language text-lg" />
                Translator
              </router-link>
              <router-link to="/language-detector" class="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                active-class="bg-blue-50 text-blue-700 border border-blue-200">
                <div class="i-heroicons-magnifying-glass text-lg" />
                Language Detector
              </router-link>
            </div>
          </div>

          <div class="pt-4">
            <div class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Prompt APIs
            </div>
            <div class="mt-2 space-y-1">
              <router-link to="/prompt" class="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                active-class="bg-blue-50 text-blue-700 border border-blue-200">
                <div class="i-heroicons-chat-bubble-left-right text-lg" />
                Text Prompt
              </router-link>
              <router-link to="/prompt-image" class="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                active-class="bg-blue-50 text-blue-700 border border-blue-200">
                <div class="i-heroicons-photo text-lg" />
                Image Prompt
              </router-link>
              <router-link to="/prompt-audio" class="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                active-class="bg-blue-50 text-blue-700 border border-blue-200">
                <div class="i-heroicons-musical-note text-lg" />
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

<style scoped>
/* Custom scrollbar for sidebar */
.sidebar-scroll::-webkit-scrollbar {
  width: 4px;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>