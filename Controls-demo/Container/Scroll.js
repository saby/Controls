define('Controls-demo/Container/Scroll',
   [
      'UI/Base',
      'Types/source',
      'wml!Controls-demo/Container/Scroll',
   ],
   function(Base, source, template) {
      var ModuleClass = Base.Control.extend({
         _template: template,
         _pagingVisible: true,
         _scrollbarVisible: true,
         _shadowVisible: true,
         _numberOfRecords: 50,
         _scrollStyleSource: null,

         get shadowVisibility() {
            return this._shadowVisible ? 'auto' : 'hidden';
         }
      });

      ModuleClass._styles = ['Controls-demo/Controls-demo', 'Controls-demo/Container/Scroll'];

      return ModuleClass;
}
);
