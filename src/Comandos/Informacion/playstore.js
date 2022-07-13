const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index"), play = require('google-play-scraper');

module.exports = new Comando({
    nombre: "playstore",
    alias: ["play-store", "playstore-search", "play-store-search"],
    descripcion: "Busca aplicaciones en la playstore desde el bot",
    categoria: "Información",
    ejemplo: "$playstore [busqueda]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }

        let search = args.join(' ')
        if (!search) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} Necesitas escribir el nombre de una aplicación disponible en la **__Google PlayStore__**.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }
        play.search({ term: search, num: 10 }).then(async (as) => {
            play.app({ appId: as[0].appId, lang: 'es' }).then(async (res) => {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setThumbnail(res.icon);
                e.setDescription(`
\`\`\`🔎 ${search}\`\`\`

**Nombre: \`${res.title}\`**
**Creador: \`${res.developer} [Gmail: ${res.developerEmail}]\`**
**Funcion: \`${res.summary}\`**
**Descargas: \`${res.installs}\`**
**Estrellas: \`${res.scoreText}\`**
**Rating: \`${res.ratings.toLocaleString()}\`**
**Precio: \`${res.priceText}\`**`);

                let button = new MessageActionRow().addComponents(
                    new MessageButton().setStyle('LINK').setURL(res.url).setLabel('Ir a la google play'), );

                let screenshots = []
                screenshots.push(res.screenshots[1])
                e.setImage(screenshots[0])
                return message.reply({ embeds: [e], components: [button], allowedMentions: { repliedUser: false } })

            }).catch(err => {
                let e = new MessageEmbed()
                e.setColor('GREEN')
                e.setDescription(`${client.emojiError} No se encontraron resultados sobre tu busqueda.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            });
        });
    }
});