export function cid() {
  return Math.random().toString(36).slice(2, 10);
}

export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {year:'numeric',month:'long',day:'numeric'});
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;"
  })[m]);
}

export function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function parseStudentNames(rawText) {
  const names = new Set();
  const lines = rawText.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    return [];
  }

  // Helper function to check if a line is a plausible name
  const isPlausibleName = (line) => {
    if (!line) return false;
    
    const trimmedLine = line.trim();
    const wordCount = trimmedLine.split(' ').length;

    // 1. Basic format check (2-4 words, starts with capital)
    if (
      wordCount < 2 ||
      wordCount > 4 ||
      !/^[A-Z]/.test(trimmedLine) ||
      trimmedLine.startsWith('Student') ||
      trimmedLine.startsWith('Teacher')
    ) {
      return false;
    }
    
    // 2. Stricter character check
    if (/\d/.test(trimmedLine)) return false; // No numbers
    if (/[@:/]/.test(trimmedLine)) return false; // No forbidden chars
    if (!/^[A-Za-z' -]+$/.test(trimmedLine)) return false; // Must be letters, spaces, ', -

    return true;
  };

  // Iterate with a standard for-loop to allow "look-ahead"
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];

    // HEURISTIC 1: The "Name" + "NameJunk" Pattern
    if (nextLine && nextLine.startsWith(currentLine) && nextLine !== currentLine) {
      if (isPlausibleName(currentLine)) {
        names.add(currentLine);
      }
      i++; 
      continue;
    }

    // HEURISTIC 2: The "StudentGrace Bishara" Pattern
    const roleRegex = /^(Student|Teacher)([A-Z][A-Za-z-' ]+)/;
    const roleMatch = currentLine.match(roleRegex);
    if (roleMatch && roleMatch[2]) {
      const extractedName = roleMatch[2].trim();
      if (isPlausibleName(extractedName)) {
          names.add(extractedName);
      }
      continue;
    }
    
    // HEURISTIC 3 (FALLBACK): A simple, clean name on its own
    if (isPlausibleName(currentLine)) {
      names.add(currentLine);
    }
  }

  return Array.from(names);
}

// added to do a unit test on the clear roster function
export function clearRoster(classObject) {
  classObject.roster = [];
  return classObject;
}