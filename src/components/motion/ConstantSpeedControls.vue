<script setup lang="ts">
import { useMotorStore } from "@/stores/motor";
import { serialService } from "@/services/SerialService";
import { ref, computed } from "vue";
import { generateRunConstantSpeedPacket, generateStopMotorPacket } from "@/lib/serialCommand";
import DirectionToggle from "@/components/controls/DirectionToggle.vue";

const motorStore = useMotorStore();

// Get connection status from store
const isConnected = computed(() => motorStore.connection.isConnected);

// Get slave address from store
const slaveAddress = computed(() => motorStore.motorStatus.slaveAddress);

// Get direction from store (narrowed to the literal union)
const direction = computed<0 | 1>(() => (motorStore.motorStatus.direction === 0 ? 0 : 1));

// Speed (0-127)
const speed = ref(32); // Default speed value

// State for constant speed running
const isConstantSpeed = ref(false);

async function toggleConstantSpeed() {
  if (!isConnected.value) { return; }

  if (isConstantSpeed.value) {
    // Stop constant speed
    await stopConstantSpeed();
  } else {
    await startConstantSpeed();
  }
}

async function startConstantSpeed() {
  try {
    const packet = generateRunConstantSpeedPacket(
      slaveAddress.value,
      direction.value, // 0 for CW, 1 for CCW
      speed.value
    );
    await serialService.sendPacket(packet);
    isConstantSpeed.value = true;
  } catch (error) {
    console.error("Failed to start constant speed:", error);
  }
}

async function stopConstantSpeed() {
  try {
    const packet = generateStopMotorPacket(slaveAddress.value);
    await serialService.sendPacket(packet);
    isConstantSpeed.value = false;
  } catch (error) {
    console.error("Failed to stop constant speed:", error);
  }
}
</script>

<template>
  <div class="flex flex-col space-y-4">
    <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">
      Constant Speed Controls
    </h2>

    <div class="flex flex-col space-y-3">
      <!-- Direction Toggle -->
      <DirectionToggle />

      <!-- Speed Selector -->
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Speed</label>
        <div class="flex items-center space-x-2 flex-1 max-w-[240px]">
          <input v-model.number="speed" type="range" min="0" max="127"
            class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer accent-blue-600" />
          <span class="w-10 text-center text-xs text-gray-500 dark:text-gray-400">{{ speed }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-center space-x-4 pt-2">
      <button :disabled="!isConnected" :class="[
        'flex-1 px-4 py-2 rounded transition-colors font-medium',
        isConstantSpeed ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700',
        'disabled:opacity-50'
      ]" @click="toggleConstantSpeed">
        {{ isConstantSpeed ? 'Stop Constant Speed' : 'Start Constant Speed' }}
      </button>
    </div>
  </div>
</template>