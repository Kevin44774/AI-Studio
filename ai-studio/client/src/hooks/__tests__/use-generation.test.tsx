import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@/test-utils'
import { useGeneration } from '../use-generation'

// Mock the fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useGeneration Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useGeneration())
    
    expect(result.current.state).toEqual({
      isLoading: false,
      error: null,
      canAbort: false,
      result: null,
    })
    expect(typeof result.current.generate).toBe('function')
    expect(typeof result.current.abort).toBe('function')
    expect(typeof result.current.retry).toBe('function')
  })

  it('generates image successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        imageUrl: 'data:image/jpeg;base64,generated-image',
        originalImageUrl: 'data:image/jpeg;base64,original-image',
        prompt: 'Test prompt',
        style: 'photorealistic',
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useGeneration())

    await act(async () => {
      result.current.generate({
        imageFile: 'mock-file-data',
        prompt: 'Test prompt',
        style: 'photorealistic',
        creativity: 5,
        strength: 75,
      })
    })

    // Should be loading initially
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.canAbort).toBe(true)

    // Wait for the generation to complete
    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false)
    })

    expect(result.current.state.result).toEqual(mockResponse.data)
    expect(result.current.state.error).toBeNull()
  })

  it('handles generation failure', async () => {
    const mockErrorResponse = {
      success: false,
      error: 'Generation failed due to server error',
    }

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    })

    const { result } = renderHook(() => useGeneration())

    await act(async () => {
      result.current.generate({
        imageFile: 'mock-file-data',
        prompt: 'Test prompt',
        style: 'photorealistic',
        creativity: 5,
        strength: 75,
      })
    })

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false)
    })

    expect(result.current.state.error).toBe('Generation failed due to server error')
    expect(result.current.state.result).toBeNull()
  })

  it('handles network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useGeneration())

    await act(async () => {
      result.current.generate({
        imageFile: 'mock-file-data',
        prompt: 'Test prompt',
        style: 'photorealistic',
        creativity: 5,
        strength: 75,
      })
    })

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false)
    })

    expect(result.current.state.error).toBe('Network error occurred. Please check your connection.')
    expect(result.current.state.result).toBeNull()
  })

  it('implements retry mechanism with exponential backoff', async () => {
    // First attempt fails
    mockFetch
      .mockRejectedValueOnce(new Error('Server error'))
      .mockRejectedValueOnce(new Error('Server error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            imageUrl: 'data:image/jpeg;base64,success-after-retry',
            originalImageUrl: 'data:image/jpeg;base64,original',
            prompt: 'Test prompt',
            style: 'photorealistic',
          },
        }),
      })

    const { result } = renderHook(() => useGeneration())

    await act(async () => {
      result.current.generate({
        imageFile: 'mock-file-data',
        prompt: 'Test prompt',
        style: 'photorealistic',
        creativity: 5,
        strength: 75,
      })
    })

    // Should retry automatically
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Fast-forward through retry delays
    await act(async () => {
      vi.advanceTimersByTime(1000) // First retry after 1s
    })

    await act(async () => {
      vi.advanceTimersByTime(2000) // Second retry after 2s
    })

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(result.current.state.result).toBeTruthy()
    expect(result.current.state.error).toBeNull()
  })

  it('stops retrying after max attempts', async () => {
    mockFetch.mockRejectedValue(new Error('Persistent server error'))

    const { result } = renderHook(() => useGeneration())

    await act(async () => {
      result.current.generate({
        imageFile: 'mock-file-data',
        prompt: 'Test prompt',
        style: 'photorealistic',
        creativity: 5,
        strength: 75,
      })
    })

    // Fast-forward through all retry delays
    await act(async () => {
      vi.advanceTimersByTime(10000) // Advance through all retries
    })

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
    expect(result.current.state.error).toBe('Network error occurred. Please check your connection.')
  })

  it('can abort generation', async () => {
    const mockAbortController = {
      abort: vi.fn(),
      signal: { aborted: false },
    }
    
    vi.spyOn(globalThis, 'AbortController').mockImplementation(() => mockAbortController as any)

    // Mock a slow response
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      }), 5000))
    )

    const { result } = renderHook(() => useGeneration())

    await act(async () => {
      result.current.generate({
        imageFile: 'mock-file-data',
        prompt: 'Test prompt',
        style: 'photorealistic',
        creativity: 5,
        strength: 75,
      })
    })

    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.canAbort).toBe(true)

    await act(async () => {
      result.current.abort()
    })

    expect(mockAbortController.abort).toHaveBeenCalled()
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.canAbort).toBe(false)
  })

  it('retry function restarts generation with same parameters', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Initial failure'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            imageUrl: 'data:image/jpeg;base64,retry-success',
            originalImageUrl: 'data:image/jpeg;base64,original',
            prompt: 'Retry prompt',
            style: 'digital-art',
          },
        }),
      })

    const { result } = renderHook(() => useGeneration())

    const params = {
      imageFile: 'mock-file-data',
      prompt: 'Retry prompt',
      style: 'digital-art',
      creativity: 7,
      strength: 80,
    }

    // Initial generation fails
    await act(async () => {
      result.current.generate(params)
    })

    await waitFor(() => {
      expect(result.current.state.error).toBeTruthy()
    })

    // Manual retry
    await act(async () => {
      result.current.retry()
    })

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false)
    })

    expect(result.current.state.result).toBeTruthy()
    expect(result.current.state.error).toBeNull()
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('sends correct request payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { imageUrl: 'test-url', originalImageUrl: 'original-url', prompt: 'test', style: 'test' },
      }),
    })

    const { result } = renderHook(() => useGeneration())

    const params = {
      imageFile: 'base64-image-data',
      prompt: 'A beautiful sunset',
      style: 'oil-painting',
      creativity: 8,
      strength: 90,
    }

    await act(async () => {
      result.current.generate(params)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: expect.any(Object),
    })
  })

  it('handles abort errors gracefully', async () => {
    const abortError = new Error('Operation was aborted')
    abortError.name = 'AbortError'
    
    mockFetch.mockRejectedValueOnce(abortError)

    const { result } = renderHook(() => useGeneration())

    await act(async () => {
      result.current.generate({
        imageFile: 'mock-file-data',
        prompt: 'Test prompt',
        style: 'photorealistic',
        creativity: 5,
        strength: 75,
      })
    })

    await act(async () => {
      result.current.abort()
    })

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false)
    })

    // Should not set an error for abort
    expect(result.current.state.error).toBeNull()
  })

  it('prevents multiple simultaneous generations', async () => {
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      }), 1000))
    )

    const { result } = renderHook(() => useGeneration())

    const params = {
      imageFile: 'mock-file-data',
      prompt: 'Test prompt',
      style: 'photorealistic',
      creativity: 5,
      strength: 75,
    }

    await act(async () => {
      result.current.generate(params)
    })

    expect(result.current.state.isLoading).toBe(true)

    // Try to start another generation
    await act(async () => {
      result.current.generate(params)
    })

    // Should still only have one fetch call
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('clears previous results when starting new generation', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { imageUrl: 'first-result', originalImageUrl: 'original', prompt: 'first', style: 'test' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { imageUrl: 'second-result', originalImageUrl: 'original', prompt: 'second', style: 'test' },
        }),
      })

    const { result } = renderHook(() => useGeneration())

    // First generation
    await act(async () => {
      result.current.generate({
        imageFile: 'mock-file-data',
        prompt: 'First prompt',
        style: 'photorealistic',
        creativity: 5,
        strength: 75,
      })
    })

    await waitFor(() => {
      expect(result.current.state.result?.imageUrl).toBe('first-result')
    })

    // Second generation should clear first result
    await act(async () => {
      result.current.generate({
        imageFile: 'mock-file-data-2',
        prompt: 'Second prompt',
        style: 'digital-art',
        creativity: 6,
        strength: 80,
      })
    })

    // Should start loading and clear previous result
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.result).toBeNull()

    await waitFor(() => {
      expect(result.current.state.result?.imageUrl).toBe('second-result')
    })
  })
})