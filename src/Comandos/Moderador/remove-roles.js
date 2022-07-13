const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "remove-roles",
    alias: ["removeroles", "removerol", "remove-rol"],
    categoria: "Moderador",
    descripcion: "Remueve múltiples roles a una persona especifica.",
    ejemplo: "$remove-rol [@usuario] [roles]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }
        let logs = await client.db.get(`${message.guild.id}.logs_channel`)
        let lchannel = message.guild.channels.cache.get(logs)
        if (!lchannel) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
            await client.db.delete(`${message.guild.id}.logs_channel`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!message.guild.members.cache.get(client.user.id).permissions.has('MANAGE_ROLES')) {
            let f = new MessageEmbed()
            f.setDescription(`${client.emojiError} Necesito el permiso **MANAGE_ROLES** en este servidor para completar el uso de este comando.`);
            f.setColor(client.colorDefault)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        }

        if (!args[0]) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar al **__usuario__** que quieres removerle los roles.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
        }
        
        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user || !message.guild.members.cache.has(user.id)) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar al **__usuario__** que quieres removerle los roles.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
        }

        if (user.id == message.author.id) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar a otra persona.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
        }

        if (user.id == client.user.id) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar a otra persona.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
        }

        let botRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
        let rolePosition = message.guild.members.cache.get(user.id).roles.highest.position;
        let userRolePossition = message.member.roles.highest.position;
        if (userRolePossition <= rolePosition) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedes removerle roles a ese miembro porque tiene roles que son más altos o iguales que tu.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        } else if (botRolePossition <= rolePosition) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedo removerle roles a ese miembro porque tiene roles que son más altos o iguales que los mios mí.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        }

        let rol_mencion = args.slice(1)
        if (rol_mencion.length < 1) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar los **roles** que quieres **__removerle__** a el usuario.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        if (rol_mencion.length > 5) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Este comando tiene un máximo de **__5__** roles por uso.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
        }

        const si_id = new DiscordUtils().button_id_generator(20);
        const no_id = new DiscordUtils().button_id_generator(20);
        // Habilitado ✅
        const button_unlock = new MessageActionRow().addComponents(
            new MessageButton().setEmoji(client.emojiSuccessId).setLabel("Si").setCustomId(si_id).setStyle("SUCCESS"),
            new MessageButton().setEmoji(client.emojiErrorId).setLabel("No").setCustomId(no_id).setStyle("DANGER"), );
        // Deshabilitado ❌
        const button_lock = new MessageActionRow().addComponents(
            new MessageButton().setEmoji(client.emojiSuccessId).setLabel("Si").setCustomId(si_id).setStyle("SUCCESS").setDisabled(true),
            new MessageButton().setEmoji(client.emojiErrorId).setLabel("No").setCustomId(no_id).setStyle("DANGER").setDisabled(true), );

        let wait_embed = new MessageEmbed();
        let roles_gramatica = "";
        if (rol_mencion.length == 1) roles_gramatica = `${client.warning} Deseas removerle el siguiente rol <@&${rol_mencion[0].replace("<@&", "").replace(">", "")}> al usuario ${user}?`;
        if (rol_mencion.length > 1) roles_gramatica = `${client.warning} Deseas removerle los siguientes **__${rol_mencion.length}__** roles al usuario ${user}?`;
        for (var i = 0; i < rol_mencion.length; i++) {
            let rol_replaced = rol_mencion[i].replace("<@&", "").replace(">", "")
            if (rol_mencion.length == 1 && !user.roles.cache.has(rol_replaced)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El usuario ${user} no tiene el único rol mencionado. <@&${rol_replaced}>`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
            }
        }

        wait_embed.setColor(client.colorDefault).setDescription(roles_gramatica);
        await message.reply({ embeds: [wait_embed], allowedMentions: { repliedUser: false }, components: [button_unlock] }).then(async (msg) => {
            const filter = x => x.user.id == message.author.id;
            const collector = await msg.channel.createMessageComponentCollector({
                filter,
                idle: 60000,
                errors: ["idle"]
            });

            collector.on("collect", async (button) => {
                switch (button.customId) {
                    case si_id:
                        let roles_array_added = new Array();
                        let roles_array_removed = new Array();
                        for (var i = 0; i < rol_mencion.length; i++) {
                            if (!message.guild.roles.cache.has(rol_mencion[i].replace("<@&", "").replace(">", ""))) {
                                let e = new MessageEmbed();
                                e.setColor(client.colorDefault);
                                e.setDescription(`${client.emojiError} ${rol_mencion} no es un rol valido en este servidor.`);
                                return msg.edit({ embeds: [e], components: [] });
                            }

                            if (message.guild.roles.cache.get(rol_mencion[i].replace("<@&", "").replace(">", "")).comparePositionTo(message.member.roles.highest) > 0) {
                                let e = new MessageEmbed();
                                e.setColor(client.colorDefault);
                                e.setDescription(`${client.emojiError} Los **__privilegios__** del rol ${rol_mencion[i]} están por encima de los tuyos.`);
                                return msg.edit({ embeds: [e], components: [] });
                            }

                            await user.roles.remove(rol_mencion[i].replace("<@&", "").replace(">", "")).catch(async (err) => {
                                await roles_array_removed.push(`${rol_mencion[i].replace("<@&", "").replace(">", "")}`);
                            });
                            if (!user.roles.cache.has(rol_mencion[i].replace("<@&", "").replace(">", ""))) roles_array_added.push(`${rol_mencion[i].replace("<@&", "").replace(">", "")}`)
                        }

                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        if (roles_array_removed.length > 0 && roles_array_added.length > 0) {
                            lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Remove-Role | ${roles_array_added.length + roles_array_removed.length} Total]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Usuario
> ${user.user.tag} [ID: ${user.id}]

* Roles Removidos
${roles_array_added.map((x) => `> ${message.guild.roles.cache.get(x).name}`).join("\n")}

* Roles No Removidos
${roles_array_removed.map((x) => `> ${message.guild.roles.cache.get(x).name}`).join("\n")}
\`\`\`` });
                            e.setDescription(`${client.emojiSuccess} Los siguientes **__roles__** fueron removidos al usuario ${user}
\`\`\`md
# Removidos [${roles_array_added.length}]

${roles_array_added.map((x) => `* ${message.guild.roles.cache.get(x).name}`).join("\n")}

# No Removidos [${roles_array_removed.length}]

${roles_array_removed.map((x) => `* ${message.guild.roles.cache.get(x).name}`).join("\n")}
\`\`\``);
                        } else if (roles_array_removed.length < 1) {
                            lchannel.send(`
\`\`\`md
# D-ConfigBot [Remove-Role | ${roles_array_added.length} Total]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Usuario
> ${user.user.tag} [ID: ${user.id}]

* Roles Removidos
${roles_array_added.map((x) => `> ${message.guild.roles.cache.get(x).name}`).join("\n")}
\`\`\``);
                            e.setDescription(`${client.emojiSuccess} Los siguientes **__roles__** fueron removidos al usuario ${user}
\`\`\`md
# Removidos [${roles_array_added.length}]

${roles_array_added.map((x) => `* ${message.guild.roles.cache.get(x).name}`).join("\n")}
\`\`\``);
                        } else if (roles_array_added.length < 1) {
                            e.setDescription(`${client.emojiSuccess} Los siguientes **__roles__** fueron no fueron removidos al usuario ${user}
\`\`\`md
# No Removidos [${roles_array_removed.length}]

${roles_array_removed.map((x) => `* ${message.guild.roles.cache.get(x).name}`).join("\n")}
\`\`\``);
                        }
                        collector.stop("x")
                        return msg.edit({ embeds: [e], components: [] });
                        break;
                    case no_id:
                        let embed_no = new MessageEmbed();
                        embed_no.setColor(client.colorDefault);
                        embed_no.setDescription(`${client.emojiError} El sistema fue **__cancelado__** correctamente.`);
                        collector.stop("x");
                        return msg.edit({ embeds: [embed_no], components: [] });
                        break;
                }
            });
            collector.on("end", async (_, reason) => {
                if (reason == "x") return;
                let e_x = new MessageEmbed()
                e_x.setColor(client.colorDefault);
                e_x.setDescription(`${client.emojiError} Tardaste demasiado para dar una respuesta tienes **__1__** minuto para eso.`);
                return msg.edit({ embed: [e_x], components: [] });
            })
        });
    }
});