const { Comando, MessageEmbed, DiscordUtils } = require("../../ConfigBot/index");

module.exports = new Comando({
  nombre: "morse",
  alias: ["text-to-morse", "morse-to-text"],
  descripcion: "Este comando te permite convertir un texto a morse o viceversa.",
  categoria: "Utilidad",
  ejemplo: "$morse [text-to-morse | morse-to-text]",
  ejecutar: (client, message, args) => {
    let alpha = " ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(""),
      morse = "/,.-,-...,-.-.,-..,.,..-.,--.,....,..,.---,-.-,.-..,--,-.,---,.--.,--.-,.-.,...,-,..-,...-,.--,-..-,-.--,--..,.----,..---,...--,....-,.....,-....,--...,---..,----.,-----".split(","),
      text = args.join(" ").toUpperCase();
    if (!text) return message.reply({ allowedMentions: { repliedUser: false }, embeds: [new MessageEmbed().setColor("GREEN").setDescription(`${client.emojiError} Necesitas escribir un texto **__para convertir a morse o viceversa__**.`)]});
    while (text.includes("Ä") || text.includes("Ö") || text.includes("Ü")) {
      text = text.replace("Ä", "AE").replace("Ö", "OE").replace("Ü", "UE");
    }
    if (text.startsWith(".") || text.startsWith("-")) {
      text = text.split(" ");
      let length = text.length;
      for (i = 0; i < length; i++) {
        text[i] = alpha[morse.indexOf(text[i])];
      }
      text = text.join("");
    } else {
      text = text.split("");
      let length = text.length;
      for (i = 0; i < length; i++) {
        text[i] = morse[alpha.indexOf(text[i])];
      }
      text = text.join(" ");
    }
    return message.reply({ content:"```" + text + "```", allowedMentions: { repliedUser: false } });

  }
});