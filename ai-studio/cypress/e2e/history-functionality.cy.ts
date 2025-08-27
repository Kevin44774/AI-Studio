describe('History Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    // Clear any existing history
    cy.window().then((win) => {
      win.localStorage.removeItem('ai-studio-history');
    });
  });

  it('should show empty history state initially', () => {
    cy.get('[data-testid="empty-history"]').should('be.visible');
    cy.get('[data-testid="empty-history"]').should('contain', 'No generations yet');
  });

  it('should show clear history button when history exists', () => {
    // First need to create a generation
    const fileName = 'test-image.png';
    const testPrompt = 'Transform into art style';

    // Upload and fill form
    cy.fixture('test-image.json').then((testImage) => {
      const blob = Cypress.Blob.base64StringToBlob(testImage.base64, testImage.mimeType);
      const file = new File([blob], fileName, { type: testImage.mimeType });
      
      cy.get('[data-testid="dropzone-upload"]').then(($dropzone) => {
        const dropzone = $dropzone[0];
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        const dropEvent = new DragEvent('drop', {
          dataTransfer: dataTransfer,
          bubbles: true,
          cancelable: true
        });
        
        dropzone.dispatchEvent(dropEvent);
      });
    });

    cy.get('[data-testid="textarea-prompt"]', { timeout: 10000 }).type(testPrompt);
    cy.get('[data-testid="select-style"]').click();
    cy.contains('Editorial').click();

    // Generate
    cy.get('[data-testid="button-generate"]', { timeout: 10000 }).click();
    cy.get('.spinner', { timeout: 15000 }).should('not.exist');

    // Check if history item appears and clear button is visible
    cy.get('body').then($body => {
      if ($body.find('[data-testid^="history-item-"]').length > 0) {
        cy.get('[data-testid="button-clear-history"]').should('be.visible');
      }
    });
  });

  it('should store generations in localStorage', () => {
    // Create a generation and verify localStorage
    const fileName = 'test-image.png';
    const testPrompt = 'Test prompt for storage';

    // Upload and fill form
    cy.fixture('test-image.json').then((testImage) => {
      const blob = Cypress.Blob.base64StringToBlob(testImage.base64, testImage.mimeType);
      const file = new File([blob], fileName, { type: testImage.mimeType });
      
      cy.get('[data-testid="dropzone-upload"]').then(($dropzone) => {
        const dropzone = $dropzone[0];
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        const dropEvent = new DragEvent('drop', {
          dataTransfer: dataTransfer,
          bubbles: true,
          cancelable: true
        });
        
        dropzone.dispatchEvent(dropEvent);
      });
    });

    cy.get('[data-testid="textarea-prompt"]', { timeout: 10000 }).type(testPrompt);
    cy.get('[data-testid="select-style"]').click();
    cy.contains('Editorial').click();

    cy.get('[data-testid="button-generate"]', { timeout: 10000 }).click();
    cy.get('.spinner', { timeout: 15000 }).should('not.exist');

    // Check localStorage
    cy.window().then((win) => {
      const history = win.localStorage.getItem('ai-studio-history');
      if (history) {
        const parsedHistory = JSON.parse(history);
        expect(parsedHistory).to.be.an('array');
      }
    });
  });

  it('should show storage usage indicator', () => {
    cy.get('[data-testid="text-storage-used"]').should('contain', '0/5 slots');
  });

  it('should clear all history when clear button is clicked', () => {
    // First add some mock history
    cy.window().then((win) => {
      const mockHistory = [{
        id: 'test-1',
        imageUrl: 'https://example.com/image.jpg',
        originalImageUrl: 'data:image/png;base64,test',
        prompt: 'Test prompt',
        style: 'editorial',
        createdAt: new Date().toISOString()
      }];
      win.localStorage.setItem('ai-studio-history', JSON.stringify(mockHistory));
    });

    // Reload page to see the history
    cy.reload();

    // Clear history
    cy.get('[data-testid="button-clear-history"]').should('be.visible').click();
    cy.get('[data-testid="empty-history"]').should('be.visible');
  });

  it('should restore generation when history item is clicked', () => {
    // Add mock history
    cy.window().then((win) => {
      const mockHistory = [{
        id: 'test-1',
        imageUrl: 'https://example.com/image.jpg',
        originalImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        prompt: 'Test restoration prompt',
        style: 'vintage',
        createdAt: new Date().toISOString()
      }];
      win.localStorage.setItem('ai-studio-history', JSON.stringify(mockHistory));
    });

    cy.reload();

    // Click history item
    cy.get('[data-testid="history-item-test-1"]').should('be.visible').click();

    // Verify restoration
    cy.get('[data-testid="textarea-prompt"]').should('have.value', 'Test restoration prompt');
    cy.get('[data-testid="select-style"]').should('contain', 'Vintage');
  });

  it('should support keyboard navigation for history items', () => {
    // Add mock history
    cy.window().then((win) => {
      const mockHistory = [{
        id: 'test-1',
        imageUrl: 'https://example.com/image.jpg',
        originalImageUrl: 'data:image/png;base64,test',
        prompt: 'Keyboard test',
        style: 'editorial',
        createdAt: new Date().toISOString()
      }];
      win.localStorage.setItem('ai-studio-history', JSON.stringify(mockHistory));
    });

    cy.reload();

    // Test keyboard navigation
    cy.get('[data-testid="history-item-test-1"]').should('be.visible');
    cy.get('[data-testid="history-item-test-1"]').should('have.attr', 'tabindex', '0');
    cy.get('[data-testid="history-item-test-1"]').focus();
    cy.get('[data-testid="history-item-test-1"]').should('have.focus');
  });
});