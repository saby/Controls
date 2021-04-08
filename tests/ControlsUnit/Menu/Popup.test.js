define([
   'Controls/menu',
   'Types/source',
   'Core/core-clone',
   'Controls/display',
   'Types/collection'
],
function(menu, source, Clone, display, collection) {
   describe('Menu:Popup', function() {
      it ('_beforeMount', function() {
         let iconIsUpdated = false;
         const menuPopup = new menu.Popup();
         menuPopup._updateHeadingIcon = () => {
            iconIsUpdated = true;
         };
         const options = {
            items: new collection.RecordSet({
               rawData: [{
                  id: 1,
                  title: 'text',
                  icon: 'icon',
                  parent: null
               }]
            })
         };
         menuPopup._beforeMount(options);
         assert.isTrue(iconIsUpdated);
      });

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
         menuPopup._dataLoadCallback({ parentProperty: 'parent' }, items);
         assert.isNull(menuPopup._headingIcon);
      });

      it('_dataLoadErrback', function() {
         let actualError = '';
         let menuPopup = new menu.Popup();
         menuPopup._headingCaption = 'testCaption';
         menuPopup._headerTemplate = 'testTemplate';
         menuPopup._dataLoadErrback({dataLoadErrback: (error) => {actualError = error;}}, 'error');
         assert.isNull(menuPopup._headingCaption);
         assert.isNull(menuPopup._headerTemplate);
         assert.isFalse(menuPopup._headerVisible);
         assert.equal(actualError, 'error');
      });

      it('_dataLoadCallback headingIconSize', function() {
         let menuPopup = new menu.Popup();
         let items = new collection.RecordSet({
            rawData: [{
               id: 1,
               title: 'text',
               icon: 'icon',
               iconSize: 'm',
               parent: null
            }]
         });
         menuPopup._headingIcon = 'testIcon';
         menuPopup._dataLoadCallback({ parentProperty: 'parent', iconSize: 's', root: null }, items);
         assert.equal(menuPopup._headingIcon, 'testIcon');
         assert.equal(menuPopup._headingIconSize, 'm');

         menuPopup._headingIconSize = null;
         menuPopup._dataLoadCallback({ parentProperty: 'parent', root: 4 }, items);
         assert.isNull(menuPopup._headingIcon);
         assert.isNull(menuPopup._headingIconSize);

         menuPopup._headingIcon = 'testIcon';
         items.at(0).set('iconSize', null);
         menuPopup._dataLoadCallback({ parentProperty: 'parent', iconSize: 's', root: null }, items);
         assert.equal(menuPopup._headingIcon, 'testIcon');
         assert.equal(menuPopup._headingIconSize, 's');
      });

      it('_setItemPadding', function() {
         let menuPopup = new menu.Popup();
         menuPopup._closeButtonVisibility = true;
         menuPopup._setItemPadding({ itemPadding: { right: 'test-padding' }, allowPin: true });
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

            menuPopup._beforeUpdate({ ...directionOptions, footerContentTemplate: 'test' });
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

            menuPopupOptions = { ...menuPopupOptions };
            menuPopupOptions.headerContentTemplate = 'testTemplate2';
            menuPopup._beforeUpdate(menuPopupOptions);
            assert.equal(menuPopup._headerTemplate, 'testTemplate2');

            menuPopupOptions = { ...menuPopupOptions };
            menuPopupOptions.headerContentTemplate = null;
            menuPopup._beforeUpdate(menuPopupOptions);
            assert.equal(menuPopup._headerTemplate, null);
         });
      });

      it('_hoverController', function () {
         const menuPopop = new menu.Popup();
         const menuOptions = {
             trigger: 'hover',
             headerContentTemplate: 'testTemplate'
         };
         let isClose = false;
         menuPopop._notify = function (eventName) {
             if (isClose) {
                 assert.equal(eventName, 'close');
             } else {
                 assert.isTrue('false', 'The event should not be triggered');
             }
         };
         const clock = sinon.useFakeTimers();
         menuPopop.__beforeMount(menuOptions);
         assert.isTrue(!!menuPopop._hoverController);
         menuPopop._mouseEvent({type:'mouseenter'});
         menuPopop._mouseEvent({type:'mouseleave'});
         isClose = true;
         clock.tick(1500);

          menuPopop._mouseEvent({type:'mouseenter'});
          menuPopop._mouseEvent({type:'mouseleave'});
          menuPopop._mouseEvent({type:'mouseenter'});
          isClose = false;
          clock.tick(1500);
          clock.restore();
      });
   });
});
