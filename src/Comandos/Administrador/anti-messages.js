const { Comando, MessageEmbed } = require("../../ConfigBot/index"), moment_time = require('moment-timezone');
module.exports = new Comando({
    nombre: "anti-messages",
    alias: ["anti-messages", "antimessages", "anti-mensajes", "antimensajes", "anti-mensaje", "antimensaje"],
    descripcion: "Los usuarios que tengan permisos de admin podrán escribir mientras este sistema esté activado.",
    categoria: "Administrador",
    ejemplo: "$anti-messages",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; };
        let logs = await client.db.get(`${message.guild.id}.logs_channel`);
        let lchannel = message.guild.channels.cache.get(logs);
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

        if (await client.db.has(`${message.guild.id}.anti_messages`)) {
            let time = moment_time(message.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss")
            let anti_messages_off = new MessageEmbed();
            anti_messages_off.setDescription(`${client.emojiSuccess} Sistema de **__anti-messages__** acaba de ser correctamente **__desactivado__**.`);
            anti_messages_off.setColor(client.colorDefault);
            await client.db.delete(`${message.guild.id}.anti_messages`);
            message.reply({ embeds: [anti_messages_off], allowedMentions: { repliedUser: false } });
            let logs_off_button = new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje de ${message.author.username}`), );
            return lchannel.send({
                content: `
\`\`\`md
# D-ConfigBot [Anti-Messages | Desactivado]

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
        } else if (!await client.db.has(`${message.guild.id}.anti_messages`)) {
            let time = moment_time(message.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss")
            let anti_messages_on = new MessageEmbed();
            anti_messages_on.setDescription(`${client.emojiSuccess} Sistema de **__anti-messages__** acaba de ser correctamente **__activado__**.`);
            anti_messages_on.setColor(client.colorDefault);
            await client.db.set(`${message.guild.id}.anti_messages`, "on");
            message.reply({ embeds: [anti_messages_on], allowedMentions: { repliedUser: false } });
            let logs_on_button = new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje de ${message.author.username}`), );
            return lchannel.send({
                content: `
\`\`\`md
# D-ConfigBot [Anti-Messages | Activado]

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