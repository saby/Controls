define('Controls-demo/MasterDetail/Demo', [
   'Core/Control',
   'wml!Controls-demo/MasterDetail/Demo',
   'Controls-demo/MasterDetail/Data',
   'Core/core-clone',
   'Types/source',
   'wml!Controls-demo/MasterDetail/itemTemplates/masterItemTemplate',
   'Controls-demo/MasterDetail/DemoSource',
   'Env/Env',
], function(Control, template, data, cClone, source, itemTemplate, DemoSource, Env) {
   return Control.extend({
      _template: template,
      _styles: ['Controls-demo/MasterDetail/Demo', 'Controls-demo/Controls-demo'],


      _beforeMount: function() {
         this._detail = {};

         this._detailSource = new DemoSource({keyProperty: 'id'});

         this._itemActions = [
            {
               id: 1,
               icon: 'icon-ExpandDown',
               title: 'view',
               handler: function(item) {
                  Env.IoC.resolve('ILogger').info('action view Click ', item);
               }
            }
         ];

         this._masterSource = new source.Memory({
            keyProperty: 'id',
            data: cClone(data.master)
         });
      },

      _firstHandler: function() {
         this._firstBaseWidth = '1000px';
         this._children.resizeDetect.start();
      },

      _secondHandlerIncrease: function() {
         this._secondBaseWidth = '1920px';
         this._children.resizeDetect1.start();
      },

      _secondHandlerDecrease: function() {
         this._secondBaseWidth = '1000px';
         this._children.resizeDetect1.start();
      },

      gridColumns: [
         {
            displayProperty: 'name',
            width: '1fr',
            template: itemTemplate
         }
      ]
   });
});
