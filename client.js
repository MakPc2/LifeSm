BreackGraph.Damage = false;

var ban_area = AreaPlayerTriggerService.Get("Ban");
ban_area.Enable = true;
ban_area.Tags = ["Ban"];
ban_area.OnEnter.Add(function(dp, a) {
    try {
        let p = Players.GetByRoomId(a.Name);
        p.SetPositionAndRotation({ x: NaN, y: NaN, z: NaN }, { x: 1, y: 1 });
        p.Damage.DamageIn.Value = false;
        p.Ui.Hint.Value = "Вы были забанены!";
        
        let e = Players.GetEnumerator();
        while (e.MoveNext()) {
            if (e.Current.Id != p.Id) e.Current.Spawns.Spawn();
        }
        
    } catch (err) {
        dp.Ui.Hint.Value = "Игрок не найден."
        dp.PopUp(err.name + "\n" + err.message);
    }
    
    a.Tags.Clear();
    a.Ranges.Clear();
});

Teams.Add("Blue","Blue",{ b: 1 });
var b_t = Teams.Get("Blue");
b_t.Spawns.SpawnPointsGroups.Add(1);

Teams.OnRequestJoinTeam.Add(function(p,t) { 
    t.add(p); 
    if (p.IdInRoom == 1) { Properties.GetContext().Get("Id").Value = p.Id; }
    if (p.Id == Properties.GetContext().Get("Id").Value) {
        p.Build.BuildRangeEnable.Value = true;
        p.Build.FlyEnable.Value = true;
    }
});
Teams.OnPlayerChangeTeam.Add(function(p) {
    p.Spawns.Spawn(); 
    p.Properties.Get("rd").Value = p.IdInRoom;
});

LeaderBoard.PlayerLeaderBoardValues =
[
    {
        Value: "rd",
        DisplayName: "rd",
        ShortDisplayName: "rd"
    }
]