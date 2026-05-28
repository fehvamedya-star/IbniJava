const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const PREFIX = "*";

const SURE_NAMES = {
  1:"Fatiha",2:"Bakara",3:"Ali Imran",4:"Nisa",5:"Maide",
  6:"Enam",7:"Araf",8:"Enfal",9:"Tevbe",10:"Yunus",
  11:"Hud",12:"Yusuf",13:"Rad",14:"Ibrahim",15:"Hicr",
  16:"Nahl",17:"Isra",18:"Kehf",19:"Meryem",20:"Taha",
  21:"Enbiya",22:"Hac",23:"Muminun",24:"Nur",25:"Furkan",
  26:"Suara",27:"Neml",28:"Kasas",29:"Ankebut",30:"Rum",
  31:"Lokman",32:"Secde",33:"Ahzab",34:"Sebe",35:"Fatir",
  36:"Yasin",37:"Saffat",38:"Sad",39:"Zumer",40:"Mumin",
  41:"Fussilet",42:"Sura",43:"Zuhruf",44:"Duhan",45:"Casiye",
  46:"Ahkaf",47:"Muhammed",48:"Fetih",49:"Hucurat",50:"Kaf",
  51:"Zariyat",52:"Tur",53:"Necm",54:"Kamer",55:"Rahman",
  56:"Vakia",57:"Hadid",58:"Mucadele",59:"Hasr",60:"Mumtehine",
  61:"Saf",62:"Cuma",63:"Munafikun",64:"Tegabun",65:"Talak",
  66:"Tahrim",67:"Mulk",68:"Kalem",69:"Hakka",70:"Mearic",
  71:"Nuh",72:"Cin",73:"Muzzemmil",74:"Muddessir",75:"Kiyame",
  76:"Insan",77:"Murselat",78:"Nebe",79:"Naziat",80:"Abese",
  81:"Tekvir",82:"Infitar",83:"Mutaffifin",84:"Insikak",85:"Buruc",
  86:"Tarik",87:"Ala",88:"Gasiye",89:"Fecr",90:"Beled",
  91:"Sems",92:"Leyl",93:"Duha",94:"Insira",95:"Tin",
  96:"Alak",97:"Kadir",98:"Beyyine",99:"Zilzal",100:"Adiyat",
  101:"Karia",102:"Tekasur",103:"Asr",104:"Humeze",105:"Fil",
  106:"Kureys",107:"Maun",108:"Kevser",109:"Kafirun",110:"Nasr",
  111:"Tebbet",112:"Ihlas",113:"Felak",114:"Nas"
};

// ─── YARDIMCI FONKSİYONLAR ───────────────────────────────────────────────────

function parseMuteDuration(args) {
  let totalMs = 0;
  let reasonParts = [];
  let i = 0;

  while (i < args.length) {
    const num = parseInt(args[i]);
    if (!isNaN(num) && args[i + 1]) {
      const unit = args[i + 1].toLowerCase();
      if (unit === "gun" || unit === "gün" || unit === "g") {
        totalMs += num * 24 * 60 * 60 * 1000;
        i += 2; continue;
      } else if (unit === "saat" || unit === "s") {
        totalMs += num * 60 * 60 * 1000;
        i += 2; continue;
      } else if (unit === "dakika" || unit === "dk" || unit === "d") {
        totalMs += num * 60 * 1000;
        i += 2; continue;
      }
    }
    reasonParts.push(args[i]);
    i++;
  }

  return { totalMs, reason: reasonParts.join(" ") || "Sebep belirtilmedi" };
}

function formatDuration(ms) {
  if (ms <= 0) return "Belirsiz";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  let parts = [];
  if (days > 0) parts.push(days + " gun");
  if (hours > 0) parts.push(hours + " saat");
  if (minutes > 0) parts.push(minutes + " dakika");
  return parts.length > 0 ? parts.join(" ") : "1 dakikadan az";
}

function errorEmbed(msg) {
  return new EmbedBuilder()
    .setColor(0xff4444)
    .setDescription("❌  " + msg)
    .setTimestamp();
}

function successEmbed(title, fields, color) {
  const embed = new EmbedBuilder()
    .setColor(color || 0x2ecc71)
    .setTitle(title)
    .setTimestamp();
  if (fields) fields.forEach(f => embed.addFields(f));
  return embed;
}

// ─── BOT HAZIR ───────────────────────────────────────────────────────────────

client.once("ready", () => {
  console.log("Bot aktif: " + client.user.tag);
});

// ─── MESAJ DINLEYICI ─────────────────────────────────────────────────────────

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  // ═══════════════════════════════════════════════════════════
  // KURAN: *2:255
  // ═══════════════════════════════════════════════════════════
  const ayetMatch = command.match(/^(\d+):(\d+)$/);
  if (ayetMatch) {
    const sureNo = parseInt(ayetMatch[1]);
    const ayetNo = parseInt(ayetMatch[2]);

    if (sureNo < 1 || sureNo > 114) {
      return message.reply({ embeds: [errorEmbed("Sure numarasi 1-114 arasinda olmalidir.")] });
    }

    try {
      const [turkceRes, arabicRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/ayah/${sureNo}:${ayetNo}/tr.diyanet`),
        fetch(`https://api.alquran.cloud/v1/ayah/${sureNo}:${ayetNo}/quran-uthmani`)
      ]);
      const turkceData = await turkceRes.json();
      const arabicData = await arabicRes.json();

      if (turkceData.status !== "OK" || arabicData.status !== "OK") {
        return message.reply({ embeds: [errorEmbed("Ayet bulunamadi. Numara kontrolu yapiniz.")] });
      }

      const embed = new EmbedBuilder()
        .setColor(0x1a6b3c)
        .setAuthor({ name: "Kuran-i Kerim", iconURL: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/72x72/1f4d6.png" })
        .setTitle("📖  " + (SURE_NAMES[sureNo] || sureNo + ". Sure") + " Suresi  —  " + ayetNo + ". Ayet")
        .setDescription("> " + turkceData.data.text)
        .addFields({ name: "🕌  Arapca", value: "```" + arabicData.data.text + "```" })
        .setFooter({ text: "Kuran " + sureNo + ":" + ayetNo + "  •  alquran.cloud" })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.reply({ embeds: [errorEmbed("Bir hata olustu. Tekrar dene.")] });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // BAN
  // ═══════════════════════════════════════════════════════════
  if (command === "ban") {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply({ embeds: [errorEmbed("Bu komutu kullanmak icin **Ban Uyeleri** yetkisine ihtiyacin var.")] });
    }

    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [errorEmbed("Bir kullanici etiketle.  Ornek: `*ban @kullanici sebep`")] });

    if (!target.bannable) {
      return message.reply({ embeds: [errorEmbed("Bu kullaniciyi banlayamam. Yetki hiyerarsisini kontrol et.")] });
    }

    const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

    try {
      await target.ban({ reason });

      const embed = new EmbedBuilder()
        .setColor(0xff2222)
        .setAuthor({ name: "BANLANMA KARARI", iconURL: message.guild.iconURL() })
        .setTitle("🔨  " + target.user.tag + " sunucudan banlandı")
        .addFields(
          { name: "👤  Kullanici", value: target.user.tag + "\n`" + target.user.id + "`", inline: true },
          { name: "👮  Yetkili", value: message.author.tag, inline: true },
          { name: "📋  Sebep", value: reason }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Ban islemi tamamlandi" })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      return message.reply({ embeds: [errorEmbed("Ban islemi sirasinda hata olustu.")] });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // KICK
  // ═══════════════════════════════════════════════════════════
  if (command === "kick") {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply({ embeds: [errorEmbed("Bu komutu kullanmak icin **Uye At** yetkisine ihtiyacin var.")] });
    }

    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [errorEmbed("Bir kullanici etiketle.  Ornek: `*kick @kullanici sebep`")] });

    if (!target.kickable) {
      return message.reply({ embeds: [errorEmbed("Bu kullaniciyi atamaiyorum. Yetki hiyerarsisini kontrol et.")] });
    }

    const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

    try {
      await target.kick(reason);

      const embed = new EmbedBuilder()
        .setColor(0xff8800)
        .setAuthor({ name: "ATILMA KARARI", iconURL: message.guild.iconURL() })
        .setTitle("👢  " + target.user.tag + " sunucudan atıldı")
        .addFields(
          { name: "👤  Kullanici", value: target.user.tag + "\n`" + target.user.id + "`", inline: true },
          { name: "👮  Yetkili", value: message.author.tag, inline: true },
          { name: "📋  Sebep", value: reason }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Kick islemi tamamlandi" })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      return message.reply({ embeds: [errorEmbed("Kick islemi sirasinda hata olustu.")] });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // MUTE  →  *mute @kullanici 1 gun 2 saat 30 dakika sebep
  // ═══════════════════════════════════════════════════════════
  if (command === "mute") {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply({ embeds: [errorEmbed("Bu komutu kullanmak icin **Uyeleri Sustur** yetkisine ihtiyacin var.")] });
    }

    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [errorEmbed("Bir kullanici etiketle.  Ornek: `*mute @kullanici 1 gun sebep`")] });

    if (!target.moderatable) {
      return message.reply({ embeds: [errorEmbed("Bu kullaniciyi susturamam. Yetki hiyerarsisini kontrol et.")] });
    }

    const durationArgs = args.slice(1);
    const { totalMs, reason } = parseMuteDuration(durationArgs);

    const maxMs = 28 * 24 * 60 * 60 * 1000; // Discord max 28 gun
    const finalMs = Math.min(totalMs > 0 ? totalMs : 10 * 60 * 1000, maxMs);

    try {
      await target.timeout(finalMs, reason);

      const embed = new EmbedBuilder()
        .setColor(0xffcc00)
        .setAuthor({ name: "SUSTURMA KARARI", iconURL: message.guild.iconURL() })
        .setTitle("🔇  " + target.user.tag + " susturuldu")
        .addFields(
          { name: "👤  Kullanici", value: target.user.tag + "\n`" + target.user.id + "`", inline: true },
          { name: "👮  Yetkili", value: message.author.tag, inline: true },
          { name: "⏱️  Sure", value: formatDuration(finalMs), inline: true },
          { name: "📅  Bitis", value: "<t:" + Math.floor((Date.now() + finalMs) / 1000) + ":R>", inline: true },
          { name: "📋  Sebep", value: reason }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Mute islemi tamamlandi" })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      return message.reply({ embeds: [errorEmbed("Mute islemi sirasinda hata olustu.")] });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // UNMUTE
  // ═══════════════════════════════════════════════════════════
  if (command === "unmute") {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply({ embeds: [errorEmbed("Bu komutu kullanmak icin **Uyeleri Sustur** yetkisine ihtiyacin var.")] });
    }

    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [errorEmbed("Bir kullanici etiketle.  Ornek: `*unmute @kullanici`")] });

    try {
      await target.timeout(null);

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("🔊  " + target.user.tag + " susturma kaldirildi")
        .addFields(
          { name: "👤  Kullanici", value: target.user.tag, inline: true },
          { name: "👮  Yetkili", value: message.author.tag, inline: true }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      return message.reply({ embeds: [errorEmbed("Unmute islemi sirasinda hata olustu.")] });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TEMİZLE
  // ═══════════════════════════════════════════════════════════
  if (command === "temizle" || command === "clear") {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply({ embeds: [errorEmbed("Bu komutu kullanmak icin **Mesajlari Yonet** yetkisine ihtiyacin var.")] });
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply({ embeds: [errorEmbed("1 ile 100 arasinda bir sayi gir.  Ornek: `*temizle 10`")] });
    }

    try {
      await message.delete();
      const deleted = await message.channel.bulkDelete(amount, true);

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("🗑️  Mesajlar Silindi")
        .setDescription(deleted.size + " mesaj basariyla silindi.")
        .addFields({ name: "👮  Yetkili", value: message.author.tag, inline: true })
        .setTimestamp();

      const reply = await message.channel.send({ embeds: [embed] });
      setTimeout(() => reply.delete().catch(() => {}), 4000);
    } catch (err) {
      return message.channel.send({ embeds: [errorEmbed("Mesaj silme islemi sirasinda hata olustu. (14 gunden eski mesajlar silinemez)")] });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // YARDIM
  // ═══════════════════════════════════════════════════════════
  if (command === "yardim" || command === "help") {
    const embed = new EmbedBuilder()
      .setColor(0x7289da)
      .setAuthor({ name: client.user.tag + " — Komut Listesi", iconURL: client.user.displayAvatarURL() })
      .setTitle("📜  Tum Komutlar")
      .addFields(
        { name: "📖  Kuran", value: "`*sure:ayet` — Ayet goster\nOrnek: `*2:255`" },
        { name: "🔨  Ban", value: "`*ban @kullanici [sebep]`" },
        { name: "👢  Kick", value: "`*kick @kullanici [sebep]`" },
        { name: "🔇  Mute", value: "`*mute @kullanici [Xgun] [Xsaat] [Xdakika] [sebep]`\nOrnek: `*mute @ali 1 gun 30 dakika spam`" },
        { name: "🔊  Unmute", value: "`*unmute @kullanici`" },
        { name: "🗑️  Temizle", value: "`*temizle [sayi]` — Max 100 mesaj" }
      )
      .setFooter({ text: "Prefix: *" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
});

client.login(process.env.discordtoken);
    
