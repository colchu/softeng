describe('Full Roster Workflow', () => {

  // messy text
  const messyPasteData = `
    Ryan Albright
Ryan Albright	
CS350 - Software Engineering - 1 - Block 4
Student
Grace Bishara
Grace Bishara	
CS350 - Software Engineering - 1 - Block 4
Student
Wesley Chao
Wesley Chao	
CS350 - Software Engineering - 1 - Block 4
Teacher
Colin Chu
Colin Chu	
CS350 - Software Engineering - 1 - Block 4
Student
Penelope Chung
Penelope Chung	
CS350 - Software Engineering - 1 - Block 4
Student
Aurelia Freifeld
Aurelia Freifeld	
CS350 - Software Engineering - 1 - Block 4
Student
Joshua Gould
Joshua Gould	
CS350 - Software Engineering - 1 - Block 4
Student
Ravi Kumar
Ravi Kumar	
CS350 - Software Engineering - 1 - Block 4
Student
Meera Nanjapa
Meera Nanjapa	
CS350 - Software Engineering - 1 - Block 4
Student
Kota Newman
Kota Newman	
CS350 - Software Engineering - 1 - Block 4
Student
Liam Percer
Liam Percer	
CS350 - Software Engineering - 1 - Block 4
Student
Tate Rosenberger
Tate Rosenberger	
CS350 - Software Engineering - 1 - Block 4
Student
Deniz Soral
Deniz Soral	
CS350 - Software Engineering - 1 - Block 4
Student
Andromeda Wen
Andromeda Wen	
CS350 - Software Engineering - 1 - Block 4
Student
  `;

  it('should create a class, parse students, add them, and then clear the roster', () => {

    // clearing storage of preexisting classes
    cy.clearLocalStorage();
    cy.visit('index.html'); //go to website


    cy.window().then((win) => {
      cy.stub(win, 'prompt').onFirstCall().returns('Modern Physics');
      win.prompt.onSecondCall().returns('Block 5');
    });

    // clock add class button
    cy.get('#addClassBtn').click();

    // find class title we just created
    cy.contains('.tile', 'Modern Physics').click();

// wait for website to render
    cy.url().should('include', '#/class'); 

    cy.get('#classTitle').should('contain', 'Modern Physics (Block 5)');
    cy.get('#rosterCount').should('contain', '0 students'); // Should be empty


    // paste messy data
    cy.get('#newStudents')
      // .should('be.visible')
      .type(messyPasteData);

    cy.get('#addStudentsBtn').click();



    // check that the roster count is correct
    cy.get('#rosterCount').should('contain', '3 students');

    // check that the correct names appear as chips
    cy.get('.chip').should('have.length', 3);
    cy.get('.chip').should('contain', 'Ryan Albright');
    cy.get('.chip').should('contain', 'Grace Bishara');
    cy.get('.chip').should('contain', 'Colin Chu');
    cy.get('.chip').should('contain', 'Penelope Chung');
    cy.get('.chip').should('contain', 'Aurelia Freifeld');
    cy.get('.chip').should('contain', 'Joshua Gould');
    cy.get('.chip').should('contain', 'Ravi Kumar');
    cy.get('.chip').should('contain', 'Meera Nanjapa');
    cy.get('.chip').should('contain', 'Kota Newman');
    cy.get('.chip').should('contain', 'Liam Percer');
    cy.get('.chip').should('contain', 'Tate Rosenberger');
    cy.get('.chip').should('contain', 'Deniz Soral');
    cy.get('.chip').should('contain', 'Andromeda Wen');



    // check that junk data was *not* added
    cy.get('.chip').should('not.contain', 'Nov 3');
    cy.get('.chip').should('not.contain', 'CS350');

    //  check that the textarea is now empty
    cy.get('#newStudents').should('have.value', '');


    // clear roster
    cy.on('window:confirm', () => true);

    // click clear all button
    cy.get('#clearRosterBtn').click();



    // roster should be empty
    cy.get('.chip').should('not.exist');

    //  count should be back to 0
    cy.get('#rosterCount').should('contain', '0 students');
  });
});