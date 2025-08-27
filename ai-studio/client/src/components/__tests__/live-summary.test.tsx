import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { LiveSummary } from '../live-summary'
import { createMockUploadedFile } from '@/test-utils'

describe('LiveSummary Component', () => {
  it('renders with empty state initially', () => {
    render(
      <LiveSummary
        file={null}
        prompt=""
        style=""
      />
    )
    
    expect(screen.getByText('Generation Summary')).toBeInTheDocument()
    expect(screen.getByText('No image')).toBeInTheDocument()
    expect(screen.getByText('No style selected')).toBeInTheDocument()
    expect(screen.getByText('No prompt')).toBeInTheDocument()
  })

  it('displays image name when file is provided', () => {
    const mockFile = createMockUploadedFile({
      originalName: 'beautiful-sunset.jpg',
    })
    
    render(
      <LiveSummary
        file={mockFile}
        prompt=""
        style=""
      />
    )
    
    expect(screen.getByText('beautiful-sunset.jpg')).toBeInTheDocument()
    expect(screen.queryByText('No image')).not.toBeInTheDocument()
  })

  it('displays prompt when provided', () => {
    render(
      <LiveSummary
        file={null}
        prompt="A majestic mountain landscape with snow peaks"
        style=""
      />
    )
    
    expect(screen.getByText('A majestic mountain landscape with snow peaks')).toBeInTheDocument()
    expect(screen.queryByText('No prompt')).not.toBeInTheDocument()
  })

  it('displays style label when style is selected', () => {
    render(
      <LiveSummary
        file={null}
        prompt=""
        style="photorealistic"
      />
    )
    
    expect(screen.getByText('Photorealistic')).toBeInTheDocument()
    expect(screen.queryByText('No style selected')).not.toBeInTheDocument()
  })

  it('displays all information when everything is provided', () => {
    const mockFile = createMockUploadedFile({
      originalName: 'nature-photo.png',
    })
    
    render(
      <LiveSummary
        file={mockFile}
        prompt="Transform this into a magical fantasy landscape"
        style="digital-art"
      />
    )
    
    expect(screen.getByText('nature-photo.png')).toBeInTheDocument()
    expect(screen.getByText('Transform this into a magical fantasy landscape')).toBeInTheDocument()
    expect(screen.getByText('Digital Art')).toBeInTheDocument()
    
    // Should not show any "No ..." messages
    expect(screen.queryByText('No image')).not.toBeInTheDocument()
    expect(screen.queryByText('No prompt')).not.toBeInTheDocument()
    expect(screen.queryByText('No style selected')).not.toBeInTheDocument()
  })

  it('maps style values to display labels correctly', () => {
    const styleTests = [
      { value: 'photorealistic', label: 'Photorealistic' },
      { value: 'digital-art', label: 'Digital Art' },
      { value: 'oil-painting', label: 'Oil Painting' },
      { value: 'watercolor', label: 'Watercolor' },
      { value: 'sketch', label: 'Sketch' },
      { value: 'anime', label: 'Anime' },
      { value: 'abstract', label: 'Abstract' },
      { value: 'vintage', label: 'Vintage' },
    ]
    
    styleTests.forEach(({ value, label }) => {
      const { unmount } = render(
        <LiveSummary
          file={null}
          prompt=""
          style={value}
        />
      )
      
      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    })
  })

  it('handles unknown style values gracefully', () => {
    render(
      <LiveSummary
        file={null}
        prompt=""
        style="unknown-style"
      />
    )
    
    // Should display the unknown style as-is
    expect(screen.getByText('unknown-style')).toBeInTheDocument()
  })

  it('truncates very long prompts appropriately', () => {
    const longPrompt = 'This is an extremely long prompt that goes on and on and on and might need to be truncated or handled gracefully in the UI to prevent layout issues and ensure good user experience across different screen sizes and device types'
    
    render(
      <LiveSummary
        file={null}
        prompt={longPrompt}
        style=""
      />
    )
    
    expect(screen.getByText(longPrompt)).toBeInTheDocument()
    
    // Check if the prompt text has appropriate styling for long content
    const promptElement = screen.getByText(longPrompt)
    expect(promptElement).toHaveClass('line-clamp-2')
  })

  it('updates display when props change', () => {
    const { rerender } = render(
      <LiveSummary
        file={null}
        prompt="Initial prompt"
        style="photorealistic"
      />
    )
    
    expect(screen.getByText('Initial prompt')).toBeInTheDocument()
    expect(screen.getByText('Photorealistic')).toBeInTheDocument()
    
    const newFile = createMockUploadedFile({ originalName: 'new-image.jpg' })
    rerender(
      <LiveSummary
        file={newFile}
        prompt="Updated prompt"
        style="digital-art"
      />
    )
    
    expect(screen.getByText('new-image.jpg')).toBeInTheDocument()
    expect(screen.getByText('Updated prompt')).toBeInTheDocument()
    expect(screen.getByText('Digital Art')).toBeInTheDocument()
    expect(screen.queryByText('Initial prompt')).not.toBeInTheDocument()
    expect(screen.queryByText('Photorealistic')).not.toBeInTheDocument()
  })

  it('has proper component structure and icons', () => {
    render(
      <LiveSummary
        file={null}
        prompt=""
        style=""
      />
    )
    
    // Check for eye icon in header
    const header = screen.getByText('Generation Summary').closest('h3')
    const eyeIcon = header?.querySelector('svg')
    expect(eyeIcon).toBeInTheDocument()
    
    // Check for appropriate icons in each section
    const content = screen.getByText('Generation Summary').closest('.p-6')
    const icons = content?.querySelectorAll('svg')
    expect(icons).toHaveLength(4) // Eye icon + 3 section icons (Image, Palette, Type)
  })

  it('applies correct styling classes', () => {
    render(
      <LiveSummary
        file={null}
        prompt=""
        style=""
        className="custom-class"
      />
    )
    
    const card = screen.getByText('Generation Summary').closest('.bg-gradient-to-r')
    expect(card).toHaveClass('custom-class')
    expect(card).toHaveClass('from-primary/5')
    expect(card).toHaveClass('border-primary/20')
  })

  it('handles empty string values correctly', () => {
    render(
      <LiveSummary
        file={null}
        prompt=""
        style=""
      />
    )
    
    expect(screen.getByText('No image')).toBeInTheDocument()
    expect(screen.getByText('No prompt')).toBeInTheDocument()
    expect(screen.getByText('No style selected')).toBeInTheDocument()
  })

  it('handles whitespace-only prompt gracefully', () => {
    render(
      <LiveSummary
        file={null}
        prompt="   \n  \t  "
        style=""
      />
    )
    
    // Should treat whitespace-only as empty
    expect(screen.getByText('No prompt')).toBeInTheDocument()
  })

  it('displays file information with proper formatting', () => {
    const mockFile = createMockUploadedFile({
      originalName: 'my-image.jpg',
    })
    
    render(
      <LiveSummary
        file={mockFile}
        prompt=""
        style=""
      />
    )
    
    const imageText = screen.getByText('my-image.jpg')
    expect(imageText).toHaveClass('font-medium')
  })

  it('shows prompt with proper text styling', () => {
    render(
      <LiveSummary
        file={null}
        prompt="Beautiful artwork prompt"
        style=""
      />
    )
    
    const promptText = screen.getByText('Beautiful artwork prompt')
    expect(promptText).toHaveClass('font-medium')
  })

  it('shows style with proper text styling', () => {
    render(
      <LiveSummary
        file={null}
        prompt=""
        style="oil-painting"
      />
    )
    
    const styleText = screen.getByText('Oil Painting')
    expect(styleText).toHaveClass('font-medium')
  })

  it('maintains consistent layout with responsive grid', () => {
    render(
      <LiveSummary
        file={null}
        prompt=""
        style=""
      />
    )
    
    const grid = screen.getByText('Generation Summary').nextElementSibling
    expect(grid).toHaveClass('grid')
    expect(grid).toHaveClass('grid-cols-1')
    expect(grid).toHaveClass('md:grid-cols-3')
    expect(grid).toHaveClass('gap-4')
  })
})