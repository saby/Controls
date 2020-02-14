define(['Controls/masterDetail'], function (masterDetail) {
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
         Control.destroy();
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
            Control.destroy();
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
         Control.destroy();
      });

      it('update offset', () => {
         let Control = new masterDetail.Base();

         // base
         let options = {
            masterMinWidth: 100,
            masterWidth: 200,
            masterMaxWidth: 299
         };

         Control._canResizing = Control._isCanResizing(options);
         Control._afterMount(options);
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

         // width=0
         options = {
            masterMinWidth: 0,
            masterWidth: 0,
            masterMaxWidth: 0
         };
         Control._beforeUpdate(options);
         assert.equal(Control._minOffset, 0);
         assert.equal(Control._maxOffset, 0);
         assert.equal(Control._currentWidth, '0px');

         Control.destroy();
      });

      it('is can resizing', () => {
         let Control = new masterDetail.Base();
         let options = {
            masterMinWidth: 250,
            masterWidth: 200,
            masterMaxWidth: 299
         };
         assert.equal(Control._isCanResizing(options), true);

         delete options.masterMinWidth;
         assert.equal(Control._isCanResizing(options), false);

         options.masterMinWidth = options.masterMaxWidth;
         assert.equal(Control._isCanResizing(options), false);
         Control.destroy();
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

         Control.destroy();
      })
   });
});
