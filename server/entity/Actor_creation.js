Actor = typeof Actor !== 'undefined' ? Actor : {};

Actor.creation = function(data){
	//data: x  y  map category variant lvl modAmount extra

	var e = Actor.template('enemy');
	e = Actor.creation.db(e,data);
	e = Actor.creation.info(e,data);
	e = Actor.creation.extra(e,data);
	e = Actor.creation.optionList(e);
		
	e.data = data;
	List.actor[e.id] = e;
	List.all[e.id] = e;
	List.map[e.map].list[e.id] = e;
	
	if(e.nevercombat){ Actor.creation.nevercombat(e); }	
	else {
		e = Actor.creation.mod(e,data); 
		e = Actor.creation.boost(e);
	}
	if(e.nevermove){ Actor.creation.nevermove(e); }
	
	return e.id;
}

Actor.creation.group = function(gr,el){
   	/*
	gr: x y map respawn
    el: [  {'amount':1,"category":"eSlime","variant":"Big","lvl":0,'modAmount':1},
		{'amount':10,"category":"troll","variant":"ice","lvl":0,'modAmount':1},	];
	*/
	var id = Math.randomId();
	var enemyIdList = [];
	
	gr = useTemplate(Actor.creation.group.template(),gr);	
	List.group[id] = {
		'id':id,
		'param':[gr,el],        //used to revive group
		'list':{},              //hold enemies
		'respawn':gr.respawn,   //time before respawn when all monster dead
	};
	
	el = arrayfy(el);
	for(var i in el){
		var amount = el[i].amount || 1;
		for(var j = 0 ; j < amount; j++){
			el[i] = useTemplate(el[i],gr);  //info about x,y,map
			
			var eid = Actor.creation(el[i]);
			var e = List.all[eid];
			
			enemyIdList.push(eid);
			List.group[id].list[eid] = e;
			e.group = id;
		}
	}
	return enemyIdList;
	
}

Actor.creation.group.template = function(){
	return {'x':0,'y':0,'v':25,'map':'test@MAIN','respawn':100}
}

Actor.creation.boost = function(e){
	for(var i in e.boost.list){ 
        e.boost.list[i].base = valueViaArray({'origin':e,'array':e.boost.list[i].stat});	
	}
	return e;
}

Actor.creation.db = function(e,d){
	e = Db.enemy[d.category][d.variant]();
	for(var i in Db.enemy[d.category][d.variant]) e[i] = Db.enemy[d.category][d.variant][i];	//cuz of function (globalDmg)
	
	e.id = Math.randomId();
	e.publicId = Math.random().toString(36).substring(13);
	e.frameCount = Math.floor(Math.random()*100);
	
	e.globalDef = typeof e.globalDef === 'function' ? e.globalDef(e.lvl) : e.globalDef * Actor.creation.db.globalLvlMod(e.lvl).globalDef
	e.globalDmg = typeof e.globalDmg === 'function' ? e.globalDmg(e.lvl) : e.globalDmg * Actor.creation.db.globalLvlMod(e.lvl).globalDmg
	if(e.globalMod) e = e.globalMod(e,e.lvl);
	
	if(e.boss){	
		e.boss = Boss.creation(e.boss);
		e.boss.parent = e.id; 
	}
	var count = 0;
	for(var i in e.ability){ 
		Actor.learnAbility(e,i,e.ability[i]);
		Actor.swapAbility(e,count,i);
		count++;
	}
	
	Sprite.creation(e,e.sprite);		//To set hitbox and bumper
		
	return e;
}

Actor.creation.db.globalLvlMod = function(lvl){
	return {
		globalDef:lvl+10,
		globalDmg:lvl+10,
	};
}

Actor.creation.info = function(e,cr){
    e.map = cr.map || 'test@MAIN';
	e.x = cr.x + Math.randomML() * (cr.v || 0); 
	e.y = cr.y + Math.randomML() * (cr.v || 0); 
	e.crX = cr.x;
	e.crY = cr.y;
	e.category = cr.category || 'eSlime'; 
	e.variant = cr.variant || 'Regular'; 
	e.lvl = cr.lvl || 0; 
	e.modAmount = cr.modAmount !== undefined ?  cr.modAmount : 1;
	e.extra = cr.extra || {};
	return e;
}

Actor.creation.mod = function(e,d){
	var list = Object.keys(Actor.creation.mod.list);
	for(var i = 0 ; i < d.modAmount ; i++){
		var choosen = Actor.creation.mod.list.random('chance');
		if(e.modList.have(choosen)){ i -= 0.99; continue; }
		
		e.modList.push(choosen);
		choosen = Actor.creation.mod.list[choosen];
		e = choosen.func(e);
		e.name += ': ' + choosen.name;
		e.context += ': ' + choosen.name;
		
	}
	return e;
}

Actor.creation.mod.list = {
	'immuneMelee':{'name':'Immune to Melee','chance':1,
		'func': (function(e){ e.equip.def.melee = Cst.bigInt;  return e; })},
	'immuneRange':{'name':'Immune to Range','chance':1,
		'func': (function(e){ e.equip.def.range = Cst.bigInt;  return e; })},
	'immuneMagic':{'name':'Immune to Magic','chance':1,
		'func': (function(e){ e.equip.def.magic = Cst.bigInt;  return e; })},
	'immuneFire':{'name':'Immune to Fire','chance':1,
		'func':(function(e){ e.equip.def.fire = Cst.bigInt;  return e; })},
	'immuneCold':{'name':'Immune to Cole','chance':1,
		'func': (function(e){ e.equip.def.cold = Cst.bigInt;  return e; })},
	'immuneLightning':{'name':'Immune to Lightning','chance':1,
		'func': (function(e){ e.equip.def.lightning = Cst.bigInt;  return e; })},

	'immuneStatus':{'name':'Immune to Status','chance':1,
		'func': (function(e){ for(var i in e.status){ e.status[i].resist = 1; }  return e; })},

	'BAx2':{'name':'More Bullets','chance':1,
		'func': (function(e){ e.bonus.bullet.amount *= 2; return e; })},
	'BAx4':{'name':'Even More Bullets','chance':1,
		'func': (function(e){ e.bonus.bullet.amount *= 4; e.globalDmg /= 2; return e; })},
	'regen':{'name':'Fast Regen','chance':1,
		'func': (function(e){ e.resource.hp.regen = 2*e.resource.hp.regen || e.resource.hp.max/250; return e; })},
	'extraLife':{'name':'More Life','chance':1,
		'func': (function(e){ e.resource.hp.max *= 2; e.hp *= 2; return e; })},
	'leech':{'name':'Leech Hp','chance':1,
		'func': (function(e){ e.bonus.leech.chance = 0.5; e.bonus.leech.magn = 0.5; return e; })},
	'atkSpd':{'name':'Faster Attack','chance':1,
		'func': (function(e){ e.atkSpd.main *= 2; return e; })},
	'reflectPhysical':{'name':'Reflect Physical','chance':1,
		'func': (function(e){ e.reflect = {"melee":0.5,"range":0.5,"magic":0.5,"fire":0,"cold":0,"lightning":0}; return e; })},
	'reflectElemental':{'name':'Reflecth Elemental','chance':1,
		'func': (function(e){ e.reflect = {"melee":0,"range":0,"magic":0,"fire":0.5,"cold":0.5,"lightning":0.5}; return e; })},
	'aoe':{'name':'Bigger AoE','chance':1,
		'func': (function(e){ e.bonus.strike.size *= 2; e.bonus.strike.maxHit *= 2; return e; })},
	'drop':{'name':'Better Drop','chance':1,
		'func': (function(e){ e.drop.mod.quantity += 2; e.drop.mod.quality += 2; e.drop.mod.rarity += 2; return e; })},
}

Actor.creation.extra = function(mort){
	mort = useTemplate(mort,mort.extra,2);	//deep clone of function
	for(var i in mort.viaArray){ 
		mort.viaArray[i].origin = mort;
		changeViaArray(mort.viaArray[i]);
	} 
	delete mort.extra;
	delete mort.viaArray;
	return mort;
}

Actor.creation.optionList = function(e){
	var ol = {'name':e.name,'option':[]};
	
	if(e.type === 'player') ol.option.push({'name':'Trade',"func":'Main.openWindow',"param":['trade',e.id]});
	if(e.dialogue)	ol.option.push({'name':'Talk To',"func":'Actor.talk',"param":[e.id]});
	
	e.optionList = ol.option.length ? '' : ol;
	return e;
}

Actor.creation.nevercombat = function(mort){
	mort.combat = 0;
	
	delete mort.killed;
	
	
	
	delete mort.permBoost;
	delete mort.boost;
	
	//General
	delete mort.drop;
	delete mort.item;
	delete mort.pickRadius;
	
	//Combat
	delete mort.attackReceived;	
	delete mort.hitIf;
	delete mort.targetIf;
	delete mort.boss;
	delete mort.deleteOnceDead;
	delete mort.bonus;	
	delete mort.mastery;
	delete mort.ability;
	delete mort.abilityList;
	delete mort.atkSpd;
	
	//Def = DefMain * defArmor * mort.mastery.def
	delete mort.hp;	
	delete mort.mana;
	delete mort.dodge;
	delete mort.fury;
	delete mort.resource;
	
	delete mort.globalDef;	
	delete mort.reflect;
	
	//Resist
	delete mort.status;
	
	//Atk
	delete mort.dmg;
	delete mort.globalDmg;
	delete mort.aim;
	delete mort.weapon;
	delete mort.ability;
	delete mort.equip;
	delete mort.moveRange
	
	
	delete mort.summon
	delete mort.summmoned;
	
	//For update:
	mort.resource = {'hp':{'max':1}};
	mort.hp = 1;
}

Actor.creation.nevermove = function(mort){
	mort.move = 0;
		
	delete mort.friction; 
	delete mort.maxSpd;
	delete mort.acc;
	delete mort.mapMod; 
	delete mort.moveAngle;
	delete mort.spdX;
	delete mort.spdY; 
	delete mort.moveInput; 
	delete mort.bumper; 
	delete mort.moveRange;
	
	//For update:
	mort.spdX = 0;
	mort.spdY = 0;
	mort.maxSpd = 1;
}
