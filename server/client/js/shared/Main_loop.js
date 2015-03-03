//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
"use strict";
(function(){ //}
var Save = require2('Save');
var Main = require3('Main');
Main.loop = function(){
	Main.loop.FRAME_COUNT++;
	for (var i in Main.LIST)
		Main.loop.forEach(Main.LIST[i]);
	if(Main.loop.FRAME_COUNT % 2 === 0)
		Main.setChangeAll();
}
Main.loop.forEach = function(main){	//server
	Main.dialogue.loop(main); 
	Save.loop(main.id);
	Main.chrono.loop(main); 
	Main.social.update(main);   				//check if any change in friend list
	Main.ItemList.loop(main);
}
Main.loop.FRAME_COUNT = 0;

Main.testInterval = function(main,num){
	return Main.loop.FRAME_COUNT % num === 0;
}	
Main.testInterval.get = function(){
	return Main.loop.FRAME_COUNT;
}

if(!SERVER){
	Main.loop = function(){
		Main.chrono.loop(main);
	}
}

})(); //{





















