const labels = {
    in_menu: ['In main menu', 'В главном меню'],
    level_short: ['Lvl. ', 'Ур. '],
    item_aegis: ['HAEGIS'],
    spectate: ['Spectating', 'Наблюдает за игрой'],
    DOTA_GAMERULES_STATE_INIT: ['INIT', 'Инициализация',],
    DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD: ['Waiting for players...', 'Ожидание игроков',],
    DOTA_GAMERULES_STATE_CUSTOM_GAME_SETUP: ['Setting up custom game', 'Настраивает свою игру.',],
    DOTA_GAMERULES_STATE_HERO_SELECTION: ['Selecting hero', 'Выбирает героя',],
    DOTA_GAMERULES_STATE_STRATEGY_TIME: ['Strategy time', 'Обсуждение стратегии',],
    DOTA_GAMERULES_STATE_TEAM_SHOWCASE: ['Starting', 'Начало игры',],
    DOTA_GAMERULES_STATE_WAIT_FOR_MAP_TO_LOAD: ['WAIT_FOR_MAP_TO_LOAD', 'Загружается на карту',],
    DOTA_GAMERULES_STATE_PRE_GAME: ['Pre-game', 'Начало игры',],
    DOTA_GAMERULES_STATE_SCENARIO_SETUP: ['SCENARIO_SETUP', 'DOTA_GAMERULES_STATE_SCENARIO_SETUP',],
    DOTA_GAMERULES_STATE_GAME_IN_PROGRESS: ['Playing', 'Играет',],
    DOTA_GAMERULES_STATE_POST_GAME: ['Game end', 'Окончание игры',],
    DOTA_GAMERULES_STATE_DISCONNECT: ['Disconnected', 'Отключен'],
}

const stateImage = {
    DOTA_GAMERULES_STATE_STRATEGY_TIME: 'https://github.com/GovnocodedByChapo/d2drp-dota2-discord-rich-presence/blob/main/heroes/map.webp?raw=true',
    DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD: 'https://github.com/GovnocodedByChapo/d2drp-dota2-discord-rich-presence/blob/main/heroes/wait.gif?raw=true',
    DOTA_GAMERULES_STATE_INIT: 'https://github.com/GovnocodedByChapo/d2drp-dota2-discord-rich-presence/blob/main/heroes/wait.gif?raw=true',
    DOTA_GAMERULES_STATE_WAIT_FOR_MAP_TO_LOAD: 'https://github.com/GovnocodedByChapo/d2drp-dota2-discord-rich-presence/blob/main/heroes/wait.gif?raw=true',
    DOTA_GAMERULES_STATE_HERO_SELECTION: 'https://github.com/GovnocodedByChapo/d2drp-dota2-discord-rich-presence/blob/main/heroes/wait.gif?raw=true',
    DOTA_GAMERULES_STATE_POST_GAME: 'https://github.com/GovnocodedByChapo/d2drp-dota2-discord-rich-presence/blob/main/heroes/finish.jpg?raw=true'
}

const getHeroName = id => id.match(/^npc_dota_hero_(?<name>.+)/)?.groups?.name?.split('_')?.map(v => v[0].toUpperCase() + v.slice(1))?.join(' ') ?? null;
const getItemName = id => id.match(/^item_(?<name>.+)/)?.groups?.name?.split('_')?.map(v => v[0].toUpperCase() + v.slice(1))?.join(' ') ?? null;
const label = (param, lang = 1) => labels[param][lang] ?? `?${param}`
const getHeroImage = async (heroName) => {
    const heroIconUrl = `https://github.com/GovnocodedByChapo/dota2-discord-rich-presence/blob/main/heroes/${heroName}.gif?raw=true`;
    const response = await fetch(heroIconUrl);
    return (await response.status == 200 ? heroIconUrl : 'https://github.com/GovnocodedByChapo/d2drp-dota2-discord-rich-presence/blob/main/heroes/questionmark.jpg?raw=true')
}

const getInventoryItems = (inventory, normalName = false) => {
    const items = [];
    for (const item of Object.keys(inventory)) {
        const itemName = inventory[item].name;
        if (itemName != 'item_tpscroll' && itemName != 'empty')
            items.push(normalName ? getItemName(itemName) : itemName);
    }
    return items;
}
const isItemInInventory = (itemName, inventory) => {
    if (!inventory || !itemName) return false;
    return getInventoryItems(inventory).includes(itemName);
}




const generateActivity = async (data, langIndex = 1) => {
    console.log(data)
    if (!data) return false;

    if (!data.map) return false /*{
        details: label('in_menu', langIndex),
        largeImageKey: `https://cdn.discordapp.com/app-icons/356875988589740042/6b4b3fa4c83555d3008de69d33a60588`,
        largeImageText: 'D2DRPC by chapo',
    };*/

    if (data.player) {
        console.log(typeof(data.player))
        if (!data.player.steamid) return {
            details: label('spectate', langIndex),
            state: data.map.customgamename ? `"${data.map.customgamename}"` : undefined,
            largeImageKey: 'https://cdn.discordapp.com/app-icons/356875988589740042/6b4b3fa4c83555d3008de69d33a60588',
            startTimestamp: Date.now() - (data.map.clock_time * 1000),
            smallImageKey: 'https://github.com/GovnocodedByChapo/dota2-discord-rich-presence/blob/main/heroes/ward.jpg?raw=true'
        };
        if (data.hero && (data.map.game_state == 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS' || data.map.game_state == 'DOTA_GAMERULES_STATE_PRE_GAME')) {
            const heroImage = await getHeroImage(data.hero.name);
            const inventoryItems = getInventoryItems(data.items ?? {}, true).join(', ');
            return {
                details: `${getHeroName(data.hero.name ?? 'unknown')} (${label('level_short', langIndex)} ${data.hero.level})`,
                state: `${data.player.kills} / ${data.player.deaths} / ${data.player.assists}`,
                largeImageKey: heroImage,
                largeImageText: inventoryItems.length >= 3 ? inventoryItems.substring(0, 127) : undefined,
                smallImageKey: 'https://cdn.discordapp.com/app-icons/356875988589740042/6b4b3fa4c83555d3008de69d33a60588',
                smallImageText: 'D2DRPC by chapo',
                startTimestamp: Date.now() - (data.map.clock_time * 1000),
            };
        }
    }
    
    return {
        details: label([data.map.game_state], langIndex),
        largeImageKey: stateImage[data.map.game_state] ?? `https://cdn.discordapp.com/app-icons/356875988589740042/6b4b3fa4c83555d3008de69d33a60588`,
        largeImageText: 'D2DRPC by chapo',
        startTimestamp: Date.now() - (data.map.clock_time * 1000),
    };
}

module.exports = generateActivity;