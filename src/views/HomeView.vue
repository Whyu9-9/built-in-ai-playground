<template>
    <div class="space-y-8">
        <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
                Built-in AI API Playground
            </h1>
            <p class="text-gray-600">
                Explore Chrome's built-in AI APIs. See the status of each API below.
            </p>
        </div>
        <ApiStatus />
    </div>
</template>

<script setup>
import ApiStatus from '../components/ApiStatus.vue'
</script>