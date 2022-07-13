const { Evento, MessageEmbed } = require("../../ConfigBot/index");

module.exports = new Evento({
  nombre: "messageCreate",
  ejecutar: async (client, message) => {
    if (!message.guild) return;
    if (client.db.has(`${message.guild.id}.anti_messages`)) return;
    let u_permisos = await client.db.get(`${message.guild.id}.permisos.${message.author.id}`)
    if (message.guild.members.cache.get(message.author.id).permissions.has("ADMINISTRATOR") || u_permisos == 3) return;
    if (message.author.id == client.user.id || !message.deletable) return;
    if (message.deletable) return message.author.send(`${client.emojiFalse} **${message.author.username}**, Tu mensaje fue eliminado por el sistema de **__anti-messages__**.`).then(async (msg) => {
      setTimeout(() => message.delete(), 1000);
    }).catch(async (err) => {})
  }
});