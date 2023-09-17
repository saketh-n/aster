console.log('Extension loaded')

const h1 = document.getElementsByTagName('h1')[0]

fetch(`http://localhost:3000/api/images2?text=${h1?.textContent}`).then(res => res.json()).then(async headerData => {
    console.log('Header data from server', headerData)

    const headerImage = document.createElement('img')
    headerImage.src = headerData.url
    h1!.parentNode!.insertBefore(headerImage, h1.nextSibling)

    const pElements = document.querySelectorAll('p')

    for (const [index, p] of pElements.entries()) {
      if ((index + 1) % 4 === 0) {
        await fetch(`http://localhost:3000/api/images2?text=${p.textContent}`).then(res => res.json())
          .then(data => {
            // Create an image element
            const imgElement = document.createElement('img')
            imgElement.src = data.url

            p!.parentNode!.insertBefore(imgElement, p.nextSibling)
          })

      }
    }
  }
)
