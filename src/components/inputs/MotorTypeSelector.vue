<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetMotorTypePacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current motor type from the store
const selectedMotorType = ref(motorStore.motorStatus.motorType);

// Watch for changes and send command to motor
watch(selectedMotorType, async (newValue) => {
  if (newValue === null || newValue === undefined) { return; }

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetMotorTypePacket(slaveAddr, newValue as 0 | 1);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      motorType: newValue
    });
  } catch (error) {
    console.error("Failed to set motor type:", error);
    // Revert to previous value on error
    selectedMotorType.value = motorStore.motorStatus.motorType;
  }
});
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Motor Type</label>
    <div class="flex flex-col space-y-2">
      <label class="flex items-center space-x-2 cursor-pointer">
        <input
          v-model="selectedMotorType"
          type="radio"
          name="motorType"
          :value="0"
          class="form-radio h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
        />
        <span class="text-gray-700 dark:text-gray-300">0.9°</span>
      </label>
      <label class="flex items-center space-x-2 cursor-pointer">
        <input
          v-model="selectedMotorType"
          type="radio"
          name="motorType"
          :value="1"
          class="form-radio h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600"
        />
        <span class="text-gray-700 dark:text-gray-300">1.8°</span>
      </label>
    </div>
  </div>
</template>