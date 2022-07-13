const { Comando, MessageEmbed, MessageButton, MessageActionRow } = require("../../ConfigBot/index"), isUrl = require("is-url");

module.exports = new Comando({
    nombre: "say-embed",
    alias: ["sayembed", "enviar-embed"],
    descripcion: "Envía un mensaje embed mediante el bot con hasta 8 opciones: canal, color, titulo, descripción, footer, imagen, thumbnail y botones (url).",
    categoria: "Guardia",
    ejemplo: "$say-embed",
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

        let embed_channel = "";
        let embed_hexcolor = "";
        let embed_titulo = "";
        let embed_description = "";
        let embed_image = "";
        let embed_thumbnail = "";
        let embed_footer = "";
        let embed_button = "";

        //----------------------CANAL----------------------//

        let e = new MessageEmbed()
        e.setColor(client.colorDefault)
        e.setDescription(`${client.waiting} **1/8** Menciona en el chat el canal donde quieres que se envié el embed.`)
        e.setFooter('Escribe "cancelar" en el chat para detener el comando y "skip" para enviar el embed en este canal.')
        let msg_channel_embed = await message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        let filter = x => x.author.id == message.author.id;
        let msg_channel_collector = await msg_channel_embed.channel.createMessageCollector({
            filter,
            max: 1,
            time: 60000,
            errors: ["time"]
        });

        await msg_channel_collector.on("collect", async (channel) => {
            let channel_results = channel.content;
            if (["cancel", "-cancel", "-cancelar", "cancelar", "-detener", "detener"].includes(channel_results)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault).setDescription(`${client.emojiSuccess} El sistema de **say-embed** fue correctamente detenido.`);
                return msg_channel_embed.edit({ embeds: [e] });
            }

            if (["skip", "-skip", "-next", "next"].includes(channel_results)) embed_channel = message.channel.id;
            let canal = channel.mentions.channels.first() || message.guild.channels.cache.get(channel_results) || message.guild.channels.cache.get(embed_channel);
            if (!canal || !message.guild.channels.cache.has(canal.id)) {
                let e_err = new MessageEmbed();
                e_err.setColor(client.colorDefault)
                e_err.setDescription(`${client.emojiError} Sistema cancelado, Necesitas mencionar un canal **__valido__**.`);
                return msg_channel_embed.edit({ embeds: [e_err] });
            } else {
                /* CLIENT_PERMISSIONS START */
                let client_permissions = new MessageEmbed();
                client_permissions.setColor(client.colorDefault);
                if (!canal.permissionsFor(client.user).has("VIEW_CHANNEL")) {
                    client_permissions.setDescription("" + client.emojiError + " Sistema cancelado, No tengo permisos para ver el canal mencionado.");
                    return msg_channel_embed.edit({ embeds: [client_permissions] });
                }

                if (!canal.permissionsFor(client.user).has("SEND_MESSAGES")) {
                    client_permissions.setDescription("" + client.emojiError + " Sistema cancelado, No tengo permisos para enviar mensajes en el canal mencionado.");
                    return msg_channel_embed.edit({ embeds: [client_permissions] });
                }
                /* CLIENT_PERMISSIONS END */

                /* USER_PERMISSIONS START */

                let user_permissions = new MessageEmbed();
                user_permissions.setColor(client.colorDefault);
                if (!canal.permissionsFor(message.member).has("VIEW_CHANNEL")) {
                    user_permissions.setDescription("" + client.emojiError + " Sistema cancelado, No tienes permisos para ver el canal mencionado.");
                    return msg_channel_embed.edit({ embeds: [user_permissions] });
                }
                if (!canal.permissionsFor(message.member).has("SEND_MESSAGES")) {
                    user_permissions.setDescription("" + client.emojiError + " Sistema cancelado, No tienes permisos para enviar mensajes en el canal mencionado.");
                    return msg_channel_embed.edit({ embeds: [user_permissions] });
                }
                embed_channel = canal.id;
            }
            /* USER_PERMISSIONS END */
            let e2 = new MessageEmbed();
            e2.setColor(client.colorDefault)
            e2.setDescription(`${client.waiting} **2/8** Escribe en el chat el color **HEX** que quieres agregarle al embed. Recuerda no agregar el hastag (**#**) al hex color.

**•** **Canal**: <#${embed_channel}>
        `)
            e2.setFooter('Escribe "cancelar" en el chat para detener el comando y "skip" para que el embed tenga un color RANDOM.')
            let msg_color_embed = await message.reply({ embeds: [e2], allowedMentions: { repliedUser: false } });
            let filter = x => x.author.id == message.author.id;
            let msg_color_collector = await msg_color_embed.channel.createMessageCollector({
                filter,
                max: 1,
                time: 60000,
                errors: ["time"]
            });

            await msg_color_collector.on("collect", async (color) => {
                let color_results = color.content;
                if (["cancel", "-cancel", "-cancelar", "cancelar", "-detener", "detener"].includes(color_results)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault).setDescription(`${client.emojiSuccess} El sistema de **say-embed** fue correctamente detenido.`);
                    return msg_color_embed.edit({ embeds: [e] });
                }

                if (["-skip", "skip", "-next", "next"].includes(color_results)) embed_hexcolor = "RANDOM";
                if (embed_hexcolor !== "RANDOM") {
                    var isOk = /^[0-9A-F]{6}$/i.test(color_results)
                    if (isOk === false) {
                        let s = new MessageEmbed()
                        s.setColor(client.colorDefault)
                        s.setDescription(`${client.emojiError} Sistema cancelado, Escribe en el chat el color **HEX** que quieres agregarle al embed. Recuerda no agregar el hastag (**#**) al hex color.`);
                        return msg_color_embed.edit({ embeds: [s] });
                    }
                    embed_hexcolor = color_results;
                }

                let e3 = new MessageEmbed();
                e3.setColor(client.colorDefault);
                e3.setDescription(`${client.waiting} **3/8** Escribe en el chat el **titulo** que deseas que tenga el embed con un máximo de **__256__** caracteres.

**•** **Canal**: <#${embed_channel}>
**•** **Color**: **${embed_hexcolor}**`)
                e3.setFooter(`Escribe "cancelar" en el chat para detener el comando y "skip" para que el embed no tenga titulo.`)
                let msg_title_embed = await message.reply({ embeds: [e3], allowedMentions: { repliedUser: false } });
                let filter = x => x.author.id == message.author.id;
                let msg_title_collector = msg_title_embed.channel.createMessageCollector({
                    filter,
                    max: 1,
                    time: 60000,
                    errors: ["time"]
                });

                await msg_title_collector.on("collect", async (title) => {
                    let title_results = title.content;
                    if (["cancel", "-cancel", "-cancelar", "cancelar", "-detener", "detener"].includes(title_results)) {
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault).setDescription(`${client.emojiSuccess} El sistema de **say-embed** fue correctamente detenido.`);
                        return msg_title_embed.edit({ embeds: [e] });
                    }

                    if (["-skip", "skip", "-next", "next"].includes(title_results)) embed_titulo = false;
                    if (embed_titulo !== false && title_results.length > 256) embed_titulo = title_results.slice(0, 256);
                    if (embed_titulo !== false) embed_titulo = title_results;

                    let e4 = new MessageEmbed();
                    e4.setColor(client.colorDefault);
                    e4.setDescription(`${client.waiting} **4/8** Escribe en el chat la **descripción** que deseas que tenga el embed con un máximo de **__4096__** caracteres.

**•** **Canal**: <#${embed_channel}>
**•** **Color**: **${embed_hexcolor}**
**•** **Titulo**: ${embed_titulo}
            `);
                    e4.setFooter('Escribe "cancelar" en el chat para detener el comando y "skip" para que el embed no tenga descripción.');
                    let msg_descripcion_embed = await message.reply({ embeds: [e4], allowedMentions: { repliedUser: false } });
                    let filter = x => x.author.id == message.author.id;
                    let msg_descripcion_collector = await msg_descripcion_embed.channel.createMessageCollector({
                        filter,
                        max: 1,
                        time: 60000,
                        errors: ["time"]
                    });

                    await msg_descripcion_collector.on("collect", async (descripcion) => {
                        let descripcion_results = descripcion.content;
                        if (["-cancel", "cancel", "-cancelar", "cancelar", "-detener", "detener"].includes(descripcion_results)) {
                            let e = new MessageEmbed();
                            e.setColor(client.colorDefault).setDescription(`${client.emojiSuccess} El sistema de **say-embed** fue correctamente detenido.`);
                            return msg_descripcion_embed.edit({ embeds: [e] });
                        }

                        if (["-skip", "skip"].includes(descripcion_results)) embed_description = false;
                        if (embed_description !== false && descripcion_results.length > 4096) embed_description = descripcion_results.slice(0, 4096);
                        if (embed_description !== false) embed_description = descripcion_results;
                        let e5 = new MessageEmbed();
                        e5.setColor(client.colorDefault);
                        if (embed_description !== false) {
                            e5.setDescription(`${client.waiting} **5/8** Sube en el chat la **imagen** que deseas agregar al embed.

**•** **Canal**: <#${embed_channel}>
**•** **Color**: **${embed_hexcolor}**
**•** **Titulo**: ${embed_titulo}
**•** **Descripción**: ${embed_description.slice(0, 256)}`);
                        } else if (embed_description == false) {
                            e5.setDescription(`${client.waiting} **5/8** Sube en el chat la **imagen** que deseas agregar al embed.

**•** **Canal**: <#${embed_channel}>
**•** **Color**: **${embed_hexcolor}**
**•** **Titulo**: ${embed_titulo}
**•** **Descripción**: ${embed_description}`);
                        }
                        e5.setFooter(`Escribe "cancelar" en el chat para detener el comando y "skip" para que el embed no tenga imagen.`);
                        let msg_image_embed = await message.reply({ embeds: [e5], allowedMentions: { repliedUser: false } });
                        let filter = x => x.author.id == message.author.id;
                        let msg_image_collector = await msg_image_embed.channel.createMessageCollector({
                            filter,
                            max: 1,
                            time: 60000,
                            errors: ["time"]
                        });

                        await msg_image_collector.on("collect", async (image) => {
                            let image_results = image.content;
                            if (["-cancel", "cancel", "-cancelar", "cancelar", "-detener", "detener"].includes(image_results)) {
                                let e = new MessageEmbed();
                                e.setColor(client.colorDefault).setDescription(`${client.emojiSuccess} El sistema de **say-embed** fue correctamente detenido.`);
                                return msg_image_embed.edit({ embeds: [e] })
                            }

                            if (["-skip", "skip"].includes(image_results)) embed_image = false;
                            if (embed_image !== false && image.attachments.size < 1) {
                                let e = new MessageEmbed();
                                e.setColor(client.colorDefault);
                                e.setDescription(`${client.emojiError} Necesitas **subir** una imagen al chat para agregarlo al embed.`);
                                return msg_image_embed.edit({ embeds: [e] });
                            } else if (embed_image !== false && image.attachments.size > 0) {
                                let attach = image.attachments.map((x) => x);
                                attach.forEach(async m => {
                                    let url_image_valid = m.name.match(/\.(jpeg|jpg|gif|png)$/)
                                    if (embed_image !== false && url_image_valid == null) {
                                        let embed_error = new MessageEmbed();
                                        embed_error.setColor(client.colorDefault)
                                        embed_error.setDescription(`${client.emojiError} Necesitas subir una imagen con algunas de estas extensiones: \`jpeg\`, \`jpg\`, \`gif\`, \`png\``);
                                        return msg_image_embed.edit({ embeds: [embed_error], allowedMentions: { repliedUser: false } });
                                    }
                                    if (embed_image !== false) embed_image = m.url;
                                });
                            }

                            let e6 = new MessageEmbed();
                            e6.setColor(client.colorDefault);
                            e6.setFooter('Escribe "cancelar" en el chat para detener el comando y "skip" para que el embed no tenga thumbnail.');
                            if (embed_description !== false) {
                                e6.setDescription(`${client.waiting} **6/8** Sube en el chat el **thumbnail** (imagen) que deseas agregar al embed.

**•** **Canal**: <#${embed_channel}>
**•** **Color**: **${embed_hexcolor}**
**•** **Titulo**: ${embed_titulo}
**•** **Descripción**: ${embed_description.slice(0, 256)}
**•** **Imagen**: ${embed_image}`);
                            } else if (embed_description == false) {
                                e6.setDescription(`${client.waiting} **6/8** Sube en el chat el **thumbnail** (imagen) que deseas agregar al embed.

**•** **Canal**: <#${embed_channel}>
**•** **Color**: **${embed_hexcolor}**
**•** **Titulo**: ${embed_titulo}
**•** **Descripción**: ${embed_description}
**•** **Imagen**: ${embed_image}`);
                            }

                            let msg_thumbnail_embed = await message.reply({ embeds: [e6], allowedMentions: { repliedUser: false } });
                            let filter = x => x.author.id == message.author.id;
                            let msg_thumbnail_collector = await msg_thumbnail_embed.channel.createMessageCollector({
                                filter,
                                max: 1,
                                time: 60000,
                                errors: ["time"]
                            });

                            await msg_thumbnail_collector.on("collect", async (thumbnail) => {
                                let thumbnail_results = thumbnail.content;
                                if (["-cancel", "cancel", "-cancelar", "cancelar", "-detener", "detener"].includes(thumbnail_results)) {
                                    let e = new MessageEmbed();
                                    e.setColor(client.colorDefault).setDescription(`${client.emojiSuccess} El sistema de **say-embed** fue correctamente detenido.`);
                                    return msg_thumbnail_embed.edit({ embeds: [e] })
                                }

                                if (["-skip", "skip"].includes(thumbnail_results)) embed_thumbnail = false;
                                if (embed_thumbnail !== false && thumbnail.attachments.size < 1) {
                                    let e = new MessageEmbed();
                                    e.setColor(client.colorDefault);
                                    e.setDescription(`${client.emojiError} Necesitas **subir** una imagen al chat para agregarlo al embed (thumbnail).`);
                                    return msg_thumbnail_embed.edit({ embeds: [e] });
                                } else if (embed_thumbnail !== false && thumbnail.attachments.size > 0) {
                                    let attach = thumbnail.attachments.map((x) => x);
                                    attach.forEach(async m => {
                                        let url_thumbnail_valid = m.name.match(/\.(jpeg|jpg|gif|png)$/)
                                        if (embed_thumbnail !== false && url_thumbnail_valid == null) {
                                            let embed_error = new MessageEmbed();
                                            embed_error.setColor(client.colorDefault)
                                            embed_error.setDescription(`${client.emojiError} Necesitas subir una imagen con algunas de estas extensiones: \`jpeg\`, \`jpg\`, \`gif\`, \`png\``);
                                            return msg_image_embed.edit({ embeds: [embed_error], allowedMentions: { repliedUser: false } });
                                        }
                                        if (embed_thumbnail !== false) embed_thumbnail = m.url;
                                    });
                                }

                                let e7 = new MessageEmbed();
                                e7.setColor(client.colorDefault);
                                e7.setFooter('Escribe "cancelar" en el chat para detener el comando y "skip" para que el embed no tenga footer.');

                                if (embed_description !== false) {
                                    e7.setDescription(`${client.waiting} **7/8** Escribe en el chat el contenido que quieres que tenga el **footer** con un máximo de **__2048__** caracteres.

**•** **Canal**: <#${embed_channel}>
**•** **Color**: **${embed_hexcolor}**
**•** **Titulo**: ${embed_titulo}
**•** **Descripción**: ${embed_description.slice(0, 256)}
**•** **Imagen**: ${embed_image}
**•** **Thumbnail**: ${embed_thumbnail}`);
                                } else if (embed_description == false) {
                                    e7.setDescription(`${client.waiting} **7/8** Escribe en el chat el contenido que quieres que tenga el **footer** con un máximo de **__2048__** caracteres.

**•** **Canal**: <#${embed_channel}>
**•** **Color**: **${embed_hexcolor}**
**•** **Titulo**: ${embed_titulo}
**•** **Descripción**: ${embed_description}
**•** **Imagen**: ${embed_image}
**•** **Thumbnail**: ${embed_thumbnail}`);
                                }

                                let msg_footer_embed = await message.reply({ embeds: [e7], allowedMentions: { repliedUser: false } });
                                let filter = x => x.author.id == message.author.id;
                                let msg_footer_collector = await msg_footer_embed.channel.createMessageCollector({
                                    filter,
                                    max: 1,
                                    time: 60000,
                                    errors: ["time"]
                                });

                                await msg_footer_collector.on("collect", async (footer) => {
                                    let footer_results = footer.content;
                                    if (["-cancel", "cancel", "-cancelar", "cancelar", "-detener", "detener"].includes(footer_results)) {
                                        let e = new MessageEmbed();
                                        e.setColor(client.colorDefault).setDescription(`${client.emojiSuccess} El sistema de **say-embed** fue correctamente detenido.`);
                                        return msg_footer_embed.edit({ embeds: [e] })
                                    }

                                    if (["-skip", "skip"].includes(footer_results)) embed_footer = false;
                                    if (embed_footer !== false && footer_results.length > 2048) embed_footer = footer_results.slice(0, 2048);
                                    if (embed_footer !== false) embed_footer = footer_results;
                                    if (embed_titulo !== false && embed_description !== false && embed_footer !== false) {
                                        if (embed_titulo.length + embed_description.length + embed_footer.length > 6000) {
                                            let e = new MessageEmbed();
                                            e.setColor(client.colorDefault);
                                            e.setDescription(`${client.emojiError} El embed supera más de **__6__**,**__000__** caracteres por lo que no puedo mandar el embed.`);
                                            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                                        }
                                    }

                                    let e8 = new MessageEmbed();
                                    e8.setColor(client.colorDefault);
                                    e8.setFooter('Escribe "cancelar" en el chat para detener el comando y "skip" para que el embed no tenga botón.');
                                    if (embed_description !== false) {
                                        e8.setDescription(`${client.waiting} **8/8** Escribe en el chat un link para agregar un **botón** al embed.

${client.warning} Utiliza comillas (**" "**) para separar el nombre del botón y el link del botón, ejemplo: 
\`\`\`
    "Google" "https://www.google.com/"
    ║  ║   ║ ╠══════════Link═════════║
    ║  ║   ║ ║                       ║
    ╚══╬═══╩═╩═Comilla de separación═╝
       ╩                             
    Nombre        
\`\`\`
**•** **Canal**: <#${embed_channel}>
**•** **Color**: **${embed_hexcolor}**
**•** **Titulo**: ${embed_titulo}
**•** **Imagen**: ${embed_image}
**•** **Thumbnail**: ${embed_thumbnail}
**•** **Descripción**: ${embed_description}
**•** **Footer**: ${embed_footer}`);
                                    } else if (embed_description == false) {
                                        e8.setDescription(`${client.waiting} **8/8** Escribe en el chat un link para agregar un **botón** al embed.
${client.warning} Utiliza comillas (**" "**) para separar el nombre del botón y el link del botón, ejemplo: 
\`\`\`
    "Google" "https://www.google.com/"
    ║  ║   ║ ╠══════════Link═════════║
    ║  ║   ║ ║                       ║
    ╚══╬═══╩═╩═Comilla de separación═╝
       ╩                             
    Nombre        
\`\`\`
**•** **Canal**: <#${embed_channel}>
**•** **Color**: **${embed_hexcolor}**
**•** **Titulo**: ${embed_titulo}
**•** **Descripción**: ${embed_description}
**•** **Imagen**: ${embed_image}
**•** **Thumbnail**: ${embed_thumbnail}
**•** **Footer**: ${embed_footer}`);
                                    }

                                    let msg_button_embed = await message.reply({ embeds: [e8], allowedMentions: { repliedUser: false } });
                                    let filter = x => x.user.id == message.author.id;
                                    let msg_button_collector = await msg_button_embed.channel.createMessageCollector({
                                        filter,
                                        max: 1,
                                        time: 60000,
                                        errors: ["time"]
                                    });

                                    await msg_button_collector.on("collect", async (button) => {
                                        if (["cancel", "-cancel", "-cancelar", "cancelar", "-detener", "detener"].includes(button.content)) {
                                            let e = new MessageEmbed();
                                            e.setColor(client.colorDefault).setDescription(`${client.emojiSuccess} El sistema de **say-embed** fue correctamente detenido.`);
                                            return msg_button_embed.edit({ embeds: [e] });
                                        }

                                        if (["-skip", "skip", "-next", "next"].includes(button.content)) embed_button = false;
                                        let button_results = button.content.match(/"(.+?)"/g);
                                        if (embed_button !== false && !button_results) {
                                            let e = new MessageEmbed();
                                            e.setColor(client.colorDefault);
                                            e.setDescription(`${client.emojiError} Sistema cancelado, Necesitas escribir el nombre y link del botón con la estructura correcta.
\`\`\`
    "Google" "https://www.google.com/"
    ║  ║   ║ ║           ║           ║
    ║  ║   ║ ║          Link         ║
    ║  ║   ║ ║                       ║
    ╚══╬═══╩═╩═Comilla de separación═╝
       ╩                             
    Nombre        
\`\`\`
`)
                                            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                                        }

                                        if (embed_button !== false && button_results.length <= 1) {
                                            let e = new MessageEmbed();
                                            e.setColor(client.colorDefault);
                                            e.setDescription(`${client.emojiError} Sistema cancelado, Necesitas escribir el nombre y link del botón con la estructura correcta.
\`\`\`
    "Google" "https://www.google.com/"
    ║  ║   ║ ║           ║           ║
    ║  ║   ║ ║          Link         ║
    ║  ║   ║ ║                       ║
    ╚══╬═══╩═╩═Comilla de separación═╝
       ╩                             
    Nombre        
\`\`\`
`)
                                            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                                        }

                                        let boton_nombre;
                                        let boton_link;

                                        if (button_results) {
                                            boton_nombre = button_results[0].replace(/"/g, '');
                                            boton_link = button_results[1].replace(/"/g, '');
                                        }

                                        if (embed_button !== false && !isUrl(boton_link)) {
                                            let e = new MessageEmbed();
                                            e.setColor(client.colorDefault);
                                            e.setDescription(`${client.emojiError} Sistema cancelado, Necesitas escribir una URL valida.`)
                                            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                                        }

                                        if (embed_button !== false) embed_button = boton_nombre;
                                        if (embed_titulo == false && embed_description == false &&
                                            embed_image == false && embed_thumbnail == false &&
                                            embed_footer == false) {
                                            let e = new MessageEmbed();
                                            e.setColor(client.colorDefault);
                                            e.setDescription(`${client.emojiError} El embed no se ha podido enviar, no has utilizado ninguna de las opciones.`);
                                            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                                        }

                                        let test = new MessageEmbed();
                                        if (embed_hexcolor !== "RANDOM") {
                                            test.setColor(`#${embed_hexcolor}`)
                                        } else if (embed_hexcolor == "RANDOM") { test.setColor("RANDOM") }
                                        if (embed_titulo !== false) test.setTitle(embed_titulo);
                                        if (embed_image !== false) test.setImage(embed_image);
                                        if (embed_thumbnail !== false) test.setThumbnail(embed_thumbnail);
                                        if (embed_description !== false) test.setDescription(embed_description);
                                        if (embed_footer !== false) test.setFooter(embed_footer);
                                        if (embed_button !== false) {
                                            let button_embed = new MessageActionRow().addComponents(
                                                new MessageButton().setStyle("LINK").setLabel(boton_nombre).setURL(boton_link), );
                                            message.guild.channels.cache.get(embed_channel).send({
                                                embeds: [test],
                                                components: [button_embed]
                                            }).catch(err => {
                                                let e = new MessageEmbed();
                                                e.setColor(client.colorDefault);
                                                e.setDescription(`${client.emojiError} El embed no se ha podido enviar al canal <#${embed_channel}>`);
                                                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                                            });
                                            if (embed_channel !== message.channel.id) {
                                                let e = new MessageEmbed()
                                                e.setColor(client.colorDefault);
                                                e.setDescription(`${client.emojiSuccess} El embed fue correctamente enviado al canal <#${embed_channel}>`);
                                                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                                            }
                                        } else if (embed_button == false) {
                                            message.guild.channels.cache.get(embed_channel).send({ embeds: [test] }).catch(err => {
                                                console.error("err", err);
                                                let e = new MessageEmbed();
                                                e.setColor(client.colorDefault);
                                                e.setDescription(`${client.emojiError} El embed no se ha podido enviar al canal <#${embed_channel}>`);
                                                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                                            });

                                            if (embed_channel !== message.channel.id) {
                                                let e = new MessageEmbed()
                                                e.setColor(client.colorDefault);
                                                e.setDescription(`${client.emojiSuccess} El embed fue correctamente enviado al canal <#${embed_channel}>`);
                                                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                                            }
                                        }
                                    });

                                    await msg_button_collector.on("end", async (button_end) => {
                                        if (button_end.size < 1) {
                                            let e = new MessageEmbed()
                                            e.setColor(client.colorDefault).setDescription(`${client.emojiError} El sistema de **say-embed** se ha detenido. Tardaste demasiado en especificar si quieres botones en tu embed o no, tienes **__1__** minuto.`);
                                            return msg_button_embed.edit({ embeds: [e] });
                                        }
                                    });
                                });


                                await msg_footer_collector.on("end", async (footer_end) => {
                                    if (footer_end.size < 1) {
                                        let e = new MessageEmbed()
                                        e.setColor(client.colorDefault).setDescription(`${client.emojiError} El sistema de **say-embed** se ha detenido. Tardaste demasiado en especificar un footer tienes **__1__** minuto.`);
                                        return msg_footer_embed.edit({ embeds: [e] });
                                    }
                                });
                            });

                            await msg_thumbnail_collector.on("end", async (thumbnail_end) => {
                                if (thumbnail_end.size < 1) {
                                    let e = new MessageEmbed()
                                    e.setColor(client.colorDefault).setDescription(`${client.emojiError} El sistema de **say-embed** se ha detenido. Tardaste demasiado en insertar un thumbnail tienes **__1__** minuto.`);
                                    return msg_thumbnail_embed.edit({ embeds: [e] });
                                }
                            });
                        });

                        await msg_image_collector.on("end", async (image_end) => {
                            if (image_end.size < 1) {
                                let e = new MessageEmbed()
                                e.setColor(client.colorDefault).setDescription(`${client.emojiError} El sistema de **say-embed** se ha detenido. Tardaste demasiado en insertar una imagen tienes **__1__** minuto.`);
                                return msg_image_embed.edit({ embeds: [e] });
                            }
                        });
                    });

                    await msg_descripcion_collector.on("end", async (descripcion_end) => {
                        if (descripcion_end.size < 1) {
                            let e = new MessageEmbed()
                            e.setColor(client.colorDefault).setDescription(`${client.emojiError} El sistema de **say-embed** se ha detenido. Tardaste demasiado en especificar una descripción tienes **__1__** minuto.`);
                            return msg_descripcion_embed.edit(e);
                        }
                    })
                });

                await msg_title_collector.on("end", async (title_end) => {
                    if (title_end.size < 1) {
                        let e = new MessageEmbed()
                        e.setColor(client.colorDefault).setDescription(`${client.emojiError} El sistema de **say-embed** se ha detenido. Tardaste demasiado en especificar un titulo tienes **__1__** minuto.`);
                        return msg_title_embed.edit({ embeds: [e] });;
                    }
                });
            });

            await msg_color_collector.on("end", async (color_end) => {
                if (color_end.size < 1) {
                    let e = new MessageEmbed()
                    e.setColor(client.colorDefault).setDescription(`${client.emojiError} El sistema de **say-embed** se ha detenido. Tardaste demasiado en especificar un color tienes **__1__** minuto.`);
                    return msg_color_embed.edit({ embeds: [e] });;
                }
            });
        });

        await msg_channel_collector.on("end", async (m) => {
            if (m.size < 1) {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault).setDescription(`${client.emojiError} El sistema de **say-embed** se ha detenido. Tardaste demasiado en mencionar un canal tienes **__1__** minuto.`);
                return msg_channel_embed.edit(e);
            }
        });
    }
});