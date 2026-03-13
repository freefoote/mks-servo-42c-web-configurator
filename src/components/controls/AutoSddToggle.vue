<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetAutoSdpPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current autoSdd from the store
const autoSdd = ref(motorStore.motorStatus.autoSdd);

// Watch for changes in the store and update our local ref
watch(
  () => motorStore.motorStatus.autoSdd,
  (newValue) => {
    autoSdd.value = newValue;
  }
);

// Handle toggle change
async function onToggleChange(event: Event) {
  const newAutoSdd = (event.target as HTMLInputElement).checked ? 1 : 0;

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetAutoSdpPacket(slaveAddr, newAutoSdd);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      autoSdd: newAutoSdd === 1
    });
  } catch (error) {
    console.error("Failed to set auto screen off:", error);
    // Revert to previous value on error
    autoSdd.value = motorStore.motorStatus.autoSdd;
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Screen Off</label>
    <div class="flex items-center space-x-3 flex-1 max-w-[240px] justify-end">
      <input
        type="checkbox"
        :checked="autoSdd"
        @change="onToggleChange"
      />
    </div>
  </div>
</template>