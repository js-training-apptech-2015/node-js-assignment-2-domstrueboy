'use strict';

// simple express server
var application_root = __dirname,
express = require('express'),
bodyParser = require('body-parser'),
mongoose = require( 'mongoose' ); //MongoDB integration

var app = express();
var router = express.Router();
var counter = 0;

//где сохранить статическое содержимое
app.use( express.static( application_root ) );

app.use(bodyParser.json());

//подключение к базе данных
mongoose.connect( 'mongodb://domstrueboy:domstrueboy@ds064628.mlab.com:64628/tic-tac-toe-domstrueboy' );
//mongoose.connect( 'mongodb://localhost/splitmode_database' );

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function(){
    console.log('Connection to database success');
});

//схемы
var gameSchema = new mongoose.Schema({

    token: String,
    type: Number,
    field1: Number,
    field2: Number,
    state: String
});

//модели
var GameModel = mongoose.model( 'Game', gameSchema );

//получение списка всех игр
app.get( '/games', function( request, response ) {
    return GameModel.find( function( err, games ) {
        if( !err ) {
            console.log(games);
            return response.send( games );
        } else {
            return console.log( err );
        }
    });
});

//добавление новой игры
app.post( '/games', function( request, response ) {

    console.log("POST /games");

    var game = new GameModel({

        token: getToken(),
        type: 0,
        field1: 0,
        field2: 0,
        state: "first-player-turn"

    });

    return game.save( function( err ) {
        if( !err ) {
            return response.status(201).send( game );
        } else {
            return console.log( err );
        }
    });


});


app.get( '/games/:token', function( request, response ) {

    return GameModel.findOne({token: request.params.token}, function( err, game ) {
        if( !err ) {
            return response.send( game );

        } else {
            return console.log( err );
        }
    });
});


app.put( '/games/:token', function( request, response ) {

    counter++;
    console.log('counter = ' + counter);

    return GameModel.findOne({token: request.params.token}, function( err, game ) {

        if(request.body.player === 1){
          game.field1 = game.field1 + parseInt(Math.pow(10, request.body.position), 2);
          game.state = 'second-player-turn';
        } else if(request.body.player === 2){
          game.field2 = game.field2 + parseInt(Math.pow(10, request.body.position), 2);
          game.state = 'first-player-turn';
        } else {
          console.log('err in game.state');
        }

        if(counter > 4){
          if(counter === 9){
            if(detectWin()){
              return;
            } else {
              game.state = 'tie';
            }
          } else {
            detectWin();
          }
        }

        return game.save( function( err ) {
            if( !err ) {
                return response.send( game );

            } else {
                console.log( err );
            }

        });
    });
});

//удаление игры
/*app.delete( '/games/:id', function( request, response ) {
    console.log( 'Deleting game with id: ' + request.params._id );
    return GameModel.findById(request.params._id, function( err, game ) {
        return game.remove( function( err ) {
            if( !err ) {
                console.log( 'Game removed' );
                return response.send( game );
            } else {
                console.log( err );
            }
        });
    });
});*/


var port = process.env.PORT || 5000;

app.listen(port, function() {
	console.log('Express server listening on port %d', port)
});


// Возвращает случайное целое число между min (включительно) и max (не включая max)
// Использование метода Math.round() даст неравномерное распределение!
function getToken(mn, mx) {

    var min = mn || 1;
    var max = mx || 1000000;
    var tok, flag;

    do{
        tok = Math.floor(Math.random() * (max - min)) + min;

        flag = GameModel.find({token: tok}, function (err, games) {
            if( !err ) {
                console.log('New game with token = ' + tok + ' created')
                return true;
            } else {
                return console.log( err );
            }
        });

    } while(flag === true);

    return tok + '';
}

function addBinary(a, b) {
  if(a==null || a.length==0){
    return b;
  }

  if(b==null || b.length==0){
    return a;
  }

  var pa = a.length-1;
  var pb = b.length-1;

  var flag = 0;
  var sb = '';
  while(pa >= 0 || pb >=0){
  var va = 0;
  var vb = 0;

  if(pa >= 0){
      va = a.charAt(pa)=='0'? 0 : 1;
      pa--;
  }
  if(pb >= 0){
      vb = b.charAt(pb)=='0'? 0: 1;
      pb--;
  }

  var sum = va + vb + flag;
  if(sum >= 2){
      sb += (sum-2);
      flag = 1;
  } else {
      flag = 0;
      sb += (sum);
  }
  }

  if(flag == 1){
  sb += "1";
  }

  var reversed = sb.split('').reverse().join('');

return reversed;
}


function detectWin() {

  var zeros = game.field1.toString(2).split('');
  var crosses = game.field2.toString(2).split('');

  while(zeros.length < 9){
    zeros.unshift('0');
  }

  while(crosses.length < 9){
    crosses.unshift('0');
  }

  zeros.join('');
  crosses.join('');

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
        game.state = 'first-player-wins';
        counter = 0;
        return true;
    }
    else if(crossesCount === 3){
        game.state = 'second-player-wins';
        counter = 0;
        return true;
    }
  }
}
