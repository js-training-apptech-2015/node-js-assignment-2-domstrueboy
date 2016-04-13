'use strict';
var networkGame = {

        init: function(){
          this.appBuild();
          this.scoreZero = 0;
          this.scoreCross = 0;
          this.prevWinner = "first-player";
        },

        newNetGame: function () {

          this.thisPlayer = "first-player-turn";

          this.request('POST', 'games/', {"type" : 0}, 201).then(
          	function(response) {

          		networkGame.game = response;

          		console.log("token = " + networkGame.game.token);
          		prompt("token = ", networkGame.game.token);

          		networkGame.stateFromNet();
          		networkGame.fieldFromNet();
              //networkGame.updateGame();
              networkGame.setIntervalUpdate();
              networkGame.displayCurrentPlayer();
          	}
          );
        },

        joinNetGame: function () {

          this.thisPlayer = "second-player-turn";

	        var token = prompt("token = ", '');

	        this.request('GET', 'games/' + token, {}, 200).then(
	        	function (response) {

	        		networkGame.game = response;

	        		networkGame.stateFromNet();
	        		networkGame.fieldFromNet();
              //networkGame.updateGame();
              networkGame.setIntervalUpdate();
              networkGame.displayCurrentPlayer();
	        	}
	        );
        },

        nextNetGame: function () {

          this.request('POST', 'games/', {"type" : 0}, 201).then(
            function(response) {

              networkGame.game = response;

              console.log("token = " + networkGame.game.token);
              prompt("token = ", networkGame.game.token);

              networkGame.stateFromNet();
              networkGame.fieldFromNet();
              //networkGame.updateGame();
              networkGame.setIntervalUpdate();
              networkGame.displayCurrentPlayer();
            }
          );
        },

        joinNextNetGame: function () {

          var token = prompt("token = ", '');

          this.request('GET', 'games/' + token, {}, 200).then(
            function (response) {

              networkGame.game = response;

              networkGame.stateFromNet();
              networkGame.fieldFromNet();
              //networkGame.updateGame();
              networkGame.setIntervalUpdate();
              networkGame.displayCurrentPlayer();
            }
          );
        },

        stateFromNet: function() {

        	if(this.game.state === "first-player-turn"){
              console.log('zero');
        	    this.state = "zero";
        	} else if(this.game.state === "second-player-turn"){
        	    this.state = "cross";
        	} else {
        		console.log("Error in stateFromNet");
        	}
       	},

        fieldFromNet: function() {

        	this.game.field1Bin = this.game.field1.toString(2).split("").reverse();
	        this.game.field2Bin = this.game.field2.toString(2).split("").reverse();

	        var field = $(".cell");
          $(field).removeClass("zero").removeClass("cross");

	        for(var i = 0; i <= this.game.field1Bin.length; i++){

	        	if(this.game.field1Bin[i] === "1"){
	        		$(field[i]).addClass("zero");
	        	}
	        }

          for(var i = 0; i <= this.game.field2Bin.length; i++){

            if(this.game.field2Bin[i] === "1"){
               $(field[i]).addClass("cross");
           }
	        }
        },

        updateGame: function() {

              networkGame.request('GET', 'games/' + networkGame.game.token, {}, 200).then(

                  function (response) {
                      networkGame.game = response;
                      networkGame.stateFromNet();
                      networkGame.fieldFromNet();
                      networkGame.displayCurrentPlayer();
                      networkGame.detectWin();

                      if(networkGame.thisPlayer === networkGame.game.state){
                          $(".cell").removeClass("disabled");
                      }
                  }
              );

        },

        setIntervalUpdate: function () {
            networkGame.tmp = setInterval(networkGame.updateGame, 2000);
        },

        makeATurn: function(clickedCell) {

          console.log('Make a turn!');
        	var player, position;

        	if(networkGame.state === "zero"){
        		player = 1;
        	} else if(networkGame.state === "cross"){
        		player = 2;
        	} else {
        		console.log("Error in makeATurn");
        	}

            for(var i = 0; i < 9; i++){
              if(
                $(clickedCell).hasClass("cell-" + i)
                ){
                  position = i;
                  break;
              }
            }

        	this.request('PUT', 'games/' + this.game.token, {
        		"player": player,
        		"position": position
        	}, 200).then(

        		function (response) {
        			networkGame.game = response;
	        		networkGame.stateFromNet();
	        		networkGame.fieldFromNet();
              networkGame.displayCurrentPlayer();
        		}
        	);
        },

        request: function (requestType, requestRoute, requestBody, responseCode) {

        	return new RSVP.Promise(function(resolve, reject){

				  var xhr = new XMLHttpRequest();

		          // Конфигурируем его: запрос на URL 'http://aqueous-ocean-2864.herokuapp.com/games' :
		          xhr.open(requestType, 'http://localhost:5000/' + requestRoute/*, true*/);
		          xhr.onreadystatechange = handler;
		          xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

		          xhr.send( // Отсылаем запрос
		            JSON.stringify(requestBody)
		          );

		          function handler() {
		              if (xhr.readyState === xhr.DONE) {
			              // Если код ответа сервера не responseCode, то это ошибка
			              if (xhr.status == responseCode) {
			                resolve(JSON.parse(xhr.responseText));
			              } else {
			                // обработать ошибку
			                reject(this); // пример вывода: 404: Not Found
			              }
		          	  }
		      	  }
        	});
        },

        appBuild: function(){
          this.menuControl();
          this.clickControl();
        },

        detectWin: function () {

          if(this.game.state === "first-player-wins"){

            clearInterval(networkGame.tmp);

            this.scoreZero += 2;
            this.scoreUpdate();
            this.prevWinner = "first-player";

            alert(this.game.state + "!");

            if(this.thisPlayer[0] === this.game.state[0]){
              console.log('this.thisPlayer[0] = ' + this.thisPlayer[0]);
              console.log('this.game.state[0] = ' + this.game.state[0]);
              this.nextNetGame();
            } else {
              this.joinNextNetGame();
            }

          } else if(this.game.state === "second-player-wins"){

            clearInterval(networkGame.tmp);

            this.scoreCross += 2;
            this.scoreUpdate();
            this.prevWinner = "second-player";

            alert(this.game.state + "!");

            if(this.thisPlayer[0] === this.game.state[0]){

              console.log('this.thisPlayer[0] = ' + this.thisPlayer[0]);
              console.log('this.game.state[0] = ' + this.game.state[0]);
              this.nextNetGame();
            } else {
              this.joinNextNetGame();
            }

          } else if(this.game.state === "tie"){

            clearInterval(networkGame.tmp);

            this.scoreZero++;
        		this.scoreCross++;
            this.scoreUpdate();

            alert(this.game.state + "!");

            if(this.thisPlayer[0] === this.prevWinner[0]){
                console.log('this.thisPlayer[0] = ' + this.thisPlayer[0]);
                console.log('this.game.state[0] = ' + this.game.state[0]);
                this.nextNetGame();
            } else {
                this.joinNextNetGame();
            }
          }

        },

        scoreUpdate: function(){
          $(".score-playerZero").text("" + networkGame.scoreZero);
          $(".score-playerCross").text("" + networkGame.scoreCross);
        },

        displayCurrentPlayer: function(){
          if(networkGame.state === "zero"){
            $(".score-cell-cross").removeClass("score-cross");
            $(".score-cell-zero").addClass("score-zero");
          } else if(networkGame.state === "cross"){
            $(".score-cell-zero").removeClass("score-zero");
            $(".score-cell-cross").addClass("score-cross");
          }
        },

        menuControl: function(){

          $(".newNetGame").click(function(){
            networkGame.newNetGame();
          });

          $(".joinNetGame").click(function () {
            networkGame.joinNetGame();
          });

        },

        clickControl: function(){

          $(".cell").click(function(){
            if(networkGame.thisPlayer === networkGame.game.state){
              console.log('this is ' + $(this).hasClass("zero"));
              if(!$(this).hasClass("zero") && !$(this).hasClass("cross")){
                console.log('Class added');
                $(this).addClass(networkGame.state);
                networkGame.makeATurn(this);
                $(".cell").addClass("disabled");
              }
              else {
                console.log('this2 is ' + this);
              }
            }
    	     });
        }
    }
//export {networkGame as app};
