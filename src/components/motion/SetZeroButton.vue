<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, computed } from "vue";
import { generateSetZeroPointPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get connection status from store
const isConnected = computed(() => motorStore.connection.isConnected);

// Get slave address from store
const slaveAddress = computed(() => motorStore.motorStatus.slaveAddress);

// Sending state
const isSending = ref(false);

async function handleSetZero() {
  if (!isConnected.value) {return;}

  // Ask for confirmation before setting zero point
  if (!window.confirm("Are you sure you want to set the current position as the zero point? This will reset the motor's position counter to zero.")) {
    return;
  }

  try {
    isSending.value = true;

    // Generate the set zero point packet (command 0x91)
    const packet = generateSetZeroPointPacket(slaveAddress.value);

    // Send the packet via serial service
    await serialService.sendPacket(packet);

    // Success
  } catch (error) {
    console.error("Failed to set zero point:", error);
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
      isSending ? 'bg-yellow-500 text-white' : 'bg-green-600 text-white hover:bg-green-700',
      'disabled:opacity-50',
      'transition-colors'
    ]"
    @click="handleSetZero"
  >
    <span>{{ isSending ? 'Setting...' : 'Set Zero Point' }}</span>
    <span
      v-if="isSending"
      class="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"
    />
  </button>
</template>

<style scoped>
/* Add any specific styles if needed */
</style>