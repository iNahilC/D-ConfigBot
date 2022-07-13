const { Comando, MessageEmbed } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "muterole",
    alias: ["mute-role"],
    descripcion: "Define cual rol será agregado a los usuarios muteados.",
    categoria: "Moderador",
    ejemplo: "$muterole [@rol]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
        
        let logs = await client.db.get(`${message.guild.id}.logs_channel`);
        let lchannel = message.guild.channels.cache.get(logs);
        if (!lchannel) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
            await client.db.delete(`${message.guild.id}.logs_channel`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!message.guild.member(client.user).permissions.has("MANAGE_ROLES")) {
            let f = new MessageEmbed()
            f.setDescription(`${client.emojiError} Necesito el permiso **MANAGE_ROLES** en este servidor para completar el uso de este comando.`);
            f.setColor(client.colorDefault)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        }

        if (!args[0]) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar **__el rol que quieres agregar para mutear__**.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let obtener_rol = message.mentions.roles.first() || message.guild.roles.cache.find(x => x.name.toLowerCase() === args.slice(0).join(' ').toLowerCase()) || message.guild.roles.cache.get(args[0]);
        if (!obtener_rol) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar __el rol que quieres agregar para mutear__.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (!message.guild.roles.cache.has(obtener_rol.id)) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas mencionar __el rol que quieres agregar para mutear__.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        if (obtener_rol.id == message.guild.id) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} No se puede agregar ni remover el rol <@&${message.guild.id}>`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let clientRolePossition = message.guild.members.cache.get(client.user.id).roles.highest.position;
        let obtener_rol_possition = obtener_rol.position;
        let authorRolePossition = message.member.roles.highest.position;

        if (authorRolePossition.position <= obtener_rol_possition) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} El sistema fue cancelado, La posición del rol ${obtener_rol} es mayor o igual a la posición de rol mas alta que tienes. (${authorRolePossition}).`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        } else if (clientRolePossition <= obtener_rol_possition) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} El rol ${obtener_rol} no se puede agregar a la base de datos ya que el rol tiene una posición mayor o igual a la de mi rol, Lo que significa que no puedo agregar ese rol a los usuarios.`);
            e.setFooter('Puedes bajarle la posición del rol o intentar con algún otro rol.');
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        } else if (!obtener_rol.editable) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} El rol ${obtener_rol} no se puede agregar a la base de datos ya que no puedo editar/agregar ese rol a los usuarios.`);
            e.setFooter('Puedes bajarle la posición del rol o intentar con algún otro rol.');
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let obtener_db_rol = await client.db.get(`${message.guild.id}.mute_rol.role`);
        if (obtener_db_rol == obtener_rol.id) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} El rol ${obtener_rol} ya está establecido como rol para mutear personas.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        message.guild.channels.cache.forEach(async (channel) => {
            await channel.permissionOverwrites.edit(obtener_rol, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
                CREATE_INSTANT_INVITE: false,
                ATTACH_FILES: false
            });
        });
        let embed = new MessageEmbed();
        embed.setColor(client.colorDefault);
        embed.setDescription(`${client.emojiSuccess} El rol ${obtener_rol} será utilizado para el comando **${prefix}mute y ${prefix}tempmute**.`);
        await client.db.get(`${message.guild.id}.mute_rol.role`, obtener_rol.id);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
});