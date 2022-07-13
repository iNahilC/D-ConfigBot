const { Comando, MessageEmbed } = require("../../ConfigBot/index.js");

module.exports = new Comando({
    nombre: "test-command",
    alias: ["tc", "ts"],
    categoria: "Moderador",
    onlyOwner: true,
    description: "Comando de pruebas!",
    ejecutar: async (client, message, args) => {
        const cmd = await client.db.get(`${message.guild.id}.custom_cmds`);
        console.log(cmd);
    }
});