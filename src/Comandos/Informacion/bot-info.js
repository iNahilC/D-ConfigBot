const { Comando, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index"),
        os = require('os'), cpuStat = require("cpu-stat"), moment = require("moment");

module.exports = new Comando({
    nombre: "bot-info",
    alias: ["botinfo", "bi"],
    categoria: "Información",
    descripcion: "Mire una informacion detallada del bot.",
    ejemplo: "$bot-info",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) {  prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
        cpuStat.usagePercent(function(err, percent, seconds) {
            if (err) { return console.log(err); }
            const maxMemory = os.totalmem();
            function getMemoryUsage() {
                const free = os.freemem();
                return {
                    max: memory(maxMemory),
                    free: memory(free),
                    used: memory(maxMemory - free),
                    usedByProcess: memory(process.memoryUsage().rss)
                }
            }

            function memory(bytes = 0) {
                const gigaBytes = bytes / 1024 ** 3;

                if (gigaBytes > 1) {
                    return `${gigaBytes.toFixed(1)} GB`;
                }

                const megaBytes = bytes / 1024 ** 2;
                if (megaBytes < 10) return `${megaBytes.toFixed(2)} MB`;
                if (megaBytes < 100) return `${megaBytes.toFixed(1)} MB`;
                return `${Math.floor(megaBytes)} MB`;
            }

            let memoria = getMemoryUsage();

            function T_convertor(ms) {
                let años = Math.floor((ms) / (1000 * 60 * 60 * 24 * 365));
                let meses = Math.floor(((ms) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
                let dias = Math.floor(((ms) % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
                let horas = Math.floor(((ms) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutos = Math.floor(((ms) % (1000 * 60 * 60)) / (1000 * 60));
                let segundos = Math.floor(((ms) % (1000 * 60)) / 1000);


                let final = ""
                if (años > 0) final += años > 1 ? `${años} años, ` : `${años} año, `
                if (meses > 0) final += meses > 1 ? `${meses} meses, ` : `${meses} mes, `
                if (dias > 0) final += dias > 1 ? `${dias} dias, ` : `${dias} dia, `
                if (horas > 0) final += horas > 1 ? `${horas} horas, ` : `${horas} hora, `
                if (minutos > 0) final += minutos > 1 ? `${minutos} minutos y ` : `${minutos} minuto y `
                if (segundos > 0) final += segundos > 1 ? `${segundos} segundos.` : `${segundos} segundo.`
                return final
            }

            let mantenimientos = client.comandos.filter(cmd => cmd.disponible == false);
            let administrador = client.comandos.filter(cmd => cmd.categoria == 'Administrador');
            let moderador = client.comandos.filter(cmd => cmd.categoria == 'Moderador');
            let guardia = client.comandos.filter(cmd => cmd.categoria == 'Guardia');
            let informacion = client.comandos.filter(cmd => cmd.categoria == 'Información');
            let entretenimiento = client.comandos.filter(cmd => cmd.categoria == 'Entretenimiento');
            let imagenes = client.comandos.filter(cmd => cmd.categoria == 'Imagenes');
            let utilidad = client.comandos.filter(cmd => cmd.categoria == 'Utilidad');

            let command_count = administrador.size + moderador.size + guardia.size + utilidad.size + informacion.size + imagenes.size + utilidad.size; 
            let creador = client.users.cache.get(client.ownerId);
            let button_url = new MessageActionRow().addComponents( 
                new MessageButton().setStyle('LINK').setURL(client.invitacion).setLabel(`Invita a ${client.user.username} a un servidor donde administres!`), );
            return message.reply({ content:`
\`\`\`md
# D-ConfigBot [Bot Info]

* Creador
> ${creador.tag}

* Tiempo Activo
> ${new DiscordUtils().parse_tiempo(client.uptime, "{{tiempo}}")}

* Ping
> ${client.ws.ping}ms

* Prefix en este servidor
> ${prefix}

* Versión
> 1.0.4-beta

* Servidores
> ${client.guilds.cache.size.toLocaleString()}

* Usuarios
> ${client.users.cache.size.toLocaleString()}

* Comandos
> ${command_count}

* Servidor de soporte
> https://discord.gg/NJjVbSK

* Creacion del bot
> ${moment(client.user.createdAt).format("DD/MM/YYYY")} [${T_convertor(Math.floor(Date.now()) - client.user.createdTimestamp)}]

* RAM
> ${memoria.used}/${memoria.max}

* Sistema Operativo
> ${os.platform().replace("linux", "Linux").replace("win32", "Windows 11 x64")}

* CPU
> ${percent.toFixed(2)}%
\`\`\``, allowedMentions: { repliedUser: false }, components: [button_url] })
        });
    }
});