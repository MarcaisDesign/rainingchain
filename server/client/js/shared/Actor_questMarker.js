//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Map = require2('Map'), MapGraph = require2('MapGraph');
var Img = require4('Img');
var Actor = require3('Actor');

var NO_PATH = -1;

Actor.QuestMarker = function(goal,client){
	goal = goal || {};
	client = client || {};
	var a = {
		client:{	//what appears in client map
			x:client.x || 0,
			y:client.y || 0,
		},
		goal:{
			x:goal.x || 0,
			y:goal.y || 0,
			map:Map.getModel(goal.map || Actor.DEFAULT_SPOT.map),		
		}	
	}
	return a;
}

Actor.questMarker = {};


Actor.questMarker.update = function(act){
	var toUpdate = false;
	for(var i in act.questMarker){
		var qm = act.questMarker[i];
		qm.client = MapGraph.findPath(act,qm.goal) || {x:NO_PATH,y:NO_PATH};
		toUpdate = true;
	}	
	if(toUpdate)
		Actor.setFlag(act,'questMarker');	//BAD... should only call if change
}

Actor.addQuestMarker = function(act,id,destination){
	act.questMarker[id] = Actor.QuestMarker(destination);
	Actor.questMarker.update(act);
}

Actor.removeQuestMarker = function(act,id){
	delete act.questMarker[id]
	Actor.setFlag(act,'questMarker');
}
Actor.removeAllQuestMarker = function(act){
	act.questMarker = {};
	Actor.setFlag(act,'questMarker');
}

Actor.getQuestMarkerMinimap = function(act){	//client side
	var ret = [];
	for(var i in act.questMarker){
		var pos = act.questMarker[i].client;
		if(pos.x === NO_PATH && pos.y === NO_PATH) continue;
		
		var vx = pos.x - act.x;
		var vy = pos.y - act.y;
				
		ret.push({
			vx:vx,
			vy:vy,
			icon:'minimapIcon.questMarker',
			size:Img.getMinimapIconSize('minimapIcon.questMarker'),
		});
	}
	return ret;
}




})(); //{
