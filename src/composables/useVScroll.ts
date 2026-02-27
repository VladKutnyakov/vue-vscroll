import { computed, nextTick, onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from "vue"

/**
 * Props for the useVScroll composable
 */
interface Props<T> {
  /** The items to render in the virtual list */
  items: MaybeRefOrGetter<T[]>
  /** The wrapper element that contains the scrollable area */
  wrapper: MaybeRefOrGetter<HTMLElement | null>
  /** The size of each item in pixels */
  itemSize: number
  /** Number of items to render as buffer before and after the visible area */
  buffer?: number
  /** Scroll orientation - 'vertical' or 'horizontal' */
  orientation?: 'vertical' | 'horizontal'
}

/**
 * A Vue composable for implementing virtual scrolling
 * @param props - Configuration options for the virtual scroll
 * @returns Reactive properties and methods for virtual scrolling
 * 
 * @example
 * ```ts
 * const { itemsRendered, sizeBefore, sizeAfter } = useVScroll({
 *   items: itemsRef,
 *   wrapper: wrapperRef,
 *   itemSize: 30,
 *   buffer: 5,
 *   orientation: 'vertical'
 * })
 * ```
 */
export function useVScroll<T> (props: Props<T>) {
  const {
    items,
    wrapper,
    itemSize,
    buffer = 10,
    orientation = 'vertical'
  } = props

  // Validate itemSize
  if (itemSize <= 0) {
    throw new Error('itemSize must be greater than 0')
  }

  const unrefItems = computed(() => toValue(items))
  const unrefWrapper = computed(() => toValue(wrapper))

  const itemsRendered: Ref<T[]> = ref([])
  const indexStart = ref(0)
  const indexEnd = ref(0)
  const scrollVal = ref(0)
  const viewAreaSize = ref(0)
  let rafId: number | null = null
  let resizeObserver: ResizeObserver | null = null

  const sizeBefore = computed(() => indexStart.value * itemSize)
  const sizeAfter = computed(() => (unrefItems.value.length - indexEnd.value) * itemSize)
  const sizeRendered = computed(() => itemsRendered.value.length * itemSize)

  // Clean up resources
  const cleanup = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    unrefWrapper.value?.removeEventListener('scroll', handleScroll)
  }

  watch(unrefWrapper, (newValue) => {
    cleanup()
    if (newValue) {
      // Initialize view area size
      nextTick(() => {
        viewAreaSize.value = orientation === 'vertical'
          ? newValue.getBoundingClientRect().height
          : newValue.getBoundingClientRect().width
        updateVisibleRange()
      })

      // Set up scroll listener
      newValue.addEventListener('scroll', handleScroll, { passive: true })

      // Set up resize observer
      resizeObserver = new ResizeObserver(() => {
        viewAreaSize.value = orientation === 'vertical'
          ? newValue.getBoundingClientRect().height
          : newValue.getBoundingClientRect().width
        updateVisibleRange()
      })
      resizeObserver.observe(newValue)
    }
  }, {
    immediate: true,
  })

  watch(unrefItems, () => {
    updateVisibleRange()
  })

  /**
   * Handles scroll events with requestAnimationFrame optimization
   */
  function handleScroll (event: Event) {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }

    rafId = requestAnimationFrame(() => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const newScrollVal = orientation === 'vertical'
        ? target.scrollTop
        : target.scrollLeft
      
      scrollVal.value = newScrollVal
      updateVisibleRange()
    })
  }

  /**
   * Updates the visible range of items based on scroll position
   */
  function updateVisibleRange() {
    if (!unrefWrapper.value || !unrefItems.value.length) return

    const scrolledValue = orientation === 'vertical'
      ? unrefWrapper.value.scrollTop
      : unrefWrapper.value.scrollLeft

    const startIndex = Math.max(0, Math.floor(scrolledValue / itemSize) - buffer)
    const endIndex = Math.min(
      unrefItems.value.length,
      Math.ceil((scrolledValue + viewAreaSize.value) / itemSize) + buffer
    )

    // Update indices only if they changed
    if (startIndex !== indexStart.value || endIndex !== indexEnd.value) {
      indexStart.value = startIndex
      indexEnd.value = endIndex
      itemsRendered.value = unrefItems.value.slice(startIndex, endIndex)
    }
  }

  /**
   * Resets the scroll state
   */
  function reset () {
    itemsRendered.value = []
    indexStart.value = 0
    indexEnd.value = 0
    scrollVal.value = 0
  }

  onBeforeUnmount(() => {
    cleanup()
    reset()
  })

  return {
    /** The items currently visible in the viewport */
    itemsRendered,
    /** Total size of all items before the visible area */
    sizeBefore,
    /** Total size of all items after the visible area */
    sizeAfter,
    /** Index of the first visible item */
    indexStart,
    /** Index of the last visible item */
    indexEnd,
    /** Total size of rendered items */
    sizeRendered
  }
}