define(['Controls/operationsPanel'], function(operationsPanel) {
   'use strict';
   describe('Controls/_operationsPanel/Container', function() {
      describe('_getSelectedKeys', function() {
         let containerInstance = new operationsPanel.Container();

         assert.deepEqual(containerInstance._getSelectedKeys({
            listMarkedKey: null,
            selectedKeys: []
         }), []);

         assert.deepEqual(containerInstance._getSelectedKeys({
            listMarkedKey: 1,
            selectedKeys: []
         }), [1]);

         assert.deepEqual(containerInstance._getSelectedKeys({
            listMarkedKey: 1,
            selectedKeys: [2]
         }), [2]);
      });

      describe('_beforeUpdate', function() {
         let containerInstance = new operationsPanel.Container();

         containerInstance._options.listMarkedKey = null;
         containerInstance._options.selectedKeys = [];

         containerInstance._beforeUpdate({
            listMarkedKey: 1,
            selectedKeys: []
         });
         assert.deepEqual(containerInstance._selectedKeys, [1]);

         containerInstance._beforeUpdate({
            listMarkedKey: 1,
            selectedKeys: [2]
         });
         assert.deepEqual(containerInstance._selectedKeys, [2]);
      });
   });
});
