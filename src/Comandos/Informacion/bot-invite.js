const { Comando, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
  nombre: "bot-invite",
  alias: ["botinvite", "invite", "inv", "i"],
  descripcion: "Invitacion del bot y servidor de soporte",
  categoria: "Información",
  ejemplo: "$bot-invite",
  ejecutar: async (client, message, args) => {
    let button_invite = new MessageActionRow().addComponents(new MessageButton().setStyle('LINK').setURL(client.invitacion).setLabel(`Invita a ${client.user.username} a un servidor donde administres!`), );
    return message.reply({ 
      content: `Hey **${message.author.username}**, Puedes unirte a mi servidor de Soporte con este link: https://discord.gg/NJjVbSK`,
      components: [button_invite], allowedMentions: {  repliedUser: false } });
  }
});