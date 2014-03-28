var q = Quest.template();
		
q.id = 'Qtutorial';
q.name = 'Tutorial';
q.icon = 'skill.melee';
q.reward = {
	boost:{'stat':'dmg-fire-+','value':[0.05,0.10],mod:0.5},
	exp:{
		melee:100
	}
}

q.description = "Raining Chain Tutorial";


q.variable = {
	beeDead:false,
	bossDead:false,
};

q.ability['Aiceshard'] = {'type':'attack','name':'Ice Shard','icon':'attackMagic.crystal',
	'spd':{'main':1,'support':0},'period':{'own':25,'global':25},
	'action':{'func':'Combat.action.attack','param':{
		'type':"bullet",'angle':0,'amount':1,
		'objImg':{'name':"iceshard",'sizeMod':1},'hitImg':{'name':"coldHit",'sizeMod':0.5},
		'dmg':{'main':100,'ratio':{'melee':0,'range':0,'magic':30,'fire':0,'cold':70,'lightning':0}},
	}
}};
	
q.equip['Estaff'] = {
	'piece': 'magic','type': 'staff','icon':'magic.staff',
	'name':"Crappy Staff",'sprite':{'name':"mace",'sizeMod':1},
	'dmg':{'main':10,'ratio':{'melee':20,'range':0,'magic':40,'fire':40,'cold':0,'lightning':0}},
	'boost': [],
}

q.item['Ifakestaff'] = {'name':'Staff','icon':'magic.staff','option':[		
	{'name':'Examine Equip','func':'Main.examineEquip','param':['Qtutorial-Estaff']},
	{'name':'Change Equip','param':[],'func':function(key){
		Actor.learnAbility(List.all[key],'fireball');
		Actor.swapAbility(List.all[key],'fireball',0);
		Itemlist.remove(List.main[key].invList,'Qtutorial-Ifakestaff',1);
		Chat.add(key,"You can now throw fireballs with Left-Click.");
		Chat.add(key,"You can now manage your abilities via the ABILITY button under the EQUIP Tab.");
		Actor.switchEquip(List.all[key],'E-tutorial-staff');
	}},
]};	

q.plan['Pstaff'] = {
	category:'equip',
	piece:'magic',	
	type:'staff',
	unique:'Qtutorial-Ifakestaff',
	definitive:1,
	req:{item:[['wood-0',1],['Qtutorial-Pstaff',1]],skill:{}},
};
		

q.dialogue['jenny'] = {'face':'Jenny',
	'intro':{
		'intro0':{
			'text':'Do you want to help me out?',
			'option':[
				{'text':"Sure.",
					'next':{'node':'yes'},
					//'func':function(key){ Db.quest['QquestId'].giveDevice(key); },
					//'param':[],
				},
				{'text':"No. I got other things to do.",
					'next':{'node':'no'}
				},
			]
		},
		'yes':{
			'text':"Thank you so much! Take this magical shield and teleport to the Fire Monster Lair. Kill him and give me the key he will drop.",
		},
		'no':{
			'text':"What a jerk!",
		},
	
		'intro2':{
			'text':"What are you waiting for? Go kill the boss!",
		},	
	},	
	'gratz':{
		'gratz0':{
			'text':'Thanks you so much for your help. I can now unlock the barrier.',
			//'func':function(key){ Db.quest['QquestId'].giveReward(key); },
			//'param':[],
		},
		'gratz1':{
			'text':'Thanks again.',
		},
	}
};




//{Enemy
q.enemy["bee"] = {  //{
	"name":"Bee",
	"sprite":{'name':"bee",'sizeMod':1},
	"abilityList":[
		{'template':'scratch','aiChance':[0.4,0.4,0.4],'extra':{}}	
	],
	'resource':{'hp':{'max':1,'regen':1},'mana':{'max':100,'regen':1}},
	
	'globalDef':1,
	'globalDmg':0.1,
	'deathExp':1,
	"mastery":{'def':{'melee':1,'range':1,'magic':1,'fire':1,'cold':1,'lightning':1},
				'dmg':{'melee':1,'range':1,'magic':1,'fire':1,'cold':1,'lightning':1}},	
	"acc":2,
	"maxSpd":5,
	"moveRange":{'ideal':50,"confort":50,"aggressive":200,"farthest":300},	
}; //}

q.enemy["demon"] = {  //{
	"name":"Demon Immune To Fireballs.",
	"sprite":{'name':"demon",'sizeMod':1},
	"abilityList":[
		{'template':'fireNova','aiChance':[0,0.4,0.4],'extra':{}},
		{'template':'fireCircle','aiChance':[10.4,0,0],'extra':{
			'amount':9,angle:360,'burn':{baseChance:1,chance:0,magn:1,time:1}}},
		
	],
	'resource':{'hp':{'max':100,'regen':0.3},'mana':{'max':100,'regen':1}},
	'immune':{'fire':1},
	'globalDef':1,
	'globalDmg':0.2,
	'deathExp':1,
	"mastery":{'def':{'melee':1,'range':1,'magic':1,'fire':1,'cold':1,'lightning':1},
				'dmg':{'melee':1,'range':1,'magic':1,'fire':1,'cold':1,'lightning':1}},	
	"acc":2,
	"maxSpd":5,
	"moveRange":{'ideal':200,"confort":50,"aggressive":300,"farthest":400},	
}; //}
	
	
//}	


//{Map
q.map.tutorial = function(){
	var m = Init.db.map.baseMap();
	m.name = "Tutorial";
	m.tileset = 'v1.0';
	m.grid = ["11111111111111111111111111111111111110000001111111111111111111111111111111111111","11111111111111111111111111011000000000000001111111111111111111111111111111111111","11111111111111111111111111011000000000000001111111111111111111111111111111111111","11111111111111111111111111000000000000000001111111111111111111111111111111111111","11111111111111111111111111000000000000000001111111111111111111111111111111111111","11111111111111111111111111000000000000000001111111111111111111111111111111111111","11111111111111111111111111000000000001111001111111111111111111111111111111111111","11111111111111111111111111000000001101111001111111111101111111110111111111111111","11111111111111111111111111000000001101111001111111111101111111110111111111111111","11111111111111111111111111111111110000000001111111111100011111000111111111111111","11111111111111111111111111111111111111111101111111111100000000000111111111111111","11111111111111111111111111100000011111111111111111111100000000000111111111111111","11111111111111111111111111100000011111111111111111111100000000000111111111111111","11111111111111111100000000100000010000000011111111111100000000000111111111111111","11111111111111111101111000000000000001100011111111111100000000111111111111111111","11111111111111111101111000000000000001100011111111111100000001111111111111111111","11111111111111111101111000000000000000000011111111111000000011111111111111111111","11111111111111111100000000000000000000000001111111110000000111111111111111111111","11111111111111111100000000000000000000000000111111100000000111111111111111111111","11111111111111111100000000000000000000000000000000000000000211111111111111111111","11111111111111111100000000000000000000000000000000000000002221111111111111111111","11111111111111111100000000000000000000000000000000000000022222111111111111111111","11111111111111111100000000000000000000000000111111100000222222222222222221111111","11111111111111111100000000000000000000111101111111110000222222222222222221111111","11111111111111111100000000000000000000111111111111111000222222222222222222111111","11111111111111111100000000000000000000111111111111111122222222222222222222111111","11111111111111111100000000000000000000000011111111111122222222222222222222111111","11111111111111111100000000000000000000011111111111111122222222222222222222111111","11111111111111111100000000000000000000111111111111111122222222222222222221111111","11111111111111111111110000000000000001111111111111111122222222111111111111111111","11111111111111111111111000000000000011111111111111111122222221111111111111111111","11111111111111111111111100010000100011111111111111111122222211111111111111111111","11111111111111111111111101110000111011111111111111111122222111111111111111111111","11111111111111111111111111110000111111111111111111111122222111111111111111111111","11111111111111111111111110010000100111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000000110111111111111111111111111111111111111111111111","11111111111111111111111110000000110111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000000000111111111111111111111111111111111111111111111","11111111111111111111111110000100100111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111111111111100111111111111111111111111111111111111111111111111","11111111111111111111000111110100111111111111111111111111111111111111111111111111","11111111111111111111000111110000011111111111111111111111111111111111111111111111","11111111111111111111000111110000011111111111111111111111111111111111111111111111","11111111111111111111000111110000011111111111111111111111111111111111111111111111","11111111111111111111000111110000011111111111111111111111111111111111111111111111","11111000001111111111000111110000011111111111111111111111111111111111111111111111","11111000000000020000000111110000011111111111111111111112221111111111111111111111","11111000000000020000000111110000011111111111111111111112221111111111111111111111","11111000000000020000000111110000011111111111111111111122222111111111111111111111","11111000001111110000000111110000011111111111111111111222222211111111111111111111","11111000001111110000000011100000011111111111111111112222222221111111111111111111","11111111111111110000000001000000011111111110000022222222222222200011011111111111","11111111111111110000000000000000011111111110000011111111111111100011011111111111","11111111111111110000000000000000111111111110000000000000000000000000011111111111","11111111111111111111111000000001111111111110000000000000000000000000011111111111","11111111111111111111111100000001111111111110000011111111111111100000011111111111","11111111111111111111111110000001111111111110000022222222222222200000011111111111","11111111111111111111111111000001111111111110000022222222222222200000011111111111","11111111111111111111111111000001111111111110000002222222222222111110011111111111","11111111111111111111111111000000111111111100000000222222222221111110011111111111","11111111111111111111111111000000011111111000000000000222222221111110011111111111","11111111111111111111111111000000001111110000000000000002222221111110011111111111","11111111111111111111111111000000000000001111000000000000222221111110011111111111","11111111111111111111111111011000000000001111000000000000222221111110011111111111","11111111111111111111111111111000000000001111111100000000222221100000011111111111","11111111111111111111111111111000000000000000111100000000222222001100011111111111","11111111111111111111111111111111111110000000111100000000222222001100011111111111","11111111111111111111111111111111111111000000000020000000222222200000011111111111","11111111111111111111111111111111111111100000000020000000222222220000011111111111","11111111111111111111111111111111111111100000000020000000222222222111111111111111","11111111111111111111111111111111111111100000000000000000222222222111111111111111","11111111111111111111111111111111111111100000000000000011122222221111111111111111","11111111111111111111111111111111111111111110000000000100012222221111111111111111","11111111111111111111111111111111111111111111000000001100001222222111111111111111","11111111111111111111111111111111111111111111100000011111000122222111111111111111","11111111111111111111111111111111111111111111110000111111000012222111111111111111","11111111111111111111111111111111111111111111110000111111000001111111111111111111","11111111111111111111111111111111111111111111110000100000011111111111111111111111","11111111111111111111111111111111111111111111111001100000011111111111111111111111","11111111111111111111111111111111111111111111111001100000011111111111111111111111","11111111111111111111111111111111111111111111110000110000000011111111111111111111","11111111111111111111111111111111111111111111110000111000000011122211111111111111","11111111111111111111111111111111111111111111100000011100111111122211111111111111","11111111111111111111111111111111111111111111000000001100111111222211111111111111","11111111111111111111111111111111111111111110000000110100111112222211111111111111","11111111111111111111111111111111111111100000000000110000112222222211111111111111","11111111111111111111111111111111111111100000000000000000112222222211111111111111","11111111111111111111111111111111111111100000000000000000002222222211111111111111","11111111111111111111111111111111111111101111000000000000000222222211111111111111","11111111111111111111111111111111111111101111000000000000000222222211111111111111","11111111111111111111111111111111111111101111000000000000000222222211111111111111","11111111111111111111111111111111111111100000000000000000000222222211111111111111","11111111111111111111111111111111111111100000000000000000002222222211111111111111","11111111111111111111111111111111111111111111111111111111111112222211111111111111","11111111111111111111111111111111111111111111111111111111111111222211111111111111","11111111111111111111111111111111111111111111111111111111111111122211111111111111","11111111111111111111111111111111111111111111111111111111111111112111111111111111","11111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111","01111111111111111111111111111111111111111111111111111111111111111111111111111111"] ;
	m.lvl = 0;	
	var tut = m.addon.Qtutorial = {};
	tut.spot = {"m":{"x":1904,"y":272},"n":[864,1024,352,384],"l":{"x":1840,"y":464},"k":{"x":944,"y":656},"q":{"x":1056,"y":1184},"e":{"x":576,"y":1680},"j":{"x":992,"y":1696},"i":{"x":976,"y":1872},"a":{"x":240,"y":1904},"f":{"x":544,"y":1968},"o":{"x":912,"y":2288},"b":{"x":2176,"y":2464},"c":{"x":2080,"y":2496},"d":{"x":1552,"y":2544},"g":{"x":1760,"y":2880},"h":{"x":1824,"y":3136},"p":{"x":1808,"y":3248}};

	tut.variable = {
		rotation: -9,
		angle:0,
		arrow:{'type':"bullet",'angle':15,'amount':1,'objImg':{'name':"arrow",'sizeMod':1},'hitImg':{'name':"coldHit",'sizeMod':0.5},
			'dmg':{'main':10000,'ratio':{'melee':100,'range':0,'magic':0,'fire':0,'cold':0,'lightning':0}}},	
		fireball:{maxTimer:20,'type':"bullet",'angle':0,'amount':1,'objImg':{'name':"fireball",'sizeMod':1},'hitImg':{'name':"coldHit",'sizeMod':0.5},
			'dmg':{'main':10000,'ratio':{'melee':100,'range':0,'magic':0,'fire':0,'cold':0,'lightning':0}}},		

	};
			
	tut.load = function(map,spot,v,m){
		SkillPlot.creation({'xym':spot.e,
			"quest":"Qtutorial",'num':0,"type":"treeRed"
		});
		
		//grave
		Actor.creation({'xym':spot.h,
			"category":"system","variant":"grave"
		});
		
		Actor.creation({'xym':spot.q,
			"category":"system","variant":"grave"
		});
		
		//chest
		Actor.creation({'xym':spot.m,
			"category":"system","variant":"chest",extra:{
				'chest':function(key){
					Itemlist.add(List.main[key].invList,'Qtutorial-Aiceshard',1);
					return true;
				}
			}
		});
		
		//drop staff
		Drop.creation({'xym':spot.o,
			"item":"Qtutorial-Pstaff","amount":1,'timer':1/0
		});
		
		//block for switch
		Actor.creation({'xym':spot.b,
			"category":"block","variant":"2x2"
		});
		//Block to block arrow
		Actor.creation({'xym':spot.f,
			"category":"block","variant":"2x2"
		});
		
		//Block that disppear when bee dead
		Actor.creation({'xym':spot.j,
			"category":"block","variant":"2x2Fix",extra:{
				'viewedIf':function(key){
					if(List.all[key].type !== 'player') return true;
					return !List.main[key].quest['Qtutorial'].beeDead;
				},
				'dialogue':(function(key){
					Dialogue.start(key,{'group':'Qtutorial','npc':'jenny','convo':'intro','node':'intro0'});
				}),
			}
		});
		
		//First monster
		Actor.creation({'xym':spot.i,
			"category":"Qtutorial","variant":"bee",lvl:'+100',extra:{
				'deathFunc':function(key){
					List.main[key].quest['Qtutorial'].beeDead = true;						
				}		
			}
		});
		/*
		//Bats Near Chest
		Actor.creation.group({'xym':spot.l,'respawn':25*100},[
			{'amount':3,"category":"bat","variant":"normal",'modAmount':0}
		]);
		*/
		//Bees Near Chest
		Actor.creation.group({'xym':spot.l,'respawn':25*100},[
			{'amount':3,"category":"Qtutorial","variant":"bee",'modAmount':0}
		]);
	
		//Boss Fire
		Actor.creation({'xym':spot.k,
			"category":"Qtutorial","variant":"demon",lvl:'+100',extra:{
				deathFunc:function(key){
					List.main[key].quest.Qtutorial.bossDead = true;
				}
			}
		});
		
		//Switch
		Actor.creation({'xym':spot.c,
			"category":"system","variant":"switch",extra:function(act){
				act.switch = {
					on:function(key,mortid,map){
						map.addon.Qtutorial.variable.rotation *= -1;		
					}
				};
			}
		});
		
	};
	

	tut.loop =  function(map,spot,v,m){
		if(Loop.interval(25)){
			Map.collisionRect(map,spot.n,'player',function(key){
				var act = List.all[key];
				if(List.main[key].quest.Qtutorial.bossDead){
					Chat.add(key,'Congratz! You have beaten the tutorial!.');
				} else {
					Chat.add(key,'You need to kill the Fire Demon first to leave this area.');
				}	
				
			});
		}	
		
		if(Loop.interval(6)){
			//Arrow
			Attack.creation(
				{hitIf:'player-simple',xym:spot.a,angle:Math.randomML()*2},
				useTemplate(Attack.template(),v.arrow)
			);
		}

		if(Loop.interval(4)){
			//Fireball
			v.angle += v.rotation;
			v.angle = v.angle+360;
			Attack.creation(
				{hitIf:'player-simple',xym:spot.d,angle:v.angle},
				useTemplate(Attack.template(),v.fireball)
			);
			
			Attack.creation(
				{hitIf:'player-simple',xym:spot.d,angle:v.angle+120},
				useTemplate(Attack.template(),v.fireball)
			);
			
			Attack.creation(
				{hitIf:'player-simple',xym:spot.d,angle:v.angle+240},
				useTemplate(Attack.template(),v.fireball)
			);
			
		}
		
	}
	return m;
};





//}


exports.quest = q;






