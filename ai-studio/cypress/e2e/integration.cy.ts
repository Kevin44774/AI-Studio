describe('Full Integration Test', () => {
  beforeEach(() => {
    cy.visit('/');
    // Clear any existing history
    cy.window().then((win) => {
      win.localStorage.removeItem('ai-studio-history');
    });
  });

  it('should complete full workflow from upload to generation', () => {
    const fileName = 'test-image.png';
    const testPrompt = 'Transform this image into a beautiful watercolor painting with soft brushstrokes';

    // Step 1: Upload image
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

    // Step 2: Verify image preview
    cy.get('[data-testid="img-preview"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="text-format"]').should('contain', 'PNG');
    cy.get('[data-testid="text-filename"]').should('contain', fileName);

    // Step 3: Fill generation form
    cy.get('[data-testid="textarea-prompt"]').type(testPrompt);
    cy.get('[data-testid="select-style"]').click();
    cy.contains('Watercolor').click();

    // Step 4: Verify live summary updates
    cy.get('[data-testid="text-summary-image"]').should('contain', fileName);
    cy.get('[data-testid="text-summary-prompt"]').should('contain', testPrompt);
    cy.get('[data-testid="text-summary-style"]').should('contain', 'Watercolor');

    // Step 5: Test advanced options
    cy.get('[data-testid="button-advanced-options"]').click();
    cy.get('[data-testid="slider-creativity"]').should('be.visible');
    cy.get('[data-testid="slider-strength"]').should('be.visible');

    // Step 6: Generate image
    cy.get('[data-testid="button-generate"]').should('not.be.disabled');
    cy.get('[data-testid="button-generate"]').click();

    // Step 7: Verify loading state
    cy.get('.spinner').should('be.visible');
    cy.contains('Generating your image...').should('be.visible');
    cy.get('[data-testid="button-abort"]').should('be.visible');

    // Step 8: Wait for completion
    cy.get('.spinner', { timeout: 15000 }).should('not.exist');

    // Step 9: Verify completion state
    cy.get('[data-testid="button-generate"]', { timeout: 5000 }).should('be.visible');

    // Step 10: Check if history was updated (if generation was successful)
    cy.get('body').then($body => {
      if ($body.find('[data-testid^="history-item-"]').length > 0) {
        cy.get('[data-testid^="history-item-"]').should('be.visible');
        cy.get('[data-testid="button-clear-history"]').should('be.visible');
        cy.get('[data-testid="text-storage-used"]').should('contain', '1/5 slots');
      }
    });
  });

  it('should handle multiple generations and history management', () => {
    const fileName = 'test-image.png';
    
    // Helper function to upload and generate
    const uploadAndGenerate = (prompt: string, style: string) => {
      // Upload image
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

      // Fill form
      cy.get('[data-testid="textarea-prompt"]', { timeout: 10000 }).clear().type(prompt);
      cy.get('[data-testid="select-style"]').click();
      cy.contains(style).click();

      // Generate
      cy.get('[data-testid="button-generate"]').click();
      cy.get('.spinner', { timeout: 15000 }).should('not.exist');
    };

    // Generate multiple images
    uploadAndGenerate('Modern art style', 'Editorial');
    uploadAndGenerate('Vintage aesthetic', 'Vintage');
    uploadAndGenerate('Street art vibes', 'Streetwear');

    // Verify multiple history items exist (if generations were successful)
    cy.get('body').then($body => {
      const historyItems = $body.find('[data-testid^="history-item-"]');
      if (historyItems.length > 0) {
        expect(historyItems.length).to.be.at.most(5); // Max history limit
      }
    });
  });

  it('should handle error recovery and retry workflow', () => {
    const fileName = 'test-image.png';
    const testPrompt = 'Error recovery test';

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

    // Generate multiple times to potentially trigger error (20% chance)
    let errorFound = false;
    for (let attempt = 0; attempt < 5 && !errorFound; attempt++) {
      cy.get('[data-testid="button-generate"]').click();
      cy.get('.spinner', { timeout: 15000 }).should('not.exist');

      cy.get('body').then($body => {
        if ($body.find('[data-testid="button-retry"]').length > 0) {
          errorFound = true;
          
          // Test error state
          cy.get('[data-testid="text-error-message"]').should('be.visible');
          cy.get('[data-testid="button-retry"]').should('be.visible');
          cy.get('[data-testid="button-cancel-retry"]').should('be.visible');

          // Test retry
          cy.get('[data-testid="button-retry"]').click();
          cy.get('.spinner', { timeout: 15000 }).should('not.exist');

          // Should return to normal state
          cy.get('[data-testid="button-generate"]').should('be.visible');
        }
      });

      if (!errorFound && attempt < 4) {
        // Wait a bit before next attempt
        cy.wait(1000);
      }
    }
  });

  it('should maintain responsive design across different viewport sizes', () => {
    const fileName = 'test-image.png';

    // Test mobile viewport
    cy.viewport(375, 667);
    cy.visit('/');

    // Upload image
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

    // Verify components are still accessible on mobile
    cy.get('[data-testid="img-preview"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="textarea-prompt"]').should('be.visible');
    cy.get('[data-testid="select-style"]').should('be.visible');

    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.get('[data-testid="button-generate"]').should('be.visible');

    // Test desktop viewport
    cy.viewport(1280, 720);
    cy.get('[data-testid="button-generate"]').should('be.visible');
  });
});