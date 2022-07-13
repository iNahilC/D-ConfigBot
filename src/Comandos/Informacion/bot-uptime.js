const { Comando, DiscordUtils, } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "bot-uptime",
    alias: ["botuptime", "uptime"],
    categoria: "Información",
    descripcion: "Mire desde cuanto el bot está activo.",
    ejemplo: "$bot-uptime",
    ejecutar: async (client, message, args) => {
        return message.reply({
            content: `${client.emojiSuccess} **D-ConfigBot** está activo desde hace **${new DiscordUtils().parse_tiempo(client.uptime, "{{tiempo}}")}**`,
            allowedMentions: { repliedUser: false } });
    }
});