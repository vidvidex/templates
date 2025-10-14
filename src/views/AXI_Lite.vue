<template>
  <TemplateLayout :generated-code="generatedCode">
    <template #settings>
      <div class="mb-3">
        <label class="form-label" for="register_count">Register Count:</label>
        <input
          type="number"
          id="register_count"
          class="form-control"
          v-model.number="settings.register_count"
        />
      </div>
    </template>
  </TemplateLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import TemplateLayout from '../components/TemplateLayout.vue'

const settings = ref({
  register_count: 4,
})

const generatedCode = computed(() => {
  return 'axi-lite code'
})
</script>

<style scoped></style>
