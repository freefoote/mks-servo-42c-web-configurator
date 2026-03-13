<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetZeroSpeedPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current zero speed from the store, default to 2 if not set
const selectedZeroSpeed = ref(motorStore.motorStatus.zeroSpeed ?? 2);

// Watch for changes and send command to motor
watch(selectedZeroSpeed, async (newValue) => {
  if (newValue === null || newValue === undefined) {return;}

  // Validate the value is in range 0-4
  if (newValue < 0 || newValue > 4) {
    console.error(`Invalid zero speed value: ${newValue}`);
    selectedZeroSpeed.value = motorStore.motorStatus.zeroSpeed ?? 2;
    return;
  }

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetZeroSpeedPacket(slaveAddr, newValue);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      zeroSpeed: newValue
    });
  } catch (error) {
    console.error("Failed to set zero speed:", error);
    // Revert to previous value on error
    selectedZeroSpeed.value = motorStore.motorStatus.zeroSpeed ?? 2;
  }
});
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Zero Speed</label>
    <div class="flex flex-col items-end">
      <select
        v-model="selectedZeroSpeed"
        class="block w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option :value="0">0 (Fastest)</option>
        <option :value="1">1</option>
        <option :value="2">2</option>
        <option :value="3">3</option>
        <option :value="4">4 (Slowest)</option>
      </select>
      <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
        Smaller = faster
      </p>
    </div>
  </div>
</template>