const hue = require("node-hue-api")

const userName = "-8NkSGoGqAvEgeLnc0SsNR90pgPBzTeVneitKQGn"

const displayResult = function(result) {
	console.log(JSON.stringify(result,null,2));
}

// --------------------------
// Using a callback
hue.nupnpSearch(function(err, result) {
	if (err) throw err;
  displayResult(result)
  const api = hue.HueApi(result[0].ipaddress,userName)
  //api.config().then(displayResult).done()
  //api.getFullState().then(displayResult).done()
  let lightState = hue.lightState.create().on()
  api.setLightState(1,lightState).then(displayResult).done()
});
