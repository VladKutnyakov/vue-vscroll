<template>
  <h1>Examples</h1>
  <RouterLink :to="{ name: 'examplesComposableVertical' }">Composable vertical</RouterLink>
  <RouterLink :to="{ name: 'examplesComposableHorizontal' }">Composable horizontal</RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
