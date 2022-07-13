const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "auto-roles",
    alias: ["autoroles", "auto-rol", "autorol", "welcome-role", "welcomerole"],
    categoria: "Administrador",
    descripcion: "Define que rol se le dará a los usuarios o bots cuando entren al servidor.",
    ejemplo: "$autorole [on | off | add | remove | roles]",
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
            return message.reply({
                embeds: [e],
                allowedMentions: {
                    repliedUser: false
                }
            });
        }

        let stringify = '';
        const si_id = new DiscordUtils().button_id_generator(20);
        const no_id = new DiscordUtils().button_id_generator(20);
        const cancelar_id = new DiscordUtils().button_id_generator(20);
        const roles_user_left = new DiscordUtils().button_id_generator(20);
        const roles_user_right = new DiscordUtils().button_id_generator(20);
        const roles_user_left_lock = new DiscordUtils().button_id_generator(20);
        const roles_user_right_lock = new DiscordUtils().button_id_generator(20);
        const roles_user_x = new DiscordUtils().button_id_generator(20);

        if (!args[0]) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`
**D-ConfigBot [\`Auto-Roles\`]**

\`\`\`md
* ${prefix}auto-role on
> Para **activar** el sistema de auto-role.

* ${prefix}auto-role off
> Para **desactivar** el sistema de auto-role.

* ${prefix}auto-role add
> Para **agregar** el rol le agregare a los usuarios/bots cuando ingresen al servidor.

* ${prefix}auto-role remove
> Para **remover** el rol le agregare a los usuarios/bots cuando ingresen al servidor.

* ${prefix}auto-role list
> Para ver una lista de los roles establecidos en el sistema de auto-roles
\`\`\``);
            return message.reply({
                embeds: [e],
                allowedMentions: {
                    repliedUser: false
                }
            });
        } else if (args[0] === "on") {
            if (await client.db.has(`${message.guild.id}.auto_roles`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de __auto-roles__ ya esta activado.`);
                e.setFooter(`Si deseas desactivar este sistema escribe en el chat: ${prefix}auto-roles off`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            // Habilitado ✅
            const buttons_await = new MessageActionRow().addComponents(
                new MessageButton().setEmoji("✅").setLabel('Si').setCustomId(si_id).setStyle('SUCCESS'),
                new MessageButton().setEmoji("❌").setLabel('No').setCustomId(no_id).setStyle('DANGER'), )

            const buttons_unlock = new MessageActionRow().addComponents(
                new MessageButton().setEmoji("✅").setLabel('Si').setCustomId(si_id).setStyle('SUCCESS'),
                new MessageButton().setEmoji("❌").setLabel('No').setCustomId(no_id).setStyle('DANGER'),
                new MessageButton().setEmoji(client.warningId).setLabel("Cancelar Sistema").setCustomId(cancelar_id).setStyle("SECONDARY"), );

            // Deshabilitado ❌
            const buttons_lock = new MessageActionRow().addComponents(
                new MessageButton().setEmoji(client.emojiSuccessId).setLabel('Si').setCustomId(si_id).setStyle('SUCCESS').setDisabled(true),
                new MessageButton().setEmoji(client.emojiErrorId).setLabel('No').setCustomId(no_id).setStyle('DANGER').setDisabled(true),
                new MessageButton().setEmoji(client.warningId).setLabel("Cancelar Sistema").setCustomId(cancelar_id).setStyle("SECONDARY").setDisabled(true), )

            const buttons_cancel_start = new MessageActionRow().addComponents(
                new MessageButton().setEmoji(client.emojiSuccessId).setLabel('Si').setCustomId(si_id).setStyle('SUCCESS').setDisabled(true),
                new MessageButton().setEmoji(client.emojiErrorId).setLabel('No').setCustomId(no_id).setStyle('DANGER').setDisabled(true),
                new MessageButton().setEmoji(client.warningId).setLabel("Cancelar Sistema").setCustomId(cancelar_id).setStyle("SECONDARY").setDisabled(false), )

            let embed_option = new MessageEmbed();
            embed_option.setColor(client.colorDefault);
            embed_option.setDescription(`
            ${client.emojiSuccess} El sistema de __auto-roles__ acaba de ser activado. Deseas agregar el rol de bots y de usuarios ahora?`);
            message.reply({
                embeds: [embed_option],
                allowedMentions: {
                    repliedUser: false
                },
                components: [buttons_await]
            }).then(async (msg) => {
                async function edit() {
                    let embed_ = new MessageEmbed();
                    embed_.setColor(client.colorDefault);
                    embed_.setDescription(stringify);
                    msg.edit({
                        embeds: [embed_],
                        components: [buttons_await],
                    });
                }
                async function lock() {
                    let embed_ = new MessageEmbed();
                    embed_.setColor(client.colorDefault);
                    embed_.setDescription(stringify);
                    msg.edit({
                        embeds: [embed_],
                        components: [buttons_lock],
                    });
                }

                async function cancelar_start() {
                    let embed_ = new MessageEmbed();
                    embed_.setColor(client.colorDefault);
                    embed_.setDescription(stringify);

                    msg.edit({
                        embeds: [embed_],
                        components: [buttons_cancel_start],
                    });
                }

                async function cancelar_end() {
                    let embed_ = new MessageEmbed();
                    embed_.setColor(client.colorDefault);
                    embed_.setDescription(stringify);

                    msg.edit({
                        embeds: [embed_],
                        components: [buttons_lock],
                    });
                }

                let filter = x => x.user.id == message.author.id;
                const opciones = msg.channel.createMessageComponentCollector({
                    filter,
                    time: 60000,
                    errors: ["time"]

                });
                let if_cancelado;
                let rol_info_usuarios;
                let rol_info_bots;

                opciones.on('collect', async (btn) => {
                    switch (btn.customId) {
                        case si_id:
                            // ROL USUARIOS
                            if (if_cancelado == true) return;
                            stringify = "" + client.emojiSuccess + " Mencione o escriba el __nombre/id__ del rol que quieres agregarle a los **usuarios** que ingresen.";
                            cancelar_start();

                            let filter_user_collector = x => x.author.id == message.author.id;
                            let user_collector = await msg.channel.awaitMessages({
                                filter_user_collector,
                                max: 1,
                                time: 60000,
                                errors: ["time"]
                            });
                            try {
                                // Agregar rol vía mención
                                let rol_resultado_user = await user_collector.first().content;
                                let rol_mencion_user = rol_resultado_user.match(/(?<=<).+(?=>)/g);
                                if (rol_mencion_user) {
                                    let rol_id = rol_mencion_user[0].replace("@&", "");
                                    let rol_user_mencion = message.guild.roles.cache.get(rol_id);
                                    if (!rol_user_mencion) {
                                        stringify = `${client.emojiError} El rol mencionado __no fue encontrado__ en este servidor.`;
                                        cancelar_end();
                                        return opciones.stop();
                                    }
                                    if (rol_user_mencion.id == message.guild.id) {
                                        stringify = `${client.emojiError} El sistema fue cancelado, No se puede agregar ni remover el rol <@&${message.guild.id}>`
                                        cancelar_end();
                                        return opciones.stop();
                                    }
                                    let clientRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
                                    let authorRolePossition = message.member.roles.highest.position;
                                    let user_rol_possition = rol_user_mencion.position;
                                    if (clientRolePossition <= user_rol_possition) {
                                        stringify `${client.emojiError} El sistema fue cancelado, La posición del rol ${rol_user_mencion} es mayor o igual a la de mi rol.`
                                        cancelar_end();
                                        return opciones.stop();
                                    } else if (authorRolePossition.position <= user_rol_possition) {
                                        stringify `${client.emojiError} El sistema fue cancelado, La posición del rol ${rol_user_mencion} es mayor o igual a la posición de rol mas alta que tienes. (${authorRolePossition}).`
                                        cancelar_end();
                                        return opciones.stop();
                                    }

                                    stringify = `${client.emojiSuccess} El rol ${rol_user_mencion} será agregado a los nuevos usuarios.`;
                                    rol_info_usuarios = rol_user_mencion.id
                                    // Establecer rol de usuarios [mención];
                                    if (!await client.db.has(`${message.guild.id}.auto_roles.user_rol`)) await client.db.set(`${message.guild.id}.auto_roles.user_rol`, new Array());
                                    await client.db.push(`${message.guild.id}.auto_roles.user_rol`, rol_user_mencion.id);
                                } else {
                                    // Agregar vía nombre o ID.
                                    let rol_user = message.guild.roles.cache.get(rol_resultado_user) || message.guild.roles.cache.find(x => x.name.toLowerCase() === rol_resultado_user.toLowerCase());
                                    if (!rol_user) {
                                        stringify = `${client.emojiError} El rol con la id/nombre __${rol_resultado_user}__ no fue encontrado en este servidor.`;
                                        cancelar_end();
                                        return opciones.stop();
                                    }

                                    if (rol_user.id == message.guild.id) {
                                        stringify = `${client.emojiError} El sistema fue cancelado, No se puede agregar ni remover el rol <@&${message.guild.id}>`
                                        cancelar_end();
                                        return opciones.stop();
                                    }
                                    let clientRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
                                    let authorRolePossition = message.member.roles.highest.position;
                                    let user_rol_possition = rol_resultado_user.position;
                                    if (clientRolePossition <= user_rol_possition) {
                                        stringify `${client.emojiError} El sistema fue cancelado, La posición del rol ${rol_resultado_user} es mayor o igual a la de mi rol.`
                                        cancelar_end();
                                        return opciones.stop();
                                    } else if (authorRolePossition.position <= user_rol_possition) {
                                        stringify `${client.emojiError} El sistema fue cancelado, La posición del rol ${rol_resultado_user} es mayor o igual a la posición de rol mas alta que tienes. (${authorRolePossition}).`
                                        cancelar_end();
                                        return opciones.stop();
                                    }

                                    stringify = `${client.emojiSuccess} El rol ${rol_user} será agregado a los nuevos usuarios.`;
                                    rol_info_usuarios = rol_user.id
                                    // Establecer rol de usuarios [nombre/id];
                                    if (!await client.db.has(`${message.guild.id}.auto_roles.user_rol`)) await client.db.set(`${message.guild.id}.auto_roles.user_rol`, new Array())
                                    await client.db.push(`${message.guild.id}.auto_roles.user_rol`, rol_user.id);
                                    cancelar_end();
                                }
                            } catch (err) {
                                stringify = `${client.emojiError} Tardaste mucho en mencionar o escribir el __nombre/id__ del rol que quieres agregarle a los usuarios que ingresen al servidor.\n\n Recuerda que __tienes 1 minuto disponible__ para responder en este sistema.`;
                                cancelar_end();
                                return opciones.stop();
                            }
                            //ROL BOTS
                            if (if_cancelado == true) return;
                            stringify = "" + client.emojiSuccess + " Mencione o escriba el __nombre/id__ del rol que quieres agregarle a los **bots** que ingresen.";
                            cancelar_start();
                            let filter_bot_collector = x => x.author.id == message.author.id;
                            let bot_collector = await msg.channel.awaitMessages({
                                filter_bot_collector,
                                max: 1,
                                time: 60000,
                                errors: ["time"]
                            });

                            try {
                                // Agregar rol vía mención
                                let rol_resultado_bot = await bot_collector.first().content;
                                let rol_mencion_bot = rol_resultado_bot.match(/(?<=<).+(?=>)/g);
                                if (rol_mencion_bot) {
                                    let rol_id = rol_mencion_bot[0].replace("@&", "");
                                    let rol_bot_mencion = message.guild.roles.cache.get(rol_id);
                                    if (!rol_bot_mencion) {
                                        stringify = `${client.emojiError} El rol mencionado __no fue encontrado__ en este servidor. El sistema fue cancelado pero el rol <@&${rol_info_usuarios}> fue agregado.`;
                                        cancelar_end();
                                        return opciones.stop();
                                    }

                                    if (rol_bot_mencion.id == message.guild.id) {
                                        stringify = `${client.emojiError} El sistema fue cancelado, No se puede agregar ni remover el rol <@&${message.guild.id}>`
                                        cancelar_end();
                                        return opciones.stop();
                                    }

                                    let clientRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
                                    let authorRolePossition = message.member.roles.highest.position;
                                    let bot_rol_possition = rol_bot_mencion.position;
                                    if (clientRolePossition <= bot_rol_possition) {
                                        stringify `${client.emojiError} El sistema fue cancelado, La posición del rol ${rol_bot_mencion} es mayor o igual a la de mi rol.`
                                        cancelar_end();
                                        return opciones.stop();
                                    } else if (authorRolePossition.position <= bot_rol_possition) {
                                        stringify `${client.emojiError} El sistema fue cancelado, La posición del rol ${rol_bot_mencion} es mayor o igual a la posición de rol mas alta que tienes. (${authorRolePossition}).`
                                        cancelar_end();
                                        return opciones.stop();
                                    }

                                    stringify = `${client.emojiSuccess} El rol ${rol_bot_mencion} será agregado a los nuevos usuarios.`;
                                    rol_info_bots = rol_bot_mencion.id
                                    // Establecer rol de usuarios [mención];
                                    if (!await client.db.has(`${message.guild.id}.auto_roles.user_rol`)) await client.db.set(`${message.guild.id}.auto_roles.bot_rol`, new Array());
                                    await client.db.push(`${message.guild.id}auto_roles.bot_rol`, rol_bot_mencion.id);

                                    cancelar_end();
                                    opciones.stop();
                                } else {
                                    // Agregar vía nombre o ID.
                                    let rol_bot = message.guild.roles.cache.get(rol_resultado_bot) || message.guild.roles.cache.find(x => x.name.toLowerCase() == rol_resultado_bot.toLowerCase());
                                    if (!rol_bot) {
                                        stringify = `${client.emojiError} El rol con la id/nombre __${rol_resultado_bot}__ no fue encontrado en este servidor..`;
                                        cancelar_end();
                                        return opciones.stop();
                                    }

                                    if (rol_bot.id == message.guild.id) {
                                        stringify = `${client.emojiError} El sistema fue cancelado, No se puede agregar ni remover el rol <@&${message.guild.id}>`
                                        cancelar_end();
                                        return opciones.stop();
                                    }

                                    let clientRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
                                    let authorRolePossition = message.member.roles.highest.position;
                                    let bot_rol_possition = rol_bot.position;
                                    if (clientRolePossition <= bot_rol_possition) {
                                        stringify `${client.emojiError} El sistema fue cancelado, La posición del rol ${rol_bot} es mayor o igual a la de mi rol.`
                                        cancelar_end();
                                        return opciones.stop();
                                    } else if (authorRolePossition.position <= authorRolePossition) {
                                        stringify `${client.emojiError} El sistema fue cancelado, La posición del rol ${rol_bot} es mayor o igual a la posición de rol mas alta que tienes. (${authorRolePossition}).`
                                        cancelar_end();
                                        return opciones.stop();
                                    }

                                    stringify = `${client.emojiSuccess} El rol ${rol_bot} será agregado a los nuevos bots.`;
                                    rol_info_bots = rol_bot.id
                                    // Establecer rol de usuarios [nombre/id];
                                    if (!await client.db.has(`${message.guild.id}.auto_roles.bot_rol`)) await client.db.set(`${message.guild.id}.auto_roles.bot_rol`, new Array())
                                    await client.db.push(`${message.guild.id}.auto_roles.bot_rol`, rol_bot.id);
                                    cancelar_end();
                                    opciones.stop();
                                }
                            } catch (err) {
                                stringify = `${client.emojiError} Tardaste mucho en mencionar o escribir el __nombre/id__ del rol que quieres **agregarle a los bots** que ingresen al servidor. El rol <@&${rol_info_usuarios}> fue agregado como **usuarios**, puedes agregar el de los bots con \`${prefix}auto-roles add -bot\`. \n\n Recuerda que __tienes 1 minuto disponible__ para responder en este sistema.`;
                                cancelar_end();
                                return opciones.stop();
                            }


                            stringify = `El <@&${rol_info_usuarios}> fue agregado como __rol de usuarios__. y <@&${rol_info_bots}> fue agregado como __rol de bots.__`;
                            return cancelar_end();
                            break;
                        case cancelar_id:
                            stringify = `${client.emojiSuccess} El sistema para agregar los roles de los bots y usuarios fue cancelado.`;
                            cancelar_end();
                            if_cancelado = true;
                            break
                        case no_id:
                            if (!await client.db.has(`${message.guild.id}.auto_roles`)) {
                                await client.db.set(`${message.guild.id}.auto_roles.user_rol`, new Array())
                                await client.db.set(`${message.guild.id}.auto_roles.bot_rol`, new Array());

                                stringify = `${client.emojiSuccess} Has decidido agregar el rol de usuarios y bots más tarde en el sistema.\n\nRecuerda que puedes agregar el rol de usuarios con \`${prefix}auto-roles add -user\` y el rol de bots con \`${prefix}auto-roles add -bot\``;
                                edit();
                                opciones.stop();
                                lock();
                            }
                            break;
                    }
                });
            });
        } else if (["-off", "off", "-desactivar", "desactivar"].includes(args[0])) {
            if (!await client.db.has(`${message.guild.id}.auto_roles`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de __auto-roles__ no esta activado en este servidor.`);
                e.setFooter(`Si desea activar el sistema de auto-roles escriba en el chat: ${prefix}auto-roles on.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            let embed_off = new MessageEmbed();
            embed_off.setColor(client.colorDefault);
            embed_off.setDescription(`${client.emojiSuccess} El sistema de __auto-roles__ fue correctamente desactivado.`)
            await client.db.delete(`${message.guild.id}.auto_roles`);
            return message.reply({ embeds: [embed_off], allowedMentions: { repliedUser: false } });
        } else if (["-add", "add", "-agregar", "agregar"].includes(args[0])) {
            let user_roles = await client.db.get(`${message.guild.id}.auto_roles.user_rol`);
            let bot_roles = await client.db.get(`${message.guild.id}.auto_roles.bot_rol`);
            if (!await client.db.has(`${message.guild.id}.auto_roles`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de __auto-roles__ no esta activado en este servidor.`);
                e.setFooter(`Si desea activar el sistema de auto-roles escriba en el chat: ${prefix}auto-roles on.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Los parámetros disponibles son: \`-user\` para agregar un rol para los usuarios que ingresen al servidor y \`-bot\` para agregar un rol para los bots que ingresen al servidor.`);
                e.setFooter(`Si quieres ver los roles establecidos en este servidor de bots o usuarios escribe en el chat: ${prefix}auto-roles [roles -user | -bot]`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (!["user", "-user", "bot", "-bot"].includes(args[1])) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Los parámetros disponibles son: \`-user\` para agregar un rol para los usuarios que ingresen al servidor y \`-bot\` para agregar un rol para los bots que ingresen al servidor.`);
                e.setFooter(`Si quieres ver los roles establecidos en este servidor de bots o usuarios escribe en el chat: ${prefix}auto-roles [roles -user | -bot]`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (["-user", "user"].includes(args[1])) { //ADD USER
                if (user_roles.length === 25) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Este servidor ha alcanzado el limite de roles para usuarios __25__`);
                    e.setFooter(`Si quieres remover algún rol para usuarios escribe en el chat: ${prefix}auto-roles remove -user [@rol]`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }
                let obtener_rol = message.mentions.roles.first() || message.guild.roles.cache.find(x => x.name.toLowerCase() === args.slice(2).join(' ').toLowerCase()) || message.guild.roles.cache.get(args[2]);
                if (!obtener_rol) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar __el rol que quieres agregar para los usuarios__.`);
                    e.setFooter(`Tambien puedes ingresar su id o nombre.`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                if (!message.guild.roles.cache.has(obtener_rol.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar __el rol que quieres agregar para los usuarios__.`);
                    e.setFooter(`También puedes ingresar su id o nombre.`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                if (obtener_rol.id == message.guild.id) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No se puede agregar ni remover el rol <@&${message.guild.id}>`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                for (var i = 0; i < user_roles.length; i++) {
                    if (obtener_rol.id === user_roles[i]) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} El rol ${obtener_rol} ya esta **__establecido__** en la base de datos.`);
                        e.setFooter(`Si deseas removerlo escribe en el chat: ${prefix}auto-roles remove -user [@rol]`);
                        return message.reply({
                            embeds: [e],
                            allowedMentions: {
                                repliedUser: false
                            }
                        });
                    }
                }

                let clientRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
                let obtener_rol_possition = obtener_rol.position;
                let authorRolePossition = message.member.roles.highest.position;

                if (authorRolePossition.position <= obtener_rol_possition) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El sistema fue cancelado, La posición del rol ${obtener_rol} es mayor o igual a la posición de rol mas alta que tienes. (${authorRolePossition}).`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                } else if (clientRolePossition <= obtener_rol_possition) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El rol ${obtener_rol} no se puede agregar a la base de datos ya que el rol tiene una posición mayor o igual a la de mi rol, Lo que significa que no puedo agregar ese rol a los usuarios.`);
                    e.setFooter('Puedes bajarle la posición del rol o intentar con algún otro rol.');
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                } else if (!obtener_rol.editable) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El rol ${obtener_rol} no se puede agregar a la base de datos ya que no puedo editar/agregar ese rol a los usuarios.`);
                    e.setFooter('Puedes bajarle la posición del rol o intentar con algún otro rol.');
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let embed_add = new MessageEmbed();
                embed_add.setColor(client.colorDefault);
                embed_add.setDescription(`${client.emojiSuccess} El rol ${obtener_rol} fue **__agregado__** correctamente.`);
                await client.db.push(`${message.guild.id}.auto_roles.user_rol`, obtener_rol.id);
                return message.reply({ embeds: [embed_add], allowedMentions: { repliedUser: false } });
            } else if (["bot", "-bot"].includes(args[1])) { // ADD BOT
                if (bot_roles.length === 25) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Este servidor ha alcanzado el limite de roles para bots __25__`);
                    e.setFooter(`Si quieres remover algún rol para bots escribe en el chat: ${prefix}auto-roles remove -bot [@rol]`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }
                let obtener_rol = message.mentions.roles.first() || message.guild.roles.cache.find(x => x.name.toLowerCase() === args.slice(2).join(' ').toLowerCase()) || message.guild.roles.cache.get(args[2]);
                if (!obtener_rol) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar __el rol que quieres agregar para los bots__.`);
                    e.setFooter(`También puedes ingresar su id o nombre.`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                if (!message.guild.roles.cache.has(obtener_rol.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar __el rol que quieres agregar para los bots__.`);
                    e.setFooter(`También puedes ingresar su id o nombre.`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                if (obtener_rol.id == message.guild.id) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No se puede agregar ni remover el rol <@&${message.guild.id}>`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                for (var i = 0; i < bot_roles.length; i++) {
                    if (obtener_rol.id === bot_roles[i]) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} El rol ${obtener_rol} ya esta establecido en la base de datos.`);
                        e.setFooter(`Si deseas removerlo escribe en el chat: ${prefix}auto-roles remove -bot [@rol]`);
                        return message.reply({
                            embeds: [e],
                            allowedMentions: {
                                repliedUser: false
                            }
                        });
                    }
                }

                let clientRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
                let obtener_rol_possition = obtener_rol.position;
                let authorRolePossition = message.member.roles.highest.position;

                if (authorRolePossition.position <= obtener_rol_possition) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El sistema fue cancelado, La posición del rol ${obtener_rol} es mayor o igual a la posición de rol mas alta que tienes. (${authorRolePossition}).`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                } else if (clientRolePossition <= obtener_rol_possition) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El rol ${obtener_rol} no se puede agregar a la base de datos ya que el rol tiene una posición mayor o igual a la de mi rol, Lo que significa que no puedo agregar ese rol a los usuarios.`);
                    e.setFooter('Puedes bajarle la posición del rol o intentar con algún otro rol.');
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                } else if (!obtener_rol.editable) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El rol ${obtener_rol} no se puede agregar a la base de datos ya que no puedo editar/agregar ese rol a los usuarios.`);
                    e.setFooter('Puedes bajarle la posición del rol o intentar con algún otro rol.');
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let embed_add = new MessageEmbed();
                embed_add.setColor(client.colorDefault);
                embed_add.setDescription(`${client.emojiSuccess} El rol ${obtener_rol} fue **__agregado__** correctamente.`);
                auto_roles.push(`${message.guild.id}.bot_rol`, obtener_rol.id);
                return message.reply({
                    embeds: [embed_add],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }
        } else if (["-remove", "remove", "-rm", "rm"].includes(args[0])) {
            let user_roles = await client.db.get(`${message.guild.id}.auto_roles.user_rol`);
            let bot_roles = await client.db.get(`${message.guild.id}.auto_roles.bot_rol`);
            if (!await client.db.has(`${message.guild.id}.auto_roles`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de __auto-roles__ no esta activado en este servidor.`);
                e.setFooter(`Si desea activar el sistema de auto-roles escriba en el chat: ${prefix}auto-roles on.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Los parámetros disponibles son: \`-user\` para remover un rol que este __establecido en la base de datos de roles de usuarios__ y \`-bot\` para remover un rol que este __establecido en la base de datos de roles de bots__.`);
                e.setFooter(`Si quieres ver los roles establecidos en este servidor de bots o usuarios escribe en el chat: ${prefix}auto-roles [roles -user | -bot]`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (!["-user", "user", "-bot", "bot"].includes(args[1])) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Los parámetros disponibles son: \`-user\` para remover un rol que este __establecido en la base de datos de roles de usuarios__ y \`-bot\` para remover un rol que este __establecido en la base de datos de roles de bots__.`);
                e.setFooter(`Si quieres ver los roles establecidos en este servidor de bots o usuarios escribe en el chat: ${prefix}auto-roles [roles -user | -bot]`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (["-user", "user"].includes(args[1])) { //REMOVE USER
                if (user_roles.length === 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Aún no hay roles de usuarios para remover.`);
                    e.setFooter(`Si quieres agregar un rol para usuarios necesitas escribir en el chat: ${prefix}auto-roles add -user [@rol]`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let obtener_rol = message.mentions.roles.first() || message.guild.roles.cache.find(x => x.name.toLowerCase() === args.slice(2).join(' ').toLowerCase()) || message.guild.roles.cache.get(args[2]);
                if (!obtener_rol) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar __el rol que quieres remover para los usuarios__.`);
                    e.setFooter(`También puedes ingresar su id o nombre.`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                if (!message.guild.roles.cache.has(obtener_rol.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar __el rol que quieres remover para los usuarios__.`);
                    e.setFooter(`También puedes ingresar su id o nombre.`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                if (obtener_rol.id == message.guild.id) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No se puede agregar ni remover el rol <@&${message.guild.id}>`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                for (var i = 0; i < user_roles.length; i++) {
                    if (obtener_rol.id === user_roles[i]) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} El rol ${obtener_rol} acaba de ser **__removido__** correctamente de la base de datos.`);
                        e.setFooter(`Si deseas agregarlo escribe en el chat: ${prefix}auto-roles add -user [@rol]`);
                        auto_roles.extract(`${message.guild.id}.user_rol`, user_roles[i]);
                        return message.reply({
                            embeds: [e],
                            allowedMentions: {
                                repliedUser: false
                            }
                        });
                    }
                }

                let verificadorarray = "";
                user_roles.forEach(res => {
                    if (!verificadorarray.includes(res)) verificadorarray += `${res}, `
                });

                if (!verificadorarray.includes(obtener_rol.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El rol ${obtener_rol} aún no esta establecido en la base de datos.`);
                    e.setFooter(`Si deseas agregarlo escribe en el chat: ${prefix}auto-roles add -user [@rol]`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }
            } else if (["-bot", "bot"].includes(args[1])) { // REMOVE BOT
                if (bot_roles.length === 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Aún no hay roles de bots para remover.`);
                    e.setFooter(`Si quieres agregar un rol para los bots necesitas escribir en el chat: ${prefix}auto-roles add -bot [@rol]`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let obtener_rol = message.mentions.roles.first() || message.guild.roles.cache.find(x => x.name.toLowerCase() === args.slice(2).join(' ').toLowerCase()) || message.guild.roles.cache.get(args[2]);
                if (!obtener_rol) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar __el rol que quieres remover para los bots__.`);
                    e.setFooter(`También puedes ingresar su id o nombre.`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                if (!message.guild.roles.cache.has(obtener_rol.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Necesitas mencionar __el rol que quieres remover para los bots__.`);
                    e.setFooter(`También puedes ingresar su id o nombre.`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                if (obtener_rol.id == message.guild.id) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} No se puede agregar ni remover el rol <@&${message.guild.id}>`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                for (var i = 0; i < bot_roles.length; i++) {
                    if (obtener_rol.id === bot_roles[i]) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} El rol ${obtener_rol} acaba de ser **__removido__** correctamente de la base de datos.`);
                        e.setFooter(`Si deseas agregarlo escribe en el chat: ${prefix}auto-roles add -bot [@rol]`);
                        auto_roles.extract(`${message.guild.id}.bot_rol`, bot_roles[i]);
                        return message.reply({
                            embeds: [e],
                            allowedMentions: {
                                repliedUser: false
                            }
                        });
                    }
                }

                let verificadorarray = "";
                bot_roles.forEach(res => {
                    if (!verificadorarray.includes(res)) verificadorarray += `${res}, `
                });

                if (!verificadorarray.includes(obtener_rol.id)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} El rol ${obtener_rol} aún no esta establecido en la base de datos.`);
                    e.setFooter(`Si deseas agregarlo escribe en el chat: ${prefix}auto-roles add -bot [@rol]`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }
            }
        } else if (["-list", "list", "-lista", "lista", "-roles", "roles"].includes(args[0])) {
            let user_roles = await client.db.get(`${message.guild.id}.auto_roles.user_rol`);
            let bot_roles = await client.db.get(`${message.guild.id}.auto_roles.bot_rol`);
            if (!await client.db.has(`${message.guild.id}.auto_roles.user_rol`)) await client.db.set(`${message.guild.id}.auto_roles.user_rol`, new Array());
            if (!await client.db.has(`${message.guild.id}.auto_roles.user_rol`)) await client.db.set(`${message.guild.id}.auto_roles.bot_rol`, new Array());
            if (!await client.db.has(`${message.guild.id}.auto_roles`)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El sistema de __auto-roles__ no esta activado en este servidor.`);
                e.setFooter(`Si desea activar el sistema de auto-roles escriba en el chat: ${prefix}auto-roles on.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            if (!args[1]) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Los parámetros disponibles son: \`-user\` para ver la lista de roles establecidos para los usuarios y \`-bot\` para ver la lista de roles establecidos para los bots.`);
                e.setFooter(`Si quieres ver los roles establecidos en este servidor de bots o usuarios escribe en el chat: ${prefix}auto-roles -list [-user | -bot]`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (!["-bot", "-bots", "bot", "bots", "-user", "-users", "users", "user"].includes(args[1])) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Los parámetros disponibles son: \`-user\` para ver la lista de roles establecidos para los usuarios y \`-bot\` para ver la lista de roles establecidos para los bots.`);
                e.setFooter(`Si quieres ver los roles establecidos en este servidor de bots o usuarios escribe en el chat: ${prefix}auto-roles -list [-user | -bot]`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (["-user", "-users", "users", "user"].includes(args[1])) {
                if (user_roles.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Aún no hay roles establecidos para visualizar.`);
                    e.setFooter(`Si quieres agregar un rol para usuarios necesitas escribir en el chat: ${prefix}auto-roles add -user [@rol]`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                for (var i = 0; i < user_roles.length; i++) {
                    if (!message.guild.roles.cache.has(user_roles[i])) auto_roles.pull(`${message.guild.id}.auto_roles.user_rol`, user_roles[i]);
                }

                let updated_user_roles_array_check = await client.db.get(`${message.guild.id}.auto_roles.user_rol`);
                if (updated_user_roles_array_check.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Aún no hay roles establecidos para visualizar.`);
                    e.setFooter(`Si quieres agregar un rol para usuarios necesitas escribir en el chat: ${prefix}auto-roles add -user [@rol]`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let autoroles_map = await client.db.get(`${message.guild.id}.auto_roles.user_rol`).map((id, key) => [key, id]);
                if (autoroles_map) {
                    let userlist = new Array(),
                        index = 1,
                        pos = 0;
                    while (autoroles_map.length > 0) userlist.push(autoroles_map.splice(0, 10).map(u => `${index++}# | ${message.guild.roles.cache.get(u[1]).name} [ID: ${u[1]}]`));
                    const roles_bot_left = new DiscordUtils().button_id_generator(20);
                    const roles_bot_x = new DiscordUtils().button_id_generator(20);
                    const roles_bot_right = new DiscordUtils().button_id_generator(20);
                    const roles_bot_left_lock = new DiscordUtils().button_id_generator(20);
                    const roles_bot_x_lock = new DiscordUtils().button_id_generator(20);
                    const roles_bot_right_lock = new DiscordUtils().button_id_generator(20);
                    const buttons_unlock = new MessageActionRow().addComponents(
                        new MessageButton().setLabel("←").setCustomId(roles_bot_left).setStyle('PRIMARY'),
                        new MessageButton().setLabel("❌").setCustomId(roles_bot_x).setStyle('DANGER'),
                        new MessageButton().setLabel("→").setCustomId(roles_bot_right).setStyle('PRIMARY'), );

                    const buttons_lock = new MessageActionRow().addComponents(
                        new MessageButton().setLabel("←").setCustomId(roles_bot_left_lock).setStyle('PRIMARY').setDisabled(true),
                        new MessageButton().setLabel("❌").setCustomId(roles_bot_x_lock).setStyle('DANGER').setDisabled(true),
                        new MessageButton().setLabel("→").setCustomId(roles_bot_right_lock).setStyle('PRIMARY').setDisabled(true), );

                    const embed = new MessageEmbed()
                    embed.setColor(client.colorDefault)
                    embed.setThumbnail(client.user.thumbnailGIF)
                    embed.setDescription(`
Esta es la lista de roles para los usuarios establecidos en el __auto-roles__.

\`\`\`
${userlist[0].join('\n')}
\`\`\``)
                    embed.setFooter(`Pagina 1 de ${userlist.length}`)
                    let msg2 = await message.reply({
                        embeds: [embed],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                    if (userlist.length == 1) return;
                    await msg2.edit({
                        embeds: [embed],
                        components: [buttons_unlock]
                    }).catch(error => {});

                    let button_collector_filter = x => x.user.id == message.author.id;
                    let collector = await msg2.channel.createMessageComponentCollector({
                        button_collector_filter,
                        idle: 30000,
                        errors: ["idle"]
                    });

                    collector.on('collect', async (btn) => {
                        btn.reply.defer();
                        switch (btn.id) {
                            case roles_bot_left:
                                pos = pos <= 0 ? (userlist.length - 1) : pos - 1
                                break;
                            case roles_bot_x:
                                collector.stop("x");
                                break;
                            case roles_bot_right:
                                pos = pos >= userlist.length - 1 ? 0 : pos + 1
                                break;
                        }

                        let embed_ = new MessageEmbed()
                        embed_.setColor(client.colorDefault)
                        embed_.setThumbnail(client.user.displayAvatarURL())
                        embed_.setDescription(`
  Esta es la lista de roles para los usuarios establecidos en el __auto-roles__.
               
\`\`\`
${userlist[pos].join('\n')}
\`\`\``)
                        embed_.setFooter(`Pagina ${pos+1} de ${userlist.length}`)

                        await msg2.edit({
                            embeds: [embed_],
                            components: [buttons_unlock],
                        }).catch(error => {});
                    });
                    collector.on("end", (_, reason) => {
                        if (reason === "x") {
                            if (msg2.deletable) msg2.delete();
                            if (message.deletable) return message.delete();
                        }

                        let embed_ = new MessageEmbed()
                        embed_.setColor(client.colorDefault)
                        embed_.setThumbnail(client.user.displayAvatarURL())
                        embed_.setDescription(`
Esta es la lista de roles para los usuarios establecidos en el __auto-roles__.
               
\`\`\`
${userlist[pos].join('\n')}
\`\`\``)
                        embed_.setFooter(`Pagina ${pos+1} de ${userlist.length}`)
                        return msg2.edit({
                            embeds: [embed_],
                            components: [buttons_lock],
                        })
                    });
                };
            } else if (["-bot", "-bots", "bot", "bots"].includes(args[1])) {
                if (bot_roles.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Aún no hay roles establecidos para visualizar.`);
                    e.setFooter(`Si quieres agregar un rol para bots necesitas escribir en el chat: ${prefix}auto-roles add -bot [@rol]`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                for (var i = 0; i < bot_roles.length; i++) {
                    if (!message.guild.roles.cache.has(bot_roles[i])) await client.db.pull(`${message.guild.id}.auto_roles.bot_rol`, bot_roles[i]);
                }

                let updated_bot_roles_array_check = await client.db.get(`${message.guild.id}.auto_roles.bot_rol`);
                if (updated_bot_roles_array_check.length == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Aún no hay roles establecidos para visualizar.`);
                    e.setFooter(`Si quieres agregar un rol para bots necesitas escribir en el chat: ${prefix}auto-roles add -bot [@rol]`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let autoroles_map = await client.db.get(`${message.guild.id}.auto_roles.bot_rol`).map((id, key) => [key, id]);
                if (autoroles_map) {
                    let botlist = new Array(),
                        index = 1,
                        pos = 0;

                    while (autoroles_map.length > 0) botlist.push(autoroles_map.splice(0, 10).map(u => `${index++}# | ${message.guild.roles.cache.get(u[1]).name} [ID: ${u[1]}]`));
                    const roles_bot_left = new DiscordUtils().button_id_generator(20);
                    const roles_bot_x = new DiscordUtils().button_id_generator(20);
                    const roles_bot_right = new DiscordUtils().button_id_generator(20);
                    const roles_bot_left_lock = new DiscordUtils().button_id_generator(20);
                    const roles_bot_x_lock = new DiscordUtils().button_id_generator(20);
                    const roles_bot_right_lock = new DiscordUtils().button_id_generator(20);
                    const buttons_unlock = new MessageActionRow().addComponents(
                        new MessageButton().setLabel("←").setCustomId(roles_bot_left).setStyle('PRIMARY'),
                        new MessageButton().setLabel("❌").setCustomId(roles_bot_x).setStyle('DANGER'),
                        new MessageButton().setLabel("→").setCustomId(roles_bot_right).setStyle('PRIMARY'), );

                    const buttons_lock = new MessageActionRow().addComponents(
                        new MessageButton().setLabel("←").setCustomId(roles_bot_left_lock).setStyle('PRIMARY').setDisabled(true),
                        new MessageButton().setLabel("❌").setCustomId(roles_bot_x_lock).setStyle('DANGER').setDisabled(true),
                        new MessageButton().setLabel("→").setCustomId(roles_bot_right_lock).setStyle('PRIMARY').setDisabled(true), );

                    const embed = new MessageEmbed()
                    embed.setColor(client.colorDefault)
                    embed.setThumbnail(client.user.displayAvatarURL())
                    embed.setDescription(`
Esta es la lista de roles para los bots establecidos en el __auto-roles__.

\`\`\`
${botlist[0].join('\n')}
\`\`\``)
                    embed.setFooter(`Pagina 1 de ${botlist.length}`)
                    let msg2 = await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
                    if (botlist.length == 1) return;
                    await msg2.edit({
                        embeds: [embed],
                        components: [buttons_unlock],
                    }).catch(error => {});

                    let button_collector_filter = x => x.user.id == message.author.id;
                    let collector = await msg2.channel.createMessageComponentCollector({
                        button_collector_filter,
                        idle: 30000,
                        errors: ["idle"]
                    });
                    collector.on('collect', async (btn) => {
                        switch (btn.customId) {
                            case roles_bot_left:
                                pos = pos <= 0 ? (botlist.length - 1) : pos - 1
                                break;
                            case roles_bot_x:
                                collector.stop("x");
                                break;
                            case roles_bot_right:
                                pos = pos >= botlist.length - 1 ? 0 : pos + 1
                                break;
                        }

                        let embed_ = new MessageEmbed()
                        embed_.setColor(client.colorDefault)
                        embed_.setThumbnail(client.user.displayAvatarURL())
                        embed_.setDescription(`
  Esta es la lista de roles para los bots establecidos en el __auto-roles__.
         
\`\`\`      
${botlist[pos].join('\n')}
\`\`\``)
                        embed_.setFooter(`Pagina ${pos+1} de ${botlist.length}`)

                        await msg2.edit({
                            embeds: [embed_],
                            components: [buttons_unlock],
                        }).catch(error => {});
                    });
                    collector.on("end", (reason) => {
                        if (reason == "x") {
                            if (msg2.deletable) msg2.delete();
                            if (message.deletable) return message.delete();
                        } else {
                            let embed_ = new MessageEmbed()
                            embed_.setColor(client.colorDefault)
                            embed_.setThumbnail(client.user.displayAvatarURL())
                            embed_.setDescription(`
  Esta es la lista de roles para los usuarios establecidos en el __auto-roles__.
               
\`\`\`
${botlist[pos].join('\n')}
\`\`\``)
                            embed_.setFooter(`Pagina ${pos+1} de ${botlist.length}`)
                            return msg2.edit({
                                embeds: [embed_],
                                components: [buttons_lock],
                            });
                        }
                    });
                };
            }
        }
    }
});