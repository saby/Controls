define('Controls-demo/Container/Scroll',
   [
      'Core/Control',
      'Types/source',
      'Controls/scroll',
      'wml!Controls-demo/Container/Scroll',
   ],
   function(Control, source, scroll, template) {
      return Control.extend({
         _template: template,
         _styles: ['Controls-demo/Container/Scroll'],
         _pagingVisible: true,
         _scrollbarVisible: true,
         _shadowVisible: true,
         _numberOfRecords: 50,
         _selectedStyle: 'default',
         _scrollStyleSource: null,

         _getChildContext: function() {
            return {
               ScrollData: new scroll._scrollContext({
                  pagingVisible: this._pagingVisible
               })
            };
         }
      });
   }
);
