define('Controls-demo/Checkbox/Group', [
   'Core/Control',
   'wml!Controls-demo/Checkbox/Group/Group',
   'Types/source',
], function(Control, template, source) {
   'use strict';

   var CheckboxGroup = Control.extend(
      {
         _template: template,
         _keyProperty: 'key',
         _parentProperty: 'parent',
         _nodeProperty: 'node',

         _beforeMount: function() {
            this._selectedKeysVertical = [1];
            this._selectedKeysHorizontal = [2, 4, 6];
            this._selectedKeysHierarchy = [4, 5];
            this._sourceVertical = new source.Memory({
               keyProperty: 'key',
               data: [
                  {
                     key: 1,
                     title: 'Получен документ'
                  },
                  {
                     key: 2,
                     title: 'Контрагент ответил'
                  },
                  {
                     key: 3,
                     title: 'Пришло приглашение'
                  }
               ]
            });

            this._sourceHorizontal = new source.Memory({
               keyProperty: 'key',
               data: [
                  {
                     key: 1,
                     title: 'Получен документ'
                  },
                  {
                     key: 2,
                     title: 'Пришло приглашение'
                  },
                  {
                     key: 3,
                     title: 'Получен ответ на приглашение'
                  },
                  {
                     key: 4,
                     title: 'Получен ответ контрагентов'
                  },
                  {
                     key: 5,
                     title: 'Получено сообщение'
                  },
                  {
                     key: 6,
                     title: 'Получен запрос на доступ'
                  },
                  {
                     key: 7,
                     title: 'Получен отрицательный ответ'
                  }
               ]
            });

            this._sourceHierarchy = new source.Memory({
               keyProperty: 'key',
               data: [
                  {
                     key: 1,
                     title: 'Автообновление',
                     parent: null,
                     node: false
                  },
                  {
                     key: 2,
                     title: 'Получать уведомления',
                     parent: null,
                     node: true
                  },
                  {
                     key: 3,
                     title: 'Получен документ',
                     parent: 2,
                     node: false
                  },
                  {
                     key: 4,
                     title: 'Контрагент ответил',
                     parent: 2,
                     node: false
                  },
                  {
                     key: 5,
                     title: 'Пришло приглашение',
                     parent: 2,
                     node: false
                  },
                  {
                     key: 6,
                     title: 'Показывать информацию о последнем входе в систему',
                     parent: null,
                     node: false
                  },
                  {
                     key: 7,
                     title: 'Запрашивать пароль при каждом входе',
                     parent: null,
                     node: false
                  }
               ]
            });
         }
      }
   );
   CheckboxGroup._styles = ['Controls-demo/Checkbox/Group/Group'];

   return CheckboxGroup;
});
