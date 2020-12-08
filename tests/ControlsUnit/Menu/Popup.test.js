define(
    [
        'Controls/menu',
        'Types/source',
        'Core/core-clone',
        'Controls/display',
        'Types/collection',
      'Types/entity'
    ],
    function(menu, source, Clone, display, collection, entity) {
        describe('Menu:Popup', function() {
            it('_dataLoadCallback', function() {
                let menuPopup = new menu.Popup();
                let items = new collection.RecordSet({
                    rawData: [{
                        id: 1,
                        title: 'text',
                        icon: 'icon',
                        parent: null
                    }]
                });
                menuPopup._headingIcon = 'testIcon';
                menuPopup._dataLoadCallback({ parentProperty: 'parent', root: null }, items);
                assert.equal(menuPopup._headingIcon, 'testIcon');

                menuPopup._dataLoadCallback({ parentProperty: 'parent', root: 4 }, items);
                assert.isNull(menuPopup._headingIcon);

                menuPopup._headingIcon = 'testIcon';
                items.at(0).set('icon', null);
                menuPopup._dataLoadCallback({ parentProperty: 'parent', root: null }, items);
                assert.isNull(menuPopup._headingIcon);

                menuPopup._headingIcon = 'testIcon';
                menuPopup._dataLoadCallback({ parentProperty: 'parent'}, items);
                assert.isNull(menuPopup._headingIcon);
            });

            it('_setItemPadding', function() {
                let menuPopup = new menu.Popup();
                menuPopup._closeButtonVisibility = true;
                menuPopup._setItemPadding({ itemPadding: {right: 'test-padding'}, allowPin: true });
                assert.equal(menuPopup._itemPadding.right, 'test-padding');

                menuPopup._setItemPadding({ allowPin: true });
                assert.equal(menuPopup._itemPadding.right, 'menu-close');

                menuPopup._closeButtonVisibility = false;
                menuPopup._setItemPadding({ allowPin: true });
                assert.equal(menuPopup._itemPadding.right, 'menu-pin');
            });

            describe('_beforeUpdate', () => {

                it('popup directions', () => {
                    let menuPopup = new menu.Popup();
                    let directionOptions = {
                        stickyPosition: {
                            direction: {
                                vertical: 'top',
                                horizontal: 'left'
                            }
                        }
                    };
                    menuPopup._options = {
                        stickyPosition: {}
                    };

                    menuPopup._beforeUpdate(directionOptions);
                    assert.equal(menuPopup._verticalDirection, 'top');
                    assert.equal(menuPopup._horizontalDirection, 'left');

                    menuPopup._beforeUpdate({...directionOptions, footerContentTemplate: 'test'});
                    assert.equal(menuPopup._verticalDirection, 'bottom');
                    assert.equal(menuPopup._horizontalDirection, 'left');

                });

                it('headerContentTemplate changed', function() {
                    let menuPopup = new menu.Popup();
                    let menuPopupOptions = {
                        stickyPosition: {}
                    };

                    menuPopupOptions.headerContentTemplate = 'testTemplate';
                    menuPopup._beforeUpdate(menuPopupOptions);
                    assert.equal(menuPopup._headerTemplate, 'testTemplate');

                    menuPopupOptions = {...menuPopupOptions};
                    menuPopupOptions.headerContentTemplate = 'testTemplate2';
                    menuPopup._beforeUpdate(menuPopupOptions);
                    assert.equal(menuPopup._headerTemplate, 'testTemplate2');

                    menuPopupOptions = {...menuPopupOptions};
                    menuPopupOptions.headerContentTemplate = null;
                    menuPopup._beforeUpdate(menuPopupOptions);
                    assert.equal(menuPopup._headerTemplate, null);
                });
            });
        });
    }
);
