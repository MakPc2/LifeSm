try {
    
    // Константы
    const SAVE = [
        ["IsDeath", false],
        ["Hp", 100],
        ["Kills", 0],
        ["IsAdmin",  false]
    ],
    PROPS = Properties.GetContext(),
    MSGS_LOADER = ["<b>Загрузка...</b>",
        "Читайте инструкцию!",
        "<color=red>Что ты тут забыл?</a>",
        "Кто то вообще это читает?...",
        "Карл?!"],
    MAP_Y = 9;
    
    const isKE = PROPS.Get("KE");
    isKE.Value = false;

    // Созданик команд
    Teams.Add("Blue", "<i><b><size=38>B</size><size=30>lue</size>  <size=38>T</size><size=30>eam</size></b>\nthis mode by mak</i>", {
        b: 1, r: 51/255, g: 51/255
    });
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
        p.Properties.Get("IsAdmin").Value = true;
        t.add(p);
    });

    Players.OnPlayerConnected.Add(function(p) {
        outp(p);

        let prop = p.Properties;
        if (prop.Get("IsDeath").Value) return ban(p);

        // Спец - значения
        p.contextedProperties.MaxHp.Value = parseInt(prop.Get("Hp").Value);

        p.Timers.Get("Respawn").RestartLoop(1);
    });

    Teams.OnPlayerChangeTeam.Add(function(p) {
        let prop = p.Properties;
        if (prop.Get("IsDeath").Value) return;
        p.Spawns.Spawn();
        p.Ui.Hint.Reset();
        showInstr(p);
    });

    // Слхраняемся
    Players.OnPlayerDisconnected.Add(function(p) { save(p); });

    // Баним игрока при смерти
    Damage.OnDeath.Add(function(p) { 
        let current = p.PositionIndex;
        MapEditor.SetBlock(current.x, MAP_Y, current.z, 682);
        
        if (!p.Properties.Get("IsAdmin").Value || !isKE.Value) ban(p);
    });

    function ban(p) {
        let prop = p.Properties;
        prop.Get("IsDeath").Value = true;
        Teams.Get("BlackTeam").add(p);
        p.Spawns.Spawn();
        p.Spawns.Despawn();
    }

    // Счетчик Hp
    Damage.OnDamage.Add(function(p, p2, dmg) {
        let prop = p2.Properties;
        
        if (prop.Get("IsAdmin").Value) return;
        prop.Get("Hp").Value -= Math.ceil(dmg);

        if (prop.Get("Hp").Value <= 0) prop.Get("Hp").Value = 10;
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
            case "Reset": 
                p.Ui.Hint.Reset(); 
                break;
            case "Immor":
                prop.Immortality.Value = false;
                break;
        }
    });
    
    // Обновление KE таймера
    var KEtimer = Timers.GetContext().Get("KE");
    KEtimer.OnTimer.Add(function() {
        if (isKE.Value) {
            isKE.Value = false;
            Ui.GetContext().Hint.Value = "сезон KE начался!"
        }
        else {
            isKE.Value = true;
            Ui.GetContext().Hint.Value = "🖱";  // todo
        }
    });
    
    KEtimer.RestartLoop(30 * 60);
    Ui.GetContext().MainTimerId.Value = KEtimer.Id;

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
    });
    noWp.OnExit.Add(function(p) {
        p.inventory.Main.Value = true;
        p.inventory.Secondary.Value = true;
        p.inventory.Explosive.Value = true;
        p.Damage.FriendlyFire.Value = true;

        p.Damage.DamageIn.Value = true;
        p.Properties.Immortality.Value = true;
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
        ctx.PopUp("<b>Версия 1.7rls:</b>\n1. Добавлен сезон КЕ.\n2. Теперь забаненые находятся в черной команде!.")
        ctx.PopUp("<b>Инструкция.\nВерсия: 1.7rls</b>");
        ctx.PopUp("<b><size=30>1. Что будет если я умру?</size></b>\n<size=25>Если вы каким либо способом умрете, то <i>мнгновенно будете забанены на сервере</i>, перезаход не поможет.</size>");
        ctx.PopUp("<b><size=30>2. Что такое сезон КЕ?\n</size></b><size=10>Сезон КЕ <i>это сезон в котором игроки после смерти не будут забанены, это длится 30 минут</i>. КЕ проходит каждые 30 минут</size>")
        ctx.PopUp("<b><size=10>ОСОБЕННОСТИ:\n3. Все данные сохраняются\n4. Если вы умрете, под вами заспавнится зеленый блок.</size></b>");
        ctx.PopUp("<b>Удачной игры!</b>");
    }

} catch (err) {
    Teams.Add("Err",
        err.name + "\n" + err.message,
        {
            r: 0
        });
} finally {
    Teams.Add("BlackTeam",
        "<i><b><size=38>у</size><size=30>дачи!</size></b>\nкоманда для забаненых</i>",
        {
            s: 1
        });
}