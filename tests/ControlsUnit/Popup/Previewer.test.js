define(
   [
      'Controls/popup',
      'Vdom/Vdom'
   ],
   (popup, Vdom) => {
      'use strict';
      var SyntheticEvent = Vdom.SyntheticEvent;
      describe('Controls/_popup/Previewer', () => {
         it('_contentMouseDownHandler', () => {
            let PWInstance = new popup.PreviewerTarget();
            var result;
            PWInstance._isPopupOpened = function() {
               return false;
            };
            PWInstance._debouncedAction = function(method, args) {
               result = true;
            };
            var event = new SyntheticEvent(null, {});
            PWInstance._options.trigger = 'click';
            PWInstance._contentMouseDownHandler(event);
            assert.deepEqual(result, true);
            result = false;
            PWInstance._options.trigger = 'hover';
            PWInstance._contentMouseDownHandler(event);
            assert.deepEqual(result, false);
            PWInstance._options.trigger = 'hoverAndClick';
            PWInstance._contentMouseDownHandler(event);
            assert.deepEqual(result, true);
            PWInstance.destroy();
         });
         it('contentMouseenterHandler', () => {
            let PWInstance = new popup.PreviewerTarget();
            var cancel = false;
            PWInstance._cancel = function(event, args) {
               cancel = true;
            };
            var event = new SyntheticEvent(null, {});
            PWInstance._options.trigger = 'hover';
            PWInstance._isOpened = false;
            PWInstance._contentMouseenterHandler(event);
            assert.deepEqual(cancel, false);
            PWInstance._isOpened = true;
            PWInstance._contentMouseenterHandler(event);
            assert.deepEqual(cancel, true);
            PWInstance.destroy();
         });
      });

      describe('Controls/_popup/Previewer', () => {
         it('getConfig', () => {
            let PWInstance = new popup.PreviewerTarget();
            let targetPoint = {
               vertical: 'top'
            };
            let direction = {
               horizontal: 'left',
               vertical: 'top'
            };
            let options = {
               isCompoundTemplate: true,
               targetPoint,
               direction
            };
            let fittingMode = {
               vertical: 'adaptive',
               horizontal: 'overflow'
            };
            PWInstance.saveOptions(options);

            let config = PWInstance._getConfig();
            assert.equal(config.targetPoint, targetPoint);
            assert.equal(config.direction, direction);
            assert.equal(config.isCompoundTemplate, true);
            assert.deepEqual(config.fittingMode, fittingMode);

            PWInstance.saveOptions({});
            config = PWInstance._getConfig();
            let baseCorner = {
               vertical: 'bottom',
               horizontal: 'right'
            };
            assert.deepEqual(config.targetPoint, baseCorner);
            assert.equal(config.hasOwnProperty('verticalAlign'), false);
            assert.equal(config.hasOwnProperty('horizontalAlign'), false);
         });
      });
   }
);
