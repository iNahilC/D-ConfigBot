const { Evento } = require("../../ConfigBot/index"), moment_time = require('moment-timezone');

module.exports = new Evento({
  nombre: "guildMemberAdd",
  ejecutar: async (client, member) => {
    if (!await client.db.has(`${member.guild.id}.auto_nick`)) return;
    if (!await client.db.has(`${member.guild.id}.logs_channel`)) return;
    
    let logs = await client.db.get(`${member.guild.id}.logs_channel`);
    let lchannel = member.guild.channels.cache.get(logs);
    if (!lchannel) return await client.db.delete(`${member.guild.id}.logs_channel`);

    let nick = await client.db.get(`${member.guild.id}.auto_nick`);
    if (!nick) return await client.db.delete(`${member.guild.id}.auto_nick`);

    let nickReplaced = nick.replaceAll("{usuario}", member.user.username);
    nickReplaced = nickReplaced.slice(0, 32);
    let time = moment_time(new Date()).tz("America/Santo_Domingo").format("DD/MM/YYYY, hh:mm:ss");

    if (!member.guild.me.permissions.has("MANAGE_NICKNAMES")) {
      await client.db.delete(`${member.guild.id}.auto_nick`);
      return lchannel.send(`
\`\`\`md
# D-ConfigBot [Auto-Nick | Desactivado Automático]

* Moderador
> ${client.user.tag} [ID: ${client.user.id}]

* Razón
> no tengo permisos para manejar nombres.
\`\`\``);
    }


      lchannel.send(`
\`\`\`md
# D-ConfigBot [Auto-Nick]

* Usuario
> ${member.user.tag}  [ID: ${member.id}]

* Nuevo nick
> ${nickReplaced}

* Nick anterior
> ${member.displayName}

* Hora
> ${time}
\`\`\``);
    
    return member.setNickname(nickReplaced);
  }
});