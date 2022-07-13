const { Evento, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Evento({
  nombre: "roleDelete",
  ejecutar: async (client, role) => {
    if (!await client.db.has(`${role.guild.id}.antispam`)) return;
    if (!await client.db.has(`${role.guild.id}.antispam.ignored_roles`)) await client.db.set(`${role.guild.id}.antispam.ignored_roles`, new Array());
    let ignored_roles_array = await client.db.get(`${role.guild.id}.antispam.ignored_roles`);
    for (var i = 0; i < ignored_roles_array.length; i++) {
      if (role.id == ignored_roles_array[i]) {
        let antispam_logs = await client.db.get(`${role.guild.id}.antispam.antispam_logs_channel`);
        let antispam_logs_channel = role.guild.channels.cache.get(antispam_logs);
        if (!antispam_logs_channel) {
          await client.db.set(`${role.guild.id}.antispam.antispam_logs_channel`, {})
          let extracted_array = new DiscordUtils().remove_item_from_array(await client.db.get(`${message.guild.id}.antispam.ignored_roles`), ignored_roles_array[i]);
          return await client.db.set(`${role.guild.id}.antispam.ignored_roles`, extracted_array);
        }

        let extracted_array = new DiscordUtils().remove_item_from_array(await client.db.get(`${message.guild.id}.antispam.ignored_roles`), ignored_roles_array[i]);
        await client.db.set(`${role.guild.id}.antispam.ignored_roles`, extracted_array);
        return antispam_logs_channel.send(`
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Roles | Remove]

* Role Removido
> @${role.name}

* Razón
> Rol eliminado.
\`\`\``);
      }
    }
  }
});