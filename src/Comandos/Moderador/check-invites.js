const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow, MessageSelectMenu } = require("../../ConfigBot/index"), Discord = require("discord.js");

module.exports = new Comando({
    nombre: "check-invites",
    alias: ["checkinvites", "check-invite", "checkinvite"],
    categoria: "Moderador",
    descripcion: "Comprueba cuantos usuarios tienen invitaciones en sus estados de discord.",
    ejemplo: "$check-invites",
    ejecutar: async (client, message) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }

        const withInvite = [];
        message.guild.members.cache.forEach((m) => {
            const possibleLinks = m.user.presence.activities.map((a) => [a.state, a.details, a.name]).flat();
            const inviteLinks = possibleLinks.filter((l) => /(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(l));
            if (inviteLinks.length > 0) {
                withInvite.push({
                    id: m.user.id,
                    tag: Discord.Util.escapeMarkdown(m.user.tag),
                    links: Discord.Util.escapeMarkdown(inviteLinks.join(", "))
                });
            }
        });

        let index = 1, text = (withInvite.length > 0 ? withInvite.map((m) => `${client.emojiTrue} Se encontraron **__${withInvite.length}__** usuarios con posibles invitaciones en sus estados.\n\n\`\`\`${index++}- ${m.tag}: ${m.links}\`\`\``).join("\n") : `${client.emojiFalse} Ningún usuario fue encontrado con invitaciones en sus estados.`);
        const e = new MessageEmbed()
        e.setColor(client.colorDefault);
        e.setDescription(text)
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }
})