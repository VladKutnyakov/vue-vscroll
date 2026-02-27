import { config } from '@vue/test-utils'

// Global test configuration
config.global.stubs = {}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16) as unknown as number
}

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id)
}

// Store inline styles for elements
const elementStyles = new WeakMap<HTMLElement, { height?: string; width?: string }>()

// Override getBoundingClientRect to use inline styles
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect

Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  value: function (this: HTMLElement) {
    const styles = elementStyles.get(this)
    
    if (styles) {
      const result: DOMRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON() {
          return { ...this }
        }
      }
      
      if (styles.height) {
        const height = parseInt(styles.height, 10)
        if (!isNaN(height)) {
          result.height = height
          result.bottom = height
        }
      }
      
      if (styles.width) {
        const width = parseInt(styles.width, 10)
        if (!isNaN(width)) {
          result.width = width
          result.right = width
        }
      }
      
      return result as DOMRect
    }
    
    return originalGetBoundingClientRect.call(this)
  },
  writable: true,
  configurable: true
})

// Mock Element.prototype.style setter to store styles
const originalStyleDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'style')
Object.defineProperty(Element.prototype, 'style', {
  get() {
    return originalStyleDescriptor!.get!.call(this)
  },
  set(this: HTMLElement, value: CSSStyleDeclaration) {
    originalStyleDescriptor!.set!.call(this, value)
    
    // Store inline height and width
    const height = value.height
    const width = value.width
    if (height || width) {
      elementStyles.set(this, { height, width })
    }
  },
  configurable: true
})