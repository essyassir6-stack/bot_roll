// ============================================
// DISCORD ROLE BUTTON BOT
// ============================================
// A clean, modular bot for role selection via buttons
// ============================================

const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

// ============================================
// ⚙️ CONFIGURATION SECTION - EDIT THESE VALUES
// ============================================

const CONFIG = {
    // Bot Token - Get from https://discord.com/developers/applications
    TOKEN: 'YOUR_BOT_TOKEN_HERE',
    
    // Server Information
    SERVER_NAME: 'GLORIA Community Xx',
    SERVER_IMAGE_URL: 'https://media.discordapp.net/attachments/1462437612647088335/1482006389843824670/content.png?ex=69ea1d81&is=69e8cc01&hm=21015af2b294f87326e9d8af60491dea3222bd78a38837ef84aee994d4d27688&=&format=webp&quality=lossless&width=1229&height=819'
    
    // Channel where the role selection message will be sent
    CHANNEL_ID: '1496523898211139625',
    
    // Role IDs - Map each game to its role ID
    // Format: 'Game Name': 'Role ID'
    ROLES: {
        'Minecraft': '1496522442489987132',
        'Valorant': '1496522515051319306',
        'League of Legends': '1496522601454108824',
        'Genshin Impact': '1496522689836482590',
        'Call of Duty': '1496522766701166775',
        'Fortnite': '1496522843851194490',
        'Apex Legends': '1496522885341249626',
        'Roblox': '1496522985253634098',
        'Among Us': '1496523061137244260',
        'Counter-Strike 2': '1496523141260775475',
    },
    
    // Optional: Custom emoji for each game (leave empty string for default)
    // Format: 'Game Name': 'emoji' or '' for default
    GAME_EMOJIS: {
        'Minecraft': '⛏️',
        'Valorant': '🎯',
        'League of Legends': '🏆',
        'Genshin Impact': '✨',
        'Call of Duty': '🔫',
        'Fortnite': '🪂',
        'Apex Legends': '🔥',
        'Roblox': '🧱',
        'Among Us': '👾',
        'Counter-Strike 2': '💣',
    },
    
    // Embed appearance settings
    EMBED: {
        COLOR: 0x5865F2,  // Discord blue - change to any color (use hex: 0xFF0000 for red)
        TITLE: '🎮 Game Roles',
        DESCRIPTION: 'Click any button below to get or remove a role for that game!\nYou can have multiple game roles at once.',
        FOOTER_TEXT: 'Click to toggle roles • One click = give/remove',
    }
};

// ============================================
// 🤖 BOT INITIALIZATION
// ============================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ]
});

// ============================================
// 📦 HELPER FUNCTIONS
// ============================================

/**
 * Creates button rows from the game roles configuration
 * Discord allows max 5 buttons per row, so this automatically splits them
 */
function createButtonRows() {
    const gameNames = Object.keys(CONFIG.ROLES);
    const rows = [];
    
    for (let i = 0; i < gameNames.length; i += 5) {
        const row = new ActionRowBuilder();
        const gamesInRow = gameNames.slice(i, i + 5);
        
        gamesInRow.forEach(gameName => {
            // Get custom emoji or use default game emoji
            const emoji = CONFIG.GAME_EMOJIS[gameName] || '🎮';
            
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`role_${gameName.replace(/\s+/g, '_')}`)
                    .setLabel(gameName)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(emoji)
            );
        });
        
        rows.push(row);
    }
    
    return rows;
}

/**
 * Creates the embed message with server branding
 */
function createEmbed() {
    const embed = new EmbedBuilder()
        .setTitle(CONFIG.EMBED.TITLE)
        .setDescription(CONFIG.EMBED.DESCRIPTION)
        .setColor(CONFIG.EMBED.COLOR)
        .setAuthor({
            name: CONFIG.SERVER_NAME,
            iconURL: CONFIG.SERVER_IMAGE_URL
        })
        .setThumbnail(CONFIG.SERVER_IMAGE_URL)
        .setFooter({ 
            text: `${CONFIG.SERVER_NAME} • ${CONFIG.EMBED.FOOTER_TEXT}`,
            iconURL: CONFIG.SERVER_IMAGE_URL
        })
        .setTimestamp();
    
    // Add role list as fields (optional - shows all available roles)
    const gameList = Object.keys(CONFIG.ROLES).map(game => `🎮 ${game}`).join('\n');
    embed.addFields({
        name: '📋 Available Games',
        value: gameList || 'No roles configured',
        inline: false
    });
    
    return embed;
}

// ============================================
// 🚀 BOT EVENT HANDLERS
// ============================================

client.once('ready', async () => {
    console.log(`✅ Bot is online!`);
    console.log(`📡 Logged in as: ${client.user.tag}`);
    console.log(`🎮 Server: ${CONFIG.SERVER_NAME}`);
    console.log(`📊 Loaded ${Object.keys(CONFIG.ROLES).length} game roles`);
    
    // Send the role selection message
    await sendRoleSelectionMessage();
});

/**
 * Sends or updates the role selection message in the configured channel
 */
async function sendRoleSelectionMessage() {
    try {
        const channel = client.channels.cache.get(CONFIG.CHANNEL_ID);
        
        if (!channel) {
            console.error(`❌ ERROR: Channel with ID "${CONFIG.CHANNEL_ID}" not found!`);
            console.error(`   Make sure the bot can see this channel and the ID is correct.`);
            return;
        }
        
        const embed = createEmbed();
        const buttonRows = createButtonRows();
        
        await channel.send({
            embeds: [embed],
            components: buttonRows
        });
        
        console.log(`✅ Role selection message sent to #${channel.name}`);
    } catch (error) {
        console.error(`❌ Failed to send message:`, error);
    }
}

/**
 * Handles button interactions (giving/removing roles)
 */
client.on('interactionCreate', async interaction => {
    // Only process button interactions
    if (!interaction.isButton()) return;
    
    // Only process our role buttons
    if (!interaction.customId.startsWith('role_')) return;
    
    // Extract game name from button ID
    const gameName = interaction.customId
        .replace('role_', '')
        .replace(/_/g, ' ');
    
    const roleId = CONFIG.ROLES[gameName];
    
    // Validate role exists in config
    if (!roleId) {
        await interaction.reply({
            content: `❌ Error: "${gameName}" is not configured properly. Please contact an admin.`,
            ephemeral: true
        });
        return;
    }
    
    const member = interaction.member;
    const role = interaction.guild.roles.cache.get(roleId);
    
    // Validate role exists in server
    if (!role) {
        await interaction.reply({
            content: `❌ Error: The role for "${gameName}" doesn't exist in this server!\nPlease ask an admin to check the role ID.`,
            ephemeral: true
        });
        return;
    }
    
    // Check bot permissions
    const botMember = interaction.guild.members.me;
    if (!botMember.permissions.has('ManageRoles')) {
        await interaction.reply({
            content: `❌ Error: I don't have permission to manage roles!\nPlease ask an admin to give me the "Manage Roles" permission.`,
            ephemeral: true
        });
        return;
    }
    
    // Check role hierarchy (bot's role must be above the target role)
    if (botMember.roles.highest.position <= role.position) {
        await interaction.reply({
            content: `❌ Error: My role is not high enough to manage the "${gameName}" role.\nPlease move my role above the game roles in server settings.`,
            ephemeral: true
        });
        return;
    }
    
    // Toggle the role
    const hasRole = member.roles.cache.has(roleId);
    const emoji = CONFIG.GAME_EMOJIS[gameName] || '🎮';
    
    try {
        if (hasRole) {
            // Remove role
            await member.roles.remove(role);
            await interaction.reply({
                content: `${emoji} Removed **${gameName}** role from you!`,
                ephemeral: true
            });
            console.log(`📤 Removed ${gameName} role from ${member.user.tag}`);
        } else {
            // Add role
            await member.roles.add(role);
            await interaction.reply({
                content: `${emoji} Added **${gameName}** role to you!`,
                ephemeral: true
            });
            console.log(`📥 Added ${gameName} role to ${member.user.tag}`);
        }
    } catch (error) {
        console.error(`❌ Role toggle error:`, error);
        await interaction.reply({
            content: `❌ Something went wrong while trying to ${hasRole ? 'remove' : 'add'} the role.\nPlease try again or contact an admin.`,
            ephemeral: true
        });
    }
});

// ============================================
// 🔌 ERROR HANDLING
// ============================================

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

client.on('error', (error) => {
    console.error('Discord client error:', error);
});

// ============================================
// 🎬 START THE BOT
// ============================================

client.login(CONFIG.TOKEN).catch(error => {
    console.error('❌ Failed to login! Check your bot token:', error.message);
});
