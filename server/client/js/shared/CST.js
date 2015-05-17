//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
	
CST = exports.CST = {};
True = true; False = false;	//for c#
CST.FPS = 25;
CST.MSPF = 1000/CST.FPS;
CST.HEIGHT = 720;
CST.HEIGHT2 = CST.HEIGHT/2;
CST.WIDTH = 1280;
CST.WIDTH2 = CST.WIDTH/2;
CST.STAR = '★';
CST.ASYNC_LOOP = true;

CST.FRICTION = 0.50;
CST.FRICTIONNPC = 0.80;
CST.BULLETSPD = 10;

CST.NPCSPD = 5;
CST.PLAYERSPD = 8;
CST.PLAYERACC = 8;

CST.func = function(){};
CST.bigInt = Math.pow(10,10);

CST.SEC = 1000;
CST.MIN = CST.SEC*60;
CST.HOUR = CST.MIN*60;
CST.DAY = CST.HOUR*24;
CST.WEEK = CST.DAY*7;

CST.UNARMED = 'Qsystem-unarmed';
CST.ADMIN = 'rc';

CST.NPC_RESPAWN = 25*60;


CST.CHECKMARK = '✔';
CST.tab = ['inventory','equip','ability','quest','reputation','friend'];

CST.equip = {};
CST.equip.piece = ['weapon','amulet','ring','helm','body'];
CST.equip.weapon = ["mace","spear","sword","bow","boomerang","crossbow","wand","staff","orb"];
CST.equip.amulet = ["ruby","sapphire","topaz"];
CST.equip.ring = ["ruby","sapphire","topaz"];	
CST.equip.helm = ['metal','wood','bone'];
CST.equip.body = ['metal','wood','bone'];

CST.abbr = {
	melee:'ML',
	range:'RG',
	magic:'MG',
	fire:'FR',
	cold:'CD',
	lightning:'LG',
	//
	bleed:'BLD',
	knock:'KNK',
	drain:'DRN',
	burn:'BRN',
	chill:'CHL',
	stun:'STN',

};

CST.isWeapon = function(piece){
	return piece === 'weapon';
};
CST.isArmor = function(piece){
	return piece !== 'weapon';
};
CST.getPiece = function(txt){
	return txt.split('-')[0];
};
CST.getType = function(txt){
	return txt.split('-')[1];
};

CST.element = {};
CST.element.list = ["melee","range","magic","fire","cold","lightning"];
CST.element.toStatus = {"melee":"bleed","range":"knock","magic":"drain","fire":"burn","cold":"chill","lightning":"stun"};
CST.element.toColor = {'melee':'#F97A03','range':'#3EEA31','magic':'#AE52F5','fire':'#FF0000','cold':'#A9F5F2','lightning':'#FFFF00'};
CST.element.physical = ["melee","range","magic"];
CST.element.elemental = ["fire","cold","lightning"];
CST.element.template = function(melee,range,magic,fire,cold,lightning){
	var num = melee;	//if 1 param
	return {
		melee:melee === undefined ? num : melee,
		range:range === undefined ? num : range,
		magic:magic === undefined ? num : magic,
		fire:fire === undefined ? num : fire,
		cold:cold === undefined ? num : cold,
		lightning:lightning === undefined ? num : lightning,
	};
};

CST.status = {
	'list':["bleed","knock","drain","burn","chill","stun"],
	'toElement':{"bleed":"melee","knock":"range","drain":"magic","burn":"fire","chill":"cold","stun":"lightning"},
}

CST.resource = {
	'list':['hp','mana'],
	'toColor':{'hp':'#FF3333','mana':'#0066FF'},
}

//var str = '[';for(var i = 0; i <= 100; i++){ str += Math.floor(10000 * Math.pow(10,i/25)) + ',';} str = str.slice(0,-1) + ']';
CST.exp = [10000,10964,12022,13182,14454,15848,17378,19054,20892,22908,25118,27542,30199,33113,36307,39810,43651,47863,52480,57543,63095,69183,75857,83176,91201,100000,109647,120226,131825,144543,158489,173780,190546,208929,229086,251188,275422,301995,331131,363078,398107,436515,478630,524807,575439,630957,691830,758577,831763,912010,1000000,1096478,1202264,1318256,1445439,1584893,1737800,1905460,2089296,2290867,2511886,2754228,3019951,3311311,3630780,3981071,4365158,4786300,5248074,5754399,6309573,6918309,7585775,8317637,9120108,10000000,10964781,12022644,13182567,14454397,15848931,17378008,19054607,20892961,22908676,25118864,27542287,30199517,33113112,36307805,39810717,43651583,47863009,52480746,57543993,63095734,69183097,75857757,83176377,91201083,100000000,1000000000000000000000000]

//[10000,10471,10964,11481,12022,12589,13182,13803,14454,15135,15848,16595,17378,18197,19054,19952,20892,21877,22908,23988,25118,26302,27542,28840,30199,31622,33113,34673,36307,38018,39810,41686,43651,45708,47863,50118,52480,54954,57543,60255,63095,66069,69183,72443,75857,79432,83176,87096,91201,95499,100000,104712,109647,114815,120226,125892,131825,138038,144543,151356,158489,165958,173780,181970,190546,199526,208929,218776,229086,239883,251188,263026,275422,288403,301995,316227,331131,346736,363078,380189,398107,416869,436515,457088,478630,501187,524807,549540,575439,602559,630957,660693,691830,724435,758577,794328,831763,870963,912010,954992,1000000];

CST.color = {
	yellow:'yellow',
	red:'#FF6666',
	green:'#11FF11',
	bronze:'#CD7F32',
	silver:'#C0C0C0',
	gold:'#FFD700',
}




