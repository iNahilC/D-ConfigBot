module.exports = {
  Convert: function(date) {
    let valid_keys = {
      "h": {nombre: "hora(s)",tiempo: 3600000},
      "m": {nombre: "minuto(s)",tiempo: 60000},
      "s": {nombre: "segundo(s)",tiempo: 1000}
    }

    let format = date.slice(-1),
        time = date.slice(0,-1)

    if(!valid_keys[format]) return false
    if(isNaN(time)) return false
    if(!time > 21600000) return false
    if(parseInt(time) <= 0) return false
    return {nombre: `${parseInt(time)} ${valid_keys[format].nombre}`, tiempo: valid_keys[format].tiempo * parseInt(time)}

  }
}