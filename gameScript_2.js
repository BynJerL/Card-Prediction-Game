const gameScoreTable = document.getElementById("score-table");
const gameBoard = document.getElementById("game-board");
const gameAction = document.getElementById("game-action");

const GamePhase = Object.freeze({
    Deal: "Deal", Predict: "Predict", Play: "Play", Score: "Score", End: "End"
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

    /** @param {CardSuit} leadSuit */
    calculateScore (leadSuit = null) {
        if (this.suit === CardSuit.Spade) return CardRankValue[this.rank] + 100;
        if (leadSuit !== null) return CardRankValue[this.rank] - (this.suit === leadSuit? 0 : 100);
        return CardRankValue[this.rank];
    }

    toString () {
        return `${this.rank}${this.suit}`;
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

    /** @param {CardSuit} [leadSuit]  */
    getHighestCard (leadSuit = null) {
        if (this.deck === null) return null;
        return this.deck.reduce((best, c) => {
            return c.calculateScore(leadSuit) > best.calculateScore(leadSuit) ? c : best;
        });
    }

    /** @param {CardSuit} [leadSuit]  */
    getLowestCard (leadSuit = null) {
        if (this.deck === null) return null;
        return this.deck.reduce((lowest, c) => {
            return c.calculateScore(leadSuit) < lowest.calculateScore(leadSuit) ? c : lowest;
        });
    }

    /** @param {CardSuit} [leadSuit]  */
    getLeadCards (leadSuit = null) {
        return this.deck.filter(c => c.suit == leadSuit);
    }

    /** @param {Card} card */ 
    removeCard(card) {
        this.deck = this.deck.filter(c => c !== card);
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
        turnIndex: 0,
        leadSuit: null,
        playedCards: [],        // Track the card
        turnOrder: [],
        winnerIndex: null
    },
    totalRound: null,
    phase: null,
    cards: [],
    players: [
        new Player("You", PredictStrategy.User, PlayingStrategy.User),
        new Player("Bob", PredictStrategy.Random, PlayingStrategy.Random),
        new Player("Charles", PredictStrategy.Suit, PlayingStrategy.LeadSuit),
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
            turnIndex: 0,
            leadSuit: null,
            playedCards: [],
            turnOrder: [],
            winnerIndex: null
        }
        this.phase = GamePhase.Deal;

        // Will be implemented in the future
        // this.players = shuffle(this.players);

        UIManager.renderName();

        this.run();
    },

    getTurnOrderFrom(startIndex) {
        return this.players.slice(startIndex).concat(this.players.slice(0, startIndex));
    },

    dealCards () {
        this.cards = shuffle(generateCards());
        const totalPlayers = this.players.length;
        const cardsPerPlayer = this.totalRound;

        for (const player of this.players) {
            player.deck = [];
            player.totalWin = 0;
        }

        // Round robin
        for (let r = 0; r < cardsPerPlayer; r++) {
            for (let p = 0; p < totalPlayers; p++) {
                this.players[p].deck.push(this.cards.pop());
            }
        }

        UIManager.renderCards();
        UIManager.clearActionContent();

        this.roundState = {
            round: 0,
            turn: 0,
            leadIndex: 0,
            turnIndex: 0,
            leadSuit: null,
            playedCards: [],
            turnOrder: this.getTurnOrderFrom(0),
            winnerIndex: null
        };

        this.phase = GamePhase.Predict;
        this.run();
    },

    handlePredictionPhase () {
        const player = this.roundState.turnOrder[this.roundState.turn];
        var confidence;

        // Placeholder for displaying the player cards/UI Handler
        console.log(`${player.name}`);

        if (player.predictStrategy === PredictStrategy.User) {
            // Show the deck
            UIManager.showPredictionInput();
            // Will be put on event listener
            document.getElementById("confirm-button").onclick = () => {
                confidence = parseInt(document.getElementById("prediction-input").value);
                if (isNaN(confidence)) {
                    alert(`Input must be a number, between 0 and ${this.totalRound}`);
                    return;
                }

                if (confidence < 0) {
                    alert("Number cannot be less than 0");
                    return;
                }

                if (confidence > this.totalRound) {
                    alert(`Number cannot pass total round: ${this.totalRound}`);
                    return;
                }
                
                player.expectedWin = confidence;
                console.log("User confirm the win(s) prediction");

                UIManager.clearActionContent();
                this.nextPrediction(); 
            };
        } else {
            // Show the deck, but hide the card
            // AI doing some calculation for the win expectation

            for (const card of player.deck) {
                console.log("?");
            }
            
            switch (player.predictStrategy) {
                case PredictStrategy.Random:
                    confidence = Math.floor(Math.random() * this.totalRound);
                    break;
                case PredictStrategy.Rank:
                    confidence = player.deck.filter(c => CardRankValue[c.rank] > 9).length;
                    break;
                case PredictStrategy.Suit:
                    confidence = player.deck.filter(c => c.suit === CardSuit.Spade).length;
                    break;
                case PredictStrategy.RankAndSuit:
                    confidence = player.deck.filter(c => CardRankValue[c.rank] > 9 && c.suit === CardSuit.Spade).length;
                    break;
                case PredictStrategy.RankOrSuit:
                    confidence = player.deck.filter(c => CardRankValue[c.rank] > 9 || c.suit === CardSuit.Spade).length;
                    break;
                default:
                    confidence = 0;
                    break;
            }

            player.expectedWin = confidence;
            console.log(`${player.name} predicts ${player.expectedWin} win(s).`);
            UIManager.writeActionContent(`${player.name} predicts ${player.expectedWin} win(s).`);

            document.getElementById("confirm-button").onclick = () => {
                UIManager.clearActionContent();
                this.nextPrediction();
            };
        }

        // Add event listener to the actionButton (will be handled by UI Manager).
        // Record the prediction to the table.
        // If the player click the action button, the accessment will be shifted to other players.
        // If all player have made prediction, the game phase will be moved to the playing phase.
        // Maybe add some delay on the button disable.
    },

    nextPrediction () {
        this.roundState.turnIndex++;
        this.roundState.turn++;

        if (this.roundState.turn >= this.players.length) {
            this.phase = GamePhase.Play;
            this.roundState = {
                round: 1,
                turn: 0,
                leadIndex: 0,
                turnIndex: this.roundState.leadIndex,
                leadSuit: null,
                playedCards: [],
                turnOrder: this.getTurnOrderFrom(0),
                winnerIndex: null
            };
        }

        this.run();
    },

    handlePlayingPhase () {
        // leadIndex and turnIndex will be decided here
        const player = this.roundState.turnOrder[this.roundState.turn];
        var playedCard = null;
        var playerIndex = this.players.indexOf(player);

        if (player.playingStrategy === PlayingStrategy.User) {
            UIManager.writeActionContent("Choose a card");
            document.getElementById("confirm-button").onclick = () => {                
                document.querySelectorAll('.card.onplayer').forEach((cardElement, idx) => {
                    if (cardElement.classList.contains("picked")) {
                        playedCard = player.deck[idx];
                    }
                });

                if (playedCard === null) return;
                
                player.removeCard(playedCard);
                this.roundState.playedCards.push(playedCard);

                if (this.roundState.turn == 0) {
                    this.roundState.leadSuit = playedCard.suit;
                }

                UIManager.insertCardToDealingArea(playerIndex, playedCard);
                UIManager.renderCards();
                this.nextTurn();
            }
        } else {
            // Also shows the card, but hide the value
            switch (player.playingStrategy) {
                case PlayingStrategy.Random:
                    playedCard = player.deck[Math.floor(Math.random() * player.deck.length)];
                    break;
                case PlayingStrategy.LeadSuit:
                    if (this.roundState.leadSuit === null) {
                        playedCard = player.deck[Math.floor(Math.random() * player.deck.length)];
                    } else {
                        let cardCandidates = player.getLeadCards(this.roundState.leadSuit);
                        if (cardCandidates.length > 0) {
                            playedCard = cardCandidates[Math.floor(Math.random() * cardCandidates.length)];
                        } else {
                            playedCard = player.deck[Math.floor(Math.random() * player.deck.length)];
                        }
                    }
                    break;
                case PlayingStrategy.Aggresive:
                    playedCard = player.getHighestCard(this.roundState.leadSuit);
                    break;
                case PlayingStrategy.MiniLoss:
                    playedCard = player.getLowestCard(this.roundState.leadSuit);
                    break;
                default:
                    playedCard = player.deck.at(-1);
                    break;
            }

            player.removeCard(playedCard);
            this.roundState.playedCards.push(playedCard);
            UIManager.insertCardToDealingArea(playerIndex, playedCard);
            UIManager.renderCards();
            console.log(`${player.name} deploys ${playedCard.toString()}`);
            UIManager.writeActionContent(`${player.name} deploys ${playedCard.toString()}`);

            // First player determine the leadSuit
            if (this.roundState.turn == 0) {
                this.roundState.leadSuit = playedCard.suit;
            }

            document.getElementById("confirm-button").onclick = () => {this.nextTurn();};
        }
    },

    nextTurn () {
        this.roundState.turnIndex++;
        this.roundState.turn++;

        if (this.roundState.turn >= this.players.length) {
            this.phase = GamePhase.Score;
        }

        this.run();
    },

    handleScoringPhase () {
        // Will calculate each round score here
        console.log(`Lead Suit: ${this.roundState.leadSuit}`)
        console.log(`Round ${this.roundState.round} Scores:`);
        let highscore = -Infinity;
        for (let i = 0; i < this.roundState.playedCards.length; i++) {
            const score = this.roundState.playedCards[i].calculateScore(this.roundState.leadSuit)
            console.log(`${this.roundState.turnOrder[i].name} -> ${score}`);
            if (score > highscore) {
                highscore = score;
                this.roundState.winnerIndex = i;
            }
        }

        const winner = this.roundState.turnOrder[this.roundState.winnerIndex];
        console.log(`${winner.name} wins!`);
        UIManager.writeActionContent(`<div>The winner is:</div><div>${winner.name}</div>`);
        winner.totalWin++;

        if (this.roundState.round < this.totalRound) {
            this.phase = GamePhase.Play;
            this.roundState = {
                round: ++this.roundState.round,
                turn: 0,
                leadIndex: this.players.indexOf(winner),
                turnIndex: this.players.indexOf(winner),
                leadSuit: null,
                playedCards: [],
                turnOrder: this.getTurnOrderFrom(this.players.indexOf(winner)),
                winnerIndex: null
            };
        } else {
            this.phase = GamePhase.End;
        }

        document.getElementById("confirm-button").onclick = () => {
            UIManager.clearActionContent();
            UIManager.clearDealingArea();
            this.run();
        }
    },

    handleGameEndPhase () {
        // Will calculate the final score
        console.log("\nFinal Score");
        for (const player of this.players) {
            const finalScore = (player.totalWin === player.expectedWin? 1: -1) * (player.expectedWin) * 10;
            player.totalScore += finalScore;
            console.log(`${player.name} -> ${finalScore}`);
        }

        console.log("\nTotal Score");
        for (const player of this.players) {
            console.log(`${player.name} -> ${player.totalScore}`);
        }

        this.phase = null;
        // this.handlePlayAgain();
    },

    handlePlayAgain () {
        const answer = prompt("Play Again?");
        if (answer === "yes") {
            this.init();
        }
    },

    run () {
        switch (this.phase) {
            case GamePhase.Deal: 
                this.dealCards(); 
                break;
            case GamePhase.Predict: 
                this.handlePredictionPhase();
                break;
            case GamePhase.Play: 
                this.handlePlayingPhase();
                break;
            case GamePhase.Score: 
                this.handleScoringPhase();
                break;
            case GamePhase.End: 
                this.handleGameEndPhase(); 
                break;
        }
    }
}

const UIManager = {
    renderName () {
        const mainPlayerName = document.querySelector("#game-mainplayer .player-name");
        const opponentsName = document.querySelectorAll(".opponent .player-name");
        
        // Clear All Names
        mainPlayerName.innerHTML = "";
        opponentsName.forEach((playerName) => {
            playerName.innerHTML = "";
        });

        GameManager.players.forEach((player, idx) => {
            if (idx === 0) {
                mainPlayerName.innerHTML = player.name;
            } else {
                opponentsName[idx - 1].innerHTML = player.name;
                opponentsName[idx - 1].classList.add("active");
            }
        });
    },
    renderCards () {
        const mainPlayerCardDeck = document.querySelector("#game-mainplayer .card-deck");
        const opponentsCardDeck = document.querySelectorAll("#game-board .opponent .card-deck");
        mainPlayerCardDeck.innerHTML = "";
        opponentsCardDeck.forEach(cardDeck => {
            cardDeck.innerHTML = ""
        });
        GameManager.players.forEach((player, idx) => {
            if (idx === 0) {
                mainPlayerCardDeck.innerHTML = player.deck.map((card) => {
                    let color = "";
                    switch (card.suit) {
                        case CardSuit.Heart:
                        case CardSuit.Diamond:
                            color = " red";
                            break;
                        case CardSuit.Club:
                        case CardSuit.Spade:
                            color = " black";
                            break;
                    }
                    return `<div class="card onplayer">
                        <div class="front-side">&#x2756;</div>
                        <div class="back-side">
                            <div class="rank${color}">${card.rank}</div>
                            <div class="suit${color}">${card.suit}</div>
                        </div>
                    </div>`
                }).join("");
            } else {
                opponentsCardDeck[idx - 1].innerHTML = player.deck.map((card) => {
                    return `<div class="card ondisplay">&#x2756;</div>`;
                }).join("");
            }
        });

        document.querySelectorAll('.card.onplayer').forEach(card => {
            card.addEventListener('click', () => {
                if (!card.classList.contains('flipped')) return;
                const previousState = card.classList.contains('picked');
                document.querySelectorAll('.card.onplayer').forEach(c => c.classList.remove('picked'));
                if (!previousState) {
                    card.classList.add('picked');
                }
            });
        });
    },
    clearDealingArea () {
        document.getElementById("dealing-area").innerHTML = GameManager.players.map(
            (player, idx) => {
                return `<div class="card ondeal empty">${idx + 1}</div>`;
            }
        ).join("");
    },
    insertCardToDealingArea (playerIndex, playedCard) {
        const cardOnDeal = document.querySelectorAll("#dealing-area .card.ondeal")[playerIndex];
        cardOnDeal.classList.remove("empty");
        cardOnDeal.classList.add("occupied");
        let color = "";
        switch (playedCard.suit) {
            case CardSuit.Heart:
            case CardSuit.Diamond:
                color = " red";
                break;
            case CardSuit.Club:
            case CardSuit.Spade:
                color = " black";
                break;
        }

        cardOnDeal.innerHTML = `<div class="rank${color}">${playedCard.rank}</div><div class="suit${color}">${playedCard.suit}</div>`;
    },
    clearActionContent () {
        document.querySelector("#game-mainplayer .action-content").innerHTML = "";
    },
    showPredictionInput () {
        document.querySelector("#game-mainplayer .action-content").innerHTML = `
        How many win(s) do you want to predict?
        <div class="action-input">
            <span class="input-manip-button" id="plus-button">&plus;</span>
            <input type="number" id="prediction-input" min="0" max="${GameManager.totalRound}" value="1">
            <span class="input-manip-button" id="minus-button">&minus;</span>
            <span class="action-input-unit">win(s)</span>
        </div>`;
        document.getElementById("plus-button").addEventListener("click", (e) => {
            const inputValue = document.getElementById("prediction-input").value;
            if (inputValue < GameManager.totalRound) {
                document.getElementById("prediction-input").value++;
            }
        });
        document.getElementById("minus-button").addEventListener("click", (e) => {
            const inputValue = document.getElementById("prediction-input").value;
            if (inputValue > 0) {
                document.getElementById("prediction-input").value--;
            }
        });
    },
    writeActionContent (content) {
        document.querySelector("#game-mainplayer .action-content").innerHTML = content;
    }
};

GameManager.init(7);