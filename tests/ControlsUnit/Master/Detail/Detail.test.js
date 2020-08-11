define(['Controls/masterDetail', 'UI/Vdom'], function (masterDetail, Vdom) {
   'use strict';
   describe('Controls.Container.MasterDetail', function () {
      it('selected master value changed', () => {
         let Control = new masterDetail.Base();
         let event = {
            stopPropagation: () => {
            }
         };
         Control._selectedMasterValueChangedHandler(event, 'newValue');
         assert.equal(Control._selected, 'newValue');
         Vdom.Synchronizer.unMountControlFromDOM(Control, {});
      });

      it('beforeMount', (done) => {
         const Control = new masterDetail.Base();
         Control._getSettings = () => {
            return Promise.resolve({'1': 500});
         };

         let options = {
            propStorageId: '1',
            masterMinWidth: 100,
            masterWidth: 200,
            masterMaxWidth: 300
         };

         Control._beforeMount(options).then((result) => {
            assert.equal(result, '300px');
            assert.equal(Control._currentMinWidth, '100px');
            assert.equal(Control._currentMaxWidth, '300px');
            Vdom.Synchronizer.unMountControlFromDOM(Control, {});
            done();
         });
      });

      it('initCurrentWidth', () => {
         let Control = new masterDetail.Base();
         let options = {
            propStorageId: '1',
            masterMinWidth: 0,
            masterWidth: 0,
            masterMaxWidth: 0
         };
         Control.initCurrentWidth(options.masterWidth);
         assert.equal(Control._currentWidth, '0px');
         Vdom.Synchronizer.unMountControlFromDOM(Control, {});
      });

      it('update offset', () => {
         let Control = new masterDetail.Base();

         // base
         let options = {
            masterMinWidth: 100,
            masterWidth: 200,
            masterMaxWidth: 299,
            propStorageId: 10
         };

         Control._canResizing = Control._isCanResizing(options);
         Control._updateOffset(options);
         assert.equal(Control._minOffset, 100);
         assert.equal(Control._maxOffset, 99);
         assert.equal(Control._currentWidth, '200px');


         Control._beforeUpdate(options);
         assert.equal(Control._minOffset, 100);
         assert.equal(Control._maxOffset, 99);
         assert.equal(Control._currentWidth, '200px');

         // wrong maxWidth
         options = {
            masterMinWidth: 100,
            masterWidth: 200,
            masterMaxWidth: 150
         };
         Control._beforeUpdate(options);
         assert.equal(Control._minOffset, 50);
         assert.equal(Control._maxOffset, 0);
         assert.equal(Control._currentWidth, '150px');

         // wrong minWidth
         options = {
            masterMinWidth: 250,
            masterWidth: 200,
            masterMaxWidth: 299
         };
         Control._beforeUpdate(options);
         assert.equal(Control._minOffset, 0);
         assert.equal(Control._maxOffset, 99);
         assert.equal(Control._currentWidth, '250px');

         options = {
            masterMinWidth: 0,
            masterWidth: 0,
            masterMaxWidth: 0
         };
         Control._beforeUpdate(options);
         assert.equal(Control._minOffset, 0);
         assert.equal(Control._maxOffset, 0);
         assert.equal(Control._currentMinWidth, '0px');
         assert.equal(Control._currentMaxWidth, '0px');
         assert.equal(Control._currentWidth, '0px');

         Vdom.Synchronizer.unMountControlFromDOM(Control, {});
      });

      it ('_dragStartHandler', () => {
         let Control = new masterDetail.Base();
         let options = {
            masterMinWidth: 100,
            masterWidth: 150,
            masterMaxWidth: 200
         };
         Control._options = options;
         Control._canResizing = true;
         Control._dragStartHandler();
         assert.equal(Control._minOffset, 50);
         assert.equal(Control._maxOffset, 50);
         assert.equal(Control._currentWidth, '150px');
         Control.destroy();
      });

      it('is can resizing', () => {
         let Control = new masterDetail.Base();
         let options = {
            masterMinWidth: 250,
            masterWidth: 200,
            masterMaxWidth: 299,
            propStorageId: 10
         };
         assert.equal(Control._isCanResizing(options), true);

         delete options.masterMinWidth;
         assert.equal(Control._isCanResizing(options), false);

         options.masterMinWidth = options.masterMaxWidth;
         assert.equal(Control._isCanResizing(options), false);
         Vdom.Synchronizer.unMountControlFromDOM(Control, {});
      });

      it('afterRender', () => {
         const Control = new masterDetail.Base();
         let isStartRegister = false;
         let isSetSettings = false;
         Control._startResizeRegister = () => isStartRegister = true;
         Control._setSettings = () => isSetSettings = true;

         Control._afterRender();
         assert.equal(isStartRegister, false);
         assert.equal(isSetSettings, false);

         Control._currentWidth = 1;
         Control._afterRender();
         assert.equal(isStartRegister, true);
         assert.equal(isSetSettings, true);

         Vdom.Synchronizer.unMountControlFromDOM(Control, {});
      });

      it('masterWidthChanged', () => {
         const control = new masterDetail.Base();
         const sandbox = sinon.createSandbox();
         const event = {};
         const offset = 100;
         sandbox.stub(control, '_notify');
         control._currentWidth = 100;

         control._offsetHandler(event, offset);

         sinon.assert.calledWith(control._notify, 'masterWidthChanged', ['200px']);

         sandbox.restore();
      });
   });
});
