define('Controls-demo/Container/Scroll',
   [
      'UI/Base',
      'Types/source',
      'Controls/scroll',
      'wml!Controls-demo/Container/Scroll',
   ],
   function(Base, source, scroll, template) {
      var ModuleClass = Base.Control.extend({
         _template: template,
         _pagingVisible: true,
         _scrollbarVisible: true,
         _shadowVisible: true,
         _numberOfRecords: 50,
         _scrollStyleSource: null,

         _getChildContext: function() {
            return {
               ScrollData: new scroll._scrollContext({
                  pagingVisible: this._pagingVisible
               })
            };
         },

         get shadowVisibility() {
            return this._shadowVisible ? 'auto' : 'hidden';
         }
      });

      ModuleClass._styles = ['Controls-demo/Controls-demo', 'Controls-demo/Container/Scroll'];

      return ModuleClass;
}
);
