const { Comando, MessageEmbed } = require("../../ConfigBot/index"),
		{ Console } = require("../../ConfigBot/utilidades/ClientConsole");

module.exports = new Comando({
	nombre: "reload",
	alias: ["r", "recargar", "actualizar", "actualizar-command", "reload-command"],
	description: "Te permite actualizar todos los comandos del bot.",
	onlyOwner: true,
	ejemplo: "$reload",
	ejecutar: async (client, message, args) => {
		if (!args[0]) {
			try {
				await client.recargar_comando()
				return message.reply({ content: `${client.emojiSuccess} Se han actualizado todos los **comandos**.`, allowedMentions: {
					repliedUser: false
				}})
			} catch (e) {
				Console(["verde", "blanco"], "<1>[<0>COMANDO_ERROR<1>]<0> No se pudieron actualizar todos los comandos.\n\n"+e+"");
				return message.reply({ content: `${client.emojiError} No se pudo actualizar todos los **comandos**.`, allowedMentions: {
					repliedUser: false
				}})
			}
		} else {
			let comando = client.obtener_comando(args[0])
			if (!comando) return message.reply({ content: `${client.emojiError} El comando escuchado **no** fue encontrado.`, allowedMentions: {
				repliedUser: false
			}})

			await client.recargar_comando(comando.nombre);
			return message.reply({ content: `${client.emojiSuccess} El comando **${comando.nombre}** fue correctamente actualizado.`, allowedMentions: {
				repliedUser: false
			}})
		}
	}
});