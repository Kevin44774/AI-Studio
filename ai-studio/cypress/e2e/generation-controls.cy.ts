describe('Generation Controls', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have prompt textarea with character counter', () => {
    cy.get('[data-testid="textarea-prompt"]').should('be.visible');
    cy.get('[data-testid="text-character-count"]').should('contain', '0/500');
  });

  it('should update character count as user types', () => {
    const testPrompt = 'Transform this image into a modern art style';
    cy.get('[data-testid="textarea-prompt"]').type(testPrompt);
    cy.get('[data-testid="text-character-count"]').should('contain', `${testPrompt.length}/500`);
  });

  it('should have style selection dropdown', () => {
    cy.get('[data-testid="select-style"]').should('be.visible');
    cy.get('[data-testid="select-style"]').click();
    
    // Check for style options
    cy.contains('Editorial').should('be.visible');
    cy.contains('Streetwear').should('be.visible');
    cy.contains('Vintage').should('be.visible');
    cy.contains('Minimalist').should('be.visible');
    cy.contains('Cyberpunk').should('be.visible');
    cy.contains('Watercolor').should('be.visible');
  });

  it('should allow selecting a style', () => {
    cy.get('[data-testid="select-style"]').click();
    cy.contains('Editorial').click();
    cy.get('[data-testid="select-style"]').should('contain', 'Editorial');
  });

  it('should show advanced options when toggled', () => {
    cy.get('[data-testid="button-advanced-options"]').should('be.visible');
    cy.get('[data-testid="button-advanced-options"]').click();
    
    cy.get('[data-testid="slider-creativity"]').should('be.visible');
    cy.get('[data-testid="slider-strength"]').should('be.visible');
  });

  it('should allow adjusting creativity and strength sliders', () => {
    cy.get('[data-testid="button-advanced-options"]').click();
    
    // Test creativity slider
    cy.get('[data-testid="slider-creativity"]').should('be.visible');
    
    // Test strength slider
    cy.get('[data-testid="slider-strength"]').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('[data-testid="textarea-prompt"]').should('have.attr', 'required', 'required');
  });
});