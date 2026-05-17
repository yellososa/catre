require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    Events, 
    REST, 
    Routes, 
    EmbedBuilder, 
    MessageFlags 
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const client = new Client({
    intents: [
         GatewayIntentBits.Guilds, 
         GatewayIntentBits.GuildMessages, 
         GatewayIntentBits.MessageContent
]
});

let dictionary = [];
try {
    const dictPath = path.join(__dirname, 'tu_dien.json');
    dictionary = require(dictPath);
    console.log(`Đã tải từ điển với ${dictionary.length} từ đã nạp.`);
}
catch (err) {
    console.error('Không tìm thấy file tu_dien.json, vui lòng kiểm tra vị trí đặt file và tên file', err);
    process.exit(1);
}

const dictLower = dictionary.map(w => w.trim().toLowerCase());

let game = {
    isRunning: false,
    channelId: null,
    lastWord: "",
    lastUserId: "",
    used: new Set()
};

const commands = [
    { 
        name: 'noi-tu', 
        description: 'Bắt đầu một trận game nối từ mới!' 
    },
    { 
        name: 'check', 
        description: 'Kiểm tra từ trong từ điển của bot', 
        options: [{ name: 'word', type: 3, description: 'Từ cần kiểm tra', required: true }] 
    }
];

client.once(Events.ClientReady, async () => {
    try {
        const rest = new REST({ version: '10' }).setToken(TOKEN);
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`🐟 ${client.user.tag} tới chơi nè bbi`);
    } catch (error) {
        console.error('Lỗi khi đăng ký Slash Commands:', error);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, channelId, options } = interaction;

    if (commandName === 'noi-tu') {
        const randomWord = dictLower[Math.floor(Math.random() * dictLower.length)];
        
        game = {
            isRunning: true,
            channelId: channelId,
            lastWord: randomWord,
            lastUserId: "",
            used: new Set([randomWord])
        };

        const embed = new EmbedBuilder()
            .setTitle('Nối Từ Nào 🫰🏻')
            .setDescription(`Halo! Từ bạn cần nối là: **${randomWord.toUpperCase()}**\n\nSau khi nói, vui lòng chờ những bạn khác nối tiếp nhé!`);

        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'check') {
        const word = options.getString('word').trim().toLowerCase();
        const isExist = dictLower.includes(word);

        return interaction.reply(
            isExist 
                ? `✅ Từ **"${word}"** **ĐÃ CÓ** trong từ điển rồi nhé!` 
                : `❌ Từ **"${word}"** **CHƯA CÓ** trong từ điển.`
        );
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (!game.isRunning || message.author.bot || message.channel.id !== game.channelId) return;

    const word = message.content.trim().toLowerCase();
    const prevArr = game.lastWord.split(' ');
    const currArr = word.split(' ');
    const lastToken = prevArr[prevArr.length - 1];

    // kiểm tra có trùng người nối từ trước không
    if (message.author.id === game.lastUserId) {
        await message.react('❌');
        const reply = await message.reply("Có phải lượt của mình không mà nối?");
        setTimeout(() => {
            reply.delete().catch(() => {});
            message.delete().catch(() => {});
        }, 5000);
        return;
    }

    // kiểm tra từ đã dùng chưa
    if (game.used.has(word)) {
        await message.react('❌');
        const reply = await message.reply("Từ này lượt này dùng mất rồi bạn ơi!");
        setTimeout(() => {
            reply.delete().catch(() => {});
            message.delete().catch(() => {});
        }, 5000);
        return;
    }

    // kiểm tra từ có trong từ điển không
    if (!dictLower.includes(word)) {
        await message.react('❌');
        const reply = await message.reply(`Từ **"${word}"** không có trong từ điển của tui`);
        setTimeout(() => {
            reply.delete().catch(() => {});
            message.delete().catch(() => {});
        }, 5000);
        return;
    }

    // kiểm tra đúng từ không
    if (currArr[0] !== lastToken) {
        await message.react('❌');
        const reply = await message.reply(`Sai luật! Phải nối tiếp bằng từ bắt đầu bằng chữ **"${lastToken}"**. `);
        setTimeout(() => {
            reply.delete().catch(() => {});
            message.delete().catch(() => {});
        }, 5000);
        return;
    }

    game.used.add(word);

    const nextToken = currArr[currArr.length - 1];
    const canContinue = dictLower.some(w => !game.used.has(w) && w.split(' ')[0] === nextToken);

    if (!canContinue) {
        game.isRunning = false;
        await message.react('🏆');

        const embed = new EmbedBuilder()
            .setTitle('💔 Thua Rồi Mấy Con Vợ Ơi')
            .setDescription(`Chúc mừng **<@${message.author.id}>** đã thắng ván này với từ **"${word.toUpperCase()}"**!\n\nKhông còn từ nào trong hệ thống bắt đầu bằng từ **"${nextToken}"** để nối tiếp nữa rồi. Hãy gõ \`/noi-tu\` để chơi lại nha! 🥳`);

        return message.reply({ embeds: [embed] });
    }

    game.lastWord = word;
    game.lastUserId = message.author.id;
    await message.react('✅');
});

client.login(TOKEN);
//note 16/05/2026 | 22:24 viết bởi Yumetagari
//note 17/05/2026 | 10:45 sosa đã đặt chân đến đây
