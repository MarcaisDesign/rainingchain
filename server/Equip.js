//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
var Message = require2('Message'), ItemList = require2('ItemList'), Boost = require2('Boost'), OptionList = require2('OptionList'), Combat = require2('Combat'), Material = require2('Material'), CraftBoost = require2('CraftBoost'), ItemModel = require2('ItemModel'), Main = require2('Main'), Actor = require2('Actor');
var Equip = exports.Equip = {};

var DB = Equip.DB = {};
var db = null; 	//Equip.init
var START_ITEM_ID = 'E';

var FETCH_ALL_DB_INIT = true;
var DELETE_EQUIP_DB_WHEN_UPGRADE = false;

Equip.create = function(quest,id,piece,type,name,lvl,valueMod,boost,extra,addDb){	//called directly when creating quest equip
	if(!CST.equip.piece.$contains(piece || extra.piece)) return ERROR(3,'invalid piece',piece|| extra.piece);
	if(!CST.equip[piece|| extra.piece].$contains(type|| extra.type)) return ERROR(3,'piece and type doesnt match',piece|| extra.piece,type|| extra.type);
			
	var equip = {
		version:'v1.0',
		quest:quest || '',
		id:'',
		piece:piece || 'helm',
		type:type || 'metal',
		name:name || "Hello Kitty",
		icon:'',
		lvl:lvl || 0,
		def:null,
		dmg:null,	
		defRaw:null,
		dmgRaw:null,	
		boost:boost || [],
		masteryExp:0,
		creator:null,
		accountBound:0,
		color:'white',
		salvagable:0,
		quality:0,
		rarity:0,
		maxAmount:0,
		creationDate:Date.now(),
		/**/
		upgradable:0,
		upgradeInfo:null,/**/
	}
	equip.color = Equip.Color(equip);
	equip.category = CST.isWeapon(equip.piece) ? 'weapon' : 'armor';
	equip.icon = Equip.Icon(equip);
	equip.defRaw = Equip.RawDef(equip,lvl,valueMod);
	equip.dmgRaw = Equip.RawDmg(equip,lvl,valueMod);
	
	equip.def = Tk.deepClone(equip.defRaw);
	equip.dmg = Tk.deepClone(equip.dmgRaw);
	
	for(var i in extra) equip[i] = extra[i];
	equip.id = id || equip.id;
		
	DB[equip.id] = equip;
	Equip.createItemVersion(equip);
	
	if(addDb !== false) db.equip.upsert({id:equip.id}, Equip.compressDb(Tk.deepClone(equip)), db.err);
	return equip;
}

Equip.createFromModel = function(equip,addDb){
	return Equip.create(null,null,null,null,null,null,null,null,equip,addDb);
}	

Equip.get = function(id){
	return DB[id] || null;
}

Equip.init = function(dbLink,cb){
	db = dbLink;
	//now, we fetch needed equip when player logs
	if(FETCH_ALL_DB_INIT){
		db.equip.find({},{'_id':0},function(err, results) { if(err) return db.err(err);
			for(var i = 0 ; i < results.length; i++)
				Equip.uncompressDbAndAdd(results[i]);

			cb.call();
		});
	} else {
		cb.call();	
	}
}

//#######################

Equip.randomlyGenerateFromQuestReward = function(act){
	return Equip.randomlyGenerate(act.username,null,Actor.getLevel(act),null,null,null,null);
}

Equip.randomlyGenerate = function(creator,pieceType,lvl,quality,rarity,min,max){
	pieceType = pieceType || Equip.PieceType();
	
	quality = quality !== undefined ? quality : Equip.generateQuality(quality);
	rarity = rarity !== undefined ? rarity : Equip.generateRarity(rarity);
	
	var id = START_ITEM_ID + Math.randomId();
	var piece = pieceType.piece;
	var type = pieceType.type;
	lvl = Equip.Lvl(lvl || 0);
	var maxAmount = typeof max === 'number' ? max : Equip.generateMaxAmount(rarity);
	var minAmount = typeof min === 'number' ? min : Equip.generateMinAmount(rarity,maxAmount);
	var boost = Equip.generateBoost(minAmount,piece,type);
	
	var valueMod = Equip.generateValueMod(quality);

	var extra = {
		upgradable:true,
		salvagable:true,
		quality:quality || 0,
		rarity:rarity || 0, 
		maxAmount:maxAmount,
		creator:creator || '',
		upgradeInfo:Equip.generateUpgradeInfo(piece,type,lvl),
	}
	var name = Equip.Name(pieceType,boost);
	
	return Equip.create('',id,piece,type,name,lvl,valueMod,boost,extra,true);
};

Equip.PieceType = function(piece,type){
	if(piece && type) return {piece:piece,type:type};
	
	if(!piece) piece = CST.equip.piece.$random();
	if(piece === 'armor') piece = ['amulet','ring','body','helm'].$random();
	if(piece === 'weapon') return {piece:'weapon',type:CST.equip.weapon.$random()};
	if(piece === 'amulet') return {piece:'amulet',type:CST.equip.amulet.$random()};
	if(piece === 'ring') return {piece:'ring',type:CST.equip.ring.$random()};
	if(piece === 'body') return {piece:'body',type:CST.equip.body.$random()};
	if(piece === 'helm') return {piece:'helm',type:CST.equip.helm.$random()};
	return ERROR(3,'invalid piece',piece);
}

Equip.generateValueMod = function(quality){
	quality = quality || 0;
	return 0.9 + Math.pow(Math.random(),1/(quality+1))*0.2;
}

Equip.generateMaxAmount = function(rarity){	// 1/3 => 3, 1/9 => 4, 1/27 => 5, 1/81 => 6...
	rarity = rarity || 0;
	var amount = Math.pow(Math.random(),(1+(rarity)));
	amount = -Math.logBase(3,amount);
	amount = Math.floor(amount);
	amount += 2;
	if(amount > 6) amount = 6; //1/128
	return amount;
}

Equip.generateMinAmount = function(rarity,max){
	var random = Math.pow(Math.random(),2/(1+rarity));
	var min = 1 + Math.floor(random*max);
	return min.mm(0,max-1);
}

Equip.generateBoost = function(amount,piece,type){
	if(!amount) return [];
	
	var boost = [];
	if(piece === 'weapon'){
		boost.push(CraftBoost.generateBoost('weaponFirstBoost',type));
		amount--;
	}
	for(var i = 0 ; i < amount ; i++)
		boost.push(CraftBoost.generateBoost(piece,type));
	return boost;	
}

Equip.UpgradeInfo = function(exp,item){
	return {
		item:item || {},
		exp:exp	|| 0,
	}
}

Equip.UpgradeInfo.item = function(array){	//convert array to {}
	var item = {};
	for(var i in array){
		if(!array[i][1]) continue;	//not include if 0
		item[array[i][0]] = array[i][1];
	}
	
	return item;
}

Equip.generateUpgradeInfo = function(piece,type,lvl){
	var matLvl = Material.roundLevel(lvl);
	var expRewarded = 500;
	
	//armor
	if(type === 'metal') 
		return Equip.UpgradeInfo(expRewarded,Equip.UpgradeInfo.item([['metal-'+matLvl,10]]));
	if(type === 'wood') 
		return Equip.UpgradeInfo(expRewarded,Equip.UpgradeInfo.item([['wood-'+matLvl,10]]));
	if(type === 'bone') 
		return Equip.UpgradeInfo(expRewarded,Equip.UpgradeInfo.item([['bone-'+matLvl,10]]));

	if(type === 'ruby' || type === 'sapphire' || type === 'topaz'){
		var random = ['metal-','wood-','bone-'].$random();
		var item = [
			[type + '-'+ matLvl,2],
			[random+matLvl,1]
		];
		return Equip.UpgradeInfo(expRewarded,Equip.UpgradeInfo.item(item));
	} 
	
	if(type === 'mace' || type === 'sword' || type === 'spear')
		return Equip.UpgradeInfo(expRewarded,Equip.UpgradeInfo.item([['metal-'+matLvl,15]]));
		
	if(type === 'bow' || type === 'crossbow' || type === 'boomerang')
		return Equip.UpgradeInfo(expRewarded,Equip.UpgradeInfo.item([['wood-'+matLvl,15]]));
		
	if(type === 'wand' || type === 'orb' || type === 'staff')
		return Equip.UpgradeInfo(expRewarded,Equip.UpgradeInfo.item([['bone-'+matLvl,10]]));
	return ERROR(3,'invalid piece type',type,piece);
}

Equip.Name = function(pieceType,boost){
	var name = '';
	if(pieceType.piece === 'weapon'){
		name = pieceType.type.capitalize();
	} else {
		name = pieceType.type.capitalize() + ' ' + pieceType.piece.capitalize();
	}
	if(boost.length == 3 || boost.length == 4){
		name = Equip.Name.PREFIX.$random() + ' ' + name
	}
	if(boost.length == 5 && boost.length == 6){
		name = name + ' ' + Equip.Name.SUFFIX.$random();
	}
	if(boost.length > 6)
		name = Equip.Name.PREFIX.$random() + ' ' + name + ' ' + Equip.Name.SUFFIX.$random();
	return name;
}

Equip.Name.PREFIX = ['Awesome','Super','Amazing','Great','Good','Nice','Cool','Legendary','Rare','Epic','Lame'];

Equip.Name.SUFFIX = ['of Strength','of Wisdom','of Courage','of Epicness'];


Equip.Lvl = function(lvl){
	lvl = lvl || 0
	return Math.max(0,Math.floor(lvl * (1 + 0.2*Math.randomML())));		//aka lvl += 10%
}

Equip.Boost = function(stat,value,type){
	return Boost.Perm(stat,value,type);
}

Equip.generateRarity = Equip.generateQuality = function(rarity){
	rarity = rarity || 0;
	return Math.max(0,rarity * Math.random() * 0.5 + Math.randomML());
}

//#######################

Equip.RawDmg = function(equip,lvl,main){	//1.5 is if good element
	if(equip.piece !== 'weapon') main = 0;
	return {
		main:Combat.getMainDmgDefByLvl(lvl)/Combat.WEAPON_MAIN_MOD * main,
		ratio:Equip.generateRatio(equip.piece,equip.type)
	};
}

Equip.RawDef = function(equip,lvl,main){	//2.25 is average
	if(equip.piece === 'weapon') main = 0;
	return {
		main:Combat.getMainDmgDefByLvl(lvl)/Combat.ARMOR_MAIN_MOD * main,
		ratio:Equip.generateRatio(equip.piece,equip.type)
	};
}

Equip.Def = Equip.Dmg = function(rawdef,mastery){
	var mod = Combat.getMasteryExpMod(mastery);
	return {
		main:rawdef.main * mod,
		ratio:rawdef.ratio,
	};
}

Equip.Icon = function(equip){
	return equip.piece + '.' + equip.type;
}

Equip.Color = function(equip){
	if(equip.maxAmount <= 1) return 'white'; 
	if(equip.boost.length <= 3) return 'blue';  
	if(equip.boost.length <= 5) return 'orange';  
	return 'gold';  
}

Equip.compressDb = function(e){
	return e;
}

Equip.uncompressDb = function(e){
	return e;
}

Equip.uncompressDbAndAdd = function(e){
	e = Equip.uncompressDb(e);
	Equip.createFromModel(e,false);
}

Equip.compressClient = function(equip){
	return equip;
}

Equip.PIECE_VALUE_MOD = {
	ring:1.5,	
	amulet:2,		
	helm:1.5,	
	body:2,
	weapon:1.5,
}

Equip.generateRatio = function(piece,type){
	//Weapon
	if(type === 'mace') return {melee:1.5,range:1,magic:1,fire:1.5,cold:1,lightning:1};
	else if(type === 'spear') return {melee:1.5,range:1,magic:1,fire:1,cold:1.5,lightning:1};
	else if(type === 'sword') return {melee:1.5,range:1,magic:1,fire:1,cold:1,lightning:1.5};
	else if(type === 'bow') return {melee:1,range:1.5,magic:1,fire:1.5,cold:1,lightning:1};
	else if(type === 'crossbow') return {melee:1,range:1.5,magic:1,fire:1,cold:1.5,lightning:1};
	else if(type === 'boomerang') return {melee:1,range:1.5,magic:1,fire:1,cold:1,lightning:1.5};
	else if(type === 'wand') return {melee:1,range:1,magic:1.5,fire:1.5,cold:1,lightning:1};
	else if(type === 'staff') return {melee:1,range:1,magic:1.5,fire:1,cold:1.5,lightning:1};
	else if(type === 'orb') return {melee:1,range:1,magic:1.5,fire:1,cold:1,lightning:1.5};
	
	//Armor
	var valueStab = Equip.PIECE_VALUE_MOD[piece];
	
	if(type === 'metal') return {melee:valueStab,range:1,magic:1,fire:0,cold:0,lightning:0};
	else if(type === 'wood') return {melee:1,range:valueStab,magic:1,fire:0,cold:0,lightning:0};
	else if(type === 'bone') return {melee:1,range:1,magic:valueStab,fire:0,cold:0,lightning:0};
	
	else if(type === 'ruby') return {melee:0,range:0,magic:0,fire:valueStab,cold:1,lightning:1};
	else if(type === 'sapphire') return {melee:0,range:0,magic:0,fire:1,cold:valueStab,lightning:1};
	else if(type === 'topaz') return {melee:0,range:0,magic:0,fire:1,cold:1,lightning:valueStab};
	
	return ERROR(3,'wrong type or piece',type,piece) || {melee:0,range:0,magic:0,fire:1,cold:1,lightning:1.5}
}

Equip.createItemVersion = function(equip){
	var option = [
		ItemModel.Option(Main.openDialog,'Examine Equip',null,[OptionList.MAIN,'equipPopup',{id:equip.id}]),	//based on Dialog.EquipPopup
		ItemModel.Option(Actor.equip.click,'Wear Equip',null,[OptionList.ACTOR,equip.id]),
	];
	var extra = {type:'equip',drop:0};
	
	if(equip.salvagable)	
		option.push(ItemModel.Option(Equip.salvage,'Salvage','Destroy equip into crafting materials.',[equip.id]));
	else 
		option.push(ItemModel.Option(Equip.destroy,'Destroy','Destroy the equip permanently.',[equip.id]));
	//if(equip.upgradable && equip.boost.length < equip.maxAmount)	
	//	option.push(ItemModel.Option(Equip.upgrade.click,'Upgrade','Use crafting materials to unlock addition boost.',[equip.id]));
		
	ItemModel.create(equip.quest,equip.id,equip.name,Equip.Icon(equip),option,null,extra);
}

//#########################

Equip.boundToAccount = function(key,eid){
	//when account bound =>add 1 bonus, if self found => all boost become *1.2
	var equip = DB[eid];
	if(!equip) return;
	if(equip.accountBound) return;
	
	var weared = false;		//if wearing the equip when modifying it. aka not in inv yet
	var act = Actor.get(key);
	if(Actor.haveEquip(act,eid)){
		weared = true;
		Actor.removeEquip(act,equip.piece);
	}	
		
	if(!Main.haveItem(Main.get(key),eid)) return;
	
	//add boost
	equip.boost.push(CraftBoost.generateBoost(equip.piece,equip.type));	//add boost
	equip.maxAmount++;
	equip.color = Equip.Color(equip);
	equip.id = Math.randomId();
	
	if(equip.creator === Actor.get(key).username){
		for(var i in equip.boost)
			equip.boost[i].value *= 1.2;
	}
	equip.accountBound = 1;
	
	//######
	var main = Main.get(key);
	Main.removeItem(main,eid);
	
	var newEquip = Equip.createFromModel(equip,true);
	Main.addItem(main,newEquip.id);
	
	if(weared)
		Actor.changeEquip(act,newEquip.id);
		
	Message.add(key,'Equip succesfully account bound.');
}

Equip.removeFromDb = function(eid){
	if(!DB[eid]) return ERROR(3,'equip dont exist',eid);
	if(DB[eid].quest) return;
	if(!DELETE_EQUIP_DB_WHEN_UPGRADE) return;
	delete DB[eid];
	db.equip.remove({'id':eid});
}

Equip.salvage = function(key,id){
	var main = Main.get(key);
	if(!Main.haveItem(main,id)) return ERROR(4,'salvaging item but dont own it',id);
	var equip = DB[id];
	if(!equip) return ERROR(3,'no equip');
	if(!equip.salvagable) return Message.add(key,'You can\'t salvage the equip.');
	
	Main.question(Main.get(key),function(){
		Main.removeItem(main,id);
		
		//add item
		var item = {};
		item[Material.getRandom(Actor.getLevel(Actor.get(key)))] = equip.boost.length + 1;
		Main.addItem(main,item);
		
		//give exp
		/*
		var expAmount = (equip.boost.length + 1)*250;
		var act = Actor.get(key);
		if(equip.creator === act.username)
			Actor.addExp(act,expAmount);
		*/
		
		Message.add(key,'You salvaged the equip.');
		Equip.removeFromDb(id);
	},'Are you sure you want to destroy this equip into crafting materials?','boolean');
}

Equip.destroy = function(key,id){
	var main = Main.get(key);
	Main.question(main,function(){
		Main.removeItem(main,id);
		Equip.removeFromDb(id);
	},'Destroy this equip permanently?','boolean');
}

Equip.fetchList = function(list,username,cb){
	if(FETCH_ALL_DB_INIT) return cb();
	db.equip.find({id:{$in:list}},{_id:0},function(err,results){
		if(err) ERROR.err(3,err);
		for(var i in results)	
			Equip.uncompressDbAndAdd(results[i]);
			//if(equip.creator !== username)	//added trading...
			//	ERROR(2,'equip ' + equip.id + ' owned by ' + username + ' but created by ' +  equip.creator);
		cb();
	})	
}

Equip.onSignOff = function(inv,bank,equip){
	if(FETCH_ALL_DB_INIT) return;
	
	// !quest => randomly generated
	for(var i in inv){
		if(Equip.get(i) && !Equip.get(i).quest)	//i[0] === START_ITEM_ID
			Equip.removeFromRAM(i);
	}
	for(var i in bank){
		if(Equip.get(i) && !Equip.get(i).quest)
			Equip.removeFromRAM(i);
	}
	for(var i in equip){
		if(equip[i] && !Equip.get(equip[i]).quest)
			Equip.removeFromRAM(equip[i]);
	}
		
}

Equip.getAllEquipOwned = function(key){
	var list = ItemList.getAllItemOwned(key);
	var equip = Actor.getEquip(Actor.get(key)).piece;
	
	for(var i in equip)
		list.push(i);
	
	for(var i = list.length-1; i >= 0; i--){
		if(!Equip.get(list[i]))
			list.splice(i,1);
	}
	return list;
}

Equip.removeFromRAM = function(id){
	if(FETCH_ALL_DB_INIT) return;
	delete DB[id];
	ItemModel.removeFromRAM(id);
}

Equip.upgrade = function(equip){
	var equip = Tk.deepClone(equip);	//case Qsystem-
	
	for(var i in equip.upgradeInfo.item)	//increase cost to upgrade again
		equip.upgradeInfo.item[i] = equip.upgradeInfo.item[i] * 2;
		
	equip.id = Math.randomId();
	equip.boost.push(CraftBoost.generateBoost(equip.piece,equip.type));	//add boost
	equip.color = Equip.Color(equip);
	
	return Equip.createFromModel(equip,true);
}

Equip.upgrade.click = function(key,eid){
	var equip = DB[eid];
	if(!equip.upgradable)
		return Message.add(key,'You can\'t upgrade this equip.');
	if(equip.boost.length >= equip.maxAmount)
		return Message.add(key,'You can not longer upgrade this equip.');
	
	var main = Main.get(key);
	if(!Main.haveItem(main,equip.upgradeInfo.item))
		return Message.add(key,'You don\'t have the material required.');
	
	
	var weared = false;		//if wearing the equip when modifying it. aka not in inv yet
	var act = Actor.get(key);
	if(Actor.haveEquip(act,eid)){
		weared = true;
		Actor.removeEquip(act,equip.piece);
	}	
	
	if(!Main.haveItem(main,eid)) 
		return ERROR(3,'dont have equip') || Message.add(key,'You don\'t have this item.');
		
	Main.removeItem(main,eid);
	Main.removeItem(main,equip.upgradeInfo.item);
	
	var newid = Equip.upgrade(equip).id;
	Main.addItem(main,newid);
	Equip.removeFromDb(eid);
	
	if(weared)
		Actor.changeEquip(act,newid);
		
	Message.add(key,'You upgraded your equip. It now has an additional boost.');	
}

Equip.addMasteryExp = function(key,eid,amount){
	var equip = DB[eid];
	if(!equip) return;
	if(!equip.upgradable)
		return Message.add(key,'You can\'t upgrade this equip.');
	amount = amount.mm(0,Actor.getExp(Actor.get(key))).r(0);
	if(!amount)
		return Message.add(key,'You don\'t have Mastery Point to spend.');
	
	var weared = false;		//if wearing the equip when modifying it. aka not in inv yet
	var act = Actor.get(key);
	if(Actor.haveEquip(act,eid)){
		weared = true;
		Actor.removeEquip(act,equip.piece);
	}	
	
	var main = Main.get(key);
	if(!Main.haveItem(main,eid)) 
		return ERROR(3,'dont have equip') || Message.add(key,'You don\'t have this item.');
			
	var equip = Tk.deepClone(equip);	//case Qsystem-
	equip.masteryExp += amount;
	equip.def = Equip.Def(equip.defRaw,equip.masteryExp);
	equip.dmg = Equip.Dmg(equip.dmgRaw,equip.masteryExp);
	equip.id = Math.randomId();
	
	Actor.addExp(Actor.get(key),-amount);
	Main.removeItem(Main.get(key),eid);
	Equip.removeFromDb(eid);
	
	Equip.createFromModel(equip,true);
	Main.addItem(Main.get(key),equip.id);
	
	if(weared)
		Actor.changeEquip(act,equip.id);
		
	Message.add(key,'Your equip is now more powerful.');	
}

Equip.addMasteryExp.click = function(key,eid){
	var main = Main.get(key);
	Main.question(main,function(key,num){
		num = Math.floor(+num);
		num = Math.min(num,Actor.getExp(Actor.get(key)));
		if(isNaN(num) || num < 1) return Message.add(key,'Not a number');
		
		var equip = Equip.get(eid);
		if(!equip) return;
		
		var boostOld = Combat.getMasteryExpMod(equip.masteryExp);
		var boostNew = Combat.getMasteryExpMod(equip.masteryExp + num);
		var powerOld;
		var powerNew;
		if(equip.piece === 'weapon'){
			powerOld = Combat.getVisiblePower(equip.dmg.main);
			powerNew = Combat.getVisiblePower(equip.dmg.main / boostOld * boostNew);
		} else {
			powerOld = Combat.getVisiblePower(equip.def.main);
			powerNew = Combat.getVisiblePower(equip.def.main / boostOld * boostNew);
		}
			
		var str = 'Spend ' + num.r(0) + ' Exp to upgrade from <br>' + powerOld.r(2) + ' to ' + powerNew.r(2) + ' Power?';
		Main.question(main,function(key){
			Equip.addMasteryExp(key,eid,num);
		},str,'boolean');
	},'How many points do you want to invest?','number');
}

Equip.getSignInPack = function(key){	//warning, compress everytime needed
	var list = Equip.getAllEquipOwned(key);
	var pack = {};
	for(var i = 0 ; i < list.length; i++){
		pack[list[i]] = Equip.compressClient(Equip.get(list[i]));
	}
	return pack;	
}



















