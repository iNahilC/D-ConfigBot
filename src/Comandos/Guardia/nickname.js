const { Comando, MessageEmbed, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "nickname",
    alias: ["nick", "setnick", "setnickname", "set-nick", "set-nickname"],
    categoria: "Guardia",
    descripcion: "Cambia el nickname a un usuario en el servidor.",
    ejemplo: "$nickname [@usuario] [nuevo nombre]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
        let logs = await client.db.get(`${message.guild.id}.logs_channel`);
        let lchannel = message.guild.channels.cache.find(r => r.id === logs);
        
        if (!lchannel) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
            await client.db.delete(`${message.guild.id}.logs_channel`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!message.guild.members.cache.get(client.user.id).permissions.has('MANAGE_NICKNAMES')) {
            let f = new MessageEmbed()
            f.setDescription(`${client.emojiFalse} Necesito el permiso **MANAGE_NICKNAMES** en este servidor para completar el uso de este comando.`);
            f.setColor(client.colorDefault)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        }

        if (!args[0]) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`Necesitas **__mencionar__** el usuario al cual quieres cambiarle el nombre.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`Necesitas **__mencionar__** el usuario al cual quieres cambiarle el nombre.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        if (!message.guild.members.cache.get(member.user.id)) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`Necesitas **__mencionar__** el usuario al cual quieres cambiarle el nombre.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        if (member.user.id === client.user.id) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiFalse} Necesitas mencionar a otro usuario.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }
        if (member.user.id === message.author.id) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiFalse} Necesitas mencionar a otro usuario.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        let botRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
        let rolePosition = message.guild.members.cache.get(member.user.id).roles.highest.position;
        let userRolePossition = message.member.roles.highest.position;

        if (userRolePossition <= rolePosition) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault)
            f.setDescription(`${client.emojiFalse} No puedes cambiarle el nickname al miembro ${member.user.tag} porque **__tiene roles que son más altos__** o **__iguales que usted__.`)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } })
        } else if (botRolePossition <= rolePosition) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault)
            f.setDescription(`${client.emojiFalse} No puedo cambiarle el nickname al usuario ${member.user.tag} ya que **__posee roles que son mas altos__** o **__iguales que los mios__**.`)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } })
        }

        let nick = args.slice(1).join(' ');
        if (!nick) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`Necesitas escribir el nuevo nick que deseas darle al usuario **__${member.user.tag}__**.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        if (nick.length > 32) {
            let e = new MessageEmbed()
            e.setColor("DARK_GREEN")
            e.setDescription(`${client.emojiFalse} El nickname que deseas dar **__contiene mas de 32 caracteres__**.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        if (member.displayName == nick) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiFalse} El usuario **__${member.user.username}__** ya tiene ese nickname.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }


        let button_url = new MessageActionRow().addComponents(
            new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje del moderador ${message.author.username}`), );
        member.setNickname(nick).catch(async (err) => {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiFalse} No se ha podido cambiar le nickname del usuario ${member}.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        });

        let e = new MessageEmbed()
        e.setColor(client.colorDefault)
        e.setDescription(`${client.emojiTrue} Ahora el nuevo nickname para el usuario **__${member.user.username}__** es **__${nick}__**.`);
        message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        return lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [NickName | User | Changed]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Usuario
> ${member.user.tag} [ID: ${member.user.id}]


* Nuevo NickName
> ${nick}

* Antiguo NickName
> ${member.displayName}

* Canal
> #${message.channel.name}
\`\`\``, components: [button_url] });
    }
});