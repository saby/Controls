define('Controls-demo/Example/Input/Suggest',
   [
      'Core/Control',
      'Types/source',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Suggest/Suggest',

      'Controls/suggest',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Control, sourceLib, SetValueMixin, template) {
      'strict use';

      var source = new sourceLib.Memory({
         keyProperty: 'id',
         data: [
            { id: 1, title: 'Lozhkin Andrei Sergeevich' },
            { id: 2, title: 'Spielberg Marina Petrovna' },
            { id: 3, title: 'Leontyev Dmitry Maksimovich' },
            { id: 4, title: 'Blagov Nikita Sergeevich' },
            { id: 5, title: 'Troshkina Polina Sergeevna' },
            { id: 6, title: 'Smirnova Anastasia Petrovna' },
            { id: 7, title: 'Agutina Anastasia Petrovna' },
            { id: 8, title: 'Cats Darya Petrovna' },
            { id: 9, title: 'Smirnova Marina Petrovna' },
            { id: 10, title: 'Sidorov Nikita Maksimovich' },
            { id: 11, title: 'Cats Marina Petrovna' },
            { id: 12, title: 'Sidorova Anna Petrovna' },
            { id: 13, title: 'Smirnova Inna Petrovna' },
            { id: 14, title: 'Sidorova Elizabeth Petrovna' },
            { id: 15, title: 'Troshkin Ivan Maksimovich' },
            { id: 16, title: 'Blockina Polina Petrovna' },
            { id: 17, title: 'Spielberg Svetlana Sergeevna' },
            { id: 18, title: 'Cats Inna Petrovna' },
            { id: 19, title: 'Spielberg Anton Maksimovich' },
            { id: 20, title: 'Mushkina Anastasia Petrovna' },
            { id: 21, title: 'Smirnova Marina Petrovna' },
            { id: 22, title: 'Cats Inna Petrovna' },
            { id: 23, title: 'Lozhkina Anna Sergeevna' },
            { id: 24, title: 'Smirnova Lydia Maximovna' },
            { id: 25, title: 'Troshkina Svetlana Petrovna' },
            { id: 26, title: 'Blagova Elizabeth Sergeevna' },
            { id: 27, title: 'Mushkina Polina Maximovna' },
            { id: 28, title: 'Blagov Nikita Maksimovich' },
            { id: 29, title: 'Leontyev Dmitry Petrovich' },
            { id: 30, title: 'Agutina Darya Petrovna' },
            { id: 31, title: 'Cats Marina Petrovna' },
            { id: 32, title: 'Smirnova Polina Maximovna' },
            { id: 33, title: 'Spielberg Svetlana Petrovna' },
            { id: 34, title: 'Lozhkina Polina Petrovna' },
            { id: 35, title: 'Mushkina Ekaterina Maximovna' },
            { id: 36, title: 'Leontyev Andrei Maksimovich' },
            { id: 37, title: 'Troshkina Elizabeth Petrovna' },
            { id: 38, title: 'Macoris Victoria Sergeevna' },
            { id: 39, title: 'Macoris Ilya Maksimovich' },
            { id: 40, title: 'Macoris Maxim Petrovich' },
            { id: 41, title: 'Blagov Ivan Petrovich' },
            { id: 42, title: 'Blagov Marina Petrovna' },
            { id: 43, title: 'Sidorov Andrei Petrovich' },
            { id: 44, title: 'Cats Maria Petrovna' },
            { id: 45, title: 'Lozhkina Ekaterina Petrovna' },
            { id: 46, title: 'Troshkin Anton Petrovich' },
            { id: 47, title: 'Sidorova Victoria Petrovna' },
            { id: 48, title: 'Macoris Darya Petrovna' },
            { id: 49, title: 'Smirnov Ivan Petrovich' },
            { id: 50, title: 'Cats Ilya Petrovich' },
            { id: 51, title: 'Blagov Maxim Petrovich' },
            { id: 52, title: 'Macoris Nikita Petrovich' },
            { id: 53, title: 'Smirnova Maria Sergeevna' },
            { id: 54, title: 'Macoris Anastasia Maximovna' },
            { id: 55, title: 'Spielberg Ivan Petrovich' },
            { id: 56, title: 'Blagova Maria Petrovna' },
            { id: 57, title: 'Cats Anastasia Petrovna' },
            { id: 58, title: 'Sidorova Anastasia Maximovna' },
            { id: 59, title: 'Spielberg Ekaterina Maximovna' }
         ],
         filter: function(item, searchValue) {
            var title = searchValue.title;

            if (title) {
               return item.get('title').indexOf(title) !== -1;
            }
            return true;
         }
      });

      return Control.extend([SetValueMixin], {
         _template: template,
         _styles: ['Controls-demo/Example/Input/Suggest/Suggest'],

         _source: null,

         _beforeMount: function() {
            this._source = source;
         }
      });
   });
