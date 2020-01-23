define(['Controls/operationsPopup'], function(operationsPopup) {
   'use strict';

   describe('Controls/_operationsPopup/ReportDialog', function() {
      var reportDialog = new operationsPopup.ReportDialog();

      it('success', function() {
         reportDialog._beforeMount({
            operationsCount: 10,
            operationsSuccess: 10
         });
         assert.equal(reportDialog._message, '10 записей успешно обработаны');
      });
      it('error without errors list', function() {
         reportDialog._beforeMount({
            operationsCount: 10,
            operationsSuccess: 6
         });
         assert.equal(reportDialog._message, 'Выполнение операции завершилось ошибкой');
      });
      it('error with errors list', function() {
         reportDialog._beforeMount({
            operationsCount: 10,
            operationsSuccess: 6,
            errors: ['error1']
         });
         assert.equal(reportDialog._message, '4 из 10 операций были обработаны с ошибкой');
      });
   });
});
