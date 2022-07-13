const { Comando, MessageEmbed } = require("../../ConfigBot/index"), Discord = require('discord.js'), emojiNames = require("emoji-unicode-map"),
    emojiImages = require("emoji-img"), isUrl = require("is-url"), { parse } = require("twemoji-parser");

module.exports = new Comando({
    nombre: "emoji-create",
    alias: ["addemoji", "add-emoji", "createmoji", "emojicreate", "crearemoji", "crear-emoji", "createemoji", "create-emoji"],
    categoria: "Guardia",
    descripcion: "Crea un emoji para el servidor insertando una URL o mencionando un emoji para transferirlo a este servidor.",
    ejemplo: "$emojicreate [url | emoji] [nombre]",
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

        if (!message.guild.members.cache.get(client.user.id).permissions.has("MANAGE_EMOJIS_AND_STICKERS")) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} Necesito tener permisos de **Manejar Emojis** para poder completar el uso de este comando.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }


        let emojisCount = "";
        if (message.guild.premiumSubscriptionCount === 0) { emojisCount = 50; } else if (message.guild.premiumSubscriptionCount === 1) { emojisCount = 50; } else if (message.guild.premiumSubscriptionCount >= 2) { emojisCount = 100; } else if (message.guild.premiumSubscriptionCount >= 15) { emojisCount = 150; } else if (message.guild.premiumSubscriptionCount >= 30) { emojisCount = 250; }

        let resta_emojis_normal = emojisCount - message.guild.emojis.cache.filter(x => !x.animated).size;
        let restaemojis_gif = emojisCount - message.guild.emojis.cache.filter(x => x.animated).size;
        let type = "";
        let name = "";
        let emote = args.join(" ").match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi);

        if (emote) {
            emote = args[0];
            type = "emoji";
            name = args.join(" ").replace(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi, "").trim().split(" ")[0];
        } else {
            emote = `${args.find(arg => isUrl(arg))}`
            name = args.find(arg => arg != emote);
            type = "url";
        }
        let emoji = {
            name: ""
        };
        let Link;
        if (type == "emoji") {
            emoji = Discord.Util.parseEmoji(emote);
            Link = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`;
        } else {
            if (!name) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas escribir el nombre del emoji.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            Link = message.attachments.first() ? message.attachments.first().url : emote;
        }

        try {
            if (emoji.animated && message.guild.emojis.cache.filter(x => x.animated).size >= emojisCount) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El servidor ya está al limite de emojis **__animados__**. **__${message.guild.emojis.cache.filter(x => x.animated).size}/${emojisCount}__**`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if (!emoji.animated && message.guild.emojis.cache.filter(x => !x.animated).size >= emojisCount) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El servidor ya está al limite de emojis **__no animados__**. **__${message.guild.emojis.cache.filter(x => x.animated).size}/${emojisCount}__**`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            const Added = new MessageEmbed();
            Added.setColor(client.colorDefault);
            Added.setDescription(`${client.emojiSuccess} Se ha creado el emoji ${emoji.animated ? "**__animado__**" : "**__no animado__**"} **${name || `${emoji.name}`}**.`);
            Added.setThumbnail(Link)
            await message.guild.emojis.create(Link, name || emoji.name);
            message.reply({ embeds: [Added], allowedMentions: { repliedUser: false } });
        } catch (err) {
            console.log(err);
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} El __tamaño del emoji es demasiado grande__ o __es un emoji de Discord default__.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
    }
});