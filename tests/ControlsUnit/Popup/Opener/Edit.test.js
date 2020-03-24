/**
 * Created by as.krasilnikov on 11.09.2018.
 */
define(
   [

      'Controls/popup',
      'Types/collection',
      'Core/Deferred',
      'Types/entity'
   ],
   (popup, collection, Deferred) => {
      let dataRS = new collection.RecordSet({
         keyProperty: 'id',
         rawData: [
            {
               id: 0,
               title: 'Rooney'
            },
            {
               id: 1,
               title: 'Ronaldo'
            },
            {
               id: 2,
               title: 'Vidic'
            }
         ]
      });
      let editOpener = new popup.Edit();
      editOpener._beforeMount({});
      editOpener._options.items = dataRS;

      describe('Controls/_popup/Opener/Edit', () => {
         it('mode', () => {
            editOpener._beforeMount({});
            assert.equal(editOpener._openerTemplate, popup.Stack);

            editOpener._beforeMount({ mode: 'dialog' });
            assert.equal(editOpener._openerTemplate, popup.Dialog);

            editOpener._beforeMount({ mode: 'sticky' });
            assert.equal(editOpener._openerTemplate, popup.Sticky);

            editOpener._beforeMount({ mode: 'stack' });
            assert.equal(editOpener._openerTemplate, popup.Stack);
         });

         it('get config', () => {
            let record = dataRS.at(0).clone();
            let meta = {
               record: record,
               key: '123'
            };
            record.set('title', 'Rashford');
            var config = editOpener._getConfig(meta);
            assert.equal(editOpener._linkedKey, record.getId());
            assert.notEqual(config.templateOptions.record, record); // by link
            assert.equal(config.templateOptions.key, '123');
            assert.equal(config.templateOptions.record.getId(), record.getId());
            assert.equal(config.templateOptions.record.isChanged(), false);
         });

         it('onResult', () => {
            let isProcessingResult = false;
            let data = {
               formControllerEvent: 'update',
               record: dataRS.at(0),
               additionalData: {}
            };
            let baseSynchronize = popup.Edit.prototype._synchronize;

            editOpener._loadSynchronizer = () => (new Deferred()).callback();

            editOpener._synchronize = () => {
               isProcessingResult = true;
            };

            editOpener._notify = () => popup.Edit.CANCEL;
            editOpener._onResult(data);
            assert.equal(isProcessingResult, false);

            editOpener._notify = () => true;
            editOpener._onResult(data);
            assert.equal(isProcessingResult, true);
            editOpener._synchronize = baseSynchronize;
         });

         it('update linked key', () => {
            let data = {
               formControllerEvent: 'update',
               record: dataRS.at(1),
               additionalData: {
                  isNewRecord: true
               }
            };
            let baseSynchronize = popup.Edit.prototype._synchronize;

            editOpener._loadSynchronizer = () => (new Deferred()).callback();
            editOpener._synchronize = () => {};

            editOpener._linkedKey = null;
            editOpener._onResult(data);
            assert.equal(editOpener._linkedKey, 1);
            editOpener._synchronize = baseSynchronize;
         });

         it('processing result', () => {
            let action = '';
            let synchronizer = {
               addRecord: function(record, additionalData, items) {
                  assert.equal(record.get('title'), 'Rooney');
                  assert.equal(additionalData.isNewRecord, true);
                  assert.equal(items, editOpener._options.items);
                  action = 'create';
               },
               mergeRecord: function(record, items, editKey) {
                  assert.equal(record.get('title'), 'Rooney');
                  assert.equal(items, editOpener._options.items);
                  assert.equal(editKey, editOpener._linkedKey);
                  action = 'merge';
               },
               deleteRecord: function(items, editKey) {
                  assert.equal(items, editOpener._options.items);
                  assert.equal(editKey, editOpener._linkedKey);
                  action = 'delete';
               }
            };

            let data = {
               formControllerEvent: 'update',
               record: dataRS.at(0),
               additionalData: {}
            };

            editOpener._processingResult(synchronizer, data, editOpener._options.items, editOpener._linkedKey);
            assert.equal(action, 'merge');

            data.additionalData.isNewRecord = true;
            editOpener._processingResult(synchronizer, data, editOpener._options.items, editOpener._linkedKey);
            assert.equal(action, 'create');

            data.formControllerEvent = 'delete';
            editOpener._processingResult(synchronizer, data, editOpener._options.items, editOpener._linkedKey);
            assert.equal(action, 'delete');

            action = '';
            editOpener._processingResult(synchronizer, data, editOpener._options.items, null);
            assert.equal(action, '');
         });

         it('synchronize', () => {
            let baseProcessingResult = popup.Edit.prototype._processingResult;
            let isProcessingResult = false;
            let synchronizer = 'synchronizer';
            let data = {
               formControllerEvent: 'update',
               record: dataRS.at(0),
               additionalData: {}
            };
            editOpener._processingResult = (_synchronizer, _data, _items, _editKey) => {
               assert.equal(synchronizer, _synchronizer);
               assert.equal(data, _data);
               assert.equal(_items, editOpener._options.items);
               assert.equal(_editKey, editOpener._linkedKey);
               isProcessingResult = true;
            };
            editOpener._synchronize('', data, synchronizer);
            assert.equal(isProcessingResult, true);

            isProcessingResult = false;
            let def = new Deferred();
            editOpener._synchronize(def, data, synchronizer);
            assert.equal(isProcessingResult, false);
            def.callback();
            assert.equal(isProcessingResult, true);
         });
      });
   }
);
