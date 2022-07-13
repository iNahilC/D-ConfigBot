const { Comando, MessageEmbed } = require("../../ConfigBot/index"), request = require("request"), API_KEY = "a3108ad17c2d4668922531e54e7581e8";

module.exports = new Comando({
    nombre: "geoip",
    alias: ["geo-ip", "gip", "iplocate", "ip-locate"],
    categoria: "Información",
    descripcion: "Este comando te permite ver la información especifica de una IP",
    ejemplo: "$geoip 179.53.53.58",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!"; }
        let u_permisos = await client.db.get(`${message.guild.id}.permisos.${message.author.id}`);
        let txt = args.join(" ");
        if (!txt) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Necesitas escribir una **__ip valida__** para ver su información. Ejemplo: **${prefix}geoip 179.53.53.58**`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        request("https://vpnapi.io/api/" + args[0] + "?key=" + API_KEY + "", function(err, resp, body) {
            if (err) {
                let e = new MessageEmbed();
                e.setColor("RED");
                e.setDescription('Se ha producido un error interno, inténtalo de nuevo e contacta con mi desarrollador.')
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } }).then(() => {
                    client.channels.cache.get("719362703516368959").send(`
New error generated

User: ${message.author.tag} [ID: ${message.author.id}]
Server: ${message.guild.name} [ID: ${message.guild.id}]
Command: geoip
Error: ${err}
Line: 72`);
                });
            }

            body = JSON.parse(body);
            if (body.error) {
                let e = new MessageEmbed();
                e.setColor("RED");
                e.setDescription('Se ha producido un error interno, inténtalo de nuevo e contacta con mi desarrollador.')
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } }).then(() => {
                    client.channels.cache.get("719362703516368959").send(`
New error generated

User: ${message.author.tag} [ID: ${message.author.id}]
Server: ${message.guild.name} [ID: ${message.guild.id}]
Command: geoip
Error: ${err}
Line: 90`);
                });
            }

            if (body.message) {
                let invalid_ip = new MessageEmbed();
                invalid_ip.setColor("#b50018");
                invalid_ip.setDescription(`${client.emojiError} La IP que has ingresado es __invalida__.`);
                return message.reply({ embeds: [invalid_ip], allowedMentions: { repliedUser: false } });
            } else {
                let e = new MessageEmbed()
                e.setColor(client.colorDefault);
                e.setDescription(`${client.emojiSuccess} información de la IP **${txt}**.
\`\`\`md
* Ciudad
> ${body.location.city}

* Región
> ${body.location.region}

* País
> ${body.location.country} | ${body.location.country_code}

* Continente
> ${body.location.continent}

* Zona Horaria
> ${body.location.time_zone}

* Proovedor
> ${body.network.autonomous_system_organization}
\`\`\``)
                return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
            }
        });
    }
});