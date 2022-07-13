const { Comando, MessageEmbed, DiscordUtils, MessageButton, MessageActionRow } = require("../../ConfigBot/index");
const math = require('mathjs');

module.exports = new Comando({
    nombre: "calculadora",
    alias: ["calc", "calculator", "calculadora", "math"],
    descripcion: "Haz operaciones matematicas desde discord!",
    categoria: "Utilidad",
    ejemplo: "$calculadora",
    ejecutar: (client, message, args) => {
        let str = ' ';
        let stringify = '```\n' + str + '\n```';

        const row = [], rows = [];

        const button = new Array([], [], [], [], []);
        const buttons = new Array([], [], [], [], []);

        const text = ['(', ')', '^', '%', 'AC', '7', '8', '9', '÷', 'DC', '4', '5', '6', 'x', '⌫', '1', '2', '3', '-', '\u200b', '.', '0', '=', '+', '\u200b'];

        let cur = 0;
        let current = 0;

        for (let i = 0; i < text.length; i++) {
            if (button[current].length === 5) current++;
            button[current].push(new DiscordUtils().createButton(text[i], false, new DiscordUtils().button_id_generator(10)), );
            if (i === text.length - 1) {
                for (const btn of button) row.push(new DiscordUtils().addRow(btn));
            }
        }

        message.reply({ content: stringify, components: row, allowedMentions: { repliedUser: false } })
            .then(async (msg) => {
                async function edit() {
                    msg.edit({ content: stringify, components: row, allowedMentions: { repliedUser: false } });
                }

                async function lock() {
                    for (let i = 0; i < text.length; i++) {
                        if (buttons[cur].length === 5) cur++;
                        buttons[cur].push(
                            new DiscordUtils().createButton(text[i], true, new DiscordUtils().button_id_generator(10)),
                        );
                        if (i === text.length - 1) {
                            for (const btn of buttons) rows.push(new DiscordUtils().addRow(btn));
                        }
                    }

                    msg.edit({ content: stringify, components: rows, });
                }

                let calc_filter = x => x.user.id == message.author.author;
                const calc = msg.channel.createMessageComponentCollector({ calc_filter, idle: 360000, errors: ["idle"] });

                calc.on('collect', async (btn) => {
                    await btn.deferUpdate();
                    if (btn.customId === 'calAC') {
                        str += ' ';
                        stringify = '```\n' + str + '\n```';
                        edit();
                    } else if (btn.customId === 'calx') {
                        str += '*';
                        stringify = '```\n' + str + '\n```';
                        edit();
                    } else if (btn.customId === 'cal÷') {
                        str += '/';
                        stringify = '```\n' + str + '\n```';
                        edit();
                    } else if (btn.customId === 'cal⌫') {
                        if (str === ' ' || str === '' || str === null || str === undefined) {
                            return;
                        } else {
                            str = str.split('');
                            str.pop();
                            str = str.join('');
                            stringify = '```\n' + str + '\n```';
                            edit();
                        }
                    } else if (btn.customId === 'cal=') {
                        if (str === ' ' || str === '' || str === null || str === undefined) {
                            return;
                        } else {
                            try {
                                str += ' = ' +math.evaluate(str.replace("÷", "/").replace("x", "*")).toLocaleString();
                                stringify = '```\n' + str + '\n```';
                                edit();
                                str = ' ';
                                stringify = '```\n' + str + '\n```';
                            } catch (e) {
                                str = "La operación ingresada es invalida.";
                                stringify = '```\n' + str + '\n```';
                                edit();
                                str = ' ';
                                stringify = '```\n' + str + '\n```';
                            }
                        }
                    } else if (btn.customId === 'calDC') {
                        str = `Calculadora deshabilitada por el usuario ejecutor ${message.author.username}.`;
                        stringify = '```\n' + str + '\n```';
                        edit();
                        calc.stop();
                        lock();
                    } else {
                        str += btn.customId.replace('cal', '');
                        stringify = '```\n' + str + '\n```';
                        edit();
                    }
                });
            });
    }
})