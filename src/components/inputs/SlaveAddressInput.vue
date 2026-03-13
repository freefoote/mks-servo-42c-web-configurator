<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch, computed } from "vue";
import { generateSetSlaveAddrPacket } from "@/lib/serialCommand";

const props = defineProps<{
  modelValue?: number;
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const motorStore = useMotorStore();

// Use prop if provided (e.g. in SerialConnectionPanel), otherwise use store (in ParameterControls)
const isControlled = computed(() => props.modelValue !== undefined);

// The actual value we are editing (0xe0 - 0xe9)
const address = ref(props.modelValue ?? motorStore.motorStatus.slaveAddress);

// Sync with prop if it changes
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined && newVal !== address.value) {
    address.value = newVal;
  }
});

const addresses = Array.from({ length: 10 }, (_, i) => 0xe0 + i);

// Watch for changes and either emit or send command to motor
watch(address, async (newValue) => {
  if (newValue === null || newValue === undefined) { return; }

  if (isControlled.value) {
    emit('update:modelValue', newValue);
    return;
  }

  // Parameter Controls mode: send command to motor
  try {
    const oldAddr = motorStore.motorStatus.slaveAddress;
    const packet = generateSetSlaveAddrPacket(oldAddr, newValue - 0xe0);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      slaveAddress: newValue
    });

    // Also update the connection slave address in the store
    motorStore.connection.slaveAddress = newValue;
  } catch (error) {
    console.error("Failed to set slave address:", error);
    // Revert to previous value on error
    address.value = motorStore.motorStatus.slaveAddress;
  }
});

// Sync store value to internal address when not controlled
watch(() => motorStore.motorStatus.slaveAddress, (newAddr) => {
  if (!isControlled.value) {
    address.value = newAddr;
  }
});
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label || 'Slave Address' }}
    </label>
    <select
      v-model="address"
      class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    >
      <option
        v-for="addr in addresses"
        :key="addr"
        :value="addr"
      >
        0x{{ addr.toString(16).toUpperCase() }} ({{ addr - 0xe0 }})
      </option>
    </select>
  </div>
</template>