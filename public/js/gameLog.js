document.onmousemove = (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  /*
  if (event.buttons == 1) {
    playground.UpdateNamePos();
  }*/
  playground.UpdateCurrentTilePosition();
};

document.onmousedown = (e) => {
  if (e.button == 2) {
    showInfo(playground.CurrentTile ? playground.CurrentTile.Unit : null);
  }
  if (e.button == 1) {
    lerp = false;
  }
};

let lerp = true;

document.onmouseup = (e) => {
  if (playground.CurrentTile != null) {
    if (e.button == 0) {
      playground.CurrentUnit.ClickHandler();
    }
  }
  if (e.button == 1) {
    lerp = true;
  }
};

let unitInfoID = null;
function showInfo(unit) {
  if (unit == null) {
    if (boolInfoUnit) toggleInfoUnit();
    return $("#info_unit").html("");
  } else {
    if (!boolInfoUnit) toggleInfoUnit();
  }
  if (typeof unit == "number") {
    unit = playground.Units[unit];
  }
  let str = `<ul><li>id: ${unit.Id}</li>
  <li>side: ${unit.Side}</li>
  <li>name: ${unit.Name}</li>
  <li>health: ${unit.CurrentHealth} (${unit.MaxHealth}) (${unit.OriginalHealth})</li>
  <li>attack: ${unit.CurrentAttack} (${unit.OriginalAttack})</li>
  <li>initiative: ${unit.CurrentInitiative} (${unit.OriginalInitiative})</li>
  <li>moves: ${unit.CurrentMoves} (${unit.MaxMoves}) (${unit.OriginalMoves})</li>
  <li>canCouterAttack: ${unit.CanCounterAttack}</li>
  <li>canWait: ${unit.CanWait}</li>
  <li>ranged: ${unit.Ranged}</li></ul>`;
  $("#info_unit").html(str);
}

document.oncontextmenu = () => false;

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  playground.Camera.aspect = window.innerWidth / window.innerHeight;
  playground.Camera.updateProjectionMatrix();
  playground.Renderer.setSize(window.innerWidth, window.innerHeight);
  //playground.UpdateNamePos();
}

function lightUnit(unitID) {
  let u = playground.Units[unitID];
  if (!u) return;
  u.changeColor(COLOR_WHITE);
}
function delightUnit(unitID) {
  let u = playground.Units[unitID];
  if (!u) return;
  u.changeColor(
    u == playground.CurrentUnit ? COLOR_CURRENTUNIT : materials[u.Race]
  );
}
function stylizeUnit(unit) {
  return `<span style='color:${
    unit.Side == "Yellow" ? "Yellow" : "Red"
  };'onmouseover='lightUnit(${unit.Id})' onclick='showInfo(${
    unit.Id
  })' onmouseout='delightUnit(${unit.Id})'>${unit.Name}</span>`;
}

function log(content) {
  let din = document.getElementById("log_containeer");
  din.innerHTML = "<li>" + content + "</li>" + din.innerHTML;
}

function chatMessage(msg, s) {
  let din = document.getElementById("log_containeer");
  din.innerHTML =
    "<li class='player_msg'>[" + s + "]: " + msg + "</li>" + din.innerHTML;
}

function sendMsg() {
  if ($("#msg").val().trim() == "") return;
  socket.emit("message", $("#msg").val().trim());
  $("#msg").val("");
}

function sendMsgFromInput(e) {
  if (e.key == "Enter") sendMsg();
}

function createError(content) {
  let din = document.getElementById("errors");
  let d = document.createElement("div");
  d.classList.add("error");
  d.innerHTML = content;
  din.appendChild(d);
  setTimeout(() => {
    din.removeChild(d);
  }, 5000);
}
