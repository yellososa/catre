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

let dictionary = [];
try {
    const dictPath = path.join(__dirname, 'tu_dien.json');
    dictionary = require(dictPath);
    console.log('Đã tải từ điển với ${dictionary.length} từ đã nạp.');
}
catch (err) {
    console.error('Không tìm thấy file tu_dien.json, vui lòng kiểm tra vị trí đặt file và tên file', err);
    process.exit(1);
}

//note 16/05/2026 | 22:24 viết bởi Yumetagari