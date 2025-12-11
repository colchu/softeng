// cypress/e2e/full-roster-workflow.cy.js

describe('Full Roster Workflow', () => {
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

  // All students we expect after parsing (teacher filtered out)
  const expectedStudents = [
    'Ryan Albright',
    'Grace Bishara',
    'Colin Chu',
    'Penelope Chung',
    'Aurelia Freifeld',
    'Joshua Gould',
    'Ravi Kumar',
    'Meera Nanjapa',
    'Kota Newman',
    'Liam Percer',
    'Tate Rosenberger',
    'Deniz Soral',
    'Andromeda Wen',
  ];

  beforeEach(() => {
    // Start from a clean app state
    cy.clearLocalStorage();

    cy.visit('index.html', {
      onBeforeLoad(win) {
        // Stub the two prompts used when creating a class
        cy.stub(win, 'prompt')
          .onFirstCall().returns('Modern Physics')
          .onSecondCall().returns('Block 5');
      },
    });
  });

  it('creates a class, parses students from messy paste, and clears the roster', () => {
    // Create the class via Add Class button
    cy.get('#addClassBtn').click();

    // Open the class tile we just created
    cy.contains('.tile', 'Modern Physics').click();

    // We should now be on the class route with correct title and empty roster
    cy.url().should('include', '#/class');
    cy.get('#classTitle').should('contain', 'Modern Physics (Block 5)');
    cy.get('#rosterCount').should('contain', '0 students');
    cy.get('.chip').should('not.exist');

    // Paste messy data into the textarea and add students
    cy.get('#newStudents').type(messyPasteData);
    cy.get('#addStudentsBtn').click();

    // Roster count should match the number of parsed students
    cy.get('#rosterCount').should(
      'contain',
      `${expectedStudents.length} students`
    );

    // All expected students should appear as chips
    cy.get('.chip')
      .should('have.length', expectedStudents.length)
      .then(chips => {
        const chipNames = [...chips].map(chip => chip.textContent.trim());
        expectedStudents.forEach(name => {
          expect(chipNames).to.include(name);
        });
      });

    // Teacher / junk rows MUST NOT be added
    cy.get('.chip').should('not.contain', 'Wesley Chao'); // teacher
    cy.get('.chip').should('not.contain', 'CS350');
    cy.get('.chip').should('not.contain', 'Student');

    // Textarea should be cleared after successful add
    cy.get('#newStudents').should('have.value', '');

    // Accept the "clear roster" confirmation dialog
    cy.on('window:confirm', () => true);

    // Clear roster
    cy.get('#clearRosterBtn').click();

    // Roster should be empty again
    cy.get('.chip').should('not.exist');
    cy.get('#rosterCount').should('contain', '0 students');
  });
});