<template>
  <nav class="navbar bg-body-secondary">
    <div class="container-fluid">
      <a class="navbar-brand">Template Generator</a>
      <button @click="copyCode" class="btn btn-outline-success">{{ copyButtonText }}</button>
    </div>
  </nav>

  <main class="container-fluid">
    <div class="row">
      <aside class="col-3 ms-3 mt-2">
        <div class="mb-2">
          <label class="form-label" for="template-select">Template:</label>
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
      </aside>

      <section class="col font-monospace mt-4">
        <pre><code>{{ generatedCode }}</code></pre>
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
