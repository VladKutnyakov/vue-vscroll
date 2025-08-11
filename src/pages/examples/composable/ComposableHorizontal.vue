<template>
  <div ref="wrapperRef" class="wrapper">
      <div
        class="container"
        :style="{
          paddingLeft: `${sizeBefore}px`,
          paddingRight: `${sizeAfter}px`,
          width: `${sizeRendered}px`,
        }"
      >
        <div
          v-for="item in itemsRendered"
          :key="item.id"
          class="item"
        >
          {{ item.id }}
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

const { itemsRendered, sizeBefore, sizeAfter, sizeRendered } = useVScroll({
  items,
  wrapper,
  itemSize: 60,
  buffer: 5,
  orientation: 'horizontal',
})
</script>

<style scoped>
.wrapper {
  width: 400px;
  height: 400px;
  overflow: auto;
}

.container {
  display: flex;
  background-color: #eeeeee;
}

.item {
  padding: 0 4px;
  flex: 52px 0 0;
  height: 20px;
}
</style>