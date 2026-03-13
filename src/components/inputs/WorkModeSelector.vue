<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetWorkModePacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current work mode from the store
const selectedWorkMode = ref(motorStore.motorStatus.workMode);

// Watch for changes and send command to motor
watch(selectedWorkMode, async (newValue) => {
  if (newValue === null || newValue === undefined) { return; }

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetWorkModePacket(slaveAddr, newValue as 0 | 1 | 2);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      workMode: newValue
    });
  } catch (error) {
    console.error("Failed to set work mode:", error);
    // Revert to previous value on error
    selectedWorkMode.value = motorStore.motorStatus.workMode;
  }
});
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Work Mode</label>
    <div class="flex flex-col space-y-2">
      <label class="flex items-center space-x-2 cursor-pointer">
        <input
          v-model="selectedWorkMode"
          type="radio"
          name="workMode"
          :value="0"
          class="form-radio h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
        />
        <span class="text-gray-700 dark:text-gray-300">CR_OPEN</span>
      </label>
      <label class="flex items-center space-x-2 cursor-pointer">
        <input
          v-model="selectedWorkMode"
          type="radio"
          name="workMode"
          :value="1"
          class="form-radio h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
        />
        <span class="text-gray-700 dark:text-gray-300">CR_vFOC</span>
      </label>
      <label class="flex items-center space-x-2 cursor-pointer">
        <input
          v-model="selectedWorkMode"
          type="radio"
          name="workMode"
          :value="2"
          class="form-radio h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
        />
        <span class="text-gray-700 dark:text-gray-300">CR_UART</span>
      </label>
    </div>
  </div>
</template>