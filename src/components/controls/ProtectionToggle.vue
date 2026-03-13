<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetProtectionPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current protectionEnabled from the store
const protectionEnabled = ref(motorStore.motorStatus.protectionEnabled);

// Watch for changes in the store and update our local ref
watch(
  () => motorStore.motorStatus.protectionEnabled,
  (newValue) => {
    protectionEnabled.value = newValue;
  }
);

// Handle toggle change
async function onToggleChange(event: Event) {
  const newProtectionEnabled = (event.target as HTMLInputElement).checked ? 1 : 0;

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetProtectionPacket(slaveAddr, newProtectionEnabled);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      protectionEnabled: newProtectionEnabled === 1
    });
  } catch (error) {
    console.error("Failed to set protection:", error);
    // Revert to previous value on error
    protectionEnabled.value = motorStore.motorStatus.protectionEnabled;
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Protection</label>
    <div class="flex items-center space-x-3 flex-1 max-w-[240px] justify-end">
      <input
        type="checkbox"
        :checked="protectionEnabled"
        @change="onToggleChange"
      />
    </div>
  </div>
</template>