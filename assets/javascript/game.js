//Global variables
$(document).ready(function() {

//audio clips
let final = new Audio('assets/audio/final.mp3');
let gameOver = new Audio('assets/audio/game-over.mp3');
let victory = new Audio('assets/audio/victory.mp3');
let win = new Audio('assets/audio/win.mp3');
let hit = new Audio('assets/audio/hit.mp3');
let choose = new Audio('assets/audio/choose.mp3');
let combo = new Audio('assets/audio/combo.mp3');

//Array of Playable Characters
let characters = {
    'Ryu': {
        name: 'Ryu',
        health: 120,
        attack: 8,
        specialAttack: 24,
        imageUrl: "assets/images/ryu-stand.gif",
        enemyAttackBack: 15,
        mp3: new Audio('assets/audio/hadouken.mp3')
    }, 
    'Ken': {
        name: 'Ken',
        health: 110,
        attack: 14,
        specialAttack: 45,
        imageUrl: "assets/images/ken-stand.gif",
        enemyAttackBack: 10,
        mp3: new Audio('assets/audio/shinuken.mp3')
    }, 
    'Guile': {
        name: 'Guile',
        health: 140,
        attack: 8,
        specialAttack: 24,
        imageUrl: "assets/images/guile-stand.gif",
        enemyAttackBack: 20,
        mp3: new Audio('assets/audio/sonic-boom.mp3')
    }, 
    'Sagat': {
        name: 'Sagat',
        health: 170,
        attack: 5,
        specialAttack: 20,
        imageUrl: "assets/images/sagat-stand.gif",
        enemyAttackBack: 20,
        mp3: new Audio('assets/audio/tiger-uppercut.mp3')
    }
};

var currSelectedCharacter;
var currDefender;
var combatants = [];
var turnCounter = 1;
var killCount = 0;


var renderOne = function(character, renderArea, makeChar) {
   
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name'>").text(character.name);
    var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
    
    var charHealth = $("<div class='character-health'>").text(character.health);
    charDiv.append(charName).append(charImage).append(charHealth);
    $(renderArea).append(charDiv);
    
    // conditional render
    if (makeChar == 'enemy') {
      $(charDiv).addClass('enemy');
    } else if (makeChar == 'defender') {
      currDefender = character;
      $(charDiv).addClass('target-enemy');
    }
  };

  // Create function to render game message to DOM
  var renderMessage = function(message) {
    var gameMessageSet = $("#gameMessage");
    var newMessage = $("<div>").text(message);
    gameMessageSet.append(newMessage);

    if (message == 'clearMessage') {
      gameMessageSet.text('');
    }
  };

  var renderCharacters = function(charObj, areaRender) {
    //render all characters
    if (areaRender == '#characters-section') {
      $(areaRender).empty();
      for (var key in charObj) {
        if (charObj.hasOwnProperty(key)) {
          renderOne(charObj[key], areaRender, '');
        }
      }
    }
    //render player character
    if (areaRender == '#selected-character') {
      $('#selected-character').prepend("Your Character");       
      renderOne(charObj, areaRender, '');
      $('#attack-button').css('visibility', 'visible');
      
    }
    //render combatants
    if (areaRender == '#available-to-attack-section') {
        $('#available-to-attack-section').prepend("Choose Your Next Opponent");      
      for (var i = 0; i < charObj.length; i++) {

        renderOne(charObj[i], areaRender, 'enemy');
      }
      //render one enemy to defender area
      $(document).on('click', '.enemy', function() {
        //select an combatant to fight
        name = ($(this).data('name'));
        //if defender area is empty
        if ($('#defender').children().length === 0) {
          renderCharacters(name, '#defender');
          $(this).hide();
          renderMessage("clearMessage");
        }
      });
    }
    //render defender
    if (areaRender == '#defender') {
      $(areaRender).empty();
      for (var i = 0; i < combatants.length; i++) {
        //add enemy to defender area
        if (combatants[i].name == charObj) {
          $('#defender').append("Your Opponent")
          renderOne(combatants[i], areaRender, 'defender');
        }
      }
    }
    //re-render defender when attacked
    if (areaRender == 'playerDamage') {
      $('#defender').empty();
      $('#defender').append("Your Opponent")
      renderOne(charObj, '#defender', 'defender');
      hit.play();
    }
    //re-render player character when attacked
    if (areaRender == 'enemyDamage') {
      $('#selected-character').empty();
      $('#selected-character').prepend("Your Character"); 
      renderOne(charObj, '#selected-character', '');
    }
    //render defeated enemy
    if (areaRender == 'enemyDefeated') {
      $('#defender').empty();
      var gameStateMessage = "You have defeated " + charObj.name + ", choose your opponent!";
      renderMessage(gameStateMessage);
      victory.play();
     
    }
  };
  //this is to render all characters for user to choose their charaters
  renderCharacters(characters, '#characters-section');
  $(document).on('click', '.character', function() {
    name = $(this).data('name');
       
     $('.text-select').html("Fight!");
     $('#gameMessage').css('visibility', 'visible');
    
    if (!currSelectedCharacter) {
      currSelectedCharacter = characters[name];
      for (var key in characters) {
        if (key != name) {
          combatants.push(characters[key]);
        }
      }
      $("#characters-section").hide();
      renderCharacters(currSelectedCharacter, '#selected-character');

      //this is to render all characters for user to choose fight against
      renderCharacters(combatants, '#available-to-attack-section');
    }
  });

//special attack button
$("#special-attack-button").on("click", function() {
  if ($('#defender').children().length !== 0) {
//playing sounds for 
    setTimeout(function() {
      combo.play();
      }, 100);
    setTimeout(function() {
      currSelectedCharacter.mp3.play();
      }, 400);
   
    //defender state change
    var attackMessage = "You attacked " + currDefender.name + " for " + currSelectedCharacter.specialAttack + " damage.";
    renderMessage("clearMessage");

    currDefender.health = currDefender.health - currSelectedCharacter.specialAttack;
    $('#special-attack-button').css('visibility', 'hidden');
    
    //win condition
    if (currDefender.health > 0) {
      //enemy not dead keep playing
      renderCharacters(currDefender, 'playerDamage');
      //player state change
      var counterAttackMessage = currDefender.name + " attacked you back for " + currDefender.enemyAttackBack + " damage.";
      renderMessage(attackMessage);
      renderMessage(counterAttackMessage);

      currSelectedCharacter.health = currSelectedCharacter.health - currDefender.enemyAttackBack;
      renderCharacters(currSelectedCharacter, 'enemyDamage');

      // when health reaches 100 left special attack buttons shows
      if (currSelectedCharacter.health <= 100) {
        $('#special-attack-button').css('visibility', 'visible'); 
      }

      // game over when health reaches 0
      if (currSelectedCharacter.health <= 0) {
        renderMessage("clearMessage");
        restartGame("You Lose! Play Again...");
        gameOver.play();
        $("#attack-button").unbind("click");
        $("#special-attack-button").unbind("click");
      }
    } else {
      renderCharacters(currDefender, 'enemyDefeated');
      killCount++;
      if (killCount >= 3) {
        renderMessage("clearMessage");
        restartGame("You Win! Play Again...");
        win.play();
        $("#attack-button").unbind("click");
          $("#special-attack-button").unbind("click");
        // 5 secs will play final song
        setTimeout(function() {
        final.play();
        }, 5000);

      }
    }
    turnCounter++;
  } else {
    renderMessage("clearMessage");
    renderMessage("Choose Your Fighter!");
    choose.play();
  }

});

  ///this is the attack button
  $("#attack-button").on("click", function() {
    //if defender area has enemy
    if ($('#defender').children().length !== 0) {
      //defender state change
      var attackMessage = "You attacked " + currDefender.name + " for " + (currSelectedCharacter.attack * turnCounter) + " damage.";
      renderMessage("clearMessage");
    
      currDefender.health = currDefender.health - (currSelectedCharacter.attack * turnCounter);

      //win condition
      if (currDefender.health > 0) {
        //enemy not defeated keep playing
        renderCharacters(currDefender, 'playerDamage');
       
        var counterAttackMessage = currDefender.name + " attacked you back for " + currDefender.enemyAttackBack + " damage.";
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        currSelectedCharacter.health = currSelectedCharacter.health - currDefender.enemyAttackBack;
        renderCharacters(currSelectedCharacter, 'enemyDamage');

       // when health reaches 100 left special attack buttons shows
        if (currSelectedCharacter.health <= 100) {
          $('#special-attack-button').css('visibility', 'visible'); 
        }

        // game over when health reaches 0
        if (currSelectedCharacter.health <= 0) {
          renderMessage("clearMessage");
          restartGame("You Lose! Play Again...");
          gameOver.play();
          $("#attack-button").unbind("click");
          $("#special-attack-button").unbind("click");
        }
      } else {
        renderCharacters(currDefender, 'enemyDefeated');
        killCount++;
        if (killCount >= 3) {
          renderMessage("clearMessage");
          restartGame("You Win! Play Again...");
          win.play();
          $("#attack-button").unbind("click");
          $("#special-attack-button").unbind("click");
         
          setTimeout(function() {
          final.play();
          }, 5000);

        }
      }
      turnCounter++;
    } else {
      renderMessage("clearMessage");
      renderMessage("Choose Your Fighter!");
      choose.play();
    }
  });

//Restarts the game - shows a reset button
  var restartGame = function(inputEndGame) {
    //When 'Restart' button is clicked, reloads the page.
    var restart = $('<button class="btn">Restart</button>').click(function() {
      location.reload();
    });
    var gameState = $("<div>").text(inputEndGame);
    $("#gameMessage").append(gameState);
    $("#gameMessage").append(restart);
  };

});