const { Evento, MessageEmbed, Collection } = require("../../ConfigBot/index"),
      { Console } = require("../../ConfigBot/utilidades/ClientConsole"),
      { QuickDB } = require("quick.db");

module.exports = new Evento({
  nombre: "ready",
  ejecutar: async (client) => {
    Console(["verde", "blanco"], "<0>[BOT]<1> Listo.")
    client.db = new QuickDB();
    let administrador = client.comandos.filter(cmd => cmd.categoria == 'Administrador');
    let moderador = client.comandos.filter(cmd => cmd.categoria == 'Moderador');
    let guardia = client.comandos.filter(cmd => cmd.categoria == 'Guardia');
    let informacion = client.comandos.filter(cmd => cmd.categoria == 'Información');
    let entretenimiento = client.comandos.filter(cmd => cmd.categoria == 'Entretenimiento');
    let imagenes = client.comandos.filter(cmd => cmd.categoria == 'Imagenes');
    let utilidad = client.comandos.filter(cmd => cmd.categoria == 'Utilidad');
    let total = administrador.size + moderador.size + guardia.size + utilidad.size + imagenes.size + entretenimiento.size + informacion.size
    let array = [
        `${client.users.cache.size.toLocaleString()} Usuarios en ${client.guilds.cache.size.toLocaleString()} servidores | c!commands`,
        `D-ConfigBot | ${total} Comandos disponibles`,
        'D-ConfigBot | Open Beta',
        'D-ConfigBot | c!invite',
        'D-ConfigBot | v0.1.4',
        `D-ConfigBot | Multiples sistemas disponibles`
    ];

    setInterval(function() {
      client.user.setPresence({
        activities: [{
          name: array[Math.floor(Math.random() * array.length)],
          type: "WATCHING"
        }],
        status: "online"
      });
    }, 20000);

    client.colorDefault = "#2F3136"
    client.servidor_oficial = "719351217616322602";
    client.servidor_test = "656754930652151808";
    client.comandosGIF = "https://media.discordapp.net/attachments/694731014110445568/879267024411459584/MOSHED-2021-8-23-3-30-52.gif?width=512&height=128";
    client.adminsGIF = "https://media.discordapp.net/attachments/694731014110445568/879258681684930580/MOSHED-2021-8-23-2-59-21.gif?width=512&height=128";
    client.modsGIF = "https://media.discordapp.net/attachments/694731014110445568/879260619784724490/MOSHED-2021-8-23-3-7-7.gif?width=512&height=128";
    client.guardsGIF = "https://media.discordapp.net/attachments/694731014110445568/879267024008781844/MOSHED-2021-8-23-3-32-34.gif?width=512&height=128";
    client.usuariosGIF = "https://cdn.discordapp.com/attachments/694731014110445568/879273315838095420/MOSHED-2021-8-23-3-57-43.gif";
    client.mantenimientosGIF = "https://cdn.discordapp.com/attachments/694731014110445568/879273316156850186/MOSHED-2021-8-23-3-55-42.gif";
    client.personalizadosGIF = "https://cdn.discordapp.com/attachments/694731014110445568/879493497026117692/MOSHED-2021-8-23-18-32-2.gif";
    client.imagenGIF = "https://media.discordapp.net/attachments/694731014110445568/916803440443793438/MOSHED-2021-12-4-17-23-43.gif?width=480&height=120";
    client.informacionGIF = "https://media.discordapp.net/attachments/694731014110445568/916803439785283594/MOSHED-2021-12-4-17-26-17.gif?width=480&height=120";
    client.entretenimientoGIF = "https://media.discordapp.net/attachments/694731014110445568/916803505744932874/MOSHED-2021-12-4-17-29-16.gif?width=480&height=120";
    client.utilidadGIF = "https://media.discordapp.net/attachments/694731014110445568/916848799585022002/MOSHED-2021-12-4-20-28-30.gif?width=480&height=120";
    client.thumbnailGIF = "https://cdn.discordapp.com/attachments/694731014110445568/879263038119747635/MOSHED-2021-8-23-3-16-57.gif";


    client.invitacion = "https://discord.com/api/oauth2/authorize?client_id=656966356037533713&permissions=1642824465911&redirect_uri=https%3A%2F%2Fdiscord.gg%2FNJjVbSK&scope=bot";
    client.missing_admin_permission = "Necesitas tener permisos de **Administrador** en el el bot o en tus roles.";
    client.missing_mod_permission = "Necesitas tener permisos de **Moderador**.";
    client.missing_guard_permission = "Necesitas tener permisos de **Guardia**.";    
    client.missing_logs_channel = "Necesitas activar el sistema de **__logs__** antes de utilizar este comando.";
    client.ownerId = "656738884712923166";
    client.hex = "#B9BBBE";

    client.emojiErrorId = "760122074743570433";
    client.emojiSuccessId = "753779965933387888";
    client.emojiBotId = "760122067978420234";
    client.emojiOFFId = "760120229380096021";
    client.emojiError = "<a:731642369396441100:760122074743570433>";
    client.emojiSuccess = "<a:checkgif:753779965933387888>";
    client.emojiBot = "<:741688366663336067:760122067978420234>";
    client.emojiOFF = "<:off:760120229380096021>";
    client.emojiON = "<:on:760120229568970762>";
    client.waiting = "<a:waiting_emb:760122075771174943>";
    client.warning = "<:warning_emoji:934739379757400136>";
    client.warningId = "934739379757400136";
    client.arrow_left = "<:arrow_left:935043629779652648>";
    client.arrow_left_id = "935043629779652648";
    client.arrow_right = "<:arrow_right:935043630014545961>";
    client.arrow_right_id = "935043630014545961";
    client.cancel_emote = "<:cancel_emoji:935043630039724113>";
    client.cancel_emote_id = "935043630039724113";
    client.search_emote = "<:search_emoji:934731150797180948>"
    client.search_emote_id = "934731150797180948";
    
  }
});