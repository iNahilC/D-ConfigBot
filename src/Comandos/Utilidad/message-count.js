const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow, MessageSelectMenu } = require("../../ConfigBot/index");

module.exports = new Comando({
  nombre: "messages-count",
  alias: ["messagescount", "mensagescount", "message-count", "messagecount", "msgs-count", "msgscount", "msg-count", "msgcount"],
  descripcion: "Este comando muestra cuantos mensajes ha enviado un usuario en el servidor",
  categoria: "Utilidad",
  ejemplo: "$messages-count [@user]",
  ejecutar: async (client, message, args) => {
    let prefix;
    if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }

//     if (["-list", "-lista", "list", "lista"].includes(args[0])) {
//       let msg_count = await client.db.get(`${message.guild.id}.msg_count`);
//       let msgCountMap = Object.entries(msg_count);
//       if (msgCountMap) {
//           msgCountMap.sort((a, b) => b[2] - a[2])
//           let user_checker = [], index = 1;
//           while (msgCountMap.length > 0) user_checker.push(msgCountMap.splice(0, 25).map(u => u[0]))
//             for (var i = user_checker.length - 1; i >= 0; i--) {
//               if (!message.guild.members.cache.has(user_checker[i])) await client.db.delete(`${message.guild.id}.msg_count.${user_checker[i]}`); 
//             }
//       }

//       if (msgCountMap) {
//         msgCountMap.sort((a, b) => b[2] - a[2])
//         let userlist = [], index = 1;
//         while (msgCountMap.length > 0) userlist.push(msgCountMap.splice(0, 8).map(u => `${index++}# | ${message.guild.members.cache.get(u[0]).user.tag} | ${u[1].toLocaleString()}`))
//         return console.log("userlist", userlist);
//         const roles_bot_left = new DiscordUtils().button_id_generator(20);
//         const roles_bot_x = new DiscordUtils().button_id_generator(20);
//         const roles_bot_right = new DiscordUtils().button_id_generator(20);
//         const roles_bot_push = new DiscordUtils().button_id_generator(20);

//         const roles_bot_left_lock = new DiscordUtils().button_id_generator(20);
//         const roles_bot_x_lock = new DiscordUtils().button_id_generator(20);
//         const roles_bot_right_lock = new DiscordUtils().button_id_generator(20);

//         let buttons_unlock = new MessageActionRow().addComponents(
//         new MessageButton().setLabel("←").setCustomId(roles_bot_left).setStyle('PRIMARY'),
//         new MessageButton().setLabel("❌").setCustomId(roles_bot_x).setStyle('DANGER'),
//         new MessageButton().setLabel("→").setCustomId(roles_bot_right).setStyle('PRIMARY'),
//         new MessageButton().setLabel("📍").setCustomId(roles_bot_push).setStyle('SUCCESS'), );


//         let buttons_lock = new MessageActionRow().addComponents(
//         new MessageButton().setLabel("←").setCustomId(roles_bot_left_lock).setStyle('PRIMARY').setDisabled(true),
//         new MessageButton().setLabel("❌").setCustomId(roles_bot_x_lock).setStyle('DANGER').setDisabled(true),
//         new MessageButton().setLabel("→").setCustomId(roles_bot_right_lock).setStyle('PRIMARY').setDisabled(true),
//         new MessageButton().setLabel("📍").setCustomId(roles_bot_push).setStyle('SUCCESS').setDisabled(true), );

//         let embed = new MessageEmbed()
//         embed.setColor(client.colorDefault)
//         embed.setThumbnail(client.thumbnailGIF);
//         embed.setFooter({ text: `Pagina 1 de ${userlist.length}` });
//         embed.setDescription(`Aqui puedes ver una lista de los usuarios que tienen mas mensajes enviados (**__registrado por el bot__**).
// \`\`\`
// ${userlist[0].join('\n')}
// \`\`\``)
//         let msg = await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
//         if (userlist.length == 1) return;
//         await msg.edit({ embeds: [embed], components: [buttons_unlock] }).catch(err => {});
//         let pageindex = 0, filter = x => x.user.id == message.author.id;
//         let collector = await msg.channel.createMessageComponentCollector({
//           filter,
//           idle: 30000,
//           errors: ["idle"]
//         });

//         collector.on('collect', async (btn) => {
//           switch (btn.customId) {
//             case roles_bot_left:
//               pageindex = pageindex <= 0 ? (userlist.length - 1) : pageindex - 1
//               let embed_left = new MessageEmbed();
//               embed_left.setColor(client.colorDefault);
//               embed_left.setFooter({ text: `Pagina ${pageindex + 1} de ${userlist.length}` })
//               embed_left.setDescription(`Aqui puedes ver una lista de los usuarios que tienen mas mensajes enviados (**__registrado por el bot__**).
// \`\`\`
// ${userlist[pageindex].join('\n')}
// \`\`\``)
//               await msg.edit({ embeds: [embed_left], allowedMentions: { repliedUser: false }, components: [buttons_unlock] });
//               break;
//             case roles_bot_x:
//               collector.stop('x');
//               break;
//             case roles_bot_right:
//               pageindex = pageindex >= userlist.length - 1 ? 0 : pageindex + 1
//               let embed_right = new MessageEmbed();
//               embed_right.setColor(client.colorDefault);
//               embed_right.setFooter({ text: `Pagina ${pageindex + 1} de ${userlist.length}` })
//               embed_right.setDescription(`Aqui puedes ver una lista de los usuarios que tienen mas mensajes enviados (**__registrado por el bot__**).
// \`\`\`
// ${userlist[pageindex].join('\n')}
// \`\`\``)
//               await msg.edit({ embeds: [embed_right], allowedMentions: { repliedUser: false }, components: [buttons_unlock] });
//               break;
//             case roles_bot_push:
//               let push_embed = new MessageEmbed();
//               push_embed.setColor(client.colorDefault);
//               push_embed.setDescription(`${client.waiting} A que pagina te gustaria ir?
// \`\`\`
// ${userlist[pageindex].join('\n')}
// \`\`\``);
//               push_embed.setFooter({ text: `Pagina ${pageindex + 1} de ${userlist.length}` });
//               await msg.edit({ embeds: [push_embed], components: [buttons_lock] });
//               let msg_collector_filter = x => x.user.id == message.author.id;
//               let msg_collector = await msg.channel.createMessageCollector({
//                   msg_collector_filter,
//                   idle: 30000,
//                   errors: ["idle"]
//               });

//               await msg_collector.on("collect", async (lugar) => {
//                   if (isNaN(lugar.content)) {
//                       let e = new MessageEmbed()
//                       e.setColor(client.colorDefault);
//                       e.setDescription(`${client.waiting} Necesitas escribir **__solo__** números!
// \`\`\`
// ${userlist[pageindex].join('\n')}
// \`\`\``);
//                       e.setFooter({ text: `Pagina ${pageindex + 1} de ${userlist.length}`});
//                       message.channel.messages.fetch(lugar.id).then(async (msg) => {
//                           if (msg.deletable) msg.delete();
//                       });
//                       return msg.edit({ embeds: [e], components: [buttons_lock] });
//                   }
//                   if (lugar.content < 1) {
//                       let e = new MessageEmbed()
//                       e.setColor(client.colorDefault);
//                       e.setDescription(`${client.waiting} Debes poner un número mayor a **__1__**.
// \`\`\`
// ${userlist[pageindex].join('\n')}
// \`\`\``);
//                       e.setFooter({ text: `Pagina ${pageindex + 1} de ${userlist.length}`});
//                       message.channel.messages.fetch(lugar.id).then(async (msg) => {
//                           if (msg.deletable) msg.delete();
//                       });
//                       return msg.edit({ embeds: [e], components: [buttons_lock] });
//                   }
//                   if (lugar.content > results.length) {
//                       let e = new MessageEmbed()
//                       e.setColor(client.colorDefault);
//                       e.setDescription(`${client.waiting} La pagina **__${lugar.content}__** no existe.
// \`\`\`
// ${userlist[pageindex].join('\n')}
// \`\`\``);
//                       e.setFooter({ text: `Pagina ${pageindex + 1} de ${userlist.length}`});
//                       message.channel.messages.fetch(lugar.id).then(async (msg) => {
//                           if (msg.deletable) msg.delete();
//                       });
//                       return msg.edit({ embeds: [e], components: [buttons_lock] });
//                   }

//                   pageindex = lugar.content - 1
//                   let embed_done = new MessageEmbed()
//                   embed_done.setColor(client.colorDefault)
//                   embed_done.setDescription(`Aqui puedes ver una lista de los usuarios que tienen mas mensajes enviados (**__registrado por el bot__**).
// \`\`\`
// ${userlist[pageindex].join('\n')}
// \`\`\``);
//                   embed_done.setFooter({ text: `Pagina ${pageindex + 1} de ${userlist.length}`});
//                   await msg.edit({ embeds: [embed_done], components: [buttons_unlock] });
//                   message.channel.messages.fetch(lugar.id).then(async (msg) => {
//                       if (msg.deletable) msg.delete();
//                   });
//                   msg_collector.stop("x");
//               });
//               break;
//           }
//         });

//         collector.on('end', (_, reason) => {
//           let embed_ = new MessageEmbed()
//           embed_.setColor(client.colorDefault)
//           embed_.setThumbnail(client.thumbnailGIF);
//           embed_.setFooter({ text: `Pagina ${pageindex+1} de ${userlist.length}`})
//           embed_.setDescription(`Aqui puedes ver una lista de los usuarios que tienen mas mensajes enviados (**__registrado por el bot__**).
// \`\`\`
// ${userlist[pageindex].join('\n')}
// \`\`\``)
//           if (reason == 'x') return;
//             if (msg.deletable) msg.delete();
//             if (message.deletable) return message.delete();
//             return msg.edit({ embed: [embed_], components: [buttons_lock], });
//         });
//       };
//     }

    let user2 = message.guild.members.cache.get(args[0]) || message.mentions.members.first() || message.member;
    if (!user2 || !message.guild.members.cache.has(user2.id)) {
      let e = new MessageEmbed()
      e.setColor(client.colorDefault)
      e.setDescription(`${client.emojiError} Necesitas mencionar a un usuario para ver sus estadisticas.`);
      e.setFooter({ text: `Si deseas ver una lista de los usuarios que mas enviado mensajes escribe en el chat: ${prefix}messages-count list` });
      return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
    }

    let usuario = await client.db.get(`${message.guild.id}.msg_count.${user2.id}`);
    if (!usuario) {
      let f = new MessageEmbed()
      f.setColor(client.colorDefault).setDescription(`${client.emojiError} El usuario **__${user2.user.tag}__** no se encuentra en la base de datos.`)
      return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
    }

    let embed = new MessageEmbed();
    embed.setColor(client.colorDefault)
    embed.setDescription(`${client.emojiSuccess} El usuario **__${user2.user.tag}__** ha enviado **${usuario.toLocaleString()}** mensaje${usuario !== 1 ? 's' : ''}.`)
    embed.setFooter({ text: `Puedes mencionar a un usuario para ver cuantos mensajes ha enviado mientras el bot haya detectado el mensaje. | ${prefix}msg-count @user` });
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }
})