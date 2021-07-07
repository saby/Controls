/**
 * Created by am.gerasimov on 21.06.2017.
 */
define([
   'Controls/lookup',
   'Types/collection',
   'Types/source',
   'Types/entity'
], function (lookup, collection, sourceLib, entity) {
   'use strict';

   /* Сделаем кастомную модель,
      чтобы не совпадал _moduleName */
   let customModel = entity.Model.extend({
      _moduleName: 'customModel',
      _$properties: {
         isCustom: {
            get: function() {
               return true;
            }
         }
      }
   });

   let dataSource = new sourceLib.SbisService({model: customModel});
   let list = new collection.List();
   let recordSet = new collection.RecordSet();
   let model = new entity.Model();

   list.add(new entity.Model());
   model.set('recordSet', recordSet);
   recordSet._getMediator().addRelationship(model, recordSet, 'customRelationship');
   let ToSourceModel = lookup.ToSourceModel;

   describe('Controls/_lookup/resources/ToSourceModel', function () {

      describe('check collections', function() {

         it('check list', function() {
            var res = true;

            try {
               ToSourceModel(list.clone(), dataSource, '', true);
            } catch (e) {
               res = false;
            }

            assert.equal(res, true);
         });

         it('check recordset', function() {
            var res = true;

            try {
               ToSourceModel(recordSet.clone(), dataSource, '', true);
            } catch (e) {
               res = false;
            }

            assert.equal(res, true);
         });

      });

      describe('to source model', function () {

         it('check model by step', function() {
            assert.equal(model.isChanged(), true);
            model.acceptChanges();
            assert.equal(model.isChanged(), false);
            assert.equal(list.at(0)._moduleName,  'Types/entity:Model');
            assert.equal(ToSourceModel(list.clone(), dataSource, '', true).at(0)._moduleName, 'customModel');
            assert.equal(model.isChanged(), false);

            var prefetchSource = new sourceLib.PrefetchProxy({target: dataSource});
            assert.equal(ToSourceModel(list.clone(), prefetchSource, '', true).at(0)._moduleName, 'customModel');
         });

      });

   })
});

