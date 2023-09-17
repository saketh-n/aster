console.log('Extension loaded')

const generateImages = async (theme: string) => {
  const pElements = document.querySelectorAll('p')
  let charCount = 0

  console.log('Fetching images in parallel')

  await Promise.all(
    Array.from(pElements).map(async (p, index) => {
      charCount += p.textContent?.length ?? 0

      if (charCount >= 2500) {
        // Reset character count
        charCount = 0
        console.log(`Fetching image for chunk ending at ${index + 1}th element`)

        const imgElement = document.createElement('img')
        imgElement.src = 'https://i.imgur.com/D6HmCoT.png'
        p.parentNode?.insertBefore(imgElement, p.nextSibling)

        await fetch(`http://localhost:3000/api/imagen?text=${p.textContent}&theme=${theme}`)
          .then(res => res.json())
          .then(data => {
            imgElement.src = data.url
          })
      }
    })
  )
}

const classifyStory = () => {
  const text = Array.from(document.querySelectorAll('p')).slice(0, 5).map(_ => _.textContent?.trim()!).filter(Boolean).join('\n')

  return fetch(`http://localhost:3000/api/classify?text=${text}`)
    .then(res => res.json())
    .then(data => {
      console.log(`Classified story as ${data.theme}`)
      return data.theme as string
    }).catch(e => {
      console.error('Error classifying text', e)
      return 'drama'
    })
}

classifyStory().then(theme => generateImages(theme).catch(e => console.error('Error from content script', e)))
