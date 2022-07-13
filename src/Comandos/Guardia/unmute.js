const { Comando, MessageEmbed, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "unmute",
    alias: ["desmutear", "des-mutear", "un-mute", "unmutear", "des-silenciar", "dessilenciar", "desilenciar"],
    descripcion: "Este comando te permite desmutear a una persona ya muteada con el rol de muteos establecido en el bot.",
    categoria: "Guardia",
    ejemplo: "c!unmute [@usuario] [razón]",
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

        if (message.member.permissions.has("ADMINISTRATOR")) level.establecer(`${message.guild.id}.${message.author.id}`, 3)
        let u_permisos = await level.obtener(`${message.guild.id}.${message.author.id}`)
        if (u_permisos < 1) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault).setDescription(client.missing_guard_permission);
            e.setFooter({ text: `Puedes establecer los permisos de un usuario escribiendo en el chat: ${prefix}set-permissions` });
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let mutedR = await mute_rol.obtener(`${message.guild.id}.role`);
        if (!mutedR) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription('Necesitas establecer primero el rol de mutear personas. Para eso utiliza `' + prefix + 'muterole [@rol]` [Moderador]');
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let lmute = message.guild.roles.cache.find(r => r.id == mutedR)
        if (!lmute) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription('El rol fue eliminado para agregar otro rol utiliza `' + prefix + 'muterole [@rol]` [Moderador]')
            mute_rol.eliminar(`${message.guild.id}.role`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let usuario = message.guild.members.cache.get(args[0].replace("<@!", "").replace(">", "")) || message.guild.members.cache.get(args[0]);
        if (!usuario) return message.reply({ content: `${client.emojiError} Necesitas mencionar al usuario que deseas **__desmutear__**.`, allowedMentions: { repliedUser: false } });  
        if (usuario.id == client.user.id || usuario.id == message.author.id) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas **__mencionar__** a otra persona.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let reason = args.slice(1).join(' ');
        if (!reason) reason = 'No hay razón';
        if (reason.length > 324) reason = reason.slice(0, 321) + '...';

        let botRolePossition = message.guild.member(client.user).roles.highest.position;
        let rolePosition = message.guild.member(usuario).roles.highest.position;
        let userRolePossition = message.member.roles.highest.position;

        if (userRolePossition <= rolePosition) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedes desmutear a ese miembro porque tiene roles que son más altos o iguales que tu.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        } else if (botRolePossition <= rolePosition) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No se puede desmutear a ese miembro porque tiene roles que son más altos o iguales que los mios mí.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        } else if (!message.guild.member(usuario).manageable) {
            let ef = new MessageEmbed()
            ef.setColor(client.colorDefault).setDescription('No puedo desmutear a ese miembro. Mi rol puede no ser lo suficientemente alto.')
            return message.reply({ embeds: [ef], allowedMentions: { repliedUser: false } });
        }

        if (!usuario.roles.cache.has(lmute.id)) {
            let tiempo_gramatica = "";
            let unmute_gramatica = "";
            if (await client.db.has(`${message.guild.id}.mute_rol.${usuario.id}.unmute_timestamp`)) {
                tiempo_gramatica = await client.db.get(`${message.guild.id}.mute_rol.${usuario.id}.unmute_timestamp`)
                unmute_gramatica = `${client.emojiError} ${usuario} no se encuentra **__muteado__** desde **<t:${tiempo_gramatica}:R>** con el rol ${lmute}.`;
            } else if (await client.db.has(`${message.guild.id}.mute_rol.${usuario.id}.unmute_timestamp`)) unmute_gramatica = `${client.emojiError} ${usuario} no se encuentra **__muteado__** con el rol ${lmute}.`;
            return message.reply({ content: unmute_gramatica, allowedMentions: { repliedUser: false } });
        }

        usuario.roles.remove(lmute.id).then(async () => {
            let user_timestamp = "";
            if (await client.db.has(`${message.guild.id}.mute_rol.${usuario.id}`)) user_timestamp = await client.db.get(`${message.guild.id}.mute_rol.${usuario.id}.timestamp`)
            let button_url = new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje del moderador ${message.author.username}`), );
            await client.db.set(`${message.guild.id}.mute_rol.${usuario.id}`, {
                unmute_timestamp: Math.floor(Date.now() / 1000)
            });
            lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Unmute | Add | ${usuario.user.tag}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Usuario
> ${usuario.user.tag} [ID: ${usuario.id}]

* Razón
> ${reason}\`\`\``, components: [button_url] });
            return message.reply({ content: `${client.emojiError} El usuario ${usuario} fue **__desmuteado__** correctamente, Estaba muteado desde **<t:${user_timestamp}:R>**.`, allowedMentions: { repliedUser: false } });
        }).catch(async (err) => {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} No se ha podido **__desmutear__** el usuario ${usuario}, Inténtalo de nuevo.`);
            client.channels.cache.get('719362703516368959').send(`<@656738884712923166> Error en el comando \`unmute\`\nServidor: ${message.guild.name}\nUsuario: ${message.author.tag}\nError: ${e} `)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        })
    }
});