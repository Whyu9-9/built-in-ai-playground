<script setup>
import { RouterView } from 'vue-router'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="flex min-h-screen bg-white flex-col">
    <div class="flex flex-1">
      <!-- Sidebar -->
      <div class="w-72 bg-white border-r border-gray-200 p-4">
        <div class="mb-6">
          <div class="px-3 py-2 bg-gray-100 rounded-lg inline-block text-sm font-medium">
            Built-in AI Playground
          </div>
        </div>

        <!-- Navigation -->
        <div class="space-y-1">
          <router-link to="/" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md font-medium"
            active-class="bg-gray-100 text-gray-900">
            Home
          </router-link>
          <div class="px-3 py-2 text-sm font-medium text-gray-900">
            Prompt
          </div>
          <div class="pl-6 space-y-1">

            <router-link to="/summarizer" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              active-class="bg-gray-100 text-gray-900">
              Summarizer API
            </router-link>
            <router-link to="/writer" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              active-class="bg-gray-100 text-gray-900">
              Writer API
            </router-link>
            <router-link to="/rewriter" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              active-class="bg-gray-100 text-gray-900">
              Rewriter API
            </router-link>
            <router-link to="/translator" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              active-class="bg-gray-100 text-gray-900">
              Translator API
            </router-link>
            <router-link to="/language-detector"
              class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              active-class="bg-gray-100 text-gray-900">
              Language Detector API
            </router-link>
            <router-link to="/prompt" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              active-class="bg-gray-100 text-gray-900">
              Prompt API
            </router-link>
            <router-link to="/prompt-image" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              active-class="bg-gray-100 text-gray-900">
              Prompt API with Image
            </router-link>
            <router-link to="/prompt-audio" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              active-class="bg-gray-100 text-gray-900">
              Prompt API with Audio
            </router-link>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 min-w-0 flex flex-col">
        <main class="flex-1 p-8">
          <div class="max-w-4xl mx-auto">
            <RouterView />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
