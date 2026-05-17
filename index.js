require('dotenv').config({ path: './data.env' });
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const AsciiTable = require('ascii-table');

const client = new Client({
    intents: [
         GatewayIntentBits.Guilds, 
         GatewayIntentBits.GuildMessages, 
         GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

client.game = {
    isRunning: false,
    channelId: null,
    lastWord: "",
    lastUserId: "",
    used: new Set()
};

try {
    const dict = require(path.join(__dirname, 'data', 'tu_dien.json'));
    client.dictLower = dict.map(w => w.trim().toLowerCase());
    console.log(`[SYSTEM] Đã tải từ điển with ${client.dictLower.length} từ.`);
} catch (err) {
    console.error('[ERROR] Không tìm thấy file data/tu_dien.json', err);
    process.exit(1);
}

const dbPath = path.join(__dirname, 'data', 'tk_cacon.json');
client.pointsDb = {};
if (fs.existsSync(dbPath)) {
    try { client.pointsDb = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } 
    catch (e) { console.error('[ERROR] Lỗi đọc file data/tk_cacon.json', e); }
}

client.savePointsDb = () => {
    try { fs.writeFileSync(dbPath, JSON.stringify(client.pointsDb, null, 2), 'utf8'); } 
    catch (e) { console.error('[ERROR] Không thể lưu vào file data/tk_cacon.json', e); }
};

const table = new AsciiTable('🐟 CATRE LOADER SYSTEM 🐟');
table.setHeading('File', 'Type', 'Status');

// load lệnh
const cmdData = [];
const cmdPath = path.join(__dirname, 'commands');

function scan(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scan(fullPath);
        } else if (file.endsWith('.js')) {
            const cmd = require(fullPath);

            if ('name' in cmd && 'execute' in cmd) {
                client.commands.set(cmd.name, cmd);
                cmdData.push({
                    name: cmd.name,
                    description: cmd.description,
                    options: cmd.options || []
                });
                table.addRow(file, 'Slash Command', '✔️ LOADED');
            } else {
                table.addRow(file, 'Slash Command', '❌ FAILED');
            }
        }
    }
}

scan(cmdPath);

// load event
const evPath = path.join(__dirname, 'events');
const evFiles = fs.readdirSync(evPath).filter(f => f.endsWith('.js'));

for (const file of evFiles) {
    const ev = require(path.join(evPath, file));
    if (ev.name) {
        if (ev.once) {
            client.once(ev.name, (...args) => ev.execute(...args, cmdData));
        } else {
            client.on(ev.name, (...args) => ev.execute(...args, client));
        }
        table.addRow(file, 'Client Event', '✔️ LOADED');
    } else {
        table.addRow(file, 'Client Event', '❌ FAILED');
    }
}

console.log(table.toString());
client.login(process.env.TOKEN);

//note 16/05/2026 | 22:24 viết bởi Yumetagari
//note 17/05/2026 | 10:45 sosa đã đặt chân đến đây
//note 17/05/2026 | 13:30 viết bởi Yumetagari
//note 17/05/2026 | 18:19 sosa dz so 1 the gioi