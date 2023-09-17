console.log('Extension loaded')

fetch('http://localhost:3000/api/images').then(res => res.json()).then(data => {
  console.log('Data from server', data)

  const pElements = document.querySelectorAll('p')

// Loop through the <p> elements and insert image after every 4th one
  pElements.forEach((element, index) => {
    if ((index + 1) % 4 === 0) {
      // Create an image element
      const imgElement = document.createElement('img')
      imgElement.src = data.url

      // Insert the image after the 4th <p> element
      element!.parentNode!.insertBefore(imgElement, element.nextSibling)
    }
  })

})
