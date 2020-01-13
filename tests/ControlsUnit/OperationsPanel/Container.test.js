define(['Controls/operationsPanel'], function(operationsPanel) {
   'use strict';
   describe('Controls/_operationsPanel/Container', function() {
      let containerInstance = new operationsPanel.Container.default();

      containerInstance._options.listMarkedKey = null;
      containerInstance._options.selectedKeys = [];
      assert.deepEqual(containerInstance._getSelectedKeys(), []);

      containerInstance._options.listMarkedKey = 1;
      assert.deepEqual(containerInstance._getSelectedKeys(), [1]);

      containerInstance._options.selectedKeys = [2];
      assert.deepEqual(containerInstance._getSelectedKeys(), [2]);
   });
});
