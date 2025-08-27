describe('Live Summary', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show initial empty state', () => {
    cy.get('[data-testid="text-summary-image"]').should('contain', 'No image');
    cy.get('[data-testid="text-summary-style"]').should('contain', 'Not selected');
  });

  it('should update image name after upload', () => {
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

    cy.get('[data-testid="text-summary-image"]', { timeout: 10000 }).should('contain', fileName);
  });

  it('should update style when selected', () => {
    cy.get('[data-testid="select-style"]').click();
    cy.contains('Editorial').click();
    cy.get('[data-testid="text-summary-style"]').should('contain', 'Editorial');
  });

  it('should show prompt when entered', () => {
    const testPrompt = 'Transform into cyberpunk style';
    cy.get('[data-testid="textarea-prompt"]').type(testPrompt);
    cy.get('[data-testid="text-summary-prompt"]').should('contain', testPrompt);
  });

  it('should update all fields simultaneously', () => {
    const fileName = 'test-image.png';
    const testPrompt = 'Transform into vintage style';

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

    // Enter prompt
    cy.get('[data-testid="textarea-prompt"]').type(testPrompt);

    // Select style
    cy.get('[data-testid="select-style"]').click();
    cy.contains('Vintage').click();

    // Verify all fields are updated
    cy.get('[data-testid="text-summary-image"]', { timeout: 10000 }).should('contain', fileName);
    cy.get('[data-testid="text-summary-prompt"]').should('contain', testPrompt);
    cy.get('[data-testid="text-summary-style"]').should('contain', 'Vintage');
  });
});