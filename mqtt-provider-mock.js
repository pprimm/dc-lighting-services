const mqtt = require('mqtt')
const hue = require('node-hue-api')

const hueIp = '10.10.101.18'
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
  console.log(`setting light to ${JSON.stringify(lightState.hueState)}`)
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

/** localhost EMQ connection 
const mqttUrl = 'mqtt://localhost'
const mqttOptions = {
  username: 'webClient',
  password: 'public',
  keepAlive: 10,
  queueQoSZero: false,
}*/

/** CloudMQTT connection */
const mqttUrl = 'wss://m11.cloudmqtt.com:30876'
const mqttOptions = {
  username: 'TestUser',
  password: 'hn_nIjPg3ffQ',
  keepAlive: 10,
  queueQoSZero: false,
}

// connect to MQTT broker
const client  = mqtt.connect(mqttUrl,mqttOptions)

const buildGetTopicPath = pathArray => `get/${pathArray.join('/')}`

const GET_MQTT_OPTIONS = {
  retain: true
}

const LIGHT_VIEW_DEF = {
  scenes: [
    { name: "Good Night", devID: "dev01" },
    { name: "Good Morning", devID: "dev01" },
    { name: "Day", devID: "dev01" },
    { name: "Evening", devID: "dev01" },
    { name: "Early Morning", devID: "dev01" },
    { name: "Off", devID: "dev01" },
  ],
  devices: [
    {
      name: "Ceiling Light",
      devID: "dev02",
      compType: "LightDimItem"
    },
    {
      name: "Chandelier",
      devID: "dev03",
      compType: "LightDimItem"
    },
    {
      name: "Floor Lamp",
      devID: "dev04",
      compType: "LightSwitchItem"
    },
    {
      name: "Fireplace",
      devID: "dev05",
      compType: "LightSwitchItem"
    },
  ],
}

client.on('connect', function () {
  console.log(`connected to ${mqttUrl}`)
  client.subscribe('set/#')
  client.publish('get/view/lights',JSON.stringify(LIGHT_VIEW_DEF),GET_MQTT_OPTIONS)
})

client.on('error', function (error) {
  console.log(`Error connecting: ${error}`)
})

// topicItems is an array that starts with the root service identifier (without get/ or set/)
// message is a string
const handleDev = (topicItems, message) => {
  const topic = buildGetTopicPath(topicItems)
  if (topicItems[2] === "level") {
    setHueLevel(message)
  }
  client.publish(topic,message,GET_MQTT_OPTIONS)
}

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(`${topic} ${message}`)
  const topicItems = topic.split('/')
  switch (topicItems[1]) {
    case "dev":
      handleDev(topicItems.slice(1),message.toString())
      break;
    case "view":
      break;
    default:
      break;
  }  
})