<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, watch, computed } from "vue";
import { generateSetBaudRatePacket } from "@/lib/serialCommand";

const props = defineProps<{
  modelValue?: number;
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const motorStore = useMotorStore();

// Use prop if provided, otherwise use store
const isControlled = computed(() => props.modelValue !== undefined);

// Get the current baud rate
const selectedBaudRate = ref(props.modelValue ?? motorStore.motorStatus.baudRate);

// Sync with prop if it changes
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined && newVal !== selectedBaudRate.value) {
    selectedBaudRate.value = newVal;
  }
});

// Map baud rate values to the codes expected by the motor (01-06)
const baudRateToCode: Record<number, 1 | 2 | 3 | 4 | 5 | 6> = {
  9600: 1,
  19200: 2,
  25000: 3,
  38400: 4,
  57600: 5,
  115200: 6,
};

// Watch for changes and either emit or send command to motor
watch(selectedBaudRate, async (newValue) => {
  if (newValue === null || newValue === undefined) { return; }

  if (isControlled.value) {
    emit('update:modelValue', newValue);
    return;
  }

  try {
    const slaveAddr = motorStore.motorStatus.slaveAddress;
    const code = baudRateToCode[newValue];
    if (!code) {
      console.error(`Invalid baud rate value: ${newValue}`);
      return;
    }

    const packet = generateSetBaudRatePacket(slaveAddr, code);
    await serialService.sendPacket(packet);

    // Update the store optimistically
    motorStore.updateStatus({
      baudRate: newValue
    });

    // Also update the connection baud rate in the store
    motorStore.connection.baudRate = newValue;
  } catch (error) {
    console.error("Failed to set baud rate:", error);
    // Revert to previous value on error
    selectedBaudRate.value = motorStore.motorStatus.baudRate;
  }
});

// Sync store value to internal baud rate when not controlled
watch(() => motorStore.motorStatus.baudRate, (newRate) => {
  if (!isControlled.value) {
    selectedBaudRate.value = newRate;
  }
});
</script>

<template>
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label || 'Baud Rate' }}
    </label>
    <select
      v-model="selectedBaudRate"
      class="block w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    >
      <option :value="9600">01 = 9600</option>
      <option :value="19200">02 = 19200</option>
      <option :value="25000">03 = 25000</option>
      <option :value="38400">04 = 38400</option>
      <option :value="57600">05 = 57600</option>
      <option :value="115200">06 = 115200</option>
    </select>
  </div>
</template>