const { Comando, MessageEmbed } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "toggle-snipe",
    alias: ["togglesnipe"],
    categoria: "Moderador",
    descripcion: "Desactiva/activa el comando snipe del servidor.",
    ejemplo: "$toggle-snipe",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!"; }
        if (!await client.db.has(`${message.guild.id}.toggle_snipe`)) await client.db.set(`${message.guild.id}.toggle_snipe`, true);
        let snipeToggled = await client.db.get(`${message.guild.id}.toggle_snipe`);

        if (snipeToggled) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiSuccess} El comando **__snipe__** acaba de ser correctamente **__desactivado__**.`)
            await client.db.set(`${message.guild.id}.toggle_snipe`, false);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        } else if (!snipeToggled) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiSuccess} El comando **__snipe__** acaba de ser correctamente **__activado__**.`)
            await client.db.set(`${message.guild.id}.toggle_snipe`, true);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
    }
})