import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { ImagePreview } from '../image-preview'
import { createMockUploadedFile } from '@/test-utils'

describe('ImagePreview Component', () => {
  it('shows empty state when no file is provided', () => {
    render(<ImagePreview file={null} />)
    
    expect(screen.getByTestId('text-no-image')).toBeInTheDocument()
    expect(screen.getByText('No image uploaded')).toBeInTheDocument()
    
    // Should show eye icon
    const eyeIcon = screen.getByTestId('text-no-image').querySelector('svg')
    expect(eyeIcon).toBeInTheDocument()
  })

  it('displays image when file is provided', () => {
    const mockFile = createMockUploadedFile({
      originalName: 'sunset.jpg',
      mimeType: 'image/jpeg',
      size: 2048,
      dataUrl: 'data:image/jpeg;base64,test-image-data',
    })
    
    render(<ImagePreview file={mockFile} />)
    
    const image = screen.getByTestId('img-preview')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'data:image/jpeg;base64,test-image-data')
    expect(image).toHaveAttribute('alt', 'Uploaded preview')
  })

  it('displays file metadata when file is provided', () => {
    const mockFile = createMockUploadedFile({
      originalName: 'mountain-landscape.png',
      mimeType: 'image/png',
      size: 5242880, // 5MB
    })
    
    render(<ImagePreview file={mockFile} />)
    
    // Check format display
    expect(screen.getByTestId('text-format')).toHaveTextContent('PNG')
    
    // Check filename display
    expect(screen.getByTestId('text-filename')).toHaveTextContent('mountain-landscape.png')
    
    // Check file size display (should be formatted)
    expect(screen.getByTestId('text-filesize')).toHaveTextContent('5.0 MB')
  })

  it('formats file sizes correctly', () => {
    const testCases = [
      { size: 1024, expected: '1.0 KB' },
      { size: 1536, expected: '1.5 KB' },
      { size: 1048576, expected: '1.0 MB' },
      { size: 2621440, expected: '2.5 MB' },
      { size: 500, expected: '500 B' },
    ]
    
    testCases.forEach(({ size, expected }) => {
      const mockFile = createMockUploadedFile({ size })
      const { unmount } = render(<ImagePreview file={mockFile} />)
      
      expect(screen.getByTestId('text-filesize')).toHaveTextContent(expected)
      
      unmount()
    })
  })

  it('handles different image formats correctly', () => {
    const formats = [
      { mimeType: 'image/jpeg', expected: 'JPEG' },
      { mimeType: 'image/png', expected: 'PNG' },
      { mimeType: 'image/webp', expected: 'WEBP' },
      { mimeType: 'image/gif', expected: 'GIF' },
    ]
    
    formats.forEach(({ mimeType, expected }) => {
      const mockFile = createMockUploadedFile({ mimeType })
      const { unmount } = render(<ImagePreview file={mockFile} />)
      
      expect(screen.getByTestId('text-format')).toHaveTextContent(expected)
      
      unmount()
    })
  })

  it('truncates long filenames in display', () => {
    const mockFile = createMockUploadedFile({
      originalName: 'this-is-a-very-long-filename-that-should-be-truncated-properly.jpg',
    })
    
    render(<ImagePreview file={mockFile} />)
    
    const filenameElement = screen.getByTestId('text-filename')
    expect(filenameElement).toHaveClass('truncate')
    expect(filenameElement).toHaveTextContent('this-is-a-very-long-filename-that-should-be-truncated-properly.jpg')
  })

  it('has proper structure and styling classes', () => {
    const mockFile = createMockUploadedFile()
    render(<ImagePreview file={mockFile} />)
    
    // Check if metadata grid is properly structured
    const metadataGrid = screen.getByTestId('text-format').closest('.grid')
    expect(metadataGrid).toHaveClass('grid-cols-3')
    expect(metadataGrid).toHaveClass('gap-4')
  })

  it('shows image with correct styling classes', () => {
    const mockFile = createMockUploadedFile()
    render(<ImagePreview file={mockFile} />)
    
    const image = screen.getByTestId('img-preview')
    expect(image).toHaveClass('max-w-full')
    expect(image).toHaveClass('max-h-[400px]')
    expect(image).toHaveClass('rounded-lg')
    expect(image).toHaveClass('object-contain')
  })

  it('renders preview header correctly', () => {
    render(<ImagePreview file={null} />)
    
    expect(screen.getByText('Preview')).toBeInTheDocument()
    
    // Should have eye icon in header
    const header = screen.getByText('Preview').closest('h2')
    const eyeIcon = header?.querySelector('svg')
    expect(eyeIcon).toBeInTheDocument()
  })

  it('maintains aspect ratio for different image sizes', () => {
    const mockFile = createMockUploadedFile({
      dataUrl: 'data:image/jpeg;base64,square-image-data',
    })
    
    render(<ImagePreview file={mockFile} />)
    
    const image = screen.getByTestId('img-preview')
    expect(image).toHaveClass('object-contain')
  })

  it('handles empty or undefined file gracefully', () => {
    const { rerender } = render(<ImagePreview file={null} />)
    
    expect(screen.getByTestId('text-no-image')).toBeInTheDocument()
    
    // Test with undefined
    rerender(<ImagePreview file={undefined as any} />)
    expect(screen.getByTestId('text-no-image')).toBeInTheDocument()
  })

  it('updates display when file prop changes', () => {
    const firstFile = createMockUploadedFile({
      originalName: 'first.jpg',
      mimeType: 'image/jpeg',
    })
    
    const { rerender } = render(<ImagePreview file={firstFile} />)
    
    expect(screen.getByTestId('text-filename')).toHaveTextContent('first.jpg')
    expect(screen.getByTestId('text-format')).toHaveTextContent('JPEG')
    
    const secondFile = createMockUploadedFile({
      originalName: 'second.png',
      mimeType: 'image/png',
    })
    
    rerender(<ImagePreview file={secondFile} />)
    
    expect(screen.getByTestId('text-filename')).toHaveTextContent('second.png')
    expect(screen.getByTestId('text-format')).toHaveTextContent('PNG')
  })
})