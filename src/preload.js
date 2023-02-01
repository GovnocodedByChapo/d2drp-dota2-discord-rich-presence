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
    appendLog('Client connected!')
});
setInterval(async () => {
    clients.forEach(async (client, index) => {
        const activity = await activityHandler(client?.gamestate, 1);
        if (activity) {
            activity.buttons = getButtons();
            rpc.setActivity(activity);
            lastUpdateTime = Date.now();
            appendLog('Info updated!');
        } else {
            rpc.clearActivity();
            appendLog('Info cleared (main menu)!');
        }
    });
    if (lastUpdateTime + (loopDelay * 2) - Date.now() <= 0) {
        rpc.clearActivity();
        //console.log('activity cleared!')
        appendLog('Waiting for Dota 2...');
    }
}, loopDelay)

const urlRegex = require('url-regex');
const isUrlValid = (url) => urlRegex().test(url)//url.match(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/) != null

const getButtons = () => {
    const buttons = [
        {label: document.getElementById('button1label').value, url: document.getElementById('button1url').value},
        {label: document.getElementById('button2label').value, url: document.getElementById('button2url').value}
    ].filter(v => v.label.length > 1 && isUrlValid(v.url))
    return (document.getElementById('showButtons').checked && buttons.length > 0) ? buttons : undefined;
}

const path = require('path');
const { openJson } = require('reactive-json-file')
let settings = openJson(path.join(__dirname, 'd2drpc_buttons_config.json'), {default: {
    showButtons: false,
    buttons: [
        {label: 'Open Google', url: 'https://google.com'},
        {label: 'Open GitHub', url: 'https://github.com'},
    ]
}})

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('_version').textContent += updateSystem.VERSION;
    document.getElementById('showButtons').checked = settings.showButtons;
    document.getElementById('button1label').value = settings.buttons[0].label;
    document.getElementById('button2label').value = settings.buttons[1].label;
    document.getElementById('button1url').value = settings.buttons[0].url;
    document.getElementById('button2url').value = settings.buttons[1].url;
    document.getElementById('saveButtons').addEventListener('click', () => {
        settings.showButtons = document.getElementById('showButtons').checked;
        settings.buttons[0].label = document.getElementById('button1label').value;
        settings.buttons[1].label = document.getElementById('button2label').value;
        settings.buttons[0].url = document.getElementById('button1url').value;
        settings.buttons[1].url = document.getElementById('button2url').value;
    })
})