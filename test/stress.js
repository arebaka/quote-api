const axios = require('axios')
const path = require('path')
const fs = require('fs')
const LoremIpsum = require('lorem-ipsum').LoremIpsum

require('dotenv').config({ path: './.env' })
require('../app')

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 4,
    min: 1
  },
  wordsPerSentence: {
    max: 8,
    min: 2
  }
})

const testTemplates = [
  {
    method: 'generate',
    params: {
      type: 'quote',
      format: 'webp'
    },
    filename: (index) => `./test/quote/${index}.webp`
  }, {
    method: 'generate',
    params: {
      type: 'image',
      format: 'png'
    },
    filename: (index) => `./test/image/${index}.png`
  }, {
    method: 'generate',
    params: {
      type: 'html',
      format: 'html'
    },
    filename: (index) => `./test/html/${index}.html`
  }
]

const nQuotes = parseInt(process.argv[2])

const buildMessage = (index) => {
  const showAvatar = index === 0 || Math.random() < 0.3
  const fromId = Math.floor(Math.random() * 100)
  const fromName = lorem.generateWords(Math.floor(Math.random() * 2))
  const photo = { url: 'https://telegra.ph/file/59952c903fdfb10b752b3.jpg' }
  const text = lorem.generateParagraphs(1)

  const media = {
    url: `https://via.placeholder.com/${Math.floor(Math.random() * 1900) + 100}x${Math.floor(Math.random() * 1900) + 100}`
  }

  const replyMessage = {
    from: {
      id: Math.floor(Math.random() * 100),
      name: lorem.generateWords(Math.floor(Math.random() * 2))
    },
    text: lorem.generateParagraphs(1)
  }

  return {
    entities: [],
    avatar: showAvatar,
    from: {
      id: fromId,
      name: fromName,
      photo: Math.random() < 0.5 ? photo : null
    },
    text,
    media: Math.random() < 0.3 ? media : null,
    replyMessage: Math.random() < 0.3 ? replyMessage : {}
  }
}

;(async () => {
  for (let i = 0; i < nQuotes; i++) {
    const backgroundColor = Math.random() < 0.3 ? '#FFFFFF' : ''
    const messages = Array.from({ length: i % 5 + 1 }, (_, k) => buildMessage(k))

    const json = {
      botToken: process.env.BOT_TOKEN,
      backgroundColor,
      width: 512,
      height: 768,
      scale: 2,
      messages
    }

    for (let template of testTemplates) {
      console.time(`${i}-${template.params.type}`)
      await axios.post(
        `http://localhost:${process.env.PORT}/${template.method}`,
        { ...json, ...template.params },
        { headers: { 'Content-Type': 'application/json' } }
      ).then(res => {
        console.timeEnd(`${i}-${template.params.type}`)
        fs.writeFile(
          path.resolve(template.filename(i)),
          Buffer.from(res.data.result.image, 'base64'),
          err => err && console.error(err)
        )
      }).catch(console.error)
    }
  }
})()