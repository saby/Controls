define(
   [
      'Controls/history',
      'Types/source',
      'Core/core-clone'
   ],
   function(history, sourceLib, Clone) {
      'use strict';

      let items = [
         {
            id: '1',
            title: 'Запись 1'
         },
         {
            id: '2',
            title: 'Запись 2'
         },
         {
            id: '3',
            title: 'Запись 3'
         }
      ];

      var menuConfig = {
         filter: { id: 'test' },
         viewMode: 'link',
         icon: 'icon-small',
         showHeader: true,
         source: new sourceLib.Memory({
            data: items,
            keyProperty: 'id'
         })
      };

      var getHistoryMenu = function(config) {
         var hMenu = new history.Menu(config);
         hMenu.saveOptions(config);
         return hMenu;
      };

      describe('Controls/_history/Menu', function() {
         it('_beforeMount', function() {
            var menu = getHistoryMenu(menuConfig);
            menu._beforeMount(menuConfig);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_link_iconSize-small_popup');
         });
         it('_beforeUpdate', function() {
            var menu = getHistoryMenu(menuConfig);
            var newConfig = Clone(menuConfig);
            newConfig.viewMode = 'button';
            menu._beforeUpdate(newConfig);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_button_iconSize-small_popup');
            newConfig.size = 'm';
            newConfig.icon = '';
            menu._beforeUpdate(newConfig);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_button__m_popup');
            newConfig.size = 's';
            menu._beforeUpdate(newConfig);
            assert.equal(menu._offsetClassName, 'controls-MenuButton_button__default_popup');
         });
      });
   }
);
