import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock global objects that aren't available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = vi.fn()

// Mock FileReader
class MockFileReader {
  result = ''
  error = null
  readyState = 0
  onload = null
  onerror = null
  onloadend = null

  readAsDataURL(file: File) {
    this.readyState = 2
    this.result = `data:${file.type};base64,mock-base64-data`
    if (this.onload) {
      this.onload({ target: this } as any)
    }
    if (this.onloadend) {
      this.onloadend({ target: this } as any)
    }
  }

  readAsText() {
    this.readyState = 2
    this.result = 'mock-text-content'
    if (this.onload) {
      this.onload({ target: this } as any)
    }
  }

  abort() {
    this.readyState = 0
  }
}

global.FileReader = MockFileReader as any

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    length: Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] || null,
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock scrollTo
window.scrollTo = vi.fn()