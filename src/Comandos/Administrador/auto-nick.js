const { Comando, MessageEmbed } = require("../../Configbot/index");
const time = require("node-datetime");
const moment = require("moment");
require('moment-duration-format');

module.exports = new Comando({
  nombre: "auto-nick",
  alias: ["autonick", "auto-nickname", "autonickname"],
  descripcion: "Permite que el bot cambie el nombre de los usuarios que entren al servidor al nombre establecido..",
  categoria: "Administrador",
  ejemplo: "$auto-nick [on || off || set]",
  ejecutar: async (client, message, args) => {
    let prefix;
    if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
    let logs = await client.db.get(`${message.guild.id}.logs_channel`);
    let lchannel = message.guild.channels.cache.get(logs)
    if (!lchannel) {
      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
      await client.db.delete(`${message.guild.id}.logs_channel`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    if (!message.guild.members.cache.get(client.user.id).permissions.has('MANAGE_NICKNAMES')) {
      let f = new MessageEmbed()
      f.setDescription(`${client.emojiError} Necesito el permiso **MANAGE_NICKNAMES** para cambiarle el nombre a los usuarios.`)
      f.setColor(client.colorDefault)
      return message.reply({ embeds: [f], allowedMentions: { repliedUser: false }})
    }

    if (!args[0]) {
      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setDescription(`
**D-ConfigBot [\`Auto-Nick\`]**

\`\`\`md
* ${prefix}auto-nick on 
> Para activar el sistema de auto-nick.

* ${prefix}auto-nick off
> Para desactivar el sistema de auto-nick.

* ${prefix}auto-nick set
> Para establecer un nickname para el auto-nick.
\`\`\`
`)
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }});
    }

    if (["on", "-on", "activar", "-activar"].includes(args[0])) {
      if (await client.db.has(`${message.guild.id}.auto_nick`)) {
        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setDescription(`${client.emojiError} El sistema de **__auto-nick__** ya está **__activado__** en este servidor.`);
        e.setFooter(`Si deseas activarlo escribe en el chat: ${prefix}auto-nick on.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }});
      }

      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setDescription(`${client.emojiSuccess} El sistema de **__auto-nick__** acaba de ser **__activado__** correctamente.`);
      client.db.set(`${message.guild.id}.auto_nick`, { estado: "activado" });
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }});
    } else if (["off", "-off", "activar", "-activar"].includes(args[0])) {
      if (!await client.db.has(`${message.guild.id}.auto_nick`)) {
        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setDescription(`${client.emojiError} El sistema de **__auto-nick__** no está **__activado__** en este servidor.`);
        e.setFooter(`Si deseas activarlo escribe en el chat: ${prefix}auto-nick on.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }});
      }

      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setDescription(`${client.emojiSuccess} El sistema de **__auto-nick__** acaba de ser correctamente **__desactivado__**.`);
      e.setFooter(`Si deseas activarlo de nuevo escribe en el chat: ${prefix}auto-nick on.`);
      client.db.delete(`${message.guild.id}.auto_nick`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }});
    } else if (["set", "-set", "establecer", "-establecer"].includes(args[0])) {
      if (!await client.db.has(`${message.guild.id}.auto_nick`)) {
        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setDescription(`${client.emojiError} El sistema de **__auto-nick__** no está **__activado__** en este servidor.`);
        e.setFooter(`Si deseas activarlo escribe en el chat: ${prefix}auto-nick on.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }});
      }
      
      let text = args.slice(1).join(' ');
      if (!text) {
        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setDescription(`
La longitud para los **__nombres__** permitida por **Discord** es de **__32__** caracteres lo que significa que es posible que algunos
nombres **largos** no se verán correctamente representados con el parámatro \`{usuario}\` y el \`nickname\` establecido. Los nombres
se le agregarán automáticamente a los usuarios ya sea cuando el bot tenga permisos de **manejar nicknames**.

**Parámatros: \`{usuario}\` = Es el nombre del usuario**
**Ejemplo: ${prefix}auto-nick set V.I.P \`{usuario}\`**
**Resultado: \`V.I.P iNahilC.\`.**

\`V.I.P\` contiene una cantidad de **5** caracteres contando los puntos y letras **(**\`.\`**)** más el nombre de usuario **(**\`{usuario}\`**)**
en este caso "\`iNahilC.\`" (\`8 caracteres\`) es igual a **13** de **32** caracteres utilizados para el **__nickname__**.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false }});
      }

      if (text.length > 32) {
          let e = new MessageEmbed();
          e.setColor(client.colorDefault);
          e.setDescription(`${client.emojiError} El **__nickname__** no puede contener más de **__32 caracteres__**.`);
          return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
      }

      if (await client.db.has(`${message.guild.id}.auto_nick.nickname`)) {
        if (await client.db.get(`${message.guild.id}.auto_nick.nickname`) == text) {
          let e = new MessageEmbed();
          e.setColor(client.colorDefault);
          e.setDescription(`${client.emojiError} El **__nickname__** **\`${text}\`** ya se encuentra **__establecido__**.`);
          return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setDescription(`${client.emojiSuccess} El **__nickname__** acaba de ser **__actualizado__** correctamente **\`${client.db.get(`${message.guild.id}.auto_nick.nickname`)}\`** → **\`${text}\`**.`)
        client.db.set(`${message.guild.id}.auto_nick.nickname`, text);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
      }

      if (!await client.db.has(`${message.guild.id}.auto_nick.nickname`)) {
        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setDescription(`${client.emojiSuccess} El **__nickname__** **\`${text}\`** acaba de ser **__establecido__** correctamente.`)
        client.db.set(`${message.guild.id}.auto_nick.nickname`, text);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
      }
    }
  }
})