const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cacon',
    description: 'Kiểm tra số tảo trong tài khoản cá con của bn',
    async execute(interaction) {
        const username = interaction.user.username;
        const currentPoints = interaction.client.pointsDb[username] || 0;

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`<:cacon:1505440896663949373> **Tài khoản cá con của bn**\n\nSố tảo hiện tại: **${currentPoints}** <:tao:1505440902737301574>`)
            .setImage('https://i.postimg.cc/qqg10hPH/banner.jpg')
            .setColor(process.env.COLOR)
            .setFooter({ text: 'Chăm chỉ nối từ để kiếm thêm tảo nhé!' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
