const { Evento } = require("../../ConfigBot/index");

module.exports = new Evento({
  nombre: "messageCreate",
  ejecutar: async (client, message) => {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!await client.db.has(`${message.guild.id}.msg_filter`)) await client.db.set(`${message.guild.id}.msg_filter`, new Array());
    if (await client.db.get(`${message.guild.id}.permisos.${message.author.id}`) >= 2) return;

    const filter = await client.db.get(`${message.guild.id}.msg_filter`);
    let regExp = new RegExp(filter.join("|"), "gi");
    let msgSplit = message.content.match(regExp);
    if (msgSplit === null) return;
    
    msgSplit.forEach(async m => {
      if (filter.includes(m)) {
        if (message.deletable) await message.delete();
          await message.channel.send(`${client.emojiError} ${message.author}, No puedes decir esa palabra, está prohibida! (**${m}**)`).then((msg) => {
            setTimeout(() => msg.delete(), 2000);
          });
      }
    });
  }
});