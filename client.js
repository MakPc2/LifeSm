try {

// Константы
const SAVE = [
    [ "IsDeath", false ], [ "Hp", 100 ], [ "Kills", 0 ]
], 
PROPS = Properties.GetContext(),
MSGS_LOADER = ["<b>Загрузка...</b>", "Читайте инструкцию!", "Что ты тут забыл?", "Кто то вообще это читает?...", "Карл?!"];

// Созданик команд
Teams.Add("Blue", "Blue", { b: 1 });
var blueTeam = Teams.Get("Blue");
blueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
blueTeam.Spawns.SpawnPointsGroups.Add(1);

// Выключаем инвентарь
["Main", "Secondary", "Build", "Explosive"].forEach(function(wp) {
    Inventory.GetContext()[wp].Value = false;
});

// Вход в команду при заходе на сервер
Teams.OnRequestJoinTeam.Add(function(p, t) {
    if (p.IdInRoom !== 1) return;
    outp(p);
    t.add(p); 
});

Players.OnPlayerConnected.Add(function(p) {
    outp(p);
    
    let prop = p.Properties;
    if (prop.Get("IsDeath").Value) return ban(p);
    
    // Спец - значения
    p.contextedProperties.MaxHp.Value = parseInt(prop.Get("Hp").Value);
    
    p.Timers.Get("Respawn").RestartLoop(1);
    p.Ui.Hint.Value = "Opsss...";
});

Teams.OnPlayerChangeTeam.Add(function(p) { 
    if (p.Properties.Get("IsDeath").Value) return;
    p.Spawns.Spawn();
    p.Ui.Hint.Reset();
});

// Слхраняемся
Players.OnPlayerDisconnected.Add(function(p) { save(p); });

// Баним игрока при смерти
Damage.OnDeath.Add(function(p) { ban(p); });

function ban(p) {
    p.Properties.Get("IsDeath").Value = true;
    blueTeam.add(p);
    p.Spawns.Spawn();
    p.Spawns.Despawn();
}

// Счетчик Hp
Damage.OnDamage.Add(function(p, p2, dmg) { p.Properties.Get("Hp").Value -= Math.ceil(dmg); });

// Таймеры
Timers.OnPlayerTimer.Add(function(t) {
    let p = t.Player, id = t.Id, prop = p.Properties;
    
    switch (id) {
        case "Respawn":
            prop.Get("Respawn-indx").Value += 1;
            
            if (prop.Get("Respawn-indx").Value > 10) {
                blueTeam.add(p);
                return t.Stop();
            }
            
            p.Ui.Hint.Value = ("<b>Загрузка...</b>" + "\n" +
                + MSGS_LOADER[Math.floor(Math.random() * MSGS_LOADER.length)]);
            break;
        case "Reset": p.Ui.Hint.Reset(); break;
    }
});

// Зоны
var noBuild = AreaPlayerTriggerService.Get("NoBuild");
noBuild.Tags = ["NoBuild"];
noBuild.Enable = true;
noBuild.OnEnter.Add(function(p) {
    p.inventory.Build.Value = false;
    p.Ui.Hint.Value = "строительство запрещено";
    p.Timers.Get("Reset").Reset(5);
});
noBuild.OnExit.Add(function(p) {
    p.inventory.Build.Value = true;
});

var noWp = AreaPlayerTriggerService.Get("NoWp");
noWp.Tags = ["NoWeapon"];
noWp.Enable = true;
noWp.OnEnter.Add(function(p) {
    p.inventory.Main.Value = false;
    p.inventory.Secondary.Value = false;
    p.inventory.Explosive.Value = false;
});
noWp.OnExit.Add(function(p) {
    p.inventory.Main.Value = true;
    p.inventory.Secondary.Value = true;
    p.inventory.Explosive.Value = tru;
});

// Сохранение данных на сервер
function save(p) {
    SAVE.forEach(function(el) {
        PROPS.Get(el[0] + p.Id).Value = p.Properties.Get(el[0]).Value;
    });
}

// Вывод данных в игрока
function outp(p) {
    SAVE.forEach(function(el) {
        p.Properties.Get(el[0]).Value = PROPS.Get(el[0] + p.Id).Value || el[1];
    });
}

} catch (err) { Teams.Add("Err", err.name + "\n" + err.message, { r: 0 }); }