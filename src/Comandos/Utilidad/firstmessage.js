const { Comando, MessageEmbed, MessageButton, MessageActionRow } = require("../../ConfigBot/index");
const moment_time = require('moment-timezone');
require('moment-duration-format');

module.exports = new Comando({
  nombre: "first-message",
  alias: ["firstmessage", "firstmsg", "first-msg", "primermensaje", "primer-mensaje"],
  categoria: "Utilidad",
  descripcion: "Este comando te permite mostrar el primer mensaje enviado en el canal de texto mencionado.",
  ejemplo: "$first-message [#channel]",
  ejecutar: async (client, message, args) => {
    let prefix;
  if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
    let canal = message.guild.channels.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase()) || message.guild.channels.cache.get(args[0]) || message.mentions.channels.first() || message.channel;
    if (!message.guild.channels.cache.has(canal.id)) canal = message.channel;
    if (!canal.permissionsFor(client.user).has("VIEW_CHANNEL")) {
      let e = new MessageEmbed()
      e.setColor(client.colorDefault)
      e.setDescription(`${client.emojiError} No tengo permisos para ver el canal ${canal}.`)
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
    }

    if (!canal.permissionsFor(client.user).has("READ_MESSAGE_HISTORY")) {
      let e = new MessageEmbed()
      e.setColor(client.colorDefault)
      e.setDescription(`${client.emojiError} No tengo permisos para leer el historial de mensajes en ${canal}`)
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
    }

    const messages = await canal.messages.fetch({ after: 1, limit: 1 });
    const fMessage = messages.first();
    const embed = new MessageEmbed();
    const button_url = new MessageActionRow().addComponents(
      new MessageButton().setStyle('LINK').setURL(fMessage.url).setLabel(`Ir al primer mensaje del canal #${canal.name}!`), );
    for (let embed of fMessage.embeds) {
      return message.reply({ content:`
\`\`\`md
# D-ConfigBot [${fMessage.channel.name} First Message]

* Autor
> ${fMessage.author.tag}

* Descripción del embed
> ${fMessage.embeds[0].description || "No hay!"}

* Hora
> ${moment_time(fMessage.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss")}
\`\`\``, components: [button_url] })
    }
    return message.reply({ content:`
\`\`\`md
# D-ConfigBot [${fMessage.channel.name} First Message]

* Autor
> ${fMessage.author.tag}

* Contenido
> ${fMessage.content}

* Hora
> ${moment_time(fMessage.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss")}
\`\`\``,  components: [button_url] });
  }
});