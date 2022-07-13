const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "tempmute",
    alias: ["temp-mute", "mute-temporal", "mutetemporal", "muteo-temporal", "muteotemporal"],
    descripcion: "Mutea a una persona temporalmente.",
    categoria: "Guardia",
    ejemplo: "$mute [@usuario] [tiempo] [razón]",
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

        let mutedR = await client.db.get(`${message.guild.id}.mute_rol.role`);
        if (!mutedR) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription('Necesitas establecer primero el rol de mutear personas. Para eso utiliza `' + prefix + 'muterole [@rol]` [Moderador]');
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let lmute = message.guild.roles.cache.get(mutedR);
        if (!lmute) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription('El rol fue eliminado para agregar otro rol utiliza `' + prefix + 'muterole [@rol]` [Moderador]')
            await client.db.delete(`${message.guild.id}.mute_rol.role`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!message.guild.members.cache.get(client.user.id).permissions.has('MANAGE_ROLES')) {
            let f = new MessageEmbed()
            f.setDescription(`${client.emojiError} Necesito el permiso **MANAGE_ROLES** en este servidor para completar el uso de este comando.`);
            f.setColor(client.colorDefault)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        }

        let usuario = message.mentions.members.first() || message.guild.members.cache.find(x => x.displayName.toLowerCase() == args.join(" ").toLowerCase() || x.user.username.toLowerCase() == args.join(" ").toLowerCase()) || message.guild.members.cache.get(args[0]);
        if (!usuario) {
            let e2 = new MessageEmbed();
            e2.setColor(client.colorDefault);
            e2.setDescription(`${client.emojiError} Necesitas mencionar al usuario que deseas **__mutear temporalmente__**.`);
            return message.reply({ embeds: [e2], allowedMentions: { repliedUser: false } });
        }

        if (usuario.id == client.user.id || usuario.id == message.author.id) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas **__mencionar__** a otra persona.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!args[1]) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas escribir un tiempo formato valido. **__10s__**\`/\`**__10m__**\`/\`**__10h__**
\`\`\`md
* s => Para segundos.
* m => Para minutos.
* h => Para horas.
* d => Para dias.
* w => Para semanas.
\`\`\``);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }



        let time_convert = new DiscordUtils().Convert(args[1]);
        if (!time_convert) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas escribir un tiempo formato valido. **__10s__**\`/\`**__10m__**\`/\`**__10h__**
\`\`\`md
* s => Para segundos.
* m => Para minutos.
* h => Para horas.
* d => Para dias.
* w => Para semanas.
\`\`\``);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        
        if (time_convert.nombre.replace("semana(s)", "") > 3) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Debes poner un tiempo menor a **__3__** semanas.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        } else if (time_convert.nombre.replace("dia(s)", "") > 24) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Debes poner un tiempo menor a **__24__** dias.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        } else if (time_convert.nombre.replace("hora(s)", "") > 500) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Debes poner un tiempo menor a **__500__** horas.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        } else if (time_convert.nombre.replace("segundo(s)", "") > 2000000) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Debes poner un tiempo menor a **__2__** millones de segundos.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }
        let reason = args.slice(2).join(' ');
        if (!reason) reason = 'No hay razón';
        if (reason.length > 324) reason = reason.slice(0, 321) + '...';

        let botRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
        let rolePosition = message.guild.members.cache.get(usuario.id).roles.highest.position;
        let userRolePossition = message.member.roles.highest.position;

        if (userRolePossition <= rolePosition) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedes mutear a ese miembro porque tiene roles que son más altos o iguales que tu.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        } else if (botRolePossition <= rolePosition) {
            let f = new MessageEmbed()
            f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No se puede mutear a ese miembro porque tiene roles que son más altos o iguales que los mios mí.')
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        } else if (!message.guild.member(usuario).manageable) {
            let ef = new MessageEmbed()
            ef.setColor(client.colorDefault).setDescription('No puedo mutear a ese miembro. Mi rol puede no ser lo suficientemente alto.')
            return message.reply({ embeds: [ef], allowedMentions: { repliedUser: false } });
        }

        if (usuario.roles.cache.has(lmute.id)) {
            let user_timestamp = "";
            let timestamp_gramatica = "";
            if (await client.db.has(`${message.guild.id}.mute_rol.${usuario.id}`)) {
                user_timestamp = await client.db.get(`${message.guild.id}.mute_rol.${usuario.id}.timestamp`)
                timestamp_gramatica = `${client.emojiError} ${usuario} ya se encuentra **__muteado__** desde **<t:${user_timestamp}:R>**.`;
            } else timestamp_gramatica = `${client.emojiError} ${usuario} ya se encuentra **__muteado__**.`;

            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(timestamp_gramatica);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        usuario.roles.add(lmute.id).then(async () => {
            message.reply({ content: `${client.emojiSuccess} El usuario ${usuario} fue correctamente **__muteado__** por **__${time_convert.nombre}__**.`, allowedMentions: { repliedUser: false }});
            let button_url = new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje del moderador ${message.author.username}`), );
            await client.db.set(`${message.guild.id}.mute_rol.${usuario.id}`, { timestamp: Math.floor(Date.now() / 1000) });
            lchannel.send({ content: `
\`\`\`md
# D-ConfigBot [Mute | Add | ${usuario.user.tag} | ${time_convert.nombre}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Usuario
> ${usuario.user.tag} [ID: ${usuario.id}]

* Tiempo
> ${time_convert.nombre}

* Razón
> ${reason}\`\`\``, components: [button_url] });

            if (time_convert) {
                setTimeout(() => {
                    usuario.roles.remove(lmute.id).then(() => {
                        message.reply({ content: `${client.emojiSuccess} El mute del usuario ${usuario} acaba de **__expirar__** correctamente despues de **__${time_convert.nombre}__**.`, allowedMentions: { repliedUser: false } });
                    }).catch(err => {
                        let obtener_rol = message.guild.roles.cache.get(lmute.id);
                        if (!obtener_rol) return;
                        let clientRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
                        let obtener_rol_possition = obtener_rol.position;
                        if (!usuario.roles.has(lmute.id)) return;
                        if (clientRolePossition <= obtener_rol_possition) return message.reply({ content: `${client.emojiSuccess} El mute del usuario ${usuario} acaba de **__expirar__** pero no le pude remover el rol por la jerarquia de roles.`, allowedMentions: { repliedUser: false } });
                    });
                }, time_convert.tiempo);
            }
        }).catch(async (err) => {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} No se ha podido mutear el usuario ${usuario}, Intentalo de nuevo.`);
            client.channels.cache.get('719362703516368959').send(`<@656738884712923166> Error en el comando \`mute\`\nServidor: ${message.guild.name}\nUsuario: ${message.author.tag}\nError: ${e} `)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        });
    }
});