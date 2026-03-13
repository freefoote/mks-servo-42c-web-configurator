<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useMotorStore } from '@/stores/motor';
import { serialService } from '@/services/SerialService';

// Import child components
import SerialConnectionPanel from './panels/SerialConnectionPanel.vue';
import MotorStatusDisplay from './panels/MotorStatusDisplay.vue';
import ParameterControls from './ParameterControls.vue';
import MotionControls from './MotionControls.vue';
import ZeroModeControls from './panels/ZeroModeControls.vue';
import SerialMonitor from './panels/SerialMonitor.vue';
import SettingsPanel from './panels/SettingsPanel.vue';

const motorStore = useMotorStore();

// The serialService singleton already has a reference to the motor store
// and will update it automatically on connection state changes.
onUnmounted(async () => {
  // Clean up serial service when component is unmounted
  await serialService.disconnect();
});
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
      MKS Servo42c Control Dashboard
    </h1>

    <div class="grid grid-cols-4 lg:grid-cols-4 gap-6">
      <div class="space-y-6">
        <SerialConnectionPanel />
        <MotorStatusDisplay />
      </div>
      <div class="space-y-6">
        <ParameterControls />
        <ZeroModeControls />
      </div>
      <div class="space-y-6">
        <MotionControls />
      </div>

      <div class="space-y-6">
        <SerialMonitor
          :sent-packets="motorStore.packetHistory.sentPackets"
          :received-packets="motorStore.packetHistory.receivedPackets"
        />
        <SettingsPanel />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles for the dashboard if needed */
</style>