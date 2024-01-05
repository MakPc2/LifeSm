const LOAD_MSGS = [
    "Не умирайте!", "Оружие - смерть",
    "Ищи позитивные вещи", "Продвигай своего персонажа", "Загрузка"
],
    SAVE_DATA = [
        new save("IsDeath", false), new save("Position", 0),
        new save("Hp", 100)
    ],
    PROPS = Properties.GetContext();

Teams.Add("Blue", "Blue", {
    b: 0.9
});
var blue = Teams.Get("Blue");
blue.Spawns.SpawnPointsGroups.Add(1);
blue.Build.BlocksSet.Value = BuildBlocksSet.Blue;

Teams.Add("Null", "Deaths", {
    r: 0
});
var nullT = Teams.Get("Null");
nullT.Spawns.CustomSpawnPoints.Add(99999,99999,99999,99999);
nullT.Damage.DamageIn.Value = false;

Teams.OnRequestJoinTeam.Add(function(p) {
    if (p.IdInRoom !== 1) return;
    blue.add(p);
});

Teams.OnPlayerChangeTeam.Add(function(p) {
    p.Spawns.Spawn();
    p.Ui.Hint.Reset();
    showInfo(p);
});

Players.OnPlayerConnected.Add(function(p) {
    let prop = p.Properties;
    
    SAVE_DATA.forEach(function(save) {
        prop.Get(save.prop).Value =
            PROPS.Get(save.prop + p.Id).Value || prop.defaultValue;
    });
    try {
        
        let posArray = prop.Get("Position").Value.replace(")","").replace("(","").split(",");
        let pos = {
            x: parseInt(posArray[0]),
            y: parseInt(posArray[1]),
            z: parseInt(posArray[2])
        }
        p.SetPositionAndRotation(pos, { x: 1, y: 1 })
    
    } catch (err) {
        Ui.GetContext().Hint.Value = err.name + "\n" + err.message;
    }
    
    if (p.Properties.Get("IsDeath").Value) return nullT.add(p);
    p.Timers.Get("Spawn").RestartLoop(1);
});

Players.OnPlayerDisconnected.Add(function(p) {
    let prop = p.Properties;
    // Экстренные сохранения
    prop.Get("Position").Value = p.PositionIndex.ToString();
    
    SAVE_DATA.forEach(function(save) {
        PROPS.Get(save.prop + p.Id).Value = prop.Get(save.prop).Value;
    });
});

Spawns.OnSpawn.Add(function(p) {
    if (p.Team === nullT) return;
    if (p.Properties.Get("Position").Value !== 0) {
        // todo: Перенос игрока на позицию 
    }
});

Timers.OnPlayerTimer.Add(function(t) {
    let p = t.Player, id = t.Id, prop = p.Properties;
    
    if (id === "Spawn" && !p.Team) {
        prop.Get("indx").Value += 1;
        if (prop.Get("indx").Value >= 10) {
            blue.add(p);
            return t.Stop();
        }
        p.Ui.Hint.Value = ("<b>Загрузка</b>\n<i>" +
            LOAD_MSGS[Math.floor(Math.random() * LOAD_MSGS.length - 1)] + "</i>");
    }
});

var inv = Inventory.GetContext();
inv.Main.Value = false;
inv.Secondary.Value = false;
inv.Build.Value = false;
inv.Explosive.Value = false;

function showInfo(p) {
    p.PopUp("<b>Инструкция.</b>");
    p.PopUp("<size=30><b>1. В чем суть режима?</b></size> \n<size=20>Суть данного режима в продвижении персонажа на сервере, <i>его развитии всего за 1 жизнь.</i></size>");
    p.PopUp("<size=30><b>2. Что будет если я умру?</b></size>\n<size=20>Если вы каким либо образом погибнете на сервере, <i>то вы уже никогда не сможете играть. Вы будете заспанены далеко от карты в мире где кроме черной комнаты нечего нет.</i></size>");
    p.PopUp("<size=30><b>3. Если я нечаянно выйду из сервера, что будет с моим прогрессом?</b></size>\n<size=20>Ваши данные автоматически будут сохранятся на сервер при выходе, <i>при заходе на сервер обратно - данные будут те же</i></size>");
    p.PopUp("<b>Удачной игры!</b>");
}

function save(prop, defaultValue) {
    return { prop: prop, defaultValue: defaultValue }
}