const mqtt = require('mqtt')
const hue = require('node-hue-api')

const hueIp = '10.10.101.12'
const userName = '-8NkSGoGqAvEgeLnc0SsNR90pgPBzTeVneitKQGn'

const hueApi = hue.HueApi(hueIp,userName)

// connect to MQTT broker
const client  = mqtt.connect('mqtt://localhost')

const buildGetTopicPath = pathArray => `get/${pathArray.join('/')}`

const scaleHueBrightness = percent => parseInt(((percent / 100) * 254).toString(),10)
client.on('connect', function () {
  client.subscribe('set/#')
  client.publish('presence', 'lighting provider here')
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  //console.log(`${topic} ${message}`)
  const topicItems = topic.split('/')
  switch (topicItems[1]) {
    case "dev":
      //console.log(`${buildGetTopicPath(topicItems.slice(1))} ${message}`)
      const devID = topicItems.slice(1)
      const level = message.toString() // message is a Buffer
      client.publish(buildGetTopicPath(devID),level)
      const bri = scaleHueBrightness(parseInt(level,10))
      let lightState = hue.lightState.create()
      lightState = bri === 0 ? lightState.off().bri(0) : lightState.on().bri(bri)
      hueApi.setLightState(1,lightState).then(()=>{}).done()
      break;
    case "view":
      break;
    default:
      break;
  }  
})