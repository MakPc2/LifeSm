const LOAD_MSGS = [
    "Не умирайте!", "Оружие - смерть",
    "Ищи позитивные вещи", "Загрузка"
];

Teams.Add("Blue", "Blue", {
    b: 0.9
});
var blue = Teams.Get("Blue");
blue.Spawns.SpawnPointsGroups.Add(1);

Teams.OnRequestJoinTeam.Add(function(p) {
    if (p.IdInRoom !== 1) return;
    showInfo(p);
    blue.add(p);
});

Teams.OnPlayerChangeTeam.Add(function(p) {
    p.Spawns.Spawn();
    showInfo(p);
});

Players.OnPlayerConnected.Add(function(p) {
    p.Timers.Get("Spawn").RestartLoop(1);
});

Timers.OnPlayerTimer.Add(function(t) {
    let p = t.Player,
    id = t.Id,
    prop = p.Properties;
    if (id === "Spawn" && !p.Team) {
        prop.Get("indx").Value += 1;
        if (prop.Get("indx").Value >= 5) {
            t.Stop();
            blue.add(p);
        }
        p.Ui.Hint.Value = ("<b>Загрузка</b>\n<i>" +
            LOAD_MSGS[Math.floor(Math.random() * LOAD_MSGS.length - 1)] + "</i>");
    }
});

function showInfo(p) {
    p.PopUp("<b>Инструкция.</b>");
    p.PopUp("<size=30><b>1. В чем суть режима?</b></size> \n<size=20>Суть данного режима в продвижении персонажа на сервере, <i>его развитии всего за 1 жизнь.</i></size>");
    p.PopUp("<size=30><b>2. Что будет если я умру?</b></size>\n<size=20>Если вы каким либо образом погибнете на сервере, <i>то вы уже никогда не сможете играть. Вы будете заспанены далеко от карты в мире где кроме черной комнаты нечего нет.</i></size>");
    p.PopUp("<size=30><b>3. Если я нечаянно выйду из сервера, что будет с моим прогрессом?</b></size>\n<size=20>Ваши данные автоматически будут сохранятся на сервер при выходе, <i>при заходе на сервер обратно - данные будут те же</i></size>");
    p.PopUp("<b>Удачной игры!</b>");
}