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

const generateCards = function () {
    const deck = [];
    const suits = Object.values(CardSuit);
    const ranks = Object.values(CardRank);
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push(new Card(suit, rank));
        }
    }
    return deck;
}

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const GameManager = {
    roundState: {
        round: 0,
        turn: 0,
        leadIndex: 0,
        leadSuit: null,
        playedCards: [],        // Track the card
        turnOrder: [],
        winnerIndex: null
    },
    totalRound: null,
    phase: null,
    cards: [],
    players: [
        new Player("Andy", PredictStrategy.User, PlayingStrategy.User),
        new Player("Bob", PredictStrategy.Random, PlayingStrategy.Random),
        new Player("Charles", PredictStrategy.Random, PlayingStrategy.Random),
        new Player("Dave", PredictStrategy.Random, PlayingStrategy.Random),
        new Player("Edwin", PredictStrategy.Random, PlayingStrategy.Random),
        new Player("Frank", PredictStrategy.Random, PlayingStrategy.Random)
    ],

    /** @param {number} totalRound*/
    init (totalRound = 6) {
        this.totalRound = totalRound;
        this.roundState = {
            round: 0,
            turn: 0,
            leadIndex: 0,
            leadSuit: null,
            playedCards: [],
            turnOrder: [],
            winnerIndex: null
        }
        this.phase = GamePhase.Deal;
        this.cards = shuffle(generateCards());

        // Will be implemented in the future
        // this.players = shuffle(this.players);
    },

    getTurnOrder(startIndex) {
        return this.players.slice(startIndex).concat(this.players.slice(0, startIndex));
    },

    run () {}
}