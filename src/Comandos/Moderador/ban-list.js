const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow, MessageSelectMenu } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "check-bans",
    alias: ["checkbans", "ban-list", "banlist", "bans-list", "banslist"],
    categoria: "Moderador",
    descripcion: "Muestra una lista de los usuarios baneados de este servidor.",
    ejemplo: "$ban-list",
    ejecutar: async (client, message) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }
            
        await message.guild.bans.fetch().then(async (baneados) => {
            if (baneados.size < 1) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Este servidor aún **__no tiene__** usuarios baneados.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            let index = 1,
                split_text = new DiscordUtils().split_texto(`Hay **__${baneados.size}__** usuarios **baneados** en total.\n\n${baneados.map(x => `\`${index++}\`**#** \`|\` **${x.user.tag}** \`|\` **${x.reason || "No hay razón"}**`).join("\n")}`, 2000);
            if (baneados.size > 15) {
                let msg = await message.channel.send(`${client.waiting} Cargando la lista de baneados...`);
                setTimeout(async () => {
                    if (msg.deletable) msg.delete();
                    for (var mensaje of split_text) message.channel.send(mensaje).then(async (msg) => {
                        if (msg.deletable) setTimeout(() => msg.delete, 62000);
                    });

                    let msg_delete = await message.channel.send(`${client.warning} *Los mensajes se **__eliminaran__** en **__1__** un minuto...*`);
                    setTimeout(() => {
                        msg_delete.edit(`${client.waiting} *Eliminando **__los__** mensajes.*`);
                        if (msg_delete.deletable) setTimeout(() => msg_delete.delete(), 2000);
                        if (message.deletable) setTimeout(() => message.delete(), 2000);
                    }, 30000);
                }, 2000);
            } else if (baneados.size < 15)
                for (var mensaje of split_text) message.channel.send(mensaje);
        }).catch(err => {
            return message.reply({ content: `${client.emojiError} No se ha podido obtener la lista de usuarios baneados en este servidor.`, allowedMentions: { repliedUser: false } });
        })

    }
});