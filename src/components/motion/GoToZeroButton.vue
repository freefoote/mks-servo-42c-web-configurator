<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, computed } from "vue";
import { generateGoToZeroPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get connection status from store
const isConnected = computed(() => motorStore.connection.isConnected);

// Get slave address from store
const slaveAddress = computed(() => motorStore.motorStatus.slaveAddress);

// Sending state
const isSending = ref(false);

async function handleGoToZero() {
  if (!isConnected.value) {return;}

  // Ask for confirmation before going to zero
  if (!window.confirm("Are you sure you want to move the motor to the zero position? The motor will move to the position that was previously set as zero.")) {
    return;
  }

  try {
    isSending.value = true;

    // Generate the go to zero packet (command 0x94)
    const packet = generateGoToZeroPacket(slaveAddress.value);

    // Send the packet via serial service
    await serialService.sendPacket(packet);

    // Success
  } catch (error) {
    console.error("Failed to go to zero:", error);
    // Optionally show error feedback to user
  } finally {
    isSending.value = false;
  }
}
</script>

<template>
  <button
    :disabled="!isConnected || isSending"
    :class="[
      'flex items-center justify-between px-4 py-2 rounded',
      isSending ? 'bg-yellow-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700',
      'disabled:opacity-50',
      'transition-colors'
    ]"
    @click="handleGoToZero"
  >
    <span>{{ isSending ? 'Going...' : 'Go to Zero' }}</span>
    <span
      v-if="isSending"
      class="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"
    />
  </button>
</template>

<style scoped>
/* Add any specific styles if needed */
</style>