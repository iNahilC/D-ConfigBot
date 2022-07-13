const { Comando, MessageEmbed, MessageButton, MessageActionRow } = require("../../Configbot/index");
const moment = require("moment-timezone");
require("moment-duration-format");

module.exports = new Comando({
    nombre: "auto-kick",
    alias: ["autokick", "auto-expulsion", "autoexpulsion", "auto-expulsión", "autoexpulsión", "auto-pateada", "autopateada"],
    descripcion: "Impide que un usuario entre al servidor cuando este activado este sistema (Expulsión automática).",
    categoria: "Administrador",
    ejemplo: "$auto-kick",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
        let logs = await client.db.get(`${message.guild.id}.logs_channel`);
        var lchannel = message.guild.channels.cache.get(logs);
        if (!lchannel) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
            await client.db.delete(`${message.guild.id}.logs_channel`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!message.guild.members.cache.get(client.user.id).permissions.has("MANAGE_MESSAGES")) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription("Necesito tener permisos de **MANAGE_MESSAGES** para poder completar el uso de este comando.");
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (await client.db.has(`${message.guild.id}.auto_kick`)) {
            let time = moment(message.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss")
            let auto_kick_off = new MessageEmbed();
            auto_kick_off.setDescription(`${client.emojiSuccess} Sistema de **__auto-kick__** acaba de ser correctamente **__desactivado__**.`);
            auto_kick_off.setColor(client.colorDefault);
            await client.db.delete(`${message.guild.id}.auto_kick`);
            message.reply({ embeds: [auto_kick_off], allowedMentions: { repliedUser: false } });
            let logs_off_button = new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje de ${message.author.username}`), );
            return lchannel.send({
                content: `
\`\`\`md
# D-ConfigBot [Auto-Kick | Desactivado]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Canal
> #${message.channel.name}

* Hora 
> ${time}

* Mensaje
> ${message.url}
\`\`\``,
                components: [logs_off_button]
            });
        } else if (!await client.db.has(`${message.guild.id}.auto_kick`)) {
            let time = moment(message.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss")
            let auto_kick_on = new MessageEmbed();
            auto_kick_on.setDescription(`${client.emojiSuccess} Sistema de **__auto-kick__** acaba de ser correctamente **__activado__**.`);
            auto_kick_on.setColor(client.colorDefault);
            await client.db.set(`${message.guild.id}.auto_kick`, message.author.id);
            message.reply({ embeds: [auto_kick_on], allowedMentions: { repliedUser: false } });
            let logs_on_button = new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje de ${message.author.username}`), );
            return lchannel.send({
                content: `
\`\`\`md
# D-ConfigBot [Auto-Kick | Activado]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Canal
> #${message.channel.name}

* Hora 
> ${time}

* Mensaje
> ${message.url}
\`\`\``,
                components: [logs_on_button]
            });
        }
    }
});