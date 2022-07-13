const { Comando, MessageEmbed, MessageButton, MessageActionRow } = require("../../ConfigBot/index");
const moment_time = require('moment-timezone');
const sourcebin = require('sourcebin');

module.exports = new Comando({
    nombre: "clear",
    alias: ["purge", "clear-messages", "purge-messages", "clearmessages", "purgemessages"],
    categoria: "Guardia",
    descripcion: "Elimina una especifica cantidad de mensajes mediante el bot.",
    ejemplo: "$clear [cantidad | @user | users | bots | attachments | embeds]",
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

        if (!message.guild.members.cache.get(client.user.id).permissions.has('MANAGE_MESSAGES')) {
            let f = new MessageEmbed()
            f.setDescription(`${client.emojiError} Necesito el permiso **MANAGE_MESSAGES** en este servidor para completar el uso de este comando.`);
            f.setColor(client.colorDefault)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        }

        if (!args[0]) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas ingresar la cantidad de mensajes que quieres eliminar en este canal. La cantidad maxima es **100** mensajes.

**__Opciones:__**
\`\`\`md
* ${prefix}clear [cantidad]
> Eliminar todos los mensajes en la cantidad establecida.
* ${prefix}clear @usuario/id [cantidad]
> Eliminar los mensajes del usuario mencionado.
* ${prefix}clear users [cantidad]
> Eliminar todos los mensajes que sean enviados por usuarios.
* ${prefix}clear bots [cantidad]
> Eliminar todos los mensajes que sean enviados por bots.
* ${prefix}clear attachments [cantidad]
> Eliminar todos los mensajes que contengan archivos/imagenes
* ${prefix}clear embeds [cantidad]
> Eliminar todos los mensajes que contengan un embed.
* ${prefix}clear with [cantidad] [mensaje]
> Eliminar todos los mensajes que contengan la palabra especificada.
\`\`\``);
            return message.reply({
                embeds: [e],
                allowedMentions: {
                    repliedUser: false
                }
            });
        }

        if (![
                "bot", "bots",
                "users", "user",
                "embed", "embeds",
                "with", "word",
                "palabra", "withs",
                "words", "palabras",
                "archivo", "archivos",
                "attachment", "attachments"
            ].includes(args[0])) {
            if (isNaN(args[0])) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar un número valido no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[0]) > 100) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[0]) < 2) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad mayor a **__1__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }
            await message.channel.messages.fetch({
                limit: parseInt(args[0])
            }, false).then(async (messages) => {
                if (messages.partials) await messages.fetch();
                const userMessages = messages;
                await message.channel.bulkDelete(userMessages, true);
                if (userMessages.size === 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.warning} **No he podido eliminar ningun mensaje.**`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let text = "";
                for (let [key, value] of userMessages) {
                    let hora = ` ${moment_time(value.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, HH:mm:ss")}`
                    text += `${hora} | ${value.author.tag}: ${value.content}\n`;
                }
                let bin = await sourcebin.create([{
                    name: `D-ConfigBot [Clear | All] [${message.guild.name}]`,
                    content: `D-ConfigBot - Clear Command\n\n${text}\n\n-Moderator: ${message.author.tag} [ID: ${message.author.id}]`,
                    language: 'text',
                }, ], {
                    title: `D-ConfigBot [Clear | All] [${message.guild.name} | ${message.author.tag}]`,
                    description: `Comando ejecutado por ${message.author.tag} [ID: ${message.author.id}]`,
                }, )

                let button_url = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setStyle("LINK")
                    .setURL(message.url)
                    .setLabel(`Irl al mensaje del Administrador ${message.author.username}`), )

                let e2 = new MessageEmbed();
                e2.setColor(client.colorDefault);
                e2.setDescription(`${client.emojiSuccess} Se han eliminado **__${userMessages.size}/${args[0]}__** mensajes.`);
                message.channel.send({ embeds: [e2], allowedMentions: { repliedUser: false } });
                return lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Clear | All ${userMessages.size}/${args[0]}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Cantidad
> ${userMessages.size}/${args[1]}

* Canal
> #${message.channel.name}
\`\`\``, components: [button_url] });
            });
        }

        let usuarios = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!usuarios) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas ingresar la cantidad de mensajes que quieres eliminar en este canal. La cantidad maxima es **100** mensajes.

**__Opciones:__**
\`\`\`md
* ${prefix}clear [cantidad]
> Eliminar todos los mensajes en la cantidad establecida.
* ${prefix}clear @usuario/id [cantidad]
> Eliminar los mensajes del usuario mencionado.
* ${prefix}clear users [cantidad]
> Eliminar todos los mensajes que sean enviados por usuarios.
* ${prefix}clear bots [cantidad]
> Eliminar todos los mensajes que sean enviados por bots.
* ${prefix}clear attachments [cantidad]
> Eliminar todos los mensajes que contengan archivos/imagenes
* ${prefix}clear embeds [cantidad]
> Eliminar todos los mensajes que contengan un embed.
* ${prefix}clear with [cantidad] [mensaje]
> Eliminar todos los mensajes que contengan la palabra especificada.
\`\`\``);
            return message.reply({
                embeds: [e],
                allowedMentions: {
                    repliedUser: false
                }
            });
        }

        if (!message.guild.members.cache.has(usuarios.id)) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas ingresar la cantidad de mensajes que quieres eliminar en este canal. La cantidad maxima es **100** mensajes.

**__Opciones:__**
\`\`\`md
* ${prefix}clear [cantidad]
> Eliminar todos los mensajes en la cantidad establecida.
* ${prefix}clear @usuario/id [cantidad]
> Eliminar los mensajes del usuario mencionado.
* ${prefix}clear users [cantidad]
> Eliminar todos los mensajes que sean enviados por usuarios.
* ${prefix}clear bots [cantidad]
> Eliminar todos los mensajes que sean enviados por bots.
* ${prefix}clear attachments [cantidad]
> Eliminar todos los mensajes que contengan archivos/imagenes
* ${prefix}clear embeds [cantidad]
> Eliminar todos los mensajes que contengan un embed.
* ${prefix}clear with [cantidad] [mensaje]
> Eliminar todos los mensajes que contengan la palabra especificada.
\`\`\``);
            return message.reply({
                embeds: [e],
                allowedMentions: {
                    repliedUser: false
                }
            });
        }
        if (usuarios) {
            if (isNaN(args[1])) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar un número valido no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) > 100) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) < 2) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad mayor a **__1__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            await message.channel.messages.fetch({
                limit: args[1]
            }, false).then(async (messages) => {
                if (messages.partials) await messages.fetch();
                const userMessages = messages.filter(m => m.author.id === usuarios.id);
                await message.channel.bulkDelete(userMessages, true);
                if (userMessages.size === 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.warning} **No he podido eliminar ningun mensaje.**`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let text = "";
                for (let [key, value] of userMessages) {
                    let hora = ` ${moment_time(value.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, HH:mm:ss")}`
                    text += `${hora} | ${value.author.tag}: ${value.content}\n`;
                }
                let bin = await sourcebin.create([{
                    name: `D-ConfigBot [Clear | User] [${message.guild.name}]`,
                    content: `D-ConfigBot - Clear Command\n\n${text}\n\n-Moderator: ${message.author.tag} [ID: ${message.author.id}]`,
                    language: 'text',
                }, ], {
                    title: `D-ConfigBot [Clear | User] [${message.guild.name} | ${message.author.tag}]`,
                    description: `Comando ejecutado por ${message.author.tag} [ID: ${message.author.id}]`,
                }, )

                let button_url = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setStyle("LINK")
                    .setURL(message.url)
                    .setLabel(`Irl al mensaje del Administrador ${message.author.username}`), )

                let e2 = new MessageEmbed();
                e2.setColor(client.colorDefault);
                e2.setDescription(`${client.emojiSuccess} Se han eliminado **__${userMessages.size}/${args[1]}__** mensajes del usuario **__${usuario.user.username}__**.`);
                message.reply({ embeds: [e2], allowedMentions: { repliedUser: false } });
                return lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Clear | User ${userMessages.size}/${args[1]}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Cantidad
> ${userMessages.size}/${args[1]}

* Canal
> #${message.channel.name}
\`\`\``, components: [button_url] });
            });
        } else if (["bots", "bot"].includes(args[0])) {
            if (isNaN(args[1])) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar un número valido no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) > 100) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) < 2) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad mayor a **__1__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            await message.channel.messages.fetch({
                limit: args[1]
            }).then(async (messages) => {
                if (messages.partials) await messages.fetch();
                const userMessages = messages.filter(m => m.author.bot);
                await message.channel.bulkDelete(userMessages, true);
                if (userMessages.size === 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.warning} **No he podido eliminar ningun mensaje.**`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let text = "";
                for (let [key, value] of userMessages) {
                    let hora = ` ${moment_time(value.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, HH:mm:ss")}`
                    text += `${hora} | ${value.author.tag}: ${value.content}\n`;
                }
                let bin = await sourcebin.create([{
                    name: `D-ConfigBot - [Clear | Bots] [${message.guild.name}]`,
                    content: `D-ConfigBot [Clear | Bots]\n\n${text}\n\n-Moderator: ${message.author.tag} [ID: ${message.author.id}]`,
                    language: 'text',
                }, ], {
                    title: `D-ConfigBot [Clear | Bots] [${message.guild.name} | ${message.author.tag}]`,
                    description: `Comando ejecutado por ${message.author.tag} [ID: ${message.author.id}]`,
                }, )

                let button_url = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setStyle("LINK")
                    .setURL(message.url)
                    .setLabel(`Irl al mensaje del Administrador ${message.author.username}`), )

                let e2 = new MessageEmbed();
                e2.setColor(client.colorDefault);
                e2.setDescription(`${client.emojiSuccess} Se han eliminado **__${userMessages.size}/${args[1]}__** mensajes de bots.`);
                message.reply({ embeds: [e2], allowedMentions: { repliedUser: false } });
                lchannel.send({
                    content: `
\`\`\`md
# D-ConfigBot [Clear | Bots ${userMessages.size}/${args[1]}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Cantidad
> ${userMessages.size}/${args[1]}

* Canal
> #${message.channel.name}
\`\`\``,
                    components: [button_url]
                });
            });
        } else if (["user", "users"].includes(args[0])) {
            if (isNaN(args[1])) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar un número valido no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) > 100) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) < 2) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad mayor a **__1__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            await message.channel.messages.fetch({
                limit: args[1]
            }, false).then(async (messages) => {
                if (messages.partials) await messages.fetch();
                const userMessages = messages.filter(m => !m.author.bot);
                await message.channel.bulkDelete(userMessages, true);
                if (userMessages.size === 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.warning} **No he podido eliminar ningun mensaje.**`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let text = "";
                for (let [key, value] of userMessages) {
                    let hora = ` ${moment_time(value.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, HH:mm:ss")}`
                    text += `${hora} | ${value.author.tag}: ${value.content}\n`;
                }
                let bin = await sourcebin.create([{
                    name: `D-ConfigBot - [Clear | Usuarios] [${message.guild.name}]`,
                    content: `D-ConfigBot [Clear | Usuarios]\n\n${text}\n\n-Moderator: ${message.author.tag} [ID: ${message.author.id}]`,
                    language: 'text',
                }, ], {
                    title: `D-ConfigBot [Clear | Usuarios] [${message.guild.name} | ${message.author.tag}]`,
                    description: `Comando ejecutado por ${message.author.tag} [ID: ${message.author.id}]`,
                }, )

                let button_url = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setStyle("LINK")
                    .setURL(message.url)
                    .setLabel(`Irl al mensaje del Administrador ${message.author.username}`), )

                let e2 = new MessageEmbed();
                e2.setColor(client.colorDefault);
                e2.setDescription(`${client.emojiSuccess} Se han eliminado **__${userMessages.size}/${args[1]}__** mensajes de usuarios.`);
                message.reply({ embeds: [e2], allowedMentions: { repliedUser: false } });
                return lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Clear | Usuarios ${userMessages.size}/${args[1]}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Cantidad
> ${userMessages.size}/${args[1]}

* Canal
> #${message.channel.name}
\`\`\``, components: [button_url] });
            });
        } else if (["embed", "embeds"].includes(args[0])) {
            if (isNaN(args[1])) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar un número valido no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) > 100) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) < 2) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad mayor a **__1__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            await message.channel.messages.fetch({
                limit: args[1]
            }, false).then(async (messages) => {
                if (messages.partials) await messages.fetch();
                const userMessages = messages.filter(m => m.embeds);
                await message.channel.bulkDelete(userMessages, true);
                if (userMessages.size === 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.warning} **No he podido eliminar ningun mensaje.**`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let text = "";
                for (let [key, value] of userMessages) {
                    let hora = ` ${moment_time(value.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, HH:mm:ss")}`
                    text += `${hora} | ${value.author.tag}: ${value.description || "Desconocido"}\n`;
                }
                let bin = await sourcebin.create([{
                    name: `D-ConfigBot - [Clear | Embeds] [${message.guild.name}]`,
                    content: `D-ConfigBot [Clear | Embeds]\n\n${text}\n\n-Moderator: ${message.author.tag} [ID: ${message.author.id}]`,
                    language: 'text',
                }, ], {
                    title: `D-ConfigBot [Clear | Embeds] [${message.guild.name} | ${message.author.tag}]`,
                    description: `Comando ejecutado por ${message.author.tag} [ID: ${message.author.id}]`,
                }, )

                let button_url = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setStyle("LINK")
                    .setURL(message.url)
                    .setLabel(`Irl al mensaje del Administrador ${message.author.username}`), )

                let e2 = new MessageEmbed();
                e2.setColor(client.colorDefault);
                e2.setDescription(`${client.emojiSuccess} Se han eliminado **__${userMessages.size}/${args[1]}__** que contienen embeds.`);
                message.reply({ embeds: [e2], allowedMentions: { repliedUser: false } });
                return lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Clear | Embeds ${userMessages.size}/${args[1]}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Cantidad
> ${userMessages.size}/${args[1]}

* Canal
> #${message.channel.name}
\`\`\``, components: [button_url] });
            });
        } else if (["with", "word", "palabra", "withs", "words", "palabras"].includes(args[0])) {
            if (isNaN(args[1])) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} A | Necesitas ingresar un número valido no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) > 100) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) < 2) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad mayor a **__1__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            await message.channel.messages.fetch({
                limit: args[1]
            }, false).then(async (messages) => {
                if (messages.partials) await messages.fetch();
                const userMessages = messages.filter(m => (new RegExp(args.slice(2).join(" "), "gmi").test(m.content)));
                await message.channel.bulkDelete(userMessages, true);
                if (userMessages.size == 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.warning} **No he podido eliminar ningun mensaje.**`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let text = "";
                for (let [key, value] of userMessages) {
                    let hora = ` ${moment_time(value.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, HH:mm:ss")}`
                    text += `${hora} | ${value.author.tag}: ${value.content}\n`;
                }
                let bin = await sourcebin.create([{
                    name: `D-ConfigBot - [Clear | Palabra] [${message.guild.name}]`,
                    content: `D-ConfigBot [Clear | Palabra]\n\n${text}\n\n-Moderator: ${message.author.tag} [ID: ${message.author.id}]`,
                    language: 'text',
                }, ], {
                    title: `D-ConfigBot [Clear | Palabra] [${message.guild.name} | ${message.author.tag}]`,
                    description: `Comando ejecutado por ${message.author.tag} [ID: ${message.author.id}]`,
                }, )

                let button_url = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setStyle("LINK")
                    .setURL(message.url)
                    .setLabel(`Irl al mensaje del Administrador ${message.author.username}`), )

                let e2 = new MessageEmbed();
                e2.setColor(client.colorDefault);
                e2.setDescription(`${client.emojiSuccess} Se han eliminado **__${userMessages.size}/${args[1]}__** mensajes con la palabra **${args.slice(2).join(" ")}.`);
                message.reply({ embeds: [e2], allowedMentions: { repliedUser: false } });
                return lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Clear | Palabra ${userMessages.size}/${args[1]}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Cantidad
> ${userMessages.size}/${args[1]}

* Palabra especificada
> ${args.slice(2).join(' ')}

* Canal
> #${message.channel.name}
\`\`\``, components: [button_url] });
            });
        } else if (["archivo", "archivos", "attachment", "attachments"].includes(args[0])) {
            if (isNaN(args[1])) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar un número valido no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) > 100) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad no mayor a **__100__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            } else if (parseInt(args[1]) < 2) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Necesitas ingresar una cantidad mayor a **__1__**.`);
                return message.reply({
                    embeds: [e],
                    allowedMentions: {
                        repliedUser: false
                    }
                });
            }

            await message.channel.messages.fetch({
                limit: args[1]
            }, false).then(async (messages) => {
                if (messages.partials) await messages.fetch();
                const userMessages = messages.filter(m => m.attachments.first());
                if (userMessages.size === 0) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.warning} **No he podido eliminar ningun mensaje.**`);
                    return message.reply({
                        embeds: [e],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                }

                let text = "";
                for (let [key, value] of userMessages) {
                    let hora = ` ${moment_time(value.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, HH:mm:ss")}`;
                    let attachs = value.attachments.array();
                    attachs.forEach(async (m) => {
                        text += `${hora} | ${value.author.tag}: ${m.url}\n`;
                    });
                }
                let bin = await sourcebin.create([{
                    name: `D-ConfigBot - [Clear | Attachments] [${message.guild.name}]`,
                    content: `D-ConfigBot [Clear | Attachments]\n\n${text}\n\n-Moderator: ${message.author.tag} [ID: ${message.author.id}]`,
                    language: 'text',
                }, ], {
                    title: `D-ConfigBot [Clear | Attachments] [${message.guild.name} | ${message.author.tag}]`,
                    description: `Comando ejecutado por ${message.author.tag} [ID: ${message.author.id}]`,
                }, )

                let button_url = new MessageButton();
                button_url.setStyle("url");
                button_url.setURL(`https://cdn.sourceb.in/bins/${bin.key}/0`);
                button_url.setLabel(`Ver los ${args[1]} mensajes eliminados por ${message.author.username}`);

                let e2 = new MessageEmbed();
                e2.setColor(client.colorDefault);
                e2.setDescription(`${client.emojiSuccess} Se han eliminado **__${args[1]}/${args[1]}__** mensajes con attachments.`);
                message.reply({ embeds: [e2], allowedMentions: { repliedUser: false } });
                await message.channel.bulkDelete(userMessages, true);
                return lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Clear | Attachments ${args[1]}/${args[1]}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Cantidad
> ${args[1]}/${args[1]}

* Canal
> #${message.channel.name}
\`\`\``, components: [button_url] });
            });
        }
    }
});