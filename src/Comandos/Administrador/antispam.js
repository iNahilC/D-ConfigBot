const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

/*
-+-+-+-+-+ SISTEMAS -+-+-+-+-+

[+] encender el antispam
[+] apagar el antispam
[+] canal de logs para el sistema de antispam
[+] ignorar bots
[+] ignorar roles
[+] ignorar usuarios
[+] ignorar canales
[+] detección de invitaciones
[+] remover mensajes al ser detectados.

-+-+-+-+-+ SISTEMAS -+-+-+-+-+  
*/

module.exports = new Comando({
    nombre: "antispam",
    alias: ["anti-spam"],
    descripcion: "Establece un sistema de antispam en tu servidor, con detección de caracteres duplicados, mensajes en poco tiempo, múltiples menciones, detección de invitaciones y mucho mas.",
    categoria: "Administrador",
    ejemplo: "$antispam",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }
        let logs = await client.db.get(`${message.guild.id}.logs_channel`);
        let lchannel = message.guild.channels.cache.get(logs);
        if (!lchannel) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
            await client.db.delete(`${message.guild.id}.logs_channel`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!args[0]) {
            let e = new MessageEmbed();
            const roles_bot_left = new DiscordUtils().button_id_generator(20);
            const roles_bot_x = new DiscordUtils().button_id_generator(20);
            const roles_bot_right = new DiscordUtils().button_id_generator(20);
            const roles_bot_left_lock = new DiscordUtils().button_id_generator(20);
            const roles_bot_x_lock = new DiscordUtils().button_id_generator(20);
            const roles_bot_right_lock = new DiscordUtils().button_id_generator(20);

            let buttons_unlock = new MessageActionRow().addComponents(
                new MessageButton().setEmoji(client.arrow_left_id).setCustomId(roles_bot_left).setStyle('DANGER'),
                new MessageButton().setEmoji(client.cancel_emote_id).setCustomId(roles_bot_x).setStyle('DANGER'),
                new MessageButton().setEmoji(client.arrow_right_id).setCustomId(roles_bot_right).setStyle('DANGER'), );


            let buttons_lock = new MessageActionRow().addComponents(
                new MessageButton().setEmoji(client.arrow_left_id).setCustomId(roles_bot_right_lock).setStyle('DANGER').setDisabled(true),
                new MessageButton().setEmoji(client.cancel_emote_id).setCustomId(roles_bot_x_lock).setStyle('DANGER').setDisabled(true),
                new MessageButton().setEmoji(client.arrow_right_id).setCustomId(roles_bot_left_lock).setStyle('DANGER').setDisabled(true), );


            let embeds = [ /* PAGE 1*/
                    `
* 1- ${prefix}antispam on
> Activa el sistema de antispam

* 2- ${prefix}antispam off
> Desactiva el sistema de antispam

* 3- ${prefix}antispam logs #channel
> Establece un canal de logs para las advertencias generadas por los usuarios.

* 4- ${prefix}antispam ignoreChannel -add #channel
> Agrega a un canal a lista de canales ignorados.

* 5- ${prefix}antispam ignoreChannel -remove #channel
> Remueve un canal de la lista de canales ignorados.

* 6- ${prefix}antispam ignoreChannel -list
> Mira la lista de los canales ignorados.

* 7- ${prefix}antispam ignoreRoles -add @rol
> Agrega un rol a la lista de roles ignorados

* 8- ${prefix}antispam ignoreRoles -remove @rol
> Remueve un rol de la lista de roles ignorados.`, /* PAGE 2*/ `
* 9- ${prefix}antispam ignoreRoles -list
> Mira la lista de los roles ignorados.

* 10- ${prefix}antispam ignoreUsers -add @usuario
> Agrega un usuario a la lista de usuarios ignorados.

* 11- ${prefix}antispam ignoreUsers -remove @usuario
> Remueve un usuario de la lista de usuarios ignorados.

* 12- ${prefix}antispam ignoreUsers -list
> Mira la lista de los usuarios ignorados.

* 13- ${prefix}antispam ignoreBots -true
> Activa la detección de bots para el sistema de antispam.

* 14- ${prefix}antispam ignoreBots -false
> Desactiva la detección de bots para el sistema de antispam

* 15- ${prefix}antispam invites -true
> Activa la detección de invitaciones para el sistema de antispam.

* 16- ${prefix}antispam invites -false
> Desactiva la detección de invitaciones para el sistema de antispam.`, /* PAGE 3*/ `
* 17- ${prefix}antispam invites -list
> Mira la lista de las invitaciones ignoradas.

* 18- ${prefix}antispam removeMessages -true
> Activa la opción de remover los mensajes que sean detectados como spam.

* 19- ${prefix}antispam removeMessages -false
> Desactiva la opción de remover los mensajes que sean detectados como spam.

* 20- ${prefix}antispam duplicados -true
> Activa la opción para detectar los mensajes con más de 8 caracteres duplicados.

* 21- ${prefix}antispam duplicados -false
> Desactiva la opción para detectar los mensajes con más de 8 caracteres duplicados.

* 22- ${prefix}antispam messagesInterval
> Establece el tiempo mínimo en cual un mensaje se considera como spam (En Milisegundos), Por defecto los mensajes se consideran spam en 1700 milisegundos (1.7 segundos).
`
                ],
                pos = 0
            e.setColor(client.colorDefault);
            e.setThumbnail(client.thumbnailGIF);
            e.setDescription(`
**D-Configbot [\`Anti-Spam\`]**

\`\`\`md
${embeds[0]}
\`\`\``).setFooter({ text: `Pagina 1 de ${embeds.length}` })
            let msg = await message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            if (embeds.length == 1) return;
            await msg.edit({ embeds: [e], components: [buttons_unlock] });

            let filter = x => x.user.id == message.author.id;
            let collector = await msg.channel.createMessageComponentCollector({
                filter,
                idle: 30000,
                errors: ["idle"]
            });

            await collector.on("collect", async (btn) => {
                switch (btn.customId) {
                    case roles_bot_left:
                        pos = pos <= 0 ? (embeds.length - 1) : pos - 1
                        break;
                    case roles_bot_x:
                        collector.stop("x");
                        break;
                    case roles_bot_right:
                        pos = pos >= embeds.length - 1 ? 0 : pos + 1
                        break;
                }
                let embed_page = new MessageEmbed();
                embed_page.setColor(client.colorDefault);
                embed_page.setThumbnail(client.thumbnailGIF);
                embed_page.setDescription(`
    **D-Configbot [\`Anti-Spam\`]**

\`\`\`md
${embeds[pos]}
\`\`\``).setFooter({ text: `Pagina ${pos+1} de ${embeds.length}` });
                await msg.edit({
                    embeds: [embed_page],
                    components: [buttons_unlock]
                }).catch(error => {});
            });

            await collector.on("end", (_, reason) => {
                if (reason === "x") {
                    msg.delete().catch(error => {})
                    if (message.deletable) return message.delete()
                } else {
                    let embed_page = new MessageEmbed();
                    embed_page.setColor(client.colorDefault);
                    embed_page.setThumbnail(client.thumbnailGIF);
                    embed_page.setDescription(`
**D-Configbot [\`Anti-Spam\`]**

\`\`\`md
${embeds[pos]}
\`\`\``).setFooter({ text: `Pagina ${pos+1} de ${embeds.length}` });
                    return msg.edit({
                        embeds: [embed_page],
                        components: [buttons_lock]
                    })
                }
            });
        } else if ([
                "on",
                "activar"
            ].includes(args[0].toLowerCase())) {
            if (await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** ya esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            let button_url = new MessageActionRow().addComponents(
                new MessageButton()
                .setStyle("LINK")
                .setURL(message.url)
                .setLabel(`Irl al mensaje del Administrador ${message.author.username}`), )
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiSuccess} El sistema de **__antispam__** acaba de ser activado correctamente.`);
            lchannel.send({
                content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Activado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Activado en el canal
> #${message.channel.name}
\`\`\``,
                components: [button_url]
            });
            await client.db.set(`${message.guild.id}.antispam`, {})
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        } else if ([
                "off",
                "desactivar"
            ].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** aún no esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            const si_id = new DiscordUtils().button_id_generator(20);
            const no_id = new DiscordUtils().button_id_generator(20);

            const si_y_no = new MessageActionRow().addComponents(
                new MessageButton()
                .setEmoji(client.emojiSuccessId)
                .setLabel('Si')
                .setStyle("SUCCESS")
                .setCustomId(si_id),

                new MessageButton()
                .setEmoji(client.emojiErrorId)
                .setLabel('No')
                .setStyle("DANGER")
                .setCustomId(no_id), );

            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiSuccess} __Estás seguro de desactivar el sistema de antispam__? Toda tu configuración establecida hasta ahora será eliminada.`);
            let msg = await message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            await msg.edit({
                embeds: [e],
                components: [si_y_no],
            });

            let filter = x => x.author.id === message.author.id;
            let collector = await msg.channel.createMessageComponentCollector({
                filter,
                time: 30000,
                errors: ["time"]
            });

            await collector.on("collect", async (btn) => {
                switch (btn.customId) {
                    case si_id:
                        let accept_embed = new MessageEmbed();
                        accept_embed.setColor(client.colorDefault);
                        accept_embed.setDescription(`${client.emojiError} El sistema de **__antispam__** fue desactivado correctamente.`);
                        await client.db.delete(`${message.guild.id}.antispam`);
                        await msg.edit({
                            embeds: [accept_embed],
                            components: []
                        });

                        let button_url = new MessageActionRow().addComponents(
                            new MessageButton()
                            .setStyle('LINK')
                            .setURL(message.url)
                            .setLabel(`Ir al mensaje del Administrador ${message.author.username}`), )
                        return lchannel.send({
                            content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Desactivado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Desactivado en el canal
> #${message.channel.name}
\`\`\`                  `,
                            code: "md",
                            components: [button_url]
                        });
                        break;
                    case no_id:
                        let deni_embed = new MessageEmbed();
                        deni_embed.setColor(client.colorDefault);
                        deni_embed.setDescription(`${client.emojiSuccess} El sistema de desactivación fue cancelado correctamente.`);
                        collector.stop();
                        return msg.edit({
                            embed: deni_embed,
                            components: []
                        });
                        break;
                }
            });
            await collector.on("end", async (reason) => {
                if (reason !== "x") {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El sistema fue cancelado por inactividad, Tienes hasta __30 segundos__ para responder.`);
                    return msg.edit({
                        embed: e,
                        components: []
                    });
                }
            });
        } else if ([
                "logs",
                "logs_channel",
                "mod_log",
                "mod-logs"
            ].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** aún no esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let canal = message.guild.channels.cache.find(r => r.name.toLowerCase() === args.slice(1).join(' ').toLowerCase()) || message.guild.channels.cache.get(args[1]) || message.mentions.channels.first();
            if (!canal) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas mencionar un canal para establecerlo como canal de logs en el sistema de **__antispam__**.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (!message.guild.channels.cache.has(canal.id)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas mencionar un canal para establecerlo como canal de logs en el sistema de **__antispam__**.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            let antispam_logs_channel = await client.db.has(`${message.guild.id}.antispam.antispam_logs_channel`);
            if (antispam_logs_channel == canal.id) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El canal ${canal} ya se encuentra establecido en la base de datos.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            /* CLIENT_PERMISSIONS START */
            let client_permissions = new MessageEmbed();
            client_permissions.setColor(client.colorDefault);
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
            user_permissions.setColor(client.colorDefault);

            if (!canal.permissionsFor(message.member).has("VIEW_CHANNEL")) {
                user_permissions.setDescription("" + client.emojiError + " No tienes permisos para ver el canal mencionado.");
                return message.reply({ embeds: [user_permissions], allowedMentions: { repliedUser: false } });
            }
            if (!canal.permissionsFor(message.member).has("SEND_MESSAGES")) {
                user_permissions.setDescription("" + client.emojiError + " No tienes permisos para enviar mensajes en el canal mencionado.");
                return message.reply({ embeds: [user_permissions], allowedMentions: { repliedUser: false } });
            }
            /* USER_PERMISSIONS END */
            let button_msg_url = new MessageActionRow().addComponents(
                new MessageButton()
                .setStyle("LINK")
                .setURL(message.url)
                .setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );

            let new_logs_channel_embed = new MessageEmbed();
            new_logs_channel_embed.setColor(client.colorDefault);
            new_logs_channel_embed.setDescription(`${client.emojiSuccess} El canal de logs para el sistema de **__antispam__** fue correctamente establecido en ${canal}.`);
            message.reply({ embeds: [new_logs_channel_embed], allowedMentions: { repliedUser: false } });
            await client.db.set(`${message.guild.id}.antispam.antispam_logs_channel`, canal.id);
            return message.guild.channels.cache.get(canal.id).send({
                content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Logs Channel | Add]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Canal Establecido
> #${canal.name}
\`\`\``,
                components: [button_msg_url]
            });
        } else if ([
                "ignorechannel",
                "ignorechannels",
            ].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** aún no esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
            }
            let antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
            if (!antispam_logs) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
            }
            let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
            if (!antispam_logs_channel) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
            }
            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** ignoreChannel \`-add\`    #channel -> Para **agregar** un canal a la lista de canales ignorados.
    **${prefix}antispam** ignoreChannel \`-remove\` #channel -> Para **remover** un canal de la lista de canales ignorados.
    **${prefix}antispam** ignoreChannel \`-list\`   #channel -> Para **ver** los canales agregados a la lista de canales ignorados.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
            } else if (![
                    "-add",
                    "-agregar",
                    "add",
                    "agregar",
                    "-rm",
                    "-remove",
                    "-remover",
                    "remove",
                    "remover",
                    "rm",
                    "-list",
                    "-lista",
                    "list",
                    "lista"
                ].includes(args[1].toLowerCase())) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** ignoreChannel \`-add\`    #channel -> Para **agregar** un canal a la lista de canales ignorados.
    **${prefix}antispam** ignoreChannel \`-remove\` #channel -> Para **remover** un canal de la lista de canales ignorados.
    **${prefix}antispam** ignoreChannel \`-list\`   #channel -> Para **ver** los canales agregados a la lista de canales ignorados.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
            } else if ([
                    "-add",
                    "-agregar",
                    "add",
                    "agregar"
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.ignored_channels`)) await client.db.set(`${message.guild.id}.antispam.ignored_channels`, new Array());
                let ignored_channels_array = await client.db.get(`${message.guild.id}.antispam.ignored_channels`);
                if (ignored_channels_array.length >= 50) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Este servidor __ya ha alcanzado el limite__ de canales ignorados.`)
                    e.setFooter({ text: `Puedes remover un canal escribiendo en el chat: ${prefix}antispam ignoreChannel -remove #channel` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
                }
                let canal = message.guild.channels.cache.find(r => r.name.toLowerCase() === args.slice(2).join(' ').toLowerCase()) || message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
                if (!canal) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar un canal __valido__ para agregarlo al sistema de ****__antispam__****.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
                }
                if (!message.guild.channels.cache.has(canal.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar un canal __valido__ para agregarlo al sistema de ****__antispam__****.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
                }
                if (!canal.isText()) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar un canal de texto __valido__ para agregarlo al sistema de ****__antispam__****.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
                }
                for (var i = 0; i < ignored_channels_array.length; i++) {
                    if (canal.id == ignored_channels_array[i]) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} El canal ${canal} ya está __establecido__ en el sistema de **__antispam__**.`);
                        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
                    }
                }
                /* CLIENT_PERMISSIONS START */
                let client_permissions = new MessageEmbed();
                client_permissions.setColor(client.colorDefault);

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
                user_permissions.setColor(client.colorDefault);

                if (!canal.permissionsFor(message.member).has("VIEW_CHANNEL")) {
                    user_permissions.setDescription("" + client.emojiError + " No tienes permisos para ver el canal mencionado.");
                    return message.reply({ embeds: [user_permissions], allowedMentions: { repliedUser: false } });
                }
                if (!canal.permissionsFor(message.member).has("SEND_MESSAGES")) {
                    user_permissions.setDescription("" + client.emojiError + " No tienes permisos para enviar mensajes en el canal mencionado.");
                    return message.reply({ embeds: [user_permissions], allowedMentions: { repliedUser: false } });
                }
                /* USER_PERMISSIONS END */
                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setStyle("LINK")
                    .setURL(message.url)
                    .setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                await client.db.push(`${message.guild.id}.antispam.ignored_channels`, canal.id);
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Channels | Add]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Canal Agregado
> #${canal.name}

* Agregado en el canal
> #${message.channel.name}
\`\`\``,
                    components: [button_msg_url]
                });
                let ignoredChannel_add_embed = new MessageEmbed();
                ignoredChannel_add_embed.setColor(client.colorDefault);
                ignoredChannel_add_embed.setDescription(`${client.emojiSuccess} El canal ${canal} fue agregado correctamente.`);
                return message.reply({ embeds: [ignoredChannel_add_embed], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-rm",
                    "-remove",
                    "-remover",
                    "remove",
                    "remover",
                    "rm"
                ].includes(args[1].toLowerCase())) {
                let canal = message.guild.channels.cache.find(r => r.name.toLowerCase() === args.slice(2).join(' ').toLowerCase()) || message.guild.channels.cache.get(args[2].replace("<#", "").replace(">", "")) || message.guild.channels.cache.get(args[2]);
                if (!await client.db.has(`${message.guild.id}.antispam.ignored_channels`)) await client.db.set(`${message.guild.id}.antispam.ignored_channels`, new Array());
                let ignored_channels_array = await client.db.get(`${message.guild.id}.antispam.ignored_channels`);
                if (ignored_channels_array.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay canales para **remover** del sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar un canal escribiendo en el chat: ${prefix}antispam ignoreChannel -add #channel` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (!canal) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar un canal para removerlo del sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let verificadorarray = "";
                ignored_channels_array.forEach(res => {
                    if (!verificadorarray.includes(`${res}`)) verificadorarray += `${res}, `
                });
                if (!verificadorarray.includes(canal.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El canal ${canal.id} no está registrado en el sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar un canal escribiendo en el chat: ${prefix}antispam ignoreChannel -add ${canal}` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                for (var i = 0; i < ignored_channels_array.length; i++) {
                    if (ignored_channels_array[i] == canal.id) {
                        let button_msg_url = new MessageActionRow().addComponents(
                            new MessageButton()
                            .setStyle("LINK")
                            .setURL(message.url)
                            .setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                        await client.db.pull(`${message.guild.id}.antispam.ignored_channels`, canal.id);
                        antispam_logs_channel.send({
                            content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Channels | Remove]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Canal Removido
> #${canal.name}

* Removido en el canal
> #${message.channel.name}
\`\`\``,
                            components: [button_msg_url]
                        });
                        let ignoredChannel_remove_embed = new MessageEmbed();
                        ignoredChannel_remove_embed.setColor(client.colorDefault);
                        ignoredChannel_remove_embed.setDescription(`${client.emojiSuccess} El canal ${canal} fue removido correctamente.`);
                        return message.reply({ embeds: [ignoredChannel_remove_embed], allowedMentions: { repliedUser: false } })
                    }
                }
            } else if ([
                    "-list",
                    "-lista",
                    "list",
                    "lista"
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.ignored_channels`)) await client.db.set(`${message.guild.id}.antispam.ignored_channels`, new Array());
                let ignored_channels_array = await client.db.get(`${message.guild.id}.antispam`);
                console.log(ignored_channels_array)
                if (ignored_channels_array.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay canales para **visualizar** en el sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar un canal escribiendo en el chat: ${prefix}antispam ignoreChannel -add #channel` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                for (var i = 0; i < ignored_channels_array.length; i++) {
                    if (!message.guild.channels.cache.has(ignored_channels_array[i])) {
                        await client.db.pull(`${message.guild.id}.antispam.ignored_channels`, ignored_channels_array[i]);
                    }
                }

                let updated_ignored_channels_array = await client.db.get(`${message.guild.id}.antispam.ignored_channels`);
                if (updated_ignored_channels_array.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay canales para **visualizar** en el sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar un canal escribiendo en el chat: ${prefix}antispam ignoreChannel -add #channel` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }

                let ignored_channels = await client.db.get(`${message.guild.id}.antispam.ignored_channels`);
                let ignored_channels_map = ignored_channels.map((id, key) => [key, id]);
                if (ignored_channels_map) {
                    let channels_list_array = new Array(),
                        channels_list_embed = new MessageEmbed(),
                        index = 1;
                    while (ignored_channels_map.length > 0) channels_list_array.push(ignored_channels_map.splice(0, 10).map(u => `${index++}# | #${message.guild.channels.cache.get(u[1]).name || "Canal Eliminado"} | ${u[1]}`));
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

                    channels_list_embed.setColor(client.colorDefault);
                    channels_list_embed.setFooter({ text: `Pagina 1 de ${channels_list_array.length}` })
                    channels_list_embed.setDescription(`
    ${client.emojiSuccess} __Nombre de los **${updated_ignored_channels_array.length}/50** canales ignorados por el sistema de **antispam**__.

\`\`\`
${channels_list_array[0].join("\n")}
\`\`\``);
                    let msg = await message.reply({ embeds: [channels_list_embed], allowedMentions: { repliedUser: false } });
                    if (channels_list_array.length == 1) return;
                    await msg.edit({
                        embeds: [channels_list_embed],
                        components: [buttons_unlock]
                    }).catch(err => {});

                    let pageindex = 0
                    let filter = x => x.user.id == message.author.id;
                    let collector = await msg.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        errors: ["idle"]
                    });

                    collector.on('collect', async (btn) => {
                        switch (btn.customId) {
                            case roles_bot_left:
                                pageindex = pageindex <= 0 ? (channels_list_array.length - 1) : pageindex - 1
                                break;
                            case roles_bot_x:
                                collector.stop('x');
                                break;
                            case roles_bot_right:
                                pageindex = pageindex >= channels_list_array.length - 1 ? 0 : pageindex + 1
                                break;
                        }

                        let embed_ = new MessageEmbed();
                        embed_.setColor(client.colorDefault);
                        embed_.setFooter({ text: `Pagina ${pageindex+1} de ${channels_list_array.length}` })
                        embed_.setDescription(`
    ${client.emojiSuccess} __Nombre de los **${updated_ignored_channels_array.length}/50** canales ignorados por el sistema de **antispam**__.

\`\`\`
${channels_list_array[pageindex].join(", ")}
\`\`\``);
                        await msg.edit({
                            embeds: [embed_],
                            components: [buttons_unlock]
                        });
                    });

                    collector.on('end', (reason) => {
                        let embed_ = new MessageEmbed();
                        embed_.setColor(client.colorDefault);
                        embed_.setFooter({ text: `Pagina ${pageindex+1} de ${channels_list_array.length}` })
                        embed_.setDescription(`
    ${client.emojiSuccess} __Nombre de los **${updated_ignored_channels_array.length}/50** canales ignorados por el sistema de **antispam**__.

\`\`\`
${channels_list_array[pageindex].join(", ")}
\`\`\``);
                        if (reason == 'x') {
                            msg.delete().catch(error => {});
                            if (message.deletable) message.delete();
                        } else {
                            return msg.edit({
                                embeds: [embed_],
                                components: [buttons_lock]
                            });
                        }
                    });
                };
            }
        } else if ([
                "ignorebots",
                "ignorebot",
            ].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.antispam.ignore_bots`)) await client.db.set(`${message.guild.id}.antispam.ignore_bots`, false);
            let ignore_bots = await client.db.get(`${message.guild.id}.antispam.ignore_bots`)
            if (!await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** aún no esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
            if (!antispam_logs) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
            if (!antispam_logs_channel) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** ignoreBots \`-true\` Para **activar** la detección de bots en el sistema de **__antispam__**.
    **${prefix}antispam** ignoreBots \`-false\` Para **desactivar** la detección de bots en el sistema de **__antispam__**.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if (![
                    "-true",
                    "-activar",
                    "true",
                    "activar",
                    "-false",
                    "-desactivar",
                    "false",
                    "desactivar",
                    "on",
                    "off"
                ].includes(args[1].toLowerCase())) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** ignoreBots \`-true\` Para **activar** la detección de bots en el sistema de **__antispam__**.
    **${prefix}antispam** ignoreBots \`-false\` Para **desactivar** la detección de bots en el sistema de **__antispam__**.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-true",
                    "-activar",
                    "true",
                    "activar",
                    "on"
                ].includes(args[1].toLowerCase())) {
                if (ignore_bots === true) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La detección de bots ya está __activada__ en el sistema de **__antispam__**.`);
                    e.setFooter({ text: `Para desactivar la detección de bots escribe en el chat: ${prefix}antispam ignoreBots false` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                await client.db.set(`${message.guild.id}.antispam.ignore_bots`, true)
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Bots | Activado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Activado en el canal
> #${message.channel.name}
\`\`\``,
                    components: [button_msg_url]
                });
                let ignore_bots_true_embed = new MessageEmbed();
                ignore_bots_true_embed.setColor(client.colorDefault);
                ignore_bots_true_embed.setDescription(`${client.emojiSuccess} La detección de bots acaba de ser correctamente __activada__.`);
                return message.reply({ embeds: [ignore_bots_true_embed], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-false",
                    "-desactivar",
                    "false",
                    "desactivar",
                    "off"
                ].includes(args[1].toLowerCase())) {
                if (ignore_bots === false) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La detección de bots ya está __desactivada__ en el sistema de **__antispam__**.`);
                    e.setFooter({ text: `Para desactivar la detección de bots escribe en el chat: ${prefix}antispam ignoreBots true` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                await client.db.set(`${message.guild.id}.antispam.ignore_bots`, false);
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Bots | Desactivado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Desactivado en el canal
> #${message.channel.name}\`\`\``,
                    components: [button_msg_url]
                });
                let ignore_bots_true_embed = new MessageEmbed();
                ignore_bots_true_embed.setColor(client.colorDefault);
                ignore_bots_true_embed.setDescription(`${client.emojiSuccess} La detección de bots acaba de ser correctamente __desactivada__.`);
                return message.reply({ embeds: [ignore_bots_true_embed], allowedMentions: { repliedUser: false } });
            }
        } else if ([
                "removemessages",
            ].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.antispam.remove_messages`)) await client.db.set(`${message.guild.id}.antispam.remove_messages`, true)
            let remove_messages = await client.db.get(`${message.guild.id}.antispam.remove_messages`);
            if (!await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** aún no esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
            if (!antispam_logs) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
            if (!antispam_logs_channel) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** removeMessages \`-true\` Para **remover** los mensajes detectados como spam.
    **${prefix}antispam** removeMessages \`-false\` Para **no remover** los mensajes detectados como spam.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if (![
                    "-true",
                    "-activar",
                    "true",
                    "activar",
                    "-false",
                    "-desactivar",
                    "false",
                    "desactivar",
                    "on",
                    "off"
                ].includes(args[1].toLowerCase())) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** removeMessages \`-true\` Para **remover** los mensajes detectados como spam.
    **${prefix}antispam** removeMessages \`-false\` Para **no remover** los mensajes detectados como spam.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-true",
                    "-activar",
                    "true",
                    "activar",
                    "on"
                ].includes(args[1].toLowerCase())) {
                let remove_messages = await client.db.get(`${message.guild.id}.antispam.remove_messages`);
                if (remove_messages === true) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La opción para eliminar los mensajes cuando sean detectados como spam ya está **__activada__**.`);
                    e.setFooter({ text: `Para desactivar la opción para eliminar los mensajes escribe en el chat: ${prefix}antispam removeMessages -false` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                await client.db.set(`${message.guild.id}.antispam.remove_messages`, true)
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Remove Messages | Activado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Activado en el canal
> #${message.channel.name}\`\`\``,
                    components: [button_msg_url]
                });
                let remove_messages_embed_true = new MessageEmbed();
                remove_messages_embed_true.setColor(client.colorDefault);
                remove_messages_embed_true.setDescription(`${client.emojiSuccess} Ahora los mensajes que sean detectados por el sistema de **__antispam__** serán **eliminados** por el bot.`);
                return message.reply({ embeds: [remove_messages_embed_true], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-false",
                    "-desactivar",
                    "false",
                    "desactivar",
                    "off"
                ].includes(args[1].toLowerCase())) {
                let remove_messages = await client.db.get(`${message.guild.id}.antispam.remove_messages`);
                if (remove_messages === false) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La opción para eliminar los mensajes cuando sean detectados como spam ya está **__desactivada__**.`);
                    e.setFooter({ text: `Para desactivar la opción para eliminar los mensajes escribe en el chat: ${prefix}antispam removeMessages -false` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                await client.db.set(`${message.guild.id}.antispam.remove_messages`, false);
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Remove Messages | Desactivado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Desactivado en el canal
> #${message.channel.name}\`\`\``,
                    components: [button_msg_url]
                });

                let remove_messages_embed_false = new MessageEmbed();
                remove_messages_embed_false.setColor(client.colorDefault);
                remove_messages_embed_false.setDescription(`${client.emojiSuccess} Ahora los mensajes que sean detectados por el sistema de **__antispam__ no** serán **eliminados** por el bot.`);
                return message.reply({ embeds: [remove_messages_embed_false], allowedMentions: { repliedUser: false } });
            }
        } else if ([
                "ignorerole",
                "ignoreroles",
                "ignorerol",
            ].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.antispam.ignored_roles`)) await client.db.set(`${message.guild.id}.antispam.ignored_roles`, new Array());
            let remove_roles = await client.db.get(`${message.guild.id}.antispam.ignored_roles`);
            if (!await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** aún no esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
            if (!antispam_logs) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
            if (!antispam_logs_channel) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** ignoreRoles \`-add\`    @rol -> Para **agregar** un rol a la lista de canales ignorados.
    **${prefix}antispam** ignoreRoles \`-remove\` @rol -> Para **remover** un rol de la lista de canales ignorados.
    **${prefix}antispam** ignoreRoles \`-list\`   @rol -> Para **ver** los rol agregados a la lista de canales ignorados.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if (![
                    "-add",
                    "-agregar",
                    "add",
                    "agregar",
                    "-rm",
                    "-remove",
                    "-remover",
                    "remove",
                    "remover",
                    "rm",
                    "-list",
                    "-lista",
                    "list",
                    "lista"
                ].includes(args[1].toLowerCase())) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** ignoreRoles \`-add\`    @rol -> Para **agregar** un rol a la lista de canales ignorados.
    **${prefix}antispam** ignoreRoles \`-remove\` @rol -> Para **remover** un rol de la lista de canales ignorados.
    **${prefix}antispam** ignoreRoles \`-list\`   @rol -> Para **ver** los rol agregados a la lista de canales ignorados.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-add",
                    "-agregar",
                    "add",
                    "agregar",
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.ignored_roles`)) await client.db.set(`${message.guild.id}.antispam.ignored_roles`, new Array());
                let obtener_rol = message.guild.roles.cache.find(x => x.name.toLowerCase() === args.slice(2).join(' ').toLowerCase()) || message.mentions.roles.first() || message.guild.roles.cache.get(args[2]),
                    ignored_roles_array = await client.db.get(`${message.guild.id}.antispam.ignored_roles`),
                    verificadorarray = "",
                    antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
                if (!antispam_logs) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                    e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
                if (!antispam_logs_channel) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                    e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                    await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (ignored_roles_array.length >= 50) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Este servidor __ya ha alcanzado el limite__ de roles ignorados.`);
                    e.setFooter({ text: `Puedes remover un rol escribiendo en el chat: ${prefix}antispam ignoreRoles -remove @rol` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (!obtener_rol) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar el rol que quieres __agregar__ a la lista de roles ignorados por el sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }

                if (!message.guild.roles.cache.has(obtener_rol.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar el rol que quieres __agregar__ a la lista de roles ignorados por el sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (obtener_rol.id == message.guild.id) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No se puede agregar ni remover el rol <@&${message.guild.id}>`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                for (var i = 0; i < ignored_roles_array.length; i++) {
                    if (obtener_rol.id == ignored_roles_array[i]) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} El Rol ${obtener_rol} ya está establecido en el sistema de **__antispam__**.`);
                        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                    }
                }

                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );

                let embed_add = new MessageEmbed();
                embed_add.setColor(client.colorDefault);
                embed_add.setDescription(`${client.emojiSuccess} El rol ${obtener_rol} fue __agregado correctamente__.`);
                await client.db.push(`${message.guild.id}.antispam.ignored_roles`, obtener_rol.id);
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Roles | Add]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Rol Agregado
> ${obtener_rol.name}

* Agregado en el canal
> #${message.channel.name}\`\`\``,
                    components: [button_msg_url]
                });
                return message.reply({ embeds: [embed_add], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-rm",
                    "-remove",
                    "-remover",
                    "remove",
                    "remover",
                    "rm",
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.ignored_roles`)) await client.db.set(`${message.guild.id}.antispam.ignored_roles`, new Array());
                let obtener_rol = message.guild.roles.cache.find(x => x.name.toLowerCase() === args.slice(2).join(' ').toLowerCase()) || message.mentions.roles.first() || message.guild.roles.cache.get(args[2]),
                    ignored_roles_array = await client.db.get(`${message.guild.id}.antispam.ignored_roles`),
                    verificadorarray = "",
                    antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
                if (!antispam_logs) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                    e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
                if (!antispam_logs_channel) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                    e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                    await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (ignored_roles_array.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay roles para **remover** del sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar un rol escribiendo en el chat: ${prefix}antispam ignoreRoles -add @rol` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (!obtener_rol) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar el rol que quieres __remover__ de la lista de roles ignorados por el sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (!message.guild.roles.cache.has(obtener_rol.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar el rol que quieres __remover__ de la lista de roles ignorados por el sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }

                if (obtener_rol.id == message.guild.id) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No se puede agregar ni remover el rol <@&${message.guild.id}>`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                ignored_roles_array.forEach(roles => {
                    if (!verificadorarray.includes(`${roles}`)) verificadorarray += `${roles}, `
                });
                if (!verificadorarray.includes(obtener_rol.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El Rol ${obtener_rol} **no** está establecido en el sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                for (var i = 0; i < ignored_roles_array.length; i++) {
                    if (obtener_rol.id == ignored_roles_array[i]) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} El Rol ${obtener_rol} acaba de ser removido correctamente del sistema de **__antispam__**.`);
                        let button_msg_url = new MessageActionRow().addComponents(
                            new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                        await client.db.pull(`${message.guild.id}.antispam.ignored_roles`, obtener_rol.id);
                        antispam_logs_channel.send({
                            content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Roles | Remove]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Rol Removido
> ${obtener_rol.name}

* Agregado en el canal
> #${message.channel.name}\`\`\``,
                            components: [button_msg_url]
                        });
                        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                    }
                }
            } else if ([
                    "-list",
                    "-lista",
                    "list",
                    "lista"
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.ignored_roles`)) await client.db.set(`${message.guild.id}.antispam.ignored_channels`, new Array());
                let ignored_roles_array = await client.db.get(`${message.guild.id}.antispam.ignored_roles`);
                if (ignored_roles_array.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay roles para **__visualizar__** en el sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar un rol escribiendo en el chat: ${prefix}antispam ignoreRoles -add @rol` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                for (var i = 0; i < ignored_roles_array.length; i++) {
                    if (!message.guild.roles.cache.has(ignored_roles_array[i])) {
                        await client.db.pull(`${message.guild.id}.antispam.ignored_roles`, ignored_roles_array[i]);
                    }
                }
                let updated_ignored_roles_array = await client.db.get(`${message.guild.id}.antispam.ignored_roles`);
                if (updated_ignored_roles_array.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay roles para **__visualizar__** en el sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar un rol escribiendo en el chat: ${prefix}antispam ignoreRoles -add @rol` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }

                let ignored_roles_map = await client.db.get(`${message.guild.id}.antispam.ignored_roles`).map((id, key) => [key, id]);
                if (ignored_roles_map) {
                    let roles_list_array = new Array(),
                        roles_list_embed = new MessageEmbed(),
                        index = 1;
                    while (ignored_roles_map.length > 0) roles_list_array.push(ignored_roles_map.splice(0, 10).map(u => `${index++}# | ${message.guild.roles.cache.get(u[1]).name} | ${u[1]}`));
                    const roles_bot_left = new DiscordUtils().button_id_generator(20);
                    const roles_bot_x = new DiscordUtils().button_id_generator(20);
                    const roles_bot_right = new DiscordUtils().button_id_generator(20);
                    const roles_bot_left_lock = new DiscordUtils().button_id_generator(20);
                    const roles_bot_x_lock = new DiscordUtils().button_id_generator(20);
                    const roles_bot_right_lock = new DiscordUtils().button_id_generator(20);

                    let buttons_unlock = new MessageActionRow().addComponents(
                        new MessageButton().setLabel("←").setCustomId(roles_bot_left).setStyle('PRIMARY'),
                        new MessageButton().setLabel("❌").setCustomId(roles_bot_x).setStyle('DANGER'),
                        new MessageButton().setLabel("→").setCustomId(roles_bot_right).setStyle('PRIMARY'), )

                    let buttons_lock = new MessageActionRow().addComponents(
                        new MessageButton().setLabel("←").setCustomId(roles_bot_left_lock).setStyle('PRIMARY').setDisabled(true),
                        new MessageButton().setLabel("❌").setCustomId(roles_bot_x_lock).setStyle('DANGER').setDisabled(true),
                        new MessageButton().setLabel("→").setCustomId(roles_bot_right_lock).setStyle('PRIMARY').setDisabled(true), );

                    roles_list_embed.setColor(client.colorDefault);
                    roles_list_embed.setFooter({ text: `Pagina 1 de ${roles_list_array.length}` })
                    roles_list_embed.setDescription(`
    ${client.emojiSuccess} __Nombre de los **${updated_ignored_roles_array.length}/50** roles ignorados por el sistema de **antispam**__.

\`\`\`
${roles_list_array[0].join("\n")}
\`\`\``);
                    let msg = await message.reply({ embeds: [roles_list_embed], allowedMentions: { repliedUser: false } });
                    if (roles_list_array.length == 1) return;
                    await msg.edit({ embeds: [roles_list_embed], components: [buttons_unlock] }).catch(err => {});
                    let pageindex = 0,
                        filter = x => x.user.id == message.author.id;
                    let collector = await msg.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        errors: ["idle"]
                    });

                    collector.on('collect', async (btn) => {
                        switch (btn.customId) {
                            case roles_bot_left:
                                pageindex = pageindex <= 0 ? (roles_list_array.length - 1) : pageindex - 1
                                break;
                            case roles_bot_x:
                                collector.stop('x');
                                break;
                            case roles_bot_right:
                                pageindex = pageindex >= roles_list_array.length - 1 ? 0 : pageindex + 1
                                break;
                        }

                        let embed_ = new MessageEmbed();
                        embed_.setColor(client.colorDefault);
                        embed_.setFooter({ text: `Pagina ${pageindex+1} de ${roles_list_array.length}` })
                        embed_.setDescription(`
    ${client.emojiSuccess} __Nombre de los **${updated_ignored_roles_array.length}/50** roles ignorados por el sistema de **antispam**__.

\`\`\`
${roles_list_array[pageindex].join(", ")}
\`\`\``);
                        await msg.edit({ embeds: [embed_], components: [buttons_unlock] });
                    });

                    collector.on('end', (reason) => {
                        let embed_ = new MessageEmbed();
                        embed_.setColor(client.colorDefault);
                        embed_.setFooter({ text: `Pagina ${pageindex+1} de ${roles_list_array.length}` })
                        embed_.setDescription(`
    ${client.emojiSuccess} __Nombre de los **${updated_ignored_roles_array.length}/50** roles ignorados por el sistema de **antispam**__.

\`\`\`
${roles_list_array[pageindex].join(", ")}
\`\`\``);
                        if (reason == 'x') {
                            if (msg.deletable) msg.delete().catch(error => {});
                            if (message.deletable) return message.delete().catch(error => {});
                        }

                        return msg.edit({ embeds: [embed_], components: [buttons_lock] });
                    });
                };
            }
        } else if ([
                "invites",
                "invitaciones"
            ].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.antispam.invites_detect`)) await client.db.set(`${message.guild.id}.antispam.invites_detect`, true);
            let detectar_invitaciones = await client.db.get(`${message.guild.id}.antispam.invites_detect`);
            if (!await client.db.has(`${message.guild.id}.antispam.invitaciones`)) await client.db.set(`${message.guild.id}.antispam.invitaciones`, new Array());
            let invitaciones_list = await client.db.get(`${message.guild.id}.antispam.invitaciones`);
            if (!await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** aún no esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
            if (!antispam_logs) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
            if (!antispam_logs_channel) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** invites \`-true\`   -> Para **encender** la detección de invitaciones.
    **${prefix}antispam** invites \`-false\`  -> Para **apagar** apagar la detección de invitaciones.
    **${prefix}antispam** invites \`-add\`    [invitación] -> Para **agregar** una invitación al sistema de **__antispam__**
    **${prefix}antispam** invites \`-remove\` [invitación] -> Para **remover** una invitación al sistema de **__antispam__**
    **${prefix}antispam** invites \`-list\`   [invitación] -> Para **ver** una lista de invitaciones agregadas al sistema de **__antispam__**.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if (![
                    "-true",
                    "-activar",
                    "true",
                    "activar",
                    "-false",
                    "-desactivar",
                    "false",
                    "desactivar",
                    "on",
                    "off",
                    "-add",
                    "-agregar",
                    "add",
                    "agregar",
                    "-rm",
                    "-remove",
                    "-remover",
                    "remove",
                    "remover",
                    "rm",
                    "-list",
                    "-lista",
                    "list",
                    "lista"
                ].includes(args[1].toLowerCase())) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** invites \`-true\`   -> Para **encender** la detección de invitaciones.
    **${prefix}antispam** invites \`-false\`  -> Para **apagar** apagar la detección de invitaciones.
    **${prefix}antispam** invites \`-add\`    [invitación] -> Para **agregar** una invitación al sistema de **__antispam__**
    **${prefix}antispam** invites \`-remove\` [invitación] -> Para **remover** una invitación al sistema de **__antispam__**
    **${prefix}antispam** invites \`-list\`   [invitación] -> Para **ver** una lista de invitaciones agregadas al sistema de **__antispam__**.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-true",
                    "-activar",
                    "true",
                    "activar",
                    "on"
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.invites_detect`)) await client.db.set(`${message.guild.id}.antispam.invites_detect`, true);
                let detectar_invitaciones = await client.db.get(`${message.guild.id}.antispam.invites_detect`);
                if (detectar_invitaciones == true) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La detección de invitaciones ya está __activada__.`);
                    e.setFooter({ text: `Puedes agregar una invitación a la whitelist con: ${prefix}antispam invites -add [invitación]` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiSuccess} La detección de invitaciones ha sido __activada__ correctamente.`);
                e.setFooter({ text: `Puedes agregar una invitación a la whitelist con: ${prefix}antispam invites -add [invitación]` });
                await client.db.set(`${message.guild.id}.antispam.invites_detect`, true);
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Invitaciones | Activado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Activado en el canal
> #${message.channel.name}
\`\`\``,
                    components: [button_msg_url]
                });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-false",
                    "-desactivar",
                    "false",
                    "desactivar",
                    "off"
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.invites_detect`)) await client.db.set(`${message.guild.id}.antispam.invites_detect`, true);
                let detectar_invitaciones = await client.db.get(`${message.guild.id}.antispam.invites_detect`);
                if (detectar_invitaciones == false) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La detección de invitaciones ya está __desactivada__.`);
                    e.setFooter({ text: `Puedes activar la detección de invitaciones escribiendo en el chat: ${prefix}antispam invites -false` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiSuccess} La detección de invitaciones ha sido __desactivada__ correctamente.`);
                e.setFooter({ text: `Puedes activar la detección de invitaciones escribiendo en el chat: ${prefix}antispam invites -false` });
                await client.db.set(`${message.guild.id}.antispam.invites_detect`, false);
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Invitaciones | Desactivado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Desactivado en el canal
> #${message.channel.name}
\`\`\``,
                    components: [button_msg_url]
                });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-add",
                    "-agregar",
                    "add",
                    "agregar"
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.invites_detect`)) await client.db.set(`${message.guild.id}.antispam.invites_detect`, true);
                let detectar_invitaciones = await client.db.get(`${message.guild.id}.antispam.invites_detect`);
                if (!await client.db.has(`${message.guild.id}.antispam.invitaciones`)) await client.db.set(`${message.guild.id}.antispam.invitaciones`, new Array());
                let invites_list_array = await client.db.get(`${message.guild.id}.antispam.invitaciones`);
                let invitacion = args.slice(2).join(" ");
                if (invites_list_array.length >= 80) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Este servidor __ya ha alcanzado el limite__ de invitación.`);
                    e.setFooter({ text: `Puedes remover una invitación escribiendo en el chat: ${prefix}antispam invites -remove [invitación]` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (detectar_invitaciones == false) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La detección de invitaciones aún __no esta activada__.`);
                    e.setFooter({ text: `Puedes activar la detección de invitaciones escribiendo en el chat: ${prefix}antispam invites -true` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (!invitacion) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas escribir el link de la invitación que quieres agregar.`);
                    e.setFooter({ text: `Recuerda que las invitaciones de este servidor no son detectadas.` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                for (var i = 0; i < invites_list_array.length; i++) {
                    if (invitacion == invites_list_array[i].url) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} La invitación __${invites_list_array[i].url}__ ya está agregada.`);
                        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                    }
                }
                client.fetchInvite(invitacion).then(async (inv) => {
                    if (inv.guild.id == message.guild.id) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} La invitación __${invitacion}__ es de este servidor, Las invitaciones de este servidor no serán detectadas automaticamente.`);
                        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                    }
                    await client.db.push(`${message.guild.id}.antispam.invitaciones`, {
                        url: inv.url,
                        name: inv.guild.name,
                        id: inv.guild.id
                    });
                    let button_msg_url = new MessageActionRow().addComponents(
                        new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiSuccess} La invitación __${inv.url}__ fue agregada correctamente.`);
                    antispam_logs_channel.send(`
\`\`\`md
# D-ConfigBot [Anti-Spam | Invitaciones | Add]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Invitación
> ${inv.url}

* Servidor de la invitación
> ${inv.guild.name} [ID: ${inv.guild.id}]

* Invitación agregada en el canal
> #${message.channel.name}
\`\`\``, {
                        code: "md",
                        components: [button_msg_url]
                    });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }).catch(err => {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La invitación ingresada no es valida.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                });
            } else if ([
                    "-rm",
                    "-remove",
                    "-remover",
                    "remove",
                    "remover",
                    "rm"
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.invites_detect`)) await client.db.set(`${message.guild.id}.antispam.invites_detect`, true);
                let detectar_invitaciones = await client.db.get(`${message.guild.id}.antispam.invites_detect`);
                if (!await client.db.has(`${message.guild.id}.antispam.invitaciones`)) await client.db.set(`${message.guild.id}.antispam.invitaciones`, new Array());
                let invites_list_array = await client.db.get(`${message.guild.id}.antispam.invitaciones`);
                let verificadorarray = "";
                let invitacion = args.slice(2).join(" ");
                if (detectar_invitaciones == false) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La detección de invitaciones aún __no esta activada__.`);
                    e.setFooter({ text: `Puedes activar la detección de invitaciones escribiendo en el chat: ${prefix}antispam invites -true` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (invites_list_array.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay invitaciones para **remover** del sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar una invitación escribiendo en el chat: ${prefix}antispam invites -add [invitación]` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (!invitacion) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas escribir el link de la invitación que quieres remover..`);
                    e.setFooter({ text: `Recuerda que las invitaciones de este servidor no son detectadas.` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                for (var i = 0; i < invites_list_array.length; i++) {
                    if (invitacion == invites_list_array[i].url) {
                        let e = new MessageEmbed();
                        let button_msg_url = new MessageActionRow().addComponents(
                            new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} La invitación __${invites_list_array[i].url}__ fue correctamente __removida__.`);
                        antispam_logs_channel.send({ content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Invitaciones | Remove]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Invitación
> ${invites_list_array[i].url}

* Servidor de la invitación
> ${invites_list_array[i].name} [ID: ${invites_list_array[i].id}]

* Invitación removida en el canal
> #${message.channel.name}
\`\`\``, components: [button_msg_url] });

                        let invites_map = await client.db.get(`${message.guild.id}.antispam.invitaciones`).filter((x) => x.url !== invites_list_array[i].url);
                        await client.db.set(`${message.guild.id}.antispam.invitaciones`, invites_map)
                        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                    }
                }
                invites_list_array.forEach(res => {
                    if (!verificadorarray.includes(res.url)) verificadorarray += `${res.url}, `
                });
                if (!verificadorarray.includes(invitacion.url)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La invitación __${invitacion}__ no esta establecida en la whitelist.`);
                    e.setFooter({ text: `Puedes agregar la invitación escribiendo en el chat: ${prefix}antispam invites -add ${invitacion}` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
            } else if ([
                    "-list",
                    "-lista",
                    "list",
                    "lista"
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.invites_detect`)) await client.db.set(`${message.guild.id}.antispam.invites_detect`, true);
                let detectar_invitaciones = await client.db.get(`${message.guild.id}.antispam.invites_detect`);
                if (!await client.db.has(`${message.guild.id}.antispam.invitaciones`)) await client.db.set(`${message.guild.id}.antispam.invitaciones`, new Array());
                let invites_list_array = await client.db.get(`${message.guild.id}.antispam.invitaciones`);
                if (detectar_invitaciones == false) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La detección de invitaciones aún __no esta activada__.`);
                    e.setFooter({ text: `Puedes activar la detección de invitaciones escribiendo en el chat: ${prefix}antispam invites -true` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (invites_list_array.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay invitaciones para **visualizar** del sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar una invitación escribiendo en el chat: ${prefix}antispam invites -add [invitación]` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }

                let invites_list_map = await client.db.get(`${message.guild.id}.antispam.invitaciones`).map((id, key) => [key, id]);
                if (invites_list_map) {
                    let invitaciones_list_array = new Array(),
                        invites_list_embed = new MessageEmbed(),
                        index = 1;
                    while (invites_list_map.length > 0) invitaciones_list_array.push(invites_list_map.splice(0, 10).map(u => `${index++}# | ${u[1].name} | ${u[1].url}`));
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


                    invites_list_embed.setColor(client.colorDefault);
                    invites_list_embed.setFooter({ text: `Pagina 1 de ${invitaciones_list_array.length}` })
                    invites_list_embed.setDescription(`
${client.emojiSuccess} __Lista de las **${invites_list_array.length}/80** invitaciones establecidas en la whitelist__.

\`\`\`
${invitaciones_list_array[0].join("\n")}
\`\`\``);
                    let msg = await message.reply({ embeds: [invites_list_embed], allowedMentions: { repliedUser: false } });
                    if (invitaciones_list_array.length == 1) return;
                    await msg.edit({
                        embeds: [invites_list_embed],
                        components: [buttons_unlock]
                    }).catch(err => {});

                    let pageindex = 0,
                        filter = x => x.user.id == message.author.id;
                    let collector = await msg.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        errors: ["idle"]
                    });

                    collector.on('collect', async (btn) => {
                        switch (btn.customId) {
                            case roles_bot_left:
                                pageindex = pageindex <= 0 ? (invitaciones_list_array.length - 1) : pageindex - 1
                                break;
                            case roles_bot_x:
                                collector.stop('x');
                                break;
                            case roles_bot_right:
                                pageindex = pageindex >= invitaciones_list_array.length - 1 ? 0 : pageindex + 1
                                break;
                        }

                        let embed_ = new MessageEmbed();
                        embed_.setColor(client.colorDefault);
                        embed_.setFooter({ text: `Pagina ${pageindex+1} de ${invitaciones_list_array.length}` })
                        embed_.setDescription(`
    ${client.emojiSuccess} __Lista de las **${invites_list_array.length}/80** invitaciones establecidas en la whitelist__.

\`\`\`
${invitaciones_list_array[pageindex].join("\n")}
\`\`\``);
                        await msg.edit({ embeds: [embed_], components: [buttons_unlock] });
                    });

                    collector.on('end', (reason) => {
                        let embed_ = new MessageEmbed();
                        embed_.setColor(client.colorDefault);
                        embed_.setFooter({ text: `Pagina ${pageindex+1} de ${invitaciones_list_array.length}` })
                        embed_.setDescription(`
    ${client.emojiSuccess} __Lista de las **${invites_list_array.length}/80** invitaciones establecidas en la whitelist__.

\`\`\`
${invitaciones_list_array[pageindex].join("\n")}
\`\`\``);
                        if (reason == "x") {
                            if (msg.deletable) msg.delete().catch(err => {})
                            if (message.deletable) return message.delete().catch(err => {})
                        }
                        return msg.edit({ embed: [embed_], components: [buttons_lock] });
                    });
                };
            }
        } else if ([
                "ignoreuser",
                "ignoreduser",
                "ignoredusers",
                "ignoreusers",
            ].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.antispam.ignored_users`)) await client.db.set(`${message.guild.id}.antispam.ignored_users`, new Array());
            let ignored_members_array = await client.db.get(`${message.guild.id}.antispam.ignored_users`);
            if (!await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** aún no esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
            if (!antispam_logs) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
            if (!antispam_logs_channel) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** ignoreUser \`-add\`    @usuario -> Para **agregar** un usuario a la lista de usuarios ignorados.
    **${prefix}antispam** ignoreUser \`-remove\` @usuario -> Para **remover** un usuario de la lista de usuarios ignorados.
    **${prefix}antispam** ignoreUser \`-list\`   @usuario -> Para **ver** los usuarios agregados a la lista de usuarios ignorados.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if (![
                    "-add",
                    "-agregar",
                    "add",
                    "agregar",
                    "-rm",
                    "-remove",
                    "-remover",
                    "remove",
                    "remover",
                    "rm",
                    "-list",
                    "-lista",
                    "list",
                    "lista"
                ].includes(args[1].toLowerCase())) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

    **${prefix}antispam** ignoreUser \`-add\`    @usuario -> Para **agregar** un usuario a la lista de usuarios ignorados.
    **${prefix}antispam** ignoreUser \`-remove\` @usuario -> Para **remover** un usuario de la lista de usuarios ignorados.
    **${prefix}antispam** ignoreUser \`-list\`   @usuario -> Para **ver** los usuarios agregados a la lista de usuarios ignorados.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-add",
                    "-agregar",
                    "add",
                    "agregar",
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.ignored_users`)) await client.db.set(`${message.guild.id}.antispam.ignored_users`, new Array());
                let obtener_usuario = message.guild.members.cache.find(x => x.displayName.toLowerCase().includes(args.slice(2).join(" ")) || x.user.username.toLowerCase().includes(args.slice(2).join(" ").toLowerCase())) || message.mentions.members.first() || message.guild.members.cache.get(args[2]),
                    ignored_users_array = await client.db.get(`${message.guild.id}.antispam.ignored_users`),
                    verificadorarray = "",
                    antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
                if (!antispam_logs) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                    e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
                if (!antispam_logs_channel) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                    e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                    await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (ignored_users_array.length >= 50) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Este servidor __ya ha alcanzado el limite__ de usuarios ignorados.`);
                    e.setFooter({ text: `Puedes remover un usuario escribiendo en el chat: ${prefix}antispam ignoreUser -remove @usuario` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (!obtener_usuario) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar el __usuario__ que quieres agregar a la lista de usuarios ignorados por el sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }

                if (!message.guild.members.cache.has(obtener_usuario.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar el __usuario__ que quieres agregar a la lista de usuarios ignorados por el sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }

                if (obtener_usuario.id == message.guild.id) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No se puede agregar ni remover el rol <@&${message.guild.id}>`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (obtener_usuario.id == client.user.id) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No puedes agregarme al sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (obtener_usuario.id == message.author.id) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No puedes agregarte al sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                for (var i = 0; i < ignored_users_array.length; i++) {
                    if (obtener_usuario.id == ignored_users_array[i]) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} El Usuario ${obtener_usuario} ya está establecido en el sistema de **__antispam__**.`);
                        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                    }
                }

                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );

                let embed_add = new MessageEmbed();
                embed_add.setColor(client.colorDefault);
                embed_add.setDescription(`${client.emojiSuccess} El usuario ${obtener_usuario} fue __agregado correctamente__.`);
                await client.db.push(`${message.guild.id}.antispam.ignored_users`, obtener_usuario.id);
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Users | Add]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Usuario Agregado
> ${obtener_usuario.user.tag} [ID: ${obtener_usuario.id}]

* Agregado en el canal
> #${message.channel.name}
\`\`\``,
                    components: [button_msg_url]
                });
                return message.reply({ embeds: [embed_add], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-rm",
                    "-remove",
                    "-remover",
                    "remove",
                    "remover",
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.ignored_users`)) await client.db.set(`${message.guild.id}.antispam.ignored_users`, new Array());
                let obtener_usuario = message.guild.members.cache.find(x => x.displayName.toLowerCase().includes(args.slice(2).join(" ")) || x.user.username.toLowerCase().includes(args.slice(2).join(" ").toLowerCase())) || message.mentions.members.first() || message.guild.members.cache.get(args[2]),
                    ignored_users_array = await client.db.get(`${message.guild.id}.antispam.ignored_users`),
                    verificadorarray = "",
                    antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
                if (!antispam_logs) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                    e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
                if (!antispam_logs_channel) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                    e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                    await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (ignored_users_array.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay usuarios para **remover** del sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar un usuario escribiendo en el chat: ${prefix}antispam ignoreUsers -add @rol` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (!obtener_usuario) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar el usuario que quieres remover de la lista de usuarios ignorados por el sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                if (!message.guild.members.cache.has(obtener_usuario.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar el usuario que quieres remover de la lista de usuarios ignorados por el sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                ignored_users_array.forEach(usuarios => {
                    if (!verificadorarray.includes(`${usuarios}`)) verificadorarray += `${usuarios}, `
                });
                if (!verificadorarray.includes(obtener_usuario.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El usuario ${obtener_usuario} **no** está establecido en el sistema de **__antispam__**.`);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                for (var i = 0; i < ignored_users_array.length; i++) {
                    if (obtener_usuario.id == ignored_users_array[i]) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} El usuario ${obtener_usuario} acaba de ser removido correctamente del sistema de **__antispam__**.`);
                        let button_msg_url = new MessageActionRow().addComponents(
                            new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                        await client.db.pull(`${message.guild.id}.antispam.ignored_users`, obtener_usuario.id);
                        antispam_logs_channel.send({
                            content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Ignore Users | Remove]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Usuario Removido
> ${obtener_usuario.user.tag} [ID: ${obtener_usuario.id}]

* Agregado en el canal
> #${message.channel.name}
\`\`\``,
                            components: [button_msg_url]
                        });
                        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                    }
                }
            } else if ([
                    "-list",
                    "-lista",
                    "list",
                    "lista"
                ].includes(args[1].toLowerCase())) {
                if (!await client.db.has(`${message.guild.id}.antispam.ignored_users`)) await client.db.set(`${message.guild.id}.antispam.ignored_users`, new Array());
                let ignored_users_array = await client.db.get(`${message.guild.id}.antispam.ignored_users`);
                if (ignored_users_array.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay usuarios para **__visualizar__** en el sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar un usuario escribiendo en el chat: ${prefix}antispam ignoreUsers -add @usuario` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }

                for (var i = 0; i < ignored_users_array.length; i++) {
                    if (!message.guild.members.cache.has(ignored_users_array[i])) {
                        await client.db.pull(`${message.guild.id}.antispam.ignored_users`, ignored_users_array[i]);
                    }
                }

                let updated_ignored_users_array = await client.db.get(`${message.guild.id}.antispam.ignored_users`);
                if (updated_ignored_users_array == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No hay usuarios para **__visualizar__** en el sistema de **__antispam__**.`);
                    e.setFooter({ text: `Puedes agregar un usuario escribiendo en el chat: ${prefix}antispam ignoreUsers -add @usuario` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }

                let ignored_users = await client.db.get(`${message.guild.id}.antispam.ignored_users`);
                let ignored_users_map = ignored_users.map((id, key) => [key, id]);
                if (ignored_users_map) {
                    let users_list_array = new Array(),
                        users_list_embed = new MessageEmbed(),
                        index = 1;
                    while (ignored_users_map.length > 0) users_list_array.push(ignored_users_map.splice(0, 10).map(u => `${index++}# | ${message.guild.members.cache.get(u[1]).user.tag} | ${u[1]}`));
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

                    users_list_embed.setColor(client.colorDefault);
                    users_list_embed.setFooter({ text: `Pagina 1 de ${users_list_array.length}` })
                    users_list_embed.setDescription(`
${client.emojiSuccess} __Nombre de los **${updated_ignored_users_array.length}/50** usuarios ignorados por el sistema de **antispam**__.

\`\`\`
${users_list_array[0].join("\n")}
\`\`\``);
                    let msg = await message.reply({ embeds: [users_list_embed], allowedMentions: { repliedUser: false } });
                    if (users_list_array.length == 1) return;
                    await msg.edit({ embeds: [users_list_embed], components: [buttons_unlock] }).catch(err => {});
                    let pageindex = 0,
                        filter = x => x.user.id == message.author.id;
                    let collector = await msg.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        errors: ["idle"]
                    });

                    collector.on('collect', async (btn) => {
                        switch (btn.customId) {
                            case roles_bot_left:
                                pageindex = pageindex <= 0 ? (users_list_array.length - 1) : pageindex - 1
                                break;
                            case roles_bot_x:
                                collector.stop('x');
                                break;
                            case roles_bot_right:
                                pageindex = pageindex >= users_list_array.length - 1 ? 0 : pageindex + 1
                                break;
                        }

                        let embed_ = new MessageEmbed();
                        embed_.setColor(client.colorDefault);
                        embed_.setFooter({ text: `Pagina ${pageindex+1} de ${users_list_array.length}` })
                        embed_.setDescription(`
${client.emojiSuccess} __Nombre de los **${updated_ignored_users_array.length}/50** usuarios ignorados por el sistema de **antispam**__.

\`\`\`
${users_list_array[pageindex].join(", ")}
\`\`\``);
                        await msg.edit({ embeds: [embed_], components: [buttons_unlock] });
                    });

                    collector.on('end', (reason) => {
                        let embed_ = new MessageEmbed();
                        embed_.setColor(client.colorDefault);
                        embed_.setFooter({ text: `Pagina ${pageindex+1} de ${users_list_array.length}` })
                        embed_.setDescription(`
${client.emojiSuccess} __Nombre de los **${updated_ignored_users_array.length}/50** usuarios ignorados por el sistema de **antispam**__._.

\`\`\`
${users_list_array[pageindex].join(", ")}
\`\`\``);
                        if (reason == 'x') { if (msg.deletable) msg.delete().catch(error => {}); if (message.deletable) return message.delete().catch(error => {}); }
                        return msg.edit({ embeds: [embed_], components: [buttons_lock] });
                    });
                }
            }
        } else if ([
                "duplicado",
                "duplicados"
            ].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.antispam.duplicados`)) await client.db.set(`${message.guild.id}.antispam.duplicados`, true);
            let duplicados_opción = await client.db.get(`${message.guild.id}.antispam.duplicados`);
            if (!await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** aún no esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
            if (!antispam_logs) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
            if (!antispam_logs_channel) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

**${prefix}antispam** duplicados \`-true\` Para **si** detectar los caracteres duplicados.
**${prefix}antispam** duplicados \`-false\` Para **no** detectar los caracteres duplicados.

Los mensajes que tengan un caracter duplicado __más de 8 veces__ será detectado como spam.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if (![
                    "-true",
                    "-activar",
                    "true",
                    "activar",
                    "-false",
                    "-desactivar",
                    "false",
                    "desactivar",
                    "on",
                    "off"
                ].includes(args[1].toLowerCase())) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar la **acción** que quieres hacer.

**${prefix}antispam** duplicados \`-true\` Para **si** detectar los caracteres duplicados.
**${prefix}antispam** duplicados \`-false\` Para **no** detectar los caracteres duplicados.

Los mensajes que tengan un caracter duplicado __más de 8 veces__ será detectado como spam.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-true",
                    "-activar",
                    "true",
                    "activar",
                    "on"
                ].includes(args[1].toLowerCase())) {
                if (duplicados_opción === true) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La opción para detectar los caracteres duplicados ya está **__activada__**.`);
                    e.setFooter({ text: `Para desactivar la opción para detectar los caracteres duplicados escribe en el chat: ${prefix}antispam duplicados -false` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                await client.db.set(`${message.guild.id}.antispam.duplicados`, true);
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Duplicados | Activado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Activado en el canal
> #${message.channel.name}
\`\`\``,
                    components: [button_msg_url]
                });
                let remove_messages_embed = new MessageEmbed();
                remove_messages_embed.setColor(client.colorDefault);
                remove_messages_embed.setDescription(`${client.emojiSuccess} La opción para detectar los caracteres duplicados ha sido correctamente **__activada__**.`);
                return message.reply({ embeds: [remove_messages_embed], allowedMentions: { repliedUser: false } });
            } else if ([
                    "-false",
                    "-desactivar",
                    "false",
                    "desactivar",
                    "off"
                ].includes(args[1].toLowerCase())) {
                if (duplicados_opción === false) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} La opción para detectar los caracteres duplicados ya está **__desactivada__**.`);
                    e.setFooter({ text: `Para activar la opción para detectar los caracteres duplicados escribe en el chat: ${prefix}antispam duplicados -true` });
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
                let button_msg_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
                await client.db.set(`${message.guild.id}.antispam.duplicados`, false);
                antispam_logs_channel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Duplicados | Desactivado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Desactivado en el canal
> #${message.channel.name}
\`\`\``,
                    components: [button_msg_url]
                });
                let remove_messages_embed = new MessageEmbed();
                remove_messages_embed.setColor(client.colorDefault);
                remove_messages_embed.setDescription(`${client.emojiSuccess} La opción para detectar los caracteres duplicados ha sido correctamente **__desactivada__**.`);
                return message.reply({ embeds: [remove_messages_embed], allowedMentions: { repliedUser: false } });
            }
        } else if ([
                "messageinterval",
                "messagesinterval",
            ].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.antispam.messagesInterval`)) await client.db.set(`${message.guild.id}.antispam.messagesInterval`, 1700);
            let message_interval_opción = await client.db.get(`${message.guild.id}.antispam.messagesInterval`);
            if (!await client.db.has(`${message.guild.id}.antispam`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de **__antispam__** aún no esta activado en este servidor.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
            if (!antispam_logs) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
            if (!antispam_logs_channel) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas establecer el canal de logs para completar el uso de este comando.`);
                e.setFooter({ text: `Puedes establecerlo escribiendo: ${prefix}antispam logs #channel` });
                await client.db.delete(`${message.guild.id}.antispam.logs_channel`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar tus **__milisegundos__** para detectar un mensaje como spam, Por defecto es **__1.7__** segundos (**__1700 milisegundos__**), El tiempo perfecto.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            if (isNaN(args[1])) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas especificar tus **__milisegundos__** para detectar un mensaje como spam, Por defecto es **__1.7__** segundos (**__1700 milisegundos__**), El tiempo perfecto.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            if (args[1] > 3000) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} No puedes establecer mas de **__3__** segundos (**__3000 milisegundos__**).`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            if (args[1] < 1000) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} No puedes establecer menos de un **__1__** segundo(**__1000 milisegundos__**).`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
            let button_msg_url = new MessageActionRow().addComponents(
                new MessageButton().setStyle("LINK").setURL(message.url).setLabel(`Ir al mensaje del Administrador ${message.author.username}`), );
            antispam_logs_channel.send({
                content: `
\`\`\`md
# D-ConfigBot [Anti-Spam | Messages Interval | Cambiado]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Tiempo Antiguo
> ${message_interval_opción}

* Tiempo Actual
> ${args[1]}

* Activado en el canal
> #${message.channel.name}
\`\`\``,
                components: [button_msg_url]
            });
            let remove_messages_embed = new MessageEmbed();
            remove_messages_embed.setColor(client.colorDefault);
            remove_messages_embed.setDescription(`${client.emojiSuccess} El intervalo para detectar los mensajes como spam ha sido cambiado \`${message_interval_opción}\` → \`${args[1]}\` **milisegundos**.`);
            await client.db.set(`${message.guild.id}.antispam.messagesInterval`, parseInt(args[1]));
            return message.reply({ embeds: [remove_messages_embed], allowedMentions: { repliedUser: false } });
        }
    }
});