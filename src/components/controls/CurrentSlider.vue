<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch, computed } from "vue";
import { generateSetCurrentPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current currentMa from the store
const currentMa = ref(motorStore.motorStatus.currentMa);

// Convert currentMa to MA value (0-15) where current = ma × 200 mA
const maValue = computed({
  get: () => Math.round(currentMa.value / 200),
  set: (value) => {
    currentMa.value = value * 200;
  }
});

// Watch for changes in the store and update our local ref
watch(
  () => motorStore.motorStatus.currentMa,
  (newValue) => {
    currentMa.value = newValue;
  }
);

// Handle slider change
async function onSliderChange(value: string) {
  const ma = parseInt(value);

  // Validate MA value is between 0 and 15
  if (ma < 0 || ma > 15) {
    console.error("MA value must be between 0 and 15");
    return;
  }

  // Ask for confirmation before changing motor current
  if (!window.confirm(`Are you sure you want to set motor current to ${ma * 200}mA? This will change the motor's operating current.`)) {
    // Revert slider to previous value if user cancels
    maValue.value = Math.round(motorStore.motorStatus.currentMa / 200);
    return;
  }

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetCurrentPacket(slaveAddr, ma);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      currentMa: ma * 200
    });
  } catch (error) {
    console.error("Failed to set current:", error);
    // Revert to previous value on error
    maValue.value = Math.round(motorStore.motorStatus.currentMa / 200);
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Motor Current</label>
    <div class="flex items-center space-x-3 flex-1 max-w-[240px]">
      <span class="w-16 text-right text-xs text-gray-500 dark:text-gray-400">{{ currentMa }}mA</span>
      <input
        type="range"
        min="0"
        max="15"
        :value="maValue"
        class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer accent-blue-600"
        @input="onSliderChange(($event.target as HTMLInputElement).value)"
      />
      <span class="w-16 text-left text-xs text-gray-500 dark:text-gray-400">3000mA</span>
    </div>
  </div>
</template>