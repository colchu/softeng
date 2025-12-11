// import the functions to test
import { loadState, defaultData } from '../js/storage.js';
const localStorageMock = (function() {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});


// start the test suite
describe('storage functions', () => {

  //  simple test
  test('loadState should return default data if localStorage is empty', () => {
    localStorage.clear(); // Ensure storage is empty
    expect(loadState()).toEqual(defaultData);
  });

});