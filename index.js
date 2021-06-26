const TelegramBot = require('node-telegram-bot-api')
const fetch = require('node-fetch')

const token = 'telegramtoken'
const chatId = '-1001456597778'
  const cowinApi = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=457001&date='

const bot = new TelegramBot(token, { polling: true })


sendMessage = ( message ) => {
  let count = 1
  while( message.length > 0) {
    let text = ''
    const paginatedMessages = message.splice(0, 5)
    for (let {name, address, sessions} of paginatedMessages) {
      text = text + `<b>|| </b> <b>${name}</b> \n <b> Vaccine: ${sessions[0].vaccine} </b> \n Slots Available: \n  Dose 1 : <b>${sessions[0].available_capacity_dose1}</b> Dose 2 : <b>${sessions[0].available_capacity_dose2}</b> \n \n`
      count++
      bot.sendMessage(chatId,  text,  { parse_mode: 'HTML'})
    }   
  }
}

setInterval(() => {
  const today = new Date()
  const dd = parseInt(String(today.getDate()).padStart(2, '0'))
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  const date = dd + '-' + mm + '-' + yyyy
  fetch(`${cowinApi}${date}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json', 
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    },
  })
  .then(res => res.json())
  .then(( { centers }) => {
      console.log('centerr', centers)
      const availableCenters = centers.filter( ({sessions}) => {
        const requiredSession = sessions.filter(({min_age_limit, vaccine, available_capacity_dose1}) => 
          min_age_limit >= 18 &&  min_age_limit < 45 && vaccine === 'COVAXIN' && available_capacity_dose1 === 0
      )
      return requiredSession.length > 0
      } )
  if (availableCenters.length > 0) sendMessage(availableCenters)
})
.catch(err => {
  console.log("Error", err)
  bot.sendMessage(chatId, err)
})
}, 10000)
