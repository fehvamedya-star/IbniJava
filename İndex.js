const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
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

client.once("ready", () => {
  console.log("Bot aktif: " + client.user.tag);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const command = message.content.slice(PREFIX.length).trim();
  const match = command.match(/^(\d+):(\d+)$/);

  if (!match) {
    return message.reply("Gecersiz format! Dogru kullanim: *sure:ayet - Ornek: *2:255");
  }

  const sureNo = parseInt(match[1]);
  const ayetNo = parseInt(match[2]);

  if (sureNo < 1 || sureNo > 114) {
    return message.reply("Sure numarasi 1 ile 114 arasinda olmalidir.");
  }

  try {
    const turkceRes = await fetch(
      `https://api.alquran.cloud/v1/ayah/${sureNo}:${ayetNo}/tr.diyanet`
    );
    const turkceData = await turkceRes.json();

    const arabicRes = await fetch(
      `https://api.alquran.cloud/v1/ayah/${sureNo}:${ayetNo}/quran-uthmani`
    );
    const arabicData = await arabicRes.json();

    if (turkceData.status !== "OK" || arabicData.status !== "OK") {
      return message.reply("Ayet bulunamadi. Sure veya ayet numarasini kontrol et.");
    }

    const meal = turkceData.data.text;
    const arabic = arabicData.data.text;
    const sureName = SURE_NAMES[sureNo] || (sureNo + ". Sure");

    const embed = new EmbedBuilder()
      .setColor(0x1a6b3c)
      .setTitle("Kuran " + sureNo + ":" + ayetNo + " - " + sureName + " Suresi")
      .setDescription(meal)
      .addFields({ name: "Arapca", value: arabic })
      .setFooter({ text: "Kaynak: alquran.cloud" })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    message.reply("Bir hata olustu. Lutfen tekrar dene.");
  }
});

client.login(process.env.discordtoken);
          
