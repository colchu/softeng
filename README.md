# softeng
A website that allows teachers to record notes on classes and students for a simplified and efficient narrative-writing process.
Penelope's branch of Colin's code

Notes/future projects:
- Would probably be better if there was a way to integrate Nick's canvas API so that he can pull the list of students directly from Canvas rather than having to copy paste the students in. 
- Maybe you could incorporate the grading system too? Or updates on missing assignments from canvas.

What I added:
- I added a clear all button so that if Nick accidentally adds the wrong students, or if he just wants to reset a class, he can do so all at once rather than having to go one by one. The clear all button will also ask the user if they're sure before actually deleting all the students in case it's a misclick.
- I also added a text area where Nick can add a list of student, so that he doesn't have to add then one by one. He can either just enter a list of names with every name on a different line, or he can copy and paste directly from the canvas student roster. The text field should filter out the random parts of the roster like date or id or class and should just add the name. Something to note is that names must be entered as both first and last name since that's how it's formatted in canvas.

The way in which Nick can input lists of students is either name by name:
Person 1
Person 2
Person 3

Or, he can copy paste the canvas roster like this, and the text area should be able to parse the copy paste jumble to just extract the names:
Ryan Albright
Ryan Albright	
CS350 - Software Engineering - 1 - Block 4
Student
Grace Bishara
Grace Bishara	
CS350 - Software Engineering - 1 - Block 4
Teacher
Colin Chu
Colin Chu	
CS350 - Software Engineering - 1 - Block 4
Student
Penelope Chung
Penelope Chung	


Tests:
For the test suite for unit tests, I used jest. I only tested the new functions that I added: parse student names and clear all. I added these tests within the storage.test.js and utils.test.js files. 
Then, I used cypress to do an end to end test simulating a user pasting in a roster from canvas and then clearing it. I added a cypress folder and the e2e test that I ran is under the roster-workflow.cy.js file.


