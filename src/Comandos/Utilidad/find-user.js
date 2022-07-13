const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "find-user",
    alias: ["finduser"],
    categoria: "Utilidad",
    descripcion: "Este comando te permite mostrar los servidores en común del usuario mencionado y el bot.",
    ejemplo: "$find-user [@usuario]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
        let usuario = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        if (!usuario || !message.guild.members.cache.has(usuario.id)) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar a un usuario del servidor.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!await client.db.has(`${message.guild.id}.toggle_find_user.${usuario.id}`)) await client.db.set(`${message.guild.id}.toggle_find_user.${usuario.id}`, client.emojiON);
        let user_find_state = await client.db.get(`${message.guild.id}.toggle_find_user.${usuario.id}`);
        if (user_find_state == client.emojiON && message.author.id !== usuario.id) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} El usuario tiene configurado en su perfil que no se puedan ver sus servidores en común con el bot.`);
            e.setFooter({ text: `Si deseas configurar tu perfil ejecuta el comando ${prefix}perfil` });
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (usuario.id == client.user.id || usuario.user.bot) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar a **__otro__** usuario.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let filter = client.guilds.cache.filter((x) => x.members.cache.has(usuario.id)).first(30);
        if (filter.length <= 1) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.warning} El unico servidor en común que tengo con el usuario **__${usuario.user.tag}__** es este.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let index = 1;
        message.reply({ content: `${client.emojiSuccess} He encontrado **__${filter.length}__**/**__30__** servidores en común con el usuario **__${usuario.user.tag}__**`, allowedMentions: { repliedUser: false } }).then(async (msg) => {
            let split_text = new DiscordUtils().split_texto(filter.map((x) => `${index++}- ${x.name}`).join('\n'), 2000)
            for (var texto of split_text) {
                msg.reply(`
\`\`\`
${texto}
\`\`\``);
            }
        });
    }
});