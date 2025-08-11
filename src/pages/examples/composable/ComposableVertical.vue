<template>
  <div ref="wrapperRef" class="wrapper">
      <div
        class="container"
        :style="{
          paddingTop: `${sizeBefore}px`,
          paddingBottom: `${sizeAfter}px`
        }"
      >
        <div
          v-for="row in itemsRendered"
          :key="row.id"
          class="row"
        >
          {{ row.id }}
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { useVScroll } from '@/composables/useVScroll'
import { ref, useTemplateRef } from 'vue'

interface Item {
  id: number
  title: string
}

const wrapper = useTemplateRef<HTMLElement>('wrapperRef')

const items = ref<Item[]>(Array.from(Array.from({ length: 100000 }).keys())
  .map(i => ({
    id: i,
    title: i.toString(),
  })))

const { itemsRendered, sizeBefore, sizeAfter } = useVScroll({
  items,
  wrapper,
  itemSize: 30,
  buffer: 5,
})
</script>

<style scoped>
.wrapper {
  width: 400px;
  height: 400px;
  overflow: auto;
}

.container {
  background-color: #eeeeee;
}

.row {
  padding: 4px 0;
  height: 30px;
  width: 2000px;
}
</style>