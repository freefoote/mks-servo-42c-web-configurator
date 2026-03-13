<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetZeroDirectionPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current zero direction from the store
const zeroDirection = ref(motorStore.motorStatus.zeroDirection ?? 0);

// Watch for changes in the store and update our local ref
watch(
  () => motorStore.motorStatus.zeroDirection,
  (newValue) => {
    zeroDirection.value = newValue ?? 0;
  }
);


// Handle zero direction change
async function onZeroDirectionChange(event: Event) {
  const newZeroDirection = parseInt((event.target as HTMLInputElement).value);

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetZeroDirectionPacket(slaveAddr, newZeroDirection as 0 | 1);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      zeroDirection: newZeroDirection
    });
  } catch (error) {
    console.error("Failed to set zero direction:", error);
    // Revert to previous value on error
    zeroDirection.value = motorStore.motorStatus.zeroDirection ?? 0;
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Zero Direction</label>
    <div class="flex flex-col space-y-2 flex-1 max-w-[240px]">
      <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" name="zero-direction" value="0" :checked="zeroDirection === 0"
          @change="onZeroDirectionChange" />
        <span class="text-xs text-gray-500 dark:text-gray-400">CW</span>
      </label>
      <label class="flex items-center space-x-2 cursor-pointer">
        <input type="radio" name="zero-direction" value="1" :checked="zeroDirection === 1"
          @change="onZeroDirectionChange" />
        <span class="text-xs text-gray-500 dark:text-gray-400">CCW</span>
      </label>
    </div>
  </div>
</template>