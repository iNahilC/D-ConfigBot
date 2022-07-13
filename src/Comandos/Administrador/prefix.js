const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");

module.exports = new Comando({
    nombre: "prefix",
    alias: ["setprefix", "set-prefix", "prefijo"],
    descripcion: "Este comando te permite cambiar el prefijo por defecto del bot.",
    categoria: "Administrador",
    ejemplo: "$prefix [nuevo_prefix]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!" }
        let logs = await client.db.get(`${message.guild.id}.logs_channel`);
        let lchannel = message.guild.channels.cache.get(logs);
        if (!lchannel) {
          let e = new MessageEmbed();
          e.setColor(client.colorDefault);
          e.setDescription(`${client.emojiError} ${client.missing_logs_channel}`);
          await client.db.delete(`${message.guild.id}.logs_channel`);
          return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let prefix2 = args.join("_")
        if (!prefix2) {
            let e = new MessageEmbed()
            e.setColor(client.colorDefault)
            e.setDescription(`${client.emojiError} Necesitas escribir el **__nuevo prefijo__** quieres establecer en este servidor.`)
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false} })
        }
        if (prefix2.length < 1) {
            let embed_8 = new MessageEmbed()
            embed_8.setDescription(`${client.emojiError} El prefijo debe tener mínimo **__1__** caracteres.`)
            embed_8.setColor(client.colorDefault)
            return message.reply({ embeds: [embed_8], allowedMentions: { repliedUser: false} });
        }
        if (prefix2.length > 4) {
            let embed_8 = new MessageEmbed()
            embed_8.setDescription(`${client.emojiError} El prefijo no debe superar a mas de **__4__** caracteres.`)
            embed_8.setColor(client.colorDefault)
            return message.reply({ embeds: [embed_8], allowedMentions: { repliedUser: false} });
        }

        if (prefix2 == prefix) {
            let e = new MessageEmbed();
            e.setColor(client.colorDefault);
            e.setDescription(`${client.emojiError} El prefix **\`${prefix2}\`** ya está establecido.`);
            return message.reply({ embeds: [e], allowedMentions: { repliedUser: false } });
        }

        let button_url = new MessageActionRow().addComponents( 
            new MessageButton().setStyle('LINK').setURL(message.url).setLabel(`Ir al mensaje del Administrador`), );

        let embed_8 = new MessageEmbed()
        embed_8.setDescription(`${client.emojiSuccess} Prefijo correctamente cambiado **\`${prefix}\`** → **\`${prefix2}\`**.`)
        embed_8.setColor(client.colorDefault)
        message.reply({ embeds: [embed_8], allowedMentions: { repliedUser: false} });
        lchannel.send({ content:`
\`\`\`md
# D-ConfigBot [Prefix | Changed]

* Administrador
> ${message.author.tag} [ID: ${message.author.id}]

* Prefix
> ${prefix} → ${prefix2}
\`\`\``, components: [button_url] }); 
        return await client.db.set(`${message.guild.id}.prefix`, prefix2);
    }
});