<script setup lang="ts">
import ZeroModeSelector from "../inputs/ZeroModeSelector.vue";
import SetZeroButton from "../motion/SetZeroButton.vue";
import ZeroSpeedSelector from "../inputs/ZeroSpeedSelector.vue";
import ZeroDirectionToggle from "../controls/ZeroDirectionToggle.vue";
import GoToZeroButton from "../motion/GoToZeroButton.vue";
</script>

<template>
  <div
    class="flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4"
  >
    <h2 class="text-xl font-bold dark:text-white">
      Zero Mode Controls
    </h2>

    <div class="flex flex-col space-y-4">
      <!-- Zero Mode Selector -->
      <ZeroModeSelector />

      <!-- Set Zero Button -->
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Set Zero Position</label>
        <SetZeroButton />
      </div>

      <!-- Zero Speed Selector -->
      <ZeroSpeedSelector />

      <!-- Zero Direction Toggle -->
      <ZeroDirectionToggle />

      <!-- Go To Zero Button -->
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Go To Zero Position</label>
        <GoToZeroButton />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles if needed */
</style>