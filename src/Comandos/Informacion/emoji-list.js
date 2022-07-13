const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "emoji-list",
    alias: ["emojilist", "emojis-list", "emojislist"],
    categoria: "Información",
    descripcion: "Muestra una lista de los emojis animados y no animados de este servidor.",
    ejemplo: "$emoji-list",
    ejecutar: async (client, message) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!"; }
        let emojis_normal = message.guild.emojis.cache.filter(x => !x.animated);
        let emojis_animated = message.guild.emojis.cache.filter(x => x.animated);

        if (emojis_normal.size + emojis_animated.size < 1) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Este servidor aún no tiene emojis.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let index = 1;
        let emojis_mapeado = message.guild.emojis.cache.map(x => `**${index++}** - ${x} - Creado hace ${new DiscordUtils().ms_converter(Math.floor(Date.now()) - x.createdTimestamp)}`).join("\n");
        let split_text = new DiscordUtils().split_texto(`**__${emojis_normal.size}__** Emojis Normales **+** **__${emojis_animated.size}__** Emojis Animados **__${emojis_normal.size + emojis_animated.size}__** en total.\n\n${emojis_mapeado}`, 2000);
        
        if (emojis_normal.size + emojis_animated.size > 15) {
            let msg = await message.channel.send(`${client.waiting} Cargando emojis...`);
            setTimeout(async () => {
                if (msg.deletable) msg.delete();
                for (var mensaje of split_text) message.channel.send(mensaje).then(async (msg) => {
                    if (msg.deletable) setTimeout(() => msg.delete(), 62000);
                });

                let msg_delete = await message.channel.send(`${client.warning} *Los mensajes se **__eliminaran__** en **__1__** un minuto...*`);
                setTimeout(() => {
                    msg_delete.edit(`${client.waiting} *Eliminando **__los__** mensajes.*`);
                    if (msg_delete.deletable) setTimeout(() => msg_delete.delete(), 2000);
                    if (message.deletable) setTimeout(() => message.delete(), 2000);
                }, 60000);
            }, 2000);
        } else if (emojis_animated.size + emojis_normal.size < 15)
            for (var mensaje of split_text) message.channel.send(mensaje);
    }
});