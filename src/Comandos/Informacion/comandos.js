const { Comando, MessageEmbed, DiscordUtils, MessageActionRow, MessageSelectMenu } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "comandos",
    alias: ["commands", "cmd", "cmds"],
    categoria: "Información",
    descripcion: "Mira la lista de comandos que hay disponible D-ConfigBot!",
    ejemplo: "$comandos",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }

        let mantenimientos = client.comandos.filter(cmd => cmd.disponible == false);
        let administrador = client.comandos.filter(cmd => cmd.categoria == 'Administrador');
        let moderador = client.comandos.filter(cmd => cmd.categoria == 'Moderador');
        let guardia = client.comandos.filter(cmd => cmd.categoria == 'Guardia');
        let informacion = client.comandos.filter(cmd => cmd.categoria == 'Información');
        let entretenimiento = client.comandos.filter(cmd => cmd.categoria == 'Entretenimiento');
        let imagenes = client.comandos.filter(cmd => cmd.categoria == 'Imagenes');
        let utilidad = client.comandos.filter(cmd => cmd.categoria == 'Utilidad');

        let total = administrador.size + moderador.size + guardia.size + utilidad.size + imagenes.size + entretenimiento.size + informacion.size

        if (!await client.db.has(`${message.guild.id}.custom_cmds`)) await client.db.set(`${message.guild.id}.custom_cmds`, new Array())
        let custom_commands_array = await client.db.get(`${message.guild.id}.custom_cmds`);

        if (!await client.db.has(`${message.guild.id}.msg_filter`)) await client.db.set(`${message.guild.id}.msg_filter`, new Array());
        if (!await client.db.has(`${message.guild.id}.toggle_snipe`)) await client.db.set(`${message.guild.id}.toggle_snipe`, "on");

        let cmd_embed = new MessageEmbed();
        cmd_embed.setColor(client.colorDefault);
        cmd_embed.setDescription(`
\`\`\`md
* Recuerda que puedes establecer los permisos de los usuarios con el comando
> ${prefix}setpermissions [@usuario]

* Los usuarios que contengan permiso de administrador en alguno de su roles
> Tendran permisos de administrador por defecto en el bot.

* D-ConfigBot cuenta con un total ${total} comandos y 8 categorias.
> Administrator | Moderador | Guardia
> Utilidad | Entretenimiento | Información
> Comandos personalizados en el servidor | Comandos en Mantenimiento.
\`\`\``);
        cmd_embed.setImage(client.comandosGIF);
        cmd_embed.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando]` })
        message.reply({ embeds: [cmd_embed], allowedMentions: { repliedUser: false } }).then(async (msg) => {
            const menu_id = new DiscordUtils().button_id_generator(20);
            let custom_commands_text = "";
            if (custom_commands_array.length == 0) custom_commands_text = `No hay comandos personalizados en este servidor!`;
            if (custom_commands_array.length > 0) custom_commands_text = `Actualmente hay ${custom_commands_array.length} comandos personalizados en este servidor!`;

            const menu = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                .setCustomId("help_menu").setMaxValues(1).setMinValues(1)
                .setPlaceholder(`Selecciona una categoria para ver los comandos que contienen!`)
                .addOptions([{
                    label: "Pagina principal",
                    description: "Volver a la pagina principal.",
                    value: "main_id",
                    emoji: "🏠",
                }, {
                    label: "Administrador",
                    description: `Actualmente hay ${administrador.size} comandos para administradores!`,
                    value: "admin_id",
                    emoji: "🛡️",
                }, {
                    label: "Moderador",
                    description: `Actualmente hay ${moderador.size} comandos para moderadores!`,
                    value: "mod_id",
                    emoji: "⚔️",
                }, {
                    label: "Guardia",
                    description: `Actualmente hay ${guardia.size} comandos para guardias/ayudantes!`,
                    value: "guard_id",
                    emoji: "💂",
                }, {
                    label: "Entretenimiento",
                    description: `Actualmente hay ${entretenimiento.size} comandos para el Entretenimiento!`,
                    value: "entretenimiento_id",
                    emoji: "🕹️",
                }, {
                    // }, {
                    //     label: "Imagenes",
                    //     description: `Actualmente hay ${imagenes.size} comandos en imagenes!`,
                    //     value: "imagenes_id",
                    //     emoji: "🖼️",
                    // }, {
                    label: "Información",
                    description: `Actualmente hay ${informacion.size} comandos en Información!`,
                    value: "informacion_id",
                    emoji: "ℹ️",
                }, {
                    label: "Utilidad",
                    description: `Actualmente hay ${utilidad.size} comandos de utilidad!`,
                    value: "utilidad_id",
                    emoji: "🔎",
                }, {
                    label: "Comandos personalizados",
                    description: custom_commands_text,
                    value: "customs_id",
                    emoji: "🛃",
                }, {
                    label: "Comandos en mantenimiento",
                    description: `Actualmente hay ${mantenimientos.size} comandos en mantenimiento!`,
                    value: "mantenimiento_id",
                    emoji: "🔧",
                }, ]), );

            await msg.edit({ embeds: [cmd_embed], components: [menu] });
            client.on("interactionCreate", async (interaction) => {
                if (!interaction.isSelectMenu()) return;
                if (interaction.customId !== "help_menu") return;
                if (interaction.user.id !== message.author.id) return;
                if (interaction.values[0] == "admin_id") {
                    let admin_embed = new MessageEmbed();
                    admin_embed.setColor("#2F3136");
                    admin_embed.setDescription(`
\`\`\`
${administrador.map(c => `${c.nombre}`).join(', ')}
\`\`\``)
                    admin_embed.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando] | Esta categoria cuanta con ${administrador.size} comandos.` })
                    admin_embed.setImage(client.adminsGIF);
                    msg.edit({ embeds: [admin_embed], components: [menu] });
                } else if (interaction.values[0] === "main_id") {
                    msg.edit({ embeds: [cmd_embed], components: [menu] });
                } else if (interaction.values[0] === "mod_id") {
                    let mod_embed = new MessageEmbed();
                    mod_embed.setColor("#2F3136");
                    mod_embed.setDescription(`
\`\`\`
${moderador.map(c => `${c.nombre}`).join(', ')}
\`\`\``)
                    mod_embed.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando] | Esta categoria cuanta con ${moderador.size} comandos.` })
                    mod_embed.setImage(client.modsGIF);
                    msg.edit({ embeds: [mod_embed], components: [menu] });
                } else if (interaction.values[0] === "guard_id") {
                    let guard_embed = new MessageEmbed();
                    guard_embed.setColor("#2F3136");
                    guard_embed.setDescription(`
\`\`\`
${guardia.map(c => `${c.nombre}`).join(', ')}
\`\`\``)
                    guard_embed.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando] | Esta categoria cuanta con ${guardia.size} comandos.` })
                    guard_embed.setImage(client.guardsGIF);
                    msg.edit({ embeds: [guard_embed], components: [menu] });
                } else if (interaction.values[0] === "imagenes_id") {
                    let imagen_user = new MessageEmbed();
                    imagen_user.setColor("#2F3136");
                    imagen_user.setDescription(`
\`\`\`md
${imagenes.map(c => `${c.nombre}`).join(', ')}
\`\`\``)
                    imagen_user.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando] | Esta categoria cuenta con ${imagenes.size} comandos.` });
                    imagen_user.setImage(client.imagenGIF);
                    msg.edit({ embeds: [imagen_user], components: [menu] })
                } else if (interaction.values[0] === "entretenimiento_id") {
                    let entretenimiento_user = new MessageEmbed();
                    entretenimiento_user.setColor("#2F3136");
                    entretenimiento_user.setDescription(`
\`\`\`md
${entretenimiento.map(c => `${c.nombre}`).join(', ')}
\`\`\``)
                    entretenimiento_user.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando] | Esta categoria cuenta con ${entretenimiento.size} comandos.` });
                    entretenimiento_user.setImage(client.entretenimientoGIF);
                    msg.edit({ embeds: [entretenimiento_user], components: [menu] })
                } else if (interaction.values[0] == "informacion_id") {
                    let informacion_embed = new MessageEmbed();
                    informacion_embed.setColor("#2F3136");
                    informacion_embed.setDescription(`
\`\`\`md
${informacion.map(c => `${c.nombre}`).join(', ')}
\`\`\``)
                    informacion_embed.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando] | Esta categoria cuenta con ${informacion.size} comandos.` });
                    informacion_embed.setImage(client.informacionGIF);
                    msg.edit({ embeds: [informacion_embed], components: [menu] })

                } else if (interaction.values[0] === "utilidad_id") {
                    let users_embed = new MessageEmbed();
                    users_embed.setColor("#2F3136");
                    users_embed.setDescription(`
\`\`\`
${utilidad.map(c => `${c.nombre}`).join(', ')}
\`\`\``)
                    users_embed.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando] | Esta categoria cuanta con ${utilidad.size} comandos.` })
                    users_embed.setImage(client.utilidadGIF);
                    msg.edit({ embeds: [users_embed], components: [menu] })
                } else if (interaction.values[0] === "mantenimiento_id") {
                    let mantenimiento_embed = new MessageEmbed();
                    mantenimiento_embed.setColor("#2F3136");
                    mantenimiento_embed.setDescription(`
\`\`\`
${mantenimientos.map(c => `${c.nombre}`).join(', ')}
\`\`\``)
                    mantenimiento_embed.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando] | Esta categoria cuanta con ${mantenimientos.size} comandos.` })
                    mantenimiento_embed.setImage(client.mantenimientosGIF);
                    msg.edit({ embeds: [mantenimiento_embed], components: [menu] });
                } else if (interaction.values[0] === "customs_id") {
                    let customs_embeds = new MessageEmbed();
                    customs_embeds.setColor("#2F3136");
                    if (custom_commands_array.length === 0) {
                        customs_embeds.setImage(client.personalizadosGIF)
                        customs_embeds.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando] | Esta servidor cuanta con ${custom_commands_array.length} comandos personalizados.` })
                        customs_embeds.setDescription(`
\`\`\`
* No hay comandos personalizados en el servidor
\`\`\``)
                        msg.edit({ embeds: [customs_embeds], components: [menu] });
                    }

                    let custom_cmds = await client.db.get(`${message.guild.id}.custom_cmds`)
                    let custom_cmds_map = custom_cmds.map((id, key) => [key, id])
                    if (custom_cmds_map) {
                        let cmdslist = [],
                            index = 1;
                        while (custom_cmds_map.length > 0) cmdslist.push(custom_cmds_map.splice(0, 100).map(u => `${u[1].nombre_cmd}`))
                        customs_embeds.setDescription(`
\`\`\`
${cmdslist[0].join(', ')}
\`\`\``)
                        customs_embeds.setFooter({ text: `Para obtener informacion detallada de un comando escribe ${prefix}help [comando] | Esta categoria cuanta con ${custom_commands_array.length} comandos.` })
                        customs_embeds.setImage(client.personalizadosGIF);
                        msg.edit({ embeds: [customs_embeds], components: [menu] });
                    }
                }
            });
        });
    }
});