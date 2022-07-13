const { Comando, MessageEmbed } = require("../../ConfigBot/index"), 
        search = require('youtube-search'),
          opts = { maxResults: 15, type: "video", videoSyndicated: true, key: 'AIzaSyAY7LRfXRAvM0EzjVKfoevjEuWya-ulqF0' };

module.exports = new Comando({
nombre: "youtube-search",
alias: ["ytsearch", "yt-search", "yt", "youtubesearch", "youtube"],
categoria: "Utilidad",
descripcion: "Este comando te permite buscar vídeos de youtube mediante el bot. el bot te mandara el link del vídeo con mas reproducciones o views en youtube.",
ejemplo: "$yt [search]",
ejecutar: async (client, message, args) => {
let prefix;
if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!"; }
let userChecker = await client.db.get(`${message.guild.id}.cmd_on`);
if (args[0] == "yt_unstuck") {
  if (userChecker.includes(message.author.id)) {
    await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id);
    return message.reply({ content:`${client.emojiSuccess} Fuiste correctamente **removido** de la lista de espera.`, allowedMentions: { repliedUser: false } });
  } else if (!userChecker.includes(message.author.id)) return message.reply({ content: `${client.emojiError} Aún no estás en la lista de espera.`, allowedMentions: { repliedUser: false } });
} 

let buscar = args.join(" ");
if (!buscar) {
  let e = new MessageEmbed()
  e.setColor(client.colorDefault).setDescription(`${client.emojiError} Necesitas escribir **__lo que quieres buscar en youtube__**.`)
  return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
}

if (userChecker.includes(message.author.id)) {
  let e = new MessageEmbed()
  e.setColor(client.colorDefault)
  e.setDescription('Ya ejecutaste este comando por favor elije un número `1-15`!');
  e.setFooter({ text: `Si crees que es un error escribe en el chat: ${prefix}youtube-search yt_unstuck` });
  return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } }).then((msg) => setTimeout(() => msg.delete(), 2000));
} else await client.db.push(`${message.guild.id}.cmd_on`, message.author.id)

await search(buscar, opts, async function(err, results) {
    if (err) return console.log(err);
    var list = ""
    var playle = []
    var link = [], channel_title = [], video_description = [], video_thumbnail = [], video_image = []
    var mini = []
    var T = []
    let r, text = "";
    results.length > 15 ? r = 15 : r = results.length
    for (let i = 0; i < r; i++) {
      text += `\`${i + 1}#\` \`|\` **${results[i].channelTitle}** \`|\` **${results[i].title.replace('`', "'").replace("&amp;", "&").replace("&#39;", "'")}**\n`
        playle.push(results[i].title);
        link.push(results[i].link);
        channel_title.push(results[i].channelTitle);
        video_description.push(results[i].description);
        video_thumbnail.push(results[i].thumbnails.default.url);
        video_image.push(results[i].thumbnails.high.url);
      }

      message.reply({ content: `
\`\`\`🔎 ${buscar}\`\`\`
${text}

${client.warning} Tienes **__1__ minuto** para elegir el vídeo que buscas **|** Escribe "**cancelar**" para detener la búsqueda!
        `, 
        allowedMentions: { repliedUser: false } }).then(async msg2 => {
        const filter = x => x.author.id == message.author.id && 
        ((parseInt(x.content) > 0 && parseInt(x.content) <= results.length) || ["c", "C", "cancelar", "cancel"].includes(x.content));
        const responses = await msg2.channel.createMessageCollector({
            filter,
            max: 1,
            time: 60000,
            errors: ["time"]
          });

        await responses.on("collect", async (msg) => {
          if (isNaN(msg.content)) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} Debes poner solo **__números__**!`);
            e.setFooter({ text: "Comando cancelado." });
            await msg2.delete();
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
          }

          if (["c", "C", "cancelar", "cancel"].includes(msg.content)) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiSuccess} La búsqueda de youtube fue correctamente **__cancelada__**`);
            await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id);
            responses.stop("x");
            return msg2.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
          }

          let video_link = link[parseInt(msg.content) - 1]
          let video_title = playle[parseInt(msg.content) - 1]
          let video_channel = channel_title[parseInt(msg.content) - 1]
          let video_descripcion = video_description[parseInt(msg.content) - 1]
          let video_thumb = video_thumbnail[parseInt(msg.content) - 1]
          let video_imagen = video_image[parseInt(msg.content) - 1]
          await msg2.edit({
              content: `\`\`\`🔎 ${video_title}\`\`\`${video_link}\n\n\`${video_descripcion}\``,
              allowedMentions: { repliedUser: false }
            });

          if (msg.deletable) msg.delete()
            await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id);
        });

        await responses.on("end", async (reason) => {
          if (reason !== "x") return;
          let e = new MessageEmbed()
          e.setColor(client.colorDefault);
          e.setDescription(`${client.emojiError} El tiempo de búsqueda se ha agotado, inténtalo de nuevo.`);
          await client.db.pull(`${message.guild.id}.cmd_on`, message.author.id);
          return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        });
      });
    });
  }
});