var p1GamesWon = 0;
var p2GamesWon = 0;

var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"20%", label:p1GamesWon.toString() + "-" + p2GamesWon.toString(), id:"setScore", pad:"20"},
    {type:"h", c: [
      {type:"btn", font:"25%", label:"0", cb: l=>incScore(layout.server, layout.receiver), id:"server", pad:"10"},
      {type:"btn", font:"25%", label:"0", cb: l=>incScore(layout.receiver, layout.server), id:"receiver", pad:"10"}
    ], filly:"1"}
  ]
});

function incScore(scorer, otherPlayer) {
  var newScore;
  var gameEnd = false;
  switch(scorer.label) {
    case "0":
      newScore = "15";
      break;
    case "15":
      newScore = "30";
      break;
    case "30":
      newScore = "40";
      break;
    case "40":
      if (otherPlayer.label == "Ad") {
        newScore = "40";
        otherPlayer.label = "40";
      } else if (otherPlayer.label != "40") {
        gameEnd = true;
      } else {
        newScore = "Ad";
      }
      break;
    case "Ad":
      gameEnd = true;
      break;
  }
  // If the game is still going just update the score,
  // else call a function to reset the game score and update the set score
  if (!gameEnd) {
    scorer.label = newScore;
    layout.update();
    g.clear();
    layout.render();
  } else {
    endGame(scorer);
  }
}

function endGame(winner) {
  if (winner.id == "server") {
    p1GamesWon += 1;
  } else {
    p2GamesWon += 1;
  }
  if (isSetWon()) {
    Terminal.println("Set won!");
  } else {
    layout.server.label = "0";
    layout.receiver.label = "0";
    layout.setScore.label = p1GamesWon.toString() + "-" + p2GamesWon.toString();
    layout.update();
    g.clear();
    layout.render();
  }
}

function isSetWon() {
  return (p1GamesWon == 6 && p2GamesWon < 5) || (p2GamesWon == 6 && p1GamesWon < 5) || p1GamesWon == 7 || p2GamesWon == 7;
}

g.clear();
layout.render();