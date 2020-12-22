import toolbars = require('Controls/toolbars');
import {showType} from 'Controls/Utils/Toolbar';
import { Logger } from 'UI/Utils';
import {Record} from 'Types/entity';
import {DOMUtil, getWidth} from 'Controls/sizeUtils';
import {constants} from 'Env/Env';

   var MENU_WIDTH = 0;

   var _private = {
      initializeConstants: function() {
         if (!MENU_WIDTH) {
            MENU_WIDTH = constants.isBrowserPlatform && getWidth('<span class="controls-Toolbar__menuOpen"><i class="icon-medium icon-ExpandDown"/></span>');
         }
      },

      getContentTemplate: function(item, itemTemplate, itemTemplateProperty) {
         let contentTemplate = null;
         if (itemTemplateProperty && item) {
            contentTemplate = item.get(itemTemplateProperty);
         }
         if (!contentTemplate && itemTemplate !== toolbars.ItemTemplate) {
            contentTemplate = itemTemplate;
         }
         return contentTemplate;
      },

      getItemsSizes: function(items, visibleKeys, theme, itemTemplate, itemTemplateProperty) {
         const itemsMark = [];
         let item;
         let buttonTemplateOptions;

         visibleKeys.forEach((key) => {
            item = items.getRecordById(key);
            buttonTemplateOptions = _private.getButtonTemplateOptionsForItem(item, itemTemplateProperty);

            itemsMark.push(toolbars.ItemTemplate({
               item,
               size: 'm',
               itemsSpacing: 'medium',
               theme,
               buttonTemplate: toolbars.getButtonTemplate(),
               buttonTemplateOptions,
               contentTemplate: _private.getContentTemplate(item, itemTemplate, itemTemplateProperty)
            }));
         });

         return DOMUtil.getElementsWidth(itemsMark, 'controls-Toolbar__item', true);
      },

      getButtonTemplateOptionsForItem(item: Record, itemTemplateProperty?: string): object {
         const buttonOptions = toolbars.getButtonTemplateOptionsByItem(item);

         if (itemTemplateProperty &&
             item.get(itemTemplateProperty) &&
             !buttonOptions._caption &&
             !buttonOptions._icon) {
            Logger.error(
                'OperationsPanel: при использовании своего шаблона отображения операции (itemTemplateProperty) ' +
                'необходимо задать caption и/или icon на каждой операции для корректных расчётов размеров');
         }

         return buttonOptions;
      },

      setShowType: function(items, type) {
         items.each(function (item) {
            item.set('showType', type);
         });
      }
   };

   export = {
      fillItemsType: function(keyProperty, parentProperty, items, availableWidth, theme, defaultItemTemplate, itemTemplateProperty) {
         var
            itemsSizes,
            currentWidth,
            visibleItemsKeys = [];

         toolbars.actualItems(items);

         items.each(function(item) {
            if (!item.get(parentProperty)) {
               visibleItemsKeys.push(item.get(keyProperty));
            }
         });

         if (visibleItemsKeys.length <= 1) {
            _private.setShowType(items, showType.TOOLBAR);
         } else {
            itemsSizes = _private.getItemsSizes(items, visibleItemsKeys, theme, defaultItemTemplate, itemTemplateProperty);
            currentWidth = itemsSizes.reduce(function (acc, width) {
               return acc + width;
            }, 0);

            if (currentWidth > availableWidth) {
               _private.initializeConstants();
               _private.setShowType(items, showType.MENU);
               currentWidth += MENU_WIDTH;

               for (var i = visibleItemsKeys.length - 1; i >= 0; i--) {
                  items.getRecordById(visibleItemsKeys[i]).set('showType', currentWidth > availableWidth ? showType.MENU : showType.MENU_TOOLBAR);
                  currentWidth -= itemsSizes[i];
               }
            } else {
               _private.setShowType(items, showType.TOOLBAR);
            }
         }

         return items;
      },
      _private // for unit testing
   };
