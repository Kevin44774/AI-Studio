describe('File Upload', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display upload area on page load', () => {
    cy.get('[data-testid="dropzone-upload"]').should('be.visible');
    cy.get('[data-testid="dropzone-upload"]').should('contain', 'Drop your image here');
  });

  it('should allow clicking to browse files', () => {
    cy.get('[data-testid="dropzone-upload"]').should('have.attr', 'role', 'button');
    cy.get('[data-testid="dropzone-upload"]').should('have.attr', 'tabindex', '0');
  });

  it('should show keyboard navigation support', () => {
    cy.get('[data-testid="dropzone-upload"]').focus();
    cy.get('[data-testid="dropzone-upload"]').should('have.focus');
  });

  it('should simulate successful file upload', () => {
    // Create a mock file
    const fileName = 'test-image.png';
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

    // Verify file upload success state
    cy.get('[data-testid="dropzone-upload"]', { timeout: 10000 })
      .should('contain', fileName);
  });

  it('should show clear file button after upload', () => {
    // Simulate file upload first
    const fileName = 'test-image.png';
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

    // Check for clear button
    cy.get('[data-testid="button-clear-file"]', { timeout: 10000 }).should('be.visible');
    
    // Test clear functionality
    cy.get('[data-testid="button-clear-file"]').click();
    cy.get('[data-testid="dropzone-upload"]').should('contain', 'Drop your image here');
  });
});