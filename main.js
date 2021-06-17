const utility = {
    formatSingleDigitNumbers: function (inputNumber) {
        let outputNumber;
        if (inputNumber >= 10) {
            return inputNumber;
        } else {
            outputNumber = '0' + inputNumber;
            return outputNumber;
        }
    },

    getLettersFromAlphabet: function () {
        const letters = (() => {
            return [...Array(26)].map((val, i) => String.fromCharCode(i + 65));
        })();

        return letters;
    }
}

Number.prototype.between = function (a, b) {
    let minVal = min([a, b]);
    let maxVal = max([a, b]);

    return this >= minVal && this <= maxVal;
};

class Board {

    constructor() {
        this.backgroundColor = "#D3D3D3"
        this.symetryType = "none"
    }

    handleBoardClick(cellID) {

        let boardCell = select(`#boardCell${cellID}`);

        let newColorAndValue = Number(boardCell.attribute('data-colorNumber'));
        newColorAndValue += 1;
        newColorAndValue = newColorAndValue % 5;

        this.colorCell(cellID, newColorAndValue);
    }

    colorCell(cellID, colorNumber) {
        let number = Number(colorNumber);
        let boardCell = select(`#boardCell${cellID}`);
        let color = colorSets[`colorSet${colorContainer.colorSetId}`][colorNumber];
        let textInsert = number + 1;

        if (number == 4) {
            color = colorSets.backgroundColor;
            textInsert = "";
        }

        if (boardCell.hasClass("contentCell")) {
            boardCell.style('background-color', color);
        }

        boardCell.attribute('data-colorNumber', number);

        let child = select('.contentBox', `#boardCell${cellID}`);
        child.html(textInsert);
    }

    clearBoard() {

        for (let i = 0; i < 36; i++) {

            let target = select(`#boardCell${i}`);
            let child = select('.contentBox', `#boardCell${i}`);

            if (target && !target.hasClass('indexCell')) {
                target.style('backgroundColor', colorSets.backgroundColor);
                target.attribute("data-colorNumber", 4);
                child.html("");
            }

        }

    }

    clearIndex() {
        for (let i = 0; i < 36; i++) {

            let target = select(`#boardCell${i}`);
            let child = select('.contentBox', `#boardCell${i}`);

            if (target && target.hasClass('indexCell')) {
                target.attribute("data-colorNumber", 4);
                child.html("");
            }

        }
    }

    updateCells() {
        let colorId, child, target, txt;

        for (let i = 0; i < 36; i++) {

            target = select('#boardCell' + i);

            if (target && !target.hasClass('indexCell')) {

                colorId = target.attribute('data-colorNumber');
                this.colorCell(i, colorId)

                if (cellContentVisible) {
                    child = select('.contentBox', `#boardCell${i}`)
                    txt = Number(colorId) + 1
                    txt = txt % 5;
                    if (txt == 0) txt = "";
                    child.html(txt);
                } else {
                    child = select('.contentBox', `#boardCell${i}`)
                    child.html("");
                }

            }

        }
    }

    generateBoardSaveUrl() {
        //wygenerowanie zakodowanej listy kolorów
        let contentSequence = readBoardContent();
        let compressedContentSequence = compressBoardContent(contentSequence);
        let shortenedList = countSpaces(compressedContentSequence);
        let hexedList = hexList(shortenedList);
        // let hexedList = shortenedList;

        if (hexedList.length > 0) {
            //utworzenie parametru URL
            let urlInsert = "";
            for (let i = 0; i < hexedList.length; i++) {
                if (i > 0) urlInsert += ',';
                urlInsert += hexedList[i];
            }

            let courrentURL = "";

            if (getURL().includes("localhost")) courrentURL = "http://localhost:5500/index.html"
            else courrentURL = "https://mzmix.github.io/W-ukladzie-z-klockami"

            return `${courrentURL}?zapis=${urlInsert}`;

        } else return alert("Plansza jest pusta!")
    }

    loadBoard(inputList) {

        if (inputList) {

            let listOfCommands = deCompressListOfCommands(inputList);

            let board = [];

            for (let element of listOfCommands) {

                //element zawiera [ - należy wypełnić planszę pustymi miejscami
                if (element.includes('[')) {
                    //Wyciągnij wartość z []
                    let value = element.substring(1, element.length - 1);

                    //Wypełnin pola 10 - puste pole
                    for (let i = 0; i < value; i++) {
                        board.push(10);
                    }

                } else {
                    //Dodaj kolor do listy
                    for (let numberColor of element) {
                        board.push(numberColor);
                    }

                }

            }
            //Ustaw kolory na planszy

            let iterator = 1;
            for (let i = 1; i < 36; i++) {
                let target = select(`#boardCell${i}`);
                let child = select('.contentBox', `#boardCell${i}`);

                let textInsert = Number(board[iterator]) + 1;
                textInsert = textInsert % 5;

                if (textInsert == 0 || !textInsert) textInsert = "";

                if (target) {
                    let color = colorSets[`colorSet${colorContainer.colorSetId}`][board[iterator]]
                    if (target.hasClass('contentCell')) target.style('backgroundColor', color);
                    target.attribute("data-colorNumber", board[iterator]);
                    child.html(textInsert);
                    iterator++;
                }

            }
        }

    }

}

function handleCellContentDisplay() {
    cellContentVisible = !cellContentVisible;
    board.updateCells();
}

function deCompressListOfCommands(inputList) {
    //Podziel dostarczone dane w miejscach z ,
    let tempList = split(inputList, ',')

    let listOfCommands = [];

    for (let element of tempList) {
        //Dodaj elementy z [ do listy
        if (element.includes("[")) listOfCommands.push(element);

        else {
            //odszyfruj dostarczony hex
            let deliveredNumber = unhex(element);
            deliveredNumber = deliveredNumber.toString();
            let processedString = deliveredNumber.substring(1);

            listOfCommands.push(processedString);
        }

    }
    return listOfCommands;
}


function readBoardContent() {
    //Lista zawierająca wszystkie ciągi cyfr i liczbę pustych miejsc
    let contrentSequence = [];
    for (let i = 0; i <= 36; i++) {
        //wybranie pola z planszy
        let target = select('#boardCell' + i);

        //Sprawdzanie czy pole jest polem z zawartością (nie index)
        if (target) {
            let colorNumber = target.attribute("data-colorNumber");

            if (colorNumber == null) colorNumber = 4;
            else colorNumber = Number(colorNumber);

            if (target.hasClass('indexCell')) {

                if (colorNumber == null || colorNumber == 0) colorNumber = 4;

            }

            if (colorNumber.between(0, 3)) contrentSequence.push(colorNumber)
            else contrentSequence.push("P")
        }

    }
    return contrentSequence;
}

function compressBoardContent(listofContent) {

    //usuwanie zbędnych zer na końcu listy
    //Przedź przez listę od tyłu
    for (let i = listofContent.length - 1; i >= 0; i--) {
        //Jeżeli element zawiera P to jest to puste miejsce
        if (listofContent[i] == "P") {
            listofContent.pop();
            //Jeżeli nie zawieara to znaleziono ciąg kolorów, koniec czyszczenia
        } else break;
    }

    return listofContent;
}

function countSpaces(listofContent) {

    let counter = 0;
    let outputList = [];
    let colorsString = ""

    //Przeszukaj całą listę
    for (let i = 0; i < listofContent.length; i++) {

        let element = listofContent[i];

        //Jeżeli pole jest puste to zwiększ licznik
        if (element == "P") {
            counter++;
        } else {
            //Pole ma zawartość

            //Licznik większy od zera, czyli naliczono puste miejsca - dodaj je do listy i wyzeruj licznik
            //dodaj ciąg kolorów do listy
            if (counter > 0) {
                outputList.push(`!${colorsString}`);
                colorsString = "";

                outputList.push(`[${counter}]`);
                counter = 0;
            }

            colorsString += element;

            if (colorsString.length > 8) {
                outputList.push(`!${colorsString}`);
                colorsString = "";
            }
        }

        //Ostatnia iteracja - dodaj ciąg kolorów do listy
        if (i == listofContent.length - 1) {
            outputList.push(`!${colorsString}`);
        }
    }
    return outputList;
}

function hexList(inputList) {
    let outputList = [];

    for (let element of inputList) {

        //element zawiera [ - określenie ilości pustych pól
        if (element.includes("[")) {
            outputList.push(element);
        } else {
            //Element zawiera ciąg kolorów

            //konwersja na hex, dodanie 1 na początku
            let tempString = element.replace('!', '1');
            let number = Number(tempString, 10);
            let hexed = hex(number);

            //Usunięcie zer
            while (hexed.charAt(0) === "0")
                hexed = hexed.slice(1);

            //dodanie do listy
            outputList.push(hexed);
        }

    }

    return outputList;
}

class ColorSets {
    constructor(colorSet, colorSetName) {
        this.colorSet1 = colorSet;
        this.colorSet1Name = colorSetName;
        this.numberOfSets = 1;
        this.backgroundColor = "#D3D3D3";
        this.colorNumber = undefined;
    }

    addColorSet(colorSet, colorSetName) {
        this.numberOfSets++;
        let setName = `colorSet${this.numberOfSets}`;
        this[setName] = colorSet;
        this[setName + 'Name'] = colorSetName;
    }

    addCustomColorSet() {
        let setAvaliable = false;
        let colorArray = [];

        let setName = select("#newSetName").value();

        for (let i = 1; i <= colorSets.numberOfSets; i++) {
            if (setName == colorSets[`colorSet${i}Name`]) {
                alert("Zestaw o takiej nazwie już istnieje!")
                setAvaliable = false;
            } else {
                setAvaliable = true;
            }
        }

        if (setAvaliable) {
            for (let i = 0; i < 4; i++) {
                let target = select(`#colorPicker${i}`);
                if (target) {
                    let input = target.value();
                    colorArray.push(input);
                }
            }

            colorSets.addColorSet(colorArray, setName);
            colorContainer.generateColorSelect();

            let myModalEl = document.getElementById('customColorSetModal')
            bootstrap.Modal.getInstance(myModalEl).hide();
        }
    }

    displayColorSetModal() {
        let basicColorSet = colorSets[`colorSet${colorContainer.colorSetId}`];
        let htmlInsert, colorPicker;
        let target = select('#customColorModalBody');

        target.html("");

        select("#newSetName").value(`Zestaw ${utility.formatSingleDigitNumbers(colorSets.numberOfSets-1)}`);

        for (let i = 0; i < colorSets[`colorSet${colorContainer.colorSetId}`].length; i++) {

            htmlInsert = createDiv(`Kolor ${utility.formatSingleDigitNumbers(i+1)}: <br>`);
            htmlInsert.addClass("customColorPickerDiv");
            colorPicker = createColorPicker(basicColorSet[i]);
            colorPicker.addClass("form-control form-control-color colorPicker");
            colorPicker.attribute("id", "colorPicker" + i);
            htmlInsert.child(colorPicker);

            target.child(htmlInsert);
        }

    }

    loadColorSetsFromFile(input) {
        let numberOfSets = input.numberOfSets;
        let set;
        let setName = "";
        let setColors;

        for (let i = 1; i <= numberOfSets; i++) {
            set = input[`set${i}`];

            if (set.baseSet) continue;

            setName = set.setName;
            setColors = set.setColors;

            colorSets.addColorSet(setColors, setName)
        }
        colorContainer.generateColorSelect();
        alert("Wczytano zestawy kolorów!");
        let myModalEl = document.getElementById('loadingColorSetModal')
        bootstrap.Modal.getInstance(myModalEl).hide();
    }
}

class ColorContainer {

    constructor() {
        this.listOfDivs = [];
        this.colorSetId = 1;
    }

    generateColorContainer() {
        let setName = `colorSet${this.colorSetId}`;
        let listOfColors = colorSets[setName];
        let parent = select('#colorConatiner');

        let colorToInsert, div;

        for (let i = 0; i < listOfColors.length; i++) {

            colorToInsert = listOfColors[i];
            div = createDiv();
            div.addClass('colorContainerSquare ratio ratio-1x1 border rounded-3 shadow border-dark');
            div.style('background-color', colorToInsert);
            div.attribute('onclick', `colorSets.setColor('${colorToInsert}',${i})`);
            div.parent(parent);
        }

        colorToInsert = colorSets.backgroundColor;
        div = createDiv();
        div.addClass('colorContainerSquare ratio ratio-1x1 border rounded-3 shadow border-dark');
        div.style('background-color', colorToInsert);
        div.attribute('onclick', `colorSets.setColor('${colorToInsert}', 10)`);
        div.parent(parent);
    }

    generateColorSelect(firstGeneration) {

        let htmlContent = ""
        select("#colorSelectForm").html("");

        for (let i = 1; i <= colorSets.numberOfSets; i++) {

            let name = colorSets[`colorSet${i}Name`];

            if (firstGeneration && i == 1) htmlContent = `<option selected value='${i}'>${name}</option>`;
            else htmlContent = `<option value='${i}'>${name}</option>`;

            select("#colorSelectForm").html(htmlContent, true);
        }

    }

    switchColorSet() {

        let setNumber = select("#colorSelectForm").value();
        this.colorSetId = setNumber;

        board.updateCells();
    }

}


function encodeBoard() {
    updateDate();

    let colorAndPositionDirectory = [];
    let cellDescription = "";
    let cellPosition = "",
        cellPositionXY,
        cellColorNumber;
    let selectedColorScheme = colorSets[`colorSet${colorContainer.colorSetId}`];
    let htmlInsert = "";
    let targetedWindow = select("#colorDescription");

    targetedWindow.html("");

    if (selectedIndexMode == "none") {
        targetedWindow.html('<p class = "text-danger">Nie można zakodować nieopisanej planszy!</p>');
        return false;
    }

    for (let i = 0; i < selectedColorScheme.length; i++) {

        colorAndPositionDirectory.push({
            colorNumber: i,
            description: ""
        });

    }

    for (let i = 13; i <= 130; i++) {
        let target = select('#boardCell' + i);

        if ((target && target.hasClass('contentCell')) && (target.attribute("data-colorNumber") && target.attribute("data-colorNumber") != 10)) {
            cellPosition = target.attribute("data-position");
            cellPositionXY = splitTokens(cellPosition, ',');
            cellColorNumber = target.attribute("data-colorNumber");

            if (selectedIndexMode == "numbers") {

                cellDescription = `(${cellPositionXY[0]},${cellPositionXY[1]})`;

            } else if (selectedIndexMode == "address") {

                cellDescription = `${alphabet[cellPositionXY[1]-1]}${cellPositionXY[0]}`

            } else if (selectedIndexMode == "colors") {

                cellDescription = `<span class="colorDecriptionColorBox" style="background-color: ${selectedColorScheme[cellPositionXY[1]-1]}"></span>|<span class="colorDecriptionColorBox" style="background-color: ${selectedColorScheme[cellPositionXY[0]]}"></span>`

            }

            colorAndPositionDirectory[cellColorNumber].description += `, ${cellDescription}`;
        }
    }

    for (let selectedColor of colorAndPositionDirectory) {

        if (selectedColor.description != "") {
            htmlInsert = `<span class="colorDecriptionColorBox" style="background-color: ${selectedColorScheme[selectedColor.colorNumber]}"></span>: `;
            htmlInsert += selectedColor.description.substring(2);
            htmlInsert += '<br/>';

            targetedWindow.html(htmlInsert, true);
        }

    }
}

function updateDate() {
    // let dateInsert = `${year()}-${utility.formatSingleDigitNumbers(month())}-${utility.formatSingleDigitNumbers(day())}-${utility.formatSingleDigitNumbers(hour())}-${utility.formatSingleDigitNumbers(minute())}`;
    let dateInsert = `${year()}-${utility.formatSingleDigitNumbers(month())}-${utility.formatSingleDigitNumbers(day())}-${utility.formatSingleDigitNumbers(hour())}-${utility.formatSingleDigitNumbers(minute())}-${utility.formatSingleDigitNumbers(second())}`;
    let targets = selectAll('.updatedDateInsert');
    let tempValue = "";

    for (let element of targets) {
        tempValue = element.attribute("data-nameStart");
        tempValue += dateInsert;
        element.value(tempValue);
    }

}

function generateScreenShot(targetName) {

    if (targetName == "boardContainer") {
        let target = select('#boardSaveScreenShotNameInput');
        let fileName = target.value();
        html2canvas(document.querySelector(".boardContainer"), {
            backgroundColor: null
        }).then(canvas => {
            saveCanvas(canvas, fileName, 'png')
        });
        updateDate();
    } else if (targetName == "colorDescription") {
        let target = select('#colorDescriptionNameInput');
        let fileName = target.value();
        html2canvas(document.querySelector("#colorDescriptionModalBody")).then(canvas => {
            saveCanvas(canvas, fileName, 'png')
        });
        updateDate();
    }


}

function prepareSharingLink() {
    let url = board.generateBoardSaveUrl();
    target = select("#boardSharingUrlOutput");

    if (url) {
        target.value(url);
        select("#urlSharingBtn").attribute('href', url);
    }

}

function toggleFulscreen() {
    let fs = fullscreen();
    fullscreen(!fs);
}

function generateColorSetsSave() {
    let fileName = select("#colorSetFileNameInput").value();

    let jsonInsert = {};
    let setName = "";
    let setColors = []

    jsonInsert.numberOfSets = colorSets.numberOfSets;

    for (let i = 1; i <= colorSets.numberOfSets; i++) {

        setName = colorSets[`colorSet${i}Name`];
        setColors = colorSets[`colorSet${i}`];

        if (i == 1 || i == 2) {
            jsonInsert[`set${i}`] = {
                setName: setName,
                setColors: setColors,
                baseSet: true
            };
        } else {
            jsonInsert[`set${i}`] = {
                setName: setName,
                setColors: setColors
            };
        }



        setName = "";
        setColors = [];
    }

    saveJSON(jsonInsert, fileName, false);
}

function handleColorSetLoading(file) {

    if (file.type == "application" && file.subtype == "json") {

        let fileData = file.data;
        colorSets.loadColorSetsFromFile(fileData);

    } else {
        alert("Wczytano nieprawidłowy plik")
    }

}

function prepareColorSetFileInput() {
    if (!select("#colorSetsFileInput")) {
        let element = createFileInput(handleColorSetLoading);
        element.addClass("form-control");
        element.parent(select("#colorSetsFileInputContainer"));
        element.attribute("id", "colorSetsFileInput")
    }
}

function handleClearBoard() {
    let confirmation = confirm("Potwierdź wyczyszczenie planszy!");

    if (confirmation) {
        board.clearBoard();
    }
}

function handleClearIndex() {
    let confirmation = confirm("Potwierdź wyczyszczenie planszy!");

    if (confirmation) {
        board.clearIndex();
    }
}

const board = new Board();
const colorSets = new ColorSets(['red', 'yellow', 'blue', 'green'], "Zestaw Kreatywny");
const colorContainer = new ColorContainer();
var cellContentVisible = true;

function preload() {
    //Obsłużenie daty w stopce
    let data = new Date();
    let year = data.getFullYear();
    select('#yearInsert').html(year);

    //Aktywowanie tooltipów
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}

function setup() {
    noCanvas();
    noLoop();

    generateBoard();

    colorSets.addColorSet(['khaki', 'deepskyblue', 'purple', 'greenyellow'], "Zestaw Matematyczny");
    // colorContainer.generateColorContainer();
    colorContainer.generateColorSelect(true);

    //Obsługa ładowania planszy z linków
    let daneURL = getURLParams();
    board.loadBoard(daneURL.zapis);
}

function generateBoard() {

    let insert = '';
    let destination = select(".boardContainer");
    let counter = 0;

    for (let i = 0; i <= 5; i++) {

        for (let j = 0; j <= 5; j++) {

            if ((i == 0 && j == 0) || (i == 0 && j == 5)) insert = `<div class="boardCell indexCell ratio ratio-1x1 invisible" id="boardCell${counter}" onclick="board.handleBoardClick(${counter})" data-colorNumber="4"><div class="contentBox"></div></div>`;
            else if ((i == 5 && j == 0) || (i == 5 && j == 5)) insert = `<div class="boardCell indexCell ratio ratio-1x1 invisible" id="boardCell${counter}" onclick="board.handleBoardClick(${counter})" data-colorNumber="4"><div class="contentBox"></div></div>`;

            else if (i == 0) insert = `<div class="boardCell indexCell ratio ratio-1x1" id="boardCell${counter}" onclick="board.handleBoardClick(${counter})" data-colorNumber="4"><div class="contentBox"></div></div>`;
            else if (i == 5) insert = `<div class="boardCell indexCell ratio ratio-1x1" id="boardCell${counter}" onclick="board.handleBoardClick(${counter})" data-colorNumber="4"><div class="contentBox"></div></div>`;

            else if ((i != 0) && (i != 5) && (j == 0)) insert = `<div class="boardCell indexCell ratio ratio-1x1" id="boardCell${counter}" onclick="board.handleBoardClick(${counter})"" data-colorNumber="4"><div class="contentBox"></div></div>`
            else if ((i != 0) && (i != 5) && (j == 5)) insert = `<div class="boardCell indexCell ratio ratio-1x1" id="boardCell${counter}" onclick="board.handleBoardClick(${counter})"" data-colorNumber="4"><div class="contentBox"></div></div>`

            else {
                insert = `<div class="boardCell contentCell ratio ratio-1x1" id="boardCell${counter}" onclick="board.handleBoardClick(${counter})" data-colorNumber="4"><div class="contentBox"></div></div>`;
            }

            destination.html(insert, true);
            counter++;
        }
    }

}