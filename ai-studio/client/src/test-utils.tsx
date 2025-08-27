import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a wrapper component that includes all the providers
function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Custom render function that includes providers
function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Helper function to create a mock file
export function createMockFile(
  name = 'test-image.jpg',
  type = 'image/jpeg',
  size = 1024
): File {
  const content = new Uint8Array(size)
  return new File([content], name, { type })
}

// Helper function to create a mock uploaded file
export function createMockUploadedFile(overrides = {}) {
  return {
    originalName: 'test-image.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    dataUrl: 'data:image/jpeg;base64,mock-base64-data',
    ...overrides,
  }
}

// Helper function to create mock generation history item
export function createMockHistoryItem(overrides = {}) {
  return {
    id: 'mock-id-1',
    originalImageUrl: 'data:image/jpeg;base64,original-mock-data',
    imageUrl: 'data:image/jpeg;base64,generated-mock-data',
    prompt: 'A beautiful sunset over mountains',
    style: 'photorealistic',
    timestamp: Date.now(),
    ...overrides,
  }
}

// Helper function to simulate drag and drop events
export function createDataTransferWithFiles(files: File[]) {
  const dt = new DataTransfer()
  files.forEach(file => dt.items.add(file))
  return dt
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { render }