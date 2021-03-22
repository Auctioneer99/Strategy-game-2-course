class playgroundObject {
	constructor(health, defense, object) {
		this.id;
		this.health = health;
		this.currentHealth = health;
		this.defense = defense;
		this.currentDefense = defense;
		this.tilePos = null;
		this.gameObj = object;
	}
	placeOnPlayground(tileID) {
		this.tilePos = tileID;
		let t = tileByID(tileID);
		t.keepingObj = this.id;
		this.gameObj.position.set(t.gameObj.position.x, t.gameObj.position.y - 1.4, t.gameObj.position.z); 
	}
	removeFromPlayground() {
		this.gameObj.dispose();
		tileByID(this.tilePos).keepingObj = null;
	}
}



class Unit extends playgroundObject{
  constructor(health, defense, object, attack, damage, moves, initiative, ranged) {
		super(health, defense, object);
		this.attack = attack;
		this.currentAttack = attack;
		this.damage = damage;
		this.currentDamage = damage;
		this.moves = moves;
		this.currentMoves = moves;
		this.initiative = initiative;
		this.currentInitiative = initiative;
		this.ranged = (ranged == "true");
		this.canCounterAttack = true;
		this.canWait = true;
		this.effects = [];
  }
	unitAttack(unitID, shouldCounterAtttack) {
		let dmg = 0;
		
		dmg = 40;
		if (shouldCounterAtttack)
			unitByID(unitID).applyDamage(dmg);
	}
	applyDamage(damage, attackerID) {
		this.health = Math.max(0, this.health - damage);
		if (this.health == 0) {
			this.removeFromPlayground();
		}
		if (tileByUnitID(attackerID).reach(1)) {
			if (this.canCounterAttack) {
				this.canCounterAttack = false;
				this.unitAttack(attackerID, false);
			}
		}
	}
	unitWait() {
		
	}
	unitFortify() {
		this.unitEndTurn();
		
	}
	unitCounterAttack() {
		
	}
	unitEndTurn() {
		
	}
	addEffectToUnit(effectID) {
		
	}
	refreshEffectsTimer() {
		
	}
}



class Tile {
  constructor(sTile) {
    this.id = sTile.id;
    this.connections = sTile.connections;
    this.unitID = sTile.unitID;
    this.obj = null;
    this.grave = null;
		this.pathPoint = null;
  }

  getDist(n) {
    if (n < 0) return;
    if (playground.markedTiles.indexOf(this.id) == -1) playground.markedTiles.push(this.id);
		if (this.unitID != null && this.unitID != playground.currentUnit) return;
    for (let i = 0; i < 6; i++)
      if (this.connections[i] != -1) tileByID(this.connections[i]).getDist(n - 1);
  }
}







class Scene {
  constructor() {
    this.tiles = [];
    this.markedTiles = [];
    this.units = [];
    this.currentUnit = null;
    this.currentTile = 0;
  }

  createField(t) {
    for (let i = 0; i < t.length; i++)
    	playground.tiles.push(new Tile(t[i]));

    let k = 0;
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 10 + (i % 2); j++) {
        let c = new THREE.CylinderGeometry(5, 5, 1, 6, 1, false);
        let m = new THREE.Mesh(c, new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.2 }));
				let c1 = new THREE.SphereGeometry(2, 16, 8);
				let m1 = new THREE.Mesh(c1, new THREE.MeshBasicMaterial({ color: 0xBB0033, transparent: true, opacity: 0 }));
        m.position.set(j * 9 + (i % 2) * -4.5, -1.4, i * 7.75);
				m1.position.set(j * 9 + (i % 2) * -4.5, -1.4, i * 7.75);
        scene.add(m);
				scene.add(m1)
        tileByID(k).obj = m;
				tileByID(k).pathPoint = m1
        k++;
      }
  }

  createUnit(x, z, unit) {
    let c = new THREE.BoxGeometry(5, 5, 5);
    let c1 = new THREE.BoxGeometry(5, 5, 5);
    let m = new THREE.Mesh(c, material);
    let m1 = new THREE.Mesh(c, material3);
    let group = new THREE.Group();

    m1.scale.multiplyScalar(1.05);
    group.add(m);
    group.add(m1);
    group.position.set(x, 5, z);

    let tb = document.createElement('div');
    tb.innerHTML = unit.name + ', ' + unit.count;
    tb.style.position = 'fixed';
    tb.style.width = 100;
    tb.style.height = 20;
    document.body.append(tb);
		
		let u = new Unit(group, tb, unit);
		u.stats.position = tileByID(u.stats.tileID);
		
    this.units.push(u);
    scene.add(group);
  }
}

function unitByID(id) {
	return playground.units[id];
}
function tileByID(id) {
	return playground.tiles[id];
}
function unitByTileID(id) {
	return playground.units[playground.tiles[id].unitID];
}
function tileByUnitID(id) {
	return playground.tiles[playground.units[id].stats.tileID];
}