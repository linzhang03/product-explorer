describe('Product Explorer — search & filter', () => {
	beforeEach(() => {
		// Persist admin auth before app loads, so guards pass on first navigation
		cy.window({ log: false }).then((w) => w.localStorage.setItem('auth.admin', '1'));
	});

	it('filters by text and category', () => {
		// Intercept products API
		cy.intercept('GET', '**/products*').as('getProducts');

		cy.visit('/products');
		cy.wait('@getProducts'); // initial load

		// type into search and wait for API
		cy.get('input[placeholder="Search name/category"]').type('Lamp');
		cy.wait('@getProducts');

		// category multi-select: select Lighting and wait for API
		cy.get('select[multiple]').select('Lighting');
		cy.wait('@getProducts');

		// URL reflects filters
		cy.url().should('include', 'q=Lamp').and('include', 'category=Lighting');

		// Expect only cards with category badge 'Lighting'
		cy.get('a.card > .row:first-child .badge').should('have.length.greaterThan', 0)
			.each($b => expect($b.text().trim()).to.match(/Lighting/i));

		// Optionally also assert names include Lamp
		cy.get('a.card h3').each($h => expect($h.text()).to.match(/lamp/i));
	});
});