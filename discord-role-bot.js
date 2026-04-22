const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

const CONFIG = {
  TOKEN: process.env.TOKEN,

  SERVER_NAME: 'GLORIA Community Xx',
  SERVER_IMAGE_URL: 'https://media.discordapp.net/attachments/1462437612647088335/1482006389843824670/content.png',

  CHANNEL_ID: '1496523898211139625',

  ROLES: {
    '⛏️ Minecraft': '1496522442489987132',
    '🎯 Valorant': '1496522515051319306',
    '🏆 League of Legends': '1496522601454108824',
    '✨ Genshin Impact': '1496522689836482590',
    '🔫 Call of Duty': '1496522766701166775',
    '🪂 Fortnite': '1496522843851194490',
    '🔥 Apex Legends': '1496522885341249626',
    '🧱 Roblox': '1496522985253634098',
    '👾 Among Us': '1496523061137244260',
    '💣 Counter-Strike 2': '1496523141260775475'
  }
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const channel = await client.channels.fetch(CONFIG.CHANNEL_ID).catch(() => null);
  if (!channel) return console.log("❌ Channel not found");

  // 🔥 Embed كبير واحترافي
  const embed = new EmbedBuilder()
    .setTitle(`🔥 ${CONFIG.SERVER_NAME}`)
    .setDescription(`
🎮 **Choose your games below**

> Click a button to **get/remove** your role
    `)
    .setColor(0xFF0000)
    .setImage(CONFIG.SERVER_IMAGE_URL) // 👈 صورة كبيرة
    .setThumbnail(CONFIG.SERVER_IMAGE_URL) // 👈 صغيرة فوق
    .setFooter({ text: "GLORIA Community • Role System" });

  const games = Object.keys(CONFIG.ROLES);
  const rows = [];

  for (let i = 0; i < games.length; i += 5) {
    const row = new ActionRowBuilder();

    games.slice(i, i + 5).forEach(game => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`role_${game}`)
          .setLabel(game)
          .setStyle(ButtonStyle.Danger) // 🔥 لون أحمر
      );
    });

    rows.push(row);
  }

  await channel.send({
    embeds: [embed],
    components: rows
  });
});

// 🎮 system ديال roles
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (!interaction.customId.startsWith('role_')) return;

  const game = interaction.customId.replace('role_', '');
  const roleId = CONFIG.ROLES[game];

  const role = interaction.guild.roles.cache.get(roleId);
  const member = interaction.member;

  if (!role) {
    return interaction.reply({ content: "❌ Role not found", ephemeral: true });
  }

  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(role);
      await interaction.reply({ content: `❌ Removed ${game}`, ephemeral: true });
    } else {
      await member.roles.add(role);
      await interaction.reply({ content: `✅ Added ${game}`, ephemeral: true });
    }
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "❌ Error", ephemeral: true });
  }
});

client.login(CONFIG.TOKEN);
