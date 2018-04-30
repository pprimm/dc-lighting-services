const mqtt = require('mqtt')
const LifxClient = require('node-lifx').Client
const lifxClient = new LifxClient()
let lifxLight = null

//* CloudMQTT mqtts connection
const mqttUrl = 'mqtts://m11.cloudmqtt.com:20876'
const mqttOptions = {
  username: 'DemoUser',
  password: 'hn_nIjPg3ffQ',
  keepAlive: 10,
  queueQoSZero: false,
}/**/


// connect to MQTT broker
const client  = mqtt.connect(mqttUrl,mqttOptions)

const buildGetTopicPath = pathArray => `get/dev/${pathArray.join('/')}`

const GET_MQTT_OPTIONS = {
  retain: true
}

client.on('connect', function () {
  console.log(`connected to ${mqttUrl}`)
  client.subscribe('set/dev/dev03/#')
})

client.on('error', function (error) {
  console.log(`Error connecting: ${error}`)
})



const setLifxLevel = level => {
  if (lifxLight !== null) {
    lifxLight.color(43,5,level,2700,1000)
  }
}

// topicItems is an array that starts with the device ID
// message is a string
const handleDev = (topicItems, message) => {
  const [device, valueName] = topicItems
  if (device === "dev03" && valueName === "level") {
    const rawLevel = parseInt(message,10)
    const level = rawLevel < 0 ? 0 : (rawLevel > 100 ? 100 : rawLevel)
    setLifxLevel(level)
    client.publish(buildGetTopicPath(topicItems),level.toString(),GET_MQTT_OPTIONS)
  }
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

lifxClient.on('light-new', function(light) {
  lifxLight = light
  console.log(lifxLight)
})

lifxClient.init()