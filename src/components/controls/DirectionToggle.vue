<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetDirectionPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current direction from the store
const direction = ref(motorStore.motorStatus.direction);

// Watch for changes in the store and update our local ref
watch(
  () => motorStore.motorStatus.direction,
  (newValue) => {
    direction.value = newValue;
  }
);


// Handle direction change
async function onDirectionChange(event: Event) {
  const newDirection = parseInt((event.target as HTMLInputElement).value);

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetDirectionPacket(slaveAddr, newDirection as 0 | 1);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      direction: newDirection
    });
  } catch (error) {
    console.error("Failed to set direction:", error);
    // Revert to previous value on error
    direction.value = motorStore.motorStatus.direction;
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Motor Direction</label>
    <div class="flex flex-col space-y-2 flex-1 max-w-[240px]">
      <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" name="direction" value="0" :checked="direction === 0" @change="onDirectionChange" />
        <span class="text-xs text-gray-500 dark:text-gray-400">CW</span>
      </label>
      <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" name="direction" value="1" :checked="direction === 1" @change="onDirectionChange" />
        <span class="text-xs text-gray-500 dark:text-gray-400">CCW</span>
      </label>
    </div>
  </div>
</template>