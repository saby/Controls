define('Controls-demo/SerializerDepsStorage/SerializerDepsStorage', [
   'UI/Base',
   'wml!Controls-demo/SerializerDepsStorage/SerializerDepsStorage'
], function(
   Base,
   template
) {
   'use strict';

   // Данная демка служит для проверки сериализации функции на сервере.
   var DemoControl = Base.Control.extend({
      _template: template,
      result: 'не проверено',
      _beforeMount: function(opt, ctx, rs) {
         var self = this;
         return new Promise(function(resolve) {
            if (typeof document === 'undefined') {
               // Выполним на сервере асинхронный require модуля, генерирующего объект, который содержит функцию.
               require(['Controls-demo/SerializerDepsStorage/ModuleToRequire'], function(result) {
                  // Объект, переданный в resolve в _beforeMount на сервере, сериализуется и приходит в
                  // _beforeMount на клиенте как receivedState (то есть третьим аргументом).
                  resolve({ opt: result.myFunc });
               });
            } else {
               // Если функция успешно сериализовалась, её можно использовать на клиенте.
               // В зависимости от того, выполнено это условие или нет, в шаблоне отрисуется "верно" или "неверно".
               self.result = rs && typeof rs.opt === 'function' && rs.opt() === 'function result' ? 'верно' : 'неверно';
               resolve();
            }
         });
      }
   });

   return DemoControl;
});
