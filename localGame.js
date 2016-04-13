'use strict';
var localGame = {

        init: function(){
          this.newGame();
          this.appBuild();
        },

        newGame: function(){
          this.resetBoard();
          this.step = 1;
          this.state = "zero";
          this.displayCurrentPlayer();
          this.scoreZero = 0;
          this.scoreCross = 0;
          this.scoreUpdate();
        },

        appBuild: function(){
          this.menuControl();
          this.clickControl();
        },

        nextGame: function(){
          this.resetBoard();
          this.step = 1;
          this.state = this.prevWinner;
          this.displayCurrentPlayer();
        },

        nextStep: function(){
          this.step++;
          this.stateUpdate();
          this.displayCurrentPlayer();
        },

    		stateUpdate: function(){
    			if(this.state === "cross"){
    				this.state = "zero";
    			} else if(this.state === "zero"){
    				this.state = "cross";
    			}
    		},

        displayCurrentPlayer: function(){
          if(localGame.state === "zero"){
            $(".score-cell-cross").removeClass("score-cross");
            $(".score-cell-zero").addClass("score-zero");
          } else if(localGame.state === "cross"){
            $(".score-cell-zero").removeClass("score-zero");
            $(".score-cell-cross").addClass("score-cross");
          }
        },

        playerWin: function(classDetected){

          if(classDetected === "zero"){
    				this.scoreZero += 2;
    			} else if(classDetected === "cross"){
    				this.scoreCross += 2;
    			}

          this.prevWinner = classDetected;
          this.scoreUpdate();
          alert(classDetected + " WIN!")
          this.nextGame();
        },

        friendshipWin: function(){
        		this.scoreZero++;
        		this.scoreCross++;
            this.scoreUpdate();
            alert("FRIENDSHIP WIN!")
            this.nextGame();
        },

        scoreUpdate: function(){
          $(".score-playerZero").text("" + localGame.scoreZero);
          $(".score-playerCross").text("" + localGame.scoreCross);
        },

        menuControl: function(){
          $(".newGame").click(function(){
            localGame.newGame();
          });
        },

        clickControl: function(){

			      $(".cell").click(function(){

                if(!$(this).hasClass("zero") && !$(this).hasClass("cross")){
                  console.log('class adde to cell by localGame');
                  $(this).addClass(localGame.state);
                  localGame.nextStep();

                  if(localGame.step > 5){
                    localGame.detectWin();
                  }

                  if(localGame.step > 9){
                    localGame.friendshipWin();
                  }
                }
    		    });
        },

        resetBoard: function(){
          $(".cell").removeClass("zero").removeClass("cross");
        },

        detectWin: function(){

          var zeros = [];
          var crosses = [];

          for(var i = 0; i < 9; i++){

          	if($('.cell:eq(' + i + ')').hasClass("zero")){

          		zeros.push('1');
          		crosses.push('0');

          	} else if($('.cell:eq(' + i + ')').hasClass("cross")){

          		crosses.push('1');
          		zeros.push('0');

          	} else {

          		zeros.push('0');
          		crosses.push('0');

          	}
          }

          zeros = zeros.join('');
          crosses = crosses.join('');

          var wins = [ '111000000', '000111000', '000000111',
                       '100100100', '010010010', '001001001',
                       '100010001', '001010100' ];

          var zerosCount;
          var crossesCount;

          for(var i = 0; i < wins.length; i++){

            zerosCount = 0;
            crossesCount = 0;

            for(var j = 0; j < 9; j++){
              if(wins[i][j] === '1' && zeros[j] === '1'){
                zerosCount++;
              }
              if(wins[i][j] === '1' && crosses[j] === '1'){
                crossesCount++;
              }
            }

            if(zerosCount === 3){

                this.playerWin("zero");
                break;
            }

            else if(crossesCount === 3){

                this.playerWin("cross");
                break;
            }
          }
        }
    }
//export {localGame as app};
