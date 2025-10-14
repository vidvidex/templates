<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold"> Template Generator </a>
      <button @click="copyCode" class="btn btn-light" :disabled="!generatedCode">
        {{ copyButtonText }}
      </button>
    </div>
  </nav>

  <main class="container-fluid py-4">
    <div class="row g-4">
      <aside class="col-lg-3 col-md-4">
        <div class="card shadow-sm">
          <div class="card-header bg-primary bg-opacity-10 border-bottom">
            <h5 class="card-title mb-0 text-primary fw-semibold">Configuration</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label fw-semibold" for="template-select">Template:</label>
              <select
                id="template-select"
                class="form-select"
                v-model="selectedTemplate"
                @change="navigateToTemplate"
              >
                <option value="axi-lite">AXI Lite</option>
              </select>
            </div>

            <slot name="settings"></slot>
          </div>
        </div>
      </aside>

      <section class="col-lg-9 col-md-8">
        <div class="card shadow-sm h-100">
          <div
            class="card-header bg-primary bg-opacity-10 border-bottom d-flex justify-content-between align-items-center"
          >
            <h5 class="card-title mb-0 text-primary fw-semibold">Generated Code</h5>
            <small class="text-muted" v-if="generatedCode">
              {{ generatedCode.split('\n').length }} lines
            </small>
          </div>
          <div class="card-body p-0">
            <pre
              class="bg-dark text-light p-3 mb-0 rounded-0"
              style="min-height: 400px; overflow-x: auto"
            ><code class="text-light">{{ generatedCode || '// Select a template and configure settings to generate code' }}</code></pre>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  generatedCode: {
    type: String,
    default: '',
  },
})

const copyButtonText = ref('Copy')

const selectedTemplate = computed({
  get() {
    return route.name
  },
  set(value) {
    // This will be handled by navigateToTemplate
  },
})

const navigateToTemplate = (event) => {
  const template = event.target.value
  router.push(`/${template}`)
}

const copyCode = async () => {
  await navigator.clipboard.writeText(props.generatedCode)
  copyButtonText.value = 'Copied!'
  setTimeout(() => {
    copyButtonText.value = 'Copy'
  }, 2000)
}
</script>

<style scoped></style>
