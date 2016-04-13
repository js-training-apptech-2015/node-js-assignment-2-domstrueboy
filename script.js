'use strict';
var app;

loadModule("localGame");

$('.newNetGame').on('click', function(){
	loadModule('networkGame', 'new');
});

$('.joinNetGame').on('click', function(){
	loadModule('networkGame', 'join');
});


function loadModule(module) {
	console.log('loadModule ' + module);

	$('#module').html('');
	$('#module').remove();
	app = '';
	$('.cell').off();

	var s = document.createElement("script");
	//s.id = 'module';
	//s.setAttribute("id", "module");
	s.src = module + '.js';
	document.body.appendChild(s);

  if(arguments[1] === 'new'){

	s.onload = function () {
		console.log('Module networkGame new');
		app = eval(module);
		app.init();
		app.newNetGame();
	}

  } else if(arguments[1] === 'join'){
		console.log('Module networkGame join');
  	s.onload = function () {
  		app = eval(module);
  		app.init();
  		app.joinNetGame();
  	}

  } else {
  	s.onload = function () {
			console.log('Module localGame');
    	app = eval(module);
			app.init();
  	}
  }
}
