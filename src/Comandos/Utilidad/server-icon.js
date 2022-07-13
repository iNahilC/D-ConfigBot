const { Comando, MessageEmbed, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
  nombre: "server-icon",
  alias: ["servericon", "servericono", "server-icono", "icono", "icon"],
  descripcion: "Muestra el avatar del servidor.",
  categoria: "Utilidad",
  ejemplo: "$server-icon",
  ejecutar: async (client, message, args) => {
    if (!message.guild.iconURL()) {
      let ef = new MessageEmbed()
        .setColor(client.colorDefault)
        .setDescription(`${client.emojiError} El servidor **__no tiene__** un icono personalizado.`)
      return message.reply({ embeds: [ef], allowedMentions: { repliedUser: false } });
    }
    let e = new MessageEmbed();
    let button_url = new MessageActionRow().addComponents(
      new MessageButton().setStyle("LINK").setURL(message.guild.iconURL({ dynamic: true, size: 4096 })).setLabel("Clíck aquí para ver la imagen en el navegador"), );
    e.setColor(client.colorDefault);
    e.setDescription(`[URL](${message.guild.iconURL({ dynamic: true, size: 4096 })})`)
    e.setImage(message.guild.iconURL({ dynamic: true, size: 4096 }));
    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }, components: [button_url] });
  }
});