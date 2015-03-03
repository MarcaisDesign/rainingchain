//01/21/2015 6:45 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QbulletHeaven',{
	name:"Bullet Heaven",
	author:"rc",
	thumbnail:true,
	maxParty:4,
	reward:{"ability":{'Qsystem-player-lightningBullet':0.5}},
	description:"Survive as long as you can in a cave filled with deadly towers."
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
enter map, towers keep spawning
survive long enough and win.
kill blue towers to make it easier
*/

s.newVariable({
	time:0,
	timeToSurvive:1500,
	survivedEnough:False,
	killTower:0
});

s.newHighscore('killTower',"Tower Killed","Most Towers Killed",'descending',function(key){
	return s.get(key,'killTower');
});
s.newHighscore('timer',"Longest Time","Longest Time Surviving",'descending',function(key){
	return s.get(key,'time')*40;
});

s.newChallenge('killTower',"Tower Killer","Kill 50 Towers and finish the quest.",2,function(key){
	return true;
});
s.newChallenge('infinite',"Infinite","Last at least 2 minutes to win.",2,function(key){
	return true;
});
s.newChallenge('powerless',"Powerless","You cannot kill Towers.",2,function(key){
	return true;
});

s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-east','a',200))
		s.callEvent('startGame',key);
	else s.addQuestMarker(key,'start','QfirstTown-east','a');
});
s.newEvent('_debugSignIn',function(key){ //
	//s.teleport.force(key,1632,48,'QfirstTown-eastCave','main');
	s.teleport.force(key,1648,208,'QfirstTown-east','main');
});
s.newEvent('_hint',function(key){ //
	if(s.isChallengeActive(key,'killTower'))
		return 'Tower Kill Count: ' + s.get(key,'killTower');
	return "Try to destroy the towers when they turn blue.";
});
s.newEvent('_death',function(key){ //
	s.set(key,'time',s.stopChrono(key,'time'));	//used for highscore only
	
	if(s.get(key,'survivedEnough')){
		s.completeQuest(key);
	} else {
		s.message(key,'You didn\'t survive long enough...');
		s.failQuest(key);
	}
});
s.newEvent('_abandon',function(key){ //
	s.teleport(key,'QfirstTown-east','a','main');
	s.setRespawn(key,'QfirstTown-east','a','main');
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('startGame',function(key){ //teleport and start timer.
	s.teleport(key,'base','e5','party',true);
	s.setRespawn(key,'QfirstTown-east','a','main',true);
	s.removeQuestMarker(key,'start');
	
	if(s.isChallengeActive(key,'powerless')){
		s.addBoost(key,'globalDmg',0);
	} else {
		s.displayPopup(key,'Destroy the towers when they turn blue.',25*3);
	}
	if(s.isChallengeActive(key,'infinite')){
		s.set(key,'timeToSurvive',120*25);
	}
	if(!s.isChallengeActive(key,'killTower')){
		s.message(key,'Try to survive for ' + s.frameToChrono(s.get(key,'timeToSurvive')) + ' and you win!');
		s.startChrono(key,'time');		
		s.setTimeout(key,'surviveLongEnough',s.get(key,'timeToSurvive'));
	} else {
		s.message(key,'Kill 50 towers and you win!');
	}
	
	s.addBoost(key,'hp-regen',2);
});
s.newEvent('surviveLongEnough',function(key){ //
	s.message(key,'You survived long enough! Dying now will complete the quest! But you can continue for the highscore.');
	s.set(key,'survivedEnough',true);
});
s.newEvent('spawnEnemy',function(key){ //spawn a random tower at a random spot. called via map loop
	var SPOT = ['e1','e2','e3','e4','e5','e6','e7','e8','ea'];	//list of spot where towers can spawn	
	var TOWER = {dart:3,fire:2,ice:1,onMove:1};	//list of tower that can be spawned (number used to impact chance)
	
	var enemy = 'tower-' + TOWER.$random();
	var spot = SPOT.$random();
	s.spawnActorGroup(key,'base',spot,false,[
		s.spawnActorGroup.list(enemy,1,{deathEvent:'killTower'})
	],null,300);			//advanced: v:300 means that the enemy will spawn +- 300 px from the spot letter
});
s.newEvent('killTower',function(key){ //
	var amount = s.add(key,'killTower',1);	//used for highscore
	if(amount >= 50 && s.isChallengeActive(key,'killTower')) 
		s.completeQuest(key);
});

s.newAbility('tower-red0','attack',{
	name:"Fire Bullet",
	icon:'attackMagic.fireball'
},{
	type:'bullet',
	amount:4,
	angleRange:360,
	aim:25,
	dmg:s.newAbility.dmg(150,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	maxTimer:500,
	sprite:s.newAbility.sprite('fireball',1.2)
});
s.newAbility('tower-dart0','attack',{
	name:"Lightning Bullet",
	icon:'attackMagic.static'
},{
	type:'bullet',
	aim:25,
	dmg:s.newAbility.dmg(150,'lightning'),
	hitAnim:s.newAbility.anim('lightningHit',0.5),
	maxTimer:500,
	sprite:s.newAbility.sprite('lightningball',1)
});
s.newAbility('tower-ice0','attack',{
	name:"Cold Bullet",
	icon:'attackMagic.crystal'
},{
	type:'bullet',
	aim:25,
	dmg:s.newAbility.dmg(1,'cold'),
	hitAnim:s.newAbility.anim('coldHit',0.5),
	chill:s.newAbility.status(1,1,1),
	maxTimer:500,
	sprite:s.newAbility.sprite('iceshard',1)
});
s.newAbility('tower-onMove0','attack',{
	name:"Fire Nova",
	icon:'attackMagic.fireball',
	periodOwn:50,
	periodGlobal:50,
	delay:5
},{
	type:'bullet',
	dmg:s.newAbility.dmg(150,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	spd:5,
	sprite:s.newAbility.sprite('fireball',1),
	onMove:s.newAbility.onMove(4,3,{
		type:'bullet',
		dmg:s.newAbility.dmg(25,'fire'),
		sprite:s.newAbility.sprite('fireball',1),
		spd:10,
	}),	
});

s.newNpc('tower-fire',{
	name:"Tower",
	hp:1,
	nevermove:True,
	boss:s.newNpc.boss('tower'),
	sprite:s.newNpc.sprite('tower-red',1),
	moveRange:s.newNpc.moveRange(5,5),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('tower-red0',[1,1,1])
	])
});
s.newNpc('tower-dart',{
	name:"Tower",
	hp:1,
	nevermove:True,
	boss:s.newNpc.boss('tower'),
	sprite:s.newNpc.sprite('tower-red',1),
	moveRange:s.newNpc.moveRange(5,5),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('tower-dart0',[1,1,1])
	])
});
s.newNpc('tower-ice',{
	name:"Tower",
	hp:1,
	nevermove:True,
	boss:s.newNpc.boss('tower'),
	sprite:s.newNpc.sprite('tower-red',1),
	moveRange:s.newNpc.moveRange(5,5),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('tower-ice0',[1,1,1])
	])
});
s.newNpc('tower-onMove',{
	name:"Tower",
	hp:1,
	nevermove:True,
	boss:s.newNpc.boss('tower'),
	sprite:s.newNpc.sprite('tower-red',1),
	moveRange:s.newNpc.moveRange(5,5),
	abilityAi:s.newNpc.abilityAi([
		s.newNpc.abilityAi.ability('tower-onMove0',[1,1,1])
	])
});

s.newMap('base',{
	name:"Bullet Heaven",
	lvl:0,
	grid:["00000000000000000000001100000000000000111100000110","01111110000000000000001100000000000000111100000110","11111111000000000000001100000000000000111100000110","11111111111111111111111111111111111111111110000011","01111111111111111111111111111111111111111111000001","00000001111111111111111111111111111111111111100000","00000001111111111111111111111111111111111111100000","11100001100000000000000000000000000000000001100000","00110001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100000000000000000000000000000000001100000","00010001100002222222222222222222222222220001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100111","00010001100002000000000000000000000000020001111111","00010001100002000000000000000000000000020001111111","00010001100002000000000000000000000000020001100111","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100110","00010001100002000000000000000000000000020001100110","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001100000","00010001100002000000000000000000000000020001111100","11110001100002000000000000000000000000020001111100","11100001100002222222222222222222222222220001100000","01000001100000000000000000000000000000000001100000","00011111100000000000000000000000000000000001100000","00011111100000000000000000000000000000000001100000","00001111100000000000000000000000000000000001100000","00000111100000000000000000000000000000000001100000","00000111100000000000000000000000000000000001100000","00111111111111111111111111111111111111111111111100","01100011111111111111111111111111111111111111111100","01000001100000000000000000000000000000000000111100","01000001100000000000000000000000000000000000111110","01000000111111111111111111111111111100000000111110","01000000000000000000000000000000000110000000111110","01000000000000000000000000000000000010000000111110","01000000000000000000000000000000000010000000011100"],
	tileset:'v1.2'
},{
	spot:{e1:{x:496,y:400},e2:{x:848,y:400},e3:{x:1168,y:400},e4:{x:496,y:784},e5:{x:848,y:784},e6:{x:1168,y:784},e7:{x:496,y:1104},e8:{x:848,y:1104},ea:{x:1168,y:1104}},
	load:function(spot){
		
	},
	loop:function(spot){
		if(!m.testInterval(100)) return;	//every 4 sec
		var key = m.getRandomPlayer(spot);
		s.callEvent('spawnEnemy',key);	//if so, spawn 2 towers
		s.callEvent('spawnEnemy',key);
	}
});
s.newMapAddon('QfirstTown-east',{
	spot:{a:{x:1648,y:208}},
	load:function(spot){
		m.spawnTeleporter(spot.a,'startGame','cave',{	//add telezone so player can start the quest
			minimapIcon:'minimapIcon.quest',
		});
	}
});

s.newBoss('tower',s.newBoss.variable({}),function(boss){
	s.newBoss.phase(boss,'intro',{
		transitionTest:function(boss){
			return 'invincible';
		},
	});

	s.newBoss.phase(boss,'invincible',{
		transitionTest:function(boss){
			if(b.get(boss,'_framePhase') > 25*10) 
				return 'vulnerable';
		},
		transitionIn:function(boss){
			s.addBoost(boss,'globalDef',1000000000,10*25,'bossBoost');	//TOFIX weird, need to be 8 sec and not 10
			s.setSprite(boss,'tower-red');
		},
		transitionOut:function(boss){
			s.removeBoost(boss,'bossBoost','globalDef');	//TOFIX weird, need to be 8 sec and not 10
			s.setSprite(boss,'tower-blue');	
		}
	});

	s.newBoss.phase(boss,'vulnerable',{
		transitionTest:function(boss){
			if(b.get(boss,'_framePhase') > 25*4) 
				return 'invincible';
			}
		}
	);
});

s.exports(exports);
