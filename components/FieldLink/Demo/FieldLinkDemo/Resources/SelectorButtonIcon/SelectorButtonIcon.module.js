/**
 * @author Быканов А.А.
 */
define('js!SBIS3.CONTROLS.Demo.SelectorButtonIcon', // Устанавливаем имя, по которому демо-компонент будет доступен в других компонентах
   [ // Массив зависимостей компонента
      'js!SBIS3.CORE.CompoundControl', // Подключаем базовый класс, от которого далее будем наследоваться
      'html!SBIS3.CONTROLS.Demo.SelectorButtonIcon', // Подключаем вёрстку демо-компонента
      'js!WS.Data/Source/Memory', // Подключаем класс для работы со статическим источником данных
      'css!SBIS3.CONTROLS.Demo.SelectorButtonIcon', // Подключаем CSS-файл демо-компонента
      'js!SBIS3.CONTROLS.SelectorButton' // Подключаем контрол поля связи
   ],
   function( // Подключенные в массиве зависимостей файлы будут доступны в следующих переменных
      CompoundControl, // В эту переменную импортируется класс CompoundControl из файла CompoundControl.module.js
      dotTplFn, // В эту переменную импортируется вёрстка демо-компонента из файла SelectorButtonIcon.xhtml
      Memory // В эту переменную импортируется класс для работы со статическим источником данных
   ){
      var moduleClass = CompoundControl.extend({ // Наследуемся от базового компонента
         _dotTplFn: dotTplFn, // Устанавливаем шаблон, по которому будет построен демо-компонент
         init: function() { // Инициализация компонента, здесь все дочерние компоненты готовы к использованию
            moduleClass.superclass.init.call(this); // Обязательная конструкция, чтобы корректно работал указатель this
            var myData = [ // Создаём "сырые" данные, из которых потом будет создан статический источник
                   {'Ид': 1, 'Название': 'Инженер-программист'},
                   {'Ид': 2, 'Название': 'Руководитель группы'},
                   {'Ид': 3, 'Название': 'Менеджер'},
                   {'Ид': 4, 'Название': 'Тестировщик'},
                   {'Ид': 5, 'Название': 'Технолог'},
                   {'Ид': 6, 'Название': 'Бухгалтер'}
                ],
                dataSource = new Memory({ // Производим инициализацию статического источника данных
                   data: myData, // Передаём наши данные в качестве исходных для будущих записей
                   idProperty: 'Ид' // Устанавливаем поле первичного ключа
                });
            this.getChildControlByName('FieldLinkSelectorButtonIcon').setDataSource(dataSource); // Устанавливаем источник данных для контрола
            $ws.helpers.message('Поле связи в виде кнопки с иконкой. Установлен режим единичного выбора значения.');
         }
      });
      return moduleClass;
   }
);