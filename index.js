//TODO: implement word of the day
const RECT_WIDTH = 143;
const RECT_HEIGHT = 171;
const WIN_MESSAGE = "Congratulations, You Won!";
const LOSE_MESSAGE = "You Lost, try again another time!";
const PLAYING_MESSAGE = "Guess the 5 letter word!";
const WORD_LIST = [];
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
let currentRow = 0;
let currentIndex = 0;
let gameOver = false;
let currentGuess = "";
let wordOfTheDay = "";
let usedLetters = "";
let correctLetters = "";
let gameState = "START";

//Load the valid word list
new Thread(function() {
        try {
            const words = FileLib.read("Wordle", "words.txt");
            const wordsArray = words.split("\n");

            wordsArray.forEach(word => {
                WORD_LIST.push(word.toUpperCase());
            });

            wordOfTheDay = WORD_LIST[Math.round(Math.random() * (WORD_LIST.length - 1) + 1)].toUpperCase();
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
    if(gameOver) return;

    if(keycode == 28){ //ENTER
        if(currentIndex != 5) return;

        if(!WORD_LIST.includes(rows[currentRow].join(""))) return; //check if word is valid
        currentGuess = rows[currentRow].join("");

        let sortedGuess = currentGuess.split(""); //copy current guess into variable
        sortedGuess.sort(); //sort current guess
        sortedGuess = sortedGuess.join("") //replace already used letters in sortedGuess and replace with nothing
        usedLetters += sortedGuess.replaceAll(new RegExp(`[${usedLetters}]`, "gi"), ""); //add currentguess to used letters

        for(let i = 0;i < 5;i++){
            if(currentGuess[i] == wordOfTheDay[i]){
                correctLetters += currentGuess[i];
            }
        }

        currentRow++;
        currentIndex = 0;

        if(currentGuess == wordOfTheDay){ //check if current guess is word of the day
            setGameState("WIN");
            return;
        }
        if(currentRow > 5){ //if current row is 5 then and previous if statement returned false then we have lost
            setGameState("LOSE");
            return;
        }
        currentGuess = "";
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
    let renderX = screenWidth / 2 - (RECT_WIDTH / 2) - pos.x;
    let renderY = screenHeight / 2 - (RECT_HEIGHT / 2) - pos.y;

    //Draw Background
    Renderer.drawRect(Renderer.BLACK, renderX, renderY, RECT_WIDTH, RECT_HEIGHT);

    //Draw top message
    Renderer.drawString(getMessage(), screenWidth / 2 - (Renderer.getStringWidth(getMessage()) / 2), 2);

    //Draw Letter Grid
    renderX += 3;
    renderY += 3;
    for(let x=0;x < 6;x++){
        for(let y=0;y < 5;y++){
            let letter = rows[x][y];
            drawLetterBox(letter, renderX + (y * 28), renderY + (x * 28), 25, 25, currentRow <= x ? Renderer.DARK_GRAY : getKeyColor(letter, y));
        }
    }

    //Draw keyboard
    renderY += 172;
    renderX += 5;
    for(let c = 0; c < KEYBOARD.length;c++) {
        for (let i = 0;i < KEYBOARD[c].length;i++) {
            renderX = renderX + (c);
            drawLetterBox(KEYBOARD[c][i], renderX + (i * 13), renderY + (c * 13), 10, 10, getKeyColor(KEYBOARD[c][i]));
        }
    }
}

/*
* gets the color for the letter
* @return {Long} Color based on the characters used ingame
*/
function getKeyColor(key, index){

    let color = Renderer.DARK_GRAY;
    if(isValidChar(key)){ 
        if((typeof index !== "undefined" && key == wordOfTheDay[index]) || (typeof index === "undefined" && correctLetters.includes(key))){
            return Renderer.DARK_GREEN;
        } 
        if(usedLetters.includes(key)){ 
            color = Renderer.GRAY;
            if(wordOfTheDay.includes(key)){ // TODO: Handle Recurring Letters
                color = Renderer.GOLD; 
            }
        } 
    }
    return color;
}

/**
* Draws a box with a centered string
* @param {String} letter String to be displayed
* @param {Integer} x The X position of the object
* @param {Integer} y The Y position of the object
* @param {Integer} width The width of the object
* @param {Integer} height The height of the object
* @param {Long} color The background color of the box
*/
function drawLetterBox(letter, x, y, width, height, color){
    Renderer.drawRect(color, x, y, width, height);
    Renderer.drawString(letter, x + (width / 2) - (Renderer.getStringWidth(letter) / 2), y + (height / 2) - 3.5, false);
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
            gameOver = true;
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
            currentGuess = "";
            usedLetters = "";
            correctLetters = "";
            gameOver = false;
            wordOfTheDay = WORD_LIST[Math.round(Math.random() * (WORD_LIST.length - 1) + 1)].toUpperCase();
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
