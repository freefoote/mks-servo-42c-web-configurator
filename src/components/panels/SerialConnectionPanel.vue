<script setup lang="ts">
import { ref } from 'vue';
import { useMotorStore } from '@/stores/motor';
import { serialService } from '@/services/SerialService';
import BaudRateSelector from '../inputs/BaudRateSelector.vue';
import SlaveAddressInput from '../inputs/SlaveAddressInput.vue';

const motorStore = useMotorStore();

// Form state
const selectedBaudRate = ref(38400);
const slaveAddress = ref(0xe0);

// Connection state
const isConnecting = ref(false);
const isDisconnecting = ref(false);

// Connect function
async function connect() {
  isConnecting.value = true;
  try {
    // Web Serial requires a user gesture, which this click provides
    await serialService.connect(selectedBaudRate.value);

    // Update store with settings
    motorStore.connection.slaveAddress = slaveAddress.value;
    motorStore.connection.baudRate = selectedBaudRate.value;

    console.warn('Successfully connected via Web Serial');
  } catch (error) {
    console.error('Failed to connect:', error);
    if (error instanceof Error && error.name === 'NotFoundError') {
      // User cancelled the port selection
      return;
    }
    alert('Failed to connect to serial port. Make sure your browser supports Web Serial and you selected a device.');
  } finally {
    isConnecting.value = false;
  }
}

// Disconnect function
async function disconnect() {
  isDisconnecting.value = true;
  try {
    await serialService.disconnect();
  } catch (error) {
    console.error('Failed to disconnect:', error);
  } finally {
    isDisconnecting.value = false;
  }
}
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
    <h2 class="text-xl font-bold mb-4 dark:text-white">
      Serial Connection
    </h2>

    <div class="mb-4">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        To connect, click the button below and select your MKS Servo device.
      </p>
    </div>

    <div class="space-y-4 mb-6">
      <BaudRateSelector v-model="selectedBaudRate" />
      <SlaveAddressInput v-model="slaveAddress" />
    </div>

    <div class="flex space-x-3">
      <button
        :disabled="isConnecting || motorStore.connection.isConnected"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 transition-colors"
        @click="connect"
      >
        {{ isConnecting ? 'Connecting...' : 'Connect' }}
      </button>
      <button
        :disabled="!motorStore.connection.isConnected || isDisconnecting"
        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 transition-colors"
        @click="disconnect"
      >
        {{ isDisconnecting ? 'Disconnecting...' : 'Disconnect' }}
      </button>
    </div>

    <div class="mt-3">
      <span
        class="px-3 py-1 rounded-full text-sm font-medium"
        :class="{
          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': motorStore.connection.isConnected,
          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300': !motorStore.connection.isConnected
        }"
      >
        {{ motorStore.connection.isConnected ? 'Connected' : 'Disconnected' }}
      </span>
    </div>
  </div>
</template>