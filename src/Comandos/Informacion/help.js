const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index"), similar = require('string-similarity');

module.exports = new Comando({
    nombre: "help",
    alias: ["ayuda", "h"],
    categoria: "Información",
    descripcion: "Este comando te muestra una información destallada de algún comando.",
    ejemplo: "$help [comando]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }
        if (!args[0]) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription('Necesitas escribir el **__nombre/alias__** de un comando, para ver la **__lista__** de comandos escribe `' + prefix + 'comandos`')
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        let comando = client.obtener_comando(args[0].toLowerCase());
        if (!comando) {
            let cmds_similares = [];
            client.comandos.map((x) => {
                cmds_similares.push(x.nombre);
            });
            const matches = similar.findBestMatch(args[0], cmds_similares);
            cmds_similares = [];
            matches.ratings.map((rating) => { rating.rating > 0.4 ? cmds_similares.push(rating.target) : false; });

            let cmd_not_found = "",
                index = 1;
            if (cmds_similares.length == 0) {
                cmd_not_found = "El comando que intentas buscar **__no existe__**, Revisa que estas ingresando bien el nombre o el alias."
            } else if (cmds_similares.length > 0) {
                cmd_not_found = `El comando que intentas buscar **__no existe__**, Comandos similares con tu búsqueda:\n\`\`\`${cmds_similares.map(x => `${index++}# | ${prefix}${x}`).join("\n")}\`\`\``
            }
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(cmd_not_found)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        if (comando.hasOwnProperty("onlyOwner") && comando.onlyOwner === true) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`El comando que intentas buscar __no existe__, Revisa que estas ingresando bien el nombre o el alias.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        let nombre = comando.nombre;
        let alias = comando.alias && comando.alias.length > 0 ? comando.alias.join(", ") : "No Tiene Alias";
        let descripcion = comando.descripcion;
        let permisos = comando.categoria;
        let ejemplo = comando.ejemplo.replace("$", prefix);
        let mantenimiento;
        if (!comando.hasOwnProperty("disponible")) { mantenimiento = "No";
        } else if (comando.hasOwnProperty("disponible") && comando.disponible === false) { mantenimiento = "Si"; }
        return message.reply({ content: `
\`\`\`md
# Información del comando ${nombre}

* Nombre
> ${nombre}

* Alias
> ${alias}

* Nivel de permisos
> ${permisos}

* Mantenimiento?
> ${mantenimiento}

* Ejemplo
> ${ejemplo}

* Descripción
> ${descripcion}
\`\`\``, allowedMentions: { repliedUser: false } });
    }
})