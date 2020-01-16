define(
   [
      'Controls/popup',
      'Controls/popupTemplate',
      'Types/collection'
   ],
   (popup, popupTemplate, collection) => {
      'use strict';

      describe('Controls/Popup/InfoBoxController', () => {
         it('InfoBoxController: getDefaultConfig', () => {
            let item = {
               popupOptions: {
                  position: 'tl'
               }
            };
            popupTemplate.InfoBoxController.getDefaultConfig(item);
            assert.equal(item.position.top, -10000);
            assert.equal(item.position.left, -10000);
            assert.equal(item.position.right, undefined);
            assert.equal(item.position.bottom, undefined);
         });
         it('InfoBoxController: elementCreated', () => {
            let prepareConfig = popupTemplate.InfoBoxController._prepareConfig;
            popupTemplate.InfoBoxController._prepareConfig = () => true;
            let container = {
               style: {
                  maxWidth: 100
               }
            };
            popupTemplate.InfoBoxController.elementCreated({
               position: {
                  maxWidth: 20
               },
               popupOptions: {
                  maxWidth: 50
               }
            }, container);
            popupTemplate.InfoBoxController._prepareConfig = prepareConfig;
            assert.equal(container.style.maxWidth, '');
         });

         it('getCustomZIndex', () => {
            let popupList = new collection.List();
            let infoBoxItem = {
               id: 2,
               parentId: 1
            };
            popupList.add({
               id: 1,
               currentZIndex: 10
            });
            popupList.add(infoBoxItem);
            let zIndex = popupTemplate.InfoBoxController.getCustomZIndex(popupList, infoBoxItem);
            assert.equal(zIndex, 11);
            infoBoxItem.parentId = 3;
            zIndex = popupTemplate.InfoBoxController.getCustomZIndex(popupList, infoBoxItem);
            assert.equal(zIndex, null);
            popupList.destroy();
         });
      });

      describe('Controls/_popup/InfoBox', () => {
         it('PopupInfoBox: getConfig', () => {
            let config = {
               floatCloseButton: true,
               style: 'error',
               position: 'tl',
               template: popup.PreviewerTemplate,
               showDelay: 300,
            };
            let Infobox = new popup.InfoboxTarget(config);
            Infobox.saveOptions(config);
            let newConfig = Infobox._getConfig();

            assert.equal(newConfig.floatCloseButton, true);
            assert.equal(newConfig.style, 'error');
            assert.equal(newConfig.position, 'tl');
            assert.equal(newConfig.template, popup.PreviewerTemplate);
            assert.equal(newConfig.showDelay, 300, 'error showDelay');
         });

         it('PopupInfoBox: resetTimeOut', () => {
            let Infobox = new popup.InfoboxTarget();
            Infobox._openId = 300;
            Infobox._closeId = 500;
            assert.equal(Infobox._closeId, 500);
            assert.equal(Infobox._openId, 300);
            Infobox._resetTimeOut();
            assert.equal(Infobox._closeId, null);
            assert.equal(Infobox._openId, null);
         });

         it('InfoBoxController: check position', () => {
            let arrowOffset = 12;
            let arrowWidth = 16;

            let tests = [{
               cfg: {
                  targetWidth: 10,
                  alignSide: 'l'
               },
               value: -15
            }, {
               cfg: {
                  targetWidth: 10,
                  alignSide: 'c'
               },
               value: 0
            }, {
               cfg: {
                  targetWidth: 10,
                  alignSide: 'r'
               },
               value: 15
            }, {
               cfg: {
                  targetWidth: 100,
                  alignSide: 'r'
               },
               value: 0
            }];

            tests.forEach((test) => {
               it('align: ' + JSON.stringify(test.cfg), () => {
                  let offset = popupTemplate.InfoBoxController._getOffset(test.cfg.targetWidth, test.cfg.alignSide, arrowOffset, arrowWidth);
                  assert.equal(offset, test.value);
               });
            });
         });

         it('InfoBoxController: calculate offset target size', () => {
            let offsetHeight;
            popupTemplate.InfoBoxController._getOffset = (height) => {
               offsetHeight = height;
            };
            let target = {
               offsetHeight: 100,
               offsetWidth: 100
            };
            popupTemplate.InfoBoxController._getVerticalOffset(target, false);
            assert.equal(offsetHeight, 100);
            offsetHeight = null;
            popupTemplate.InfoBoxController._getHorizontalOffset(target, true);
            assert.equal(offsetHeight, 100);

            target = {
               clientHeight: 200,
               clientWidth: 200
            };

            popupTemplate.InfoBoxController._getVerticalOffset(target, false);
            assert.equal(offsetHeight, 200);
            offsetHeight = null;
            popupTemplate.InfoBoxController._getHorizontalOffset(target, true);
            assert.equal(offsetHeight, 200);
         });
      });

      describe('Controls/Popup/Template/InfoBox', () => {
         let getStickyPosition = (hAlign, vAlign, hCorner, vCorner) => ({
            direction: {
               horizontal: hAlign,
               vertical: vAlign
            },
            targetPoint: {
               vertical: vCorner,
               horizontal: hCorner
            }
         });
         it('InfoBoxTemplate: beforeUpdate', () => {
            let stickyPosition = getStickyPosition('left', 'top', 'left');
            popupTemplate.InfoBox.prototype._beforeUpdate({ stickyPosition });
            assert.equal(popupTemplate.InfoBox.prototype._arrowSide, 'right');
            assert.equal(popupTemplate.InfoBox.prototype._arrowPosition, 'end');

            stickyPosition = getStickyPosition('right', 'bottom', 'right');
            popupTemplate.InfoBox.prototype._beforeUpdate({ stickyPosition });
            assert.equal(popupTemplate.InfoBox.prototype._arrowSide, 'left');
            assert.equal(popupTemplate.InfoBox.prototype._arrowPosition, 'start');

            stickyPosition = getStickyPosition('right', 'top', 'left', 'top');
            popupTemplate.InfoBox.prototype._beforeUpdate({ stickyPosition });
            assert.equal(popupTemplate.InfoBox.prototype._arrowSide, 'bottom');
            assert.equal(popupTemplate.InfoBox.prototype._arrowPosition, 'start');

            stickyPosition = getStickyPosition('left', 'bottom', 'right', 'bottom');
            popupTemplate.InfoBox.prototype._beforeUpdate({ stickyPosition });
            assert.equal(popupTemplate.InfoBox.prototype._arrowSide, 'top');
            assert.equal(popupTemplate.InfoBox.prototype._arrowPosition, 'end');
         });
      });
   }
);
