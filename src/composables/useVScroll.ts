import { computed, nextTick, onBeforeUnmount, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from "vue"

interface Props<T> {
  items: MaybeRefOrGetter<T[]>
  wrapper: MaybeRefOrGetter<HTMLElement | null>
  itemSize: number
  buffer?: number
  orientation?: 'vertical' | 'horizontal'
}

export function useVScroll<T> (props: Props<T>) {
  const {
    items,
    wrapper,
    itemSize = 0,
    buffer = 10,
    orientation = 'vertical'
  } = props

  const unrefItems = computed(() => toValue(items))
  const unrefWrapper = computed(() => toValue(wrapper))

  const itemsRendered: Ref<T[]> = ref([])
  const indexStart = ref(0)
  const indexEnd = ref(0)
  const scrollVal = ref(0)
  const scrollDiff = ref(0)
  const viewAreaSize = ref(0)

  const sizeBefore = computed(() => indexStart.value * itemSize)
  const sizeAfter = computed(() => (unrefItems.value.length - indexEnd.value) * itemSize)
  const sizeRendered = computed(() => itemsRendered.value.length * itemSize)

  watch(unrefWrapper, (newValue, oldValue) => {
    reset()
    if (newValue) {
      nextTick(() => {
        viewAreaSize.value = orientation === 'vertical'
          ? newValue.getBoundingClientRect().height
          : newValue.getBoundingClientRect().width
        fill()
      })
    }
    oldValue?.removeEventListener('scroll', handleScroll)
    newValue?.addEventListener('scroll', handleScroll, { passive: true })
  }, {
    immediate: true,
  })

  watch(unrefItems, () => {
    reset()
    fill()
  })

  function handleScroll (event: Event) {
    requestAnimationFrame(() => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const newScrollVal = orientation === 'vertical'
        ? target.scrollTop
        : target.scrollLeft
      updateScrollDiff(newScrollVal)

      scrollVal.value = newScrollVal
    })
  }

  function updateScrollDiff (newScrollVal: number) {
    scrollDiff.value += newScrollVal - scrollVal.value

    if (scrollDiff.value >= itemSize) {
      while (scrollDiff.value >= itemSize) {
        if (indexEnd.value !== unrefItems.value.length) {
          addToEnd()
        }
        if (newScrollVal - scrollDiff.value >= buffer * itemSize) {
          removeFromStart()
        }
        scrollDiff.value -= itemSize
      }
    } else if (scrollDiff.value < 0) {
      while (scrollDiff.value < 0) {
        if (indexStart.value !== 0) {
          addToStart()
        }
        if (newScrollVal - scrollDiff.value + viewAreaSize.value <= (unrefItems.value.length - buffer) * itemSize) {
          removeFromEnd()
        }
        scrollDiff.value += itemSize
      }
    }
  }

  function fill () {
    if (!unrefWrapper.value) return

    const scrolledValue = orientation === 'vertical'
      ? unrefWrapper.value.scrollTop
      : unrefWrapper.value.scrollLeft
    const indexInitial = Math.floor(scrolledValue / itemSize)
    indexStart.value = indexInitial
    indexEnd.value = indexInitial
    while (indexStart.value > 0 && indexInitial - indexStart.value < buffer) {
      addToStart()
    }
    while (indexEnd.value < Math.min(unrefItems.value.length, indexInitial + Math.ceil(viewAreaSize.value / itemSize) + buffer)) {
      addToEnd()
    }
  }

  function reset () {
    itemsRendered.value = []
    indexStart.value = 0
    indexEnd.value = 0
    scrollDiff.value = 0
  }

  function addToEnd () {
    indexEnd.value++
    itemsRendered.value.push(unrefItems.value[indexEnd.value - 1])
  }

  function addToStart () {
    indexStart.value--
    itemsRendered.value.unshift(unrefItems.value[indexStart.value])
  }

  function removeFromEnd () {
    indexEnd.value--
    itemsRendered.value.pop()
  }

  function removeFromStart () {
    indexStart.value++
    itemsRendered.value.shift()
  }

  onBeforeUnmount(() => {
    reset()
    unrefWrapper.value?.removeEventListener('scroll', handleScroll)
  })

  return {
    itemsRendered,
    sizeBefore,
    sizeAfter,
    indexStart,
    indexEnd,
    sizeRendered
  }
}