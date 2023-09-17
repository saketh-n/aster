console.log('Extension loaded')

const generateImage = async () => {
  const pElements = document.querySelectorAll('p')
  let charCount = 0

  console.log('Fetching images in parallel')

  await Promise.all(
    Array.from(pElements).map(async (p, index) => {
      console.log(index, p.textContent)
      charCount += p.textContent?.length ?? 0

      if (charCount >= 2500) {
        // Reset character count
        charCount = 0
        console.log(`Fetching image for chunk ending at ${index + 1}th element`)

        await fetch(`http://localhost:3000/api/imagen?text=${p.textContent}`)
          .then(res => res.json())
          .then(data => {
            // Create an image element
            const imgElement = document.createElement('img')
            imgElement.src = data.url

            // Insert the image after the current <p> element
            p.parentNode?.insertBefore(imgElement, p.nextSibling)
          })
      }
    })
  )
}

generateImage().catch(e => console.error('Error from content script'))
