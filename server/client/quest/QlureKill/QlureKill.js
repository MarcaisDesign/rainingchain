//01/16/2015 10:41 PM
/*jslint node: true, undef:true, sub:true, asi:true, funcscope:true, forin:true, unused:false*//*global True, False, loadAPI*/
/*Go to http://jshint.com/ and copy paste your code to spot syntax errors.*/

'use strict';
var s = loadAPI('v1.0','QlureKill',{
	name:"Lure & Kill",
	author:"rc",
	maxParty:2,
	thumbnail:true,
	reward:{"ability":{'Qsystem-player-windKnock':0.5}},
	description:"Kill monsters by first luring them.",
	scoreModInfo:"Depends on amount of kills. [Only for Infinite Challenge]."
});
var m = s.map; var b = s.boss; var g;

/* COMMENT:
Enter zone.
3 near invincible monsters spawn, need to lure in pit to turn them vulnerable
when monster dies, another spawn.
need to kill 100
*/

s.newVariable({
	killCount:0,
	enemyStart:3,
	enemyToKill:15
});

s.newHighscore('killCount',"Most Kills","Most kills without dying. Use Challenge Infinite",'descending',function(key){
	return s.get(key,'killCount');
});
s.newHighscore('timeEasy',"Fastest Time [Easy]","Kill all monsters and finish quest.",'ascending',function(key){
	if(s.isChallengeActive(key,'insane')) return null;
	return s.stopChrono(key,'timer')*40;
});
s.newHighscore('timeHard',"Fastest Time [Insane]","Kill all monsters and finish quest with Challenge Insanity on.",'ascending',function(key){
	if(!s.isChallengeActive(key,'insane')) return null;
	return s.stopChrono(key,'timer')*40;
});

s.newChallenge('insane',"Insanity!","Fight against 10 enemies at once. Need to kill 50.",2,function(key){
	return true;
});
s.newChallenge('infinite',"Infinite","Fight until you die for highscore. Challenge and quest successful if killed 50 or more.",2,function(key){
	return true;
});
s.newChallenge('speedrun',"Speedrunner","Complete the quest in less than 3 minutes.",2,function(key){
	return s.stopChrono(key,'timer') < 3*60*25;
});

s.newEvent('_start',function(key){ //
	if(s.isAtSpot(key,'QfirstTown-north','t7',200))
		s.callEvent('talkTapis',key);
	else s.addQuestMarker(key,'start','QfirstTown-north','t7');
});
s.newEvent('_debugSignIn',function(key){ //
	s.teleport(key,'QfirstTown-north','t7','main');
});
s.newEvent('_getScoreMod',function(key){ //
	if(!s.isChallengeActive(key,'infinite')) return 1;
	return Math.pow(s.get('key','killCount')/50,1.5);
});
s.newEvent('_hint',function(key){ //
	return 'Killcount: ' + s.get(key,'killCount') + '/' + s.get(key,'enemyToKill') + ' | Red zone weaken monsters and yourself!';
});
s.newEvent('_signIn',function(key){ //
	s.failQuest(key);
});
s.newEvent('_death',function(key){ //
	if(s.get(key,'killCount') >= s.get(key,'enemyToKill')) s.completeQuest(key);	//incase doing challenge
	else s.failQuest(key);
});
s.newEvent('_abandon',function(key){ //
	s.teleport(key,'QfirstTown-north','t7','main');
	s.setRespawn(key,'QfirstTown-north','t7','main');
});
s.newEvent('_complete',function(key){ //
	s.callEvent('_abandon',key);
});
s.newEvent('startGame',function(key){ //teleport and spawn enemy
	s.removeQuestMarker(key,'start');
	var chronoVisible = !!s.isChallengeActive(key,'speedrun');
	s.startChrono(key,'timer',chronoVisible);
	s.teleport(key,'main','t1','party',true);
	s.setRespawn(key,'QfirstTown-north','t7','main');
	s.message(key,'The strange shape on the ground weakens enemies.');
	s.message(key,'Kill ' + s.get(key,'enemyToKill') + ' enemies to complete the quest.');
	
	if(s.isChallengeActive(key,'insane')){
		s.set(key,'enemyStart',10);
		s.set(key,'enemyToKill',50);
	}
	if(s.isChallengeActive(key,'infinite')){
		s.set(key,'enemyToKill',50);
	}
	
	var amount = s.get(key,'enemyStart');
	for(var i = 0; i < amount; i++){
		s.callEvent('spawnEnemy',key);
	}
});
s.newEvent('spawnEnemy',function(key){ //
	var spot = ['e1','e2','e3','e4','e5','e6','e7','e8'].$random();
	var monster = ['plant','bat','bee','mushroom','skeleton','ghost','taurus','mummy'].$random();
	s.spawnActor(key,'main',spot,monster,{
		hp:5000,
		globalDmg:0.5,
		deathEvent:'killEnemy',
	});
});
s.newEvent('killEnemy',function(key,e){ //
	var killCount = s.add(key,'killCount',1);	//increase kill count	
	if(s.isChallengeActive(key,'infinite')){
		s.callEvent('spawnEnemy',key);		//when enemy dies, it spawns a new one
		if(killCount > 8 && Math.sqrt(killCount) % 1 === 0)
			s.callEvent('spawnEnemy',key);	//spawn another one
	} else {
		if(killCount >= s.get(key,'enemyToKill')) 
			return s.completeQuest(key); 
		s.callEvent('spawnEnemy',key);		//when enemy dies, it spawns a new one
	}
});
s.newEvent('weakenActor',function(key){ //weaken enemy on red zone, check map loop, last 10 sec
	s.addBoost(key,'globalDef',0.05,25*10,'weakenActor');
	s.addBoost(key,'maxSpd',0.25,25*5,'slowerActor');
	s.addAnimOnTop(key,'boostPink');
});
s.newEvent('talkTapis',function(key){ //
	s.startDialogue(key,'Tapis','intro');
});

s.newDialogue('Tapis','Tapis','villager-male.6',[ //{ 
	s.newDialogue.node('intro',"Hello there. After years of hard work, I finally managed to finish the script for the Carpet2000!",[ 
		s.newDialogue.option("Okay?",'intro2','')
	],''),
	s.newDialogue.node('intro2',"The Carpet2000 is very special. When someone steps on it, his defence stats are lowered.",[ 
		s.newDialogue.option("Sounds cool",'intro3',''),
		s.newDialogue.option("So what?",'intro3','')
	],''),
	s.newDialogue.node('intro3',"Well, there's a little issue with it. I'm too scared to test it out myself... So go test it for me!",[ 
		s.newDialogue.option("Okay.",'intro4','')
	],''),
	s.newDialogue.node('intro4',"Just lure the monsters on the red zone and then kill them. Good luck.",[ 
		s.newDialogue.option("My body is ready.",'','startGame')
	],'')
]); //}

s.newMap('main',{
	name:"Fight Cave",
	lvl:0,
	grid:["22222222222222222222200000000100000000000100000000","22222222222222222222220000000110000000001100000000","22111222222222222222201100000011111111111000000000","22211222222222222222001100011001111111110001111110","22222222200000000000000000011000011000000011111111","22222220000000000011000000001000011000001111111111","22222000000000000000000000000000000000000001111110","22200000011111111111111111111111111111111100000000","22000000111111111111111111111111111111111110000000","20000000100001111001111111111111111111111111011000","00000000100001111011111111111111111111111111000011","01111110100000111010000000000000000000001111000111","11111111100000011010000000000000000000001111001100","11111111101111000010000000000000000000000111011000","01111110101111110110000000000000000000000011011000","00000000100000001100000000000000000000000011011000","00000110101111111000000000000000000000000011011000","00000110111111110000000000000000000000000011011000","11100000110000000000000000000000000000000011011000","11110000110000000000000000000000000000000011011000","00011000110000000000000000000000000000000011011100","00001100110000000000000000000000000000000011011110","00001100110000000000000000000000000000000011001111","00001100110000000000000000000000000000000011000111","00001100110000000000000000000000000000000011000011","00001100110000000000000000000000000000000011111101","00001100110000000000000000000000000000000011111100","00001100110000000000000000000000000000000011011100","00001100110000000000000000000000000000000011001100","00001100110000000000000000000000000000000011000000","00001111110000000000000000000000000000000011000000","00001100110000000000000000000000000000000011000000","00001100110000000000000000000000000000000011000000","00001100011111111100000000000011111111111110000000","00001100001111111110000000000111111111111111110000","00001100000000011111000000001100000000000011110000","00000111111100011111100000011011000000000000000000","00000011111110001111100000011011011111111111110000","00000000000011000001100000011000100000000000001000","00000000000001100001100000011000100000000000001000","00000000000011100001100000011000100000000000011000","00000000000111100001100000011000110000111111111000","11111111111111000001100000011000011001111111110000","11111111111110000001100000011011111111000000000000","11111111111111111101100000011011110110000000000000","11111111111111111111100000011001110000001111110000","00000000000111111110111111110000110000011111111000","00000000000011111100011111100000000000011111111000","00000000000000000000000000000000000000001111110000","00000000000000000000000000000000000000000000000000"],
	tileset:'v1.2'
},{
	spot:{e2:{x:816,y:432},e1:{x:1104,y:496},e3:{x:592,y:624},b3:{x:864,y:608,width:192,height:192},e7:{x:400,y:656},e4:{x:656,y:784},e6:{x:1168,y:784},e5:{x:912,y:912},e8:{x:464,y:944},t1:{x:752,y:1424}},
	load:function(spot){
		
	},
	loop:function(spot){
		//weak actor that are in red zone. test every 10 frames
		m.forEachActor(spot,10,'weakenActor','actor',spot.b3);
	}
});
s.newMapAddon('QfirstTown-north',{
	spot:{t7:{x:1232,y:1232},n1:{x:1168,y:1296},e2:{x:2256,y:1552},e1:{x:1584,y:1936},e3:{x:2544,y:2512}},
	load:function(spot){
		m.spawnTeleporter(spot.t7,'talkTapis','cave',{
			minimapIcon:'minimapIcon.quest',
		});
		m.spawnActor(spot.n1,'npc',{
			dialogue:'talkTapis',
			sprite:s.newNpc.sprite('villager-male6',1),
			minimapIcon:'minimapIcon.quest',
			angle:s.newNpc.angle('right'),
			nevermove:true,
			name:'Tapis',
		});
		m.spawnActorGroup(spot.e1,[
			m.spawnActorGroup.list("taurus",1),
			m.spawnActorGroup.list("mummy",1),
		]);
		
		m.spawnActorGroup(spot.e2,[
			m.spawnActorGroup.list("bird",1),
			m.spawnActorGroup.list("dragon",1),
		]);
		/*
		m.spawnActor(spot.e2,'npc',{
			nevermove:true,
			nevercombat:false,
			combat:true,
			hpMax:10000000
		});
		*/
		m.spawnActorGroup(spot.e3,[
			m.spawnActorGroup.list("salamander",1),
			m.spawnActorGroup.list("larva",1),
		]);
	}
});

s.exports(exports);
