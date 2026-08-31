<template>
    <div class="space-y-8">
        <!-- Hero Section -->
        <div class="text-center py-12">

            <h1 class="text-4xl font-bold mb-4" style="color: var(--ui-text)">
                Built-in AI API Playground
            </h1>
            <p class="text-xl max-w-2xl mx-auto" style="color: var(--ui-text-muted)">
                Explore Chrome's built-in AI APIs. Models run locally after their first download, so prompts and
                content stay on your device.
            </p>
        </div>

        <!-- Getting Started -->
        <div class="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-8"
            style="border: 1px solid var(--ui-border)">
            <h2 class="text-2xl font-bold mb-4" style="color: var(--ui-text)">Getting Started</h2>
            <div class="space-y-4">
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                        style="background-color: var(--color-primary-500)">
                        1</div>
                    <div>
                        <h3 class="font-semibold" style="color: var(--ui-text)">Use Chrome on a supported desktop</h3>
                        <p style="color: var(--ui-text-muted)">Use an up-to-date desktop Chrome. Foundation-model APIs
                            require supported hardware and at least 22 GB of free storage.</p>
                    </div>
                </div>
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                        style="background-color: var(--color-primary-500)">
                        2</div>
                    <div>
                        <h3 class="font-semibold" style="color: var(--ui-text)">Enable localhost flags</h3>
                        <p style="color: var(--ui-text-muted)">Enable <code class="px-2 py-1 rounded text-sm"
                                style="background-color: var(--ui-bg-elevated); color: var(--ui-text)">#optimization-guide-on-device-model</code>
                            and <code class="px-2 py-1 rounded text-sm"
                                style="background-color: var(--ui-bg-elevated); color: var(--ui-text)">#prompt-api-for-gemini-nano</code>,
                            then relaunch Chrome. Individual preview APIs may require an additional flag or origin trial.</p>
                    </div>
                </div>
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                        style="background-color: var(--color-primary-500)">
                        3</div>
                    <div>
                        <h3 class="font-semibold" style="color: var(--ui-text)">Check API Status</h3>
                        <p style="color: var(--ui-text-muted)">Check availability below, then start a demo with a click.
                            Chrome may download a model the first time you use an API.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- API Status -->
        <ApiStatus />

        <div class="text-center">
            <a href="https://developer.chrome.com/docs/ai/get-started" target="_blank" rel="noopener noreferrer">
                Read the official Chrome setup guide
            </a>
        </div>


    </div>
</template>

<script setup>
import ApiStatus from '../components/ApiStatus.vue'
</script>
