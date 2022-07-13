const { Comando, MessageEmbed, DiscordUtils } = require('../../ConfigBot/index');
const snekfetch = require('snekfetch')
const { get } = require("axios");

module.exports = new Comando({
    nombre: "coronavirus",
    alias: ["covid-19", "covid"],
    categoria: "Información",
    descripcion: "Este comando te muestra las estadísticas del COVID-19 globalmente, casos de un país y un top 10 países.",
    disponible: false,
    ejemplo: "$coronavirus [nombre_pais | top]",
    ejecutar: async (client, message, args) => {
        let prefix;
        if (await client.db.has(`${message.guild.id}.prefix`)) { prefix = await client.db.get(`${message.guild.id}.prefix`) } else { prefix = "c!"; }

        let pais = args.join(' ')
        let ems = new MessageEmbed()
        ems.setColor(client.colorDefault)
        ems.setDescription(`${client.emojiError} El país que estas buscando **__no fue encontrado__**, Intenta en escribir su nombre en ingles.`)


        if (!args[0]) {
            let res = await require('node-fetch')(`https://corona.lmao.ninja/v2/all`);
            let data = await res.json();
            let sa = new MessageEmbed()
            sa.setColor("RED")
            sa.setDescription(`${client.waiting} Cargando...`)
            let msg = await message.reply({ embeds: [sa], allowedMentions: { repliedUser: false } });
            let response = await get("https://covid2019-api.herokuapp.com/total");

            let hora = response.data.dt
            let confirmado = response.data.confirmed
            let recuperado = response.data.recovered
            let muertes = response.data.deaths
            let pruebas = data.testsPerOneMillion
            let activos = data.active
            let paisesinfect = data.affectedCountries
            let criticas = data.critical
            let millon = data.casesPerOneMillion
            let embed = new MessageEmbed()
            embed.setThumbnail("https://www.isglobal.org/documents/10179/7759027/Coronavirus+SARS-CoV-2+de+CDC+en+Unsplash")
            embed.setDescription(`
**D-ConfigBot [\`COVID-19 ${hora}\`]**

**Casos en total: \`${confirmado.toLocaleString()}\`**
**Casos activos: \`${activos.toLocaleString()}\`**
**Casos por un millón: \`${millon.toLocaleString()}\`**
**Casos recuperados: \`${recuperado.toLocaleString()}\`**
**Muertes: \`${muertes.toLocaleString()}\`**
**Situaciones Criticas: \`${criticas.toLocaleString()}\`**
**Paises infectados: \`${paisesinfect.toLocaleString()}\`**
**Pruebas en un millón: \`${pruebas.toLocaleString()}\`**
        `)
            embed.setImage('https://images-ext-1.discordapp.net/external/VY2rglPktB6dSnDRDZDNTXdfaCG_mt0ToWwikRQvYVo/https/cnet3.cbsistatic.com/img/Xxx-aoiE7bP3rwesInkz_GnpYcY%3D/940x0/2020/07/09/8ed30921-36e0-4857-8bc3-f6faf8341470/screen-shot-2020-07-09-at-1-00-14-pm.png')
            embed.setColor(client.colorDefault);
            embed.setFooter(`${prefix}coronavirus [top | search]`)
            return await msg.edit({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } else if (args[0] === 'top') {
            let sa = new MessageEmbed()
            sa.setColor(client.colorDefault)
            sa.setDescription(`${client.waiting} Cargando...`)
            let msg = await message.reply({ embeds: [sa], allowedMentions: { repliedUser: false } });
            let response = await get("https://covid2019-api.herokuapp.com/total");
            let hora = response.data.dt
            client.covidAPI.corona((data_list) => {
                if (!data_list) return message.reply({ content: "La API anda desactivada!", allowedMentions: { repliedUser: false } });
                client.covidAPI.corona(async (data_stats) => {
                    if (!data_stats) return message.reply({ content: "La API anda desactivada!" });
                    data_list.map((s, i) => data_list[i] = `\`\`[TOP ${i+1}]\`\`  **País:** \`${s.pais.toLocaleString()}\` **Casos:** \`${s.casos.toLocaleString()}\` **Muertes:** \`${s.muertes.toLocaleString()}\``)
                    let serverlist = [];
                    while (data_list.length > 0) serverlist.push(data_list.splice(0, 10));

                    let embed_list = new MessageEmbed()
                    embed_list.setColor(client.colorDefault)
                    embed_list.setDescription(`
**D-ConfigBot [\`COVID-19 ${hora}\`]**

${serverlist[0].join('\n')}
`)
                    embed_list.setThumbnail('https://www.isglobal.org/documents/10179/7759027/Coronavirus+SARS-CoV-2+de+CDC+en+Unsplash');
                    if (serverlist.length == 1) return await msg.edit({ embeds: [embed_list], allowedMentions: { repliedUser: false } });
                });
            })
            return;
        } else if (pais) {
            let response = await get("https://covid2019-api.herokuapp.com/total");
            let hora = response.data.dt
            snekfetch.get(`https://corona.lmao.ninja/v2/countries/${pais}`).then(r => {
                const cas = r.body.cases
                const death = r.body.deaths
                const castoday = r.body.todayCases
                const todaydeath = r.body.todayDeaths
                const recupera = r.body.recovered
                const activos = r.body.active
                const x = new MessageEmbed()
                x.setColor(client.colorDefault)
                x.setImage(r.body.countryInfo.flag)
                x.setDescription(`
\`\`\`🔎 ${r.body.country}\`\`\`

• Casos: **__${cas.toLocaleString()}__**
• Muertes: **__${death.toLocaleString()}__**
• Personas recuperadas: **__${recupera.toLocaleString()}__**
• Casos registrados hoy: **__${castoday.toLocaleString()}__**
• Casos activos: **__${activos.toLocaleString()}__**
• Muertes registradas hoy: **__${todaydeath.toLocaleString()}__**`)
                return message.reply({ embeds: [x], allowedMentions: { repliedUser: false } });
            }).catch(err => message.reply({ embeds: [ems], allowedMentions: { repliedUser: false } }))
        }
    }
})