<script setup lang="ts">
import MotorTypeSelector from './inputs/MotorTypeSelector.vue'
import WorkModeSelector from './inputs/WorkModeSelector.vue'
import CurrentSlider from './controls/CurrentSlider.vue'
import SubdivisionSelector from './inputs/SubdivisionSelector.vue'
import DirectionToggle from './controls/DirectionToggle.vue'
import EnControl from './controls/EnControl.vue'
import AutoSddToggle from './controls/AutoSddToggle.vue'
import ProtectionToggle from './controls/ProtectionToggle.vue'
import InterpolationToggle from './controls/InterpolationToggle.vue'
import BaudRateSelector from './inputs/BaudRateSelector.vue'
import SlaveAddressInput from './inputs/SlaveAddressInput.vue'
</script>

<template>
  <div
    class="parameter-controls p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
    <div>
      <h2 class="text-xl font-bold mb-2 dark:text-white">
        Parameter Controls
      </h2>
      <p class="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 p-2 rounded mb-4">
        ⚠️ Note: The motor's current configuration cannot be read back via serial. Any values you set here will be sent
        to the motor. The motor's menu system (via OLED display) is the authoritative source for configuration.
      </p>
    </div>
    <div class="space-y-4">
      <MotorTypeSelector />
      <WorkModeSelector />
      <CurrentSlider />
      <SubdivisionSelector />
      <DirectionToggle />
      <EnControl />
      <AutoSddToggle />
      <ProtectionToggle />
      <InterpolationToggle />
      <BaudRateSelector />
      <SlaveAddressInput />
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles if needed */
</style>