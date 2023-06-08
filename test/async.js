const async = require('async')
const path = require('path')
const fs = require('fs')
const LoremIpsum = require('lorem-ipsum').LoremIpsum

require('dotenv').config({ path: './.env' })
require('../app')

const generate = require('../methods/generate')

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 4,
    min: 1
  },
  wordsPerSentence: {
    max: 16,
    min: 2
  }
})

const nQuotes = parseInt(process.argv[2])
const nCallsLimit = parseInt(process.argv[3])

const queue = async.queue(
  (json, cb) => generate(json)
    .then(cb)
    .catch(console.error),
  nCallsLimit
)

for (let i = 0; i < nQuotes; i++) {
  const json = {
    botToken: process.env.BOT_TOKEN,
    backgroundColor: '',
    width: 512,
    height: 768,
    scale: 2,
    messages: Array.from({ length: i % 5 + 1 }, () => ({
      entities: [],
      avatar: true,
      from: {
        id: Math.floor(Math.random() * 100),
        name: lorem.generateWords(2),
        photo: {
          url: 'https://telegra.ph/file/59952c903fdfb10b752b3.jpg'
        }
      },
      text: lorem.generateParagraphs(1),
      replyMessage: {}
    }))
  }

  console.time(i)

  queue.push({
    ...json,
    type: 'quote',
    format: 'webp'
  }, res => {
    const buffer = Buffer.from(res.image, 'base64')
    fs.writeFile(
      path.resolve(`./test/${i}.webp`), buffer,
      err => err && console.error(err)
    )
  })

  queue.push({
    ...json,
    type: 'image',
    format: 'png'
  }, res => {
    const buffer = Buffer.from(res.image, 'base64')
    fs.writeFile(
      path.resolve(`./test/${i}.png`), buffer,
      err => err && console.error(err)
    )
    console.timeEnd(i)
  })
}