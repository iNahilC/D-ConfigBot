const { Evento, MessageEmbed } = require("../../ConfigBot/index");

module.exports = new Evento({
    nombre: "guildDelete",
    ejecutar: async (client, guild) => {

        let canal = client.channels.cache.get("719362406857572363");
        let ownershi = client.users.cache.get(guild.ownerId);
        let embed = new MessageEmbed();
        embed.setDescription(`
⛩️ **| ME HAN REMOVIDO DE UN SERVIDOR**

**NOMBRE**: ${guild.name}
**ID**: ${guild.id}
**DUEÑO**: ${ownershi.tag} (\`${ownershi.id}\`)
**MIEMBROS**: ${guild.members.cache.size.toLocaleString()}
**SEGURIDAD** ${guild.verificationLevel}`)
        embed.setThumbnail(guild.iconURL());
        embed.setColor("DARK_RED");
        embed.setTimestamp();
        embed.setFooter({
            text: `${client.guilds.cache.size} servidores y ${client.users.cache.size} usuarios`,
            iconURL: client.thumbnailGIF
        });
        canal.send({ embeds: [embed] });

        if (await client.db.has(`${guild.id}.logs_ignore`)) await client.db.delete(`${guild.id}.logs_ignore`);
        if (await client.db.has(`${guild.id}.logs_channel`)) await client.db.delete(`${guild.id}.logs_channel`);
        if (await client.db.has(`${guild.id}.ignored_channels`)) await client.db.delete(`${guild.id}.ignored_channels`);
        if (await client.db.has(`${guild.id}.custom_cmds`)) await client.db.delete(`${guild.id}.custom_cmds`);
        if (await client.db.has(`${guild.id}.cmd_on`)) await client.db.delete(`${guild.id}.cmd_on`);
        if (await client.db.has(`${guild.id}.permisos`)) await client.db.delete(`${guild.id}.permisos`);
        if (await client.db.has(`${guild.id}.custom_cmds`)) await client.db.delete(`${guild.id}.custom_cmds`);
        if (await client.db.has(`${guild.id}.msg_filter`)) await client.db.delete(`${guild.id}.msg_filter`);
        if (await client.db.has(`${guild.id}.toggle_snipe`)) await client.db.delete(`${guild.id}.toggle_snipe`);
    }
});