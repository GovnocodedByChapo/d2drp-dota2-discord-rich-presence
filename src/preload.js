const appendLog = (text) => {
    console.log(text)
    const log = document.getElementById('rpcLog')
    if (log) log.value += `\n${text}`
}

appendLog('Program started.')
let loopDelay = 5000; // MS
let lastUpdateTime = Date.now();
let activity = {
    hero: 'Loading info...',
    heroFullName: 'Loading info...',
    lvl: 0,
    kda: [ 0, 0, 0 ],
    start: new Date(),
    steamId: ''
};

const updateSystem = require('./update.js')
const getHeroName = id => id.match(/^npc_dota_hero_(?<name>.+)/)?.groups?.name?.split('_')?.map(v => v[0].toUpperCase() + v.slice(1))?.join(' ') ?? null;
const d2gsi = require("dota2-gsi");
const server = new d2gsi();
const clients = [];

const activityHandler = require('./activityHandler.js')
const RPC = require("discord-rpc");
const rpc = new RPC.Client({ transport: "ipc" });
rpc.login({ clientId: '751932819676332042' });
rpc.on('ready', () => {
    console.log('updating drpc...');
})

const VERSION = 0;

server.events.on('newclient', (client) => { 
    clients.push(client) 
    console.log(client) 
    appendLog('newclient')
});
setInterval(() => {
    clients.forEach(function(client, index) {
        appendLog(client)
        rpc.setActivity(activityHandler(client?.gamestate, 1))
        lastUpdateTime = Date.now()
        appendLog('Info updated!')
    });
    if (lastUpdateTime + (loopDelay * 2) - Date.now() <= 0) {
        rpc.clearActivity()
        //console.log('activity cleared!')
        appendLog('Waiting for Dota 2...')
    }
}, loopDelay)




window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('_version').textContent += updateSystem.VERSION;
})