const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index"), moment = require("moment"), moment_time = require('moment-timezone');
require("moment-duration-format");

module.exports = new Comando({
    nombre: "add-command",
    alias: [
        "command-add", "addcommand", "commandadd",
        "custom-commands", "custom-cmd", "custom-cmds",
        "customcmds", "customcmd", "customcommands",
        "customcommand", "comandos-personalizados", "comando-personalizado"
    ],
    categoria: "Moderador",
    descripcion: "Establece comandos personalizados para el servidor!",
    ejemplo: "$add-command [add | edit | remove | list]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }

        if (!args[0]) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`
**D-ConfigBot [\`Comandos Personalizados\`]**

${prefix}add-command \`add\` Para **agregar** un nuevo comando personalizado en el servidor.
${prefix}add-command \`remove\` Para **remover** un comando personalizado del servidor.
${prefix}add-command \`edit\` Para **editar** un comando personalizado __ya existente__.
${prefix}add-command \`list\` Para **mostrar** la lista de comandos personalizados en este servidor.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
        } else if (["-add", "-agregar", "add", "agregar"].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.custom_cmds`)) await client.db.set(`${message.guild.id}.custom_cmds`, new Array());
            let arraycomandos = await client.db.get(`${message.guild.id}.custom_cmds`);
            if (arraycomandos.length >= 30) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} El servidor tiene un **limite de 30 comandos personalizados**.`);
                e.setFooter({ text: `Puedes remover un comando personalizado escribiendo en el chat: ${prefix}add-command remove` });
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }
            let cmd_nombre = "";
            let cmd_tipo = "";
            let cmd_respuesta = "";
            let new_command_embed = new MessageEmbed();
            new_command_embed.setColor(client.colorDefault);
            new_command_embed.setDescription(`${client.emojiSuccess} **1/3** Escribe en el chat el nombre del comando personalizado que deseas **__agregar__**.`);
            new_command_embed.setFooter({ text: 'Para cancelar este sistema escribe en el chat "cancelar".' });
            let send_new_command = await message.reply({ embeds: [new_command_embed], allowedMentions: { repliedUser: false } });
            let filter = x => x.author.id == message.author.id;
            let new_command_collector = await message.channel.createMessageCollector({
                filter,
                max: 1,
                idle: 60000,
                errors: ["idle"]
            });

            await new_command_collector.on("collect", async (m) => {
                let new_command_results = await m.content.replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").toLowerCase();
                if (["cancelar", "cancel", "detener"].includes(new_command_results)) {
                    let new_command_embed_cancelado = new MessageEmbed();
                    new_command_embed_cancelado.setColor(client.colorDefault);
                    new_command_embed_cancelado.setDescription(`${client.emojiSuccess} El sistema fue cancelado correctamente.`);
                    await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                    if (message.deletable) setTimeout(() => message.delete(), 10000);
                    message.channel.messages.fetch(m.id).then(async (msg2) => {
                        if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                    });
                    return setTimeout(() => send_new_command.delete(), 10000);
                } else if (client.tiene_comando(new_command_results)) {
                    let new_command_embed_cancelado = new MessageEmbed();
                    new_command_embed_cancelado.setColor(client.colorDefault);
                    new_command_embed_cancelado.setDescription(`${client.emojiError} Sistema cancelado, __No puedes ponerle el nombre o alias de un comando ya existente__ en el bot.`);
                    await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                    if (message.deletable) setTimeout(() => message.delete(), 10000);
                    await message.channel.messages.fetch(m.id).then(async (msg2) => {
                        if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                    });
                    return setTimeout(() => send_new_command.delete(), 10000);
                }
                for (var i = 0; i < arraycomandos.length; i++) {
                    let verificadorarray = "";
                    arraycomandos.forEach(res => {
                        if (!verificadorarray.includes(`${res.nombre_cmd}`)) verificadorarray += `${res.nombre_cmd}, `
                    });
                    if (verificadorarray.includes(new_command_results)) {
                        let new_command_embed_cancelado = new MessageEmbed();
                        new_command_embed_cancelado.setColor(client.colorDefault);
                        new_command_embed_cancelado.setDescription(`${client.emojiError} El comando **__${new_command_results}__** ya esta agregado en este servidor.`);
                        new_command_embed_cancelado.setFooter({ text: `Puedes remover el comando personalizado con: ${prefix}add-command remove | Puedes editar el comando personalizado con: ${prefix}add-command edit` });
                        await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                        if (message.deletable) setTimeout(() => message.delete(), 10000);
                        await message.channel.messages.fetch(m.id).then(async (msg2) => {
                            if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                        });
                        return setTimeout(() => send_new_command.delete(), 10000);;
                    }
                }
                cmd_nombre = new_command_results
                await message.channel.messages.fetch(m.id).then(async (msg2) => {
                    if (msg2.deletable) msg2.delete();
                });

                let tipo_command_embed = new MessageEmbed();
                tipo_command_embed.setColor(client.colorDefault);
                tipo_command_embed.setDescription(`${client.emojiSuccess} **2/3** Escribe en el chat el tipo de comando que quieres establecer para el comando personalizado, **__Embed o Texto__**.

    • Nombre: **${cmd_nombre}**
                    `);
                tipo_command_embed.setFooter({ text: 'Para cancelar este sistema escribe en el chat "cancelar".' });
                let send_tipo_embed = await send_new_command.edit({ embeds: [tipo_command_embed] });
                let filter = x => x.author.id == message.author.id;
                let tipo_command_collector = await message.channel.createMessageCollector({
                    filter,
                    max: 1,
                    idle: 60000,
                    errors: ["idle"]
                });

                await tipo_command_collector.on("collect", async (tipo) => {
                    let tipo_command_results = await tipo.content.toLowerCase();
                    if (["cancelar", "cancel", "detener"].includes(tipo_command_results)) {
                        let new_command_embed_cancelado = new MessageEmbed();
                        new_command_embed_cancelado.setColor(client.colorDefault);
                        new_command_embed_cancelado.setDescription(`${client.emojiSuccess} El sistema fue cancelado correctamente.`);
                        await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                        if (message.deletable) setTimeout(() => message.delete(), 10000);
                        message.channel.messages.fetch(tipo.id).then(async (msg2) => {
                            if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                        });
                        return setTimeout(() => send_new_command.delete(), 10000);
                    } 
                    
                    if (!["embed", "texto", "text", "txt", "embeds"].includes(tipo_command_results)) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} El tipo de comando que ingresaste no es valido.`);
                        e.setFooter({ text: 'Sistema Cancelado correctamente' });
                        await send_new_command.edit({ embeds: [e] })
                        if (message.deletable) setTimeout(() => message.delete(), 10000);
                        message.channel.messages.fetch(tipo.id).then(async (msg2) => {
                            if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                        })
                        return setTimeout(() => send_new_command.delete(), 10000);
                    }

                    if (["text", "texto", "txt"].includes(tipo_command_results)) {
                        let e = new MessageEmbed()
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiSuccess} El tipo del comando sera __texto__.`);
                        send_new_command.edit({ embesd: [e] });
                        cmd_tipo = tipo_command_results.replace("texto", "text").replace("txt", "text");
                    } else if (["embed", "embeds"]) {
                        let e = new MessageEmbed()
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiSuccess} El tipo del comando sera __embed__.`);
                        send_new_command.edit({ embeds: [e] });
                        cmd_tipo = tipo_command_results.replace("embeds", "embed");
                    }

                    await message.channel.messages.fetch(tipo.id).then(async (msg2) => {
                        if (msg2.deletable) msg2.delete();
                    });


                    let respuesta_command_embed = new MessageEmbed();
                    respuesta_command_embed.setColor(client.colorDefault);
                    respuesta_command_embed.setDescription(`${client.emojiSuccess} **3/3** Escribe en el chat la respuesta para el comando personalizado.

    • Nombre: **${cmd_nombre}**
    • Tipo: **${cmd_tipo}**
                    `);
                    respuesta_command_embed.setFooter({ text: 'Para cancelar este sistema escribe en el chat "cancelar".' });
                    let send_respuesta_embed = await send_new_command.edit({ embeds: [respuesta_command_embed] });
                    let filter = x => x.author.id == message.author.id;
                    let respuesta_command_collector = await message.channel.createMessageCollector({
                        filter,
                        max: 1,
                        idle: 60000,
                        errors: ["idle"]
                    });

                    await respuesta_command_collector.on("collect", async (respuesta) => {
                        let respuesta_command_results = await respuesta.content.toLowerCase();
                        if (["cancelar", "cancel", "detener"].includes(respuesta_command_results)) {
                            let new_command_embed_cancelado = new MessageEmbed();
                            new_command_embed_cancelado.setColor(client.colorDefault);
                            new_command_embed_cancelado.setDescription(`${client.emojiSuccess} El sistema fue cancelado correctamente.`);
                            await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                            if (message.deletable) setTimeout(() => message.delete(), 10000);
                            message.channel.messages.fetch(respuesta.id).then(async (msg2) => {
                                if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                            });
                            return setTimeout(() => send_new_command.delete(), 10000);
                        }
                        cmd_respuesta = respuesta_command_results;

                        let new_command_complete = new MessageEmbed();
                        new_command_complete.setColor(client.colorDefault);
                        new_command_complete.setDescription(`${client.emojiSuccess} El comando personalizado **\`${cmd_nombre}\`** fue correctamente agregado.
• Nombre: \`${cmd_nombre}\`
• Tipo: \`${cmd_tipo}\`
• Respuesta: \`${cmd_respuesta}\`
• Como ejecutarlo: \`${prefix}${cmd_nombre}\``)
                        send_new_command.edit({ embeds: [new_command_complete] });
                        message.channel.messages.fetch(respuesta.id).then(async (msg2) => {
                            if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                        });
                        
                        return await client.db.push(`${message.guild.id}.custom_cmds`, {
                            nombre_cmd: cmd_nombre,
                            tipo_cmd: cmd_tipo,
                            respuesta_cmd: cmd_respuesta,
                            moderador_cmd: message.author.id,
                            fecha_cmd: moment_time(message.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss")
                        });

                    });
                    await respuesta_command_collector.on("end", async (m) => {
                        if (m.size < 1) {
                            let new_command_embed_cancelado = new MessageEmbed();
                            new_command_embed_cancelado.setColor(client.colorDefault);
                            new_command_embed_cancelado.setDescription(`${client.emojiError} Sistema cancelado, Tardaste demasiado en escribir el nombre del comando personalizado.`);
                            send_new_command.edit({ embeds: [new_command_embed_cancelado] });
                            if (message.deletable) setTimeout(() => message.delete(), 10000);
                            return setTimeout(() => send_new_command.delete(), 10000);
                        }
                    });
                });
                await tipo_command_collector.on("end", async (m) => {
                    if (m.size < 1) {
                        let new_command_embed_cancelado = new MessageEmbed();
                        new_command_embed_cancelado.setColor(client.colorDefault);
                        new_command_embed_cancelado.setDescription(`${client.emojiError} Sistema cancelado, Tardaste demasiado en escribir el nombre del comando personalizado.`);
                        send_new_command.edit({ embeds: [new_command_embed_cancelado] });
                        if (message.deletable) setTimeout(() => message.delete(), 10000)
                        return setTimeout(() => send_new_command.delete(), 10000);;
                    }
                });
            });

            await new_command_collector.on("end", async (m) => {
                if (m.size < 1) {
                    let new_command_embed_cancelado = new MessageEmbed();
                    new_command_embed_cancelado.setColor(client.colorDefault);
                    new_command_embed_cancelado.setDescription(`${client.emojiError} Sistema cancelado, Tardaste demasiado en escribir el nombre del comando personalizado.`);
                    send_new_command.edit({ embeds: [new_command_embed_cancelado] });
                    if (message.deletable) setTimeout(() => message.delete(), 10000);
                    return setTimeout(() => send_new_command.delete(), 10000);
                }
            });
        } else if (["edit", "editar"].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.custom_cmds`)) await client.db.set(`${message.guild.id}.custom_cmds`, new Array());
            let arraycomandos = await client.db.get(`${message.guild.id}.custom_cmds`);
            if (arraycomandos.length === 0) {
                let embed_error = new MessageEmbed();
                embed_error.setColor(client.colorDefault);
                embed_error.setDescription(`${client.emojiError} Aún no hay comandos personalizados en este servidor.`);
                embed_error.setFooter({ text: `Puedes agregar un comando personalizado en este servidor escribiendo en el chat: ${prefix}add-command add`});
                return message.reply({ embeds: [embed_error], allowedMentions: { repliedUser: false } });
            }
            let cmd_nombre = "";
            let cmd_tipo = "";
            let cmd_respuesta = "";
            let new_command_embed = new MessageEmbed();
            new_command_embed.setColor(client.colorDefault);
            new_command_embed.setDescription(`${client.emojiSuccess} **1/3** Escribe en el chat el nombre del comando personalizado que deseas *__editar__**.`);
            new_command_embed.setFooter({ text: 'Para cancelar este sistema escribe en el chat "cancelar".'});
            let send_new_command = await message.reply({ embeds: [new_command_embed], allowedMentions: { repliedUser: false } });
            let filter = x => x.author.id == message.author.id;
            let new_command_collector = await message.channel.createMessageCollector({
                filter,
                max: 1,
                idle: 60000,
                errors: ["idle"]
            });

            await new_command_collector.on("collect", async (m) => {
                let new_command_results = await m.content.toLowerCase().replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_").replace(/\s+/g, "_");
                if (["cancelar", "cancel", "detener"].includes(new_command_results)) {
                    let new_command_embed_cancelado = new MessageEmbed();
                    new_command_embed_cancelado.setColor(client.colorDefault);
                    new_command_embed_cancelado.setDescription(`${client.emojiSuccess} El sistema fue cancelado correctamente.`);
                    await send_new_command.edit({ embeds: [new_command_embed_cancelado] });
                    if (message.deletable) setTimeout(() => message.delete(), 10000);
                    message.channel.messages.fetch(m.id).then(async (msg2) => {
                        if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                    });
                    return setTimeout(() => send_new_command.delete(), 10000);
                } else if (client.tiene_comando(new_command_results)) {
                    let new_command_embed_cancelado = new MessageEmbed();
                    new_command_embed_cancelado.setColor(client.colorDefault);
                    new_command_embed_cancelado.setDescription(`${client.emojiError} Sistema cancelado, __No puedes ponerle el nombre o alias de un comando ya existente__ en el bot.`);
                    await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                    if (message.deletable) setTimeout(() => message.delete(), 10000);
                    await message.channel.messages.fetch(m.id).then(async (msg2) => {
                        if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                    });
                    return setTimeout(() => send_new_command.delete(), 10000);
                }
                for (var i = 0; i < arraycomandos.length; i++) {
                    let verificadorarray = "";
                    arraycomandos.forEach(res => {
                        if (!verificadorarray.includes(`${res.nombre_cmd}`)) verificadorarray += `${res.nombre_cmd}, `
                    });

                    if (!verificadorarray.includes(new_command_results)) {
                        let new_command_embed_cancelado = new MessageEmbed();
                        new_command_embed_cancelado.setColor(client.colorDefault);
                        new_command_embed_cancelado.setDescription(`${client.emojiError} El comando **__${new_command_results}__** no está registrado en este servidor.`);
                        new_command_embed_cancelado.setFooter({ text: `Puedes agregar un comando personalizado con: ${prefix}add-command add | Puedes remover un comando personalizado con: ${prefix}add-command remove`});
                        await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                        if (message.deletable) setTimeout(() => message.delete(), 10000);
                        await message.channel.messages.fetch(m.id).then(async (msg2) => {
                            if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                        });
                        return setTimeout(() => send_new_command.delete(), 10000);;
                    }
                }
                cmd_nombre = new_command_results;
                await message.channel.messages.fetch(m.id).then(async (msg2) => {
                    if (msg2.deletable) msg2.delete();
                });

                let tipo_command_embed = new MessageEmbed();
                tipo_command_embed.setColor(client.colorDefault);
                tipo_command_embed.setDescription(`${client.emojiSuccess} **2/3** Escribe en el chat el tipo de comando que quieres establecer para el comando personalizado, **__Embed o Texto__**.

    • Nombre: **${cmd_nombre}**
                    `);
                tipo_command_embed.setFooter({ text: 'Para cancelar este sistema escribe en el chat "cancelar".' });
                let send_tipo_embed = await send_new_command.edit({ embeds: [tipo_command_embed] });
                let filter = x => x.author.id == message.author.id;
                let tipo_command_collector = await message.channel.createMessageCollector({
                    filter,
                    max: 1,
                    idle: 60000,
                    errors: ["idle"]
                });
                await tipo_command_collector.on("collect", async (tipo) => {
                    let tipo_command_results = await tipo.content.toLowerCase();
                    if (["cancelar", "cancel", "detener"].includes(tipo_command_results)) {
                        let new_command_embed_cancelado = new MessageEmbed();
                        new_command_embed_cancelado.setColor(client.colorDefault);
                        new_command_embed_cancelado.setDescription(`${client.emojiSuccess} El sistema fue cancelado correctamente.`);
                        await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                        if (message.deletable) setTimeout(() => message.delete(), 10000);
                        message.channel.messages.fetch(tipo.id).then(async (msg2) => {
                            if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                        });
                        return setTimeout(() => send_new_command.delete(), 10000);
                    } else if (["text", "texto", "txt"].includes(tipo_command_results)) {
                        let e = new MessageEmbed()
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiSuccess} El tipo del comando sera __texto__.`);
                        send_new_command.edit({ embeds: [e] });
                        cmd_tipo = tipo_command_results.replace("texto", "text").replace("txt", "text");
                    } else if (["embed", "embeds"].includes(tipo_command_results)) {
                        let e = new MessageEmbed()
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiSuccess} El tipo del comando sera __embed__.`);
                        send_new_command.edit({ embeds: [e] });
                        cmd_tipo = tipo_command_results.replace("embeds", "embed");
                    }

                    await message.channel.messages.fetch(tipo.id).then(async (msg2) => {
                        if (msg2.deletable) msg2.delete();
                    });

                    let respuesta_command_embed = new MessageEmbed();
                    respuesta_command_embed.setColor(client.colorDefault);
                    respuesta_command_embed.setDescription(`${client.emojiSuccess} **3/3** Escribe en el chat la respuesta para el comando personalizado.

    • Nombre: **${cmd_nombre}**
    • Tipo: **${cmd_tipo}**
                    `);
                    respuesta_command_embed.setFooter({ text: 'Para cancelar este sistema escribe en el chat "cancelar".' });
                    let send_respuesta_embed = await send_new_command.edit({ embeds: [respuesta_command_embed] });
                    let filter = x => x.author.id == message.author.id;
                    let respuesta_command_collector = await message.channel.createMessageCollector({
                        filter,
                        max: 1,
                        idle: 60000,
                        errors: ["idle"]
                    });
                    await respuesta_command_collector.on("collect", async (respuesta) => {
                        let respuesta_command_results = await respuesta.content.toLowerCase();
                        if (["cancelar", "cancel", "detener"].includes(respuesta_command_results)) {
                            let new_command_embed_cancelado = new MessageEmbed();
                            new_command_embed_cancelado.setColor(client.colorDefault);
                            new_command_embed_cancelado.setDescription(`${client.emojiSuccess} El sistema fue cancelado correctamente.`);
                            await send_new_command.edit({ embeds: [new_command_embed_cancelado] });
                            if (message.deletable) setTimeout(() => message.delete(), 10000);
                            message.channel.messages.fetch(respuesta.id).then(async (msg2) => {
                                if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                            });
                            return setTimeout(() => send_new_command.delete(), 10000);
                        }

                        cmd_respuesta = respuesta_command_results;

                        for (var i = 0; i < arraycomandos.length; i++) {
                            let verificadorarray = "";
                            arraycomandos.forEach(res => {
                                if (!verificadorarray.includes(`${res.nombre_cmd}`)) verificadorarray += `${res.nombre_cmd}, `
                            });
                            if (verificadorarray.includes(cmd_nombre)) {
                                let custom_cmds = await client.db.get(`${message.guild.id}.custom_cmds`)
                                let custom_cmds_filtered = custom_cmds.filter(x => x.nombre_cmd !== cmd_nombre);
                                await client.db.set(`${message.guild.id}.custom_cmds`, custom_cmds_filtered);
                                let new_command_complete = new MessageEmbed();
                                new_command_complete.setColor(client.colorDefault);
                                new_command_complete.setDescription(`${client.emojiSuccess} El comando personalizado **\`${cmd_nombre}\`** fue correctamente editado.
• Nombre: \`${cmd_nombre}\`
• Tipo: \`${cmd_tipo}\`
• Respuesta: \`${cmd_respuesta}\`
• Como ejecutarlo: \`${prefix}${cmd_nombre}\``)
                                send_new_command.edit({ embeds: [new_command_complete] });
                                await client.db.push(`${message.guild.id}.custom_cmds`, {
                                    nombre_cmd: cmd_nombre,
                                    tipo_cmd: cmd_tipo,
                                    respuesta_cmd: cmd_respuesta,
                                    moderador_cmd: message.author.id,
                                    fecha_cmd: moment_time(message.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss")
                                })

                                return message.channel.messages.fetch(respuesta.id).then(async (msg2) => {
                                    if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                                });
                            } else if (!verificadorarray.includes(cmd_nombre)) {
                                let new_command_embed_cancelado = new MessageEmbed();
                                new_command_embed_cancelado.setColor(client.colorDefault);
                                new_command_embed_cancelado.setDescription(`${client.emojiError} El comando **__${new_command_results}__** no está registrado en este servidor.`);
                                new_command_embed_cancelado.setFooter({ text: `Puedes agregar un comando personalizado con: ${prefix}add-command add | Puedes remover un comando personalizado con: ${prefix}add-command remove`});
                                await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                                if (message.deletable) setTimeout(() => message.delete(), 10000);
                                await message.channel.messages.fetch(m.id).then(async (msg2) => {
                                    if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                                });
                                return setTimeout(() => send_new_command.delete(), 10000);
                            }
                        }
                    });
                    await respuesta_command_collector.on("end", async (m) => {
                        if (m.size < 1) {
                            let new_command_embed_cancelado = new MessageEmbed();
                            new_command_embed_cancelado.setColor(client.colorDefault);
                            new_command_embed_cancelado.setDescription(`${client.emojiError} Sistema cancelado, Tardaste demasiado en escribir el nombre del comando personalizado.`);
                            send_new_command.edit({ embeds: [new_command_embed_cancelado] });
                            if (message.deletable) setTimeout(() => message.delete(), 10000);
                            return setTimeout(() => send_new_command.delete(), 10000);
                        }
                    });
                });
                await tipo_command_collector.on("end", async (m) => {
                    if (m.size < 1) {
                        let new_command_embed_cancelado = new MessageEmbed();
                        new_command_embed_cancelado.setColor(client.colorDefault);
                        new_command_embed_cancelado.setDescription(`${client.emojiError} Sistema cancelado, Tardaste demasiado en escribir el nombre del comando personalizado.`);
                        send_new_command.edit({ embeds: [new_command_embed_cancelado] });
                        if (message.deletable) setTimeout(() => message.delete(), 10000);
                        return setTimeout(() => send_new_command.delete(), 10000);;
                    }
                });
            });

            await new_command_collector.on("end", async (m) => {
                if (m.size < 1) {
                    let new_command_embed_cancelado = new MessageEmbed();
                    new_command_embed_cancelado.setColor(client.colorDefault);
                    new_command_embed_cancelado.setDescription(`${client.emojiError} Sistema cancelado, Tardaste demasiado en escribir el nombre del comando personalizado.`);
                    send_new_command.edit({ embeds: [new_command_embed_cancelado] });
                    if (message.deletable) setTimeout(() => message.delete(), 10000);
                    return setTimeout(() => send_new_command.delete(), 10000);
                }
            });
        } else if (["rm", "-rm", "-remove", "-remover", "-delete", "-del", "-eliminar", "-deletear", "remove", "remover", "delete", "del", "eliminar", "deletear"].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.custom_cmds`)) await client.db.set(`${message.guild.id}.custom_cmds`, new Array());
            let arraycomandos = await client.db.get(`${message.guild.id}.custom_cmds`);
            if (arraycomandos.length === 0) {
                let embed_error = new MessageEmbed();
                embed_error.setColor(client.colorDefault);
                embed_error.setDescription(`${client.emojiError} Aún no hay comandos personalizados en este servidor.`);
                embed_error.setFooter({ text: `Puedes agregar un comando personalizado en este servidor escribiendo en el chat: ${prefix}add-command add`});
                return message.reply({ embeds: [embed_error], allowedMentions: { repliedUser: false } });
            }

            let new_command_embed = new MessageEmbed();
            new_command_embed.setColor(client.colorDefault);
            new_command_embed.setDescription(`${client.emojiSuccess} Escribe en el chat el nombre del comando personalizado que deseas **__remover__**.`);
            new_command_embed.setFooter({ text: 'Para cancelar este sistema escribe en el chat "cancelar".' });
            let send_new_command = await message.reply({ embeds: [new_command_embed], allowedMentions: { repliedUser: false } });
            let filter = x => x.author.id == message.author.id;
            let new_command_collector = await message.channel.createMessageCollector({
                filter,
                max: 1,
                idle: 60000,
                errors: ["idle"]
            });

            await new_command_collector.on("collect", async (m) => {
                let new_command_results = await m.content.replaceAll(/\s+/g, "_").toLowerCase();
                if (["cancelar", "cancel", "detener"].includes(new_command_results)) {
                    let new_command_embed_cancelado = new MessageEmbed();
                    new_command_embed_cancelado.setColor(client.colorDefault);
                    new_command_embed_cancelado.setDescription(`${client.emojiSuccess} El sistema fue cancelado correctamente.`);
                    await send_new_command.edit({ embeds: [new_command_embed_cancelado] });
                    if (message.deletable) setTimeout(() => message.delete(), 10000);
                    message.channel.messages.fetch(m.id).then(async (msg2) => {
                        if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                    });
                    return setTimeout(() => send_new_command.delete(), 10000);
                } else if (client.tiene_comando(new_command_results)) {
                    let new_command_embed_cancelado = new MessageEmbed();
                    new_command_embed_cancelado.setColor(client.colorDefault);
                    new_command_embed_cancelado.setDescription(`${client.emojiError} Sistema cancelado, __No puedes remover el nombre de un comando del bot existente__.`);
                    await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                    if (message.deletable) setTimeout(() => message.delete(), 10000);
                    await message.channel.messages.fetch(m.id).then(async (msg2) => {
                        if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                    });
                    return setTimeout(() => send_new_command.delete(), 10000);
                }

                let verificadorarray = "";
                arraycomandos.forEach(res => {
                    if (!verificadorarray.includes(`${res.nombre_cmd}`)) verificadorarray += `${res.nombre_cmd}, `
                })
                if (!verificadorarray.includes(new_command_results)) {
                    let new_command_embed_cancelado = new MessageEmbed();
                    new_command_embed_cancelado.setColor(client.colorDefault);
                    new_command_embed_cancelado.setDescription(`${client.emojiError} El comando **__${new_command_results}__** no está registrado en este servidor.`);
                    new_command_embed_cancelado.setFooter({ text: `Puedes agregar un comando personalizado con: ${prefix}add-command add | Puedes remover un comando personalizado con: ${prefix}add-command remove`});
                    send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                    if (message.deletable) setTimeout(() => message.delete(), 10000);
                    await message.channel.messages.fetch(m.id).then(async (msg2) => {
                        if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                    });
                    return setTimeout(() => send_new_command.delete(), 10000);
                }

                for (var i = 0; i < arraycomandos.length; i++) {
                    if (arraycomandos[i].nombre_cmd === new_command_results) {
                        let customCmdsArray = await client.db.get(`${message.guild.id}.custom_cmds`);
                        let customCmdsArrayFilter = customCmdsArray.filter(x => x.nombre_cmd !== new_command_results);
                        console.log("customCmdsArrayFilter", customCmdsArrayFilter)
                        
                        let new_command_embed_cancelado = new MessageEmbed();
                        new_command_embed_cancelado.setColor(client.colorDefault);
                        new_command_embed_cancelado.setDescription(`${client.emojiSuccess} El comando **__${new_command_results}__** fue correctamente removido del servidor.`);
                        new_command_embed_cancelado.setFooter({ text: `Puedes agregar un comando personalizado con: ${prefix}add-command add | Puedes edit un comando personalizado con: ${prefix}add-command edit`});
                        await send_new_command.edit({ embeds: [new_command_embed_cancelado] })
                        if (message.deletable) setTimeout(() => message.delete(), 10000);
                        await message.channel.messages.fetch(m.id).then(async (msg2) => {
                            if (msg2.deletable) setTimeout(() => msg2.delete(), 10000);
                        });
                        setTimeout(() => send_new_command.delete(), 10000);;
                        return await client.db.set(`${message.guild.id}.custom_cmds`, customCmdsArrayFilter);
                    }
                }
            });
            await new_command_collector.on("end", async (m) => {
                if (m.size < 1) {
                    let new_command_embed_cancelado = new MessageEmbed();
                    new_command_embed_cancelado.setColor(client.colorDefault);
                    new_command_embed_cancelado.setDescription(`${client.emojiError} Sistema cancelado, Tardaste demasiado en escribir el nombre del comando personalizado.`);
                    send_new_command.edit({ embeds: [new_command_embed_cancelado] });
                    if (message.deletable) setTimeout(() => message.delete(), 10000);
                    return setTimeout(() => send_new_command.delete(), 10000);
                }
            });
        } else if (["list", "lista"].includes(args[0].toLowerCase())) {
            if (!await client.db.has(`${message.guild.id}.custom_cmds`)) await client.db.set(`${message.guild.id}.custom_cmds`, new Array());
            let arraycomandos = await client.db.get(`${message.guild.id}.custom_cmds`);
            if (arraycomandos.length === 0) {
                let embed_error = new MessageEmbed();
                embed_error.setColor(client.colorDefault);
                embed_error.setDescription(`${client.emojiError} Aún no hay comandos personalizados en este servidor.`);
                embed_error.setFooter({ text: `Puedes agregar un comando personalizado en este servidor escribiendo en el chat: ${prefix}add-command add`});
                return message.reply({ embeds: [embed_error], allowedMentions: { repliedUser: false } });
            }

            let custom_cmd = await client.db.get(`${message.guild.id}.custom_cmds`)
            let custom_cmd_map = custom_cmd.map((id, key) => [key, id]), index = 1;
            if (custom_cmd_map) {
                let commands_list_array_nombre = new Array(),
                    commands_list_embed = new MessageEmbed();
                while (custom_cmd_map.length > 0) commands_list_array_nombre.push(custom_cmd_map.splice(0, 30).map(u => `${index++}# | ${u[1].nombre_cmd}`));
                commands_list_embed.setColor(client.colorDefault);
                commands_list_embed.setDescription(`
${client.emojiSuccess} __Nombre de los **${commands_list_array_nombre[0].length}/30** comandos personalizados__ que hay en este servidor.

\`\`\`
${commands_list_array_nombre[0].join("\n")}
\`\`\`
`);
                return message.reply({ embeds: [commands_list_embed], allowedMentions: { repliedUser: false } });
            }
        }
    }
});