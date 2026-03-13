<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, computed } from "vue";
import { generateRunSerialCommandPacket } from "@/lib/serialCommand";

const motorStore = useMotorStore();

// Get connection status from store
const isConnected = computed(() => motorStore.connection.isConnected);

// Get slave address from store
const slaveAddress = computed(() => motorStore.motorStatus.slaveAddress);



// Speed (0-127)
const speed = ref(32); // Default speed value

// Target position in pulses (must be non-negative)
const targetPosition = ref(3200);

async function moveClockwise() {
  if (!isConnected.value) { return; }

  const pulses = Math.floor(targetPosition.value);
  if (pulses <= 0) {
    window.alert("Please enter a positive number of pulses.");
    return;
  }

  try {
    const packet = generateRunSerialCommandPacket(
      slaveAddress.value,
      0, // 0 for CW
      speed.value,
      pulses
    );
    await serialService.sendPacket(packet);
  } catch (error) {
    console.error("Failed to move clockwise:", error);
  }
}

async function moveCounterClockwise() {
  if (!isConnected.value) { return; }

  const pulses = Math.floor(targetPosition.value);
  if (pulses <= 0) {
    window.alert("Please enter a positive number of pulses.");
    return;
  }

  try {
    const packet = generateRunSerialCommandPacket(
      slaveAddress.value,
      1, // 1 for CCW
      speed.value,
      pulses
    );
    await serialService.sendPacket(packet);
  } catch (error) {
    console.error("Failed to move counter-clockwise:", error);
  }
}
</script>

<template>
  <div class="flex flex-col space-y-4">
    <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">
      Position Controls
    </h2>

    <div class="flex flex-col space-y-3">
      <!-- Target Position Input -->
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Target Position (pulses)</label>
        <div class="flex items-center space-x-2 flex-1 max-w-[240px]">
          <input
            v-model.number="targetPosition"
            type="number"
            min="0"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <span class="w-16 text-center text-xs text-gray-500 dark:text-gray-400">pulses</span>
        </div>
      </div>

      <!-- Speed Selector -->
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Speed</label>
        <div class="flex items-center space-x-2 flex-1 max-w-[240px]">
          <input
            v-model.number="speed"
            type="range"
            min="0"
            max="127"
            class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer accent-blue-600"
          />
          <span class="w-10 text-center text-xs text-gray-500 dark:text-gray-400">{{ speed }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-center space-x-4 pt-2">
      <button
        :disabled="!isConnected"
        class="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        @click="moveClockwise"
      >
        Move CW
      </button>
      <button
        :disabled="!isConnected"
        class="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        @click="moveCounterClockwise"
      >
        Move CCW
      </button>
    </div>
  </div>
</template>