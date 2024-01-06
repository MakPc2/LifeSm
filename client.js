// Константы
const SAVE = [
    [ "IsDeath", false ], [ "Hp", 100 ]
],
PROPS = Properties.GetContext(),
MSGS_LOADER = ["<b>Загрузка...</b>", "Читайте инструкцию!", "Что ты тут забыл?"]

// Созданик команд
Teams.Add("Blue", "Blue", { b: 1 });
var blueTeam = Teams.Get("Blue");
blueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
blueTeam.Spawns.SpawnPointsGroups.Add(1);

// Выключаем инвентарь
["Main", "Secondary", "Build", "Explosive"].forEach(function(weapon) {
    Inventory.GetContext()[weapon].Value = false;
});

// Вход в команду при заходе на сервер
Teams.OnRequestJoinTeam.Add(function(p, t) { t.add(p); });

Players.OnPlayerConnected.Add(function(p) {
    outp(p);
    
    let prop = p.Properties;
    if (prop.Get("IsDeath").Value) return ban(p);
    
    // Спец - значения
    p.contextedProperties.MaxHp.Value = prop.Get("Hp").Value || 10;
    
    p.Timers.Get("Respawn").RestartLoop(1);
    p.Ui.Hint.Value = "Opsss...";
});

Teams.OnPlayerChangeTeam.Add(function(p) { 
    if (p.Properties.Get("IsDeath").Value) return;
    p.Spawns.Spawn(); 
});

// Слхраняемся
Players.OnPlayerDisconnected.Add(function(p) {
    save(p);
    
    // Спец значения
    let prop = p.Properties;
});

// Баним игрока при смерти
Damage.OnDeath.Add(function(p) { ban(p); });

function ban(p) {
    p.Properties.Get("IsDeath").Value = true;
    p.Spawns.Spawn();
    p.Spawns.Despawn();
}

// Счетчик Hp
Damage.OnDamage.Add(function(p, p2, dmg) {
    p.Properties.Get("Hp").Value -= Math.ceil(dmg);
});

// Таймеры
Timers.OnPlayerTimer.Add(function(t) {
    let p = t.Player, id = t.Id, prop = p.Properties;
    
    if (id == "Respawn") {
        prop.Get("Respawn-indx").Value += 1;
        if (prop.Get("Respawn-indx").Value > 10) {
            blueTeam.add(p);
            return t.Stop();
        }
        
        p.Ui.Hint.Value = ("<b>Загрузка...</b>"
            + MSGS_LOADER[Math.floor(Math.random() * MSGS_LOADER.length)]);
    }
});

// Сохранение данных на сервер
function save(p) {
    SAVE.forEach(function(el) {
        PROPS.Get(el[0] + p.Id).Value = p.Properties.Get(el[0]).Value || el[1];
    });
}

// Вывод данных в игрока
function outp(p) {
    SAVE.forEach(function(el) {
        p.Properties.Get(el[0]).Value = PROPS.Get(el[0] + p.Id).Value || el[1];
    });
}