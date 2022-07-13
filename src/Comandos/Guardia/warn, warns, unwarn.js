const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
  nombre: "warn",
  alias: ["warns", "unwarn", "advertir", "advertencias", "des-advertir"],
  categoria: "Guardia",
  disponible: false,
  descripcion: "Advierte al usuario deseado, remueve una advertencia del usuario deseado, remueve todas las advertencias del usuario deseado, mira las advertencias del usuario deseado.",
  ejemplo: "$warn [add | list | remove | purge]",
  ejecutar: async (client, message, args) => {
    let prefix;
    if (prefix_db.tiene(message.guild.id)) { prefix = await prefix_db.obtener(message.guild.id) } else { prefix = "c!" }
    let logs = await logs_channel.obtener(message.guild.id);
    let lchannel = message.guild.channels.cache.get(logs);
    if (!lchannel) {
      let e = new MessageEmbed();
      e.setColor("ORANGE");
      e.setDescription(`${client.emojiFalse} ${client.missing_logs_channel}`);
      logs_channel.eliminar(message.guild.id);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }
    if (message.member.permissions.has("ADMINISTRATOR")) level.establecer(`${message.guild.id}.${message.author.id}`, 3);
    let u_permisos = await level.obtener(`${message.guild.id}.${message.author.id}`);
    if (u_permisos < 1) {
      let e = new MessageEmbed();
      e.setColor('ORANGE').setDescription(client.missing_guard_permission);
      e.setFooter(`Puedes establecer los permisos de un usuario escribiendo en el chat: ${prefix}set-permissions`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false} });
    }
    if (!args[0]) {
      let e = new MessageEmbed();
      e.setColor("GREEN");
      e.setDescription(`
**D-ConfigBot [\`Advertencias\`]**

${prefix}warn \`add\` Para **agregar** una nueva advertencia a un usuario.
${prefix}warn \`remove\` Para **remover** una advertencia a un usuario.
${prefix}warn \`list\` Para **mostrar** la lista de advertencias de un usuario.
${prefix}warn \`purge\` Para **eliminar** todas las advertencias de un usuario.`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
    }
    if (![
        "-rm", "rm",
        "-remove", "remove",
        "-remover", "remover",
        "-add", "add",
        "-agregar", "agregar",
        "-list", "list",
        "-lista", "lista",
        "-ver", "ver",
        "-purge", "purge",
        "-clear", "clear"
      ].includes(args[0])) {
      let e = new MessageEmbed();
      e.setColor("GREEN");
      e.setDescription(`
**D-ConfigBot [\`Advertencias\`]**

${prefix}warn \`add\` Para **agregar** una nueva advertencia a un usuario.
${prefix}warn \`remove\` Para **remover** una advertencia a un usuario.
${prefix}warn \`list\` Para **mostrar** la lista de advertencias de un usuario.`);
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
    } else if (["-add", "add", "-agregar", "agregar"].includes(args[0])) {
      let usuario = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
      if (!usuario || !message.guild.members.cache.has(usuario.id)) {
        let e = new MessageEmbed();
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} Necesitas __mencionar__ al usuario que quieres advertir.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }

      const si_id = new DiscordUtils().button_id_generator(20);
      const no_id = new DiscordUtils().button_id_generator(20);
      const cancelar_id = new DiscordUtils().button_id_generator(20);
      const botRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
      const rolePosition = message.guild.members.cache.get(usuario.id).roles.highest.position;
      const userRolePossition = message.member.roles.highest.position;

      let e = new MessageEmbed();
      let embed_text = "";
      let reason = args.slice(2).join(' ');
      if (!reason) reason = 'No hay razón';
      if (reason.length > 115) reason = reason.slice(0, 115) + '...';
      if (userRolePossition <= rolePosition) {
        let f = new MessageEmbed()
        f.setColor('DARK_RED').setDescription('' + client.emojiFalse + ' No puedes advertir a ese miembro porque tiene roles que son más **altos** o **iguales** que tu.');
        return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
      } else if (botRolePossition <= rolePosition) {
        let f = new MessageEmbed()
        f.setColor('DARK_RED').setDescription('' + client.emojiFalse + ' No se puede advertir a ese miembro porque tiene roles que son más **altos** o **iguales** que los mios.');
        return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
      }

      // Habilitado ✅
      const buttons_unlock = new MessageActionRow().addComponents(
      new MessageButton().setEmoji(client.emojiTrueId).setLabel("Si").setCustomId(si_id).setStyle("SUCCESS"),
      new MessageButton().setEmoji(client.emojiFalseId).setLabel("No").setCustomId(no_id).setStyle("DANGER"), );
      // Deshabilitado ❌
      const buttons_lock = new MessageActionRow().addComponents(
      new MessageButton().setEmoji(client.emojiTrueId).setLabel("Si").setCustomId(si_id).setStyle("SUCCESS").setDisabled(true),
      new MessageButton().setEmoji(client.emojiFalseId).setLabel("No").setCustomId(no_id).setStyle("DANGER").setDisabled(true), );
      if (reason == "No hay razón") {
        embed_text = `${client.warning} ${message.author}, Deseas **__advertir__** al ${usuario} **__sin razón__**?` } else {
        embed_text = `${client.warning} ${message.author}, Deseas **__advertir__** al usuario ${usuario} con la razón: **__${reason}__**?`
      }

      e.setColor("GREEN");
      e.setDescription(embed_text);
      await message.reply({ embeds: [e], allowedMentions: { repliedUser: false }, components: [buttons_unlock] }).then(async (msg) => {
        let filter = x => x.user.id == message.author.id;
        const collector = await msg.channel.createMessageComponentCollector({
          filter,
          time: 30000,
          errors: ["time"]
        });
        collector.on("collect", async (btn) => {
          switch (btn.customId) {
            case si_id:
              if (!warn_system.tiene(`${message.guild.id}.${usuario.id}`)) await warn_system.establecer(`${message.guild.id}.${usuario.id}`, {
                warn: new Array()
              });
              let numbers = randomstring.generate({ length: 6, charset: 'numeric' });
              warn_system.push(`${message.guild.id}.${usuario.id}.warn`, {
                id: numbers,
                moderador: message.author.id,
                moderador_tag: message.author.tag,
                razon: reason,
                timestamp: Math.floor(Date.now() / 1000),
              });
              let warn_usuario = await warn_system.obtener(`${message.guild.id}.${usuario.id}.warn`);
              let advertencias_gram = "";
              let button_url = new MessageActionRow().addComponents(
                new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje de la advertencia`), );

              if (warn_usuario.length == 1) {
                advertencias_gram = `Esta es **__la primera advertencia__** de ${usuario.user.username}, id: **__${numbers}__**.`; } else if (warn_usuario.length >= 1) {
                advertencias_gram = `Actualmente **${usuario.user.username}** cuenta con **__${warn_usuario.length}__** advertencias, id: **__${numbers}__**.`
              }
              if (msg.deletable) msg.delete();
              message.reply({ content: `${client.emojiTrue} El usuario **${usuario}** fue correctamente advertido. ${advertencias_gram}`, allowedMentions: { repliedUser: false } });
              collector.stop("x");
              return lchannel.send({ content:`
\`\`\`md
# D-ConfigBot [Warn | Add | ${usuario.user.tag}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Usuario
> ${usuario.user.tag} [ID: ${usuario.id}]

* Razón
> ${reason}

* Cantidad de advertencias
> ${warn_usuario.length}
\`\`\``, components: [button_url] });
              break;
            case no_id:
              let e = new MessageEmbed();
              e.setColor("GREEN");
              e.setDescription(`${client.emojiTrue} La advertencia fue correctamente **__detenida__**.`);
              if (msg.deletable) msg.delete();
              collector.stop("x")
              return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
              break;
          }
        });
        collector.on("end", (_, reason) => {
          if (reason == "x") return;
            let e = new MessageEmbed();
            e.setColor("GREEN");
            e.setDescription(`${client.emojiFalse} Tardaste demasiado para una respuesta tienes **__30__** segundos disponibles.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
        });
      });
    } else if (["-list", "list", "-lista", "lista", "-ver", "ver"].includes(args[0])) {
      let usuario = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
      if (!usuario || !message.guild.members.cache.has(usuario.id)) {
        let e = new MessageEmbed();
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} Necesitas __mencionar__ al usuario que quieres sus advertencias.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }
      let user_warning = await warn_system.obtener(`${message.guild.id}.${usuario.id}`);;
      if (!user_warning) {
        let e = new MessageEmbed();
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} El usuario ${usuario} posee advertencias aún.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }
      let warnings_count = await warn_system.obtener(`${message.guild.id}.${usuario.id}.warn`);
      if (warnings_count.length < 1) {
        let e = new MessageEmbed();
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} El usuario ${usuario} posee advertencias aún.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }
      warn_system.map(`${message.guild.id}.${usuario.id}.warn`, (u, key) => [key, u.id, u.moderador, u.moderador_tag, u.razon, u.timestamp]).then(async (users_list) => {
        let users_list_array = new Array(), users_list_embed = new MessageEmbed(), index = 1;
        while (users_list.length > 0) users_list_array.push(users_list.splice(0, 5).map(u => `ID: **${u[1]}**\nModerador: **${message.guild.members.cache.get(u[2]).user.tag || u[3]}**\nRazón: **${u[4].slice(0, 115)}**\n**<t:${u[5]}:F>** (**<t:${u[5]}:R>**)\n-------------------------------------------`));
        let e = new MessageEmbed();
        const roles_bot_left = new DiscordUtils().button_id_generator(20);
        const roles_bot_x = new DiscordUtils().button_id_generator(20);
        const roles_bot_right = new DiscordUtils().button_id_generator(20);
        const roles_bot_left_lock = new DiscordUtils().button_id_generator(20);
        const roles_bot_x_lock = new DiscordUtils().button_id_generator(20);
        const roles_bot_right_lock = new DiscordUtils().button_id_generator(20);

        let buttons_unlock = new MessageActionRow().addComponents(
          new MessageButton().setLabel("←").setCustomId(roles_bot_left).setStyle('PRIMARY'),
          new MessageButton().setLabel("❌").setCustomId(roles_bot_x).setStyle('DANGER'),
          new MessageButton().setLabel("→").setCustomId(roles_bot_right).setStyle('PRIMARY'), );


        let buttons_lock = new MessageActionRow().addComponents(
          new MessageButton().setLabel("←").setCustomId(roles_bot_left_lock).setStyle('PRIMARY').setDisabled(true),
          new MessageButton().setLabel("❌").setCustomId(roles_bot_x_lock).setStyle('DANGER').setDisabled(true),
          new MessageButton().setLabel("→").setCustomId(roles_bot_right_lock).setStyle('PRIMARY').setDisabled(true), );

        users_list_embed.setColor("GREEN");
        users_list_embed.setFooter(`Pagina 1 de ${users_list_array.length}`)
        users_list_embed.setDescription(`
${client.emojiTrue} __Lista de las **${warnings_count.length}** advertencias del usuario **${usuario}**__.

-------------------------------------------
${users_list_array[0].join("\n")}`);
        let msg = await message.reply({ embeds: [users_list_embed], allowedMentions: { repliedUser: false } });
        if (users_list_array.length == 1) return;
        await msg.edit({
          embeds: [users_list_embed],
          components: [buttons_unlock]
        }).catch(err => {});

        let pageindex = 0, filter = x => x.user.id == message.author.id;
        let collector = await msg.channel.createMessageComponentCollector({
          filter,
          idle: 30000,
          errors: ["idle"]
        });

        collector.on('collect', async (btn) => {
          switch (btn.customId) {
            case roles_bot_left:
              pageindex = pageindex <= 0 ? (users_list_array.length - 1) : pageindex - 1
              break;
            case roles_bot_x:
              collector.stop('x');
              break;
            case roles_bot_right:
              pageindex = pageindex >= users_list_array.length - 1 ? 0 : pageindex + 1
              break;
          }

          let embed_ = new MessageEmbed();
          embed_.setColor("GREEN");
          embed_.setFooter(`Pagina ${pageindex+1} de ${users_list_array.length}`)
          embed_.setDescription(`
${client.emojiTrue} __Lista de las **${warnings_count.length}** advertencias del usuario **${usuario}**__.

-------------------------------------------
${users_list_array[pageindex].join("\n")}`);
          await msg.edit({ embeds: [embed_], components: [buttons_unlock] });
        });

        collector.on('end', (_, reason) => {
          let embed_ = new MessageEmbed();
          embed_.setColor("GREEN");
          embed_.setFooter(`Pagina ${pageindex+1} de ${users_list_array.length}`)
          embed_.setDescription(`
${client.emojiTrue} __Lista de las **${warnings_count.length}** advertencias del usuario **${usuario}**__.

-------------------------------------------
${users_list_array[pageindex].join("\n")}`);
          if (reason == 'x') return;
          msg.delete().catch(error => {})
          if (message.deletable) return message.delete()
          return msg.edit({ embeds: [embed_], components: [buttons_lock] });
        });
      });
    } else if (["-rm", "rm", "-remove", "remove", "-remover", "remover"].includes(args[0])) {
      let e = new MessageEmbed();
      let usuario = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
      if (!usuario || !message.guild.members.cache.has(usuario.id)) {
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} Necesitas __mencionar__ al usuario que quieres remover su advertencia.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }
      let warn_usuario = await warn_system.obtener(`${message.guild.id}.${usuario.id}.warn`);
      if (!warn_usuario) {
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} El usuario ${usuario} no tiene advertencias aún.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }
      if (warn_usuario.length < 1) {
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} El usuario ${usuario} no tiene advertencias aún.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }
      let db_user_id = await warn_system.obtener(`${message.guild.id}.${usuario.id}.warn`);
      let warn_id = args[2]
      if (!warn_id) {
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} Necesitas escribir la **__ID de la advertencia__** que quieres remover.`);
        e.setFooter(`Si deseas ver las advertencias de los usuarios escribe: ${prefix}warn list @usuario`)
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }
      let verificadorarray = "";
      db_user_id.forEach(res => {
        if (!verificadorarray.includes(`${res.id}`)) verificadorarray += `${res.id}, `
      })
      if (!verificadorarray.includes(warn_id)) return message.reply({ content: `${client.emojiFalse} La advertencia con la id **__${warn_id}__** no existe, mira la lista de advertencias que tiene el usuario con **${prefix}warn list @usuario**.`, allowedMentions: { repliedUser: false } });
      for (var i = 0; i < db_user_id.length; i++) {
        if (db_user_id[i].id == warn_id) {
          let updated_warn_count = await warn_system.obtener(`${message.guild.id}.${usuario.id}.warn`);
          let advertencia_text = "";
          let button_url = new MessageActionRow().addComponents(
            new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje del Moderador`), )
          if (updated_warn_count.length < 1) {
            advertencia_text = `Ahora ${usuario} no tiene advertencias!`;
          } else if (updated_warn_count.length >= 1) {
            if (updated_warn_count.length - 1 == 0) { advertencia_text = `Ahora ${usuario} no tiene advertencias!`;
            } else { advertencia_text = `Ahora ${usuario} cuanta con **__${updated_warn_count.length - 1}__** advertencias`;
            }
          }
          message.reply({ content: `${client.emojiTrue} La advertencia del moderador: **${message.guild.members.cache.get(db_user_id[i].moderador).user.tag || db_user_id[i].moderador_tag}** fue correctamente **__removida__**. ${advertencia_text}`, allowedMentions: { repliedUser: false } });
          lchannel.send({ content:`
\`\`\`md
# D-ConfigBot [Warn | Remove | ${usuario.user.tag}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Usuario
> ${usuario.user.tag} [ID: ${usuario.id}]

* Advertencias
> ${updated_warn_count.length - 1}

* ID de la advertencia removida
> ${warn_id}

* Razón de la advertencia removida
> ${db_user_id[i].razon}

* Moderador de la advertencia removida
> ${message.guild.members.cache.get(db_user_id[i].moderador).user.tag || db_user_id[i].moderador_tag} [ID: ${db_user_id[i].moderador}]
\`\`\``, components: [button_url] });
          warn_system.extract(`${message.guild.id}.${usuario.id}.warn`, db_user_id[i]);
          return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
        }
      }
    } else if (["-purge", "purge", "-clear", "clear"].includes(args[0])) {
      let si_id = new DiscordUtils().button_id_generator(20);
      let no_id = new DiscordUtils().button_id_generator(20);
      let cancelar_id = new DiscordUtils().button_id_generator(20);
      let e = new MessageEmbed();
      let usuario = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
      if (!usuario || !message.guild.members.cache.has(usuario.id)) {
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} Necesitas __mencionar__ al usuario que quieres remover su advertencia.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }
      let warn_usuario = await warn_system.obtener(`${message.guild.id}.${usuario.id}.warn`);
      if (!warn_usuario) {
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} El usuario ${usuario} no tiene advertencias aún.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }
      if (warn_usuario.length < 1) {
        e.setColor("GREEN");
        e.setDescription(`${client.emojiFalse} El usuario ${usuario} no tiene advertencias aún.`);
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
      }


      // Habilitado ✅
      const buttons_unlock = new MessageActionRow().addComponents(
      new MessageButton().setEmoji("✅").setLabel("Si").setCustomId(si_id).setStyle("SUCCESS"),
      new MessageButton().setEmoji("❌").setLabel("No").setCustomId(no_id).setStyle("DANGER"), );

      // Deshabilitado ❌
      const buttons_lock = new MessageActionRow().addComponents(
      new MessageButton().setEmoji("✅").setLabel("Si").setCustomId(si_id).setStyle("SUCCESS").setDisabled(true),
      new MessageButton().setEmoji("❌").setLabel("No").setCustomId(no_id).setStyle("DANGER").setDisabled(true), );

      let gramatica = "";
      if (warn_usuario.length == 1) {
        gramatica = `${client.warning} Quieres eliminar **__la única advertencia__** que tiene el usuario ${usuario}?` } else if (warn_usuario.length > 1) {
        gramatica = `${client.warning} Quieres eliminar **__${warn_usuario.length}__** advertencias del usuario ${usuario}?`
      }
      let e2 = new MessageEmbed();
      e2.setColor("GREEN");
      e2.setDescription(gramatica);
      await message.reply({ embeds: [e2], allowedMentions: { repliedUser: false }, components: [buttons_unlock] }).then(async (msg) => {
        let filter = x => x.user.id == message.author.id;
        const collector = await msg.channel.createMessageComponentCollector({
          filter,
          time: 30000,
          errors: ["time"]
        });
        collector.on("collect", async (btn) => {
          switch (btn.customId) {
            case si_id:
              let warn_usuario = await warn_system.obtener(`${message.guild.id}.${usuario.id}.warn`);
              let advertencias_gram = "";
              if (warn_usuario.length == 1) {
                advertencias_gram = `${client.emojiTrue} Se ha eliminado **__la única advertencia__** del usuario ${usuario}.` } else if (warn_usuario.length > 1) {
                advertencias_gram = `${client.emojiTrue} Se han eliminado **__${warn_usuario.length}__** advertencias del usuario ${usuario}.`
              }
              warn_system.eliminar(`${message.guild.id}.${usuario.id}`);
              message.lineReplyNoMention(advertencias_gram);
              if (msg.deletable) msg.delete();
              collector.stop("x");
              let button_url = new MessageButton()
              button_url.setStyle('url');
              button_url.setURL(message.url);
              button_url.setLabel(`Ir al mensaje del moderador`);
              return lchannel.send({ content:`
\`\`\`md
# D-ConfigBot [Warn | Purge | ${usuario.user.tag}]

* Moderador
> ${message.author.tag} [ID: ${message.author.id}]

* Usuario
> ${usuario.user.tag} [ID: ${usuario.id}]

* Cantidad de advertencias eliminadas
> ${warn_usuario.length}
\`\`\``,  components: [button_url]
              });
              break;
            case no_id:
              let e = new MessageEmbed();
              e.setColor("GREEN");
              e.setDescription(`${client.emojiTrue} La purga de advertencias fue correctamente **__detenida__**.`);
              if (msg.deletable) msg.delete();
              collector.stop("x")
              return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
              break;
          }
        });
        collector.on("end", (_, reason) => {
          if (reason == "x") return;
          if (msg.deletable) msg.delete()
          let e = new MessageEmbed();
          e.setColor("GREEN");
          e.setDescription(`${client.emojiFalse} Tardaste demasiado para una respuesta tienes **__30__** segundos disponibles.`);
          return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });;
        });
      });
    }
  }
});