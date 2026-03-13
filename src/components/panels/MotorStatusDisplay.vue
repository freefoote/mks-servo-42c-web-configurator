<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useMotorStore } from '@/stores/motor';
import { serialService } from '@/services/SerialService';

const motorStore = useMotorStore();
const motorStatus = computed(() => motorStore.motorStatus);

// Polling interval settings moved from SettingsPanel
const pollingInterval = ref(motorStore.polling.interval);
const enablePolling = ref(motorStore.polling.isActive);

// Watch for polling interval changes
watch(pollingInterval, (newValue) => {
  if (newValue !== null && newValue !== undefined) {
    motorStore.setPollingInterval(newValue);
    if (enablePolling.value) {
      serialService.startPositionPolling(
        motorStore.connection.slaveAddress,
        () => { },
        newValue
      );
    }
  }
});

// Watch for enablePolling changes
watch(enablePolling, (newValue) => {
  motorStore.polling.isActive = newValue;
  if (newValue) {
    serialService.startPositionPolling(
      motorStore.connection.slaveAddress,
      () => { },
      pollingInterval.value
    );
  } else {
    serialService.stopPositionPolling();
  }
});
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
    <h2 class="text-xl font-bold dark:text-white mb-4">
      Motor Status
    </h2>

    <!-- Moved Polling Controls -->
    <div class="flex items-center space-x-4 mb-4">
      <div class="flex items-center">
        <input v-model="enablePolling" type="checkbox" id="enable-polling-status"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
        <label for="enable-polling-status" class="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          Auto-update
        </label>
      </div>

      <div v-if="enablePolling" class="flex items-center">
        <input v-model.number="pollingInterval" type="number" min="100" max="5000" step="50"
          class="w-16 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        <span class="ml-1 text-[10px] text-gray-500 dark:text-gray-400">
          ms
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 text-gray-900 dark:text-gray-100">
      <div>
        <h3 class="text-lg font-semibold mb-2 dark:text-gray-200">
          Encoder
        </h3>
        <p class="text-mono text-lg">
          Carry: {{ motorStatus.encoderCarry }}
        </p>
        <p class="text-mono text-lg">
          Value: {{ motorStatus.encoderValue }}
        </p>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-2 dark:text-gray-200">
          Counters
        </h3>
        <p class="text-mono">
          Pulses Received: {{ motorStatus.pulsesReceived }}
        </p>
        <p class="text-mono">
          Error Degrees: {{ motorStatus.errorDegrees.toFixed(2) }}°
        </p>
      </div>
    </div>

    <div class="mt-4 text-gray-900 dark:text-gray-100">
      <h3 class="text-lg font-semibold mb-2 dark:text-gray-200">
        Status Indicators
      </h3>
      <div class="grid grid-cols-1 gap-4">
        <div>
          <span class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-2" :class="{
              'bg-green-500': motorStatus.enStatus === 1,
              'bg-red-500': motorStatus.enStatus === 2,
              'bg-gray-500': motorStatus.enStatus === 0
            }" />
            Enable:
            <span class="text-sm ml-1" :class="{ 'font-medium': motorStatus.enStatus !== 0 }">
              {{ motorStatus.enStatus === 0 ? 'Unknown' : motorStatus.enStatus === 1 ? 'Enabled' : 'Disabled' }}
            </span>
          </span>
        </div>

        <div>
          <span class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-2" :class="{
              'bg-green-500': motorStatus.protectionStatus === 1,
              'bg-red-500': motorStatus.protectionStatus === 2,
              'bg-gray-500': motorStatus.protectionStatus === 0
            }" />
            Protection:
            <span class="text-sm ml-1" :class="{ 'font-medium': motorStatus.protectionStatus !== 0 }">
              {{ motorStatus.protectionStatus === 0 ? 'Unknown' : motorStatus.protectionStatus === 1 ? 'Protected' :
                'Unprotected' }}
            </span>
          </span>
        </div>
      </div>
    </div>

  </div>

</template>