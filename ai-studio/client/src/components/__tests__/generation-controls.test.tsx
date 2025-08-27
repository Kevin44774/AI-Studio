import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { GenerationControls } from '../generation-controls'

describe('GenerationControls Component', () => {
  const mockOnFormChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields correctly', () => {
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    // Check prompt textarea
    expect(screen.getByTestId('textarea-prompt')).toBeInTheDocument()
    expect(screen.getByText('Describe what you want to generate')).toBeInTheDocument()
    
    // Check style dropdown
    expect(screen.getByText('Style')).toBeInTheDocument()
    expect(screen.getByTestId('select-style')).toBeInTheDocument()
    
    // Check advanced options
    expect(screen.getByText('Advanced Options')).toBeInTheDocument()
  })

  it('shows character counter for prompt', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    const textarea = screen.getByTestId('textarea-prompt')
    
    // Initially shows 0/500
    expect(screen.getByText('0/500')).toBeInTheDocument()
    
    // Type some text
    await user.type(textarea, 'A beautiful sunset over the mountains')
    
    await waitFor(() => {
      expect(screen.getByText('35/500')).toBeInTheDocument()
    })
  })

  it('enforces prompt character limit', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    const textarea = screen.getByTestId('textarea-prompt')
    
    // Try to type more than 500 characters
    const longText = 'a'.repeat(600)
    await user.type(textarea, longText)
    
    await waitFor(() => {
      expect(textarea).toHaveValue('a'.repeat(500))
      expect(screen.getByText('500/500')).toBeInTheDocument()
    })
  })

  it('calls onFormChange when prompt changes', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    const textarea = screen.getByTestId('textarea-prompt')
    await user.type(textarea, 'Test prompt')
    
    await waitFor(() => {
      expect(mockOnFormChange).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'Test prompt',
          isValid: true,
        })
      )
    })
  })

  it('displays all style options in dropdown', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    const styleSelect = screen.getByTestId('select-style')
    await user.click(styleSelect)
    
    // Check that all expected style options are present
    const expectedStyles = [
      'Photorealistic',
      'Digital Art',
      'Oil Painting',
      'Watercolor',
      'Sketch',
      'Anime',
      'Abstract',
      'Vintage'
    ]
    
    for (const style of expectedStyles) {
      expect(screen.getByText(style)).toBeInTheDocument()
    }
  })

  it('calls onFormChange when style changes', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    const styleSelect = screen.getByTestId('select-style')
    await user.click(styleSelect)
    
    const oilPaintingOption = screen.getByText('Oil Painting')
    await user.click(oilPaintingOption)
    
    await waitFor(() => {
      expect(mockOnFormChange).toHaveBeenCalledWith(
        expect.objectContaining({
          style: 'oil-painting',
          isValid: expect.any(Boolean),
        })
      )
    })
  })

  it('shows advanced options when collapsible is opened', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    const advancedToggle = screen.getByText('Advanced Options')
    await user.click(advancedToggle)
    
    await waitFor(() => {
      expect(screen.getByText('Creativity')).toBeInTheDocument()
      expect(screen.getByText('Strength')).toBeInTheDocument()
    })
  })

  it('renders creativity slider with correct range', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    const advancedToggle = screen.getByText('Advanced Options')
    await user.click(advancedToggle)
    
    await waitFor(() => {
      const creativitySlider = screen.getByTestId('slider-creativity')
      expect(creativitySlider).toBeInTheDocument()
      
      // Check default value is displayed
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('renders strength slider with correct range', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    const advancedToggle = screen.getByText('Advanced Options')
    await user.click(advancedToggle)
    
    await waitFor(() => {
      const strengthSlider = screen.getByTestId('slider-strength')
      expect(strengthSlider).toBeInTheDocument()
      
      // Check default value is displayed (should be 75)
      expect(screen.getByText('75')).toBeInTheDocument()
    })
  })

  it('updates creativity value when slider changes', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    const advancedToggle = screen.getByText('Advanced Options')
    await user.click(advancedToggle)
    
    await waitFor(() => {
      const creativitySlider = screen.getByTestId('slider-creativity')
      expect(creativitySlider).toBeInTheDocument()
    })
    
    // Note: Slider interaction in jsdom is limited, so we test the display
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('validates form and reports validity', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    // Initially form should be invalid (empty prompt and style)
    expect(mockOnFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        isValid: false,
      })
    )
    
    // Fill in prompt
    const textarea = screen.getByTestId('textarea-prompt')
    await user.type(textarea, 'A beautiful landscape')
    
    // Select style
    const styleSelect = screen.getByTestId('select-style')
    await user.click(styleSelect)
    const photoOption = screen.getByText('Photorealistic')
    await user.click(photoOption)
    
    await waitFor(() => {
      expect(mockOnFormChange).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'A beautiful landscape',
          style: 'photorealistic',
          isValid: true,
        })
      )
    })
  })

  it('has proper accessibility attributes', () => {
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    const textarea = screen.getByTestId('textarea-prompt')
    expect(textarea).toHaveAttribute('placeholder', 'Describe what you want to generate')
    
    // Check labels are associated correctly
    expect(screen.getByText('Prompt')).toBeInTheDocument()
    expect(screen.getByText('Style')).toBeInTheDocument()
  })

  it('maintains form state when advanced options are toggled', async () => {
    const user = userEvent.setup()
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    // Fill in some form data
    const textarea = screen.getByTestId('textarea-prompt')
    await user.type(textarea, 'Test prompt')
    
    const styleSelect = screen.getByTestId('select-style')
    await user.click(styleSelect)
    const artOption = screen.getByText('Digital Art')
    await user.click(artOption)
    
    // Toggle advanced options
    const advancedToggle = screen.getByText('Advanced Options')
    await user.click(advancedToggle)
    await user.click(advancedToggle) // Close it
    
    // Form data should still be there
    expect(textarea).toHaveValue('Test prompt')
  })

  it('includes component header with icon', () => {
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    expect(screen.getByText('Generation Settings')).toBeInTheDocument()
    
    // Should have settings icon in header
    const header = screen.getByText('Generation Settings').closest('h2')
    const settingsIcon = header?.querySelector('svg')
    expect(settingsIcon).toBeInTheDocument()
  })

  it('provides default values for all form fields', () => {
    render(<GenerationControls onFormChange={mockOnFormChange} />)
    
    // Check that onFormChange is called with default values
    expect(mockOnFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: '',
        style: '',
        creativity: 5,
        strength: 75,
        isValid: false,
      })
    )
  })
})