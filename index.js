require('dotenv').config({ path: './data.env' });
const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    Events, 
    REST, 
    Routes, 
    EmbedBuilder, 
    MessageFlags,
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
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

const dbPath = path.join(__dirname, 'tk_cacon.json'); //bro đổi tên file thì nhớ đổi cái này nha!
let pointsDb = {};
if (fs.existsSync(dbPath)) {
    try {
        pointsDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (err) {
        console.error('Lỗi đọc file `tk_cacon.json`, check lại vị trí và tên file:', err); 
        pointsDb = {};
    }
}

function savePointsDb() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(pointsDb, null, 2), 'utf8');
    } catch (err) {
        console.error('Không thể lưu tảo vào file tk_cacon.json:', err);
    }
}

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
    },
    {
        name: 'cheat',
        description: 'Dùng 5 tảo từ tài khoản CÁ CON để nhận gợi ý từ nối từ Catre'
    },
    { 
        name: 'cacon', 
        description: 'Kiểm tra số tảo trong tài khoản cá con của bn' 
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
            .setDescription(`Halo! Từ bạn cần nối là: **${randomWord.toUpperCase()}**\n\nSau khi Nối, vui lòng chờ những bạn khác nối tiếp nhé! Mỗi lần nối đúng sẽ tự cộng thêm <:tao:1505440902737301574> 1 tảo vào <:cacon:1505440896663949373> tk cá con của bn`);

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

    if (commandName === 'cheat') {
        if (!game.isRunning) {
            return interaction.reply({ content: 'Chỉ dùng đc trong trận thôi bn ơi!', ephemeral: true });
        }

        const username = interaction.user.username;
        const currentPoints = pointsDb[username] || 0;

        if (currentPoints < 5) {
            return interaction.reply({ 
                content: `Tài khoản cá con hiện tại chỉ có **${currentPoints}** tảo <:tao:1505440902737301574>!\n\nCần ít nhất **5** tảo <:tao:1505440902737301574> để nhận đc gợi ý từ <:catre_chibi:1505444722196611122> Catre nha!`, 
                ephemeral: true 
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('cheat_yes').setLabel('Có').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('cheat_no').setLabel('Không').setStyle(ButtonStyle.Danger)
        );

        const response = await interaction.reply({
            content: `Bn có muốn trả 5 tảo <:tao:1505440902737301574> để đổi 1 gợi ý? (<:cacon:1505440896663949373> Tk cá con của bn: **${currentPoints}** :coral:)`,
            components: [row],
            ephemeral: true
        });

        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 15000 });

            if (confirmation.customId === 'cheat_yes') {
                if (!game.isRunning) {
                    return confirmation.update({ content: '<:ok:1505440900866768917> Hết trận r bn ơi!', components: [] });
                }

                if ((pointsDb[username] || 0) < 5) {
                    return confirmation.update({ content: 'hmp, <:die:1505444724243431545> tk cá con không đủ 5 tảo <:tao:1505440902737301574>!', components: [] });
                }

                const prevArr = game.lastWord.split(' ');
                const lastToken = prevArr[prevArr.length - 1];
                const validWords = dictLower.filter(w => !game.used.has(w) && w.split(' ')[0] === lastToken);

                if (validWords.length === 0) {
                    return confirmation.update({ content: '<:huh:1505440898664628327> Catre tìm đỏ mắt không thấy từ nào hợp lệ tiếp theo để gợi ý cả!', components: [] });
                }

                const hintWord = validWords[Math.floor(Math.random() * validWords.length)];
                pointsDb[username] -= 5;
                savePointsDb();

                await confirmation.update({
                    content: `Catre đã đớp 5 tảo <:tao:1505440902737301574> có trong tk cá con của bn và để lại môt mẫu giấy bí ẩn trước khi rời đi <:catre_chibi:1505444722196611122>💨!\n\n📜 **${hintWord.toUpperCase()}**`,
                    components: []
                });

            } else if (confirmation.customId === 'cheat_no') {
                await confirmation.update({ content: 'Đã từ chối và giữ lại 5 tảo <:tao:1505440902737301574>! Trận này t tự bơi ko cần giúp', components: [] });
            }
        } catch (e) {
            // Hết 15s không phản hồi
            await interaction.editReply({ content: 'Lâu quá! <:catre_chibi:1505444722196611122>💨 Catre đã bơi đi mất rồi babi.', components: [] }).catch(() => {});
        }
    }

    if (commandName === 'cacon') {
        const username = interaction.user.username;
        const currentPoints = pointsDb[username] || 0;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`<:cacon:1505440896663949373> **Tài khoản cá con của bn**\n\nSố tảo hiện tại: **${currentPoints}** <:tao:1505440902737301574>`)
            .setImage('https://i.postimg.cc/qqg10hPH/banner.jpg')  //
            .setColor(0x00AE86)
            .setFooter({ text: 'Chăm chỉ nối từ để kiếm thêm tảo nhé!' });

        return interaction.reply({ embeds: [embed], ephemeral: true });
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
        const reply = await message.reply("Từ này bị cá khác đớp mất rồi bạn ơi!");
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

    // --- NỐI TỪ THÀNH CÔNG ---
    game.used.add(word);

    const username = message.author.username;
    pointsDb[username] = (pointsDb[username] || 0) + 1; //cộng tảo cho username có gtrị hiện tại là 1, ní có thể chỉnh.
    savePointsDb();

    const nextToken = currArr[currArr.length - 1];
    const canContinue = dictLower.some(w => !game.used.has(w) && w.split(' ')[0] === nextToken);

    if (!canContinue) {
        game.isRunning = false;
        await message.react('🏆');

        const embed = new EmbedBuilder()
            .setTitle('💔 Thua Rồi Mấy Con Vợ Ơi')
            .setDescription(`Chúc mừng **<@${message.author.id}>** đã thắng ván này với từ **"${word.toUpperCase()}"**!\n\nKhông còn từ nào trong từ điển bắt đầu bằng từ **"${nextToken}"** để nối tiếp nữa rồi. Hãy gõ \`/noi-tu\` để chơi lại nha! 🥳`);

        return message.reply({ embeds: [embed] });
    }

    game.lastWord = word;
    game.lastUserId = message.author.id;
    await message.react('✅');
});

client.login(TOKEN);
//note 16/05/2026 | 22:24 viết bởi Yumetagari
//note 17/05/2026 | 10:45 sosa đã đặt chân đến đây
//note 17/05/2026 | 13:30 viết bởi Yumetagari