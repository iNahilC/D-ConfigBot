const request = require("request"),
      url = "http://services.buildandshoot.com/serverlist.json";

function serverlist(callback) {
  if(typeof callback != "function") throw new Error("serverlist recibe como parametro una funcion(callback)");
  request(url, (err, res, body) => {
    if(res.statusCode != 200 || err) callback(null);
    else {
      let array = [];
      let list = JSON.parse(body);
      //let list2 = list.filter(r => r.players_current >= 1)
      list.sort((a, b) => b.players_current - a.players_current);
      list.map(r => array.push({
        name: r.name,
        ip: r.identifier,
        map: r.map,
        mode: r.game_mode,
        country: r.country,
        ping: r.latency,
        players: `${r.players_current}/${r.players_max}`,
        players_db: `${r.players_current}`,
        update: r.last_updated,
        version: r.game_version
      }));
      callback(array);
    }
  })
}

function serverlist_rangers(callback) {
  if(typeof callback != "function") throw new Error("serverlist recibe como parametro una funcion(callback)");
  request(url, (err, res, body) => {
    if(res.statusCode != 200 || err) callback(null);
    else {
      let array = [];
      let list = JSON.parse(body);
      let list2 = list.filter(r => r.players_current >= 1)
      list2.sort((a, b) => b.players_current - a.players_current);
      list2.map(r => array.push({
        name: r.name,
        ip: r.identifier,
        map: r.map,
        mode: r.game_mode,
        country: r.country,
        ping: r.latency,
        players: `${r.players_current}/${r.players_max}`,
        players_db: `${r.players_current}`,
        update: r.last_updated,
        version: r.game_version
      }));
      callback(array);
    }
  })
}

function server_info(data, callback) {
  if(!data || typeof data != "string") throw new Error("server_info recibe como primer parametro un string que contenga una IP o un nombre");
  if(typeof callback != "function") throw new Error("server_info recibe como segundo parametro una function(callback)");
  serverlist((sv) => {
    if(!sv) callback(null)
    else {
      let array = sv.filter(r => r.name.includes(data))
      if(array.length <= 0) {
        let index = sv.findIndex(r => data.includes(r.ip))
        if(index == -1) callback(null)
        else callback([sv[index]])
      }
      else callback(array)
    }
  })
}

function stats(callback) {
  if(typeof callback != "function") throw new Error("stats recibe como parametro una funcion(callback)");
  serverlist((sv) => {
    if(!sv) callback(null)
    else {
      let total_players = sv.reduce((t, s) => {
        return typeof t == "object" ? parseInt(t.players.split("/")[0]) + parseInt(s.players.split("/")[0]) : t + parseInt(s.players.split("/")[0])
      })
      let total_servers = sv.length
      callback({players: total_players, servers: total_servers})
    }
  })
}

module.exports = { 
  server_info,
  serverlist,
  stats,
  serverlist_rangers
}