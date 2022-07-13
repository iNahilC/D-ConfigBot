const { Evento, MessageEmbed } = require("../../ConfigBot/index");
module.exports = new Evento({
    nombre: "guildCreate",
    ejecutar: async (client, guild) => {
        let canal = client.channels.cache.get("719362254574977024");
        let ownershi = client.users.cache.get(guild.ownerId);
        const embed = new MessageEmbed();
        embed.setTitle("⛩️ **| ME AGREGARON A UN NUEVO SERVIDOR**", true);
        embed.addField("**NOMBRE**", guild.name, true);
        embed.addField("**ID**", guild.id, true);
        embed.addField("**DUEÑO**", ownershi.tag + "(`" + ownershi.id + "`)", true);
        embed.addField("**MIEMBROS**", guild.members.cache.size.toLocaleString(), true);
        embed.addField("**SEGURIDAD**", guild.verificationLevel, true);
        embed.setThumbnail(guild.iconURL());
        embed.setColor("GREEN").setTimestamp().setFooter({
            text: `${client.guilds.cache.size} servidores y ${client.users.cache.size} usuarios`,
            iconURL: client.user.displayAvatarURL()
        });
        canal.send({ embeds: [embed] });

        let prefix = "c!"
        let creador = client.users.cache.get('656738884712923166')

        if (!await client.db.has(`${guild.id}.custom_cmds`)) await client.db.set(`${guild.id}.custom_cmds`, new Array());
        if (!await client.db.has(`${guild.id}.msg_filter`)) await client.db.set(`${guild.id}.msg_filter`, new Array());
        if (!await client.db.has(`${guild.id}.toggle_snipe`)) await client.db.set(`${guild.id}.toggle_snipe`, "on");
        if (!await client.db.has(`${guild.id}.toggle_edit_snipe`)) await client.db.set(`${guild.id}.toggle_edit_snipe`, "on");
        if (!await client.db.has(`${guild.id}.ignored_channels`)) await client.db.set(`${guild.id}.ignored_channels`, new Array());
    }
})