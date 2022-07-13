const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Comando({
  nombre: "botservers",
  alias: ["bot-servers", "botguilds", "bot-guilds"],
  onlyOwner: true,
  descripcion: "Este comando te muestra todos los servidores donde estoy.",
  ejemplo: "$botservers",
  ejecutar: async (client, message, args) => {
    let servers = client.guilds.cache.map(r => `🔸\` ${r.name} | ${r.members.cache.size}\``).join('\n');
    let mensajes = new DiscordUtils().split_texto(servers, 2000)
    for (var texto of mensajes) {
      message.channel.send(`
${texto}

*Servers en total: **${client.guilds.cache.size}** / Personas en total: **${client.users.cache.size}**.*`);
    }
  }
});