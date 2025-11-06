// import the functions you want to test
import { parseStudentNames, clearRoster } from '../js/utils.js';

// start test suite to group related tests
describe('parseStudentNames', () => {

  test('should parse messy "duplicate line" paste correctly', () => {
    const input = `
      Penelope Chung
      Penelope Chungpenchun23987CS350
      Ryan Albright
      Ryan AlbrightCS350 - Software Engineering
      Nov 3 at 2:24pm
    `;
    const expected = ['Penelope Chung', 'Ryan Albright'];
    expect(parseStudentNames(input)).toEqual(expected);
  });
  
  test('should parse a simple, clean list', () => {
    const input = `
      Alice Smith
      Bob Johnson
    `;
    const expected = ['Alice Smith', 'Bob Johnson'];
    expect(parseStudentNames(input)).toEqual(expected);
  });
  
  test('should reject junk and numbers', () => {
    const input = `
      Nov 3 at 2:24pm
      CS350 - Software
      12345
    `;
    expect(parseStudentNames(input)).toEqual([]);
  });

});

describe('clearRoster', () => {
  
  test('should empty the roster array of a class object', () => {
    const mockClass = { 
      id: 'c1', 
      name: 'Test Class', 
      roster: ['Student A', 'Student B', 'Student C'] 
    };

    clearRoster(mockClass);


    expect(mockClass.roster).toEqual([]);
  });

});
