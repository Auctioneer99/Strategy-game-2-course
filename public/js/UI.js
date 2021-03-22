let boolMenu = false;
let boolQueue = true;
let boolInfoLog = true;
let boolCards = true;
let boolAbilities = true;
let boolInfoUnit;
let openedID = "lobby";
let selectedUnitID = -1;
let toolTip = document.getElementById("toolTip");
document.addEventListener("keydown", function (event) {
  if (event.code == "Escape") toggleMenu();
  //else if (boolMenu) toggleMenu();
  if (event.code == "KeyQ" && event.altKey) toggleQueue();
  if (event.code == "KeyA" && event.altKey) toggleAbilities();
  if (event.code == "KeyC" && event.altKey) toggleCards();
  if (event.code == "KeyS" && event.altKey) toggleInfoLog();
  if (event.code == "KeyX" && event.altKey) toggleInfoUnit();
  if (event.code == "KeyZ" && event.altKey) toggleAll();
});
function showError() {}
function addCard() {}
function addToQueue() {}
function setInfoUnit() {}
function addInfoLog() {}
function toggleAll() {
  if (boolAbilities && boolCards && boolInfoLog && boolQueue) {
    toggleInfoUnit();
    toggleQueue();
    toggleAbilities();
    toggleCards();
    toggleInfoLog();
  } else {
    if (!boolQueue) toggleQueue();
    if (!boolAbilities) toggleAbilities();
    if (!boolCards) toggleCards();
    if (!boolInfoLog) toggleInfoLog();
  }
}
function toggleInfoUnit() {
  if (boolInfoUnit) {
    boolInfoUnit = false;
    move("#info_unit").ease("snap").set("left", -300).end();
  } else {
    move("#info_unit").ease("snap").set("left", 0).end();
    boolInfoUnit = true;
  }
}
function toggleAbilities() {
  if (boolAbilities) {
    boolAbilities = false;
    move("#abilities").ease("snap").set("bottom", -80).end();
  } else {
    boolAbilities = true;
    move("#abilities").ease("snap").set("bottom", 0).end();
  }
}
function toggleCards() {
  if (boolCards) {
    boolCards = false;
    move("#cards").ease("snap").set("bottom", -150).end();
  } else {
    boolCards = true;
    move("#cards").ease("snap").set("bottom", 0).end();
  }
}
function toggleInfoLog() {
  if (boolInfoLog) {
    boolInfoLog = false;
    move("#info_log").ease("snap").set("left", -400).end();
  } else {
    boolInfoLog = true;
    move("#info_log").ease("snap").set("left", 0).end();
  }
}
function toggleQueue() {
  if (boolQueue) {
    boolQueue = false;
    move("#queue").ease("snap").set("right", -80).end();
  } else {
    boolQueue = true;
    move("#queue").ease("snap").set("right", 0).end();
  }
}
function toggleMenu() {
  if (boolMenu) {
    boolMenu = false;
    toggleContext(false);
    move("#main_menu").ease("snap").set("left", -100).end();
    move("#right_bar").ease("snap").set("right", -100).end();
    move("#toggle_main_menu img").ease("snap").rotate(90).end();
  } else {
    boolMenu = true;
    toggleContext(true);
    move("#main_menu").ease("snap").set("left", 0).end();
    move("#right_bar").ease("snap").set("right", 0).end();
    move("#toggle_main_menu img").ease("snap").rotate(-90).end();
  }
}
function setFocus() {
  if (boolMenu) {
    toggleMenu();
  }
}
function toggleContext(toShow) {
  if (toShow) {
    move("#" + openedID)
      .ease("snap")
      .x(-document.getElementById(openedID).offsetWidth / 2)
      .y(
        (document.documentElement.clientHeight -
          document.getElementById(openedID).offsetHeight) /
          2
      )
      .end();
  } else {
    move("#" + openedID)
      .ease("snap")
      .x(-document.getElementById(openedID).offsetWidth / 2)
      .y(-document.getElementById(openedID).offsetHeight)
      .end();
  }
}
function chooseContext(id) {
  if (id == openedID) return;
  toggleContext(false);
  openedID = id;
  toggleContext(true);
}
function ClearAbility(id) {
  let ab = document.getElementById("ab" + id);
  ab.style.borderColor = "black";
  ab.innerHTML = "";
  ab.onclick = null;
}
function ShowToolTip(e, Ability) {
  toolTip.innerHTML = `${Ability.Name}<br>
  Перезарядка: ${Ability.Reload}<br>
  Текущая перезарядка: ${Ability.CurrentReload}<br>
  Описание: ${Ability.Description}<br>
  ${Ability.Range ? "Дальность: " + Ability.Range : ""}`;
  toolTip.style.top = e.clientY - 150;
  toolTip.style.left = e.clientX - 250;
  toolTip.hidden = false;
}
function HideToolTip() {
  toolTip.hidden = true;
}

toggleCards();
