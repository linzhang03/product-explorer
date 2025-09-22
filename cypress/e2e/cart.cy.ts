describe('Cart — optimistic add & rollback', () => {
	const visitAuthed = () => {
		cy.intercept('GET', '**/products*').as('getProducts');
		cy.visit('/products', {
			onBeforeLoad(win) {
				win.localStorage.setItem('auth.admin', '1');
			}
		});
		cy.wait('@getProducts');
	};

	beforeEach(() => {
		// Reset backend cart and local storage to avoid cross-test bleed
		cy.request('POST', 'http://localhost:8088/cart/reset');
		cy.window({ log: false }).then(w => {
			w.localStorage.removeItem('cart.v1');
		});
	});

	it('rolls back on failure and shows toast', () => {
		// set failure rate to 1 (always fail)
		cy.request('POST', 'http://localhost:8088/cart/failure-rate', { rate: 1 });

		visitAuthed();

		cy.intercept('POST', '**/cart').as('addCart');
		cy.get('.card .btn.primary:not([disabled])').first().click();
		cy.wait('@addCart');

		// Toast appears
		cy.contains('Rolled back', { timeout: 3000 }).should('exist');
		// Count remains 0 (wait briefly for effect persistence)
		cy.get('.cart-widget .badge', { timeout: 3000 }).should('contain.text', '0 items');
	});

	it('adds successfully when server ok', () => {
		cy.request('POST', 'http://localhost:8088/cart/failure-rate', { rate: 0 });

		visitAuthed();

		cy.intercept('POST', '**/cart').as('addCart');
		cy.get('.card .btn.primary:not([disabled])').first().click();
		cy.wait('@addCart');
		cy.get('.cart-widget .badge').should('not.contain.text', '0 items');
	});
});