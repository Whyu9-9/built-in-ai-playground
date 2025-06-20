<template>
    <div class="space-y-8">
        <!-- Hero Section -->
        <div class="text-center py-12">

            <h1 class="text-4xl font-bold mb-4" style="color: var(--ui-text)">
                Built-in AI API Playground
            </h1>
            <p class="text-xl max-w-2xl mx-auto" style="color: var(--ui-text-muted)">
                Explore Chrome's experimental built-in AI APIs. Test text generation, translation, summarization, and
                more directly in your browser.
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
                        <h3 class="font-semibold" style="color: var(--ui-text)">Enable Experimental Features</h3>
                        <p style="color: var(--ui-text-muted)">Go to <code class="px-2 py-1 rounded text-sm"
                                style="background-color: var(--ui-bg-elevated); color: var(--ui-text)">chrome://flags</code>
                            and enable the flag</p>
                    </div>
                </div>
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                        style="background-color: var(--color-primary-500)">
                        2</div>
                    <div>
                        <h3 class="font-semibold" style="color: var(--ui-text)">Restart Chrome</h3>
                        <p style="color: var(--ui-text-muted)">Close and reopen Chrome for the changes to take
                            effect</p>
                    </div>
                </div>
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                        style="background-color: var(--color-primary-500)">
                        3</div>
                    <div>
                        <h3 class="font-semibold" style="color: var(--ui-text)">Check API Status</h3>
                        <p style="color: var(--ui-text-muted)">Click "Check API Support" above to see which APIs
                            are available</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- API Status -->
        <ApiStatus />


    </div>
</template>

<script setup>
import ApiStatus from '../components/ApiStatus.vue'
</script>