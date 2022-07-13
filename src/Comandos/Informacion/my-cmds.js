const { Comando, MessageEmbed } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "my-cmds",
    alias: ["mycmds", "my-cmd", "mycmd", "userpermissions", "user-permissions"],
    categoria: "Información",
    descripcion: "Este comando te permite ver el nivel de permisos de un usuario y los comandos que puede ejecutar el usuario.",
    ejemplo: "$mycmd [@usuario]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }
        let us = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        let u_permisos = await client.db.get(`${message.guild.id}.permisos.${us.id}`);
        if (us.user.bot) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiBot} ${us} Los **__bots_** no pueden ejecutar mis comandos.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let mantenimientos = client.comandos.filter(cmd => cmd.disponible == false);
        let administrador = client.comandos.filter(cmd => cmd.categoria == 'Administrador');
        let moderador = client.comandos.filter(cmd => cmd.categoria == 'Moderador');
        let guardia = client.comandos.filter(cmd => cmd.categoria == 'Guardia');
        let informacion = client.comandos.filter(cmd => cmd.categoria == 'Información');
        let entretenimiento = client.comandos.filter(cmd => cmd.categoria == 'Entretenimiento');
        let utilidad = client.comandos.filter(cmd => cmd.categoria == 'Utilidad');
        let total = administrador.size + moderador.size + guardia.size + utilidad.size + entretenimiento.size + informacion.size
        let custom_commands_array = await client.db.get(`${message.guild.id}.custom_cmds`);

        if (!u_permisos) {
            let user_total = utilidad.size + imagenes.size + entretenimiento.size + informacion.size
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`
${us} Tiene permisos de **__Usuario__** y puede ejecutar **__${user_total}__** comandos en total.

**Utilidad: [\`${utilidad.size}\`]**
\`\`\`1c
| ${utilidad.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Información: [\`${informacion.size}\`]**
\`\`\`1c
| ${informacion.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Entretenimiento: [\`${entretenimiento.size}\`]**
\`\`\`1c
| ${entretenimiento.map(c => `${c.nombre}`).join(' | ')}
\`\`\`
                `).setFooter(`Puedes mencionar a un usuario para ver sus permisos`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }
        if (u_permisos === 3) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault);
            e.setDescription(`
${us} Tiene permisos de **__Administrador__** y puedes ejecutar **__${total}__** comandos en total.

**Administrador: [\`${administrador.size}\`]**
\`\`\`1c
| ${administrador.map(c => `${c.nombre}`).join(' | ')}
\`\`\` 

**Moderador: [\`${moderador.size}\`]**
\`\`\`1c
| ${moderador.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Guardia: [\`${guardia.size}\`]**
\`\`\`1c
| ${guardia.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Utilidad: [\`${utilidad.size}\`]**
\`\`\`1c
| ${utilidad.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Información: [\`${informacion.size}\`]**
\`\`\`1c
| ${informacion.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Entretenimiento: [\`${entretenimiento.size}\`]**
\`\`\`1c
| ${entretenimiento.map(c => `${c.nombre}`).join(' | ')}
\`\`\`
                `).setFooter(`Puedes mencionar a un usuario para ver sus permisos`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })

        } else if (u_permisos === 2) {
            let mod_total = moderador.size + guardia.size + utilidad.size + imagenes.size + entretenimiento.size + informacion.size
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`
${us} Tiene permisos de **__Moderador__** y puede ejecutar **__${mod_total}__** comandos en total.

**Moderador: [\`${moderador.size}\`]**
\`\`\`1c
| ${moderador.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Guardia: [\`${guardia.size}\`]**
\`\`\`1c
| ${guardia.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Utilidad: [\`${utilidad.size}\`]**
\`\`\`1c
| ${utilidad.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Información: [\`${informacion.size}\`]**
\`\`\`1c
| ${informacion.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Entretenimiento: [\`${entretenimiento.size}\`]**
\`\`\`1c
| ${entretenimiento.map(c => `${c.nombre}`).join(' | ')}
\`\`\`
                `).setFooter(`Puedes mencionar a un usuario para ver sus permisos`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })

        } else if (u_permisos === 1) {
            let guard_total = guardia.size + utilidad.size + imagenes.size + entretenimiento.size + informacion.size
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`
${us} Tiene permisos de **__Guardia__** y puede ejecutar **__${guard_total}__** comandos en total.

**Utilidad: [\`${utilidad.size}\`]**
\`\`\`1c
| ${utilidad.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Información: [\`${informacion.size}\`]**
\`\`\`1c
| ${informacion.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Entretenimiento: [\`${entretenimiento.size}\`]**
\`\`\`1c
| ${entretenimiento.map(c => `${c.nombre}`).join(' | ')}
\`\`\`
                `).setFooter(`Puedes mencionar a un usuario para ver sus permisos`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        } else if (u_permisos === 0) {
            let user_total = utilidad.size + imagenes.size + entretenimiento.size + informacion.size
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`
${us} Tiene permisos de **__Usuarios__** y puede ejecutar **__${user_total}__** comandos en total:**

**Utilidad: [\`${utilidad.size}\`]**
\`\`\`1c
| ${utilidad.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Información: [\`${informacion.size}\`]**
\`\`\`1c
| ${informacion.map(c => `${c.nombre}`).join(' | ')}
\`\`\`

**Entretenimiento: [\`${entretenimiento.size}\`]**
\`\`\`1c
| ${entretenimiento.map(c => `${c.nombre}`).join(' | ')}
\`\`\`
                `).setFooter(`Puedes mencionar a un usuario para ver sus permisos`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }
    }
});