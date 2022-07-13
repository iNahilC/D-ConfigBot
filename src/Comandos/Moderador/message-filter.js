const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "message-filter",
    alias: ["messagefilter", "msg-filter", "msgfilter"],
    descripcion: "Este comando te permite agregar una palabra a un filtro de mensajes en la cual si un usuario la utiliza su mensaje sera eliminado automaticamente. Los usuarios que contegan los permisos de Moderador o mayor sus mensajes no seran afectados.",
    categoria: "Moderador",
    ejemplo: "$message-filter [add | remove | list]",
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

        if (!args[0]) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`
\`\`\`md
D-ConfigBot [Message Filter]

> ${prefix}message-filter add
> Para agregar una palabra al filtro de mensajes.

> ${prefix}message-filter remove
> Para remover una palabra al filtro de mensajes.

>${prefix}message-filter list
> Para ver la lista de palabras en el filtro de mensajes.
\`\`\`
${client.warning} **__Los usuarios que contengan permisos de moderador o superior no sera afectado por este sistema__**.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
        if (![
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
            ].includes(args[0].toLowerCase())) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`
\`\`\`md
D-ConfigBot [Message Filter]

> ${prefix}message-filter add
> Para agregar una palabra al filtro de mensajes.

> ${prefix}message-filter remove
> Para remover una palabra al filtro de mensajes.

>${prefix}message-filter list
> Para ver la lista de palabras en el filtro de mensajes.
\`\`\`
${client.warning} **__Los usuarios que contengan permisos de moderador o superior no sera afectado por este sistema__**.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        } else if (["-add", "add", "-agregar", "agregar"].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.msg_filter`)) await client.db.set(`${message.guild.id}.msg_filter`, new Array());
            let palabra = args[1]
            if (!palabra) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault)
                e.setDescription(`${client.emojiError} Necesitas escribir la palabra que quieres **__agregar__** al sistema de **__filtros de mensajes__**.`)
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (client.tiene_comando(palabra)) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault).setDescription(`${client.emojiError} No puedes agregar el nombre de un **comando** al sistema de **__filtros de mensajes__**.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (palabra.length < 4) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault)
                e.setDescription(`${client.emojiError} La longitud mínima de caracteres para agregar una palabra es de **__4__** caracteres.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (palabra.length > 15) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault)
                e.setDescription(`${client.emojiError} La palabra que intentas agregar no debe superar los **__15__** caracteres de longitud.`)
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (await client.db.get(`${message.guild.id}.msg_filter`).includes(palabra)) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault)
                e.setDescription(`${client.emojiError} La palabra **${palabra}** ya se **__encuentra agregada__** a la lista de **__filtros de mensajes__**.`)
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiSuccess} La palabra **${palabra}** fue **__correctamente__** agregada a la lista de **__filtros de mensajes__**.`);
            await client.db.push(`${message.guild.id}.msg_filter`, palabra);
            message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });

            const button_url = new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje del moderador ${message.author.username}!`), );
            return lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Message-Filter | Add]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Palabra Agregada
> ${palabra}

* Canal
> #${message.channel.name}
\`\`\``, components: [button_url] });

        } else if (["-rm", "-remove", "-remover", "remove", "remover", "rm", ].includes(args[0])) {
            if (!await client.db.has(`${message.guild.id}.msg_filter`)) await client.db.set(`${message.guild.id}.msg_filter`, new Array());
            let rpalabra = args[1]
            let array_msgs = await client.db.get(`${message.guild.id}.msg_filter`);
            if (array_msgs.length === 0) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault)
                e.setDescription(`${client.emojiError} Todavía no hay ninguna palabra para **remover** en el sistema de **__filtros de mensajes__**.`);
                e.setFooter(`Puedes agregar una palabra al filtros de mensajes escribiendo: ${prefix}message-filter add [palabra]`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (!rpalabra) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault)
                e.setDescription(`${client.emojiError} Necesitas escribir la palabra que quieres **remover** del **__filtro de mensajes__**.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (!await client.db.get(`${message.guild.id}.msg_filter`).includes(rpalabra)) {
                let es = new MessageEmbed()
                es.setColor(client.colorDefault)
                es.setDescription(`${client.emojiError} La palabra **__${rpalabra}__** no está agregada en la lista de filtros.`);
                es.setFooter(`Puedes agregar una palabra al filtros de mensajes escribiendo: ${prefix}message-filter add [palabra]`);
                return message.reply({ embeds: [es], allowedMentions: { repliedUser: false } })
            }

            if (await client.db.get(`${message.guild.id}.msg_filter`).includes(rpalabra)) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault)
                e.setDescription(`${client.emojiSuccess} La palabra **${rpalabra}** acaba de ser removida del **__filtro de mensajes__**.`)

                const button_url = new MessageActionRow().addComponents(
                    new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje del moderador ${message.author.username}!`), );
                message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });

                await client.db.pull(`${message.guild.id}.msg_filter`, rpalabra);
                return lchannel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Message-Filter | Remove]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Palabra Removida
> ${rpalabra}

* Canal
> #${message.channel.name}
\`\`\``,
                    components: [button_url]
                });
            }
        } else if (["-list", "-lista", "list", "lista"].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.msg_filter`)) await client.db.set(`${message.guild.id}.msg_filter`, new Array());
            let array_msgs = await msg_filter.obtener(`${message.guild.id}.msg_filter`);
            if (array_msgs.length === 0) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault)
                e.setDescription(`${client.emojiError} Todavía no hay ninguna palabra para **visualizar** en el sistema de **__filtros de mensajes__**.`);
                e.setFooter(`Puedes agregar una palabra al filtros de mensajes escribiendo: ${prefix}message-filter add [palabra]`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            let msg_filter_array = await client.db.get(`${message.guild.id}.msg_filter`).map((id, key) => [key, id]);
            if (msg_filter_array) {
                let cmdlist = [],
                    index = 1,
                    commands_list_embed = new MessageEmbed();
                while (msg_filter_array.length > 0) cmdlist.push(msg_filter_array.splice(0, 100).map(u => `* ${index++}- ${u[1]}`));
                commands_list_embed.setColor(client.colorDefault);
                commands_list_embed.setDescription(`
${client.emojiSuccess} __Lista de las **${cmdlist[0].length}** palabras agregadas al filtro de mensajes.__

\`\`\`md
${cmdlist[0].join("\n")}
\`\`\`
`);
                return message.reply({ embeds: [commands_list_embed], allowedMentions: { repliedUser: false } });
            };
        }
    }
});