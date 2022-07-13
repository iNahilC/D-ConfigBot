const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow, MessageSelectMenu } = require("../../ConfigBot/index");
const moment = require("moment");
require('moment-duration-format');

module.exports = new Comando({
      nombre: "userinfo",
      alias: ["ui", "user-info"],
      descripcion: "Este comando te permite ver una información detallada de un usuario en el servidor.",
      categoria: "Información",
      ejemplo: "$userinfo [@usuario]",
      ejecutar: async (client, message, args) => {
          let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
          if (!member || !message.guild.members.cache.has(member.id)) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiFalse} Necesitas mencionar al **__usuario__** que deseas ver su información detallada.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
          }

          if (member.user.id === client.user.id) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription("<:bot:678812714612817940> Necesitas mencionar a otro bot!");
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
          }

          let stat = {
            online: "Online",
            idle: "Ausente",
            dnd: "No Molestar",
            offline: "Offline",
            streaming: "Streaming",
            invisible: "Invisible"
          }

          let renombre = {
            DISCORD_EMPLOYEE: "Empleado de Discord",
            DISCORD_PARTNER: "Socio de Discord",
            HYPESQUAD_EVENTS: "Eventos de Hypesquad",
            BUGHUNTER_LEVEL_1: "Cazaerrores de Discord Lvl. 1",
            HOUSE_BRAVERY: "Bravery del Hypesquad",
            HOUSE_BRILLIANCE: "Brillance del Hypesquad",
            HOUSE_BALANCE: "Balance del Hypesquad",
            EARLY_SUPPORTER: "Partidario Inicial",
            TEAM_USER: "Usuario del Equipo",
            SYSTEM: "Sistema",
            BUGHUNTER_LEVEL_2: "Caza-errores de Discord Lvl. 2",
            VERIFIED_BOT: "Bot Verificado",
            EARLY_VERIFIED_DEVELOPER: "Desarrollador Verificado"
          }

          let array = [], permissions = []
          if (member.permissions.has('ADMINISTRATOR')) permissions.push('> Administrador');
          if (member.permissions.has('MANAGE_ROLES')) permissions.push('> Gestionar roles');
          if (member.permissions.has('KICK_MEMBERS')) permissions.push('> Expulsar miembros');
          if (member.permissions.has('BAN_MEMBERS')) permissions.push('> Banear miembros');
          if (member.permissions.has('MANAGE_NICKNAMES')) permissions.push('> Gestionar nombres de otros usuarios');
          if (member.permissions.has('MANAGE_EMOJIS_AND_STICKERS')) permissions.push('> Gestionar Emojis y Stickers');
          if (member.permissions.has('MANAGE_WEBHOOKS')) permissions.push('> Gestionar Webhooks');
          if (member.permissions.has('MANAGE_MESSAGES')) permissions.push('> Gestionar Mensajes');
          if (member.permissions.has('MENTION_EVERYONE')) permissions.push('> Mencionar @everyone y @here');
          if (member.permissions.has('MUTE_MEMBERS')) permissions.push('> Mutear miembros de los canales de voz');
          if (member.permissions.has('DEAFEN_MEMBERS')) permissions.push('> Ensordecer miembros de los canales de voz');
          if (member.permissions.has('READ_MESSAGE_HISTORY')) permissions.push('> Leer el historial de mensajes');
          if (member.permissions.has('CONNECT')) permissions.push('> Conectar a canales de voz');
          if (member.permissions.has('MANAGE_CHANNELS')) permissions.push('> Gestionar canales');
          if (member.permissions.has("CREATE_INSTANT_INVITE")) permissions.push('> Crear invitaciones');
          if (member.permissions.has("ADD_REACTIONS")) permissions.push('> Añadir reacciones a los mensajes');
          if (member.permissions.has("VIEW_AUDIT_LOG")) permissions.push('> Ver los registros del servidor');
          if (member.permissions.has("PRIORITY_SPEAKER")) permissions.push('> Prioridad de palabra en los canales de voz');
          if (member.permissions.has("STREAM")) permissions.push('> Hacer streamings (Go Live) en los canales de voz');
          if (member.permissions.has("SEND_MESSAGES")) permissions.push('> Enviar mensajes en los canales de texto');
          if (member.permissions.has("SEND_TTS_MESSAGES")) permissions.push('> Enviar mensajes de texto a voz');
          if (member.permissions.has("EMBED_LINKS")) permissions.push('> Insertar enlaces');
          if (member.permissions.has("ATTACH_FILES")) permissions.push('> Adjuntar archivos en los canales de texto');
          if (member.permissions.has("USE_EXTERNAL_EMOJIS")) permissions.push('> Usar emojis de otros servidores')
          if (member.permissions.has("SPEAK")) permissions.push('> Hablar en canales de voz');
          if (member.permissions.has('CHANGE_NICKNAME')) permissions.push('> Cambiar de nombre')
          if (member.permissions.has("USE_EXTERNAL_STICKERS")) permissions.push('> Utilizar Stickers de otros servidores');
          if (member.permissions.has("CREATE_PUBLIC_THREADS")) permissions.push('> Crear hilos públicos');
          if (member.permissions.has("CREATE_PRIVATE_THREADS")) permissions.push('> Crear hilos privados');
          if (member.permissions.has("MANAGE_THREADS")) permissions.push('> Gestionar los hilos');
          if (member.permissions.has("USE_APPLICATION_COMMANDS")) permissions.push('> Utilizar Comandos de barra');
          if (member.permissions.has("MOVE_MEMBERS")) permissions.push("> Mover miembros de los canales de voz");
          if (permissions.length == 0) permissions.push("> Ninguno");
          let embed = new MessageEmbed()
          embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          embed.setColor(client.colorDefault)

          function T_convertor(ms) {
            let años = Math.floor((ms) / (1000 * 60 * 60 * 24 * 365));
            let meses = Math.floor(((ms) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
            let dias = Math.floor(((ms) % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
            let horas = Math.floor(((ms) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutos = Math.floor(((ms) % (1000 * 60 * 60)) / (1000 * 60));
            let segundos = Math.floor(((ms) % (1000 * 60)) / 1000);


            let final = ""
            if (años > 0) final += años > 1 ? `${años} años, ` : `${años} año, `
            if (meses > 0) final += meses > 1 ? `${meses} meses, ` : `${meses} mes, `
            if (dias > 0) final += dias > 1 ? `${dias} días, ` : `${dias} día, `
            if (horas > 0) final += horas > 1 ? `${horas} horas, ` : `${horas} hora, `
            if (minutos > 0) final += minutos > 1 ? `${minutos} minutos y ` : `${minutos} minuto y `
            if (segundos > 0) final += segundos > 1 ? `${segundos} segundos.` : `${segundos} segundo.`
            return final
          }

          if (member.user.bot) { client = "Si"; } else { client = "No"; }
          const status_discord = {
            desktop: 'Discord PC',
            web: 'Discord Web',
            mobile: 'Discord Móvil'
          }

          if (member.presence == null) {
            if (member.user.flags) {
              embed.setColor(client.colorDefault)
              embed.setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
              embed.setDescription(`
\`\`\`md
* Nombre
> ${member.user.tag} [ID: ${member.user.id}]\`

* Bot
> ${client}

* Status
> Offline

* Roles
> ${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => roles.name).join(", ") || "No tiene Roles"}

* Entro al servidor el
> ${moment(member.joinedAt).format("DD/MM/YYYY")} [${new DiscordUtils().T_convertor(Math.floor(Date.now()) - member.joinedAt)}]

* Creo su cuenta hace
> ${moment(member.user.createdAt).format("DD/MM/YYYY")} [${new DiscordUtils().T_convertor(Math.floor(Date.now()) - member.user.createdTimestamp)}]

* Insignias ${member.user.flags.toArray().map(c => renombre[c])}

* Permisos del usuario
${permissions.join('\n')}
\`\`\``)
  } else if (!member.user.flags) {
      embed.setColor(client.colorDefault)
      embed.setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
      embed.setDescription(`
\`\`\`md
* Nombre
> ${member.user.tag} [ID: ${member.user.id}]

* Bot:
> ${client}

* Status
> Offline

* Roles
> ${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => roles.name).join(", ") || "No tiene Roles"}

* Entro al servidor el
> ${moment(member.joinedAt).format("DD/MM/YYYY")} [${new DiscordUtils().T_convertor(Math.floor(Date.now()) - member.joinedAt)}]\`

* Creo su cuenta hace
> ${moment(member.user.createdAt).format("DD/MM/YYYY")} [${new DiscordUtils().T_convertor(Math.floor(Date.now()) - member.user.createdTimestamp)}]\`
\`\`\``) 
    }
  } else {
    let flag = member.user.flags
    if(flag) {
    embed.setDescription(`
\`\`\`md
* Nombre:
> ${member.user.tag} [ID: ${member.user.id}]

* Bot
> ${client}

* Status:
> ${stat[message.guild.members.cache.get(member.id).presence.status]}

* Roles
> ${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => roles.name).join(", ") || "No tiene Roles"}

* Conectado Mediante:
> ${Object.keys(message.guild.members.cache.get(member.id).presence.clientStatus).map(c => status_discord[c]).join(", ")}

* Entro al servidor el día
> ${moment(member.joinedAt).format("DD/MM/YYYY")} [${new DiscordUtils().T_convertor(Math.floor(Date.now()) - member.joinedAt)}]

* Creo su cuenta hace
> ${moment(member.user.createdAt).format("DD/MM/YYYY")} [${new DiscordUtils().T_convertor(Math.floor(Date.now()) - member.user.createdTimestamp)}]

* Insignias
> ${flag.toArray().map(c => renombre[c])}
\`\`\``)
  } else {
    embed.setColor(client.colorDefault)
    embed.setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
    embed.setDescription(`
\`\`\`md
* Nombre
> ${member.user.tag} [ID: ${member.user.id}]

* Bot
> ${client}

* Status
> ${stat[message.guild.members.cache.get(member.id).presence.status]}

* Roles
> ${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => roles.name).join(", ") || "No tiene Roles"}

* Conectado Mediante
> ${Object.keys(message.guild.members.cache.get(member.id).presence.clientStatus).map(c => status_discord[c]).join(", ")}

* Entro al servidor el
> ${moment(member.joinedAt).format("DD/MM/YYYY")} [${new DiscordUtils().T_convertor(Math.floor(Date.now()) - member.joinedAt)}]

* Creo su cuenta hace
> ${moment(member.user.createdAt).format("DD/MM/YYYY")} [${new DiscordUtils().T_convertor(Math.floor(Date.now()) - member.user.createdTimestamp)}]
\`\`\``)
  }
}
  return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }
})