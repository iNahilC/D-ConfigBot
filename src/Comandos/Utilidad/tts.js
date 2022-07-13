const { Comando, MessageEmbed, MessageAttachment } = require("../../ConfigBot/index");
let { Convert } = require('../../utilidades/Convert.js')
let fs = require('fs').promises, tts = require('google-tts-api'), util = require('util'),
    download = util.promisify(require('download-file'))

module.exports = new Comando({
    nombre: "text-to-speech",
    alias: ["texttospeech", "tts", "t-t-s"],
    categoria: "Utilidad",
    descripcion: "Haga que el bot envie un audio mp3 con el texto que usted quiera.",
    ejemplo: "$tts [mensaje]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
        if (!message.guild.members.cache.get(client.user.id).permissions.has('ATTACH_FILES')) {
            let f = new MessageEmbed()
            f.setDescription(`${client.emojiError} Necesito el permiso **ATTACH_FILES** para ejecutar este comando.`)
            f.setColor(client.colorDefault)
            return message.reply({ embeds: [f], allowedMentions: { repliedUser: false } });
        }

        let awaiting = [];
        awaiting.push(message.author.id);
        let mensaje = args.join(' ')
        if (!mensaje) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} Necesitas escribir un mensaje **__no mayor a 200 caracteres__**.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }
        if (mensaje.length > 200) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} Necesitas escribir un mensaje **__no mayor a 200 caracteres__**.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } })
        }

        let options = { 
            directory: `./utilidades/tts`, 
            filename: `${message.author.id}.mp3`
        }
        function removeAwaiting(id) { awaiting = awaiting.filter(awaiter => awaiter != id); }
        let url = tts.getAudioUrl(mensaje, {
            lang: 'es-DO',
            slow: false,
            host: 'https://translate.google.com',
        });

        download(url, options).then(async () => {
            let attachment = new MessageAttachment(`${options.directory}/${options.filename}`, `d-configbot_tts.mp3`);
            let msg = await message.channel.send(`${client.waiting} **Cargando Archivo**...`)
            setTimeout(() => {
                msg.edit({ content:`${client.emojiSuccess} **D-ConfigBot [\`Text To Speech\`]**\n`, files: [attachment] });
            }, 1000)
        }).then(msg => { removeAwaiting(`${message.author.id}`); }).catch(err => { removeAwaiting(message.author.id); });
    }
});