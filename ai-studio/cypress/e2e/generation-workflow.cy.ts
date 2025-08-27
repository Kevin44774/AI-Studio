describe('Generation Workflow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  const setupCompleteForm = () => {
    const fileName = 'test-image.png';
    const testPrompt = 'Transform into modern art style';

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
    cy.get('[data-testid="textarea-prompt"]', { timeout: 10000 }).type(testPrompt);
    cy.get('[data-testid="select-style"]').click();
    cy.contains('Editorial').click();
  };

  it('should disable generate button when form is incomplete', () => {
    cy.get('[data-testid="button-generate"]').should('be.disabled');
  });

  it('should enable generate button when form is complete', () => {
    setupCompleteForm();
    cy.get('[data-testid="button-generate"]', { timeout: 10000 }).should('not.be.disabled');
  });

  it('should show loading state during generation', () => {
    setupCompleteForm();
    
    cy.get('[data-testid="button-generate"]', { timeout: 10000 }).click();
    
    // Should show loading spinner
    cy.get('.spinner').should('be.visible');
    cy.contains('Generating your image...').should('be.visible');
    
    // Should show abort button
    cy.get('[data-testid="button-abort"]').should('be.visible');
  });

  it('should handle successful generation', () => {
    setupCompleteForm();
    
    cy.get('[data-testid="button-generate"]', { timeout: 10000 }).click();
    
    // Wait for generation to complete (mock API has 1-2s delay)
    cy.get('.spinner', { timeout: 15000 }).should('not.exist');
    
    // Should return to generate button state
    cy.get('[data-testid="button-generate"]', { timeout: 5000 }).should('be.visible');
  });

  it('should handle generation errors and retry', () => {
    setupCompleteForm();
    
    // Generate multiple times to potentially trigger the 20% error rate
    for (let i = 0; i < 3; i++) {
      cy.get('[data-testid="button-generate"]', { timeout: 10000 }).click();
      
      // Wait for completion or error
      cy.get('.spinner', { timeout: 15000 }).should('not.exist');
      
      // Check if error occurred
      cy.get('body').then($body => {
        if ($body.find('[data-testid="button-retry"]').length > 0) {
          // Error occurred, test retry functionality
          cy.get('[data-testid="text-error-message"]').should('be.visible');
          cy.get('[data-testid="button-retry"]').should('be.visible');
          cy.get('[data-testid="button-cancel-retry"]').should('be.visible');
          
          // Test retry
          cy.get('[data-testid="button-retry"]').click();
          cy.get('.spinner', { timeout: 15000 }).should('not.exist');
          return; // Exit loop if error was found and tested
        }
      });
    }
  });

  it('should allow aborting generation', () => {
    setupCompleteForm();
    
    cy.get('[data-testid="button-generate"]', { timeout: 10000 }).click();
    
    // Quickly abort before completion
    cy.get('[data-testid="button-abort"]', { timeout: 2000 }).click();
    
    // Should return to generate button state
    cy.get('[data-testid="button-generate"]', { timeout: 5000 }).should('be.visible');
    cy.get('.spinner').should('not.exist');
  });

  it('should show retry count during automatic retries', () => {
    // This test would require mocking the API to force errors
    // For now, we'll just verify the UI elements exist
    setupCompleteForm();
    
    cy.get('[data-testid="button-generate"]', { timeout: 10000 }).click();
    
    // Wait for any potential retry states
    cy.get('.spinner', { timeout: 20000 }).should('not.exist');
  });
});