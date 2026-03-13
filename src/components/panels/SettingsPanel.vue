<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

// Theme management
const selectedTheme = ref(localStorage.getItem('theme') || 'auto');

// Apply theme to document
const applyTheme = (theme: string) => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // Auto (System preference)
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
  
  localStorage.setItem('theme', theme);
};

// Watch for theme changes
watch(selectedTheme, (newTheme) => {
  applyTheme(newTheme);
});

// Initialize theme on mount
onMounted(() => {
  applyTheme(selectedTheme.value);
  
  // Listen for system theme changes if set to auto
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (selectedTheme.value === 'auto') {
      applyTheme('auto');
    }
  });
});
</script>

<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full border border-gray-200 dark:border-gray-700">
    <h2 class="text-2xl font-bold mb-6 text-center dark:text-white border-b dark:border-gray-700 pb-2">
      Application Settings
    </h2>

    <div class="space-y-6 text-gray-900 dark:text-gray-100">
      <!-- Theme Selection -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <label class="text-lg font-medium dark:text-gray-300">Appearance Theme</label>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Customize how the dashboard looks for you.
          </p>
        </div>
        <select
          v-model="selectedTheme"
          class="w-48 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all cursor-pointer shadow-sm hover:border-blue-400"
        >
          <option value="light">
            ☀️ Light Mode
          </option>
          <option value="dark">
            🌙 Dark Mode
          </option>
          <option value="auto">
            🌗 Auto (System)
          </option>
        </select>
      </div>
    </div>
    
    <div class="mt-8 text-center">
      <p class="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        MKS Servo 42C Web Control • v1.0.0
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1.2em;
}
</style>