const { Comando, MessageEmbed } = require("../../ConfigBot/index"), request = require('request');

module.exports = new Comando({
    nombre: "mc-skin",
    alias: ["mcskin"],
    descripcion: "Muestra un render de la skin de un jugador.",
    categoria: "Información",
    ejemplo: "$mc-skin [nombre]",
    ejecutar: async (client, message, args) => {
        const nombre = args.join(" ");
        if (!nombre) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault)
            e.setDescription("Necesitas ingresar el nombre de un jugador premium!")
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
        
        if (nombre.length > 16) {
            let a = new MessageEmbed();
            a.setColor(client.colorDefault)
            a.setDescription("Los nombres de jugadores de Minecraft no tienen mas de 16 caracteres.")
            return message.reply({ embeds: [a], allowedMentions: { repliedUser: false } });
        }

        let mojang_player_api = `https://api.mojang.com/users/profiles/minecraft/${nombre}`;
        request(mojang_player_api, function(err, resp, body) {
            if (err) {
                let i = new MessageEmbed();
                i.setColor(client.colorDefault)
                i.setDescription(`El usuario **${nombre}** no es un jugador premium!`);
                return message.reply({ embeds: [i], allowedMentions: { repliedUser: false } })
            }
            try {
                body = JSON.parse(body);
                let player_id = body.id;
                let render = `https://mc-heads.net/body/${player_id}/128.png`;
                let descargar_skin = `https://mc-heads.net/download/${player_id}`;
                let avatar = `https://mc-heads.net/avatar/${player_id}.png`;
                let avatar_sin_3d = `https://mc-heads.net/avatar/${player_id}/100/nohelm.png`

                let embed = new MessageEmbed();
                embed.setColor(client.colorDefault)
                embed.setDescription(`[Skin del jugador ${nombre}](${descargar_skin})`)
                embed.setImage(render);
                embed.setThumbnail(avatar);
                return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } })
            } catch (err) {
                let embed_error = new MessageEmbed()
                embed_error.setColor(client.colorDefault)
                embed_error.setDescription(`El usuario **${nombre}** no es un jugador premium!`);
                return message.creply({ embeds: [embed_error], allowedMentions: { repliedUser: false } })
            }
        });
    }
});