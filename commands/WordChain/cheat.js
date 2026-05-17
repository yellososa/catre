const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'cheat',
    description: 'Dùng 5 tảo từ tài khoản CÁ CON để nhận gợi ý từ nối từ Catre',
    async execute(interaction) {
        const { client } = interaction;
        
        if (!client.game.isRunning) {
            return interaction.reply({ content: 'Chỉ dùng đc trong trận thôi bn ơi!', ephemeral: true });
        }

        const username = interaction.user.username;
        const currentPoints = client.pointsDb[username] || 0;

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
                if (!client.game.isRunning) return confirmation.update({ content: '<:ok:1505440900866768917> Hết trận r bn ơi!', components: [] });
                if ((client.pointsDb[username] || 0) < 5) return confirmation.update({ content: 'hmp, <:die:1505444724243431545> tk cá con không đủ 5 tảo <:tao:1505440902737301574>!', components: [] });

                const prevArr = client.game.lastWord.split(' ');
                const lastToken = prevArr[prevArr.length - 1];
                const validWords = client.dictLower.filter(w => !client.game.used.has(w) && w.split(' ')[0] === lastToken);

                if (validWords.length === 0) {
                    return confirmation.update({ content: '<:huh:1505440898664628327> Catre tìm đỏ mắt không thấy từ nào hợp lệ tiếp theo để gợi ý cả!', components: [] });
                }

                const hintWord = validWords[Math.floor(Math.random() * validWords.length)];
                client.pointsDb[username] -= 5;
                client.savePointsDb();

                await confirmation.update({
                    content: `Catre đã đớp 5 tảo <:tao:1505440902737301574> có trong tk cá con của bn và để lại môt mẫu giấy bí ẩn trước khi rời đi <:catre_chibi:1505444722196611122>💨!\n\n📜 **${hintWord.toUpperCase()}**`,
                    components: []
                });

            } else if (confirmation.customId === 'cheat_no') {
                await confirmation.update({ content: 'Đã từ chối và giữ lại 5 tảo <:tao:1505440902737301574>! Trận này t tự bơi ko cần giúp', components: [] });
            }
        } catch (e) {
            await interaction.editReply({ content: 'Lâu quá! <:catre_chibi:1505444722196611122>💨 Catre đã bơi đi mất rồi babi.', components: [] }).catch(() => {});
        }
    }
};
