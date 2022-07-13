const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index"), moment_time = require('moment-timezone');


module.exports = new Comando({
    nombre: "unlockchannel",
    alias: ["unlock-channel", "un-lock", "unlock", "unmute-chat", "unmutechat"],
    categoria: "Moderador",
    descripcion: "Habilita el permiso de poder escribir en un canal especifico. (Rol @everyone)",
    ejemplo: "$unlockchannel [#channel]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
        let logs = await client.db.get(`${message.guild.id}.logs_channel`);
        let lchannel = message.guild.channels.cache.get(logs);
        if (!lchannel) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
            await client.db.delete(`${message.guild.id}.logs_channel`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let canal = message.guild.channels.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase()) || message.guild.channels.cache.get(args[0]) || message.channel;
        
        
        if (!canal || !message.guild.channels.cache.has(canal.id)) { 
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setThumbnail(client.thumbnailGIF)
            e.setDescription(`${client.emojiError} Necesitas **__mencionar/escribir__** el nombre del canal que quieres unmutear.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
        
        if (canal.permissionsFor(message.guild.me).has('MANAGE_CHANNELS') === false) {
            let f = new MessageEmbed()
            f.setDescription(`${client.emojiError} No tengo permisos para manejar ese canal.`);
            f.setColor(client.colorDefault)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        }

        if (!canal.type === 'text') {
            let g = new MessageEmbed()
            g.setDescription(`${client.emojiError} El canal que has mencionado no es un canal de texto.`);
            g.setColor(client.colorDefault)
            return message.reply({ embeds: [g], allowedMentions: { repliedUser: false } });
        }

        message.guild.channels.cache.get(canal.id).permissionOverwrites.edit(message.guild.id, { SEND_MESSAGES: true }).then(async () => {
            let e = new MessageEmbed()
            e.setThumbnail(client.thumbnailGIF)
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiSuccess} El canal ${canal} acaba de ser **__desmuteado__**. Ahora todos pueden escribir.`)
            message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            
            let time = moment_time(message.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss")
            return lchannel.send(`
\`\`\`md
# Unlock Channel

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Canal
> #${canal.name}

* Hora
> ${time}

* Mensaje
> ${message.url}
\`\`\``);
        }).catch(err => {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} **__No tengo permisos__** para desbloquear el canal.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        });


    }
});