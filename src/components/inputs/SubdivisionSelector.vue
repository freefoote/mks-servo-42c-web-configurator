<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetSubdivisionPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current subdivision from the store
const subdivision = ref(motorStore.motorStatus.subdivision);

// Watch for changes in the store and update our local ref
watch(
  () => motorStore.motorStatus.subdivision,
  (newValue) => {
    subdivision.value = newValue;
  }
);

// Handle slider change
async function onSliderChange(value: string) {
  const micstep = parseInt(value);

  // Validate micstep value is between 0 and 255
  if (micstep < 0 || micstep > 255) {
    console.error("Micstep value must be between 0 and 255");
    return;
  }

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetSubdivisionPacket(slaveAddr, micstep);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      subdivision: micstep
    });
  } catch (error) {
    console.error("Failed to set subdivision:", error);
    // Revert to previous value on error
    subdivision.value = motorStore.motorStatus.subdivision;
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Motor Subdivision</label>
    <div class="flex items-center space-x-3 flex-1 max-w-[240px]">
      <span class="w-8 text-right text-xs text-gray-500 dark:text-gray-400">{{ subdivision }}</span>
      <input
        type="range"
        min="0"
        max="255"
        :value="subdivision"
        class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer accent-blue-600"
        @input="onSliderChange(($event.target as HTMLInputElement).value)"
      />
      <span class="w-8 text-left text-xs text-gray-500 dark:text-gray-400">255</span>
    </div>
  </div>
</template>