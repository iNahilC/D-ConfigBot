const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow, MessageSelectMenu } = require("../../ConfigBot/index");

module.exports = new Comando({
  nombre: "avatar",
  alias: ["foto", "av"],
  categoria: "Utilidad",
  descripcion: "Este comando te permite ver la foto de perfil de un usuario.",
  ejemplo: "$avatar [@user | userID | username | nickname]",
  ejecutar: async (client, message, args) => {
    let prefix;
    if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }    
    let usuario = message.guild.members.cache.get(args[0]) || message.mentions.members.first() || message.member;
    let contenedor = message.guild.members.cache.filter(m => m.user.username.toLowerCase().includes(args.join(" ").toLowerCase()) || m.displayName.toLowerCase().includes(args.join(" ").toLowerCase()));
  
    let mapeo = contenedor.map(u => u);
    if(mapeo.length >= 1) {
      if(mapeo.length === message.guild.members.cache.size) {
        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setImage(message.author.displayAvatarURL({ dynamic: true, size: 4096 }));
        e.setFooter({ text: `Tu Avatar`, iconURL: message.author.displayAvatarURL() });
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
      }

      if(mapeo.length === 1) {
        let obtener = message.guild.members.cache.get(mapeo[0].user.id);
        let usuario_nombre = ``;
        if (message.author.id == obtener.id) {
          usuario_nombre = `Tu Avatar`; } else {
          usuario_nombre = `Avatar de ${obtener.user.tag}`;
        }

        let e = new MessageEmbed();
        e.setColor(client.colorDefault);
        e.setImage(obtener.user.displayAvatarURL({ dynamic: true, size: 4096 }));
        e.setFooter({ text: `${usuario_nombre}`, iconURL: obtener.user.displayAvatarURL() });
        return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
      }

      let embed_ = new MessageEmbed();
          embed_.setColor(client.colorDefault);
          embed_.setDescription(`Se encontraron **__${mapeo.length}__** usuarios con tu búsqueda, selecciona a unos de ellos!`);
          embed_.setFooter({ text: "Recuerda que solo se mostrará un máximo de 25 opciones!" });
          message.reply({ embeds: [embed_], allowedMentions: { repliedUser: false } }).then(async (msg) => {
          let custom_avatar_menu_id = new DiscordUtils().button_id_generator(20);
          let menu_name_display = new MessageSelectMenu()
          menu_name_display.setCustomId(custom_avatar_menu_id)
          menu_name_display.setMaxValues(1)
          menu_name_display.setMinValues(1)
          menu_name_display.setPlaceholder(`Selecciona un usuario de esta lista para ver su avatar!`)
          mapeo.slice(-25).forEach(async (m) => {
            menu_name_display.addOptions([{
                label: m.displayName,
                description: m.user.tag,
                value: m.id
              }, ])
            });

          let menu = new MessageActionRow().addComponents(menu_name_display, );
          msg.edit({ embeds: [embed_], components: [menu], allowedMentions: { repliedUser: false } });

          client.on('interactionCreate', async (interaction) => {
            if (!interaction.isSelectMenu() || 
              interaction.customId !== custom_avatar_menu_id ||
              interaction.user.id !== message.author.id) return;
            for (var i = 0; i < mapeo.length; i++)  {
              try {
                if(interaction.values[0] === mapeo[i].id) {
                  let obtener = message.guild.members.cache.get(mapeo[i].id);
                  let usuario_nombre = ``;
                  if (message.author.id === obtener.id) { 
                    usuario_nombre = `Tu Avatar`; } else { 
                    usuario_nombre = `Avatar de ${obtener.user.tag}`; }
                  let e4 = new MessageEmbed();
                  e4.setColor(client.colorDefault);
                  e4.setImage(obtener.user.displayAvatarURL({ dynamic: true, size: 4096 }));
                  e4.setFooter({ text: `${usuario_nombre}`, iconURL: obtener.user.displayAvatarURL() });
                  await msg.edit({ embeds: [e4], components: [], allowedMentions: { repliedUser: false } });
                }
              } catch(err) {}
            }
          });
      });
      return;
    }
    let usuario_nombre = ``;
    if (message.author.id === usuario.id) {
      usuario_nombre = `Tu Avatar`; } else {
      usuario_nombre = `Avatar de ${usuario.user.tag}`;
    }
    let e = new MessageEmbed();
    e.setColor(client.colorDefault);
    e.setImage(usuario.user.displayAvatarURL({ dynamic: true, size: 4096 }));
    e.setFooter({ text: `${usuario_nombre}`, iconURL: usuario.user.displayAvatarURL() });
    return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
  }
});