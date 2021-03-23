define(['Controls/_filterPopup/Panel/Select'
], function(Select) {
   describe('Controls/_filterPopup/Panel/Select', function() {

      it('_clickHandler', function() {
         let select = new Select.default();
         let textValue, selectedKeys;

         const items = [
            {id: '1', title: 'Опубликованные'},
            {id: '2', title: 'Нет', text: 'Неопубликованные'},
         ];
         select.saveOptions({
            items: items,
            textValueProperty: 'text',
            displayProperty: 'title',
            keyProperty: 'id'
         });
         select._notify = function(eventName, value) {
            if (eventName === 'textValueChanged') {
               textValue = value[0];
            } else if (eventName === 'selectedKeysChanged') {
               selectedKeys = value[0];
            }
         };

         select._clickHandler('click', items[0]);
         assert.equal(textValue, 'Опубликованные');
         assert.deepEqual(selectedKeys, ['1']);

         select._clickHandler('click', items[1]);
         assert.equal(textValue, 'Неопубликованные');
         assert.deepEqual(selectedKeys, ['2']);
      });
   });
});
