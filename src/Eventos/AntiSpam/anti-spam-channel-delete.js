const { Evento, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Evento({
  nombre: "channelDelete",
  ejecutar: async (client, channel) => {
    if (!await client.db.has(`${channel.guild.id}.antispam`)) return;
    if (!await client.db.has(`${channel.guild.id}.antispam.ignored_channels`)) await client.db.set(`${channel.guild.id}.antispam.ignored_channels`, new Array());
    let ignored_channels_array = await client.db.get(`${channel.guild.id}.antispam.ignored_channels`);
    for (var i = 0; i < ignored_channels_array.length; i++) {
      if (channel.id == ignored_channels_array[i]) {
        let antispam_logs = await client.db.get(`${channel.guild.id}.antispam.antispam_logs_channel`);
        let antispam_logs_channel = channel.guild.channels.cache.get(antispam_logs);
        if (!antispam_logs_channel) {
          await client.db.set(`${channel.guild.id}.antispam.antispam_logs_channel`, {});
          let extracted_array = new DiscordUtils().remove_item_from_array(await client.db.get(`${channel.guild.id}.antispam.ignored_channels`), channel.id);
          return await client.db.set(`${channel.guild.id}.antispam.ignored_channels`, extracted_array);
        }

        let extracted_array = new DiscordUtils().remove_item_from_array(await client.db.get(`${channel.guild.id}.antispam.ignored_channels`), channel.id);
        await client.db.set(`${channel.guild.id}.antispam.ignored_channels`, extracted_array);
        return antispam_logs_channel.send(`
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Channels | Remove]

* Canal Removido
> #${channel.name}

* Razón
> Canal eliminado.
\`\`\``);
      }
    }
  }
});