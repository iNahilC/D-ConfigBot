const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");
const table = require("table"),
    arraySort = require("array-sort");

module.exports = new Comando({
    nombre: "top-inviter",
    alias: ["topinviter", "top-invite", "topinvite"],
    categoria: "Información",
    descripcion: "Muestra un top 10 de los usuarios con mas invitaciones en el servidor.",
    ejemplo: "$top-inviter",
    ejecutar: async (client, message, args) => {
        const invite2 = await message.guild.invites.fetch();
        let index = 0;
        const invites = await invite2.filter((inv) => inv.uses > 0).sort((a, b) => b.uses - a.uses).first(10);
        let mapeo = [
            ['Top', 'Usuario', 'Usos']
        ]

        invites.forEach(function(invite) { mapeo.push([index + 1, invite.inviter.username, invite.uses]) });
        if (invites.length < 1) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiFalse} Todavia **__no hay invitaciones__** en este servidor o nadie ha invitado personas.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let e = new MessageEmbed()
        e.setTitle(`${client.emojiTrue} Top **__${invites.length}__** usuario${invites.length !== 1 ? "s" : ""} con mas invitaciones en el servidor.`);
        e.setColor(client.colorDefault);
        e.setThumbnail(client.thumbnailGIF);
        e.setDescription(`\`\`\`${table.table(mapeo)}\`\`\``)
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
    }
});