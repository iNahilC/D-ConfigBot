const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Comando({
  nombre: "snipe",
  alias: ["last-deleted-message"],
  categoria: "Utilidad",
  descripcion: "Caza el ultimo mensaje eliminado en el canal donde lo ejecutaste.",
  ejemplo: "$snipe",
  ejecutar: async (client, message, args) => {
    let prefix;
    if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
    if (!await client.db.has(`${message.guild.id}.toggle_snipe`)) await client.db.set(`${message.guild.id}.toggle_snipe`, "on");
    let activado_desactivado = await client.db.get(`${message.guild.id}.toggle_snipe`);
    let u_permisos = await client.db.get(`${message.guild.id}.permisos.${message.author.id}`);
    if (activado_desactivado !== "on") {
      let footer_gramatica = "";
      if (u_permisos > 2) footer_gramatica = `Puedes activar el comando escribiendo en el chat: ${prefix}toggle-snipe`;
      if (!u_permisos >= 2) footer_gramatica = `Puedes contactar con un administrador para activar el comando escribiendo en el chat: ${prefix}toggle-snipe`;
      let e = new MessageEmbed()
      e.setColor(client.colorDefault)
      e.setDescription(`${client.emojiError} El comando **__snipe__** está deseactivado en el servidor.`);
      e.setFooter({ text: footer_gramatica });
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    if (!await client.db.has(`${message.guild.id}.snipe_db.${message.channel.id}`)) {
      let e = new MessageEmbed()
      e.setColor(client.colorDefault)
      e.setDescription(`${client.emojiError} No hay mensajes recientemente eliminados en este canal.`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
    }

    let tipo = await client.db.get(`${message.guild.id}.snipe_db.${message.channel.id}.tipo`);
    if (tipo == 'texto') {
      let snipauthor = await client.db.get(`${message.guild.id}.snipe_db.${message.channel.id}.author`)
      let snipauthor_id = await client.db.get(`${message.guild.id}.snipe_db.${message.channel.id}.author_id`)
      if (!await client.db.has(`${message.guild.id}.toggle_sniper_user.${snipauthor_id}`)) await client.db.set(`${message.guild.id}.toggle_sniper_user.${snipauthor_id}`, client.emojiON);
      let snipe_user_state = await client.db.get(`${message.guild.id}.toggle_sniper_user.${snipauthor_id}`);
      if (snipe_user_state == client.emojiON && message.author.id !== snipauthor_id) {
        let e = new MessageEmbed();
        e.setColor(client.colorDefault)
        e.setDescription(`${client.emojiError} El usuario tiene configurado en su perfil que no se puedan ver sus mensajes eliminados con este comando.`);
        e.setFooter({ text: `Si deseas configurar tu perfil ejecuta el comando ${prefix}perfil` });
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
      }

      let snipsay = await client.db.get(`${message.guild.id}.snipe_db.${message.channel.id}.text`);
      let split_text = new DiscordUtils().split_texto(snipsay, 2000);
      for (var texto of split_text) {
        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setDescription(`${texto}`);
        e.setFooter({ text: `${snipauthor} [ID: ${snipauthor_id}]` });
        message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
      }
    } else if (tipo == 'imagen') {
      let snipauthor = await client.db.get(`${message.guild.id}.snipe_db.${message.channel.id}.author`);
      let snipauthor_id = await client.db.get(`${message.guild.id}.snipe_db.${message.channel.id}.author_id`);
      let snipimage = await client.db.get(`${message.guild.id}.snipe_db.${message.channel.id}.image`);
      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setImage(snipimage);
      e.setFooter({ text: `${snipauthor} [ID: ${snipauthor_id}]` });
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }
  }
});