const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow, MessageSelectMenu } = require("../../ConfigBot/index");
const { image } = require("googlethis");

module.exports = new Comando({
    nombre: "image-search",
    alias: ["imagesearch", "google-image", "googleimage", "img-search", "imgsearch", "image", "img"],
    categoria: "Utilidad",
    descripcion: "Busca imagenes de google mediante este comando.",
    ejemplo: "$image-search",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }

        let busqueda = args.join(" ");
        if (!busqueda) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas escribir tu busqueda.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }
        let embed = new MessageEmbed();
        embed.setColor(client.colorDefault);
        embed.setDescription(`${client.waiting} Obteniendo resultados...`);
        let msg = await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

        await image(busqueda, {
            page: 0,
            safe: (message.channel.nsfw || message.channel.type == "DM") ? false : true,
            additional_params: { hl: 'es' }
        }).then(async (results) => {
            let pageindex = 0, index = 1;

            //UNLOCK - START
            const image_bot_left = new DiscordUtils().button_id_generator(20);
            const image_bot_x = new DiscordUtils().button_id_generator(20);
            const image_bot_right = new DiscordUtils().button_id_generator(20);
            const image_bot_push = new DiscordUtils().button_id_generator(20);

            const unlock_buttons = new MessageActionRow().addComponents(
            new MessageButton().setEmoji(client.arrow_left_id).setCustomId(image_bot_left).setStyle('DANGER'),
            new MessageButton().setEmoji(client.cancel_emote_id).setCustomId(image_bot_x).setStyle('DANGER'),
            new MessageButton().setEmoji(client.arrow_right_id).setCustomId(image_bot_right).setStyle('DANGER'),
            new MessageButton().setEmoji(client.search_emote_id).setCustomId(image_bot_push).setStyle('DANGER'), );
            //UNLOCK - END

            //LOCK - START
            const image_bot_left_lock = new DiscordUtils().button_id_generator(20);
            const image_bot_x_lock = new DiscordUtils().button_id_generator(20);
            const image_bot_right_lock = new DiscordUtils().button_id_generator(20);

            const lock_buttons = new MessageActionRow().addComponents(
            new MessageButton().setEmoji(client.arrow_left_id).setCustomId(image_bot_right_lock).setStyle('DANGER').setDisabled(true),
            new MessageButton().setEmoji(client.cancel_emote_id).setCustomId(image_bot_x_lock).setStyle('DANGER').setDisabled(true),
            new MessageButton().setEmoji(client.arrow_right_id).setCustomId(image_bot_left_lock).setStyle('DANGER').setDisabled(true),
            new MessageButton().setEmoji(client.search_emote_id).setCustomId(image_bot_push).setStyle('DANGER').setDisabled(true), );
            //LOCK - END

            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiSuccess} [${results[0].origin.title}](${results[0].origin.website})`);
            e.setImage(results[0].url);
            e.setFooter({ text: `Google - Imagen número 1 de ${results.length}` });
            await msg.edit({ embeds: [e] })
            if (results.length === 1) return;
            await msg.edit({ embeds: [e], components: [unlock_buttons] });

            let filter = x => x.user.id == message.author.id;
            let button_collector = await msg.channel.createMessageComponentCollector({
                filter, 
                idle: 30000,
                errors: ["idle"]
            });

            await button_collector.on("collect", async (btn) => {
                switch (btn.customId) {
                    case image_bot_left:
                        btn.deferUpdate();
                        pageindex = pageindex <= 0 ? (results.length - 1) : pageindex - 1
                        let embed_left = new MessageEmbed()
                        embed_left.setColor(client.colorDefault)
                        embed_left.setDescription(`${client.emojiSuccess} [${results[pageindex].origin.title}](${results[pageindex].origin.website})`);
                        embed_left.setImage(results[pageindex].url);
                        embed_left.setFooter({ text: `Google - Imagen número ${pageindex + 1} de ${results.length}` });
                        await msg.edit({ embeds: [embed_left], components: [unlock_buttons] });
                        break;
                    case image_bot_x:
                        btn.deferUpdate();
                        button_collector.stop("x");
                        break;
                    case image_bot_right:
                        btn.deferUpdate();
                        pageindex = pageindex >= results.length - 1 ? 0 : pageindex + 1
                        let embed_right = new MessageEmbed()
                        embed_right.setColor(client.colorDefault)
                        embed_right.setDescription(`${client.emojiSuccess} [${results[pageindex].origin.title}](${results[pageindex].origin.website})`);
                        embed_right.setImage(results[pageindex].url);
                        embed_right.setFooter({ text: `Google - Imagen número ${pageindex + 1} de ${results.length}` });
                        await msg.edit({ embeds: [embed_right], components: [unlock_buttons] });
                        break;
                    case image_bot_push:
                        btn.deferUpdate();
                        let push_embed = new MessageEmbed();
                        push_embed.setColor(client.colorDefault);
                        push_embed.setDescription(`${client.waiting} A qué página te gustaria ir?`);
                        push_embed.setImage(results[pageindex].url);
                        push_embed.setFooter({ text: `Google - Imagen número ${pageindex + 1} de ${results.length}` });
                        await msg.edit({ embeds: [push_embed], components: [] });

                        let msg_collector_filter = x => x.user.id == message.author.id;
                        let msg_collector = await msg.channel.createMessageCollector({
                            msg_collector_filter,
                            idle: 30000,
                            errors: ["idle"]
                        });

                        await msg_collector.on("collect", async (lugar) => {
                            if (isNaN(lugar.content)) {
                                let e = new MessageEmbed()
                                e.setColor(client.colorDefault);
                                e.setDescription(`${client.waiting} Necesitas escribir **__solo__** números!`);
                                e.setImage(results[pageindex].url);
                                e.setFooter({ text: `Google - Imagen número ${pageindex + 1} de ${results.length}` });
                                message.channel.messages.fetch(lugar.id).then(async (msg) => {
                                    if (msg.deletable) msg.delete();
                                });

                                return msg.edit({ embeds: [e], components: [lock_buttons] });
                            }

                            if (lugar.content < 1) {
                                let e = new MessageEmbed()
                                e.setColor(client.colorDefault);
                                e.setDescription(`${client.waiting} Debes poner un número mayor o igual a **__1__**.`);
                                e.setImage(results[pageindex].url);
                                e.setFooter({ text: `Google - Imagen número ${pageindex + 1} de ${results.length}` });
                                message.channel.messages.fetch(lugar.id).then(async (msg) => {
                                    if (msg.deletable) msg.delete();
                                });
                                
                                return msg.edit({ embeds: [e], components: [lock_buttons] });
                            }

                            if (lugar.content > results.length) {
                                let e = new MessageEmbed()
                                e.setColor(client.colorDefault);
                                e.setDescription(`${client.waiting} La página **__${lugar.content}__** no existe.`);
                                e.setImage(results[pageindex].url);
                                e.setFooter({ text: `Google - Imagen número ${pageindex + 1} de ${results.length}` });
                                message.channel.messages.fetch(lugar.id).then(async (msg) => {
                                    if (msg.deletable) msg.delete();
                                });

                                return msg.edit({ embeds: [e], components: [lock_buttons] });
                            }

                            pageindex = lugar.content - 1
                            let embed_done = new MessageEmbed()
                            embed_done.setColor(client.colorDefault)
                            embed_done.setDescription(`${client.emojiSuccess} [${results[pageindex].origin.title}](${results[pageindex].origin.website})`);
                            embed_done.setImage(results[pageindex].url);
                            embed_done.setFooter({ text: `Google - Imagen número ${pageindex + 1} de ${results.length}` });
                            await msg.edit({ embeds: [embed_done], components: [unlock_buttons] });
                            message.channel.messages.fetch(lugar.id).then(async (msg) => {
                                if (msg.deletable) msg.delete();
                            });

                            msg_collector.stop("x");
                        });
                        break;
                }
            });

            await button_collector.on("end", async (_, reason) => {
                if (reason == "x") {
                    if (message.deletable) message.delete();
                    if (msg.deletable) msg.delete();
                } else if (reason !== "x") {
                    let e = new MessageEmbed()
                    e.setColor(client.colorDefault)
                    e.setDescription(`${client.emojiSuccess} [${results[pageindex].origin.title}](${results[pageindex].origin.website})`);
                    e.setImage(results[pageindex].url);
                    e.setFooter({ text: `Google - Imagen número ${pageindex + 1} de ${results.length} - Deshabilitado por inactividad.` });
                    await msg.edit({ embeds: [e], components: [lock_buttons] });
                }
            })
        }).catch(err => {
            console.error("err", err);
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} No se ha podido obtener **__resultados__** de tu busqueda.`);
            return msg.edit({ embeds: [e] })
        });
    }
});