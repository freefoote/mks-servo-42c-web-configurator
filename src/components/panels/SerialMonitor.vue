<script setup lang="ts">
import { ref, watch } from 'vue';

interface Packet {
  timestamp: Date | number | string;
  data: number[];
}

const props = withDefaults(defineProps<{
  sentPackets?: Packet[];
  receivedPackets?: Packet[];
}>(), {
  sentPackets: () => [],
  receivedPackets: () => []
});

const displayedSent = ref<Packet[]>([]);
const displayedReceived = ref<Packet[]>([]);
const paused = ref(false);

watch(() => props.sentPackets, (newVal) => {
  if (!paused.value) {
    displayedSent.value = [...newVal].reverse();
  }
}, { deep: true });

watch(() => props.receivedPackets, (newVal) => {
  if (!paused.value) {
    displayedReceived.value = [...newVal].reverse();
  }
}, { deep: true });

function clearDisplay() {
  displayedSent.value = [];
  displayedReceived.value = [];
}

function formatTimestamp(timestamp: Date | number | string) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  } as Intl.DateTimeFormatOptions);
}

function formatHexData(data: number[]) {
  if (!Array.isArray(data)) {
    return '';
  }
  return data.map(b => b.toString(16).padStart(2, '0')).join(' ');
}
</script>

<template>
  <div
    class="serial-monitor bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4"
  >
    <div class="packet-section mb-4">
      <h3 class="text-lg font-bold mb-2 dark:text-gray-200">
        Sent Packets
      </h3>
      <div
        class="packet-list h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900 rounded"
      >
        <div
          v-for="(packet, index) in displayedSent"
          :key="index"
          class="packet-item flex justify-between font-mono text-sm py-1 border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <span class="timestamp text-gray-500 dark:text-gray-400">{{ formatTimestamp(packet.timestamp) }}</span>
          <span class="hex-data text-blue-600 dark:text-blue-400">{{ formatHexData(packet.data) }}</span>
        </div>
      </div>
    </div>

    <div class="packet-section mb-4">
      <h3 class="text-lg font-bold mb-2 dark:text-gray-200">
        Received Packets
      </h3>
      <div
        class="packet-list h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900 rounded"
      >
        <div
          v-for="(packet, index) in displayedReceived"
          :key="index"
          class="packet-item flex justify-between font-mono text-sm py-1 border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <span class="timestamp text-gray-500 dark:text-gray-400">{{ formatTimestamp(packet.timestamp) }}</span>
          <span class="hex-data text-green-600 dark:text-green-400">{{ formatHexData(packet.data) }}</span>
        </div>
      </div>
    </div>

    <div class="controls flex justify-between items-center">
      <button
        class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors dark:text-white text-sm font-medium"
        @click="clearDisplay"
      >
        Clear
      </button>
      <label class="flex items-center space-x-2 text-sm dark:text-gray-300 cursor-pointer">
        <input
          v-model="paused"
          type="checkbox"
          class="rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <span>Pause Display</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles kept minimal, mostly relying on Tailwind now */
.packet-list::-webkit-scrollbar {
  width: 6px;
}

.packet-list::-webkit-scrollbar-track {
  background: transparent;
}

.packet-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.dark .packet-list::-webkit-scrollbar-thumb {
  background: #475569;
}
</style>