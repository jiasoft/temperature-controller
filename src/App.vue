<script setup lang="ts">
import { temperatureController }  from '../packages/index'
</script>
<template>
  <temperatureController  :value="16" :index="1" :width="250" :height="250" :unit="'℃'" :minimum="16" :maximum="36" />
</template>
//-0.7155849933176751
<style scoped>
</style>
