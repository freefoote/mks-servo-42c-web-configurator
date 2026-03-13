<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { computed } from "vue";
import { generateStopMotorPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get connection status from store
const isConnected = computed(() => motorStore.connection.isConnected);

// Get slave address from store
const slaveAddress = computed(() => motorStore.motorStatus.slaveAddress);

// Stop motor
async function stopMotor() {
    if (!isConnected.value) { return; }

    try {
        const packet = generateStopMotorPacket(slaveAddress.value);
        await serialService.sendPacket(packet);
    } catch (error) {
        console.error("Failed to stop motor:", error);
    }
}
</script>

<template>
  <div class="flex flex-col space-y-4">
    <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">
      Motor Control
    </h2>

    <div class="flex items-center space-x-4 pt-2">
      <button
        :disabled="!isConnected"
        class="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
        @click="stopMotor"
      >
        Stop Motor
      </button>
    </div>
  </div>
</template>
