import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { FileUpload } from '../file-upload'
import { createMockFile, createDataTransferWithFiles } from '@/test-utils'

// Mock the file processing utilities
vi.mock('@/lib/file-utils', () => ({
  processImageFile: vi.fn().mockImplementation((file: File) => {
    return Promise.resolve({
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      dataUrl: `data:${file.type};base64,mock-base64-data`,
    })
  }),
  validateImageFile: vi.fn().mockImplementation((file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type')
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File too large')
    }
    return true
  }),
}))

describe('FileUpload Component', () => {
  const mockOnFileUploaded = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload area with correct initial state', () => {
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    expect(screen.getByTestId('dropzone-upload')).toBeInTheDocument()
    expect(screen.getByText('Drop your image here, or click to browse')).toBeInTheDocument()
    expect(screen.getByText('PNG, JPG up to 10MB')).toBeInTheDocument()
  })

  it('shows upload icon in initial state', () => {
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const uploadIcon = screen.getByTestId('dropzone-upload').querySelector('svg')
    expect(uploadIcon).toBeInTheDocument()
  })

  it('handles file selection via click', async () => {
    const user = userEvent.setup()
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const file = createMockFile('test.jpg', 'image/jpeg', 1024)
    const fileInput = screen.getByTestId('input-file')
    
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(mockOnFileUploaded).toHaveBeenCalledWith({
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        dataUrl: 'data:image/jpeg;base64,mock-base64-data',
      })
    })
  })

  it('handles drag and drop', async () => {
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const dropzone = screen.getByTestId('dropzone-upload')
    const file = createMockFile('dropped.png', 'image/png', 2048)
    
    const dataTransfer = createDataTransferWithFiles([file])
    
    fireEvent.dragOver(dropzone, { dataTransfer })
    expect(dropzone).toHaveClass('drag-over')
    
    fireEvent.drop(dropzone, { dataTransfer })
    
    await waitFor(() => {
      expect(mockOnFileUploaded).toHaveBeenCalledWith({
        originalName: 'dropped.png',
        mimeType: 'image/png',
        size: 2048,
        dataUrl: 'data:image/png;base64,mock-base64-data',
      })
    })
  })

  it('removes drag-over class when drag leaves', () => {
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const dropzone = screen.getByTestId('dropzone-upload')
    
    fireEvent.dragOver(dropzone)
    expect(dropzone).toHaveClass('drag-over')
    
    fireEvent.dragLeave(dropzone)
    expect(dropzone).not.toHaveClass('drag-over')
  })

  it('shows processing state during upload', async () => {
    const user = userEvent.setup()
    
    // Mock a slow file processing
    const slowProcessing = vi.fn().mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve({
        originalName: 'slow.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        dataUrl: 'data:image/jpeg;base64,mock-base64-data',
      }), 100))
    })
    
    vi.doMock('@/lib/file-utils', () => ({
      processImageFile: slowProcessing,
      validateImageFile: vi.fn().mockReturnValue(true),
    }))
    
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const file = createMockFile('slow.jpg', 'image/jpeg', 1024)
    const fileInput = screen.getByTestId('input-file')
    
    await user.upload(fileInput, file)
    
    expect(screen.getByText('Processing image...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(mockOnFileUploaded).toHaveBeenCalled()
    })
  })

  it('displays uploaded file name after successful upload', async () => {
    const user = userEvent.setup()
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const file = createMockFile('beautiful-sunset.jpg', 'image/jpeg', 1024)
    const fileInput = screen.getByTestId('input-file')
    
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByText('✓ beautiful-sunset.jpg')).toBeInTheDocument()
      expect(screen.getByText('Click to change')).toBeInTheDocument()
    })
  })

  it('shows clear button when file is uploaded', async () => {
    const user = userEvent.setup()
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const file = createMockFile('test.jpg', 'image/jpeg', 1024)
    const fileInput = screen.getByTestId('input-file')
    
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByTestId('button-clear-file')).toBeInTheDocument()
    })
  })

  it('clears uploaded file when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const file = createMockFile('test.jpg', 'image/jpeg', 1024)
    const fileInput = screen.getByTestId('input-file')
    
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByTestId('button-clear-file')).toBeInTheDocument()
    })
    
    await user.click(screen.getByTestId('button-clear-file'))
    
    expect(mockOnFileUploaded).toHaveBeenLastCalledWith(null)
    expect(screen.getByText('Drop your image here, or click to browse')).toBeInTheDocument()
  })

  it('handles multiple files by only processing the first one', async () => {
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const dropzone = screen.getByTestId('dropzone-upload')
    const files = [
      createMockFile('first.jpg', 'image/jpeg', 1024),
      createMockFile('second.png', 'image/png', 2048),
    ]
    
    const dataTransfer = createDataTransferWithFiles(files)
    fireEvent.drop(dropzone, { dataTransfer })
    
    await waitFor(() => {
      expect(mockOnFileUploaded).toHaveBeenCalledWith({
        originalName: 'first.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        dataUrl: 'data:image/jpeg;base64,mock-base64-data',
      })
    })
  })

  it('prevents default drag behaviors', () => {
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const dropzone = screen.getByTestId('dropzone-upload')
    
    const dragOverEvent = new Event('dragover', { bubbles: true })
    const preventDefaultSpy = vi.spyOn(dragOverEvent, 'preventDefault')
    
    fireEvent(dropzone, dragOverEvent)
    
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('has proper accessibility attributes', () => {
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const dropzone = screen.getByTestId('dropzone-upload')
    const fileInput = screen.getByTestId('input-file')
    
    expect(dropzone).toHaveAttribute('role', 'button')
    expect(dropzone).toHaveAttribute('tabIndex', '0')
    expect(dropzone).toHaveAttribute('aria-label', 'Upload image file')
    
    expect(fileInput).toHaveAttribute('accept', 'image/*')
    expect(fileInput).toHaveAttribute('aria-label', 'Choose file')
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const dropzone = screen.getByTestId('dropzone-upload')
    
    // Focus the dropzone
    await user.tab()
    expect(dropzone).toHaveFocus()
    
    // Enter key should trigger file input click
    await user.keyboard('{Enter}')
    
    // Space key should also trigger file input click
    await user.keyboard(' ')
  })

  it('disables interactions during upload', async () => {
    const user = userEvent.setup()
    
    // Mock slow processing to test disabled state
    vi.doMock('@/lib/file-utils', () => ({
      processImageFile: vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      ),
      validateImageFile: vi.fn().mockReturnValue(true),
    }))
    
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    
    const file = createMockFile('test.jpg', 'image/jpeg', 1024)
    const fileInput = screen.getByTestId('input-file')
    const dropzone = screen.getByTestId('dropzone-upload')
    
    await user.upload(fileInput, file)
    
    // Dropzone should be disabled during upload
    expect(dropzone).toHaveClass('cursor-not-allowed')
  })
})