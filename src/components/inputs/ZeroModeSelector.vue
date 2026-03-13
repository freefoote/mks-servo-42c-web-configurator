<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetZeroModePacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get zero mode from store (0 | 1 | 2 corresponds to Disable/DirMode/NearMode)
const modeValue = motorStore.motorStatus.zeroMode;
const selectedMode = ref<0 | 1 | 2>(modeValue === 1 ? 1 : modeValue === 2 ? 2 : 0);

// Watch for changes and send command via serial service
watch(selectedMode, async (newMode) => {
  if (motorStore.connection.isConnected) {
    try {
      const slaveAddress = motorStore.motorStatus.slaveAddress;
      const packet = generateSetZeroModePacket(slaveAddress, newMode);
      await serialService.sendPacket(packet);

      // Update the store optimistically
      motorStore.updateStatus({ zeroMode: newMode });
    } catch (error) {
      console.error("Failed to set zero mode:", error);
      // Revert to previous value on error
      const revert = motorStore.motorStatus.zeroMode;
      selectedMode.value = revert === 1 ? 1 : revert === 2 ? 2 : 0;
    }
  }
});

// Define the modes
const modes = [
  { value: 0, label: "Disable" },
  { value: 1, label: "DirMode" },
  { value: 2, label: "NearMode" },
];
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Zero Mode</label>
    <div class="flex flex-col space-y-2">
      <div
        v-for="mode in modes"
        :key="mode.value"
        class="flex items-center"
      >
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            v-model="selectedMode"
            type="radio"
            name="zeroMode"
            :value="mode.value"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ mode.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>