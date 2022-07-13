const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index"), moment = require("moment");
require('moment-duration-format');

module.exports = new Comando({
  nombre: "ban",
  alias: ["vetar", "veto"],
  categoria: "Moderador",
  descripcion: "Este comando te permite banear una persona de este servidor.",
  ejemplo: "$ban [@usuario] [razón]",
  ejecutar: async (client, message, args) => {
    let prefix;
    if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }
    let logs = await client.db.get(`${message.guild.id}.logs_channel`);
    let lchannel = message.guild.channels.cache.get(logs);
    if (!lchannel) {
      let e = new MessageEmbed();
      e.setColor(client.colorDefault);
      e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
      await client.db.delete(`${message.guild.id}.logs_channel`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    if (!message.guild.members.cache.get(client.user.id).hasPermission('MANAGE_ROLES')) {
      let f = new MessageEmbed()
      f.setDescription(`${client.emojiError} Necesito el permiso **MANAGE_ROLES** en este servidor para completar el uso de este comando.`);
      f.setColor(client.colorDefault)
      return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
    }

    const usage = new MessageEmbed()
      .setColor(client.colorDefault)
      .setDescription('Modo de uso: `' + prefix + 'ban [@usuario] [razón]`')
    if (!args[0]) return message.reply({ embeds: [usage], allowedMentions: { repliedUser: false } });

    let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!user || !message.guild.members.cache.has(user.id)) return message.reply({ embeds: [usage], allowedMentions: { repliedUser: false } });
    if (user.id === message.author.id) {
      let f = new MessageEmbed()
      f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedes banearte.')
      return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
    }
    if (user.id === client.user.id) {
      let f = new MessageEmbed()
      f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedo banearme.')
      return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
    }

    let reason = args.slice(1).join(' ');
    if (!reason) reason = 'No hay razón';
    if (reason.length > 324) reason = reason.slice(0, 321) + '...';
    let botRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
    let rolePosition = message.guild.members.cache.get(user.id).roles.highest.position;
    let userRolePossition = message.member.roles.highest.position;
    if (userRolePossition <= rolePosition) {
      let f = new MessageEmbed()
      f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No puedes prohibir a ese miembro porque tiene roles que son más altos o iguales que tu.')
      return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
    } else if (botRolePossition <= rolePosition) {
      let f = new MessageEmbed()
      f.setColor(client.colorDefault).setDescription('' + client.emojiError + ' No se puede prohibir a ese miembro porque tiene roles que son más altos o iguales que los mios mí.')
      return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
    } else if (!message.guild.members.cache.get(user.id).bannable) {
      let ef = new MessageEmbed()
      ef.setColor(client.colorDefault).setDescription('No puedo prohibir a ese miembro. Mi rol puede no ser lo suficientemente alto.')
      return message.reply({ embeds: [ef], allowedMentions: { repliedUser: false } });
    }
    let stringify = '';
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
      new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje del baneo`), );

    let emb = new MessageEmbed()
    emb.setColor(client.colorDefault)
    emb.setDescription(`Estas seguro de banear al usuario ${user}?`)
    message.reply({ embeds: [emb], allowedMentions: { repliedUser: false}, components: [button_unlock] }).then(async (msg) => {
      async function edit() {
        let embed_ = new MessageEmbed();
        embed_.setColor(client.colorDefault);
        embed_.setDescription(stringify);
        msg.edit({ embeds: [embed_], components: [button_unlock] });
      }

      async function lock() {
        let embed_ = new MessageEmbed();
        embed_.setColor(client.colorDefault);
        embed_.setDescription(stringify);
        msg.edit({ embeds: [embed_], components: [buttons_lock] });
      }

      let filter = x => x.user.id == message.author.id;
      const collector = msg.channel.createMessageComponentCollector({
        filter,
        idle: 30000,
        errors: ["idle"]
      });

      collector.on('collect', (btn) => {
        switch (btn.customId) {
          case si_id:
            if (!message.guild.members.cache.get(user.id).bannable) {
              stringify = `${client.emojiError} No tengo permisos para banear el usuario ${user}.`
              edit()
              return lock()
            }
            stringify = `${client.emojiSuccess} El usuario ${user} fue correctamente baneado.`
            edit()
            lock()

            message.guild.bans.create(user.id, {
              reason: reason
            }).then(() => {
              return lchannel.send({ content:`
\`\`\`md
# D-ConfigBot [Ban | Add]

* Usuario
> ${user.tag} [ID: ${user.id}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Razón
> ${reason}

* Ban ejecutado en
> #${message.channel.name}

* Hora
> ${moment(message.createdAt).format("DD/MM/YYYY, HH:mm:ss")}
\`\`\``, components: [button_url] 
              });
            }).catch(err => {
              stringify = `${client.emojiError} No tengo permisos para banear el usuario ${user}.`
              edit()
              return lock()
            });
            break;
          case no_id:
            stringify = `${client.emojiSuccess} El sistema de **ban** ha sido cancelado correctamente.`
            edit()
            lock()
            break;
          case cancelar_id:
            stringify = `${client.emojiSuccess} El sistema de **ban** ha sido cancelado correctamente`
            edit()
            lock()
            break;
        }
      });
    });
  }
});