const { Evento, MessageEmbed } = require("../../ConfigBot/index");
const moment = require("moment");
require("moment-duration-format");

module.exports = new Evento({
    nombre: "messageCreate",
    ejecutar: async (client, message) => {
        if (message.author.bot) return;
        if (!message.guild) return;
        let prefix;

        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" };
        if (!await client.db.has(`${message.guild.id}.permisos.${message.author.id}`) && message.member.permissions.has("ADMINISTRATOR")) await client.db.set(`${message.guild.id}.permisos.${message.author.id}`, 3);

        let args = message.content.slice(prefix.length).trim().split(/ +/g);
        let comando = args.shift().toLowerCase();

        if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;
        if (client.tiene_comando(comando)) {
            let comando_info = await client.obtener_comando(comando)
            let antiSpamCommandArrayChecker = await client.db.has(`${message.guild.id}.cmd_on`);
            if (!antiSpamCommandArrayChecker) return await client.db.set(`${message.guild.id}.cmd_on`, new Array());

            let antiSpamCommand = await client.db.get(`${message.guild.id}.cmd_on`);
            if (antiSpamCommand.includes(message.author.id) && !args[0] === "yt_unstuck" && ["sourcebin", "youtube-search"].includes(comando_info.nombre)) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiError} Ya estás ejecutando un comando, termina de usarlo.`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            if (comando_info.hasOwnProperty("disponible") && comando_info.disponible === false) return message.reply({
                content: `${client.emojiError} El comando **__${comando_info.nombre}__** se encuentra en mantenimiento!`,
                allowedMentions: {
                    repliedUser: false
                }
            });

            if (comando_info.hasOwnProperty("onlyOwner") && comando_info.onlyOwner === true && message.author.id !== client.ownerId) return message.reply({
                content: `${client.warning} El comando **__${comando_info.nombre}__** solo lo puede ejecutar mi creador!`,
                allowedMentions: {
                    repliedUser: false
                }
            });

            let userPermissionsRequired = await client.db.get(`${message.guild.id}.permisos.${message.author.id}`);
            if (comando_info.hasOwnProperty("categoria") && comando_info.categoria === "Administrador" && userPermissionsRequired === undefined || userPermissionsRequired < 3) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault).setDescription(client.missing_admin_permission);
                e.setFooter({ text: `Puedes establecer los permisos de un usuario escribiendo en el chat: ${prefix}set-permissions` });
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if (comando_info.hasOwnProperty("categoria") && comando_info.categoria === "Moderador" && userPermissionsRequired === undefined || userPermissionsRequired < 2) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault).setDescription(client.missing_mod_permission);
                e.setFooter(`Puedes establecer los permisos de un usuario escribiendo en el chat: ${prefix}set-permissions`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            } else if (comando_info.hasOwnProperty("categoria") && comando_info.categoria === "Guardia" && userPermissionsRequired === undefined || userPermissionsRequired < 1) {
                let e = new MessageEmbed();
                e.setColor(client.colorDefault).setDescription(client.missing_guard_permission);
                e.setFooter(`Puedes establecer los permisos de un usuario escribiendo en el chat: ${prefix}set-permissions`);
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }

            client.ejecutar_comando(comando, client, message, args)
            if (comando_info.hasOwnProperty("onlyOwner") && comando_info.onlyOwner === true) return;
            return client.channels.cache.get('754087876291199036').send('`[' + moment(message.createdAt).format("DD/MM/YYYY") + ']` `[servidor: ' + message.guild.name + '] [usuario: ' + message.author.tag + ' ID:' + message.author.id + '] [canal: #' + message.channel.name + ' ID:' + message.channel.id + ']: ' + message.content + '`')
        }

        let arraycomandos = await client.db.get(`${message.guild.id}.custom_cmds`);
        if (arraycomandos) {
            for (var i = 0; i < arraycomandos.length; i++) {
                if (comando === arraycomandos[i].nombre_cmd) {
                    let respuesta = arraycomandos[i].respuesta_cmd;
                    let tipo = arraycomandos[i].tipo_cmd;
                    if (tipo === "text") {
                        return message.reply({ content: `${respuesta}`, allowedMentions: { repliedUser: false } });
                    } else {
                        const emb = new MessageEmbed()
                        emb.setDescription(respuesta).setColor(client.colorDefault);
                        emb.setFooter({ text: "D-ConfigBot | Custom Commands" });
                        return message.reply({ embeds: [emb], allowedMentions: { repliedUser: false } });
                    }
                }
            }
        }
    }
});