// ===== STORAGE CONSTANTS =====
// Key used to store/retrieve the app's state in localStorage.
export const STORE_KEY = 'quickAddStore.v1';

// ===== DEFAULT STATE SHAPE =====
// This is the "empty" app state used on first load or when localStorage doesn't contain valid data.
export const defaultData = {
  userName: 'Teacher', // default display name for the teacher
  classes: [],         // list of class objects { id, name, block, color, roster: [] }
  students: [],        // global list of all student names ever seen
  quickAdds: []        // list of note entries { id, ts, classId, students: [], note }
};

// ===== LOAD STATE =====
// Safely load state from localStorage.
// - If there is saved data under STORE_KEY, parse and return it
export function loadState() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    // Use structuredClone so each call gets its own copy
    // and cannot accidentally mutate the shared defaultData object.
    return saved ? JSON.parse(saved) : structuredClone(defaultData);
  } catch {
    // On any error (corrupt JSON, access error, etc.),
    // just reset to a clean default state.
    return structuredClone(defaultData);
  }
}

// ===== SAVE STATE =====
// Persist the entire app state to localStorage as a JSON string
export function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}