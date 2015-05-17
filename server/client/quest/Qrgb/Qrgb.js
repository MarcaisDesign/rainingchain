//02/07/2015 8:40 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','Qrgb',{
	name:"RGB",
	author:"rc",
	thumbnail:true,
	description:"You must restore the RBG setting by activating 2 switches guarded by enemies.",
	maxParty:4,
	category:["Combat"],
	solo:true,
	party:"Coop",
	zone:"QfirstTown-south",
	reward:{"ability":{'Qsystem-player-healCost':0.5}},
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
activate switch
screen goes red
npc tell u fucked rgb setting
need to go activate blue and green switch to restore rgb
mark them on minimap
switch guarded by monsters
*/

s.newVariable({
	toggleRed:False,
	toggleBlue:False,
	toggleGreen:False,
	haveQuestMarker:False,
	killBlue:0,
	killGreen:0,
	chrono:0
});

s.newHighscore('speedrun',"Fastest Time","Fastest Time with Deathly Tower active.",'ascending',function(key){
	if(s.isChallengeActive(key,'deathlytower'))
		return s.get(key,'chrono');	
	return null;
});

s.newChallenge('hp100',"100 Hp","Complete the quest with only 100 max hp.",function(key){
	return true;
});
s.newChallenge('min4',"Speedrun","Complete the quest within 4 minutes.",function(key){
	return s.get(key,'chrono') < 25*60*4;
});
s.newChallenge('deathlytower',"Deathly Tower","Towers are harder to kill. WAY HARDER.",function(key){
	return true;
});

s.newEvent('talkNpc',function(key){ //
	if(s.get(key,'toggleBlue') && s.get(key,'toggleGreen')){
		return s.startDialogue(key,'razfibre','toggleBoth');
	}	
	if(!s.get(key,'toggleRed')){
		return s.startDialogue(key,'razfibre','normalNpc');
	}
	if(!s.get(key,'haveQuestMarker')){
		return s.startDialogue(key,'razfibre','activateSwitch');
	}
	if(s.get(key,'toggleRed')){
		return s.startDialogue(key,'razfibre','afterRedSwitch');
	}
});
s.newEvent('_signIn',function(key){ //
	if(s.isChallengeActive(key,'hp100')){
		s.addBoost(key,'hp-max',0.1);
		s.message(key,'You hp has been lowered because of the challenge.');
	}
	if(s.isChallengeActive(key,'min4') || s.isChallengeActive(key,'deathlytower')){
		s.failQuest(key);
	}
	
	if(s.get(key,'toggleRed'))
		s.addTorchEffect(key,"red",1000000,"rgba(255,0,0,0.3)",10);
	
	if(s.get(key,'toggleBlue')){
		s.addTorchEffect(key,"blue",1000000,"rgba(0,0,255,0.3)",10);
	} else {
		s.addQuestMarker(key,"blue",'QfirstTown-north','t1');
	}	
	if(s.get(key,'toggleGreen')){
		s.addTorchEffect(key,"green",1000000,"rgba(0,255,0,0.3)",10);
	} else {
		s.addQuestMarker(key,"green",'QfirstTown-south','t1');
	}
});
s.newEvent('_start',function(key){ //
	if(s.isChallengeActive(key,'hp100')){
		s.addBoost(key,'hp-max',0.1);
		s.message(key,'You hp has been lowered because of the challenge.');
	}
	if(s.isAtSpot(key,'QfirstTown-main','q1',200))
		s.callEvent('toggleRed',key);
	s.addQuestMarker(key,'myQuestMarker','QfirstTown-main','q1');
});
s.newEvent('_complete',function(key){ //
	if(s.isChallengeActive(key,'min4') || s.isChallengeActive(key,'deathlytower'))
		s.set(key,'chrono',s.stopChrono(key,'myChrono'));
});
s.newEvent('_hint',function(key){ //
	if(s.get(key,'toggleBlue') && s.get(key,'toggleGreen')){
		return 'Talk with Razfibre to complete the quest.'; 
	}
	if(!s.get(key,'toggleRed'))
		return 'I wonder what happens if I toggle the red switch.';
	
	if(!s.get(key,'toggleBlue')){
		if(!s.isInMap(key,'blueSwitchCave'))
			return 'Follow quest marker in minimap north, to find blue switch.';
		return 'Kill all the monsters to access the switch.';
	}
		
	
	if(!s.get(key,'toggleGreen')){
		if(!s.isInMap(key,'greenSwitchForest'))
				return 'Follow quest marker in minimap north, to find blue switch.';
		return 'The totems seem to make the monster invincible.';
	}
});
s.newEvent('toggleRed',function(key){ //
	s.startDialogue(key,'razfibre','warningRightBeforeTouching');
	if(s.isChallengeActive(key,'min4') || s.isChallengeActive(key,'deathlytower')){
		s.startChrono(key,'myChrono');	
	}
});
s.newEvent('toggleRedConfirmed',function(key){ //
	s.removeQuestMarker(key,'myQuestMarker');
	s.addTorchEffect(key,"red",1000000,"rgba(255,0,0,0.3)",10);
	s.startDialogue(key,'razfibre','activateSwitch');
	s.set(key,'toggleRed',true);
});
s.newEvent('addQuestMarker',function(key){ //
	s.set(key,'haveQuestMarker',true);
	s.addQuestMarker(key,'blue','QfirstTown-north','t1');
	s.addQuestMarker(key,'green','QfirstTown-south','t1');
});
s.newEvent('killBlue',function(key){ //
	s.add(key,'killBlue',1);
});
s.newEvent('killGreen',function(key){ //
	s.add(key,'killGreen',1);
});
s.newEvent('toggleBoth',function(key){ //
	s.teleport(key,'QfirstTown-main','n1','main');
	s.removeTorchEffect(key,'green');
	s.removeTorchEffect(key,'red');
	s.removeTorchEffect(key,'blue');
});
s.newEvent('toggleBlue',function(key){ //
	s.set(key,'toggleBlue',true);
	s.removeQuestMarker(key,'blue');
	if(s.get(key,'toggleGreen'))
		return s.callEvent('toggleBoth',key);
	s.addTorchEffect(key,'blue',100000,'rgba(0,0,255,0.3)',10);
	s.displayPopup(key,'You activated the blue switch which reactivated the blue RGB parameter. Your RGB is (255,0,255).');
});
s.newEvent('toggleGreen',function(key){ //
	s.set(key,'toggleGreen',true);
	s.removeQuestMarker(key,'green');
	if(s.get(key,'toggleBlue'))
		return s.callEvent('toggleBoth',key);
	s.addTorchEffect(key,'green',100000,'rgba(0,255,0,0.3)',10);
	s.displayPopup(key,'You activated the green switch which reactivated the green RGB parameter. Your RGB is (255,255,0).');
});
s.newEvent('questComplete',function(key){ //
	s.completeQuest(key);
});
s.newEvent('teleSouthGreen',function(key){ //
	if(!s.get(key,'toggleRed'))
		return s.message(key,'You have no reason to go there.');
	s.teleport(key,'greenSwitchForest','t1','party',true);	
	s.setRespawn(key,'greenSwitchForest','t1','party');
	s.displayPopup(key,'Those red towers seem to strengthen monsters.');
	
	var model = s.isChallengeActive(key,'deathlytower')? 'totemBoss' : 'totem';
	s.spawnActor(key,'greenSwitchForest','e1',model,{tag:{totem:true}});
	s.spawnActor(key,'greenSwitchForest','e2',model,{tag:{totem:true}});
	s.spawnActor(key,'greenSwitchForest','e3',model,{tag:{totem:true}});
});

s.newAbility('fireball','attack',{
},{
	type:'bullet',
	amount:3,
	angleRange:360,
	dmg:s.newAbility.dmg(200,'fire'),
	hitAnim:s.newAbility.anim('fireHit',0.5),
	spd:s.newAbility.spd(4),
	sprite:s.newAbility.sprite('fireball',1)
});

s.newDialogue('razfibre','Razfibre','villagerMale-1',[ //{ 
	s.newDialogue.node('normalNpc',"Hey! Do NOT touch the red switch! It's dangerous.",[ 	],''),
	s.newDialogue.node('activateSwitch',"Noooo. What have you done!? I told you to not activate this switch. ",[ 
		s.newDialogue.option("My screen turned red! Wtf!",'activateSwitch2','')
	],''),
	s.newDialogue.node('activateSwitch2',"This red switch was responsible for the red parameter in your screen.	By activating it, you reset the RGB (Red, Green, Blue) settings. Only the red parameter is active now. Your RGB is (255,0,0).",[ 
		s.newDialogue.option("How can I fix it?",'activateSwitch3','')
	],''),
	s.newDialogue.node('activateSwitch3',"You need to reactivate the blue and green parameters by activating the blue and green switches. Activate them and everything should go back to normal.I will mark them on your minimap.",[ 	],'addQuestMarker'),
	s.newDialogue.node('afterRedSwitch',"Go activate the other switches I marked on your minimap.",[ 
		s.newDialogue.option("Okay, I will do that.",'','')
	],''),
	s.newDialogue.node('warningRightBeforeTouching',"Don't activate that switch! It's dangerous!",[ 
		s.newDialogue.option("*Do it anyway.*",'','toggleRedConfirmed'),
		s.newDialogue.option("*Don't do it.*",'','')
	],''),
	s.newDialogue.node('toggleBoth',"Yeah, you made it! Your RGB settings is now back to (255,255,255).",[ 
		s.newDialogue.option("No problem.",'','questComplete')
	],'')
]); //}

s.newNpc('totem',{
	nevermove:True,
	sprite:s.newNpc.sprite('tower-red',1)
});
s.newNpc('totemBoss',{
	nevermove:True,
	boss:s.newNpc.boss('totem'),
	sprite:s.newNpc.sprite('tower-red',1)
});

s.newMapAddon('QfirstTown-main',{
	spot:{n1:{x:2400,y:1344},q1:{x:2464,y:1440}},
	load:function(spot){
		m.spawnActor(spot.n1,'npc',{
			name:'Razfibre',
			dialogue:'talkNpc',
			sprite:s.newNpc.sprite('villagerMale-1',1),
			nevermove:true,
			angle:s.newNpc.angle('down')
		});
		
		m.spawnToggle(spot.q1,function(key){
			return !s.get(key,'toggleRed');
		},'toggleRed',null,null,{
			minimapIcon:'minimapIcon-quest',
		});
	}
});
s.newMap('blueSwitchCave',{
	name:"Blue Switch Cave",
	lvl:0,
	screenEffect:'cave',
	grid:["000000100000000000000010000000000000010000012221001100000000","000000100000000000000011000000000000010000012221001100000000","000000100000000000000011100000000000010000012221001110000000","000001100111111111111111111111100000010000012221001111000000","000011001111111111111111111111110000110000012221001111111111","001110001111000000011111000001111001110000012221111111111111","011100001111000000011111000001111111111111112221111111111111","111100001000000000011111000000100111111111112221001111111111","100111111000000000011111000000000001111111111111000110000000","000111111000000000000001000000000000111111111111000110000000","000000001000000000000001000000000000001111111111000110000000","000000001000000000000001000000000000001111111211111110000000","000000001000000000000001000000000000011111112221111110000110","000000011000000000000001111000000000111111122222111110000110","000000110000000000000001111000000000111111222222211111100010","000001100000000000000001110000000000110000222222200111110000","000011000000000000000111110000000000110000222222200011111000","000110000000000000001111111100000000110000222222200001111000","000100000000000000001111111110000001110000022222000000011000","000100000000000000001111111111100111110000002220000000011000","000100011000000000000111111111100111100000000000000000011000","000100011000000000000110000011100111000000000000000000011000","000100000000000000001100000001100110000000000000000000011000","000100000000000011111000000000100100000000000000000000011000","111100000000000111110000000000100100000000000000000000011000","111100010000111100000000000000000000000000000000000000011000","011111110000111000000000000000000000000000000000000000011111","000111110000110000000000000000000000000000000000000000011111","000110010000100000000000000000000000000000000000000000011000","000110000000000000000000000000000000000000000000000000011000","000110000000000000000000000000000000000000000000000000011111","000110000000000001111111111100000000000000111111111111111100","000110000000000011000000111110000000000001111111111111111100","000110000000000011000000111110000000000011110000000000111100","000110000000000011000000111110000000000111110000000000111110","000110000000000001100000111100000000001100000000000000111110","000110000000000000111111111000000000001100000000000000011110","000110000000000000011111110000000000001100000000000000001110","000110000000000000000000000000000000001100000000000000000010","000110000000000000000000000000000000001110000000000000000010","000110000000000000000000000000000000001111100000100000000010","000110000000000000000000000000000000000111100000110000000010","000110000000000000000000000000000000000011100000111000000010","000110000000000000000000000000000000000001100000111100000010","000110000000000000000000000000000000000000100000111100000110","000110000000000000000000000000000000000000100000111100111100","000110000000000000000000000000000000000000000000001111100000","000110000000000000000000000000000000000000000000001111100000","000110000000000000000000000000000000000000000000001111100000","000110000000000011000000001100000000000000000000001100110000","000110000000000110000000000110000000000000000000001100011100","001111000000000100000000000111000000000000000000001100001110","001111100000000100000000011111000000000000000000001100000011","111111110000000100000000111111000000000000000000001100000001","001111111000000100000000111111000000000000000000001111111000","000100011000001100000000111001100000000000000000001111111000","000100001111111100000000111001111111111111111111111111111000","000110001111111111111111111111111111111111111111111110011000","000011111100000110000000000000000000000000000000000110000000","000000001100000110000000000000000000000000000000000010000000"],
	tileset:'v1.2'
},{
	spot:{ea:{x:464,y:336},q1:{x:1024,y:368},e1:{x:464,y:464},eb:{x:336,y:592},ed:{x:1328,y:720},b1:{x:960,y:800,width:128,height:32},e2:{x:1520,y:816},ec:{x:1232,y:880},eh:{x:336,y:1104},s1:{x:1536,y:1120},e4:{x:336,y:1200},s2:{x:1696,y:1280},ee:{x:272,y:1296},eg:{x:1040,y:1424},e3:{x:1136,y:1520},ef:{x:1232,y:1584},t1:{x:672,y:1792}},
	load:function(spot){
		m.spawnActor(spot.ea,'bat',{deathEvent:'killBlue'});
		m.spawnActor(spot.eb,'ghost',{deathEvent:'killBlue'});
		m.spawnActor(spot.ec,'skeleton',{deathEvent:'killBlue'});
		m.spawnActor(spot.ed,'eyeball',{deathEvent:'killBlue'});
		m.spawnActor(spot.ee,'orc-melee',{deathEvent:'killBlue'});
		m.spawnActor(spot.ef,'goblin-melee',{deathEvent:'killBlue'});
		m.spawnActor(spot.eg,'orc-magic',{deathEvent:'killBlue'});
		m.spawnActor(spot.eh,'orc-range',{deathEvent:'killBlue'});
		
		m.spawnBlock(spot.b1,function(key){
			return s.get(key,'killBlue') < 8;
		},'spike');
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'QfirstTown-north','t1','main');
		},'zone','down');
		
		m.spawnToggle(spot.q1,function(key){
			return !s.get(key,'toggleBlue');
		},'toggleBlue');
	},
	playerEnter:function(key){
		s.set(key,'killBlue',0);
	},
});
s.newMapAddon('QfirstTown-north',{
	spot:{t1:{x:2928,y:1648}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,function(key){
			if(!s.get(key,'toggleRed'))
				return s.message(key,'You have no reason to go there.');
			s.teleport(key,'blueSwitchCave','t1','party',true);	
			s.setRespawn(key,'blueSwitchCave','t1','party');
		},'cave');
	}
});
s.newMap('greenSwitchForest',{
	name:"Green Switch Forest",
	lvl:0,
	screenEffect:'weather',
	grid:["22222222222222222222222222222222222222222222222222222222222222222","22222222222222222222222222222222222222222211112222222222222222222","22222222222222222222222222222211111000000011111222222222222222222","22222222222222222222222222220001111000000011110012222222222222222","22222222222222211100000000000000000000000000000011122222222222222","22222222222100001100000000000000000000000000000111100222222222222","22222222211100000000000000000000000000000000000000000022222222222","22222222211110000000000000000000000000000000000000000002222222222","22222222000000000000000000000000000000000000000000000002222222222","22222222000000000000000000000000000000000000000000000002222222222","22222222000000000000000000000000000000000000000000000002222222222","22222222000000000000000000000000000000000000000000000002222222222","22222222000000000000000000000000000000000000000011110002222222222","22222220000000000000000000000000000000000000000011110002222211222","22222220000000000000000000000000000000000000000011110002222211222","22222210000000000000000000000000000000000000000000000002222222222","22222211110000000000000000000000000000000000000000000002222222222","22222211110000000000000000000000000000000000000000000002222222222","22222211110000000000000000000000000000000000000000000002222222222","22222211110000000000000000000000000000000000000000000002222222222","22222211110000000000000000000000000000000000000000000022222222222","22222210000000000000000000000000000000000000000000000222222222222","22222220000011000000000000000000000011000210000001222222222222222","22222222000111100000000000000000111111112210000001222222222221111","22222222222222222000000002200000110011222210000001222222222211111","22222222222222222100000012222000110022222210000001222222222110000","22222222222222222100000012222222222222222210000001222222221100000","22222222222222222100000012222222222222222210000001222222221100111","22222222222222222100000012222222222222222210000001222222221111100","22222222222222222100000012222222222222222210000001222222211111000","22222000002222222100000012222222222221122000000000022211111111000","22220000000022222100000012222222222211100000000000000011111111111","22200000000000222100000011111222211000000000000000000011111111111","22100000000000000000000001111111111000000000000000000011111111000","11110000000000000000000001111111111100000000000000000011111111000","11110000000000000000000000000111111100000000000000000011111111100","11111100000000000000000000000111111100000000000000000011111100110","11111100000000000000000000000111111100000000000000000011111100011","11111100000000000000000000000100000100000000000000000011111100001","11111100000000000000000000000100000100000000000000000011111100000","11111100000000000000000000000111100100000000000000000011111100000","11111100000000000000000000000111100100000000000000000000001100000","11111100000000000000000000000100000100000000000000000000001100110","11111100000000000000000000000100000100000000000000000000001111111","11111100000000000000000000000100000100000000000000000000001100000","11111100000000000000000000000100111100000000000000000000001100000","11111111000000000000000000000111111100000000000000000001111100000","11111111000000000000000000000100000100000000000000000001111100000","11111111000000000000000000000100000100000000000000000000111100000","11111100000000000000000000000100000100000000000001111000111111111","11111100000000000000000000000100000100000000000001111001111111111","01110000000000000000000000000100000100000000000001111111111111100","00110000000000000000000000000100000100000000000001111111111111100","00110000000000000000000000000100000100000000000011111100111111111","00110000000000000000000000000100000110000000000111111000111110011","00110000000000000000000000000110011111000000001100000000011110011","00110000000000000000000000000111111111100000011000000000001111111","00110000000000000000000000001111111111110000011000111110000111111","00110000000000000000000000001111100000010000011001111111000011111","00110000000000000000000000001111100000010000011001111111000001111","00110000000000000000000000001111100000011000011001111111001100000","00111111111111100000000000011111100000011111111000111110011110000","01111111111111110000000000111111111111111111111100011100000000000","11110000001111111000000001100000000000000000011110001000000000000","00000000001111001100000011000000000000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{ee:{x:1072,y:272},e2:{x:816,y:368},ef:{x:624,y:528},ed:{x:912,y:560},eg:{x:1584,y:1200},eh:{x:1360,y:1264},ea:{x:464,y:1296},e3:{x:1488,y:1328},ec:{x:816,y:1392},ei:{x:1456,y:1456},e1:{x:624,y:1488},eb:{x:560,y:1744},b1:{x:1184,y:1760,width:288,height:32},q1:{x:1360,y:1872},t1:{x:672,y:2032}},
	load:function(spot){
		m.spawnActor(spot.ea,'bee',{tag:{monster:true},deathEvent:'killGreen'});
		m.spawnActor(spot.eb,'bat',{tag:{monster:true},deathEvent:'killGreen'});
		m.spawnActor(spot.ec,'mushroom',{tag:{monster:true},deathEvent:'killGreen'});
		
		m.spawnActor(spot.ed,'spirit',{tag:{monster:true},deathEvent:'killGreen'});
		m.spawnActor(spot.ee,'bee',{tag:{monster:true},deathEvent:'killGreen'});
		m.spawnActor(spot.ef,'mosquito',{tag:{monster:true},deathEvent:'killGreen'});
		
		m.spawnActor(spot.eg,'plant',{tag:{monster:true},deathEvent:'killGreen'});
		m.spawnActor(spot.eh,'mushroom',{tag:{monster:true},deathEvent:'killGreen'});
		m.spawnActor(spot.ei,'bigWorm',{tag:{monster:true},deathEvent:'killGreen'});
		
		
		m.spawnBlock(spot.b1,function(key){
			return s.get(key,'killGreen') < 9;
		},'spike');
		
		m.spawnToggle(spot.q1,function(key){
			return !s.get(key,'toggleGreen');
		},'toggleGreen');
		
		m.spawnTeleporter(spot.t1,function(key){
			s.teleport(key,'QfirstTown-south','t1','main');
		},'zone','down');
	},
	loop:function(spot){
		m.forEachActor(spot,100,function(key){
			s.addAnimOnTop(key,'boostPink',1.5);
		
			m.forEachActor(spot,1,function(key2){
				if(s.getDistance(key,key2) < 500){
					s.addBoost(key2,'globalDef',10000,100);
					s.addAnimOnTop(key2,'boostPink',0.5);
				}
			},'npc',null,{monster:true});
		
		},'npc',null,{totem:true});
	},
	playerEnter:function(key){
		s.set(key,'killGreen',0);
	}
});
s.newMapAddon('QfirstTown-south',{
	spot:{e1:{x:2096,y:1040},t1:{x:48,y:1248},e4:{x:1872,y:1808},e2:{x:1008,y:1872},e5:{x:848,y:2384},e3:{x:1616,y:2384},e6:{x:2608,y:2480}},
	load:function(spot){
		m.spawnTeleporter(spot.t1,'teleSouthGreen','zone','left');
	}
});

s.newBoss('totem',s.newBoss.variable({"rotAngle":0}),function(boss){
	s.newBoss.phase(boss,'phase0',{
		loop:function(boss){
			var angle = b.set(boss,'rotAngle',(b.get(boss,'rotAngle')+1)%360);
			
			if(b.get(boss,'_framePhase') % 2 === 0){
				b.useAbility(boss,'fireball',angle);
			}	
		}
	});
});

s.exports(exports);
