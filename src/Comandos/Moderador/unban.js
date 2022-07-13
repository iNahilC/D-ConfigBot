const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");
const moment = require("moment");
require('moment-duration-format');

module.exports = new Comando({
  nombre: "unban",
  alias: ["un-ban", "undoban", "undo-ban", "desbanear", "desban", "des-banear", "des-ban"],
  categoria: "Moderador",
  descripcion: "Desbanea a un usuario ingresando su ID de usuario.",
  ejemplo: "$unban [userID] [razón]",
  ejecutar: async (client, message, args) => {
    let prefix;
    if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }
    let logs = await client.db.get(`${message.guild.id}.logs_channel`);
    let lchannel = message.guild.channels.cache.get(logs)
    if (!lchannel) {
      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
      await client.db.delete(`${message.guild.id}.logs_channel`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    if (!message.guild.members.cache.get(client.user.id).permissions.has('BAN_MEMBERS')) {
      let f = new MessageEmbed()
      f.setDescription(`${client.emojiError} Necesito el permiso **BAN_MEMBERS** en este servidor para completar el uso de este comando.`);
      f.setColor(client.colorDefault)
      return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
    }
    let reason = args.slice(1).join(" ");
    let usage = new MessageEmbed();
    usage.setColor(client.colorDefault);
    usage.setDescription(`${client.emojiError} Necesitas escribir la **__ID__** del usuario que quieres **__desbanear__**.`);
    if (!args[0]) return message.reply({ embeds: [usage], allowedMentions: { repliedUser: false } });
    if (isNaN(args[0])) {
      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setDescription(`${client.emojiError} Las **__ID's__** de Discord solo contienen números.`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
    }

    try {
      let id_valida = await client.users.fetch(args[0])
    } catch (err) {
      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setDescription(`${client.emojiError} El usuario con la id **__${args[0]}__** no fue encontrado.`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
    }

    let id_valida = await client.users.fetch(args[0]);
    let banList = await message.guild.bans.fetch();
    if (!banList.get(id_valida.id)) {
      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setDescription(`${client.emojiError} El usuario **__${id_valida.tag}__** no se encuentra baneado en el servidor.`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
    } else if (banList.size == 0) {
      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setDescription(`${client.emojiError} Aún **__no hay__** usuarios baneados en este servidor.`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
    }
    if (!reason) reason = "No hay razón";
    if (reason.length > 324) reason = reason.slice(0, 321) + '...';
    const si_id = new DiscordUtils().button_id_generator(20);
    const no_id = new DiscordUtils().button_id_generator(20);

    // Habilitado ✅
    const button_unlock = new MessageActionRow().addComponents(
    new MessageButton().setEmoji("✅").setLabel("Si").setCustomId(si_id).setStyle("SUCCESS"),
    new MessageButton().setEmoji("❌").setLabel("No").setCustomId(no_id).setStyle("DANGER"), );

    // Deshabilitado ❌
    const button_lock = new MessageActionRow().addComponents(
    new MessageButton().setEmoji("✅").setLabel("Si").setCustomId(si_id).setStyle("SUCCESS").setDisabled(true),
    new MessageButton().setEmoji("❌").setLabel("No").setCustomId(no_id).setStyle("DANGER").setDisabled(true), );

    const button_url = new MessageActionRow().addComponents( 
      new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje del unban`), );

    const forceban_wait_embed = new MessageEmbed();
    forceban_wait_embed.setColor(client.colorDefault);
    forceban_wait_embed.setDescription(`${client.warning} Estás seguro de **desbanear** al usuario **__${id_valida.tag}__**?`);
    message.reply({ embeds: [forceban_wait_embed], allowedMentions: { repliedUser: false }, components: [button_unlock] }).then(async (msg) => {
      const filter = x => x.user.id == message.author.id;
      const collector = await msg.channel.createMessageComponentCollector({
        filter,
        idle: 30000,
        errors: ["idle"]
      });
      await collector.on('collect', (btn) => {
        switch (btn.customId) {
          case si_id:
            message.guild.bans.remove(id_valida.id, { reason: reason }).then(() => {
              lchannel.send({ content:`
\`\`\`md
# D-ConfigBot [Unban]

* Usuario
> ${id_valida.tag} [ID: ${id_valida.id}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Razón
> ${reason}

* Comando ejecutado en el canal
> #${message.channel.name}

* Hora
> ${moment(message.createdAt).format("DD/MM/YYYY, HH:mm:ss")}
\`\`\``, components: [button_url] });

              let forceban_embed_done = new MessageEmbed();
              forceban_embed_done.setColor(client.colorDefault);
              forceban_embed_done.setDescription(`${client.emojiSuccess} El usuario **__${id_valida.tag}__** acaba de ser **desbaneado** por el moderador **__${message.author.tag}__**.`);
              msg.edit({ embeds: [forceban_embed_done], components: [] });
            }).catch(err => {
              let e = new MessageEmbed();
              e.setColor(client.colorDefault);
              e.setDescription(`${client.emojiError} No puedo **desbanear** al usuario **__${id_valida.tag}__**.`);
              return msg.edit({ embeds: [e], components: [] });
            });
            break;
          case no_id:
            let forceban_embed_no = new MessageEmbed();
            forceban_embed_no.setColor(client.colorDefault);
            forceban_embed_no.setDescription(`${client.emojiSuccess} El sistema de **unban** ha sido cancelado correctamente.`);
            collector.stop("x")
            msg.edit({ embeds: [forceban_embed_no], components: [] });
            break;
        }
      });
      await collector.on("end", (btn, reason) => {
        if (reason == "x") return;
        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setDescription(`${client.emojiError} Tardaste demasiado para contestar tienes **__30__** segundos disponibles.`)
        return msg.edit({ embeds: [e], components: [] })
      });
    });
  }
});