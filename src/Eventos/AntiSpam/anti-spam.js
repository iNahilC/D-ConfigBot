const { verificar } = require("../../utilidades/AntiSpam_Utility")
const { Evento, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Evento({
    nombre: "messageCreate",
    ejecutar: async (client, message) => {
        if (!message.guild) return;
        if (!await client.db.has(`${message.guild.id}.antispam`)) return;
        let u_permisos = await client.db.get(`${message.guild.id}.permisos.${message.author.id}`)
        if (u_permisos == 3) return;

        //ANTISPAM LOGS CHANNEL - START
        if (!await client.db.has(`${message.guild.id}.antispam.antispam_logs_channel`)) await client.db.set(`${message.guild.id}.antispam.antispam_logs_channel`, "");
        let antispam_logs = await client.db.get(`${message.guild.id}.antispam.antispam_logs_channel`);
        let antispam_logs_channel = message.guild.channels.cache.get(antispam_logs);
        if (!antispam_logs_channel) return await client.db.set(`${message.guild.id}.antispam.antispam_logs_channel`, {});
        //ANTISPAM LOGS CHANNEL - END

        //ANTISPAM REMOVE MESSAGES - START
        if (!await client.db.has(`${message.guild.id}.antispam.remove_messages`)) await client.db.set(`${message.guild.id}.remove_messages`, true);
        let remove_messages = await client.db.get(`${message.guild.id}.antispam.remove_messages`);
        //ANTISPAM REMOVE MESSAGES - END

        //ANTISPAM IGNORE BOTS - START
        if (!await client.db.has(`${message.guild.id}.antispam.ignore_bots`)) await client.db.set(`${message.guild.id}.antispam.ignore_bots`, false);
        let ignore_bots = await client.db.get(`${message.guild.id}.antispam.ignore_bots`);
        //ANTISPAM BOTS DETECTION - END

        //ANTISPAM IGNORED ROLES - START
        if (!await client.db.has(`${message.guild.id}.antispam.ignored_roles`)) await client.db.set(`${message.guild.id}.antispam.ignored_roles`, new Array());
        let ignored_roles_array = await client.db.get(`${message.guild.id}.antispam.ignored_roles`);
        //ANTISPAM IGNORE ROLES - END

        //ANTISPAM IGNORED CHANNELS - START
        if (!await client.db.has(`${message.guild.id}.antispam.ignored_channels`)) await client.db.set(`${message.guild.id}.antispam.ignored_channels`, new Array());
        let ignored_channels_array = await client.db.get(`${message.guild.id}.antispam.ignored_channels`);
        //ANTISPAM IGNORED CHANNELS - END

        //ANTISPAM IGNORED USERS - START
        if (!await client.db.has(`${message.guild.id}.antispam.ignored_users`)) await client.db.set(`${message.guild.id}.antispam.ignored_users`, new Array());
        let ignored_users_array = await client.db.get(`${message.guild.id}.antispam.ignored_users`);
        //ANTISPAM IGNORED USERS - END

        //ANTISPAM INVITES - START
        if (!await client.db.has(`${message.guild.id}.antispam.invites_detect`)) await client.db.set(`${message.guild.id}.antispam.invites_detect`, true);
        let detectar_invitaciones = await client.db.get(`${message.guild.id}.antispam.invites_detect`);
        //ANTISPAM INVITES - END

        //ANTISPAM INVITACIONES - START
        if (!await client.db.has(`${message.guild.id}.antispam.invitaciones`)) await client.db.set(`${message.guild.id}.antispam.invitaciones`, new Array());
        let invitaciones_list = await client.db.get(`${message.guild.id}.antispam.invitaciones`);
        //ANTISPAM INVITACIONES - END

        //ANTISPAM DUPLICADOS - START
        if (!await client.db.has(`${message.guild.id}.antispam.duplicados`)) await client.db.get(`${message.guild.id}.antispam.duplicados`, true);
        let duplicados_opcion = await client.db.get(`${message.guild.id}.antispam.duplicados`);
        //ANTISPAM DUPLICADOS - END

        //ANTISPAM MESSAGES INTERVAL - START
        if (!await client.db.has(`${message.guild.id}.antispam.messagesInterval`)) await client.db.set(`${message.guild.id}.antispam.messagesInterval`, 1700);
        let message_interval_opcion = await client.db.get(`${message.guild.id}.antispam.messagesInterval`);
        //ANTISPAM MESSAGES INTERVAL - END

        let datos = await verificar(message, {
            max_advertencias: 99,
            flood_puntos: 0,
            mencion_puntos: 0,
            duplicado: duplicados_opcion,
            invite_puntos: 0,
            messagesInterval: message_interval_opcion,
            mencionesCount: 3,
            ignore_bots: ignore_bots,
            invitaciones: detectar_invitaciones,
            usuarios: ignored_users_array,
            canales: ignored_channels_array,
            roles: ignored_roles_array,
            invites_list: invitaciones_list
        });

        if (datos) {
            if (datos.invitacion) {
                if (!await client.db.has(`${message.guild.id}.antispam.invitaciones_count`)) await client.db.set(`${message.guild.id}.antispam.invitaciones_count`, 0);
                await client.db.add(`${message.guild.id}.antispam.invitaciones_count`, 1);
                let invitaciones_count = await client.db.get(`${message.guild.id}.antispam.invitaciones_count`);
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} ${message.author} No está permitido enviar invitaciones de otros servidores!`);
                antispam_logs_channel.send(`
\`\`\`md
# D-ConfigBot [Anti-Spam | Invitacion | Detectada #${invitaciones_count}]

* Usuario
> ${message.author.tag} [ID: ${message.author.id}]

* Canal
> #${message.channel.name} [ID: ${message.channel.id}]

* Invitacion
> ${datos.invitacion.url}

* Servidor
> ${datos.invitacion.servidor} [ID: ${datos.invitacion.id}]
\`\`\``);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }}).then(async (msg) => {
                    if (message.deletable && remove_messages == true) setTimeout(() => message.delete(), 1000);
                    setTimeout(() => msg.delete(), 2000);
                });
            } else if (datos.mencion) {
                if (!await client.db.has(`${message.guild.id}.antispam.menciones_count`)) await client.db.set(`${message.guild.id}.antispam.menciones_count`, 0);
                await client.db.add(`${message.guild.id}.antispam.menciones_count`, 1);
                let invitaciones_count = await client.db.get(`${message.guild.id}.antispam.menciones_count`);
                antispam_logs_channel.send(`
\`\`\`md
# D-ConfigBot [Anti-Spam | Menciones | Detectado #${invitaciones_count}]

* Usuario
> ${message.author.tag} [ID: ${message.author.id}]

* Canal
> #${message.channel.name} [ID: ${message.channel.id}]

* Cantidad de menciones
> ${datos.mencion.cantidad}

* Mensaje
/*${message.content.length < 500 ? message.content : message.content.slice(0, 500)+"..."}*/
\`\`\``);
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} No puedes hacer spam de menciones en este servidor!`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }}).then(async (msg) => {
                    if (message.deletable && remove_messages == true) setTimeout(() => message.delete(), 1000);
                    setTimeout(() => msg.delete(), 2000);
                })
            } else if (datos.flood) {
                message.channel.messages.fetch({
                    limit: datos.flood.cantidad
                }).then(async (messages) => {
                    const userMessages = messages.filter(message => message.author.id)
                    if (!await client.db.has(`${message.guild.id}.antispam.flood_count`)) await client.db.set(`${message.guild.id}.antispam.flood_count`, 0);
                    await client.db.add(`${message.guild.id}.antispam.flood_count`, 1);
                    let flood_count = await client.db.get(`${message.guild.id}.antispam.flood_count`);
                    let text = "";
                    for (let [key, value] of userMessages) {
                        text += `\n${value.author.tag}: ${value.content || value.embeds[0].description}\n`;
                    }
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} ${message.author} Descansa! enviaste **__${datos.flood.cantidad}__** mensajes en **__${datos.flood.tiempo}__**`);
                    antispam_logs_channel.send(`
\`\`\`md
# D-ConfigBot [Anti-Spam | Flood | Detectado #${flood_count}]

* Usuario
> ${message.author.tag} [ID: ${message.author.id}]

* Canal
> #${message.channel.name} [ID: ${message.channel.id}]

* Cantidad de mensajes
> ${datos.flood.cantidad}

* Tiempo
> ${datos.flood.tiempo}

* Mensajes
/*${text}*/
\`\`\``);
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } }).then(async (msg) => {
                        if (message.deletable && remove_messages == true) {
                            setTimeout(() => message.channel.bulkDelete(userMessages, true), 1000)
                        }
                        setTimeout(() => msg.delete(), 2000);
                    });
                });
            } else if (datos.duplicado) {
                if (!await client.db.has(`${message.guild.id}.antispam.duplicados_count`)) await client.db.set(`${message.guild.id}.antispam.duplicados_count`, 0);
                antispam.sumar(`${message.guild.id}.duplicados_count`, 1);
                let duplicados_count = await client.db.get(`${message.guild.id}.antispam.duplicados_count`);
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} ${message.author} Los mensajes con __más de 8 caracteres__ repetidos se consideran spam en este servidor.`);
                antispam_logs_channel.send(`
\`\`\`md
# D-ConfigBot [Anti-Spam | Duplicados | Detectado #${duplicados_count}]

* Usuario
> ${message.author.tag} [ID: ${message.author.id}]

* Canal
> #${message.channel.name} [ID: ${message.channel.id}]

* Mensaje
/*${message.content.length < 315 ? message.content : message.content.slice(0, 315)+"..."}*/
\`\`\``);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } }).then(async (msg) => {
                    if (message.deletable && remove_messages == true) setTimeout(() => message.delete(), 1000);
                    setTimeout(() => msg.delete(), 2000)
                });
            }
        }
    }
});