define('Controls-demo/HtmlJsonAttributes/HtmlJsonAttributes',
   [
      'UI/Base',
      'wml!Controls-demo/HtmlJsonAttributes/HtmlJsonAttributes'
   ],
   function(Base, template) {
      return Base.Control.extend({
         _template: template,
         json: [
            ['div', 'Привет, мир!']
         ]
      });
   });
