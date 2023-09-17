console.log('Extension loaded')

const generateImage = async () => {
  const pElements = document.querySelectorAll('p')

  for (const [index, p] of pElements.entries()) {

    if (index / 3 === 1) {
      await fetch(`http://localhost:3000/api/imagen?text=${p.textContent}`).then(res => res.json())
        .then(data => {
          // Create an image element
          const imgElement = document.createElement('img')
          imgElement.src = data.url

          p!.parentNode!.insertBefore(imgElement, p!.nextSibling)
        })

    }
  }

}

generateImage()
