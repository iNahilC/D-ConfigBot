/*
* ANTISPAM BY MEGASTAR 2/04/19
* MODIFICADO Y MEJORADO POR iNahilCoder 4/09/21
-+-+-+-+-+ AGREGADOS -+-+-+-+-+

+ ignorar roles
+ ignorar invitaciones
+ ignorar bots
+ ahora se puede editar el intervalo para que el mensaje sea detectado como spam
+ ignorar las invitaciones del servidor.

-+-+-+-+-+ AGREGADOS -+-+-+-+-+
*/

let pos_mentions = ["@everyone", "@here"]
let Collect = new Map();
let regex = /(https?:\/\/)?(www\.)?((discord|invite)\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z]/ //REGEX HERMOSO

function roundUp(data, precision) {
  let resultado = data
  var decimal = Math.pow(10, precision);
  return (Math.round(resultado * decimal) / decimal).toFixed(precision)
};

function palabras_repetidas(mensaje) {
  return /^(. + )( ? : +\1){5}/.test(mensaje);
}

function caracteres_repetidos(mensaje) {
  mensaje = mensaje.replace(/\s+/g, "_");
  return /(\S)(\1{8,})/g.test(mensaje);
}

module.exports = {
  verificar: async (message, opciones) => {
    let member = message.member || await message.guild.members.fetch(message.author)
    let MAX_WARNING = opciones && opciones.max_advertencias && typeof opciones.max_advertencias == "number" && opciones.max_advertencias > 0 ? opciones.max_advertencias : 10
    let warn_point = opciones && opciones.flood_puntos && typeof opciones.flood_puntos == "number" && opciones.flood_puntos > 0 ? opciones.flood_puntos : 1
    let mention_point = opciones && opciones.mencion_puntos && typeof opciones.mencion_puntos == "number" && opciones.mencion_puntos > 0 ? opciones.mencion_puntos : 5
    let messages_interval = opciones && opciones.messagesInterval && typeof opciones.messagesInterval == "number" && opciones.messagesInterval > 0 ? opciones.messagesInterval : 1700
    let user_list = opciones && opciones.usuarios && Array.isArray(opciones.usuarios) ? opciones.usuarios : []
    let channel_list = opciones && opciones.canales && Array.isArray(opciones.canales) ? opciones.canales : []
    let roles_list = opciones && opciones.roles && Array.isArray(opciones.roles) ? opciones.roles : []
    let invites = opciones && opciones.invitaciones && opciones.invitaciones == true ? true : false
    let ignorar_bots = opciones && opciones.ignore_bots && opciones.ignore_bots == true ? true : false
    let duplicados = opciones && opciones.duplicado && opciones.duplicado == true ? true : false
    let invite_point = opciones && opciones.invite_puntos && typeof opciones.invite_puntos == "number" ? opciones.invite_puntos : 1
    let invites_list = opciones && opciones.invites_list && Array.isArray(opciones.invites_list) ? opciones.invites_list : []
    let menciones_count_detect = opciones && opciones.mencionesCount && typeof opciones.mencionesCount == "number" && opciones.mencionesCount > 0 ? opciones.mencionesCount : 5

    if (message.author.id == message.client.user.id) return false;
    if (user_list.includes(message.author.id)) return false;
    if (channel_list.includes(message.channel.id)) return false;
    if (roles_list.some(x => member.roles.cache.has(x))) return false;
    if (ignorar_bots && message.author.bot) return false;
    if (!Collect.has(message.guild.id)) Collect.set(message.guild.id, {})
    if (!Collect.get(message.guild.id)[message.author.id]) Collect.get(message.guild.id)[message.author.id] = {
      msg: [],
      globalwarns: 0,
      floodwarns: 0,
      floodtime: 0
    }
    Collect.get(message.guild.id)[message.author.id].msg.push(message)
    let msg = Collect.get(message.guild.id)[message.author.id].msg


    //INVITACIONES
    if (invites) {
      let final_regex = message.content.match(regex)
      if (final_regex) {
        Collect.get(message.guild.id)[message.author.id].globalwarns += invite_point
        let link = final_regex[0].split(" ")[0]
        let datos = await message.client.fetchInvite(link).then(inv => {
          if (invites_list.includes(inv.url)) return false;
          if (inv.guild.id === message.guild.id) return false;
          return {
            duplicado: false,
            mencion: false,
            flood: false,
            invitacion: {
              servidor: inv.guild.name,
              advertencias: `${Collect.get(message.guild.id)[message.author.id].globalwarns}/${MAX_WARNING}`,
              id: inv.guild.id,
              url: inv.url,
              detectado: false
            }
          }
        }).catch(error => {
          return {
            duplicado: false,
            mencion: false,
            flood: false,
            invitacion: {
              servidor: "invalido",
              advertencias: `${Collect.get(message.guild.id)[message.author.id].globalwarns}/${MAX_WARNING}`,
              id: "invalido",
              url: link,
              detectado: false
            }
          }
        })
        if (Collect.get(message.guild.id)[message.author.id].globalwarns >= MAX_WARNING) {
          datos.invitacion.detectado = true
          Collect.get(message.guild.id)[message.author.id].msg = []
          Collect.get(message.guild.id)[message.author.id].globalwarns = 0
        }
        return datos
      }
    }


    //SPAM MEDIANTE MENCION
    if (message.mentions.roles.size > 0 || message.mentions.members.size > 0 || pos_mentions.some(r => message.content.includes(r))) {
      let cantidad = message.mentions.roles.size + message.mentions.members.size
      pos_mentions.map(r => {
        if (message.content.includes(r)) cantidad++
      })

      //ADVERTENCIA
      if (cantidad >= menciones_count_detect) {
        Collect.get(message.guild.id)[message.author.id].globalwarns += mention_point

        let datos = {
          duplicado: false,
          mencion: {
            cantidad: cantidad,
            advertencias: `${Collect.get(message.guild.id)[message.author.id].globalwarns}/${MAX_WARNING}`,
            detectado: false
          },
          flood: false,
          invitacion: false
        }
        datos.mencion.detectado = true
        return datos
      }
    }



    //CARACTERES CONSECUTIVOS
    if (duplicados) {
      if (caracteres_repetidos(message.content)) {
        let datos = {
          duplicado: true,
          mencion: false,
          flood: false,
          invitacion: false
        }
        return datos
      }
    }


    //FLOOD CON UN INTERVALO DE 0 A 1.7 SEGUNDOS CONSECUTIVOS EN CADA MENSAJE, ES EL TIEMPO PERFECTO :D
    if (msg.length > 1) {
      if ((msg[msg.length - 1].createdTimestamp - msg[msg.length - 2].createdTimestamp) >= 0 && (msg[msg.length - 1].createdTimestamp - msg[msg.length - 2].createdTimestamp) <= messages_interval) {
        Collect.get(message.guild.id)[message.author.id].floodwarns++
          Collect.get(message.guild.id)[message.author.id].floodtime += msg[msg.length - 1].createdTimestamp - msg[msg.length - 2].createdTimestamp
      } else {
        Collect.get(message.guild.id)[message.author.id].floodwarns = 0
        Collect.get(message.guild.id)[message.author.id].floodtime = 0
      }
    }


    //ADVERTENCIA
    if (Collect.get(message.guild.id)[message.author.id].floodwarns > 3) {
      Collect.get(message.guild.id)[message.author.id].globalwarns += warn_point
      let datos = {
        duplicado: false,
        mencion: false,
        flood: {
          tiempo: `${roundUp(Collect.get(message.guild.id)[message.author.id].floodtime/1000, 1)} segundos`,
          cantidad: Collect.get(message.guild.id)[message.author.id].floodwarns,
          advertencias: `${Collect.get(message.guild.id)[message.author.id].globalwarns}/${MAX_WARNING}`,
          detectado: false
        },
        invitacion: false
      }

      //DETECCION
      if (Collect.get(message.guild.id)[message.author.id].globalwarns >= MAX_WARNING) {
        datos.flood.detectado = true
        Collect.get(message.guild.id)[message.author.id].msg = []
        Collect.get(message.guild.id)[message.author.id].globalwarns = 0
      }
      Collect.get(message.guild.id)[message.author.id].floodwarns = 0
      Collect.get(message.guild.id)[message.author.id].floodtime = 0
      return datos
    }

    //RESETEAMOS LA LISTA DE MENSAJES DEL USUARIO, ESTO HARA QUE LA DETECCION SEA MAS FLUIDA
    if (Collect.get(message.guild.id)[message.author.id].msg.length > 20) {
      Collect.get(message.guild.id)[message.author.id].msg = []
    }

    return false //REGRESA FALSE EN CASO LAS DETECCIONES SEAN NEGATIVAS (NO SPAM)
  }
}