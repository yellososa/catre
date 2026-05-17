const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'noi-tu',
    description: 'Bắt đầu một trận game nối từ mới!',
    async execute(interaction) {
        const { client } = interaction;
        const randomWord = client.dictLower[Math.floor(Math.random() * client.dictLower.length)];
        
        client.game.isRunning = true;
        client.game.channelId = interaction.channelId;
        client.game.lastWord = randomWord;
        client.game.lastUserId = "";
        client.game.used = new Set([randomWord]);

        const userAvatar = interaction.user.displayAvatarURL({ dynamic: true });
        const serverIcon = interaction.guild.iconURL({ dynamic: true }) || userAvatar;

        const embed = new EmbedBuilder()
            .setAuthor({ name: "🫰🏻 Nối Từ Nào !", iconURL: serverIcon })
            .setDescription(`> Halo! Từ bạn cần nối là: __**${randomWord.toUpperCase()}**__\n\n> 📍 Sau khi Nối, vui lòng chờ những bạn khác nối tiếp nhé! Mỗi lần nối đúng sẽ tự cộng thêm <:tao:1505440902737301574> 1 tảo vào <:cacon:1505440896663949373> tài khoản cá con của bạn đó >_<`)
            .setColor(process.env.COLOR)
            .setFooter({ text: `${interaction.user.username}`, iconURL: userAvatar })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
