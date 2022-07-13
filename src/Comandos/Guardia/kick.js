const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index"), moment = require("moment");
require('moment-duration-format');

module.exports = new Comando({
    nombre: "kick",
    alias: ["expulsar"],
    categoria: "Guardia",
    descripcion: "Expulsa a un usuario del servidor.",
    ejemplo: "$kick [@usuario] [razón]",
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


        if (!message.guild.members.cache.get(client.user.id).permissions.has('KICK_MEMBERS')) {
            let f = new MessageEmbed()
            f.setDescription(`${client.emojiError} Necesito el permiso **KICK_MEMBERS** en este servidor para completar el uso de este comando.`);
            f.setColor(client.colorDefault)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        }
        const usage = new MessageEmbed()
            .setColor(client.colorDefault)
            .setDescription('Modo de uso: `' + prefix + 'kick [@usuario] [razón]`')
        let us = new MessageEmbed()
            .setColor(client.colorDefault).setDescription('' + client.emojiError + ' Debes poner una `razón`.')
        let reason = args.slice(1).join(' ');
        if (!args[0]) return message.reply({ embeds: [usage], allowedMentions: { repliedUser: false } });
        let user = message.mentions.members.first();
        if (!user) return message.reply({ embeds: [usage], allowedMentions: { repliedUser: false } });
        if (!message.guild.members.cache.has(user.id)) return message.reply({ embeds: [usage], allowedMentions: { repliedUser: false } });
        if (user.id == message.author.id) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedes expulsarte.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } })
        }
        if (user.id == client.user.id) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedo expulsarme.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } })
        }

        if (!reason) reason = 'No hay razón';
        if (reason.length > 324) reason = reason.slice(0, 321) + '...';
        let botRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
        let rolePosition = message.guild.members.cache.get(user.id).roles.highest.position;
        let userRolePossition = message.member.roles.highest.position;
        if (userRolePossition <= rolePosition) {
            let f = new MessageEmbed()
            f.setColor('DARK_RED').setDescription('' + client.emojiError + ' No puedes expulsar a ese miembro porque tiene roles que son más altos o iguales que tu.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } })
        } else if (botRolePossition <= rolePosition) {
            let f = new MessageEmbed()
            f.setColor('DARK_RED').setDescription('' + client.emojiError + ' No se puede expulsar a ese miembro porque tiene roles que son más altos o iguales que los mios mí.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } })
        } else if (!message.guild.member(user).kickable) {
            let ef = new MessageEmbed()
            ef.setColor('DARK_RED').setDescription('No puedo expulsar a ese miembro. Mi rol puede no ser lo suficientemente alto.')
            return message.reply({ embeds: [ef], allowedMentions: { repliedUser: false } })
        } else {
            const si_id = new DiscordUtils().button_id_generator(20);
            const no_id = new DiscordUtils().button_id_generator(20);
            const cancelar_id = new DiscordUtils().button_id_generator(20);

            // Habilitado ✅
            const button_unlock = new MessageActionRow().addComponents(
                new MessageButton().setEmoji("✅").setLabel("Si").setCustomId(si_id).setStyle("SUCCESS"),
                new MessageButton().setEmoji("❌").setLabel("No").setCustomId(no_id).setStyle("DANGER"),
                new MessageButton().setEmoji("⚠️").setLabel("Cancelar").setCustomId(cancelar_id).setStyle("PRIMARY"), );
            // Deshabilitado ❌
            const button_lock = new MessageActionRow().addComponents(
                new MessageButton().setEmoji("✅").setLabel("Si").setCustomId(si_id).setStyle("SUCCESS").setDisabled(true),
                new MessageButton().setEmoji("❌").setLabel("No").setCustomId(no_id).setStyle("DANGER").setDisabled(true),
                new MessageButton().setEmoji("⚠️").setLabel("Cancelar").setCustomId(cancelar_id).setStyle("PRIMARY").setDisabled(true), );

            const button_url = new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje de la expulsión`), );

            let emb = new MessageEmbed()
            emb.setColor(client.colorDefault)
            emb.setDescription(`Estas seguro de expulsar al usuario ${user}?`)
            message.reply({ embeds: [emb], allowedMentions: { repliedUser: false }, components: [buttons_unlock] }).then(async (msg) => {
                let stringify = '';
                async function edit() {
                    let embed_ = new MessageEmbed();
                    embed_.setColor(client.colorDefault);
                    embed_.setDescription(stringify);
                    msg.edit({ embeds: [embed_], components: [buttons_unlock] });
                }
                async function lock() {
                    let embed_ = new MessageEmbed();
                    embed_.setColor(client.colorDefault);
                    embed_.setDescription(stringify);
                    msg.edit({ embeds: [embed_], components: [buttons_lock] });
                }

                let filter = x => x.user.id == message.author.id;
                const collector = msg.channel.createMessageComponentCollector({
                    filter,
                    idle: 30000,
                    errors: ["idle"]
                });

                await collector.on('collect', (btn) => {
                    switch (btn.customId) {
                        case si_id:
                            if (!message.guild.members.cache.get(user.id).kickable) {
                                stringify = `${client.emojiError} No tengo permisos para **expulsar** el usuario ${user}.`
                                edit()
                                return lock()
                            }
                            stringify = `${client.emojiSuccess} El usuario ${user} fue correctamente expulsado.`
                            edit()
                            lock()
                            user.kick(reason);
                            return lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Kick | Add]

* Usuario
> ${user.tag} [ID: ${user.id}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Razón
> ${reason}

* Kick ejecutado en
> #${message.channel.name}

* Hora
> ${moment(message.createdAt).format("DD/MM/YYYY, HH:mm:ss")}
\`\`\``, components: [button_url] })
                            break;
                        case no_id:
                            stringify = `${client.emojiSuccess} El sistema de **kick** ha sido cancelado correctamente.`
                            edit()
                            lock()
                            break;
                        case cancelar_id:
                            stringify = `${client.emojiSuccess} El sistema de **kick** ha sido cancelado correctamente`
                            edit()
                            lock()
                            break;
                    }
                });
            });
        }
    }
});