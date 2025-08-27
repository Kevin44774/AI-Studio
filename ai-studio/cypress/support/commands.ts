/// <reference types="cypress" />

// Custom command to upload a file
Cypress.Commands.add('uploadFile', (selector: string, fileName: string, fileType = 'image/png') => {
  cy.fixture(fileName, 'base64').then((fileContent: string) => {
    const blob = Cypress.Blob.base64StringToBlob(fileContent, fileType);
    const file = new File([blob], fileName, { type: fileType });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    cy.get(selector).then((input: any) => {
      const inputElement = input[0] as HTMLInputElement;
      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
});

// Custom command to wait for loading to complete
Cypress.Commands.add('waitForGeneration', () => {
  cy.get('[data-testid="button-generate"]').should('be.visible');
  cy.get('.spinner', { timeout: 30000 }).should('not.exist');
});

declare global {
  namespace Cypress {
    interface Chainable {
      uploadFile(selector: string, fileName: string, fileType?: string): Chainable<void>;
      waitForGeneration(): Chainable<void>;
    }
  }
}