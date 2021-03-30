/**
 * Created by as.krasilnikov on 11.09.2018.
 */
define(
   [
      'Controls/Utils/RecordSynchronizer',
      'Types/collection',
      'Types/entity'
   ],
   (RecordSynchronizer, collection, entity) => {
      let items = new collection.RecordSet({
         keyProperty: 'id',
         format: [{
            name: 'id',
            type: 'integer'
         }, {
            name: 'title',
            type: 'string'
         }],
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

      let createRecord = rawData => new entity.Model({
         rawData: rawData,
         keyProperty: 'id'
      });

      describe('RecordSynchronizer', () => {
         it('add record', () => {
            let editRecord = new entity.Model({
               rawData: {
                  id: 4,
                  title: 'Lukaku'
               },
               keyProperty: 'id'
            });
            let additionalData = {
               at: 1,
               isNewRecord: true,
               key: 4
            };
            RecordSynchronizer.addRecord(editRecord, additionalData, items);
            assert.equal(items.at(additionalData.at).getId(), editRecord.getId());
         });

         it('merge record', () => {
            let editRecord = new entity.Model({
               rawData: {
                  id: 0,
                  title: 'Rashford',
                  club: 'mu'
               },
               keyProperty: 'id'
            });
            let linkedKey = 0;
            RecordSynchronizer.mergeRecord(editRecord, items, linkedKey);
            assert.equal(items.at(0).get('title'), editRecord.get('title'));
            assert.equal(items.at(0).getId(), editRecord.getId());
            assert.equal(items.at(0).get('club'), undefined);
         });

         it('is Changed by merge record', () => {
            let editRecord = new entity.Model({
               rawData: {
                  id: 0,
                  title: 'Rashford',
                  club: 'mu'
               },
               keyProperty: 'id'
            });
            let linkedKey = 0;
            RecordSynchronizer.mergeRecord(editRecord, items, linkedKey);
            assert.equal(editRecord.isChanged(), false);

            editRecord._setChangedField('title', 'Rashford');
            RecordSynchronizer.mergeRecord(editRecord, items, linkedKey);
            assert.equal(editRecord.isChanged(), true);
         });

         it('delete record', () => {
            let linkedKey = 0;
            RecordSynchronizer.deleteRecord(items, linkedKey);
            var removeRecord = items.getRecordById(0);
            assert.equal(removeRecord, undefined);
         });

         it('isEqual', () => {
            let isEqual = RecordSynchronizer._private.isEqual;
            let arg1 = 123;
            let arg2 = '123';
            assert.equal(isEqual(arg1, arg2), false);

            arg1 = () => {};
            arg2 = () => {};
            assert.equal(isEqual(arg1, arg2), true);

            arg1 = {
               a: 1
            };
            arg2 = {
               a: 1
            };
            assert.equal(isEqual(arg1, arg2), true);
            arg2 = {
               2: 1
            };
            assert.equal(isEqual(arg1, arg2), false);

            arg1 = '123';
            arg2 = '123';
            assert.equal(isEqual(arg1, arg2), true);

            arg1 = '1234';
            arg2 = '123';
            assert.equal(isEqual(arg1, arg2), false);

            arg1 = new entity.Model({
               rawData: {
                  a: 1
               }
            });
            arg2 = new entity.Model({
               rawData: {
                  a: 1
               }
            });
            assert.equal(isEqual(arg1, arg2), true);

            arg2 = new entity.Model({
               rawData: {
                  a: 2
               }
            });
            assert.equal(isEqual(arg1, arg2), false);
         });

         it('add records', () => {
            let editRecord = [];
            items.clear();
            editRecord.push(createRecord({
               id: 0,
               title: 'Lukaku1'
            }));
            editRecord.push(createRecord({
               id: 1,
               title: 'Lukaku2'
            }));
            editRecord.push(createRecord({
               id: 2,
               title: 'Lukaku3'
            }));
            RecordSynchronizer.addRecord(editRecord, null, items);
            assert.equal(items.getCount(), 3);
         });

         it('merge records', () => {
            let editRecord = [];
            editRecord.push(createRecord({
               id: 0,
               title: 'Rooney1'
            }));
            editRecord.push(createRecord({
               id: 1,
               title: 'Rooney2'
            }));
            editRecord.push(createRecord({
               id: 2,
               title: 'Rooney3'
            }));
            RecordSynchronizer.mergeRecord(editRecord, items);
            assert.equal(items.getCount(), 3);
            assert.equal(items.at(0).get('title'), 'Rooney1');
            assert.equal(items.at(1).get('title'), 'Rooney2');
            assert.equal(items.at(2).get('title'), 'Rooney3');
         });

         it('delete records', () => {
            var ids = [];
            items.each(function(model) {
               ids.push(model.getId());
            });
            RecordSynchronizer.deleteRecord(items, ids);
            assert.equal(ids.length, 3);
            assert.equal(items.getCount(), 0);
         });

         it('delete nonexistent record', () => {
            items.clear();
            RecordSynchronizer.deleteRecord(items, 1);
            assert.equal(items.getCount(), 0);
         });
      });
   }
);
