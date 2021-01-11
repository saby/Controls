define('Controls-demo/Popup/Opener/Compatible/resources/dimensionNewPanel',
   [
      'UI/Base',
      'tmpl!Controls-demo/Popup/Opener/Compatible/resources/dimensionNewPanel',
   ], function(
      Base,
      template
   ) {
      var moduleClass = Base.Control.extend({
         _template: template,

         constructor: function (cfg) {
            moduleClass.superclass.constructor.call(this, cfg);
         },

         _beforeMount: function(opt) {

         },
         openStack: function () {
            this._children.stack.open({
               opener: this._children.stackButton
            });
         },

         _onResult: function () {
            this._notify('sendResult', ['1st result event', '2nd result event', '3rd result event'], { bubbling: true });
         }
      });

      moduleClass.dimensions = {
      };
      return moduleClass;
   });
