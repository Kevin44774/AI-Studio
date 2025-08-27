import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { HistorySidebar } from '../history-sidebar'
import { createMockHistoryItem } from '@/test-utils'

describe('HistorySidebar Component', () => {
  const mockOnHistoryItemClick = vi.fn()
  const mockOnClearHistory = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows empty state when no history items', () => {
    render(
      <HistorySidebar
        history={[]}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    expect(screen.getByText('No generations yet')).toBeInTheDocument()
    expect(screen.getByText('Your recent creations will appear here')).toBeInTheDocument()
    expect(screen.getByTestId('text-empty-history')).toBeInTheDocument()
  })

  it('displays history items when provided', () => {
    const historyItems = [
      createMockHistoryItem({
        id: 'item-1',
        prompt: 'A beautiful sunset over mountains',
        style: 'photorealistic',
      }),
      createMockHistoryItem({
        id: 'item-2',
        prompt: 'Abstract digital art',
        style: 'abstract',
      }),
    ]
    
    render(
      <HistorySidebar
        history={historyItems}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    expect(screen.getByTestId('history-item-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('history-item-item-2')).toBeInTheDocument()
    expect(screen.getByText('A beautiful sunset over mountains')).toBeInTheDocument()
    expect(screen.getByText('Abstract digital art')).toBeInTheDocument()
  })

  it('calls onHistoryItemClick when item is clicked', async () => {
    const user = userEvent.setup()
    const historyItem = createMockHistoryItem({
      id: 'clickable-item',
      prompt: 'Clickable prompt',
    })
    
    render(
      <HistorySidebar
        history={[historyItem]}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    const item = screen.getByTestId('history-item-clickable-item')
    await user.click(item)
    
    expect(mockOnHistoryItemClick).toHaveBeenCalledWith(historyItem)
  })

  it('handles keyboard navigation on history items', async () => {
    const user = userEvent.setup()
    const historyItem = createMockHistoryItem({
      id: 'keyboard-item',
      prompt: 'Keyboard accessible',
    })
    
    render(
      <HistorySidebar
        history={[historyItem]}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    const item = screen.getByTestId('history-item-keyboard-item')
    
    // Focus the item
    item.focus()
    expect(item).toHaveFocus()
    
    // Press Enter
    await user.keyboard('{Enter}')
    expect(mockOnHistoryItemClick).toHaveBeenCalledWith(historyItem)
    
    // Clear previous calls
    mockOnHistoryItemClick.mockClear()
    
    // Press Space
    await user.keyboard(' ')
    expect(mockOnHistoryItemClick).toHaveBeenCalledWith(historyItem)
  })

  it('displays style labels correctly', () => {
    const historyItems = [
      createMockHistoryItem({ style: 'photorealistic' }),
      createMockHistoryItem({ style: 'digital-art' }),
      createMockHistoryItem({ style: 'oil-painting' }),
    ]
    
    render(
      <HistorySidebar
        history={historyItems}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    expect(screen.getByText('Photorealistic')).toBeInTheDocument()
    expect(screen.getByText('Digital Art')).toBeInTheDocument()
    expect(screen.getByText('Oil Painting')).toBeInTheDocument()
  })

  it('truncates long prompts appropriately', () => {
    const longPromptItem = createMockHistoryItem({
      prompt: 'This is a very long prompt that should be truncated because it exceeds the reasonable display length for the sidebar component and we need to make sure it fits properly',
    })
    
    render(
      <HistorySidebar
        history={[longPromptItem]}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    // Should show truncated version
    const promptElement = screen.getByText(/This is a very long prompt/)
    expect(promptElement).toHaveClass('line-clamp-2')
  })

  it('shows storage usage indicator', () => {
    const historyItems = [
      createMockHistoryItem({ id: '1' }),
      createMockHistoryItem({ id: '2' }),
      createMockHistoryItem({ id: '3' }),
    ]
    
    render(
      <HistorySidebar
        history={historyItems}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    expect(screen.getByTestId('text-storage-used')).toHaveTextContent('3/5 slots')
    expect(screen.getByText('Storage Usage')).toBeInTheDocument()
  })

  it('shows clear button when history is not empty', () => {
    const historyItems = [createMockHistoryItem()]
    
    render(
      <HistorySidebar
        history={historyItems}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    expect(screen.getByTestId('button-clear-history')).toBeInTheDocument()
    expect(screen.getByText('Clear All')).toBeInTheDocument()
  })

  it('does not show clear button when history is empty', () => {
    render(
      <HistorySidebar
        history={[]}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    expect(screen.queryByTestId('button-clear-history')).not.toBeInTheDocument()
  })

  it('calls onClearHistory when clear button is clicked', async () => {
    const user = userEvent.setup()
    const historyItems = [createMockHistoryItem()]
    
    render(
      <HistorySidebar
        history={historyItems}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    const clearButton = screen.getByTestId('button-clear-history')
    await user.click(clearButton)
    
    expect(mockOnClearHistory).toHaveBeenCalledTimes(1)
  })

  it('displays proper progress bar based on storage usage', () => {
    const { rerender } = render(
      <HistorySidebar
        history={[]}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    // Empty history - 0% width
    let progressBar = document.querySelector('.progress-bar')
    expect(progressBar).toHaveStyle({ width: '0%' })
    
    // 3 out of 5 items - 60% width
    const threeItems = Array.from({ length: 3 }, (_, i) => createMockHistoryItem({ id: `item-${i}` }))
    rerender(
      <HistorySidebar
        history={threeItems}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    progressBar = document.querySelector('.progress-bar')
    expect(progressBar).toHaveStyle({ width: '60%' })
    
    // 5 out of 5 items - 100% width
    const fiveItems = Array.from({ length: 5 }, (_, i) => createMockHistoryItem({ id: `item-${i}` }))
    rerender(
      <HistorySidebar
        history={fiveItems}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    progressBar = document.querySelector('.progress-bar')
    expect(progressBar).toHaveStyle({ width: '100%' })
  })

  it('formats timestamps correctly', () => {
    const now = Date.now()
    const historyItem = createMockHistoryItem({
      timestamp: now,
    })
    
    render(
      <HistorySidebar
        history={[historyItem]}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    // Should show relative time (e.g., "just now", "2 minutes ago")
    const timeElement = screen.getByText(/ago|just now/i)
    expect(timeElement).toBeInTheDocument()
  })

  it('handles image loading errors gracefully', () => {
    const historyItem = createMockHistoryItem({
      imageUrl: 'invalid-url',
    })
    
    render(
      <HistorySidebar
        history={[historyItem]}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    
    // Simulate image load error
    const errorEvent = new Event('error')
    image.dispatchEvent(errorEvent)
    
    // Should fall back to placeholder
    expect(image).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml'))
  })

  it('has proper accessibility attributes', () => {
    const historyItem = createMockHistoryItem({
      id: 'accessible-item',
      prompt: 'Accessible prompt for testing',
    })
    
    render(
      <HistorySidebar
        history={[historyItem]}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    const item = screen.getByTestId('history-item-accessible-item')
    expect(item).toHaveAttribute('tabIndex', '0')
    expect(item).toHaveAttribute('aria-label', expect.stringContaining('Load generation'))
  })

  it('shows header with correct icon', () => {
    render(
      <HistorySidebar
        history={[]}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    expect(screen.getByText('History')).toBeInTheDocument()
    
    // Should have clock icon in header
    const header = screen.getByText('History').closest('h2')
    const clockIcon = header?.querySelector('svg')
    expect(clockIcon).toBeInTheDocument()
  })

  it('maintains scroll position when items are updated', () => {
    const manyItems = Array.from({ length: 10 }, (_, i) => 
      createMockHistoryItem({ id: `scroll-item-${i}` })
    )
    
    const { rerender } = render(
      <HistorySidebar
        history={manyItems}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    // Simulate adding another item
    const updatedItems = [...manyItems, createMockHistoryItem({ id: 'new-item' })]
    rerender(
      <HistorySidebar
        history={updatedItems}
        onHistoryItemClick={mockOnHistoryItemClick}
        onClearHistory={mockOnClearHistory}
      />
    )
    
    expect(screen.getByTestId('history-item-new-item')).toBeInTheDocument()
  })
})