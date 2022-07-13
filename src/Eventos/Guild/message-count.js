const { Evento } = require("../../ConfigBot/index");

module.exports = new Evento({
  nombre: "messageCreate",
  ejecutar: async (client, message) => {
    if (message.author.bot) return; 
    if (!message.guild) return;
    if(!await client.db.has(`${message.guild.id}.msg_count.${message.author.id}`)) await client.db.set(`${message.guild.id}.msg_count.${message.author.id}`, 0);
    await client.db.add(`${message.guild.id}.msg_count.${message.author.id}`, 1);
  }
});
