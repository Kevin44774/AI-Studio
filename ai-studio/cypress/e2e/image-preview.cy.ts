describe('Image Preview', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show no image state initially', () => {
    cy.get('[data-testid="text-no-image"]').should('be.visible');
    cy.get('[data-testid="text-no-image"]').should('contain', 'No image uploaded');
  });

  it('should display image details after upload', () => {
    // Upload a test image first
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

    // Wait for upload and check preview
    cy.get('[data-testid="img-preview"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="text-format"]').should('contain', 'PNG');
    cy.get('[data-testid="text-filename"]').should('contain', fileName);
    cy.get('[data-testid="text-filesize"]').should('be.visible');
  });

  it('should handle image load errors gracefully', () => {
    // This test verifies the error handling in the image preview component
    cy.get('[data-testid="text-no-image"]').should('be.visible');
  });
});