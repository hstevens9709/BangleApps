var p1GamesWon = 0;
var p2GamesWon = 0;

var p1Score = "0";
var p2Score = "0";

var firstServeIn;
var doubleFault;
var unforcedError;
var winner;

var firstServer;
var gameEnd = false;
var gameWinner = "";

var statFile = require("Storage").open("tennisstats.csv","a");

var Layout = require("Layout");

// CSV format
// Set score, P1 Game score, P2 Game score, 1st serve?, Double Fault?, Unforced Error?, Winner?
var csv = [];

function draw(layout) {
    layout.update();
    g.clear();
    layout.render();
}

function drawStartScreen() {
    var layout = new Layout( {
        type:"v", c: [
            {type:"txt", font: "6x8:2", label:"First server?", pad:"20"},
            {type:"btn", label:"Me", cb: l=>startGame(0), pad:"10"},
            {type:"btn", label:"Opponent", cb: l=>startGame(1), pad:"10"}
        ]
    });
    draw(layout);
}

function drawScoreScreen() { 
  var layout = new Layout( {
    type:"v", c: [
      {type:"h", c: [
        {type:"img", src:maybeDrawBall(firstServer), fillx:1},
        {type:"txt", font:"20%", label:p1GamesWon.toString() + "-" + p2GamesWon.toString(), id:"setScore", pad:"20"},
        {type:"img", src:maybeDrawBall((firstServer + 1) % 2), fillx:1}
    ]},
      {type:"h", c: [
        {type:"btn", font:"25%", label:p1Score, cb: l=>incScore(layout.p1, layout.p2), id:"p1", pad:"10"},
        {type:"btn", font:"25%", label:p2Score, cb: l=>incScore(layout.p2, layout.p1), id:"p2", pad:"10"}
      ], filly:"1"}
    ]
  });
  draw(layout);
}

function drawServeScreen() {
  var layout = new Layout( {
    type:"v", c: [
      {type:"btn", font:"10%", label:"1st", cb:l=>howServed(0), pad:"10"},
      {type:"btn", font:"10%", label:"2nd", cb:l=>howServed(1), pad:"10"},
      {type:"btn", font:"10%", label:"Double Fault", cb:l=>howServed(2), pad:"10"},
    ]
  });
  draw(layout);
}

function drawHowScoredScreen() {
  var layout = new Layout( {
    type:"v", c: [
      {type:"btn", font:"10%", label:"Unforced error", cb:l=>howScored(0), pad:"10"},
      {type:"btn", font:"10%", label:"Winner", cb:l=>howScored(1), pad:"10"}
    ]
  });
  draw(layout);
}

function drawEndScreen(winner) {
  var text;
  if (winner.id == "p1") {
    text = "Congrats!";
  } else {
    text = "Hard luck!";
  }
  var layout = new Layout( {
    type:"txt", font:"6x8:2", label:text, pad:"10"
  });
  draw(layout);
}

function howServed(value) {
  switch(value) {
    case 0:
      firstServeIn = 1;
      doubleFault = 0;
      drawHowScoredScreen();
      break;
    case 1:
      firstServeIn = 0;
      doubleFault = 0;
      drawHowScoredScreen();
      break;
    case 2:
      firstServeIn = 0;
      doubleFault = 1;
      howScored(0);
      break;
  }
}

function howScored(isWinner) {
  unforcedError = 1 - isWinner;
  winner = isWinner;
  writeToCsv();
  if (!gameEnd) {
    drawScoreScreen();
  } else {
    endGame(gameWinner);
  }
}

function maybeDrawBall(shouldDrawBall) {
  if (shouldDrawBall == 0) {
    return require("heatshrink").decompress(atob("mEwwhC/AFcCkAVTn////w//zCp8DCoIXDAAIzNgQWDC4n/Ih4QBn/wAwZKLh4OBmH/CgPwl41EC5IMCMAfzD4RJLBwPzMAoXFGBBBBmBZDAAIdFMI4NBIAxkCJBYUBRAhBDJBgUBH4oACbwn/+SNGIw5IOCg4pDVJQ7FAA0gGwrsGABPzEoh4EC5gqBBwYXSJIIxCC4kvC5oYBgEjL4gXPMYIZBC6jYIeAIXTh8yYRqPKQYYXTWoJkNC4grEgDcNOwghEbpiOFBQoXRLYgwLXwwRFSRR2EJA8wIx7vG+CqI+YXHJAnzMBBGHJAxgICxAwFkAuQMIvwLpxJHC40gC5kCC4SWECxpKDC4ZENGY4rQAH4Aa"));
  } else {
    return require("heatshrink").decompress(atob("mEwghC/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A="));
  }
}

function startGame(firstServerInput) {
    firstServer = firstServerInput;
    drawScoreScreen();
}

function incScore(scorer, otherPlayer) {
  var newScore;
  var otherPlayerScore = otherPlayer.label;
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
      if (otherPlayerScore == "Ad") {
        newScore = "40";
        otherPlayerScore = "40";
      } else if (otherPlayerScore != "40") {
        gameEnd = true;
      } else {
        newScore = "Ad";
      }
      break;
    case "Ad":
      gameEnd = true;
      break;
  }
  // If the game is still going just update the score
  if (!gameEnd) {
    if (scorer.id == "p1") {
        p1Score = newScore; 
        p2Score = otherPlayerScore;
    } else {
        p2Score = newScore;
        p1Score = otherPlayerScore;
    }
  } else {
    gameWinner = scorer.id;
  }
  drawServeScreen();
}

function writeToCsv() {
  var csv = [
    p1GamesWon.toString() + "-" + p2GamesWon.toString(),
    p1Score,
    p2Score,
    firstServeIn,
    doubleFault,
    unforcedError,
    winner
  ];
  // Write data here
  statFile.write(csv.join(",")+"\n");
}

function endGame(winner) {
  if (winner == "p1") {
    p1GamesWon += 1;
  } else {
    p2GamesWon += 1;
  }
  firstServer = (firstServer + 1) % 2;
  p1Score = "0";
  p2Score = "0";
  writeToCsv();

  // reset things
  gameEnd = false;
  gameWinner = "";

  if (isSetWon()) {
    drawEndScreen(winner);
  } else {
    drawScoreScreen();
  }
}

function isSetWon() {
  return (p1GamesWon == 6 && p2GamesWon < 5) || (p2GamesWon == 6 && p1GamesWon < 5) || p1GamesWon == 7 || p2GamesWon == 7;
}

drawStartScreen();