const { Evento } = require("../../ConfigBot/index");

module.exports = new Evento({
  nombre: "messageUpdate",
  ejecutar: async (client, oldMessage, newMessage) => {
    if (!oldMessage.guild) return;
    if (newMessage.author.bot) return;
    if (!await client.db.has(`${newMessage.guild.id}.msg_filter`)) await client.db.set(`${newMessage.guild.id}.msg_filter`, new Array());
    if (await client.db.get(`${newMessage.guild.id}.permisos.${newMessage.author.id}`) >= 2) return;
    
    const filter = await client.db.get(`${newMessage.guild.id}.msg_filter`);
    let regExp = new RegExp(filter.join("|"), "gi");
    let msgSplit = newMessage.content.match(regExp);
    if (msgSplit === null) return;

    msgSplit.forEach(async m => {
      if (filter.includes(m)) {
        if (newMessage.deletable) await newMessage.delete();
        await newMessage.channel.send(`${client.emojiError} ${newMessage.author}, No puedes decir esa palabra, está prohibida! (**${m}**)`).then((msg) => {
          setTimeout(() => msg.delete(), 2000);
        });
      }
    });
  }
});