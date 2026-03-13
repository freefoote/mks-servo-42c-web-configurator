<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch } from "vue";
import { generateSetInterpolationPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get the current interpolationEnabled from the store
const interpolationEnabled = ref(motorStore.motorStatus.interpolationEnabled);

// Watch for changes in the store and update our local ref
watch(
  () => motorStore.motorStatus.interpolationEnabled,
  (newValue) => {
    interpolationEnabled.value = newValue;
  }
);

// Handle toggle change
async function onToggleChange(event: Event) {
  const newInterpolationEnabled = (event.target as HTMLInputElement).checked ? 1 : 0;

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetInterpolationPacket(slaveAddr, newInterpolationEnabled);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      interpolationEnabled: newInterpolationEnabled === 1
    });
  } catch (error) {
    console.error("Failed to set interpolation:", error);
    // Revert to previous value on error
    interpolationEnabled.value = motorStore.motorStatus.interpolationEnabled;
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Interpolation</label>
    <div class="flex items-center space-x-3 flex-1 max-w-[240px] justify-end">
      <input
        type="checkbox"
        :checked="interpolationEnabled"
        @change="onToggleChange"
      />
    </div>
  </div>
</template>