<script setup lang="ts">
// Import child components
import StopMotorButton from './motion/StopMotorButton.vue';
import ConstantSpeedControls from './motion/ConstantSpeedControls.vue';
import PositionControls from './motion/PositionControls.vue';
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
    <h2 class="text-xl font-bold dark:text-white">
      Motion Controls
    </h2>

    <div class="space-y-4">
      <StopMotorButton />
      <ConstantSpeedControls />
      <PositionControls />
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles for the motion controls container if needed */
</style>