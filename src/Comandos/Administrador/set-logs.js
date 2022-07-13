const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "set-logs",
    alias: ["logs", "set-logs", "registros"],
    categoria: "Administrador",
    descripcion: "Este comando te permite ver los audit-logs que se ejecutan en el servidor y el bot mediante el canal que elijas",
    ejemplo: "$set-logs #channel || off || ignore #channel || ignore remove #channel",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!" }

        if (!message.guild.members.cache.get(client.user.id).permissions.has("VIEW_AUDIT_LOG")) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} Necesito el permiso de ver el **__registro de auditoría__** para activar los logs.`)
            e.setImage('https://media.discordapp.net/attachments/694731014110445568/779200512598999060/unknown.png')
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!args[0]) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`
\`\`\`md
# D-ConfigBot [Set Logs]

* ${prefix}set-logs #channel
> Activar

* ${prefix}set-logs #channel
> Desactivar

* ${prefix}set-logs ignore #channel
> Ignorar algún canal

* ${prefix}set-logs ignore -list
> Ver lista de los canales ignorados
\`\`\``);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (["ignore", "-ignore", "ignorar", "-ignorar"].includes(args[0].toLowerCase())) { //CHANNEL IGNORE
            if (!await client.db.has(`${message.guild.id}.logs_channel`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__logs__** no está activado en este servidor.`);
                e.setFooter({ text: `Puedes activar el canal de logs ejecutando el comando: ${prefix}set-logs #channel` });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            let logs = await client.db.get(`${message.guild.id}.logs_channel`);
            let lchannel = message.guild.channels.cache.get(logs);
            if (!lchannel) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${clien.emojiError} ${client.missing_logs_channel}`);
                client.db.delete(`${message.guild.id}.logs_channel`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (args[1] && ["-list", "list", "-lista", "lista"].includes(args[1].toLowerCase())) {
                let ignored_channels_map = client.db.get(`${message.guild.id}.ignored_channels`).map((id, key) => [key, id]);
                let ignored_channels_array = client.db.get(`${message.guild.id}.ignored_channels`);
                if (await client.db.get(`${message.guild.id}.ignored_channels`).length < 1) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Aún no hay canales ignorados por el sistema de **__logs__**`);
                    e.setFooter({ text: `Puedes agregar un canal a la lista de ignorados ejecutando el comando: ${prefix}set-logs ignore #channel` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }

                for (var i = 0; i < ignored_channels_array.length; i++) {
                    if (!message.guild.channels.cache.has(ignored_channels_array[i])) {
                        let extracted_array = client.db.get(`${message.guild.id}.ignored_channels`).filter(x => x !== ignored_channels_array[i]);
                        await client.db.set(`${message.guild.id}.ignored_channels`, extracted_array);
                    }
                }

                if (ignored_channels_map) {
                    let ignored_channels_list_array = new Array(), ignored_channels_list_embed = new MessageEmbed(), index = 1;
                    while (ignored_channels_map.length > 0) ignored_channels_list_array.push(ignored_channels_map.splice(0, 12).map(u => `* ${index++} | #${message.guild.channels.cache.get(u[1]).name} | ${u[1]}`));
                    const roles_bot_left = new DiscordUtils().button_id_generator(20);
                    const roles_bot_x = new DiscordUtils().button_id_generator(20);
                    const roles_bot_right = new DiscordUtils().button_id_generator(20);
                    const roles_bot_left_lock = new DiscordUtils().button_id_generator(20);
                    const roles_bot_x_lock = new DiscordUtils().button_id_generator(20);
                    const roles_bot_right_lock = new DiscordUtils().button_id_generator(20);
                    let buttons_unlock = new MessageActionRow().addComponents(
                        new MessageButton().setLabel("←").setCustomId(roles_bot_left).setStyle('PRIMARY'),
                        new MessageButton().setLabel("❌").setCustomId(roles_bot_x).setStyle('DANGER'),
                        new MessageButton().setLabel("→").setCustomId(roles_bot_right).setStyle('PRIMARY'), );

                    let buttons_lock = new MessageActionRow().addComponents( 
                        new MessageButton().setLabel("←").setCustomId(roles_bot_left_lock).setStyle('PRIMARY').setDisabled(true),
                        new MessageButton().setLabel("❌").setCustomId(roles_bot_x_lock).setStyle('DANGER').setDisabled(true),
                        new MessageButton().setLabel("→").setCustomId(roles_bot_right_lock).setStyle('PRIMARY').setDisabled(true), );

                    ignored_channels_list_embed.setColor(client.colorDefault);
                    ignored_channels_list_embed.setDescription(`
${client.emojiSuccess} __Lista de los **${ignored_channels_array.length}** canales ignorados por el sistema de logs__.

\`\`\`md
${ignored_channels_list_array[0].join("\n")}
\`\`\``);
                    let msg = await message.reply({ embeds: [ignored_channels_list_embed], allowedMentions: { repliedUser: false } });
                    if (ignored_channels_list_array.length == 1) return;
                    await msg.edit({ embeds: [ignored_channels_list_embed], components: [buttons_unlock] }).catch(err => {});

                    let pageindex = 0;
                    let filter_channels_ignored_list = x => x.user.id == message.author.id;

                    let collector = await msg.channel.createMessageComponentCollector({
                        filter_channels_ignored_list,
                        idle: 60000,
                        errors: ["idle"]
                    });

                    await collector.on('collect', async (btn) => {
                        switch (btn.customId) { 
                            case roles_bot_left:
                                pageindex = pageindex <= 0 ? (ignored_channels_list_array.length - 1) : pageindex - 1
                                let embed_left = new MessageEmbed();
                                embed_left.setColor(client.colorDefault);
                                embed_left.setFooter({ text: `Pagina ${pageindex+1} de ${ignored_channels_list_array.length}` })
                                embed_left.setDescription(`
${client.emojiSuccess} __Lista de los **${ignored_channels_array.length}** canales ignorados por el sistema de logs__.

\`\`\`md
${ignored_channels_list_array[pageindex].join("\n")}
\`\`\``);
                                msg.edit({ embeds: [embed_left], components: [buttons_unlock] });
                                break;
                            case roles_bot_x:
                                collector.stop('x');
                                if (message.deletable) message.delete();
                                if (msg.deletable) msg.delete();
                                break;
                            case roles_bot_right:
                                pageindex = pageindex >= ignored_channels_list_array.length - 1 ? 0 : pageindex + 1
                                let embed_right = new MessageEmbed();
                                embed_right.setColor(client.colorDefault);
                                embed_right.setFooter({ text: `Pagina ${pageindex+1} de ${ignored_channels_list_array.length}` })
                                embed_right.setDescription(`
${client.emojiSuccess} __Lista de los **${ignored_channels_array.length}** canales ignorados por el sistema de logs__.

\`\`\`md
${ignored_channels_list_array[pageindex].join("\n")}
\`\`\``);
                                msg.edit({ embeds: [embed_right], components: [buttons_unlock] });
                                break;
                        }

                    });

                    await collector.on('end', async (_, reason) => {
                        let embed_stop = new MessageEmbed();
                        embed_stop.setColor(client.colorDefault);
                        embed_stop.setFooter({ text: `Pagina ${pageindex+1} de ${ignored_channels_list_array.length}` })
                        embed_stop.setDescription(`
${client.emojiSuccess} __Lista de los **${ignored_channels_array.length}** canales ignorados por el sistema de logs__.

\`\`\`md
${ignored_channels_list_array[pageindex].join("\n")}
\`\`\``);
                        if (reason !== "x") return msg.edit({ embed: [embed_stop], components: [buttons_lock] });
                    });
                }
            }

            if (args[1] && ["-list", "list", "-lista", "lista"].includes(args[1].toLowerCase())) return;
            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas mencionar el canal que deseas que el bot ignore.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });                
            }
            let canal = message.guild.channels.cache.find(r => r.name.toLowerCase() === args[1].replace(" ", "-").toLowerCase()) || message.guild.channels.cache.get(args[1]) || message.mentions.channels.first();
            if (!canal || !message.guild.channels.cache.has(canal.id) | canal.type !== "GUILD_TEXT") {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas mencionar el canal que deseas que el bot ignore.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (!await client.db.has(`${message.guild.id}.ignored_channels`)) await client.db.set(`${message.guild.id}.ignored_channels`, new Array());
            if (await client.db.get(`${message.guild.id}.ignored_channels`).filter(x => x == canal.id).length >= 1) { //CHANNEL IGNORE REMOVE
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El canal ${canal} fue **__removido__** correctamente de la lista de canales ignorados.`);
                let array_filtered = client.db.get(`${message.guild.id}.ignored_channels`).filter(x => x !== canal.id);
                client.db.set(`${message.guild.id}.ignored_channels`, array_filtered);
                lchannel.send(`
\`\`\`md
# D-ConfigBot [Logs | Ignored Channels | Remove]

* Canal
> #${canal.name} [ID: ${canal.id}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]
\`\`\``)
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            let e = new MessageEmbed(); //CHANNEL IGNORE ADD
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiSuccess} El canal ${canal} fue **__agregado__** correctamente de la lista de canales ignorados.`);
            client.db.push(`${message.guild.id}.ignored_channels`, canal.id);
            lchannel.send(`
\`\`\`md
# D-ConfigBot [Logs | Ignored Channels | Add]

* Canal
> #${canal.name} [ID: ${canal.id}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]
\`\`\``)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let canal = message.guild.channels.cache.find(r => r.name.toLowerCase() === args[0].replace(" ", "-").toLowerCase()) || message.guild.channels.cache.get(args[0]) || message.mentions.channels.first();
        if (!canal || !message.guild.channels.cache.has(canal.id) || canal.type !== "GUILD_TEXT") {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar algún canal para ser establecido como **__canal__** **__de__** **__logs__**.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (await client.db.get(`${message.guild.id}.logs_channel`) == canal.id) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiSuccess} El canal ${canal} fue **__removido__** como canal de logs correctamente.`);
            client.db.delete(`${message.guild.id}.logs_channel`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!canal.permissionsFor(client.user).has("VIEW_CHANNEL")) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} No tengo permisos para ver el canal ${canal}.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false} });
        }

        if (!canal.permissionsFor(client.user).has("SEND_MESSAGES")) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} No tengo permisos para enviar mensajes en ${canal}.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false} });
        }

        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setDescription(`${client.emojiSuccess} El canal ${canal} fue **__establecido__** como canal de logs correctamente.`);
        client.db.set(`${message.guild.id}.logs_channel`, canal.id);
        message.guild.channels.cache.get(canal.id).send(`
\`\`\`md
# D-ConfigBot [Logs | Set Channel]

* Mensaje
> En este canal se enviaran mayoría de los cambios hechos en el servidor.

* Activado por el Moderador
> ${message.author.tag} [ID: ${message.author.id}]
\`\`\``)
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }
});