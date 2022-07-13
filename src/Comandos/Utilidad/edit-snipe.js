const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Comando({
  nombre: "edit-snipe",
  alias: ["editsnipe", "last-edited-message"],
  categoria: "Utilidad",
  descripcion: "Caza el ultimo mensaje editado en el canal donde lo ejecutaste.",
  ejemplo: "$edit-snipe",
  ejecutar: async (client, message, args) => {
    let prefix;
    if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
    if (!await client.db.has(`${message.guild.id}.toggle_edit_snipe`)) await client.db.set(`${message.guild.id}.toggle_edit_snipe`, true);
    let activado_desactivado = await client.db.get(`${message.guild.id}.toggle_edit_snipe`);
    let u_permisos = await client.db.get(`${message.guild.id}.permisos.${message.author.id}`);
    if (!activado_desactivado) {
      let footer_gramatica = "";
      if (u_permisos == 3) footer_gramatica = `Puedes activar el comando escribiendo en el chat: ${prefix}toggle-edit-snipe`;
      if (u_permisos !== 3) footer_gramatica = `Puedes contactar con un administrador para activar el comando escribiendo en el chat: ${prefix}toggle-edit-snipe`;
      let e = new MessageEmbed()
      e.setColor(client.colorDefault)
      e.setDescription(`${client.emojiError} El comando **__edit-snipe__** está desactivado en el servidor.`);
      e.setFooter({ text: footer_gramatica });
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    if (!await client.db.has(`${message.guild.id}.edit_snipe.${message.channel.id}`)) {
      let e = new MessageEmbed()
      e.setColor(client.colorDefault)
      e.setDescription(`${client.emojiError} No hay mensajes recientemente **__editados__** en este canal.`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
    }

    let tipo = await client.db.get(`${message.guild.id}.edit_snipe.${message.channel.id}.tipo`);
    if (tipo == 'texto') {
      let snipauthor = await client.db.get(`${message.guild.id}.edit_snipe.${message.channel.id}.author`)
      let snipauthor_id = await client.db.get(`${message.guild.id}.edit_snipe.${message.channel.id}.author_id`)
      if (!await client.db.has(`${message.guild.id}.toggle_edit_sniper_user.${snipauthor_id}`)) await client.db.set(`${message.guild.id}.toggle_edit_sniper_user.${snipauthor_id}`, client.emojiON);
      let snipe_user_state = await client.db.get(`${message.guild.id}.toggle_edit_sniper_user.${snipauthor_id}`);
      if (snipe_user_state == client.emojiON && message.author.id !== snipauthor_id) {
        let e = new MessageEmbed();
        e.setColor(client.colorDefault)
        e.setDescription(`${client.emojiError} El usuario tiene configurado en su perfil que no se puedan ver sus **__mensajes editados__** con este comando.`);
        e.setFooter({ text: `Si deseas configurar tu perfil ejecuta el comando ${prefix}perfil` });
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
      }
      let old_text = await client.db.get(`${message.guild.id}.edit_snipe.${message.channel.id}.old_text`);
      let new_text = await client.db.get(`${message.guild.id}.edit_snipe.${message.channel.id}.new_text`);
      let split_text = new DiscordUtils().split_texto(new_text, 2000);
      for (var texto of split_text) {
        let e = new MessageEmbed()
        e.setColor(client.colorDefault)
        e.setDescription(`
**Antiguo**: ${old_text}
**Actual**: ${new_text}`)
        e.setFooter({ text: `${snipauthor} [ID: ${snipauthor_id}]` });
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
      }
    }
  }
});