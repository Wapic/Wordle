//TODO: implement word of the day
const GAME_SIZE = 24;
const SPACING = 2;
const WIN_MESSAGE = "Congratulations, You Won!";
const LOSE_MESSAGE = "You Lost, try again another time!";
const PLAYING_MESSAGE = "Guess the 5 letter word!";
const KEYBOARD = ["QWERTYUIOP",
                  "ASDFGHJKL",
                  "ZXCVBNM"];

const pos = {
    x: 0,
    y: 50,
};

const wordleGUI = new Gui();

wordleGUI.registerClicked(onClick);
wordleGUI.registerKeyTyped(onKeyType);
wordleGUI.registerDraw(onUpdate);

let rows = [
    ["","","","",""],
    ["","","","",""],
    ["","","","",""],
    ["","","","",""],
    ["","","","",""],
    ["","","","",""]
];
let wordList = [];
let currentRow = 0;
let currentIndex = 0;
let wordOfTheDay = "";
let usedLetters = "";
let correctLetters = "";
let gameState = "START";

//Load the valid word list
new Thread(function() {
        try {
            const words = FileLib.read("Wordle", "words.txt");
            wordList = words.split("\n");
            wordList = wordList.map((word) => {
                return word.toUpperCase();
            });

            wordOfTheDay = wordList[Math.round(Math.random() * wordList.length)];
            console.log(wordOfTheDay);
        } catch (e) {
            print(e);
            ChatLib.chat("&e[Wordle]&f: An error occured while loading word list");
        }
    }
).start();

function onClick(mouseX, mouseY, buttonId) {

}

function onKeyType(char, keycode) {
    if(gameState != "START") return;

    if(keycode == 28){ //ENTER
        if(currentIndex != 5) return;

        let latestGuess = rows[currentRow].join("");
        if(!wordList.includes(latestGuess)) return; //check if word is valid
        usedLetters += latestGuess.replaceAll(new RegExp(`[${usedLetters}]`, "gi"), ""); //add used letters using regex to remove duplicates

        for(let i = 0;i < 5;i++){
            if(latestGuess[i] == wordOfTheDay[i]){
                correctLetters += latestGuess[i]; //add all letters we have correctly guessed to a string
            }
        }

        currentRow++;
        currentIndex = 0;

        if(latestGuess == wordOfTheDay){ //check if current guess is word of the day
            setGameState("WIN");
            return;
        }
        if(currentRow > 5){ //if current row is above 5 then and previous if statement returned false then we have lost
            setGameState("LOSE");
            return;
        }
        return;
    }

    if(keycode == 14) { //BACKSPACE
        if(currentIndex > 0 && currentIndex <= 5){
            currentIndex--;
        }
        rows[currentRow][currentIndex] = "";
        return;
    }

    if(currentIndex < 5 && isValidChar(char)){ //A-z
        rows[currentRow][currentIndex] = String(char).toUpperCase();
        if(currentIndex >= 0 && currentIndex <= 4){
            currentIndex++;
        }
    }
}

function onUpdate(mouseX, mouseY, partialTicks) {
    const screenWidth = Renderer.screen.getWidth();
    const screenHeight = Renderer.screen.getHeight();
    const playWidth = (GAME_SIZE * 5) + (SPACING * 6);
    const playHeight = (GAME_SIZE * 6) + (SPACING * 7);
 
    let renderX = screenWidth / 2 - (playWidth / 2) - pos.x;
    let renderY = screenHeight / 2 - (playHeight / 2) - pos.y;
 
    //Draw Background
    Renderer.drawRect(Renderer.BLACK, renderX, renderY, playWidth, playHeight);
   
    //Draw top message
    Renderer.drawString(getMessage(), screenWidth / 2 - (Renderer.getStringWidth(getMessage()) / 2), renderY - (GAME_SIZE / 2));

    //Draw Letter Grid
    renderX += SPACING;
    renderY += SPACING;
    for(let y=0;y < 6;y++){
        for(let x=0;x < 5;x++){
            let letter = rows[y][x];
            drawLetterBox(letter, renderX + (x * (GAME_SIZE + SPACING)), renderY + (y * (GAME_SIZE + SPACING)), GAME_SIZE, currentRow <= y ? Renderer.DARK_GRAY : getLetterColor(letter, x));
        }
    }

    //Draw keyboard
    renderY += playHeight;
    renderX += GAME_SIZE / 2.5;
    for(let y = 0; y < KEYBOARD.length;y++) {
        renderX += y;
        for (let x= 0;x < KEYBOARD[y].length;x++) {
            let letter = KEYBOARD[y][x];
            drawLetterBox(letter, renderX + (x * ((GAME_SIZE / 2.5) + SPACING)), renderY + (y * ((GAME_SIZE / 2.5) + SPACING)), GAME_SIZE / 2.5, getLetterColor(letter));
        }
    }
}

/*
* gets the color for the letter
* @return {Long} Color based on the characters used ingame
*/
function getLetterColor(letter, index){
    let color = Renderer.GRAY;

    if(typeof index !== "undefined"){ //Index is defined so we're getting colors for the grid
        //TODO: Handle gold letters properly
        if(wordOfTheDay.includes(letter)){ 
            color = Renderer.GOLD;
        }
        if(letter == wordOfTheDay[index]){
            color = Renderer.DARK_GREEN;
        }
        return color;
    }

    if(wordOfTheDay.includes(letter)){
        color = Renderer.GOLD;
    }
    if(correctLetters.includes(letter)){
        color = Renderer.DARK_GREEN;
    }

    return isValidChar(letter) && usedLetters.includes(letter) ? color : Renderer.DARK_GRAY;
}

/**
* Draw a box with a centered string
* @param {String} letter String to be displayed
* @param {Integer} x The X position of the box
* @param {Integer} y The Y position of the box
* @param {Integer} size the width and height of the box
* @param {Long} color the color of the box
*/
function drawLetterBox(letter, x, y, size, color){
    Renderer.drawRect(color, x, y, size, size);
    const text = new Text(letter);
    text.setScale(size / 12);
    text.setX(x + (size / 4));
    text.setY(y + (size / 4));
    text.draw();
}

/**
* set the current game state
* @param {String} string (WIN, LOSE, START)
*/
function setGameState(string){
    switch (string) {
        case "WIN":
        case "LOSE":
            gameState = string;
            break;
        default:
            rows = [
                ["","","","",""],
                ["","","","",""],
                ["","","","",""],
                ["","","","",""],
                ["","","","",""],
                ["","","","",""]
            ]; 
            currentRow = 0;
            currentIndex = 0;
            usedLetters = "";
            correctLetters = "";
            wordOfTheDay = wordList[Math.round(Math.random() * wordList.length)];
            console.log(wordOfTheDay);
            gameState = "START";
            break;
    }
}

/**
* Get the message to be displayed at the top of the screen
* @return {String} String based on gameState
*/
function getMessage(){
    return gameState == "WIN" ? WIN_MESSAGE : gameState == "LOSE" ? LOSE_MESSAGE : PLAYING_MESSAGE;
}

/**
* Check if char is a valid letter
* @return {Boolean} true if char is a valid english letter
*/
function isValidChar(char){
    return (/[A-z]/).test(char);
}

register("command", () => {
    setGameState("START");
}).setName("wordlereset");

register("command", () => {
    wordleGUI.open();
}).setName("wordle");
