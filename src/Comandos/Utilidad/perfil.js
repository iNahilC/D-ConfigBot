const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Comando({
	nombre: "perfil",
	alias: ["user-perfil"],
	categoria: "Utilidad",
	descripcion: "Este comando te permite configurar acciones del bot, por ejemplo como desactivar tus mensajes en el toggle-snipe y más cosas.",
	ejemplo: "$perfil",
	ejecutar: async (client, message, args) => {
		let prefix;
	    if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
		if (!await client.db.has(`${message.guild.id}.toggle_sniper_user.${message.author.id}`)) await client.db.set(`${message.guild.id}.toggle_sniper_user.${message.author.id}`, client.emojiON);
		if (!await client.db.has(`${message.guild.id}.toggle_find_user.${message.author.id}`)) await client.db.set(`${message.guild.id}.toggle_find_user.${message.author.id}`, client.emojiON);
		if (!await client.db.has(`${message.guild.id}.toggle_edit_sniper_user.${message.author.id}`)) await client.db.set(`${message.guild.id}.toggle_edit_sniper_user.${message.author.id}`, client.emojiON);
		let snipe_state = await client.db.get(`${message.guild.id}.toggle_sniper_user.${message.author.id}`);
		let user_state = await client.db.get(`${message.guild.id}.toggle_find_user.${message.author.id}`);
		let edit_snipe_state = await client.db.get(`${message.guild.id}.toggle_edit_sniper_user.${message.author.id}`);

		if (!args[0]) {
			let e = new MessageEmbed();
			e.setColor(client.colorDefault);
			e.setDescription(`
**D-ConfigBot [\`Perfil\`]**

${prefix}perfil \`snipe\` Para que tus mensajes **no sean**/**sean** detectados por el comando **${prefix}snipe**.
${prefix}perfil \`edit-snipe\` Para que tus mensajes editados **no sean**/**sean** detectados por el comando **${prefix}edit-snipe**.
${prefix}perfil \`find-user\` Para que nadie pueda ver tus servidores en común con el bot en el comando **${prefix}find-user**.

**Snipe:** ${snipe_state}
**Edit-Snipe:** ${edit_snipe_state}
**Find-User:** ${user_state}

${client.warning} Si tu eres el ejecutor de los comando el bot **__ignorará las configuraciones__** del perfil.`);
			return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
		}

		if (["snipe"].includes(args[0])) {
			if (snipe_state == client.emojiOFF) {
				let e = new MessageEmbed();
				e.setColor(client.colorDefault);
				e.setDescription(`${client.emojiSuccess} Ahora todos **__podrán ver__** tus mensajes eliminados ejecutando el comando **${prefix}snipe**`);
				await client.db.set(`${message.guild.id}.toggle_sniper_user.${message.author.id}`, client.emojiON);
				return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
			} else if (snipe_state == client.emojiON) {
				let e = new MessageEmbed();
				e.setColor(client.colorDefault);
				e.setDescription(`${client.emojiSuccess} Ahora todos **__ no podrán ver__** tus mensajes eliminados ejecutando el comando **${prefix}snipe**`);
				e.setFooter({ text: `Si tu eres el ejecutor del comando el bot *ignorará las configuraciones* del perfil.` });
				await client.db.set(`${message.guild.id}.toggle_sniper_user.${message.author.id}`, client.emojiOFF);
				return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
			}
		} else if (["find-user", "finduser"].includes(args[0])) {
			if (user_state == client.emojiOFF) {
				let e = new MessageEmbed();
				e.setColor(client.colorDefault);
				e.setDescription(`${client.emojiSuccess} Ahora todos **__podrán ver__** tus servidores en común con el bot ejecutando el comando **${prefix}find-user ${message.author}**`);
				await client.db.set(`${message.guild.id}.toggle_find_user.${message.author.id}`, client.emojiON);
				return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
			} else if (user_state == client.emojiON) {
				let e = new MessageEmbed();
				e.setColor(client.colorDefault);
				e.setDescription(`${client.emojiSuccess} Ahora todos **__no podrán ver__** tus servidores en común con el bot ejecutando el comando **${prefix}find-user ${message.author}**`);
				e.setFooter({ text: `Si tu eres el ejecutor del comando el bot *ignorará las configuraciones* del perfil.` });
				await client.db.set(`${message.guild.id}.toggle_find_user.${message.author.id}`, client.emojiOFF);
				return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
			}
		} else if (["edit-snipe", "editsnipe"].includes(args[0])) {
			if (edit_snipe_state == client.emojiOFF) {
				let e = new MessageEmbed();
				e.setColor(client.colorDefault);
				e.setDescription(`${client.emojiSuccess} Ahora todos **__podrán ver__** tus mensajes editados ejecutando el comando **${prefix}edit-snipe**`);
				await client.db.set(`${message.guild.id}.toggle_edit_sniper_user.${message.author.id}`, client.emojiON);
				return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
			} else if (edit_snipe_state == client.emojiON) {
				let e = new MessageEmbed();
				e.setColor(client.colorDefault);
				e.setDescription(`${client.emojiSuccess} Ahora todos **__ no podrán ver__** tus mensajes editados ejecutando el comando **${prefix}edit-snipe**`);
				e.setFooter({ text: `Si tu eres el ejecutor del comando el bot *ignorará las configuraciones* del perfil.` });
				await client.db.set(`${message.guild.id}.toggle_edit_sniper_user.${message.author.id}`, client.emojiOFF);
				return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
			}
		}
	}
});