try {

// Константы
const SAVE = [
    [ "IsDeath", false ], [ "Hp", 100 ], [ "Kills", 0 ]
], 
PROPS = Properties.GetContext(),
MSGS_LOADER = ["<b>Загрузка...</b>", "Читайте инструкцию!", "Что ты тут забыл?", "Кто то вообще это читает?...", "Карл?!"];

// Созданик команд
Teams.Add("Blue", "<i><b><size=38>B</size><size=30>lue</size>  <size=38>T</size><size=30>eam</size></b>\nthis mode by mak</i>", { b: 1, r: 51/255, g: 51/255 });
var blueTeam = Teams.Get("Blue");
blueTeam.Build.BlocksSet.Value = BuildBlocksSet.Blue;
blueTeam.Spawns.SpawnPointsGroups.Add(1);

// Настройки
Damage.GetContext().DamageIn.Value = false;
Damage.GetContext().FriendlyFire.Value = true;
BreackGraph.PlayerBlockBoost = true;
BreackGraph.OnlyPlayerBlocksDmg = true;

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
    showInstr(p);
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
Damage.OnDamage.Add(function(p, p2, dmg) { 
    p.Properties.Get("Hp").Value -= Math.ceil(dmg); 
    
    if (p.Properties.Get("Hp").Value <= 0) {
        P.Properties.Get("Hp").Value = 10;
    }
});

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
            
            p.Ui.Hint.Value = ("<b>Загрузка...</b>" + "\n" 
                + MSGS_LOADER[Math.floor(Math.random() * MSGS_LOADER.length)]);
            break;
        case "Reset": p.Ui.Hint.Reset(); break;
        case "Immor":
            p.Damage.DamageIn.Value = true;
        break;
    }
});

// Зоны
var noBuild = AreaPlayerTriggerService.Get("NoBuild");
noBuild.Tags = ["NoBuild"];
noBuild.Enable = true;
noBuild.OnEnter.Add(function(p) {
    p.inventory.Build.Value = false;
    p.Ui.Hint.Value = "строительство запрещено";
    p.Timers.Get("Reset").Restart(5);
});
noBuild.OnExit.Add(function(p) {
    p.inventory.Build.Value = true;
    p.inventory.BuildInfinity.Value = true;
});

var noWp = AreaPlayerTriggerService.Get("NoWp");
noWp.Tags = ["NoWeapon"];
noWp.Enable = true;
noWp.OnEnter.Add(function(p) {
    p.inventory.Main.Value = false;
    p.inventory.Secondary.Value = false;
    p.inventory.Explosive.Value = false;
    p.Damage.DamageIn.Value = false;
    p.Damage.FriendlyFire.Value = false;
});
noWp.OnExit.Add(function(p) {
    p.inventory.Main.Value = true;
    p.inventory.Secondary.Value = true;
    p.inventory.Explosive.Value = true;
    p.Damage.FriendlyFire.Value = true;
    p.Timers.Get("Immor").Restart(3);
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

// вывод инструкции
function showInstr(ctx) {
    ctx.PopUp("<b>Инструкция.\nВерсия: 0.01</b>");
    ctx.PopUp("<b><size=30>1. Что будет если я умру?</size></b><size=15>Если вы каким либо способом умрете, то <i>мнгновенно будете забанены на сервере</i>, перезаход не поможет.</size>");
    ctx.PopUp("<b><size=30>2. Что если я вылечу с сервера?</size</b><size=15>Ничего страшного, <i>весь ваш прогресс сохранится, в том числе и ваше здоровье</i>.</size>");
    ctx.PopUp("<b>Удачной игры!</b>");
}

} catch (err) { Teams.Add("Err", err.name + "\n" + err.message, { r: 0 }); } finally {
    Teams.Add("Test", "<i><b><size=38>у</size><size=30>дачи!</size></b>\nthis mode by mak</i>", { s: 1 });
}