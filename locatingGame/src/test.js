
var tabs = this.rexUI.add.tabs({
    x: 400,
    y: 300,

    panel: this.rexUI.add.gridTable({
        background: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_PRIMARY),

        table: {
            width: 250,
            height: 400,

            cellWidth: 120,
            cellHeight: 60,
            columns: 2,
            mask: {
                padding: 2,
            },
        },



        // scroller: true,

        createCellContainerCallback: function (cell) {
            var scene = cell.scene,
                width = cell.width,
                height = cell.height,
                item = cell.item,
                index = cell.index;
            return scene.rexUI.add.label({
                width: width,
                height: height,

                background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, COLOR_DARK),
                icon: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, item.color),
                text: scene.add.text(0, 0, item.id),

                space: {
                    icon: 10,
                    left: 15
                }
            });
        },
    }),

    leftButtons: [
        createButton(this, 2, 'AA'),
        createButton(this, 2, 'BB'),
        createButton(this, 2, 'CC'),
        createButton(this, 2, 'DD'),
    ],

    topButtons: [
        createButton(this, 0, '+666666666'),
        createButton(this, 0, '-'),
    ],

    space: {
        leftButtonsOffset: 20,
        rightButtonsOffset: 30,

        leftButton: 1,
    },
})
    .layout()
//.drawBounds(this.add.graphics(), 0xff0000);

tabs
    .on('button.click', function (button, groupName, index) {
        switch (groupName) {
            case 'left':
                // Highlight button
                if (this._prevTypeButton) {
                    this._prevTypeButton.getElement('background').setFillStyle(COLOR_DARK)
                }
                button.getElement('background').setFillStyle(COLOR_PRIMARY);
                this._prevTypeButton = button;
                if (this._prevSortButton === undefined) {
                    return;
                }
                break;

            case 'top':
                // Highlight button
                if (this._prevSortButton) {
                    this._prevSortButton.getElement('background').setFillStyle(COLOR_DARK)
                }
                button.getElement('background').setFillStyle(COLOR_PRIMARY);
                this._prevSortButton = button;
                if (this._prevTypeButton === undefined) {
                    return;
                }
                break;
        }

        // Load items into grid table
        var items = db
            .chain()
            .find({
                type: this._prevTypeButton.text
            })
            .simplesort('id', {
                desc: (this._prevSortButton.text === '-') // sort descending
            })
            .data();
        this.getElement('panel').setItems(items).scrollToTop();
    }, tabs);

// Grid table
tabs.getElement('panel')
    .on('cell.click', function (cellContainer, cellIndex) {
        this.print.text += cellIndex + ': ' + cellContainer.text + '\n';
    }, this)
    .on('cell.over', function (cellContainer, cellIndex) {
        cellContainer.getElement('background')
            .setStrokeStyle(2, COLOR_LIGHT)
            .setDepth(1);
    }, this)
    .on('cell.out', function (cellContainer, cellIndex) {
        cellContainer.getElement('background')
            .setStrokeStyle(2, COLOR_DARK)
            .setDepth(0);
    }, this);

tabs.emitButtonClick('left', 0).emitButtonClick('right', 0);
