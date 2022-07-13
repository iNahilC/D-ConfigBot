const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "set-permissions",
    alias: [
        "setpermissions",
        "setlevel", "set-level",
        "setnivel", "set-nivel",
        "setuser", "set-user",
        "userlevel", "user-level",
        "level-user", "leveluser"
    ],
    categoria: "Administrador",
    descripcion: "Te permite establecer el nivel de permisos de un usuario en el bot.",
    ejemplo: "$set-permissions [@usuario]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!"; }
        let u_permisos = await client.db.get(`${message.guild.id}.permisos.${message.author.id}`);

        if (!args[0]) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault).setDescription('' + client.emojiError + ' Necesitas **__mencionar__** al usuario que quieres establecer los permisos.');
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
        let us = message.guild.members.cache.get(args[0]) || message.mentions.members.first();
        if (!us || !message.guild.members.cache.has(us.id)) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault).setDescription('' + client.emojiError + ' Necesitas **__mencionar__** al usuario que quieres establecer los permisos.');
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (us.user.bot) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription('' + client.emojiError + ' El usuario es un bot, los bots no pueden ejecutar mis comandos.')
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
        if (us.id == message.author.id) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} No puedes cambiarte **__tus nivel de permisos__**.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
        if (us.id == client.user.id) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} No puedo cambiarme mis niveles de permisos.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
        if (message.guild.members.cache.get(us.id).permissions.has("ADMINISTRATOR")) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} El usuario ${us} ya tiene permisos de **__ADMINISTRADOR__** en sus roles y en el bot.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        const admin_button_id = new DiscordUtils().button_id_generator(20);
        const mod_button_id = new DiscordUtils().button_id_generator(20);
        const guard_button_id = new DiscordUtils().button_id_generator(20);
        const user_button_id = new DiscordUtils().button_id_generator(20);

        const admin_button_disabled_id = new DiscordUtils().button_id_generator(20);
        const mod_button_disabled_id = new DiscordUtils().button_id_generator(20);
        const guard_button_disabled_id = new DiscordUtils().button_id_generator(20);
        const user_button_disabled_id = new DiscordUtils().button_id_generator(20);
        const cancel_button_id = new DiscordUtils().button_id_generator(20);

        /* BUTTONS - UNLOCK - START */
        const buttons_unlock = new MessageActionRow().addComponents(
            new MessageButton().setLabel("Administrador").setEmoji("935076590281433119").setCustomId(admin_button_id).setStyle('DANGER'),
            new MessageButton().setLabel("Moderador").setEmoji("🇲").setCustomId(mod_button_id).setStyle('PRIMARY'),
            new MessageButton().setLabel("Guardia").setEmoji("🇬").setCustomId(guard_button_id).setStyle('PRIMARY'),
            new MessageButton().setLabel("Usuario").setEmoji("🇺").setCustomId(user_button_id).setStyle('PRIMARY'),
            new MessageButton().setLabel("Cancelar").setEmoji("❌").setCustomId(cancel_button_id).setStyle('PRIMARY'), );
        /* BUTTONS - UNLOCK - END */

        /* BUTTONS - LOCK - START */
        const buttons_lock = new MessageActionRow().addComponents(
            new MessageButton().setLabel("Administrador").setEmoji("935076590281433119").setCustomId(admin_button_id).setStyle('DANGER').setDisabled(true),
            new MessageButton().setLabel("Moderador").setEmoji("🇲").setCustomId(mod_button_id).setStyle('PRIMARY').setDisabled(true),
            new MessageButton().setLabel("Guardia").setEmoji("🇬").setCustomId(guard_button_id).setStyle('PRIMARY').setDisabled(true),
            new MessageButton().setLabel("Usuario").setEmoji("🇺").setCustomId(user_button_id).setStyle('PRIMARY').setDisabled(true),
            new MessageButton().setLabel("Cancelar").setEmoji("❌").setCustomId(cancel_button_id).setStyle('PRIMARY').setDisabled(true), );
        /* BUTTONS - LOCK - END */

        let e = new MessageEmbed()
        e.setColor('#ED4245')
        e.setDescription(`
Que permisos quieres **__agregarle__** al usuario **${us}**?

<:admin_emoji:935076590281433119> - **Administrador**
:regional_indicator_m: - **Moderador**
:regional_indicator_g: - **Guardia/Ayudante**
:regional_indicator_u: - **Usuario**
❌ - **Cancelar sistema**`)


        let msg = await message.reply({ embeds: [e], allowedMentions: { repliedUser: false }, components: [buttons_unlock] });
        let target_user_permisos = await client.db.get(`${message.guild.id}.permisos.${us.id}`);
        if (target_user_permisos == 3) {
            e.setFooter({ text: `El usuario ${us.user.tag} cuenta con permisos de administrador actualmente.` });
            await msg.edit({ embeds: [e], components: [buttons_unlock] });
        } else if (target_user_permisos == 2) {
            e.setFooter({ text: `El usuario ${us.user.tag} cuenta con permisos de moderador actualmente.` });
            await msg.edit({ embeds: [e], components: [buttons_unlock] });
        } else if (target_user_permisos == 1) {
            e.setFooter({ text: `El usuario ${us.user.tag} cuenta con permisos de guardia actualmente.` });
            await msg.edit({ embeds: [e], components: [buttons_unlock] });
        } else if (target_user_permisos == 0) {
            e.setFooter({ text: `El usuario ${us.user.tag} cuenta con permisos de usuarios actualmente.` })
            await msg.edit({ embeds: [e], components: [buttons_unlock] });
        }

        const filter = x => x.user.id == message.author.id;
        const collector = await msg.channel.createMessageComponentCollector({
            filter,
            idle: 60000,
            errors: ["idle"]
        });
        await collector.on('collect', async (btn) => {
            let done_embed = new MessageEmbed();
            done_embed.setColor(client.colorDefault);
            switch (btn.customId) {
                case admin_button_id:
                    let target_level_admin = await client.db.get(`${message.guild.id}.permisos.${us.id}`);
                    if (target_level_admin == 3) {
                        done_embed.setDescription(`${client.emojiError} Ya tiene permisos de **__administrador__**, elije otra opción.`);
                        await msg.edit({
                            embeds: [done_embed],
                            components: [buttons_unlock]
                        });
                    } else if (target_level_admin !== 3) {
                        done_embed.setDescription(`${client.emojiSuccess} Se le agrego correctamente el permiso de **__administrador__** al usuario ${us}.`);
                        await client.db.set(`${message.guild.id}.permisos.permisos.${us.id}`, 3);
                        collector.stop("x");
                        return msg.edit({
                            embeds: [done_embed],
                            components: []
                        });
                    }
                    break;
                case mod_button_id:
                    let target_level_mod = await client.db.get(`${message.guild.id}.permisos.${us.id}`);
                    if (target_level_mod == 2) {
                        done_embed.setDescription(`${client.emojiError} Ya tiene permisos de **__moderador__**, elije otra opción.`);
                        await msg.edit({
                            embeds: [done_embed]
                        });
                    } else if (target_level_mod !== 2) {
                        done_embed.setDescription(`${client.emojiSuccess} Se le agrego correctamente el permiso de **__moderador__** al usuario ${us}.`);
                        await client.db.set(`${message.guild.id}.permisos.${us.id}`, 2);
                        collector.stop("x");
                        return msg.edit({
                            embeds: [done_embed],
                            components: []
                        });
                    }
                    break;
                case guard_button_id:
                    let target_level_guard = await client.db.get(`${message.guild.id}.permisos.${us.id}`);
                    if (target_level_guard == 1) {
                        done_embed.setDescription(`${client.emojiError} Ya tiene permisos de **__guardia__**, elije otra opción.`);
                        await msg.edit({
                            embeds: [done_embed]
                        });
                    } else if (target_level_guard !== 1) {
                        done_embed.setDescription(`${client.emojiSuccess} Se le agrego correctamente el permiso de **__guardia__** al usuario ${us}.`);
                        await client.db.set(`${message.guild.id}.permisos.${us.id}`, 1);
                        collector.stop("x");
                        return msg.edit({
                            embeds: [done_embed],
                            components: []
                        });
                    }
                    break;
                case user_button_id:
                    let target_level_user = await client.db.get(`${message.guild.id}.permisos.${us.id}`);
                    if (target_level_user == 0) {
                        done_embed.setDescription(`${client.emojiError} Ya tiene permisos de **__usuario__**, elije otra opción.`);
                        await msg.edit({
                            embeds: [done_embed]
                        });
                    } else if (target_level_user !== 0) {
                        done_embed.setDescription(`${client.emojiSuccess} Se le agrego correctamente el permiso de **__usuario__** al usuario ${us}.`);
                        await client.db.set(`${message.guild.id}.permisos.${us.id}`, 0);
                        collector.stop("x");
                        return msg.edit({
                            embeds: [done_embed],
                            components: []
                        });
                    }
                    break;
                case cancel_button_id:
                    done_embed.setDescription(`${client.emojiSuccess} El sistema se detuvo __correctamente__.`);
                    collector.stop("x");
                    return msg.edit({
                        embeds: [done_embed],
                        components: []
                    });
                    break;
            }
        });

        await collector.on("end", async (_, reason) => {
            if (reason == "x") return;
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Tardaste demasiado en tomar una opción, inténtalo de nuevo tienes **__30__** segundos para eso.`);
            return msg.edit({
                embeds: [e],
                components: [buttons_lock]
            });
        });
    }
});