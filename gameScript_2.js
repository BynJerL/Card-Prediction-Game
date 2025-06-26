const gameScoreTable = document.getElementById("score-table");
const gameBoard = document.getElementById("game-board");
const gameAction = document.getElementById("game-action");

const GamePhase = Object.freeze({
    Deal: "Deal", Predict: "Predict", Play: "Play", Score: "Score"
});

const PredictStrategy = Object.freeze({
    User: "User", Random: "Random", Suit: "Suit", Rank: "Rank", RankAndSuit: "Rank and Suit", RankOrSuit: "Rank or Suit"
});

const PlayingStrategy = Object.freeze({
    User: "User", Random: "Random", LeadSuit: "Lead Suit", Aggresive: "Aggresive", MiniLoss: "Minimize Losses"
});

const CardSuit = Object.freeze({
    Heart: "\u2665", Diamond: "\u2666", Club: "\u2663", Spade: "\u2660"
});

const CardRank = Object.freeze({
    Ace: "A",   Two: "2",   Three: "3", Four: "4",  Five: "5",
    Six: "6",   Seven: "7", Eight: "8", Nine: "9",  Ten: "10",
    Jack: "J",  Queen: "Q", King: "K"
});

const CardRankValue = Object.freeze({
    "2": 1,     "3": 2,     "4": 3,     "5": 4,     "6": 5,
    "7": 6,     "8": 7,     "9": 8,     "10": 9,    "J": 10,
    "Q": 11,    "K": 12,    "A": 13
});

class Card {
    /** @param {CardSuit} suit  @param {CardRank} rank  */
    constructor (suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
}

class Player {
    /** @param {string} name @param {PredictStrategy} predictStrategy  @param {PlayingStrategy} playingStrategy  */ 
    constructor (name, predictStrategy, playingStrategy) {
        this.name = name;
        this.deck = [];
        this.expectedWin = null;
        this.totalWin = 0;
        this.roundScore = 0;
        this.totalScore = 0;
        this.predictStrategy = predictStrategy;
        this.playingStrategy = playingStrategy;
    }
}

const cardList = [
    new Card(CardSuit.Heart, CardRank.Ace),     new Card(CardSuit.Heart, CardRank.Two),     new Card(CardSuit.Heart, CardRank.Three),
    new Card(CardSuit.Heart, CardRank.Four),    new Card(CardSuit.Heart, CardRank.Five),    new Card(CardSuit.Heart, CardRank.Six),
    new Card(CardSuit.Heart, CardRank.Seven),   new Card(CardSuit.Heart, CardRank.Eight),   new Card(CardSuit.Heart, CardRank.Nine), 
    new Card(CardSuit.Heart, CardRank.Ten),     new Card(CardSuit.Heart, CardRank.Jack),    new Card(CardSuit.Heart, CardRank.Queen), 
    new Card(CardSuit.Heart, CardRank.King),    new Card(CardSuit.Diamond, CardRank.Ace),   new Card(CardSuit.Diamond, CardRank.Two), 
    new Card(CardSuit.Diamond, CardRank.Three), new Card(CardSuit.Diamond, CardRank.Four),  new Card(CardSuit.Diamond, CardRank.Five),
    new Card(CardSuit.Diamond, CardRank.Six),   new Card(CardSuit.Diamond, CardRank.Seven), new Card(CardSuit.Diamond, CardRank.Eight), 
    new Card(CardSuit.Diamond, CardRank.Nine),  new Card(CardSuit.Diamond, CardRank.Ten),   new Card(CardSuit.Diamond, CardRank.Jack), 
    new Card(CardSuit.Diamond, CardRank.Queen), new Card(CardSuit.Diamond, CardRank.King),  new Card(CardSuit.Club, CardRank.Ace), 
    new Card(CardSuit.Club, CardRank.Two),      new Card(CardSuit.Club, CardRank.Three),    new Card(CardSuit.Club, CardRank.Four),
    new Card(CardSuit.Club, CardRank.Five),     new Card(CardSuit.Club, CardRank.Six),      new Card(CardSuit.Club, CardRank.Seven), 
    new Card(CardSuit.Club, CardRank.Eight),    new Card(CardSuit.Club, CardRank.Nine),     new Card(CardSuit.Club, CardRank.Ten), 
    new Card(CardSuit.Club, CardRank.Jack),     new Card(CardSuit.Club, CardRank.Queen),    new Card(CardSuit.Club, CardRank.King), 
    new Card(CardSuit.Spade, CardRank.Ace),     new Card(CardSuit.Spade, CardRank.Two),     new Card(CardSuit.Spade, CardRank.Three),
    new Card(CardSuit.Spade, CardRank.Four),    new Card(CardSuit.Spade, CardRank.Five),    new Card(CardSuit.Spade, CardRank.Six), 
    new Card(CardSuit.Spade, CardRank.Seven),   new Card(CardSuit.Spade, CardRank.Eight),   new Card(CardSuit.Spade, CardRank.Nine), 
    new Card(CardSuit.Spade, CardRank.Ten),     new Card(CardSuit.Spade, CardRank.Jack),    new Card(CardSuit.Spade, CardRank.Queen), 
    new Card(CardSuit.Spade, CardRank.King)
];

const GameManager = {
    totalRound: null,
    leadIndex: 0,
    leadSuit: null,
    phase: null,
    cards: [],

    /** @param {number} totalRound*/
    init (totalRound = 6) {
        this.totalRound = totalRound;
        this.leadIndex = 0;
        this.leadSuit = null;
        this.phase = GamePhase.Deal;
    }
}