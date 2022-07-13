const { Comando, MessageEmbed } = require("../../ConfigBot/index"), hexColorInfo = require("hex-colors-info"), hexToRgb = require('hex-to-rgb');

module.exports = new Comando({
    nombre: "color",
    alias: ["hex", "hex-info", "color-info", "hexinfo"],
    categoria: "Información",
    descripcion: "Obtén información sobre un color hexadecimal.",
    ejemplo: "$color #800FFF",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.get(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`); } else { prefix = "c!"; }
        if (!args[0]) {
            let embed = new MessageEmbed();
            embed.setColor(client.colorDefault);
            embed.setDescription(`${client.emojiError} Necesitas escriba un **__código hex__** valido.

Ejemplo: ${prefix}color **800FFF**`);
            embed.setImage("https://api.alexflipnote.dev/color/image/800FFF");
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }
        var validThatHex = /^[0-9A-F]{6}$/i.test(args[0]);
        if (validThatHex === false) {
            let invalidHex = new MessageEmbed();
            invalidHex.setColor(client.colorDefault);
            invalidHex.setDescription(`${client.emojiError} Necesitas ingresar un código **__hex__** valido.`);
            return message.reply({ embeds: [invalidHex], allowedMentions: { repliedUser: false } });
        }

        const colorInfo = hexColorInfo(`#${args[0]}`);
        const rgbInfo = hexToRgb(`#${args[0]}`);
        return message.reply({ allowedMentions: { repliedUser: false }, content: `
**D-ConfigBot [\`Hexadecimal Info\`]**

**Nombre: \`${colorInfo.name}\`**
**HEX: \`${colorInfo.hex}\`**
**RGB: \`${rgbInfo[0]}, ${rgbInfo[1]}, ${rgbInfo[2]}\`**
**Hex Color: \`${colorInfo.hueName}\`**
      `, embeds: [new MessageEmbed().setColor(colorInfo.hex).setImage(`https://api.alexflipnote.dev/color/image/${args[0]}`)] });
    }
});