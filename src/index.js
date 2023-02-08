import { promises as fs } from 'fs'
import fetch from 'node-fetch'

import { PLACEHOLDERS, NUMBER_OF } from './constants.js'

const { INSTAGRAM_API_KEY } = process.env

const INSTAGRAM_USER_ID = '25025320' // ID usuario Instagram API

const getPhotosFromInstagram = async () => {
  const response = await fetch(
    `https://instagram28.p.rapidapi.com/medias?user_id=${INSTAGRAM_USER_ID}&batch_size=20`,
    {
      headers: {
        'X-RapidAPI-Host': 'instagram28.p.rapidapi.com',
        'x-rapidapi-key': INSTAGRAM_API_KEY
      }
    }
  )

  const json = await response.json()

  return json?.edges
}

const generateInstagramHTML = ({ node: { display_url: url, shortcode } }) =>
  `
<a href='https://instagram.com/p/${shortcode}' target='_blank'>
  <img width='20%' src='${url}' alt='Instagram photo' />
</a>`(async () => {
    const [template, photos] = await Promise.all([
      fs.readFile('./src/README.md.tpl', { encoding: 'utf-8' }),
      getPhotosFromInstagram()
    ])

    // create latest photos from instagram
    const latestInstagramPhotos = photos
      .slice(0, NUMBER_OF.PHOTOS)
      // eslint-disable-next-line no-unused-vars
      .map(generateInstagramHTML)
      .join('')

    // replace all placeholders with info
    const newMarkdown = template.replace(
      PLACEHOLDERS.LATEST_INSTAGRAM,
      latestInstagramPhotos
    )

    await fs.writeFile('README.md', newMarkdown)
  })()
