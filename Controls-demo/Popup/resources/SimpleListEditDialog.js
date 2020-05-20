define('Controls-demo/Popup/resources/SimpleListEditDialog',
   [

      // Подключаем базовый класс для наследования диалога редактирования
      'SBIS3.CONTROLS/FormController',
      'wml!Controls-demo/Popup/resources/SimpleListEditDialog/SimpleListEditDialog',
      'Types/source',
      'SBIS3.CONTROLS/TextBox',
      'SBIS3.CONTROLS/Button', 
      'SBIS3.CONTROLS/FormattedTextBox', 
      'SBIS3.CONTROLS/ComboBox',
      'SBIS3.CONTROLS/DataGridView',
      'SBIS3.CONTROLS/NumberTextBox',
      'SBIS3.CONTROLS/Button/IconButton',
      'SBIS3.CONTROLS/Toolbar'
   ],
   function(FormController, dotTplFn) {

      // Наследуемся от базового класса для диалога редактирования
      var moduleClass = FormController.extend({
         _dotTplFn: dotTplFn,
         $protected: {
            _options: {
               dataSource: {
                  endpoint:{
                     contract: 'ДиалогРедактирования'
                  },
                  binding: {
                     read: 'ReadCustomWithDelay'
                  }
               },
               idProperty: '@ДиалогРедактирования'
            }
         },
         init: function() {
            moduleClass.superclass.init.call(this);
            this.getChildControlByName('Сохранить').subscribe('onActivated', function() {
               this.sendCommand('update', {closePanelAfterSubmit: true});
            });
         }
      });
      moduleClass.dimensions = {
         width: '550px',
         height: '100px'
      };
      moduleClass._styles = ['Controls-demo/Popup/resources/SimpleListEditDialog/SimpleListEditDialog'];

      return moduleClass;
   }
);