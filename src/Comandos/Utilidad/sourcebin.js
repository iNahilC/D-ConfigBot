const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index"),
    sourcebin = require('sourcebin');

module.exports = new Comando({
    nombre: "sourcebin",
    alias: ["create-sourcebin"],
    categoria: "Utilidad",
    disponible: true,
    descripcion: "Crea un archivo sourcebin mediante el bot con el titulo, descripción, tipo de código y texto que quieras.",
    ejemplo: "$sourcebin",
    ejecutar: async (client, message) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }

        let bin_title = "",
            bin_descripcion = "",
            bin_name = "",
            bin_contenido = "";

        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setThumbnail("https://images-ext-2.discordapp.net/external/qfoWYXauV1gOBzncvmCCz-Vadvu3vGPiek-sG9_lL64/https/sourceb.in/icon.png?width=389&height=389");
        e.setDescription(`${client.waiting} **1/4** Escribe en el chat el **titulo** de tu **__sourcebin__**.`);
        e.setFooter({ text: `Si deseas cancelar el sistema escribe en el chat "cancelar".` });
        let title_embed = await message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        let filter = x => x.author.id === message.author.id;
        let title_collector = await title_embed.channel.createMessageCollector({
            filter,
            max: 1,
            time: 180000,
            errors: ["time"]
        });

        let antiSpamCommandArrayChecker = await client.db.has(`${message.guild.id}.cmd_on`);
        if (!antiSpamCommandArrayChecker) return await client.db.set(`${message.guild.id}.cmd_on`, new Array());

        let userChecker = await client.db.get(`${message.guild.id}.cmd_on`)
        if (!userChecker.includes(message.author.id)) await client.db.push(`${message.guild.id}.cmd_on`, message.author.id);

        await title_collector.on("collect", async (title) => {
            if ("c!sourcebin" === title.content && userChecker.includes(message.author.id)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Ya estás ejecutando este comando, termina de usarlo.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (["cancelar", "-cancelar", "cancel", "-cancel", "stop", "-stop"].includes(title.content)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiSuccess} El sistema fue detenido **__correctamente__**.`);
                await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id)
                title_collector.stop("x");
                return message.reply({ embeds: [e] });
            }


            bin_title = `${title.content}`;
            let descripcion_embed = new MessageEmbed()
            descripcion_embed.setThumbnail("https://images-ext-2.discordapp.net/external/qfoWYXauV1gOBzncvmCCz-Vadvu3vGPiek-sG9_lL64/https/sourceb.in/icon.png?width=389&height=389");
            descripcion_embed.setColor(client.colorDefault);
            descripcion_embed.setDescription(`${client.waiting} **2/4** Escribe en el chat la **descripción** de tu **__sourcebin__**`);
            descripcion_embed.setFooter({ text: `Si deseas cancelar el sistema escribe en en el chat "cancelar".` });
            let desc_embed = await message.reply({ embeds: [descripcion_embed], allowedMentions: { repliedUser: false } });
            let filter = x => x.author.id === message.author.id;
            let desc_collector = await desc_embed.channel.createMessageCollector({
                filter,
                max: 1,
                time: 180000,
                errors: ["time"]
            });

            await desc_collector.on("collect", async (descripcion) => {
	            if ("c!sourcebin" === descripcion.content && userChecker.includes(message.author.id)) {
	                let e = new MessageEmbed();
	                e.setColor(client.colorDefault);
	                e.setDescription(`${client.emojiError} Ya estás ejecutando este comando, termina de usarlo.`);
	                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
	            }

                if (["cancelar", "-cancelar", "cancel", "-cancel", "stop", "-stop"].includes(descripcion.content)) {
                    let e = new MessageEmbed();
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiSuccess} El sistema fue detenido **__correctamente__**.`);
                    await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id)
                    title_collector.stop("x");
                    return message.reply({ embeds: [e] });
                }

                bin_descripcion = `${descripcion.content}`
                let nombre_bin = new MessageEmbed();
                nombre_bin.setColor(client.colorDefault);
                nombre_bin.setThumbnail("https://images-ext-2.discordapp.net/external/qfoWYXauV1gOBzncvmCCz-Vadvu3vGPiek-sG9_lL64/https/sourceb.in/icon.png?width=389&height=389");
                nombre_bin.setDescription(`${client.waiting} **3/4** Escribe en el chat el **nombre del archivo** de tu **__sourcebin__**.`);
                nombre_bin.setFooter({ text: `Si deseas cancelar el sistema escribe en el chat "cancelar".` });
                let name_embed = await message.reply({ embeds: [nombre_bin], allowedMentions: { repliedUser: false } });
                let filter = x => x.author.id === message.author.id;
                let name_collector = await name_embed.channel.createMessageCollector({
                    filter,
                    max: 1,
                    time: 180000,
                    errors: ["time"]
                });

                name_collector.on("collect", async (name) => {
		            if ("c!sourcebin" === name.content && userChecker.includes(message.author.id)) {
		                let e = new MessageEmbed();
		                e.setColor(client.colorDefault);
		                e.setDescription(`${client.emojiError} Ya estás ejecutando este comando, termina de usarlo.`);
		                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
		            }

                    if (["cancelar", "-cancelar", "cancel", "-cancel", "stop", "-stop"].includes(name.content)) {
                        await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id)
                        let e = new MessageEmbed();
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiSuccess} El sistema fue detenido **__correctamente__**.`);
                        title_collector.stop("x");
                        return message.reply({ embeds: [e] });
                    }
                    bin_name = `${name.content}`

                    let contenido_bin = new MessageEmbed()
                    contenido_bin.setColor(client.colorDefault);
                    contenido_bin.setThumbnail("https://images-ext-2.discordapp.net/external/qfoWYXauV1gOBzncvmCCz-Vadvu3vGPiek-sG9_lL64/https/sourceb.in/icon.png?width=389&height=389");
                    contenido_bin.setDescription(`${client.waiting} **4/4** Por ultimo, Escribe en el **contenido** de tu **__sourcebin__**.`);
                    contenido_bin.setFooter({ text: `Si deseas cancelar el sistema escribe en el chat "cancelar".` });
                    let content_embed = await message.reply({ embeds: [contenido_bin], allowedMentions: { repliedUser: false } });
                    let filter = x => x.author.id === message.author.id;
                    let content_collector = await content_embed.channel.createMessageCollector({
                        filter,
                        max: 1,
                        time: 180000,
                        errors: ["time"]
                    });

                    content_collector.on("collect", async (contenido) => {
			            if ("c!sourcebin" === contenido.content && userChecker.includes(message.author.id)) {
			                let e = new MessageEmbed();
			                e.setColor(client.colorDefault);
			                e.setDescription(`${client.emojiError} Ya estás ejecutando este comando, termina de usarlo.`);
			                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
			            }

                        if (["cancelar", "-cancelar", "cancel", "-cancel", "stop", "-stop"].includes(contenido.content)) {
                            let e = new MessageEmbed();
                            e.setColor(client.colorDefault);
                            e.setDescription(`${client.emojiSuccess} El sistema fue detenido **__correctamente__**.`);
                            title_collector.stop("x");
	                        await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id);
                            return message.reply({ embeds: [e] });
                        }

                        await message.channel.send(`${client.waiting} Creando sourcebin...`).then(async (msg) => {
                            let bin_leng;
                            if (bin_name.includes(".js")) bin_leng = "JavaScript";
                            if (bin_name.includes(".ts")) bin_leng = "TypeScript";
                            if (bin_name.includes(".py")) bin_leng = "Python";
                            if (bin_name.includes(".php")) bin_leng = "PHP";
                            if (bin_name.includes(".css")) bin_leng = "CSS";
                            if (bin_name.includes(".html")) bin_leng = "HTML";
                            let regexToReplaceSpecialsCharacters = /html|p(?:hp|y)|(?:cs|[jt])s|`/ig


                            let bin = await sourcebin.create([{
                                name: bin_name,
                                content: `${contenido.content.replaceAll(regexToReplaceSpecialsCharacters, "").replaceAll("css", "").replaceAll("html", "")}\n\n//Creado por el Bot D-ConfigBot - ${message.author.tag} [ID: ${message.author.id}]`,
                                language: bin_leng,
                            }, ], {
                                title: bin_title,
                                description: `${bin_descripcion}`,
                            }, ).catch(async (err) => {
                                let e = new MessageEmbed();
                                e.setColor(client.colorDefault);
                                e.setDescription(`${client.emojiError} Hubo un error inesperado al intentar crear tu **__sourcebin__** intentalo de nuevo.`);
    	                        await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id)
                                title_collector.stop("x");
                                return msg.reply({ embeds: [e] });
                            });

                            let source_url = new MessageActionRow().addComponents(
                                new MessageButton().setStyle('LINK').setURL(bin.url).setLabel(`Click aquí para ir a tu sourcebin!`), );

                            let embed_done = new MessageEmbed();
                            embed_done.setColor(client.colorDefault);
                            embed_done.setDescription(`${client.emojiSuccess} ${message.author}, Tú **Sourcebin** fue correctamente creado con el nombre del archivo **${bin_name}**`);
                            await content_collector.stop("x");
                            await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id)
                            await msg.delete();
                            return message.reply({ embeds: [embed_done], components: [source_url], allowedMentions: { repliedUser: false } });
                        });
                    });

                    await content_collector.on("end", async (_, reason) => {
                        if (_.size < 1 && reason !== "x") {
                            let e = new MessageEmbed()
                            e.setColor(client.colorDefault);
                            e.setDescription(`${client.emojiError} Duraste demasiado para dar una respuesta tienes **__3__ minutos** para responde.`);
                            await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id)
                            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                        }
                    });
                });

                await name_collector.on("end", async (_, reason) => {
                    if (_.size < 1 && reason !== "x") {
                        let e = new MessageEmbed()
                        e.setColor(client.colorDefault);
                        e.setDescription(`${client.emojiError} Duraste demasiado para dar una respuesta tienes **__3__ minutos** para responde.`);
                        await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id)
                        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                    }
                });
            });

            await desc_collector.on("end", async (_, reason) => {
                if (_.size < 1 && reason !== "x") {
                    let e = new MessageEmbed()
                    e.setColor(client.colorDefault);
                    e.setDescription(`${client.emojiError} Duraste demasiado para dar una respuesta tienes **__3__ minutos** para responde.`);
                    await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id)
                    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
                }
            });
        });

        await title_collector.on("end", async (_, reason) => {
            if (_.size < 1 && reason !== "x") {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Duraste demasiado para dar una respuesta tienes **__3__ minutos** para responde.`);
                await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id)
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
        });
    }
});