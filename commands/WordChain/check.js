module.exports = {
    name: 'check',
    description: 'Kiểm tra từ trong từ điển của bot',
    options: [{ name: 'word', type: 3, description: 'Từ cần kiểm tra', required: true }],
    async execute(interaction) {
        const word = interaction.options.getString('word').trim().toLowerCase();
        const isExist = interaction.client.dictLower.includes(word);
        
        return interaction.reply(isExist ? `✅ Từ **"${word}"** **ĐÃ CÓ** trong từ điển rồi nhé!` : `❌ Từ **"${word}"** **CHƯA CÓ** trong từ điển.`);
    }
};
