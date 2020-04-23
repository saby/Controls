/**
 * @author Коновалова А.И.
 */
define('Controls-demo/FilterButton/Panel/resources/FBPanel/FBPanel', // Устанавливаем имя, по которому демо-компонент будет доступен в других компонентах
   [ // Массив зависимостей компонента
      'Lib/Control/CompoundControl/CompoundControl', // Подключаем базовый компонент, от которого далее будем наследовать свой демо-компонент
      'wml!Controls-demo/FilterButton/Panel/resources/FBPanel/FBPanel', // Подключаем вёрстку диалога с фильтрами
      'SBIS3.CONTROLS/ComboBox', // Подключаем контрол "Выпадающий список"
      'SBIS3.CONTROLS/TextBox', 
      'SBIS3.CONTROLS/Filter/Button/Text', // Подключаем CSS-файл со стилями, которые будут использованы в вёрстке диалога
   ],
   function( // Подключенные в массиве зависимостей файлы будут доступны в следующих переменных
      CompoundControl, // В эту переменную импортируется класс CompoundControl из файла CompoundControl.module.js
      dotTplFn // В эту переменную импортируется вёрстка демо-компонента из файла tcv_stageM.html
   ){
      var moduleClass = CompoundControl.extend({ // Наследуемся от базового компонента
         _dotTplFn: dotTplFn, // Устанавливаем шаблон, по которому будет построен демо-компонент
         _styles: ['Controls-demo/FilterButton/Panel/resources/FBPanel/FBPanel'],
         init: function() { // Инициализация компонента, здесь все дочерние компоненты готовы к использованию
            moduleClass.superclass.init.call(this); // Обязательная конструкция - вызов функции init у родительского класса
            
            
         }
      });
      return moduleClass;
   }
);