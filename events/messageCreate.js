const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (!client.game.isRunning || message.author.bot || message.channel.id !== client.game.channelId) return;

        const word = message.content.trim().toLowerCase();
        const prevArr = client.game.lastWord.split(' ');
        const currArr = word.split(' ');
        const lastToken = prevArr[prevArr.length - 1];

        const triggerError = async (replyText) => {
            await message.react('❌');
            const reply = await message.reply(replyText);
            setTimeout(() => {
                reply.delete().catch(() => {});
                message.delete().catch(() => {});
            }, 5000);
        };

        if (message.author.id === client.game.lastUserId) return triggerError("Có phải lượt của mình không mà nối?");
        if (client.game.used.has(word)) return triggerError("Từ này bị cá khác đớp mất rồi bạn ơi!");
        if (!client.dictLower.includes(word)) return triggerError(`Từ **"${word}"** không có trong từ điển của tui`);
        if (currArr[0] !== lastToken) return triggerError(`Sai luật! Phải nối tiếp bằng từ bắt đầu bằng chữ **"${lastToken}"**. `);

        client.game.used.add(word);

        const username = message.author.username;
        client.pointsDb[username] = (client.pointsDb[username] || 0) + 1;
        client.savePointsDb();

        const nextToken = currArr[currArr.length - 1];
        const canContinue = client.dictLower.some(w => !client.game.used.has(w) && w.split(' ')[0] === nextToken);

        if (!canContinue) {
            client.game.isRunning = false;
            await message.react('🏆');

            const embed = new EmbedBuilder()
                .setTitle('💔 Thua Rồi Mấy Con Vợ Ơi')
                .setDescription(`Chúc mừng **<@${message.author.id}>** đã thắng ván này với từ **"${word.toUpperCase()}"**!\n\nKhông còn từ nào trong từ điển bắt đầu bằng từ **"${nextToken}"** để nối tiếp nữa rồi. Hãy gõ \`/noi-tu\` để chơi lại nha! 🥳`)
                .setColor(process.env.COLOR);

            return message.reply({ embeds: [embed] });
        }

        client.game.lastWord = word;
        client.game.lastUserId = message.author.id;
        await message.react('✅');
    }
};
