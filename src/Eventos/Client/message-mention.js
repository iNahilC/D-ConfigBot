const { Evento, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index.js");

module.exports = new Evento({
  nombre: "messageCreate",
  ejecutar: async (client, message) => {
    if (message.author.bot || !message.guild) return;
    let RegMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    let prefix;
    if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = 'c!' }
    let administrador = client.comandos.filter(cmd => cmd.categoria == 'Administrador');
    let moderador = client.comandos.filter(cmd => cmd.categoria == 'Moderador');
    let guardia = client.comandos.filter(cmd => cmd.categoria == 'Guardia');
    let informacion = client.comandos.filter(cmd => cmd.categoria == 'Información');
    let entretenimiento = client.comandos.filter(cmd => cmd.categoria == 'Entretenimiento');
    let imagenes = client.comandos.filter(cmd => cmd.categoria == 'Imagenes');
    let utilidad = client.comandos.filter(cmd => cmd.categoria == 'Utilidad');
    let total = administrador.size + moderador.size + guardia.size + utilidad.size + entretenimiento.size + informacion.size

    if (message.content.match(RegMention)) {
      let creador = client.users.cache.get('656738884712923166');
      return message.reply({ content: `
Hey **${message.author.username}**, aquí hay unos datos que pueden servirte de ayuda:

• Mi prefijo en este servidor es **${prefix}**
• Mi creador es **${creador.tag}**
• Mi ping actual es **${client.ws.ping}ms**
• Fui creado hace **${new DiscordUtils().ms_converter(Math.floor(Date.now()) - client.user.createdTimestamp)}
• Cuento con **${administrador.size}** comandos de administración, **${moderador.size}** de moderación, **${guardia.size}** de guardias, **${entretenimiento.size}** de entretenimiento, **${informacion.size}** de Información y **${utilidad.size}** de utilidades, en total **${total}** comandos disponibles!
• Mi Servidor de soporte es https://discord.gg/NJjVbSK
• Invitación **https://discord.com/api/oauth2/authorize?client_id=742260493414301814&permissions=8&scope=bot**` });
    }
  }
});