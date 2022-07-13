const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index"), { status } = require("minecraft-server-util");

module.exports = new Comando({
    nombre: "mc-server-info",
    alias: ["mc-serverinfo", "mcserverinfo", "mcserver", "mc-server", "mc-status", "mcstatus"],
    descripcion: "Muestra la información de un servidor de minecraft!",
    categoria: "Información",
    ejemplo: "$mc-status mc.hypixel.net",
    ejecutar: async (client, message, args) => {
        let servidor_ip = args.join(" ");
        let descReplace = /§\w/g;
        if (!servidor_ip) return message.reply({
            embeds: [new MessageEmbed().setColor(client.colorDefault).setDescription(`${client.emojiError} Necesitas escribir la **__dirección IP__** del servidor que deseas ver su información`)],
            allowedMentions: { repliedUser: false }
        });
        status(servidor_ip).then(async (m) => {
            let jugadores_activos = m.players.online,
                jugadores_maximos = m.players.max,
                version = m.version.name,
                descripcion = m.motd.clean;

            const embed = new MessageEmbed();
            embed.setColor(client.colorDefault);
            embed.setThumbnail(`https://eu.mc-api.net/v3/server/favicon/${servidor_ip}`);
            embed.setDescription(`
Información del servidor **${servidor_ip}** 

**IP:** ${servidor_ip}
**Jugadores:** ${jugadores_activos.toLocaleString()} de ${jugadores_maximos.toLocaleString()}
**Versión:** ${version}

**${descripcion}**`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }).catch(err => {
            console.log(err)
            let embed_error = new MessageEmbed();
            embed_error.setColor(client.colorDefault);
            embed_error.setDescription(`${client.emojiError} No se pudo obtener la información del servidor **${servidor_ip}**`);
            return message.reply({ embeds: [embed_error], allowedMentions: { repliedUser: false } });
        });
    }
});