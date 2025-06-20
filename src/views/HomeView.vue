<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <div class="text-center py-12">
      <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <div class="i-heroicons-cpu-chip text-white text-2xl" />
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Built-in AI API Playground
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Explore Chrome's experimental built-in AI APIs. Test text generation, translation, summarization, and more directly in your browser.
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <div class="i-heroicons-bolt text-blue-600 text-xl" />
        </div>
        <h3 class="font-semibold text-gray-900 mb-1">Fast & Local</h3>
        <p class="text-sm text-gray-600">AI processing happens directly in your browser</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <div class="i-heroicons-shield-check text-green-600 text-xl" />
        </div>
        <h3 class="font-semibold text-gray-900 mb-1">Privacy First</h3>
        <p class="text-sm text-gray-600">No data sent to external servers</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <div class="i-heroicons-beaker text-purple-600 text-xl" />
        </div>
        <h3 class="font-semibold text-gray-900 mb-1">Experimental</h3>
        <p class="text-sm text-gray-600">Cutting-edge browser AI capabilities</p>
      </div>
    </div>

    <!-- API Status -->
    <ApiStatus />

    <!-- Getting Started -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
          <div>
            <h3 class="font-semibold text-gray-900">Enable Experimental Features</h3>
            <p class="text-gray-600">Go to <code class="bg-white px-2 py-1 rounded text-sm">chrome://flags/#enable-experimental-web-platform-features</code> and enable the flag</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
          <div>
            <h3 class="font-semibold text-gray-900">Restart Chrome</h3>
            <p class="text-gray-600">Close and reopen Chrome for the changes to take effect</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
          <div>
            <h3 class="font-semibold text-gray-900">Check API Status</h3>
            <p class="text-gray-600">Click "Check API Support" above to see which APIs are available</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ApiStatus from '../components/ApiStatus.vue'
</script>