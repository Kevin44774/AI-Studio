import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { GenerateButton } from '../generate-button'
import type { GenerationState } from '@/hooks/use-generation'

describe('GenerateButton Component', () => {
  const mockOnGenerate = vi.fn()
  const mockOnAbort = vi.fn()
  const mockOnRetry = vi.fn()

  const defaultState: GenerationState = {
    isLoading: false,
    error: null,
    canAbort: false,
    result: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders generate button in initial state', () => {
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={defaultState}
        disabled={false}
      />
    )
    
    const button = screen.getByTestId('button-generate')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Generate Image')
    expect(button).not.toBeDisabled()
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={defaultState}
        disabled={true}
      />
    )
    
    const button = screen.getByTestId('button-generate')
    expect(button).toBeDisabled()
  })

  it('calls onGenerate when clicked', async () => {
    const user = userEvent.setup()
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={defaultState}
        disabled={false}
      />
    )
    
    const button = screen.getByTestId('button-generate')
    await user.click(button)
    
    expect(mockOnGenerate).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when generation is in progress', () => {
    const loadingState: GenerationState = {
      ...defaultState,
      isLoading: true,
      canAbort: true,
    }
    
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={loadingState}
        disabled={false}
      />
    )
    
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('shows abort button when generation can be aborted', () => {
    const loadingState: GenerationState = {
      ...defaultState,
      isLoading: true,
      canAbort: true,
    }
    
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={loadingState}
        disabled={false}
      />
    )
    
    expect(screen.getByTestId('button-abort')).toBeInTheDocument()
    expect(screen.getByText('Abort')).toBeInTheDocument()
  })

  it('calls onAbort when abort button is clicked', async () => {
    const user = userEvent.setup()
    const loadingState: GenerationState = {
      ...defaultState,
      isLoading: true,
      canAbort: true,
    }
    
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={loadingState}
        disabled={false}
      />
    )
    
    const abortButton = screen.getByTestId('button-abort')
    await user.click(abortButton)
    
    expect(mockOnAbort).toHaveBeenCalledTimes(1)
  })

  it('shows error state with retry button when there is an error', () => {
    const errorState: GenerationState = {
      ...defaultState,
      error: 'Generation failed. Please try again.',
    }
    
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={errorState}
        disabled={false}
      />
    )
    
    expect(screen.getByTestId('text-error')).toBeInTheDocument()
    expect(screen.getByText('Generation failed. Please try again.')).toBeInTheDocument()
    expect(screen.getByTestId('button-retry')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()
    const errorState: GenerationState = {
      ...defaultState,
      error: 'Network error occurred',
    }
    
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={errorState}
        disabled={false}
      />
    )
    
    const retryButton = screen.getByTestId('button-retry')
    await user.click(retryButton)
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  it('shows success state when generation is complete', () => {
    const successState: GenerationState = {
      ...defaultState,
      result: {
        imageUrl: 'data:image/jpeg;base64,generated-image',
        originalImageUrl: 'data:image/jpeg;base64,original-image',
        prompt: 'A beautiful sunset',
        style: 'photorealistic',
      },
    }
    
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={successState}
        disabled={false}
      />
    )
    
    expect(screen.getByTestId('text-success')).toBeInTheDocument()
    expect(screen.getByText('✨ Image generated successfully!')).toBeInTheDocument()
    
    // Should still show generate button for new generation
    expect(screen.getByTestId('button-generate')).toBeInTheDocument()
    expect(screen.getByText('Generate Another')).toBeInTheDocument()
  })

  it('disables button during loading state', () => {
    const loadingState: GenerationState = {
      ...defaultState,
      isLoading: true,
    }
    
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={loadingState}
        disabled={false}
      />
    )
    
    const button = screen.getByTestId('button-generate')
    expect(button).toBeDisabled()
  })

  it('shows correct button text based on state', () => {
    const { rerender } = render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={defaultState}
        disabled={false}
      />
    )
    
    // Initial state
    expect(screen.getByText('Generate Image')).toBeInTheDocument()
    
    // Loading state
    const loadingState: GenerationState = { ...defaultState, isLoading: true }
    rerender(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={loadingState}
        disabled={false}
      />
    )
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    
    // Success state
    const successState: GenerationState = {
      ...defaultState,
      result: {
        imageUrl: 'test-url',
        originalImageUrl: 'original-url',
        prompt: 'test',
        style: 'test',
      },
    }
    rerender(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={successState}
        disabled={false}
      />
    )
    expect(screen.getByText('Generate Another')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={defaultState}
        disabled={false}
      />
    )
    
    const button = screen.getByTestId('button-generate')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('shows spinner with correct animation classes', () => {
    const loadingState: GenerationState = {
      ...defaultState,
      isLoading: true,
    }
    
    render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={loadingState}
        disabled={false}
      />
    )
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('spinner')
  })

  it('handles rapid state changes gracefully', async () => {
    const { rerender } = render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={defaultState}
        disabled={false}
      />
    )
    
    // Rapid state changes
    const loadingState: GenerationState = { ...defaultState, isLoading: true }
    rerender(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={loadingState}
        disabled={false}
      />
    )
    
    const errorState: GenerationState = { ...defaultState, error: 'Error' }
    rerender(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={errorState}
        disabled={false}
      />
    )
    
    rerender(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={defaultState}
        disabled={false}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Generate Image')).toBeInTheDocument()
    })
  })

  it('maintains focus management during state transitions', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={defaultState}
        disabled={false}
      />
    )
    
    const button = screen.getByTestId('button-generate')
    await user.click(button)
    
    // Simulate loading state
    const loadingState: GenerationState = { ...defaultState, isLoading: true }
    rerender(
      <GenerateButton
        onGenerate={mockOnGenerate}
        onAbort={mockOnAbort}
        onRetry={mockOnRetry}
        state={loadingState}
        disabled={false}
      />
    )
    
    expect(screen.getByTestId('button-generate')).toBeInTheDocument()
  })
})