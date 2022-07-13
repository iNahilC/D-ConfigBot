const { Comando, MessageEmbed, MessageButton, MessageActionRow } = require("../../Configbot/index");
const moment = require("moment-timezone");
require("moment-duration-format");

module.exports = new Comando({
  nombre: "auto-nick",
  alias: ["autonick", "auto-nickname", "autonickname"],
  descripcion: "Establece un nombre por defecto para los nuevos usuarios.",
  categoria: "Administrador",
  ejemplo: "$auto-nick [nombre]",
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
    
    
    let nick = args.join(" ");
    if (!nick && await client.db.has(`${message.guild.id}.auto_nick`)) {
      let e = new MessageEmbed()
      e.setColor(client.colorDefault)
      e.setDescription(`${client.emojiSuccess} El sistema de **__auto-nick__** acaba de ser **__desactivado__** **correctamente**.`);
      await client.db.delete(`${message.guild.id}.auto_nick`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
    }
    
    if (!nick) return message.reply({ embeds: [
      new MessageEmbed().setColor(client.colorDefault).setDescription(`
      La longitud para los **__nicknames__** permitida por **Discord** es de **__32__** caracteres lo que significa que es posible que algunos nombres **largos** no se verán correctamente representados con el parámatro \`{usuario}\` y el \`nickname\` establecido. Los nombres se le agregarán automáticamente a los usuarios ya sea cuando el bot tenga permisos de **modificar nombres**.
      
      **Parámatros: \`{usuario}\` = Es el nombre del usuario**
      **Ejemplo: ${prefix}auto-nick V.I.P \`{usuario}\`**
      **Resultado: \`V.I.P iNahilC.\`.**
      
      \`V.I.P\` contiene una cantidad de **5** caracteres contando los puntos y letras **(**\`.\`**)** más el nombre de usuario **(**\`{usuario}\`**)**
      en este caso "\`iNahilC.\`" (\`8 caracteres\`) es igual a **13** de **32** caracteres utilizados para el **__nickname__**.`)], allowedMentions: { repliedUser: false } });
      

      if (nick.includes("{usuario}") && nick.length > 41 || !nick.includes("{usuario}") && nick.length > 32 || nick.length < 3) {
        let g = new MessageEmbed()
        g.setColor(client.colorDefault)
        g.setDescription(`${client.emojiError} El nombre sugerido es muy **${nick.length < 3 ? `corto, Debe contener minimo 3 caracteres` : `largo, Debe contener maximo 32 caracteres`}**.`)
        return message.reply({ embeds: [g], allowedMentions: { repliedUser: false }})
      }
      
      if (await client.db.has(`${message.guild.id}.auto_nick`) && await client.db.get(`${message.guild.id}.auto_nick`) === nick) {
        let h = new MessageEmbed()
        h.setColor(client.colorDefault)
        h.setDescription(`${client.emojiError} El nombre sugerido ya está **establecido**.`)
        return message.reply({ embeds: [h], allowedMentions: { repliedUser: false }})
      }
      
      let time = moment(message.createdAt).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss")

      if (!await client.db.has(`${message.guild.id}.auto_nick`)) {
        let i = new MessageEmbed().setColor(client.colorDefault)
        .setDescription(`${client.emojiSuccess} El sistema de **__auto-nick__** acaba de ser **__activado__** **correctamente**, Nick establecido a **${nick}**.`)
        let goToMessage = new MessageActionRow().addComponents(new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje de ${message.author.username}`));
        await client.db.set(`${message.guild.id}.auto_nick`, nick);
        message.reply({ embeds: [i], allowedMentions: { repliedUser: false } })

        return lchannel.send({
          content: `
\`\`\`md
# D-ConfigBot [Auto-Nick | Activado]

* Moderador
> ${message.author.tag} [${message.author.id}]

* Canal
> #${message.channel.name} [${message.channel.id}]

* Hora
> ${time}

* Nombre
> ${nick}

\`\`\`
          `, components: [goToMessage]
      });
    }

    let i = new MessageEmbed().setColor(client.colorDefault)
      .setDescription(`${client.emojiSuccess} El nuevo nick que se le dará a los usuarios será **${nick}**.`)
    let goToMessage = new MessageActionRow().addComponents(new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje de ${message.author.username}`));
    let oldNickname = await client.db.get(`${message.guild.id}.auto_nick`);
    await client.db.set(`${message.guild.id}.auto_nick`, nick);
    message.reply({ embeds: [i], allowedMentions: { repliedUser: false } })

    return lchannel.send({
      content: `
\`\`\`md
# D-ConfigBot [Auto-Nick | Cambiado]

* Moderador
> ${message.author.tag} [${message.author.id}]

* Canal
> #${message.channel.name} [${message.channel.id}]

* Hora
> ${time}

* Nickname Nuevo
> ${nick}

* Nickname Anterior
> ${oldNickname}
\`\`\`
          `, components: [goToMessage]
    });
  }
});