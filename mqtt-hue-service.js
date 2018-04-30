const mqtt = require('mqtt')
const hue = require('node-hue-api')

const hueIp = '192.168.70.174'
const userName = '-8NkSGoGqAvEgeLnc0SsNR90pgPBzTeVneitKQGn'

const hueApi = hue.HueApi(hueIp,userName)

const scaleHueBrightness = percent => parseInt(((percent / 100) * 254).toString(),10)

//const wait = ms => new Promise((r, j)=>setTimeout(r, ms))

let lightState = {
  needsUpdate: false,
  ready: true,
  hueState: hue.lightState.create(),
}

const hueInterval = setInterval(() => {
  if (!lightState.needsUpdate || !lightState.ready) {
    return
  }

  lightState.needsUpdate = false
  lightState.ready = false
  //console.log(`setting light to ${JSON.stringify(lightState.hueState)}`)
  hueApi.setLightState(1,lightState.hueState, (err,lights) => {
    lightState.ready = true
  })
},1)

const setHueLevel = level => {
  const bri = scaleHueBrightness(parseInt(level,10))
  lightState.hueState = bri === 0 ? lightState.hueState.off() : lightState.hueState.on()
  lightState.hueState.bri(bri)
  lightState.needsUpdate = true
  //lightState = bri === 0 ? lightState.off().bri(0) : lightState.on().bri(bri)
  //hueApi.setLightState(1,lightState.hueState).then(()=>{}).done()
}

/* localhost EMQ connection 
const mqttUrl = 'mqtt://localhost'
const mqttOptions = {
  username: 'webClient',
  password: 'public',
  keepAlive: 10,
  queueQoSZero: false,
}/* */


/* localhost EMQ connection through ngrok local tunnel
const mqttUrl = 'wss://1f46feef.ngrok.io:443/mqtt'
const mqttOptions = {
  username: 'webClient',
  password: 'public',
  keepAlive: 10,
  queueQoSZero: false,
}/* */


/* CloudMQTT wss connection 
const mqttUrl = 'wss://m11.cloudmqtt.com:30876'
const mqttOptions = {
  username: 'TestUser',
  password: 'hn_nIjPg3ffQ',
  keepAlive: 10,
  queueQoSZero: false,
}/* */


//* CloudMQTT mqtts connection
const mqttUrl = 'mqtts://m11.cloudmqtt.com:20876'
const mqttOptions = {
  username: 'DemoUser',
  password: 'hn_nIjPg3ffQ',
  keepAlive: 10,
  queueQoSZero: false,
}/* */


// connect to MQTT broker
const client  = mqtt.connect(mqttUrl,mqttOptions)

const buildGetTopicPath = pathArray => `get/dev/${pathArray.join('/')}`

const GET_MQTT_OPTIONS = {
  retain: true
}

client.on('connect', function () {
  console.log(`connected to ${mqttUrl}`)
  client.subscribe('set/dev/dev02/#')
})

client.on('error', function (error) {
  console.log(`Error connecting: ${error}`)
})

// topicItems is an array that starts with the root service identifier (without get/ or set/)
// message is a string
const handleDev = (topicItems, message) => {
  const [device, valueName] = topicItems
  if (device === "dev02" && valueName === "level") {
    setHueLevel(message)
  }
  client.publish(buildGetTopicPath(topicItems),message,GET_MQTT_OPTIONS)
}

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(`${topic} ${message}`)
  const topicItems = topic.split('/')
  switch (topicItems[1]) {
    case "dev":
      handleDev(topicItems.slice(2),message.toString())
      break;
    case "view":
      break;
    default:
      break;
  }  
})