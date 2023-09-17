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
            const div: HTMLDivElement = document.createElement('div')
            // Create an image element
            const img = document.createElement('img')
            img.src = data.url
            img.width = 400
            img.height = 400
            img.alt = 'Image for paragraph above'
            div.style.marginTop = '1rem'
            div.style.marginBottom = '1rem'
            div.style.display = 'flex'
            div.style.flexDirection = 'column'
            div.style.justifyContent = 'center'
            div.style.alignItems = 'center'

            div.appendChild(img)

            p!.parentNode!.insertBefore(div, p!.previousSibling)
          })
      }
    }))
}

generateImage().catch(e => console.error('Error from content script'))
