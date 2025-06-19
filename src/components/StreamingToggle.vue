<!-- StreamingToggle.vue -->
<template>
    <div class="flex items-center gap-2">
        <UCheckbox v-model="checked" :disabled="disabled" name="streaming" label="Enable streaming" />
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])

const checked = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})
</script>