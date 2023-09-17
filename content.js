console.log("Extension loaded");
// Find all the <p> elements on the page
const pElements = document.querySelectorAll("p");

// Loop through the <p> elements and insert image after every 4th one
pElements.forEach((element, index) => {
  if ((index + 1) % 4 === 0) {
    // Create an image element
    const imgElement = document.createElement("img");
    imgElement.src = "https://i.imgur.com/DuU4ODQ.png";

    // Insert the image after the 4th <p> element
    element.parentNode.insertBefore(imgElement, element.nextSibling);
  }
});
