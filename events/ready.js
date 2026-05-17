const { Events, REST, Routes } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client, commandsData) {
        try {
            const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsData });
            console.log(`🐟 ${client.user.tag} tới chơi nè bbi`);
        } catch (error) {
            console.error('Lỗi khi đăng ký Slash Commands:', error);
        }
    }
};
