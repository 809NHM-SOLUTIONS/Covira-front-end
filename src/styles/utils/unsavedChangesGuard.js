
let hasUnsavedChanges = false;

export function setUnsavedChanges(value) {
  hasUnsavedChanges = value;
}

export function getUnsavedChanges() {
  return hasUnsavedChanges;
}