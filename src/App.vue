<script setup lang="ts">
import { TemperatureControl}  from './components/index'
</script>
<template>
  <TemperatureControl  :value="23" :index="1" :width="250" :height="250" :unit="'℃'" :minimum="16" :maximum="36" />
</template>

<style scoped>
</style>
