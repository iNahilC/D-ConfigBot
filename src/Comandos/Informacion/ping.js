const { Comando } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "ping",
    alias: ["bot-ping", "botping", "bot-ms", "botms", "ms"],
    descripcion: "Muestra el ping actual del bot.",
    categoria: "Información",
    ejemplo: "$ping",
    ejecutar: async (client, message, args) => {
        return message.reply({ content: `${client.emojiSuccess} Mi ping es de **__${client.ws.ping}__ milisegundos**!`, allowedMentions: { repliedUser: false } });
    }
});