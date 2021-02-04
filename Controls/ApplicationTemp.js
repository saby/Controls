define('Controls/ApplicationTemp', [
   'Controls/Application',
   'wml!Controls/Application/BootstrapPage'
], function(Base, template) {
   /**
    * Контрол-заглушка на время массовой замены
    * Полностью повторяет функционал Controls/Application, за исключением шаблона
    * В шаблоне строится только контент без UI/HTML
    */
   return Base.extend({
      _template: template
   });
});
