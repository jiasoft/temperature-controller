<script setup lang="ts">
import { temperatureController}  from '../packages/index'
</script>
<template>
  <temperatureController  :value="23" :index="1" :width="250" :height="250" :unit="'℃'" :minimum="16" :maximum="36" />
</template>

<style scoped>
</style>
