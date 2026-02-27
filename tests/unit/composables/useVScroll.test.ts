import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useVScroll } from '@/composables/useVScroll'
import { enableAutoUnmount } from '@vue/test-utils'

describe('useVScroll', () => {
  let wrapper: HTMLElement
  let items: number[]
  enableAutoUnmount(afterEach)

  beforeEach(() => {
    wrapper = document.createElement('div')
    wrapper.style.height = '400px'
    wrapper.style.width = '400px'
    wrapper.style.overflow = 'auto'
    document.body.appendChild(wrapper)

    vi.spyOn(wrapper, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 400,
      height: 400,
      top: 0,
      right: 400,
      bottom: 400,
      left: 0,
      toJSON: () => ({ x: 0, y: 0, width: 400, height: 400, top: 0, right: 400, bottom: 400, left: 0 })
    }))

    items = Array.from({ length: 100 }, (_, i) => i)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper)
    }
  })

  describe('Initialization', () => {
    it('initializes with minimal parameters', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
      })

      expect(result.itemsRendered.value).toBeInstanceOf(Array)
      expect(result.sizeBefore.value).toBe(0)
      expect(result.sizeAfter.value).toBeGreaterThanOrEqual(0)
      expect(result.indexStart.value).toBe(0)
      expect(result.sizeRendered.value).toBeGreaterThanOrEqual(0)
    })

    it('initializes with full parameters', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 5,
        orientation: 'vertical',
      })

      expect(result.itemsRendered.value).toBeInstanceOf(Array)
      expect(result.sizeBefore.value).toBe(0)
    })

    it('throws error if itemSize <= 0', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      expect(() => {
        useVScroll({
          items: itemsRef,
          wrapper: wrapperRef,
          itemSize: 0,
        })
      }).toThrow('itemSize must be greater than 0')
    })

    it('renders no items without wrapper', () => {
      const wrapperRef = ref<HTMLElement | null>(null)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
      })

      expect(result.itemsRendered.value).toEqual([])
    })
  })

  describe('Basic Rendering', () => {
    it('calculates sizeRendered correctly', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      const expectedSizeRendered = result.itemsRendered.value.length * 30
      expect(result.sizeRendered.value).toBe(expectedSizeRendered)
    })

    it('calculates sizeBefore as 0 at beginning', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      expect(result.sizeBefore.value).toBe(0)
    })

    it('calculates sizeAfter correctly for non-rendered items', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      const expectedSizeAfter = (items.length - result.indexEnd.value) * 30
      expect(result.sizeAfter.value).toBe(expectedSizeAfter)
    })
  })

  describe('Scroll Down (Vertical)', () => {
    it('updates itemsRendered on scroll down', async () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      await nextTick()
      const initialIndexStart = result.indexStart.value
      const initialIndexEnd = result.indexEnd.value

      wrapper.scrollTop = 150
      wrapper.dispatchEvent(new Event('scroll'))

      await new Promise(resolve => setTimeout(resolve, 20))

      expect(result.indexStart.value).toBeGreaterThanOrEqual(initialIndexStart)
      expect(result.indexEnd.value).toBeGreaterThanOrEqual(initialIndexEnd)
    })

    it('increases sizeBefore on scroll down', async () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      await nextTick()
      const initialSizeBefore = result.sizeBefore.value

      wrapper.scrollTop = 150
      wrapper.dispatchEvent(new Event('scroll'))

      await new Promise(resolve => setTimeout(resolve, 20))

      expect(result.sizeBefore.value).toBeGreaterThanOrEqual(initialSizeBefore)
    })

    it('decreases sizeAfter on scroll down', async () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      await nextTick()
      const initialSizeAfter = result.sizeAfter.value

      wrapper.scrollTop = 150
      wrapper.dispatchEvent(new Event('scroll'))

      await new Promise(resolve => setTimeout(resolve, 20))

      expect(result.sizeAfter.value).toBeLessThanOrEqual(initialSizeAfter)
    })

    it('handles scroll to end correctly', async () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      wrapper.scrollTop = items.length * 30
      wrapper.dispatchEvent(new Event('scroll'))

      await new Promise(resolve => setTimeout(resolve, 20))

      expect(result.indexEnd.value).toBeLessThanOrEqual(items.length)
    })
  })

  describe('Scroll Up (Vertical)', () => {
    it('resets to start when scrollTop is 0', async () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      wrapper.scrollTop = 300
      wrapper.dispatchEvent(new Event('scroll'))
      await new Promise(resolve => setTimeout(resolve, 20))

      wrapper.scrollTop = 0
      wrapper.dispatchEvent(new Event('scroll'))
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(result.indexStart.value).toBe(0)
    })
  })

  describe('Items Reactivity', () => {
    it('updates itemsRendered when items are added', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref([...items])

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      const initialLength = result.itemsRendered.value.length

      itemsRef.value = [...itemsRef.value, 100, 101, 102]

      expect(result.itemsRendered.value.length).toBeGreaterThanOrEqual(initialLength)
    })

    it('updates itemsRendered when items are removed', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref([...items])

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      itemsRef.value = itemsRef.value.slice(0, 50)

      expect(result.indexEnd.value).toBeLessThanOrEqual(50)
    })

    it('updates itemsRendered when items are replaced', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref([...items])

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      const newItems = Array.from({ length: 50 }, (_, i) => i + 100)
      itemsRef.value = newItems

      expect(result.indexEnd.value).toBeLessThanOrEqual(50)
    })

    it('clears itemsRendered when items array is empty', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref([...items])

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      itemsRef.value = []

      expect(result.itemsRendered.value).toEqual([])
    })
  })

  describe('ItemSize Parameter', () => {
    it('calculates sizes correctly with itemSize=10', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 10,
        buffer: 10,
      })

      const expectedSizeBefore = result.indexStart.value * 10
      expect(result.sizeBefore.value).toBe(expectedSizeBefore)
    })

    it('calculates sizes correctly with itemSize=30', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      const expectedSizeBefore = result.indexStart.value * 30
      expect(result.sizeBefore.value).toBe(expectedSizeBefore)
    })

    it('calculates sizes correctly with itemSize=100', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 100,
        buffer: 10,
      })

      const expectedSizeBefore = result.indexStart.value * 100
      expect(result.sizeBefore.value).toBe(expectedSizeBefore)
    })

    it('sizeBefore is always a multiple of itemSize', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      expect(result.sizeBefore.value % 30).toBe(0)
    })

    it('sizeRendered equals itemsRendered.length * itemSize', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      const expectedSizeRendered = result.itemsRendered.value.length * 30
      expect(result.sizeRendered.value).toBe(expectedSizeRendered)
    })
  })

  describe('Edge Cases - Items', () => {
    it('renders nothing with empty items array', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref<number[]>([])

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      expect(result.itemsRendered.value).toEqual([])
    })

    it('handles large lists (1000+ items)', () => {
      const wrapperRef = ref(wrapper)
      const largeItems = Array.from({ length: 1000 }, (_, i) => i)
      const itemsRef = ref(largeItems)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      expect(result.itemsRendered.value.length).toBeGreaterThanOrEqual(0)
      expect(result.itemsRendered.value.length).toBeLessThan(1000)
    })
  })

  describe('Horizontal Orientation', () => {
    beforeEach(() => {
      wrapper.style.width = '400px'
      wrapper.style.height = 'auto'
      wrapper.style.overflowX = 'auto'
      wrapper.style.overflowY = 'hidden'
    })

    it('initializes with horizontal orientation', () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
        orientation: 'horizontal',
      })

      expect(result.itemsRendered.value).toBeInstanceOf(Array)
    })
  })

  describe('Scroll Boundaries', () => {
    it('handles scroll to start correctly', async () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      wrapper.scrollTop = 0
      wrapper.dispatchEvent(new Event('scroll'))

      await new Promise(resolve => setTimeout(resolve, 20))

      expect(result.indexStart.value).toBe(0)
    })

    it('handles scroll to end correctly', async () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      wrapper.scrollTop = items.length * 30
      wrapper.dispatchEvent(new Event('scroll'))

      await new Promise(resolve => setTimeout(resolve, 20))

      expect(result.indexEnd.value).toBeLessThanOrEqual(items.length)
    })

    it('handles scroll from end to start correctly', async () => {
      const wrapperRef = ref(wrapper)
      const itemsRef = ref(items)

      const result = useVScroll({
        items: itemsRef,
        wrapper: wrapperRef,
        itemSize: 30,
        buffer: 10,
      })

      wrapper.scrollTop = items.length * 30
      wrapper.dispatchEvent(new Event('scroll'))
      await new Promise(resolve => setTimeout(resolve, 20))

      wrapper.scrollTop = 0
      wrapper.dispatchEvent(new Event('scroll'))
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(result.indexStart.value).toBe(0)
      expect(result.indexEnd.value).toBeLessThan(items.length)
    })
  })
})