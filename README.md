# vue-vscroll 📜

Lightweight Vue 3 composable for implementing virtual scrolling with support for both vertical and horizontal lists.

## Features

✅ **Vertical & Horizontal** - Support for both orientations  
🚀 **High Performance** - Efficiently render 100k+ items  
💪 **Type-Safe** - Full TypeScript support  
🎯 **Flexible** - Configurable item size and buffer  
📱 **Responsive** - ResizeObserver for automatic adaptation  
⚡ **Lightweight** - Minimal bundle size  

## Installation

```bash
npm install vue-vscroll
```

## Basic Usage

### Vertical Scrolling

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useVScroll } from '@/composables/useVScroll'

interface Item {
  id: number
  name: string
}

const items = ref<Item[]>(Array.from({ length: 100000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`
})))

const wrapper = ref(null)

const { itemsRendered, sizeBefore, sizeAfter } = useVScroll({
  items,
  wrapper,
  itemSize: 50,
  buffer: 5
})
</script>

<template>
  <div ref="wrapper" class="scroll-container">
    <div :style="{ paddingTop: sizeBefore + 'px', paddingBottom: sizeAfter + 'px' }">
      <div v-for="item in itemsRendered" :key="item.id" class="item">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<style>
.scroll-container {
  height: 400px;
  overflow-y: auto;
}

.item {
  height: 50px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}
</style>
```

### Horizontal Scrolling

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useVScroll } from '@/composables/useVScroll'

const items = ref([...]) // Your items

const wrapper = ref(null)

const { itemsRendered, sizeBefore, sizeAfter, sizeRendered } = useVScroll({
  items,
  wrapper,
  itemSize: 100,
  buffer: 5,
  orientation: 'horizontal'
})
</script>

<template>
  <div ref="wrapper" class="scroll-container">
    <div 
      class="items-container"
      :style="{ 
        paddingLeft: sizeBefore + 'px', 
        paddingRight: sizeAfter + 'px',
        width: sizeRendered + 'px'
      }"
    >
      <div v-for="item in itemsRendered" :key="item.id" class="item">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<style>
.scroll-container {
  width: 400px;
  height: 200px;
  overflow-x: auto;
}

.items-container {
  display: flex;
}

.item {
  width: 100px;
  flex-shrink: 0;
  padding: 10px;
}
</style>
```

## API

### `useVScroll<T>(props)`

Creates a virtual scroll instance.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `items` | `MaybeRefOrGetter<T[]>` | ✅ Yes | - | The items to render in the virtual list |
| `wrapper` | `MaybeRefOrGetter<HTMLElement \| null>` | ✅ Yes | - | The wrapper element that contains the scrollable area |
| `itemSize` | `number` | ✅ Yes | - | The size of each item in pixels (height for vertical, width for horizontal) |
| `buffer` | `number` | ❌ No | `10` | Number of items to render as buffer before and after the visible area |
| `orientation` | `'vertical' \| 'horizontal'` | ❌ No | `'vertical'` | Scroll orientation |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `itemsRendered` | `Ref<T[]>` | The items currently visible in the viewport |
| `sizeBefore` | `ComputedRef<number>` | Total size of all items before the visible area |
| `sizeAfter` | `ComputedRef<number>` | Total size of all items after the visible area |
| `indexStart` | `Ref<number>` | Index of the first visible item |
| `indexEnd` | `Ref<number>` | Index of the last visible item |
| `sizeRendered` | `ComputedRef<number>` | Total size of rendered items |

## How It Works

Virtual scrolling is a technique that renders only the items that are currently visible in the viewport, plus a small buffer of items on each side. This dramatically improves performance when working with large datasets.

**Key concepts:**

1. **Item Size**: All items must have the same fixed size (in pixels)
2. **Buffer**: Items outside the visible area but within the buffer are also rendered for smooth scrolling
3. **Padding/Offset**: Calculated based on the number of items before/after the visible area to maintain scroll position

**Performance benefits:**
- Render only ~20-50 items instead of 100,000+
- Constant DOM size regardless of dataset size
- Smooth scrolling even with millions of items
- Reduced memory usage

## Tips & Best Practices

1. **Use fixed item sizes**: The composable requires all items to have the same size. Variable height/width items require different approaches.

2. **Adjust buffer size**: 
   - Larger buffer = smoother scrolling but more DOM nodes
   - Smaller buffer = fewer DOM nodes but might show brief flickers on fast scroll

3. **Consider item complexity**: Simple items can have smaller buffers. Complex items benefit from larger buffers to avoid frequent re-rendering.

4. **Optimize item rendering**: Keep your item components simple and efficient for best performance.

## Development

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Type-check

```bash
npm run type-check
```

### Build for production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires ResizeObserver API support

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.