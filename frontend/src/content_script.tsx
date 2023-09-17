console.log('Extension loaded')

const generateImage = async () => {
  const pElements = document.querySelectorAll('p')

  console.log('Fetching images in parallel')
  await Promise.all(
    Array.from(pElements).map(async (p, index) => {
      console.log(index, p.textContent)
      if (((index + 1) % 3) === 0) {
        console.log(`Fetching image for ${index} + 1th element`)

        await fetch(`http://localhost:3000/api/imagen?text=${p.textContent}`)
          .then(res => res.json())
          .then(data => {
            // Create an image element
            const imgElement = document.createElement('img')
            imgElement.src = data.url
            imgElement.alt = 'Loading image...'

            p!.parentNode!.insertBefore(imgElement, p!.nextSibling)
          })
      }
    }))
}

generateImage().catch(e => console.error('Error from content script'))
