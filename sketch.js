let loadedFile;

function handleFile(file) {

    if (file.type == 'application' && file.subtype == 'json') {

        let fileData = file.data;
        loadJSON(fileData, action.updateColors, action.rejectedFile);

    }
}

function addMethodsToObjects() {

    UserInterface.prototype.checkBoardClicks = function () {
        if (!this.modalOpened)
            for (let segment of this.board) {
                if (segment.mousePointing()) segment.colorSegment();
            }
    }

    Segment.prototype.txt = 0;

    Segment.prototype.colorSegment = function () {

        if (userInterface.modalOpened == false) {

            this.txt++;
            this.txt = this.txt % settings.segmentMaxNum;

            if (!(this instanceof Index)) this.changeColor(settings.colorSchemes[settings.activeColorScheme][this.txt - 1])
        }
    }

    Segment.prototype.changeContent = function (val) {
        if (val) {
            this.txt = val;
        } else {
            this.txt = this.basicContent;
        }
    }

    Segment.prototype.basicContent = "";
    Index.prototype.basicContent = "";

    Segment.prototype.changeColor = function (val) {
        if (val) {
            this.fill = val;
            this.stroke = "transparent"
        } else {
            this.fill = this.basicFillColor;
            this.stroke = this.basicStrokeColor
        }
    }

    Segment.prototype.basicFillColor = settings.squareFill;
    Index.prototype.basicFillColor = settings.indexFill;

    Segment.prototype.basicStrokeColor = settings.squareStroke;
    Index.prototype.basicStrokeColor = settings.indexStroke;

    Segment.prototype.updatePosition = function () {
        this.pos = createVector(
            this.iteratorIndex.x * settings.squareSize + settings.squareSpacer * this.iteratorIndex.x + 2,
            this.iteratorIndex.y * settings.squareSize + settings.squareSpacer * this.iteratorIndex.y + 2
        );
    }

    Segment.prototype.retriveBasicValues = function () {
        this.changeContent();
    }

    UserInterface.prototype.addCustomColorSet = function () {
        print('tak');
        let newColorSet = [];

        for (let i = 0; i < settings.colorMatrix.length; i++) {
            let picker = select(`.picker${i}`);

            newColorSet.push(picker.value());
        }
        newColorSet.push('#C0C0C0');

        settings.colorSchemes.push(newColorSet);
        action.refreshColorSets();

        let val;
        for (let i = 0; i < settings.colorSchemes.length - 1; i++) {
            val = `Zestaw ${i+1}`;
        }
        settings["currentColorScheme"] = val;
        action.switchColorScheme(true);
    }

    UserInterface.prototype.loadSave = function () {

    }

    action.updateColors = function (givenJson) {

        if (givenJson.setsOfColors.length > 2) {
            //Mamy dodaną własną paletę

            for (let i = 2; i < givenJson.setsOfColors.length; i++) {
                settings.colorSchemes.push(givenJson.setsOfColors[i].colors);
            }

        }
        action.refreshColorSets
    }

    action.rejectedFile = function () {
        alert("Wybrano nieprawidłowy plik!");
    }

    action.loadTemplate = function (id) {
        templatka = templateHTML.querySelector(id);
        clone = templatka.content.cloneNode(true);
        insert = clone.querySelector(".modal-content");
        select(".modal-dialog").child(insert);
    }

    action.showModal = function (value, saveType) {
        let el;
        select(".modal-dialog").html("");

        switch (value) {
            case 'changeColorSet':

                action.loadTemplate("#changeColorSet");
                this.refreshColorSets();

                el = createSelect();
                el.option("Domyślny");
                for (let i = 0; i < settings.colorSchemes.length - 1; i++) {
                    el.option(`Zestaw ${i+1}`);
                }
                if (settings.currentColorScheme) el.value(settings.currentColorScheme);
                el.addClass("custom-select switchColorScheme");
                el.changed(this.switchColorScheme);
                select(".modal-body").html("");
                select(".modal-body").child(el);

                break;

            case 'changeSegmentSize':

                action.loadTemplate("#changeSegmentSize");

                el = createSlider(0.5, 1.5, settings.skalar, 0.10);
                el.addClass("form-control-range");
                el.attribute("id", "form-control-ranged")
                el.changed(() => {
                    settings.skalar = el.value();

                    settings.squareSize = settings.basicSquareSize * settings.skalar;
                    settings.squareSpacer = settings.basicSquareSpacing * settings.skalar;

                    let sizeW = settings.squareSize * (settings.squaresBySideW + 2) + 11 * settings.squareSpacer + 6;
                    let sizeH = settings.squareSize * (settings.squaresBySideH + 2) + 11 * settings.squareSpacer + 6;
                    resizeCanvas(sizeW, sizeH);

                    for (let s of userInterface.board) {
                        s.updatePosition();
                    }

                    select("#scaleP").html(`Skala: ${floor(settings.skalar * 100)}%`);
                })
                select("#sliderSlot").child(el);

                break;

            case 'addCustomColorSet':
                $('#modal').modal('show');
                action.loadTemplate("#addCustomColorSet");

                for (let col of settings.colorMatrix) {

                    let num = 1 + settings.colorMatrix.indexOf(col)
                    if (num < 10) num = '0' + num.toString();
                    let el = createP(`Kolor ${num}: `);

                    let picker = createColorPicker(col);

                    picker.addClass(`colorPicker picker${settings.colorMatrix.indexOf(col)}`);

                    picker.parent(el);
                    select(".modal-body").child(el);
                }
                break;

            case 'loadColorsFromFile':
                $('#modal').modal('show');
                action.loadTemplate("#loadColorsFromFile");

                let input = createFileInput(handleFile, false);
                input.attribute("accept", "application/json");

                select(".modal-body").child(input);

                break;

            case "saveFile":
                $('#modal').modal('show');
                action.loadTemplate("#saveFile");
                settings["fileName"] = 'plik';

                let extension = '';

                if (saveType == 'img') {
                    let data = new Date();
                    settings.fileName = `plansza-${data.getHours()}-${data.getMinutes()}-${data.getSeconds()}`;
                    extension = '.png';
                    select('.fileNameBtn').attribute('onclick', `action.saveImg()`)
                } else if (saveType == 'json') {
                    settings.fileName = 'kolory';
                    extension = '.json';
                    select('.fileNameBtn').attribute('onclick', `action.saveColorSets()`)
                }

                select(".insertFileInfo").html(settings.fileName + extension)

                let fileNameInput = createInput(settings.fileName);
                fileNameInput.addClass("form-control fileNameInput");
                fileNameInput.changed(() => {
                    settings.fileName = select('.fileNameInput').value();
                    select(".insertFileInfo").html(settings.fileName + extension)
                });
                select(".modal-body").child(fileNameInput);

                break;

            default:
                break;
        }
    }

    action.refreshColorSets = function () {
        settings.colorsSchemesInList = [];
        for (let i = 0; i < settings.colorSchemes.length - 1; i++) {
            settings.colorsSchemesInList.push(`Zestaw ${i+1}`);
        }
    }

    action.switchColorScheme = function (dontChange) {

        if (dontChange != true) settings["currentColorScheme"] = select(".switchColorScheme").value();

        if (settings.currentColorScheme == "Domyślny") {
            settings.activeColorScheme = 0;
        } else {
            let pos = settings.colorsSchemesInList.indexOf(settings.currentColorScheme);
            pos++;

            settings.activeColorScheme = pos;
        }

        for (let s of userInterface.board) {
            if (!(s instanceof Index)) s.changeColor(settings.colorSchemes[settings.activeColorScheme][s.txt - 1])
        }

        action.hideSegmentContent(true);

    }

    settings.addValues({
        segmentMaxNum: 5,
        activeColorScheme: 0,
        skalar: 1
    })

    userInterface.executeQueue = {}

    action.saveImg = function () {
        saveCanvas(settings.fileName, 'png');
    }

    action.saveColorSets = function () {

        let json = {};
        let listOfSets = [];
        let colorsToSave = [];

        for (let i = 0; i < settings.colorSchemes.length; i++) {

            for (let color of settings.colorSchemes[i]) {
                if (color != "#C0C0C0") colorsToSave.push(color)
            }

            name = `set${i}`;

            listOfSets.push({
                name: name,
                colors: colorsToSave
            });

            colorsToSave = [];
        }

        json.setsOfColors = listOfSets;
        saveJSON(json, settings.fileName);
    }

    action.resetBoard = function () {
        for (let s of userInterface.board) {
            if (!(s instanceof Index)) {
                s.retriveBasicValues()
                s.changeColor();
            }
        }
    }

    action.resetIndex = function () {
        for (let s of userInterface.board) {
            if ((s instanceof Index)) {
                s.retriveBasicValues()
            }
        }
    }

    action.hideSegmentContent = function (refresh) {

        if (refresh == true) {
            for (let s of userInterface.board) {
                if (!(s instanceof Index) && s.textIsInvisible == true) {
                    s.textColor = s.fill;
                    s.textStroke = s.fill;
                }
            }
        } else {
            for (let s of userInterface.board) {
                if (!(s instanceof Index)) {

                    if (!s.textIsInvisible) {
                        s.textColor = s.fill;
                        s.textStroke = s.fill;
                        s.textIsInvisible = true;
                    } else {
                        s.textColor = settings.squareTextColor;
                        s.textStroke = settings.squareTextStrokeColor;
                        s.textIsInvisible = false;
                    }

                }
            }
        }


    }

    settings.colorSchemes = [
        ['khaki', 'deepskyblue', 'purple', 'greenyellow', '#C0C0C0'],
        ['red', 'yellow', 'blue', 'green', '#C0C0C0']
    ];

    settings.colorMatrix = settings.colorSchemes[1];
    settings.colorMatrix.pop();

}

function setup() {
    addMethodsToObjects();

    userInterface.createInterface().generateBoard();
    for (let segment of userInterface.board) {
        if (segment instanceof Index) segment.changeContent();
        segment.display();
    }

    settings.basicSquareSize = settings.squareSize;
    settings.basicSquareSpacing = settings.squareSpacer;

    noLoop();
}

function draw() {
    userInterface.refreshBoard();
    for (let segment of userInterface.board) {
        segment.display();
    }
}

function mouseClicked() {
    userInterface.checkBoardClicks();
    redraw();
}