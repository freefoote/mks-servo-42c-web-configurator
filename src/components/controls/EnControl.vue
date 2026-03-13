<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetEnActivePacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current enActive from the store
const enActive = ref(motorStore.motorStatus.enActive);

// Watch for changes in the store and update our local ref
watch(
  () => motorStore.motorStatus.enActive,
  (newValue) => {
    enActive.value = newValue;
  }
);

// Handle radio change
async function onRadioChange(event: Event) {
  const newEnActive = parseInt((event.target as HTMLInputElement).value);

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetEnActivePacket(slaveAddr, newEnActive as 0 | 1 | 2);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      enActive: newEnActive
    });
  } catch (error) {
    console.error("Failed to set EN active level:", error);
    // Revert to previous value on error
    enActive.value = motorStore.motorStatus.enActive;
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">EN Pin Active Level</label>
    <div class="flex flex-col space-y-2">
      <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" name="enActive" :value="0" :checked="enActive === 0"
          class="h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600" @change="onRadioChange" />
        <span class="text-xs text-gray-700 dark:text-gray-300">L (Low)</span>
      </label>
      <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" name="enActive" :value="1" :checked="enActive === 1"
          class="h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600" @change="onRadioChange" />
        <span class="text-xs text-gray-700 dark:text-gray-300">H (High)</span>
      </label>
      <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" name="enActive" :value="2" :checked="enActive === 2"
          class="h-4 w-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600" @change="onRadioChange" />
        <span class="text-xs text-gray-700 dark:text-gray-300">Hold</span>
      </label>
    </div>
  </div>
</template>