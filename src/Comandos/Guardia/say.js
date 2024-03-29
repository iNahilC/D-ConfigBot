const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "say-message",
    alias: ["say", "echo", "decir"],
    descripcion: "Envía un mensaje mediante el bot a un canal. (@everyone, @here y @roles Desactivados).",
    categoria: "Guardia",
    ejemplo: "$say [#channel [contenido]] | [contenido]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }

        let logs = await client.db.get(`${message.guild.id}.logs_channel`);
        let lchannel = message.guild.channels.cache.find(r => r.id === logs);
        if (!lchannel) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
            await client.db.delete(`${message.guild.id}.logs_channel`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let canal = message.guild.channels.cache.get(args[0]) || message.mentions.channels.first() || message.channel;
        if (canal == message.channel) {
            let txt = args.join(' ')
            if (!txt) {
                let e = new MessageEmbed()
                e.setColor('ORANGE')
                e.setDescription('' + client.emojiError + ' Necesitas escribir un mensaje para enviar.')
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
            }
            return message.reply({ content: txt, allowedMentions: { parse: ['users'], repliedUser: false } });
        }

        if (!canal || !message.guild.channels.cache.has(canal.id)) {
            let e = new MessageEmbed()
            e.setColor('ORANGE')
            e.setDescription('' + client.emojiError + ' Necesitas mencionar un canal y colocar un mensaje')
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        if (!message.guild.channels.cache.has(canal.id)) {
            let e = new MessageEmbed();
            e.setColor("GREEN");
            e.setDescription(`${client.emojiError} Necesitas mencionar un **__canal__** de este servidor.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
        /* CLIENT_PERMISSIONS START */
        let client_permissions = new MessageEmbed();
        client_permissions.setColor("GREEN");

        if (!canal.permissionsFor(client.user).has("VIEW_CHANNEL")) {
            client_permissions.setDescription("" + client.emojiError + " No tengo permisos para ver el canal mencionado.");
            return message.reply({ embeds: [client_permissions], allowedMentions: { repliedUser: false } });
        }
        if (!canal.permissionsFor(client.user).has("SEND_MESSAGES")) {
            client_permissions.setDescription("" + client.emojiError + " No tengo permisos para enviar mensajes en el canal mencionado.");
            return message.reply({ embeds: [client_permissions], allowedMentions: { repliedUser: false } });
        }
        /* CLIENT_PERMISSIONS END */
        /* USER_PERMISSIONS START */
        let user_permissions = new MessageEmbed();
        user_permissions.setColor("GREEN");
        if (!canal.permissionsFor(message.member).has("VIEW_CHANNEL")) {
            user_permissions.setDescription("" + client.emojiError + " No tienes permisos para ver el canal mencionado.");
            return message.reply({ embeds: [user_permissions], allowedMentions: { repliedUser: false } });
        }
        if (!canal.permissionsFor(message.member).has("SEND_MESSAGES")) {
            user_permissions.setDescription("" + client.emojiError + " No tienes permisos para enviar mensajes en el canal mencionado.");
            return message.reply({ embeds: [user_permissions], allowedMentions: { repliedUser: false } });
        }
        /* USER_PERMISSIONS END */

        let texto = args.join(" ")
        if (!texto || !args[1]) {
            let e = new MessageEmbed()
            e.setColor('ORANGE')
            e.setDescription(`${client.emojiError} Necesitas escribir un mensaje para enviar.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }, allowedMentions: { repliedUser: false } })
        }

        let f = new MessageEmbed()
        f.setColor('GREEN')
        f.setDescription(`${client.emojiSuccess} Mensaje enviado en el canal **${canal}**`)
        message.reply({ embeds: [f], allowedMentions: { repliedUser: true } });
        return message.guild.channels.cache.get(canal.id).send({ content: texto.replace(canal, ""), allowedMentions: { parse: ['users'], repliedUser: false } });
    }
});