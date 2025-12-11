# Colin's README
User
Nick, a physics teacher, joined the Nueva community recently. He is adjusting to writing personal narratives for each of his students at the end of each semester. He appreciates working on his communication skills and enjoys the process of writing evaluations as a way of supporting his students.

Problem Context
Nick can find it difficult to say something unique about each student. He aims to be specific in his evaluations and wants to mention particular moments during the semester that stood out to him about the student. Without a way to keep track of the smaller things that students do, he is likely to forget when it comes time to write narratives.

Solution
The NarrativeNook app will help Nick easily track moments in his classes that were illuminating, meaningful, or noteworthy. He will be able to enter short notes about specific students each day, and, at the end of the semester, he will be able to export the cumulative notes for each student. This would be different than if a teacher just had a document or spreadsheet for student note-taking, as the app would allow Nick to easily select which unit, project, or MA he is referring to while taking the notes; in addition, the export feature will create an easy transition from note-taking to narrative-writing as opposed to a manual copy-and-paste for each student.

Outcome
The NarrativeNook will allow Nick to have a much more efficient narrative-writing process. In class, he won’t have to spend much time organizing or keeping track of his notes, and by the end of the semester, he will already have a head start on writing the evaluations.

Need Statement
Nick, a teacher at Nueva who enjoys writing narratives but often finds it difficult to remember specific moments from classes, needs a solution that allows him to efficiently write down notes throughout the semester on each student and use them easily and effectively while writing narratives. NarrativeNook would allow for Nick to jot down specific insights from students in class and export those notes for each student—across various parts of the semester—for narrative writing.

Documentation
- There are three modules: 
        utils.js: IDs, formatting, parsing, roster clearing / just the smaller things
        storage.js: reading/writing app state from localStorage
        app.js: main UI controller
- We have an object, state:
        classes have an ID, name, block, color, and roster
        quick adding a note is done with ID, timestamp, classID, students, note
- Utility functions are:
        cid(): short random string ID for classes and notes.
        fmtDate(ts): formats a timestamp into a human-readable date
        escapeHtml(s): escapes the & < > " ' so that basically the notes and names become html
	    csvEscape(v): escapes values for CSV
        parseStudentNames(rawText): splits and also cleans lines
        clearRoster(classObject): the clear roster button

**Future features**
P1
1. Enhanced user interface with password and profile feature
2. The user can edit current notes

P2
1. The user can change the timestamp of notes if they are writing a class that happened earlier in the day or week
2. An AI synthesizer that simplifies and summarizes notes that are written by the user

**Bugs**
P1
1. The storage for the loadState() for saved data is sometimes not apparent when the site is re-opened
2. state.students is updated when adding students but usually it is not cleaned when the class is deleted
3. clearRoster currently only empties classObject.roster --> tho it leaves state.students untouched

Penelope's README

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


