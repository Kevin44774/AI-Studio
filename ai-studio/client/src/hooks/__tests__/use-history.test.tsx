import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@/test-utils'
import { useHistory } from '../use-history'
import { createMockHistoryItem } from '@/test-utils'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useHistory Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('initializes with empty history when localStorage is empty', () => {
    const { result } = renderHook(() => useHistory())
    
    expect(result.current.history).toEqual([])
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('ai-studio-history')
  })

  it('loads existing history from localStorage', () => {
    const existingHistory = [
      createMockHistoryItem({ id: 'existing-1' }),
      createMockHistoryItem({ id: 'existing-2' }),
    ]
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingHistory))
    
    const { result } = renderHook(() => useHistory())
    
    expect(result.current.history).toEqual(existingHistory)
  })

  it('handles corrupted localStorage data gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json')
    
    const { result } = renderHook(() => useHistory())
    
    expect(result.current.history).toEqual([])
  })

  it('adds new history item at the beginning', () => {
    const { result } = renderHook(() => useHistory())
    
    const newItem = createMockHistoryItem({ id: 'new-item' })
    
    act(() => {
      result.current.addHistoryItem(newItem)
    })
    
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0]).toEqual(newItem)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'ai-studio-history',
      JSON.stringify([newItem])
    )
  })

  it('maintains maximum history limit of 5 items', () => {
    const { result } = renderHook(() => useHistory())
    
    // Add 6 items
    for (let i = 0; i < 6; i++) {
      act(() => {
        result.current.addHistoryItem(createMockHistoryItem({ id: `item-${i}` }))
      })
    }
    
    expect(result.current.history).toHaveLength(5)
    
    // The oldest item (item-0) should be removed
    const ids = result.current.history.map(item => item.id)
    expect(ids).not.toContain('item-0')
    expect(ids).toContain('item-5') // Most recent should be kept
  })

  it('adds items in LIFO order (newest first)', () => {
    const { result } = renderHook(() => useHistory())
    
    const item1 = createMockHistoryItem({ id: 'first', prompt: 'First prompt' })
    const item2 = createMockHistoryItem({ id: 'second', prompt: 'Second prompt' })
    const item3 = createMockHistoryItem({ id: 'third', prompt: 'Third prompt' })
    
    act(() => {
      result.current.addHistoryItem(item1)
    })
    
    act(() => {
      result.current.addHistoryItem(item2)
    })
    
    act(() => {
      result.current.addHistoryItem(item3)
    })
    
    expect(result.current.history[0].id).toBe('third')
    expect(result.current.history[1].id).toBe('second')
    expect(result.current.history[2].id).toBe('first')
  })

  it('clears all history', () => {
    const { result } = renderHook(() => useHistory())
    
    // Add some items first
    act(() => {
      result.current.addHistoryItem(createMockHistoryItem({ id: 'item-1' }))
      result.current.addHistoryItem(createMockHistoryItem({ id: 'item-2' }))
    })
    
    expect(result.current.history).toHaveLength(2)
    
    act(() => {
      result.current.clearHistory()
    })
    
    expect(result.current.history).toEqual([])
    expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
      'ai-studio-history',
      JSON.stringify([])
    )
  })

  it('persists history to localStorage on every change', () => {
    const { result } = renderHook(() => useHistory())
    
    const item1 = createMockHistoryItem({ id: 'persist-test-1' })
    const item2 = createMockHistoryItem({ id: 'persist-test-2' })
    
    act(() => {
      result.current.addHistoryItem(item1)
    })
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'ai-studio-history',
      JSON.stringify([item1])
    )
    
    act(() => {
      result.current.addHistoryItem(item2)
    })
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'ai-studio-history',
      JSON.stringify([item2, item1])
    )
  })

  it('handles duplicate items by treating them as separate entries', () => {
    const { result } = renderHook(() => useHistory())
    
    const item = createMockHistoryItem({ id: 'duplicate-test' })
    const duplicateItem = { ...item } // Same content, different object
    
    act(() => {
      result.current.addHistoryItem(item)
    })
    
    act(() => {
      result.current.addHistoryItem(duplicateItem)
    })
    
    expect(result.current.history).toHaveLength(2)
    expect(result.current.history[0]).toEqual(duplicateItem)
    expect(result.current.history[1]).toEqual(item)
  })

  it('handles items with all required properties', () => {
    const { result } = renderHook(() => useHistory())
    
    const completeItem = {
      id: 'complete-item',
      originalImageUrl: 'data:image/jpeg;base64,original-data',
      imageUrl: 'data:image/jpeg;base64,generated-data',
      prompt: 'A comprehensive test prompt',
      style: 'photorealistic',
      timestamp: 1234567890123,
    }
    
    act(() => {
      result.current.addHistoryItem(completeItem)
    })
    
    expect(result.current.history[0]).toEqual(completeItem)
  })

  it('preserves item properties correctly', () => {
    const { result } = renderHook(() => useHistory())
    
    const itemWithSpecialProperties = createMockHistoryItem({
      id: 'special-item',
      prompt: 'Prompt with special characters: àáâãäå & @#$%',
      style: 'oil-painting',
      timestamp: Date.now(),
    })
    
    act(() => {
      result.current.addHistoryItem(itemWithSpecialProperties)
    })
    
    const retrievedItem = result.current.history[0]
    expect(retrievedItem.prompt).toBe('Prompt with special characters: àáâãäå & @#$%')
    expect(retrievedItem.style).toBe('oil-painting')
    expect(retrievedItem.timestamp).toBe(itemWithSpecialProperties.timestamp)
  })

  it('maintains history order when rehydrated from localStorage', () => {
    const orderedHistory = [
      createMockHistoryItem({ id: 'newest', timestamp: 3 }),
      createMockHistoryItem({ id: 'middle', timestamp: 2 }),
      createMockHistoryItem({ id: 'oldest', timestamp: 1 }),
    ]
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(orderedHistory))
    
    const { result } = renderHook(() => useHistory())
    
    expect(result.current.history[0].id).toBe('newest')
    expect(result.current.history[1].id).toBe('middle')
    expect(result.current.history[2].id).toBe('oldest')
  })

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })
    
    const { result } = renderHook(() => useHistory())
    
    // Should not throw error when localStorage fails
    expect(() => {
      act(() => {
        result.current.addHistoryItem(createMockHistoryItem())
      })
    }).not.toThrow()
    
    // History should still be updated in memory
    expect(result.current.history).toHaveLength(1)
  })

  it('exposes correct interface', () => {
    const { result } = renderHook(() => useHistory())
    
    expect(typeof result.current.history).toBe('object')
    expect(Array.isArray(result.current.history)).toBe(true)
    expect(typeof result.current.addHistoryItem).toBe('function')
    expect(typeof result.current.clearHistory).toBe('function')
  })

  it('handles edge case of exactly 5 items', () => {
    const { result } = renderHook(() => useHistory())
    
    // Add exactly 5 items
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.addHistoryItem(createMockHistoryItem({ id: `edge-item-${i}` }))
      })
    }
    
    expect(result.current.history).toHaveLength(5)
    
    // Add one more
    act(() => {
      result.current.addHistoryItem(createMockHistoryItem({ id: 'edge-item-5' }))
    })
    
    expect(result.current.history).toHaveLength(5)
    expect(result.current.history[0].id).toBe('edge-item-5')
    expect(result.current.history[4].id).toBe('edge-item-1')
    
    // edge-item-0 should be removed
    const ids = result.current.history.map(item => item.id)
    expect(ids).not.toContain('edge-item-0')
  })
})