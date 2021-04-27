define([
    'Controls/tabs',
    'Types/source',
    'Types/entity',
    'Types/collection',
    'Controls/Utils/getFontWidth'
], function(tabsMod, sourceLib, entity, collection, getFontWidthUtil) {
    describe('Controls/_tabs/AdaptiveButtons', function() {
        const data = [
            {
                id: 1,
                title: 'Первый'
            },
            {
                id: 2,
                title: 'Второй'
            },
            {
                id: 3,
                title: 'Третий'
            }
        ];
        const items = new collection.RecordSet({
            keyProperty: 'id', rawData: data
        });
        const adaptiveButtons = new tabsMod.AdaptiveButtons();
        it('_getLastTabIndex', function() {
            adaptiveButtons._getItemsWidth = () => {
                return [50, 50, 50];
            };
            adaptiveButtons._getMinWidth = () => {
                return 20;
            };
            adaptiveButtons._moreButtonWidth = 10;
            const options = {
                align: 'left',
                displayProperty: 'title',
                containerWidth: 200
            };

          // 1 случай все вкладки уместились
           const lastIndex = adaptiveButtons._getLastTabIndex(items, options);
           assert.equal(lastIndex, 2);

           //2 случай, поместились все вкладки, 3 сократилась.
            options.containerWidth = 147;
            // ширина двух вкладок 50 + 50 + мин.ширина последней вкладки 20 + отступы 13*2 = 146
            const lastIndex2 = adaptiveButtons._getLastTabIndex(items, options);
            assert.equal(lastIndex2, 2);

            //3 случай, поместились 2 вкладки из 3
            options.containerWidth = 120;
            // ширина первой вкладки 50 + кнопка еще 10 + отступы 26 + паддинг 6 + мин.высота второй вкладки 20 = 112
            const lastIndex3 = adaptiveButtons._getLastTabIndex(items, options);
            assert.equal(lastIndex3, 1);

            //поместилась 1 вкладка
            options.containerWidth = 100;
            // ширина первой вкладки 50 + кнопка еще 10 + отступы 26 + паддинг 6 + мин.высота второй вкладки 20 = 112 - не поместилось
            // мин.ширина первой вкладки 20 + кнопка еще 10 + 26 + 6 = 62
            const lastIndex4 = adaptiveButtons._getLastTabIndex(items, options);
            assert.equal(lastIndex4, 0);
        });
        it('_calcVisibleItems', function () {
            adaptiveButtons._getItemsWidth = () => {
                return [50, 50, 50];
            };
            adaptiveButtons._getMinWidth = () => {
                return 20;
            };
            adaptiveButtons._moreButtonWidth = 10;
            const options = {
                align: 'left',
                displayProperty: 'title',
                containerWidth: 120,
                selectedKey: 1
            };

            adaptiveButtons._calcVisibleItems(items, options);
            assert.deepEqual(adaptiveButtons._visibleItems.getRawData(), [{
                id: 1,
                title: 'Первый'
            }, {
                id: 2,
                minWidth: 0,
                title: 'Второй'
            }
            ]);

            options.selectedKey = 3;
            adaptiveButtons._calcVisibleItems(items, options);
            assert.deepEqual(adaptiveButtons._visibleItems.getRawData(), [{
                id: 1,
                title: 'Первый'
            }, {
                id: 3,
                canShrink: true,
                title: 'Третий'
            }
            ]);
        });
        it('_menuItemClickHandler', function() {
            const buttons = new tabsMod.AdaptiveButtons();
            var notifyCorrectCalled = false;
            buttons._notify = function(eventName) {
                if (eventName === 'selectedKeyChanged') {
                    notifyCorrectCalled = true;
                }
            };
            let event1 = {
                nativeEvent: {
                    button: 1
                }
            };
            buttons._options = {
                keyProperty: 'id'
            };
            buttons._visibleItems = items;
            buttons._position = 0;
            buttons._updateFilter = () => {};
            buttons._items = items;


            buttons._menuItemClickHandler(event1, [1]);
            assert.equal(notifyCorrectCalled, true);

            buttons.destroy();
        });
        it('_getTextWidth', function() {
            let sandbox = sinon.createSandbox();
            sandbox.replace(getFontWidthUtil, 'getFontWidth', () => 31.2);
            let maxWidth = adaptiveButtons._getTextWidth('text');
            assert.equal(maxWidth, 32);
            sandbox.restore();

            sandbox.replace(getFontWidthUtil, 'getFontWidth', () => 31.8);
            maxWidth = adaptiveButtons._getTextWidth('text');
            assert.equal(maxWidth, 32);
            sandbox.restore();
        });
    });
});
