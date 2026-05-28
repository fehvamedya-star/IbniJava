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

// Hadis kitapları
const HADIS_KITAPLARI = {
  "buhari":   { tur: "tur-bukhari",   ara: "ara-bukhari",   isim: "Sahih-i Buhari",   renk: 0x1abc9c },
  "muslim":   { tur: "tur-muslim",    ara: "ara-muslim",    isim: "Sahih-i Muslim",    renk: 0x3498db },
  "ebudavud": { tur: "tur-abudawud",  ara: "ara-abudawud",  isim: "Ebu Davud",         renk: 0x9b59b6 },
  "tirmizi":  { tur: "tur-tirmidhi",  ara: "ara-tirmidhi",  isim: "Tirmizi",           renk: 0xe67e22 },
  "nesai":    { tur: "tur-nasai",     ara: "ara-nasai",     isim: "Nesai",             renk: 0xe74c3c },
  "ibnmace":  { tur: "tur-ibnmajah",  ara: "ara-ibnmajah",  isim: "Ibn Mace",          renk: 0xf39c12 },
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
      if (["gun", "gün", "g"].includes(unit)) { totalMs += num * 24 * 60 * 60 * 1000; i += 2; continue; }
      if (["saat", "s"].includes(unit)) { totalMs += num * 60 * 60 * 1000; i += 2; continue; }
      if (["dakika", "dk", "d"].includes(unit)) { totalMs += num * 60 * 1000; i += 2; continue; }
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
  if (days > 0) parts.push("**" + days + " gün**");
  if (hours > 0) parts.push("**" + hours + " saat**");
  if (minutes > 0) parts.push("**" + minutes + " dakika**");
  return parts.length > 0 ? parts.join(" ") : "**1 dakikadan az**";
}

function errorEmbed(msg) {
  return new EmbedBuilder()
    .setColor(0xff2222)
    .setTitle("❌  Hata")
    .setDescription(">>> " + msg)
    .setTimestamp();
}

// ─── BOT HAZIR ───────────────────────────────────────────────────────────────

client.once("ready", () => {
  console.log("Bot aktif: " + client.user.tag);
});

// ─── MESAJ DİNLEYİCİ ─────────────────────────────────────────────────────────

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  // ══════════════════════════════════════════════════════
  // KUR'AN: *2:255
  // ══════════════════════════════════════════════════════
  const ayetMatch = command.match(/^(\d+):(\d+)$/);
  if (ayetMatch) {
    const sureNo = parseInt(ayetMatch[1]);
    const ayetNo = parseInt(ayetMatch[2]);
    if (sureNo < 1 || sureNo > 114)
      return message.reply({ embeds: [errorEmbed("**Sure numarası 1 ile 114 arasında olmalıdır.**")] });
    try {
      const [t, a] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/ayah/${sureNo}:${ayetNo}/tr.diyanet`),
        fetch(`https://api.alquran.cloud/v1/ayah/${sureNo}:${ayetNo}/quran-uthmani`)
      ]);
      const td = await t.json();
      const ad = await a.json();
      if (td.status !== "OK" || ad.status !== "OK")
        return message.reply({ embeds: [errorEmbed("**Ayet bulunamadı.** Sure veya ayet numarasını kontrol et.")] });

      const embed = new EmbedBuilder()
        .setColor(0x1a6b3c)
        .setAuthor({ name: "📖  Kur'an-ı Kerim" })
        .setTitle("**" + (SURE_NAMES[sureNo] || sureNo + ". Sure") + " Suresi — " + ayetNo + ". Ayet**")
        .setDescription(">>> **" + td.data.text + "**")
        .addFields({ name: "🕌  Arapça", value: "```" + ad.data.text + "```" })
        .setFooter({ text: "Kur'an " + sureNo + ":" + ayetNo + "  •  alquran.cloud" })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    } catch (err) {
      return message.reply({ embeds: [errorEmbed("**Bir hata oluştu.** Lütfen tekrar dene.")] });
    }
  }

  // ══════════════════════════════════════════════════════
  // HADİS: *buhari 1 / *muslim 45 / *tirmizi 10 ...
  // ══════════════════════════════════════════════════════
  if (HADIS_KITAPLARI[command]) {
    const kitap = HADIS_KITAPLARI[command];
    const hadisNo = parseInt(args[0]);

    if (isNaN(hadisNo) || hadisNo < 1)
      return message.reply({ embeds: [errorEmbed("**Geçerli bir hadis numarası gir.**\nKullanım: `*" + command + " 1`")] });

    try {
      const [turRes, araRes] = await Promise.all([
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${kitap.tur}/${hadisNo}.json`),
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${kitap.ara}/${hadisNo}.json`)
      ]);

      if (!turRes.ok)
        return message.reply({ embeds: [errorEmbed("**Hadis bulunamadı.** Numara doğru mu kontrol et.")] });

      const turData = await turRes.json();
      const araData = araRes.ok ? await araRes.json() : null;

      const turMetin = turData.hadiths?.[0]?.text || turData.hadith?.[0]?.text || "Metin bulunamadı.";
      const araMetin = araData ? (araData.hadiths?.[0]?.text || araData.hadith?.[0]?.text || null) : null;

      // Uzun metinleri kısalt
      const kisaltilmisTur = turMetin.length > 900 ? turMetin.slice(0, 900) + "..." : turMetin;
      const kisaltilmisAra = araMetin ? (araMetin.length > 400 ? araMetin.slice(0, 400) + "..." : araMetin) : null;

      const embed = new EmbedBuilder()
        .setColor(kitap.renk)
        .setAuthor({ name: "📚  Kütübü Sitte" })
        .setTitle("**" + kitap.isim + " — " + hadisNo + ". Hadis**")
        .setDescription(">>> **" + kisaltilmisTur + "**")
        .setFooter({ text: kitap.isim + " No: " + hadisNo + "  •  fawazahmed0/hadith-api" })
        .setTimestamp();

      if (kisaltilmisAra) {
        embed.addFields({ name: "🕌  Arapça", value: "```" + kisaltilmisAra + "```" });
      }

      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.reply({ embeds: [errorEmbed("**Bir hata oluştu.** Lütfen tekrar dene.")] });
    }
  }

  // ══════════════════════════════════════════════════════
  // BAN
  // ══════════════════════════════════════════════════════
  if (command === "ban") {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
      return message.reply({ embeds: [errorEmbed("**Ban Üyeleri** yetkisine ihtiyacın var.")] });
    const target = message.mentions.members.first();
    if (!target)
      return message.reply({ embeds: [errorEmbed("**Bir kullanıcı etiketle.**\nKullanım: `*ban @kullanıcı sebep`")] });
    if (!target.bannable)
      return message.reply({ embeds: [errorEmbed("**Bu kullanıcıyı banlayamam.** Yetki hiyerarşisini kontrol et.")] });
    const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
    try {
      await target.ban({ reason });
      const embed = new EmbedBuilder()
        .setColor(0xff2222)
        .setAuthor({ name: "⚖️  SUNUCU MODERASYONU", iconURL: message.guild.iconURL() })
        .setTitle("🔨  Kullanıcı Banlandı")
        .setDescription(">>> **" + target.user.tag + "** sunucudan kalıcı olarak uzaklaştırıldı.")
        .addFields(
          { name: "👤  Kullanıcı", value: "**" + target.user.tag + "**\n`" + target.user.id + "`", inline: true },
          { name: "👮  Yetkili", value: "**" + message.author.tag + "**", inline: true },
          { name: "📋  Sebep", value: "**" + reason + "**" }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Ban işlemi tamamlandı" })
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      return message.reply({ embeds: [errorEmbed("**Ban işlemi sırasında hata oluştu.**")] });
    }
  }

  // ══════════════════════════════════════════════════════
  // KICK
  // ══════════════════════════════════════════════════════
  if (command === "kick") {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers))
      return message.reply({ embeds: [errorEmbed("**Üye At** yetkisine ihtiyacın var.")] });
    const target = message.mentions.members.first();
    if (!target)
      return message.reply({ embeds: [errorEmbed("**Bir kullanıcı etiketle.**\nKullanım: `*kick @kullanıcı sebep`")] });
    if (!target.kickable)
      return message.reply({ embeds: [errorEmbed("**Bu kullanıcıyı atamıyorum.** Yetki hiyerarşisini kontrol et.")] });
    const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
    try {
      await target.kick(reason);
      const embed = new EmbedBuilder()
        .setColor(0xff8800)
        .setAuthor({ name: "⚖️  SUNUCU MODERASYONU", iconURL: message.guild.iconURL() })
        .setTitle("👢  Kullanıcı Atıldı")
        .setDescription(">>> **" + target.user.tag + "** sunucudan atıldı.")
        .addFields(
          { name: "👤  Kullanıcı", value: "**" + target.user.tag + "**\n`" + target.user.id + "`", inline: true },
          { name: "👮  Yetkili", value: "**" + message.author.tag + "**", inline: true },
          { name: "📋  Sebep", value: "**" + reason + "**" }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Kick işlemi tamamlandı" })
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      return message.reply({ embeds: [errorEmbed("**Kick işlemi sırasında hata oluştu.**")] });
    }
  }

  // ══════════════════════════════════════════════════════
  // MUTE
  // ══════════════════════════════════════════════════════
  if (command === "mute") {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return message.reply({ embeds: [errorEmbed("**Üyeleri Sustur** yetkisine ihtiyacın var.")] });
    const target = message.mentions.members.first();
    if (!target)
      return message.reply({ embeds: [errorEmbed("**Bir kullanıcı etiketle.**\nKullanım: `*mute @kullanıcı 1 gün 30 dakika sebep`")] });
    if (!target.moderatable)
      return message.reply({ embeds: [errorEmbed("**Bu kullanıcıyı susturamam.** Yetki hiyerarşisini kontrol et.")] });
    const { totalMs, reason } = parseMuteDuration(args.slice(1));
    const finalMs = Math.min(totalMs > 0 ? totalMs : 10 * 60 * 1000, 28 * 24 * 60 * 60 * 1000);
    try {
      await target.timeout(finalMs, reason);
      const embed = new EmbedBuilder()
        .setColor(0xffcc00)
        .setAuthor({ name: "⚖️  SUNUCU MODERASYONU", iconURL: message.guild.iconURL() })
        .setTitle("🔇  Kullanıcı Susturuldu")
        .setDescription(">>> **" + target.user.tag + "** geçici olarak susturuldu.")
        .addFields(
          { name: "👤  Kullanıcı", value: "**" + target.user.tag + "**\n`" + target.user.id + "`", inline: true },
          { name: "👮  Yetkili", value: "**" + message.author.tag + "**", inline: true },
          { name: "⏱️  Süre", value: formatDuration(finalMs), inline: true },
          { name: "📅  Bitiş", value: "<t:" + Math.floor((Date.now() + finalMs) / 1000) + ":R>", inline: true },
          { name: "📋  Sebep", value: "**" + reason + "**" }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Mute işlemi tamamlandı" })
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      return message.reply({ embeds: [errorEmbed("**Mute işlemi sırasında hata oluştu.**")] });
    }
  }

  // ══════════════════════════════════════════════════════
  // UNMUTE
  // ══════════════════════════════════════════════════════
  if (command === "unmute") {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
      return message.reply({ embeds: [errorEmbed("**Üyeleri Sustur** yetkisine ihtiyacın var.")] });
    const target = message.mentions.members.first();
    if (!target)
      return message.reply({ embeds: [errorEmbed("**Bir kullanıcı etiketle.**\nKullanım: `*unmute @kullanıcı`")] });
    try {
      await target.timeout(null);
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setAuthor({ name: "⚖️  SUNUCU MODERASYONU", iconURL: message.guild.iconURL() })
        .setTitle("🔊  Susturma Kaldırıldı")
        .setDescription(">>> **" + target.user.tag + "** artık konuşabilir.")
        .addFields(
          { name: "👤  Kullanıcı", value: "**" + target.user.tag + "**", inline: true },
          { name: "👮  Yetkili", value: "**" + message.author.tag + "**", inline: true }
        )
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      return message.reply({ embeds: [errorEmbed("**Unmute işlemi sırasında hata oluştu.**")] });
    }
  }

  // ══════════════════════════════════════════════════════
  // TEMİZLE
  // ══════════════════════════════════════════════════════
  if (command === "temizle") {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return message.reply({ embeds: [errorEmbed("**Mesajları Yönet** yetkisine ihtiyacın var.")] });
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100)
      return message.reply({ embeds: [errorEmbed("**1 ile 100 arasında bir sayı gir.**\nKullanım: `*temizle 10`")] });
    try {
      await message.delete();
      const deleted = await message.channel.bulkDelete(amount, true);
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("🗑️  Mesajlar Temizlendi")
        .setDescription(">>> **" + deleted.size + " mesaj** başarıyla silindi.")
        .addFields({ name: "👮  Yetkili", value: "**" + message.author.tag + "**", inline: true })
        .setTimestamp();
      const reply = await message.channel.send({ embeds: [embed] });
      setTimeout(() => reply.delete().catch(() => {}), 4000);
    } catch (err) {
      return message.channel.send({ embeds: [errorEmbed("**Mesaj silme sırasında hata oluştu.**\n14 günden eski mesajlar toplu silinemez.")] });
    }
  }

  // ══════════════════════════════════════════════════════
  // YARDIM
  // ══════════════════════════════════════════════════════
  if (command === "yardım" || command === "yardim") {
    const embed = new EmbedBuilder()
      .setColor(0x7289da)
      .setAuthor({ name: client.user.tag + "  —  Komut Listesi", iconURL: client.user.displayAvatarURL() })
      .setTitle("📜  Tüm Komutlar")
      .setDescription("Prefix: **`*`**")
      .addFields(
        { name: "📖  Kur'an-ı Kerim", value: "**`*sure:ayet`** — Türkçe meal + Arapça\n> Örnek: `*2:255`" },
        { name: "📚  Kütübü Sitte", value: [
          "**`*buhari [no]`** — Sahih-i Buhari",
          "**`*muslim [no]`** — Sahih-i Muslim",
          "**`*ebudavud [no]`** — Ebu Davud",
          "**`*tirmizi [no]`** — Tirmizi",
          "**`*nesai [no]`** — Nesai",
          "**`*ibnmace [no]`** — İbn Mace",
          "> Örnek: `*buhari 1`"
        ].join("\n") },
        { name: "🔨  Ban", value: "**`*ban @kullanıcı [sebep]`**" },
        { name: "👢  Kick", value: "**`*kick @kullanıcı [sebep]`**" },
        { name: "🔇  Mute", value: "**`*mute @kullanıcı [Xgün] [Xsaat] [Xdakika] [sebep]`**\n> Örnek: `*mute @ali 1 gün 30 dakika spam`" },
        { name: "🔊  Unmute", value: "**`*unmute @kullanıcı`**" },
        { name: "🗑️  Temizle", value: "**`*temizle [sayı]`** — Maksimum 100 mesaj" }
      )
      .setFooter({ text: "İbni Java Bot  •  Tüm hakları saklıdır" })
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }
});

client.login(process.env.discordtoken);
              
