const { Evento } = require("../../ConfigBot/index");

module.exports = new Evento({
  nombre: "guildMemberAdd",
  ejecutar: async (client, member) => {
    if (!await client.db.has(`${member.guild.id}.auto_kick`) || !await client.db.has(`${member.guild.id}.logs_channel`)) return;

    let logs = await client.db.get(`${member.guild.id}.logs_channel`);
    let lchannel = await member.guild.channels.cache.get(logs);
    if (!lchannel) return await client.db.delete(`${member.guild.id}.logs_channel`);

    const modId = await client.db.get(`${member.guild.id}.auto_kick`);

    try { await client.users.fetch(modId); } catch (err) {
      return await client.db.delete(`${member.guild.id}.auto_kick`);
    }

    const moderador = await client.users.fetch(modId);

    if (!member.guild.me.permissions.has("KICK_MEMBERS")) {
      await client.db.delete(`${member.guild.id}.auto_kick`);
      return lchannel.send(`
\`\`\`md
# D-ConfigBot [Auto-Kick | Desactivado Automático]

* Moderador
> ${client.user.tag} [ID: ${client.user.id}]

* Razón
> No tengo permisos para expulsar miembros.
\`\`\``);
    }

    await member.send(`Hey **${member}**, El sistema de **__auto-kick__** está activado en el servidor **${member.guild.name}**, por lo que no podrás entrar al servidor hasta que este **desactivado**. Si tienes alguna duda puedes hablar con el **moderador** que activo el sistema **${moderador.tag}.**`).catch(err => {});
    setTimeout(async () => {
      member.kick(`Auto-Kick | Activado por: ${moderador.tag}`);
      return lchannel.send(`
\`\`\`md
# D-ConfigBot [Auto-Kick | User Kicked]

* Usuario
> ${member.user.username} [ID: ${member.user.id}]

* Razón
> Expulsado por el sistema de auto-kick.

* Activado por el Moderador
> ${moderador.tag} [ID: ${moderador.id}]
\`\`\``);
    }, 1000);
  }
});