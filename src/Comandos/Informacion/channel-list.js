const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index"), { Util } = require("discord.js");

module.exports = new Comando({
    nombre: "channel-list",
    alias: ["channellist", "channelist", "server-channels", "channels"],
    descripcion: "Muestra una lista de canales que el miembro que mencionaste puede ver.",
    categoria: "Información",
    ejemplo: "$channel-list [@user]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!" }
        if (!message.guild) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} Este es el unico canal que puedo ver.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        let text = "";
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!member || !message.guild.members.cache.has(member.id)) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} Necesitas mencionar a un usuario para ver la lista de canales que el puede ver.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        if (member.user.bot) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiBot} No puedes ver los canales de los bots.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let botRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
        let rolePosition = message.guild.members.cache.get(member.id).roles.highest.position;
        let userRolePossition = message.member.roles.highest.position;

        if (userRolePossition < rolePosition) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedes ver los canales de ese miembro porque tiene roles que son más altos que los tuyos.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } })
        }
        if (botRolePossition < rolePosition) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedo ver los canales de ese miembro porque tiene roles que son más altos que los mios.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } })
        }

        if (member.id === message.author.id) {
            const si_id = new DiscordUtils().button_id_generator(20);
            const no_id = new DiscordUtils().button_id_generator(20);
            const button_unlock = new MessageActionRow().addComponents(
                new MessageButton().setEmoji(client.emojiSuccessId).setLabel("Si").setCustomId(si_id).setStyle("SUCCESS"),
                new MessageButton().setEmoji(client.emojiErrorId).setLabel("No").setCustomId(no_id).setStyle("DANGER"), );

            const button_lock = new MessageActionRow().addComponents(
                new MessageButton().setEmoji(client.emojiSuccessId).setLabel("Si").setCustomId(si_id).setStyle("SUCCESS").setDisabled(true),
                new MessageButton().setEmoji(client.emojiErrorId).setLabel("No").setCustomId(no_id).setStyle("DANGER").setDisabled(true), );

            let warning_embed = new MessageEmbed();
            warning_embed.setColor(client.colorDefault);
            warning_embed.setDescription(`${client.warning} Mostraras todos tus canales si ejecutas este comando **__sin mencionar ningún usuario__**! **deseas continuar?**`);
            return message.reply({ embeds: [warning_embed], allowedMentions: { repliedUser: false }, components: [button_unlock] }).then(async (msg) => {
                let filter = x => x.user.id == message.author.id;
                const opciones = msg.channel.createMessageComponentCollector({ filter });

                opciones.on('collect', async (btn) => {
                    switch (btn.customId) {
                        case si_id:
                            let col;
                            if (member) {
                                col = message.guild.channels.cache.filter(c => c.type === "GUILD_CATEGORY" ? (c.children.some(r => r.permissionsFor(member).has("VIEW_CHANNEL"))) : (c.permissionsFor(member).has("VIEW_CHANNEL")));

                            } else {
                                if (args[0]) member = await message.guild.members.fetch(args[1]).catch(err => {});
                                if (member) col = message.guild.channels.cache.filter(c => c.type === "GUILD_CATEGORY" ? (c.children.some(r => r.permissionsFor(member).has("VIEW_CHANNEL"))) : (c.permissionsFor(member).has("VIEW_CHANNEL")));

                                else col = message.guild.channels.cache;
                            }
                            const wocat = Util.discordSort(col.filter(c => !c.parent && c.type !== "GUILD_CATEGORY"))
                            const textnp = wocat.filter(c => ['GUILD_TEXT', 'GUILD_STORE', 'GUILD_NEWS'].includes(c.type));
                            const voicenp = wocat.filter(c => c.type === "GUILD_VOICE");

                            if (wocat.size >= 1) {
                                text += textnp.map(new DiscordUtils().advanced_channels_map).join("\n");
                                text += voicenp.map(new DiscordUtils().advanced_channels_map).join("\n");
                            };

                            let cats = Util.discordSort(col.filter(c => c.type == "GUILD_CATEGORY"));
                            cats.each(c => {
                                const children = c.children.intersect(col);
                                const textp = children.filter(c => ['GUILD_TEXT', 'GUILD_STORE', 'GUILD_NEWS'].includes(c.type));
                                const voicep = children.filter(c => c.type == "GUILD_VOICE");
                                text += `\n[📂] **${c.name}**`;
                                text += textp.size ? ("\n\t" + Util.discordSort(textp).map(new DiscordUtils().advanced_channels_map).join("\n\t")) : ""
                                text += voicep.size ? ("\n\t" + Util.discordSort(voicep).map(new DiscordUtils().advanced_channels_map).join("\n\t")) : ""
                            })
                            const split = new DiscordUtils().split_texto(text, 2000)
                            await message.channel.send(`\nEstructura de los canales que puedes ver, **${member.user.username}**`)
                            for (let mensaje of split) {
                                await msg.delete()
                                return await message.channel.send(mensaje)
                            }
                            break;
                        case no_id:
                            return msg.edit({
                                embeds: [new MessageEmbed().setColor(client.colorDefault).setDescription(`${client.emojiSuccess} El sistema fue cancelado correctamente.`)],
                                components: []
                            })
                            break;
                    }
                });
            });
        }

        let col;
        if (member) {
            col = message.guild.channels.cache.filter(c => c.type === "GUILD_CATEGORY" ? (c.children.some(r => r.permissionsFor(member).has("VIEW_CHANNEL"))) : (c.permissionsFor(member).has("VIEW_CHANNEL")));

        } else {
            if (args[0]) member = await message.guild.members.fetch(args[1]).catch(err => {});
            if (member) col = message.guild.channels.cache.filter(c => c.type === "GUILD_CATEGORY" ? (c.children.some(r => r.permissionsFor(member).has("VIEW_CHANNEL"))) : (c.permissionsFor(member).has("VIEW_CHANNEL")));

            else col = message.guild.channels.cache;
        }
        const wocat = Util.discordSort(col.filter(c => !c.parent && c.type !== "GUILD_CATEGORY"))
        const textnp = wocat.filter(c => ['GUILD_TEXT', 'GUILD_STORE', 'GUILD_NEWS'].includes(c.type));
        const voicenp = wocat.filter(c => c.type === "GUILD_VOICE");
        if (wocat.size >= 1) {
            text += textnp.map(new DiscordUtils().advanced_channels_map()).join("\n");
            text += voicenp.map(new DiscordUtils().advanced_channels_map()).join("\n");
        };

        let cats = Util.discordSort(col.filter(c => c.type == "GUILD_CATEGORY"));
        cats.each(c => {
            const children = c.children.intersect(col);
            const textp = children.filter(c => ['GUILD_TEXT', 'GUILD_STORE', 'GUILD_NEWS'].includes(c.type));
            const voicep = children.filter(c => c.type === "GUILD_VOICE");
            text += `\n[📂] **${c.name}**`;
            text += textp.size ? ("\n\t" + Util.discordSort(textp).map(new DiscordUtils().advanced_channels_map()).join("\n\t")) : ""
            text += voicep.size ? ("\n\t" + Util.discordSort(voicep).map(new DiscordUtils().advanced_channels_map()).join("\n\t")) : ""
        })

        const split = new DiscordUtils().split_texto(text, 2000)
        await message.channel.send(`\nEstructura de los canales que puede ver el miembro **${member.user.username}**`)
        for (let mensaje of split) {
            await message.delete()
            return await message.channel.send(mensaje)
        }
    }
});