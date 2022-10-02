// Safer way to delete all child elements together with their attached event listeners
export function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
