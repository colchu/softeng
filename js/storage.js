export const STORE_KEY = 'quickAddStore.v1';

export const defaultData = {
  userName: 'Teacher',
  classes: [],
  students: [],
  quickAdds: []
};

export function loadState() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}

export function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}
