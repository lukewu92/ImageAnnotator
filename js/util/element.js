// Safer way to delete all child elements together with their attached event listeners
export function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    if (parent.firstChild) {
      try {
        parent.removeChild(parent.firstChild);
      } catch (e) {
        // Ignore and catch scenario where child has already been removed
      }
    }
  }
}

export function setAttributesToElement(element, attributes) {
  Object.keys(attributes).forEach((attr) => {
    element.setAttribute(attr, attributes[attr]);
  });
}
