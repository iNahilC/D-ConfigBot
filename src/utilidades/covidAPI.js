const request = require("request"),
      url = "https://corona.lmao.ninja/v2/countries";


function corona(callback) {
  if(typeof callback != "function") throw new Error("sortPorMuertes recibe como parametro una funcion(callback)");
  request(url, (err, res, body) => {
    if(res.statusCode != 200 || err) callback(null);
    else {
      let array = [];
      let data = JSON.parse(body);
      data.sort((a, b) => b.cases - a.cases)
      data = data.slice(0, 10)
      data.map(r => array.push({
        pais: r.country,
        casos: r.cases,
        muertes: r.deaths
      }));
      callback(array);
    }
  })
}


function sortPorMuertes(callback) {
  if(typeof callback != "function") throw new Error("sortPorMuertes recibe como parametro una funcion(callback)");
  request(url, (err, res, body) => {
    if(res.statusCode != 200 || err) callback(null);
    else {
      let array = [];
      let data = JSON.parse(body);
      data.sort((a, b) => b.deaths - a.deaths)
      data = data.slice(0, 10)
      data.map(r => array.push({
        pais: r.country,
        casos: r.cases,
        muertes: r.deaths
      }));
      callback(array);
    }
  })
}

function sortByTodayCases(callback) {
  if(typeof callback != "function") throw new Error("sortByTodayCases recibe como parametro una funcion(callback)");
  request(url, (err, res, body) => {
    if(res.statusCode != 200 || err) callback(null);
    else {
      let array = [];
      let data = JSON.parse(body);
      data.sort((a, b) => b.todayCases - a.todayCases)
      data = data.slice(0, 10)
      data.map(r => array.push({
        pais: r.country,
        todayCases: r.todayCases,
        casos: r.cases,
        casos_activos: r.active,
        muertes: r.deaths
      }));
      callback(array);
    }
  })
}

module.exports = {
  corona,
  sortPorMuertes,
  sortByTodayCases
};