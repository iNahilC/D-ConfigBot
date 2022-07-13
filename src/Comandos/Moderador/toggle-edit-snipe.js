const { Comando, MessageEmbed } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "toggle-edit-snipe",
    alias: ["toggleeditsnipe"],
    categoria: "Moderador",
    descripcion: "Desactiva/activa el comando edit-snipe del servidor.",
    ejemplo: "$toggle-edit-snipe",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!"; }

        if (!await client.db.has(`${message.guild.id}.toggle_edit_snipe`)) await client.db.set(`${message.guild.id}.toggle_edit_snipe`, true);
        let editSnipeToggled = await client.db.get(`${message.guild.id}.toggle_edit_snipe`);
        
        if (editSnipeToggled) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiSuccess} El comando **__edit-snipe__** acaba de ser correctamente **__desactivado__**.`)
            await client.db.set(`${message.guild.id}.toggle_edit_snipe`, false);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        } else if (!editSnipeToggled) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiSuccess} El comando **__edit-snipe__** acaba de ser correctamente **__activado__**.`)
            await client.db.set(`${message.guild.id}.toggle_edit_snipe`, true);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
    }
});