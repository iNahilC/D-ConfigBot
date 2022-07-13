const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index"),
        randomstring = require("randomstring");

module.exports = new Comando({
  nombre: "suggest-bot",
  alias: ["suggestbot", "bot-suggestion", "bot_suggestion", "bot-sugerencia", "bot-suggestion", "botsugerencia", "botsuggestion"],
  categoria: "Utilidad",
  descripcion: "Con este comando puedes enviar sugerencias al servidor de Soporte.",
  ejemplo: "$suggest-bot Me gustaria que agreguen el comando...",
  ejecutar: async (client, message, args) => {
    let sayMessage = args.join(" ");
    if (sayMessage.length < 1) {
      let e = new MessageEmbed()
      e.setColor(client.colorDefault)
      e.setDescription(`${client.emojiError} Necesitas poner un mensaje para la sugerencia.`)
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    let button = new MessageButton()
    button.setStyle('LINK')
    button.setURL(client.invitacion);
    button.setLabel(`Invita a ${client.user.username} a un servidor donde administres!`);
    let button_row = new MessageActionRow().addComponents(button, new MessageButton().setStyle("LINK").setURL("https://discord.gg/NJjVbSK").setLabel("Unirse al servidor de soporte"), );
    message.reply({ content:`**${message.author.username}** Tu sugerencia fue **__correctamente__** recibida!`, allowedMentions: { repliedUser: false }, components: [button_row] });
    let numbers = randomstring.generate({
      length: 5,
      charset: 'numeric'
    });

    const e = new MessageEmbed()
    e.setColor(client.colorDefault)
    e.setDescription(`
**Nueva sugerencia** [\`ID: ${numbers}\`]

**Usuario:** ${message.author.tag} [\`ID: ${message.author.id}\`]
**Servidor:** \`${message.guild.name}\`
**Mensaje:** \`${sayMessage}\`
`)
    e.setThumbnail(message.author.displayAvatarURL())
    let msg = await client.guilds.cache.get(client.servidor_oficial).channels.cache.get("719362589112401970").send({ embeds: [e] })
  }
});