const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");
const moment = require("moment");
require('moment-duration-format');


module.exports = new Comando({
    nombre: "serverinfo",
    alias: ["server-info", "Server-Information", "ServerInformation"],
    descripcion: "Este comando te muestra información detallada sobre este servidor.",
    categoria: "Información",
    ejemplo: "$serverinfo",
    ejecutar: async (client, message, args) => {
        if (!message.guild.members.cache.get(client.user.id).permissions.has('VIEW_AUDIT_LOG')) {
            let f = new MessageEmbed()
            f.setDescription('' + client.emojiError + ' Necesito el permiso **VIEW_AUDIT_LOG** para poder ver la información del servidor.')
            f.setColor(client.colorDefault)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        }

        let verifLevels = {
            "NONE": "Ninguno",
            "LOW": "Bajo",
            "MEDIUM": "Medio",
            "HIGH": "Alto",
            "VERY_HIGH": "Muy Alto"
        };

        let contenido = {
            DISABLED: "No analizar ningún contenido multimedia.",
            MEMBERS_WITHOUT_ROLES: "Analizar el contenido multimedia de los miembros sin rol.",
            ALL_MEMBERS: "Analizar el contenido multimedia de todos los miembros."
        }
        let region = {
            europe: "Europa",
            brazil: "Brasil",
            hongkong: "Hong Kong",
            japan: ":Japón",
            russia: "Rusia",
            singapore: "Singapur",
            southafrica: "Sudáfrica",
            sydney: "Sydney",
            "us-central": "Estados Unidos | Central",
            "us-east": "Estados Unidos | Este",
            "us-south": "Estados Unidos | Sur",
            "us-west": "Estados Unidos | Oeste",
            "vip-us-east": "Estados Unidos | Este (VIP)",
            "eu-central": "Europa Central",
            "eu-west": "Europa Oeste",
            london: "Londres",
            amsterdam: "Amsterdam",
            india: "India"
        };

        let stat = {
            online: "<a:online:752736453544509502> \`Online\`",
            idle: "<a:idle:752736453880184902> \`Ausente\`",
            dnd: "<a:dnd:752736453842173973> \`No Molestar\`",
            offline: "<a:offline:752736453745705004> \`Offline\`",
            streaming: "<a:streaming:752736453821464616> \`Streaming\`"
        };
        // let canalAFK = `🔊 ${message.guild.afkChannelID === null ? '' : client.channels.cache.get(message.guild.afkChannelId).name} [ID: ${message.guild.afkChannelId === null ? 'No hay Canales de AFK' : message.guild.afkChannelId}]`;
        let owner = await message.guild.fetchOwner();
        let emojisCount = "";
        if (message.guild.premiumSubscriptionCount == 0) { emojisCount = 50; } else if (message.guild.premiumSubscriptionCount === 1) { emojisCount = 50; } else if (message.guild.premiumSubscriptionCount >= 2) { emojisCount = 100; } else if (message.guild.premiumSubscriptionCount >= 15) { emojisCount = 150; } else if (message.guild.premiumSubscriptionCount >= 30) { emojisCount = 250; }
        const embed = new MessageEmbed();
        const roles_bot_left = new DiscordUtils().button_id_generator(20);
        const roles_bot_x = new DiscordUtils().button_id_generator(20);
        const roles_bot_right = new DiscordUtils().button_id_generator(20);
        const roles_bot_left_lock = new DiscordUtils().button_id_generator(20);
        const roles_bot_x_lock = new DiscordUtils().button_id_generator(20);
        const roles_bot_right_lock = new DiscordUtils().button_id_generator(20);

        let buttons_unlock = new MessageActionRow().addComponents(
            new MessageButton().setLabel("←").setCustomId(roles_bot_left).setStyle('PRIMARY'),
            new MessageButton().setLabel("❌").setCustomId(roles_bot_x).setStyle('DANGER'),
            new MessageButton().setLabel("→").setCustomId(roles_bot_right).setStyle('PRIMARY'), );


        let buttons_lock = new MessageActionRow().addComponents(
            new MessageButton().setLabel("←").setCustomId(roles_bot_left_lock).setStyle('PRIMARY').setDisabled(true),
            new MessageButton().setLabel("❌").setCustomId(roles_bot_x_lock).setStyle('DANGER').setDisabled(true),
            new MessageButton().setLabel("→").setCustomId(roles_bot_right_lock).setStyle('PRIMARY').setDisabled(true), );
        embed.setColor(client.colorDefault);
        let pos = 0,
            embeds = [ /* PAGE 1 */
                `
* Creador
> ${owner.user.tag} [ID: ${owner.id}]

* Cantidad de miembros en total
> ${message.guild.members.cache.size.toLocaleString()} de ${message.guild.maximumMembers.toLocaleString()}

* Cantidad de roles en total
> ${message.guild.roles.cache.size.toLocaleString()}

* Cantidad de canales en total
> ${message.guild.channels.cache.size.toLocaleString()}

* Cantidad de emojis normales en total
> ${message.guild.emojis.cache.filter(x => !x.animated).size.toLocaleString()} de ${emojisCount.toLocaleString()}

* Cantidad de emojis animados en total
> ${message.guild.emojis.cache.filter(x => x.animated).size.toLocaleString()} de ${emojisCount.toLocaleString()}

* Cantidad de stickers en total
> ${message.guild.stickers.cache.size.toLocaleString()}

* Nivel de verificación
> ${verifLevels[message.guild.verificationLevel]}

* Filtro de contenido explicito
> ${contenido[message.guild.explicitContentFilter]}

* Creación del servidor
> ${moment(message.guild.createdAt).format("DD/MM/YYYY")} [${new DiscordUtils().T_convertor(Math.floor(Date.now()) - message.guild.createdAt)}]
`,
                `
* Cantidad de humanos
> ${message.guild.members.cache.filter(x => !x.user.bot).size.toLocaleString()}

* Cantidad de bots
> ${message.guild.members.cache.filter(x => x.user.bot).size.toLocaleString()}

* Cantidad de canales de texto
> ${message.guild.channels.cache.filter(x => x.type == "GUILD_TEXT").size.toLocaleString()}

* Cantidad de canales de voz
> ${message.guild.channels.cache.filter(x => x.type == "GUILD_VOICE").size.toLocaleString()}

* Cantidad de categorías
> ${message.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY").size.toLocaleString()}

* Cantidad de canales para noticias
> ${message.guild.channels.cache.filter(x => x.type == "GUILD_NEWS").size.toLocaleString()}

* Cantidad de boost en el servidor
> ${message.guild.premiumSubscriptionCount.toLocaleString()}

* Cantidad de hilos públicos
> ${message.guild.channels.cache.filter(x => x.type == "GUILD_PUBLIC_THREAD").size.toLocaleString()}

* Cantidad de hilos privados
> ${message.guild.channels.cache.filter(x => x.type == "GUILD_PRIVATE_THREAD").size.toLocaleString()}

* Cantidad de hilos para noticias
> ${message.guild.channels.cache.filter(x => x.type == "GUILD_NEWS_THREAD").size.toLocaleString()}
`
            ]
        embed.setDescription(`
\`\`\`md
# Información del servidor ${message.guild.name}
${embeds[0]}
\`\`\``).setFooter(`Pagina 1 de ${embeds.length}`).setThumbnail(client.thumbnailGIF);
        let msg = await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        if (embeds.length == 1) return;
        await msg.edit({ embeds: [embed], components: [buttons_unlock] });

        let filter = x => x.user.id == message.author.id;
        let collector = await msg.channel.createMessageComponentCollector({
            filter,
            idle: 60000,
            errors: ["idle"]
        });

        await collector.on("collect", async (btn) => {
            switch (btn.customId) {
                case roles_bot_left:
                    pos = pos <= 0 ? (embeds.length - 1) : pos - 1
                    break;
                case roles_bot_x:
                    collector.stop("x");
                    break;
                case roles_bot_right:
                    pos = pos >= embeds.length - 1 ? 0 : pos + 1
                    break;
            }
            let embed_page = new MessageEmbed();
            embed_page.setColor(client.colorDefault);
            embed_page.setThumbnail(client.thumbnailGIF);
            embed_page.setDescription(`
\`\`\`md
# Información del servidor ${message.guild.name}
${embeds[pos]}
\`\`\``).setFooter(`Pagina ${pos+1} de ${embeds.length}`);
            await msg.edit({ embeds: [embed_page], components: [buttons_unlock] }).catch(error => {});
        });

        await collector.on("end", (_, reason) => {
            if (reason === "x") {
                msg.delete().catch(error => {})
                if (message.deletable) return message.delete()
            } else {
                let embed_page = new MessageEmbed();
                embed_page.setColor(client.colorDefault);
                embed_page.setThumbnail(client.thumbnailGIF);
                embed_page.setDescription(`
\`\`\`md
# Información del servidor ${message.guild.name}
${embeds[pos]}
\`\`\``).setFooter(`Pagina ${pos+1} de ${embeds.length}`);
                return msg.edit({ embeds: [embed_page], components: [buttons_lock] });
            }
        });
    }
});