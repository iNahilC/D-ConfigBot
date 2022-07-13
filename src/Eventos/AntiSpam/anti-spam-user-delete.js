const { Evento, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Evento({
  nombre: "guildMemberRemove",
  ejecutar: async (client, member) => {
    if (!await client.db.has(`${member.guild.id}.antispam`)) return;
    if (!await client.db.has(`${member.guild.id}.antispam.ignored_users`)) await client.db.set(`${member.guild.id}.antispam.ignored_users`, new Array());
    let ignored_members_array = await client.db.get(`${member.guild.id}.antispam.ignored_users`);
    for (var i = 0; i < ignored_members_array.length; i++) {
      if (member.id == ignored_members_array[i]) {
        let antispam_logs = await client.db.get(`${member.guild.id}.antispam.antispam_logs_channel`);
        let antispam_logs_channel = member.guild.channel.cache.get(antispam_logs);
        if (!antispam_logs_channel) {
          await client.db.set(`${member.guild.id}.antispam.antispam_logs_channel`, {});
          let extracted_array = new DiscordUtils().remove_item_from_array(await client.db.get(`${member.guild.id}.antispam.ignored_users`), ignored_members_array[i]);
          return await client.db.set(`${member.guild.id}.antispam.ignored_users`, extracted_array);
        }
        
        let extracted_array = new DiscordUtils().remove_item_from_array(await client.db.get(`${member.guild.id}.antispam.ignored_users`), ignored_members_array[i]);
        await client.db.set(`${member.guild.id}.antispam.ignored_users`, extracted_array);
        return antispam_logs_channel.send(`
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Users | Remove]

* Usuario Removido
> ${member.user.tag} [ID: ${member.id}]

* Razón
> El usuario salió del servidor.
\`\`\``);
      }
    }
  }
});