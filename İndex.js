const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = "*";

// Sure isimleri (Türkçe)
const SURE_ISIMLERI = {
  1: "Fatiha", 2: "Bakara", 3: "Ali İmran", 4: "Nisa", 5: "Maide",
  6: "En'am", 7: "A'raf", 8: "Enfal", 9: "Tevbe", 10: "Yunus",
  11: "Hud", 12: "Yusuf", 13: "Ra'd", 14: "İbrahim", 15: "Hicr",
  16: "Nahl", 17: "İsra", 18: "Kehf", 19: "Meryem", 20: "Taha",
  21: "Enbiya", 22: "Hac", 23: "Mü'minun", 24: "Nur", 25: "Furkan",
  26: "Şuara", 27: "Neml", 28: "Kasas", 29: "Ankebut", 30: "Rum",
  31: "Lokman", 32: "Secde", 33: "Ahzab", 34: "Sebe", 35: "Fatır",
  36: "Yasin", 37: "Saffat", 38: "Sad", 39: "Zümer", 40: "Mü'min",
  41: "Fussilet", 42: "Şura", 43: "Zuhruf", 44: "Duhan", 45: "Casiye",
  46: "Ahkaf", 47: "Muhammed", 48: "Fetih", 49: "Hucurat", 50: "Kaf",
  51: "Zariyat", 52: "Tur", 53: "Necm", 54: "Kamer", 55: "Rahman",
  56: "Vakıa", 57: "Hadid", 58: "Mücadele", 59: "Haşr", 60: "Mümtehine",
  61: "Saf", 62: "Cuma", 63: "Münafikun", 64: "Tegabun", 65: "Talak",
  66: "Tahrim", 67: "Mülk", 68: "Kalem", 69: "Hakka", 70: "Mearic",
  71: "Nuh", 72: "Cin", 73: "Müzzemmil", 74: "Müddessir", 75: "Kıyame",
  76: "İnsan", 77: "Mürselat", 78: "Nebe", 79: "Naziat", 80: "Abese",
  81: "Tekvir", 82: "İnfitar", 83: "Mutaffifin", 84: "İnşikak", 85: "Buruc",
  86: "Tarık", 87: "A'la", 88: "Gaşiye", 89: "Fecr", 90: "Beled",
  91: "Şems", 92: "Leyl", 93: "Duha", 94: "İnşirah", 95: "Tin",
  96: "Alak", 97: "Kadir", 98: "Beyyine", 99: "Zilzal", 100: "Adiyat",
  101: "Karia", 102: "Tekasür", 103: "Asr", 104: "Hümeze", 105: "Fil",
  106: "Kureyş", 107: "Maun", 108: "Kevser", 109: "Kafirun", 110: "Nasr",
  111: "Tebbet", 112: "İhlas", 113: "Felak", 114: "Nas",
};

client.once("ready", () => {
  console.log(`✅ Bot aktif: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const komut = message.content.slice(PREFIX.length).trim();

  // Format: sure:ayet (örn: 2:255)
  const eslesme = komut.match(/^(\d+):(\d+)$/);

  if (!eslesme) {
    return message.reply(
      "❌ Geçersiz format! Doğru kullanım: `*sure:ayet` → Örnek: `*2:255`"
    );
  }

  const sureNo = parseInt(eslesme[1]);
  const ayetNo = parseInt(eslesme[2]);

  if (sureNo < 1 || sureNo > 114) {
    return message.reply("❌ Sure numarası 1 ile 114 arasında olmalıdır.");
  }

  try {
    // Türkçe meal - Diyanet (tr.diyanet)
    const turkceRes = await fetch(
      `https://api.alquran.cloud/v1/ayah/${sureNo}:${ayetNo}/tr.diyanet`
    );
    const turkceData = await turkceRes.json();

    // Arapça metin
    const arapçaRes = await fetch(
      `https://api.alquran.cloud/v1/ayah/${sureNo}:${ayetNo}/quran-uthmani`
    );
    const arapçaData = await arapçaRes.json();

    if (turkceData.status !== "OK" || arapçaData.status !== "OK") {
      return message.reply(
        "❌ Ayet bulunamadı. Sure veya ayet numarasını kontrol et."
      );
    }

    const meal = turkceData.data.text;
    const arapça = arapçaData.data.text;
    const sureIsim = SURE_ISIMLERI[sureNo] || `${sureNo}. Sure`;

    const embed = new EmbedBuilder()
      .setColor(0x1a6b3c) // İslami yeşil
      .setTitle(`📖 ${sureIsim} Suresi — ${ayetNo}. Ayet`)
      .setDescription(`> ${meal}`)
      .addFields({
        name: "🕌 Arapça",
        value: `\`\`\`${arapça}\`\`\``,
      })
      .setFooter({
        text: `Kur'an ${sureNo}:${ayetNo} • Kaynak: alquran.cloud`,
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (hata) {
    console.error(hata);
    message.reply("❌ Bir hata oluştu. Lütfen tekrar dene.");
  }
});

client.login(process.env.discordtoken);
  
