/**
 * Created by kraynovdo on 25.01.2018.
 */
import Control = require('Core/Control');
import TabButtonsTpl = require('wml!Controls/_tabs/Buttons/Buttons');
import ItemTemplate = require('wml!Controls/_tabs/Buttons/ItemTemplate');
import {Logger} from 'UI/Utils';
import {CrudWrapper} from 'Controls/dataSource';
import {factory} from 'Types/chain';
import * as cInstance from 'Core/core-instance';

var _private = {
      initItems: function(source, instance) {
         instance._crudWrapper = new CrudWrapper({
            source: source
         });
         return instance._crudWrapper.query({}).then((items) => {
            var
               leftOrder = 1,
               rightOrder = 30,
               itemsOrder = [];

            items.each(function(item) {
               if (item.get('align') === 'left') {
                  itemsOrder.push(leftOrder++);
               } else {
                  itemsOrder.push(rightOrder++);
               }
            });

            //save last right order
            rightOrder--;
            instance._lastRightOrder = rightOrder;

            return {
               items,
               itemsOrder,
               lastRightOrder: rightOrder
            };
         });
      },
      prepareState(self, data): void {
         self._items = data.items;
         self._itemsOrder = data.itemsOrder;
         self._lastRightOrder = data.lastRightOrder;
      },
      prepareItemOrder: function(order) {
         return '-ms-flex-order:' + order + '; order:' + order;
      },
      prepareItemClass: function(item, order, options, lastRightOrder, self) {
         var
            classes = ['controls-Tabs__item controls-Tabs__item_theme_' + options.theme],
            modifyToNewStyle = '';
         if (options.style === 'default') {
            modifyToNewStyle = 'primary';
            Logger.warn('Tabs/Buttons: Используются устаревшие стили. Используйте style = primary вместо style = default', self);
         } else if (options.style === 'additional') {
            modifyToNewStyle = 'secondary';
            Logger.warn('Tabs/Buttons: Используются устаревшие стили. Используйте style = secondary вместо style = additional', self);
         } else {
            modifyToNewStyle = options.style;
         }
         classes.push('controls-Tabs__item_align_' + (item.get('align') ? item.get('align') : 'right') +
             ' controls-Tabs__item_align_' + (item.get('align') ? item.get('align') : 'right')+ '_theme_' + options.theme);
         if (order === 1 || order === lastRightOrder) {
            classes.push('controls-Tabs__item_extreme controls-Tabs__item_extreme_theme_' + options.theme);
         }
         if (order === 1) {
            classes.push('controls-Tabs__item_extreme_first controls-Tabs__item_extreme_first_theme_' + options.theme);
         } else if (order === lastRightOrder) {
            classes.push('controls-Tabs__item_extreme_last controls-Tabs__item_extreme_last_theme_' + options.theme);
         } else {
            classes.push('controls-Tabs__item_default controls-Tabs__item_default_theme_' + options.theme);
         }
         if (item.get(options.keyProperty) === options.selectedKey) {
            classes.push('controls-Tabs_style_' + modifyToNewStyle + '__item_state_selected ' +
                'controls-Tabs_style_' + modifyToNewStyle + '__item_state_selected_theme_' + options.theme);
            classes.push('controls-Tabs__item_state_selected controls-Tabs__item_state_selected_theme_' + options.theme);
         } else {
            classes.push('controls-Tabs__item_state_default controls-Tabs__item_state_default_theme_' + options.theme);
         }
         if (item.get('type')) {
            classes.push('controls-Tabs__item_type_' + item.get('type') +
            ' controls-Tabs__item_type_' + item.get('type')+'_theme_' + options.theme);
         }

         // TODO: по поручению опишут как и что должно сжиматься. Пока сжимаем только те вкладки, которые прикладники явно пометили
         // https://online.sbis.ru/opendoc.html?guid=cf3f0514-ac78-46cd-9d6a-beb17de3aed8
         if (item.get('isMainTab')) {
            classes.push('controls-Tabs__item_canShrink');
         } else {
            classes.push('controls-Tabs__item_notShrink');
         }
         return classes.join(' ');
      }
   };

   /**
    * Контрол предоставляет пользователю возможность выбрать между двумя или более вкладками.
    *
    * <a href="/materials/Controls-demo/app/Controls-demo%2FTabs%2FButtons">Демо-пример</a>.
    *
    * @class Controls/_tabs/Buttons
    * @extends Core/Control
    * @mixes Controls/_interface/ISingleSelectable
    * @mixes Controls/_interface/ISource
    * @control
    * @public
    * @category List
    * @author Красильников А.С.
    * @demo Controls-demo/Tabs/Buttons
    * @cssModifier controls-Tabs__item-underline_theme-{{_options.theme}} Позволяет добавить горизонтальный разделитель к прикладному контенту, чтобы расположить его перед вкладками.
    */

   /*
    * Control are designed to give users a choice among two or more tabs.
    *
    * <a href="/materials/Controls-demo/app/Controls-demo%2FTabs%2FButtons">Demo-example</a>.
    *
    * @class Controls/_tabs/Buttons
    * @extends Core/Control
    * @mixes Controls/_interface/ISingleSelectable
    * @mixes Controls/_interface/ISource
    * @control
    * @public
    * @category List
    * @author Красильников А.С.
    * @demo Controls-demo/Tabs/ButtonsDemoPG
    */

   /**
    * @name Controls/_tabs/Buttons#tabSpaceTemplate
    * @cfg {Content} Устанавливает шаблон, отображаемый между вкладками.
    * @default undefined
    * @remark
    * Вкладка может быть выровнена по левому и правому краю, это определяется свойством 'align'.
    * Если у контрола есть левая и правая вкладки, то TabSpaceTemplate будет расположен между ними.
    * @example
    * Пример вкладок с шаблоном между ними:
    * <pre>
    *    <Controls.tabs:Buttons
    *       .....
    *       tabSpaceTemplate=".../spaceTemplate'"
    *       .....
    *    />
    * </pre>
    * spaceTemplate:
    * <pre>
    *    <div class="additionalContent">
    *       <Controls.buttons:Button .../>
    *       <Controls.buttons:Button .../>
    *       <Controls.buttons:Button .../>
    *    </div>
    * </pre>
    */

   /*
    * @name Controls/_tabs/Buttons#tabSpaceTemplate
    * @cfg {Content} Contents of the area near the tabs.
    * @default undefined
    * @remark
    * Tab can be left and right aligned, this is determined by the item property 'align'.
    * If control has left and right tabs then  TabSpaceTemplate will be between them.
    * @example
    * Tabs buttons with space template.
    * <pre>
    *    <Controls.tabs:Buttons
    *       .....
    *       tabSpaceTemplate=".../spaceTemplate'"
    *       .....
    *    />
    * </pre>
    * spaceTemplate:
    * <pre>
    *    <div class="additionalContent">
    *       <Controls.buttons:Button .../>
    *       <Controls.buttons:Button .../>
    *       <Controls.buttons:Button .../>
    *    </div>
    * </pre>
    */

   /**
    * @name Controls/_tabs/Buttons#style
    * @cfg {Enum} Стиль отображения вкладок.
    * @variant primary
    * @variant secondary
    * @default primary
    * @remark
    * Если стандартная тема вам не подходит, вы можете переопределить переменные:
    * <ul>
    *     <li>@border-color_Tabs-item_selected_primary,</li>
    *     <li>@text-color_Tabs-item_selected_primary,</li>
    *     <li>@border-color_Tabs-item_selected_secondary,</li>
    *     <li>@text-color_Tabs-item_selected_secondary</li>
    * </ul>
    * @example
    * Вкладки с применением стиля 'secondary'.
    * <pre>
    *    <Controls.tabs:Buttons
    *       bind:selectedKey='_selectedKey'
    *       keyProperty="id"
    *       source="{{_source}}
    *       style="secondary"
    *       .....
    *    />
    * </pre>
    * Вкладки с применением стиля по умолчанию.
    * <pre>
    *    <Controls.tabs:Buttons
    *       bind:selectedKey='_selectedKey'
    *       keyProperty="id"
    *       source="{{_source}}
    *    />
    * </pre>
    */

   /*
    * @name Controls/_tabs/Buttons#style
    * @cfg {Enum} Tabs buttons display style.
    * @variant primary
    * @variant secondary
    * @default primary
    * @remark
    * If the standard theme does not suit you, you can override the variables:
    * <ul>
    *     <li>@border-color_Tabs-item_selected_primary,</li>
    *     <li>@text-color_Tabs-item_selected_primary,</li>
    *     <li>@border-color_Tabs-item_selected_secondary,</li>
    *     <li>@text-color_Tabs-item_selected_secondary</li>
    * </ul>
    * @example
    * Tabs Buttons has style 'secondary'.
    * <pre>
    *    <Controls.tabs:Buttons
    *       bind:selectedKey='_selectedKey'
    *       keyProperty="id"
    *       source="{{_source}}
    *       style="secondary"
    *       .....
    *    />
    * </pre>
    * Tabs Buttons has default style.
    * <pre>
    *    <Controls.tabs:Buttons
    *       bind:selectedKey='_selectedKey'
    *       keyProperty="id"
    *       source="{{_source}}
    *    />
    * </pre>
    */

   /**
    * @name Controls/_tabs/Buttons#source
    * @cfg {Types/source:Base} Объект, реализующий ISource интерфейс для доступа к данным.
    * @default undefined
    * @remark
    * Элементу можно задать свойство 'align', которое определяет выравнивание вкладок.
    * Если одной из крайних вкладок надо отобразить оба разделителя, слева и справа, то используйте свойство contentTab в значении true
    * @example
    * На вкладках будут отображаться данные из _source. Первый элемент отображается с выравниванием по левому краю, другие элементы отображаются по умолчанию - справа.
    * <pre>
    *    <Controls.tabs:Buttons
    *              bind:selectedKey='_selectedKey'
    *              keyProperty="key"
    *              source="{{_source}}"
    *    />
    * </pre>
    * <pre>
    *    _selectedKey: '1',
    *    _source: new Memory({
    *        keyProperty: 'key',
    *        data: [
    *        {
    *           key: '1',
    *           title: 'Yaroslavl',
    *           align: 'left'
    *        },
    *        {
    *           key: '2',
    *           title: 'Moscow'
    *        },
    *        {
    *           key: '3',
    *           title: 'St-Petersburg'
    *        }
    *        ]
    *    })
    * </pre>
    */

   /*
    * @name Controls/_tabs/Buttons#source
    * @cfg {Types/source:Base} Object that implements ISource interface for data access.
    * @default undefined
    * @remark
    * The item can have an property 'align'. It's determine align of item tab.
    * If item may having both separator, you may using opion contentTab with value true.
    * @example
    * Tabs buttons will be rendered data from _source. First item render with left align, other items render with defult, right align.
    * <pre>
    *    <Controls.tabs:Buttons
    *              bind:selectedKey='_selectedKey'
    *              keyProperty="key"
    *              source="{{_source}}"
    *    />
    * </pre>
    * <pre>
    *    _selectedKey: '1',
    *    _source: new Memory({
    *        keyProperty: 'key',
    *        data: [
    *        {
    *           key: '1',
    *           title: 'Yaroslavl',
    *           align: 'left'
    *        },
    *        {
    *           key: '2',
    *           title: 'Moscow'
    *        },
    *        {
    *           key: '3',
    *           title: 'St-Petersburg'
    *        }
    *        ]
    *    })
    * </pre>
    */

   /**
    * @name Controls/_tabs/Buttons#itemTemplate
    * @cfg {Function} Шаблон для рендеринга.
    * @default Base template 'Controls/tabs:buttonsItemTemplate'
    * @remark
    * Чтобы определить шаблон, следует вызвать базовый шаблон 'Controls/tabs:buttonsItemTemplate'.
    * Шаблон помещается в компонент с помощью тега ws:partial с атрибутом template.
    * По умолчанию в шаблоне 'Controls/tabs:buttonsItemTemplate' будет отображаться только поле 'title'. Можно изменить формат отображения записей, задав следующие параметры:
    * <ul>
    *    <li>displayProperty - определяет поле отображения записи.</li>
    * <ul>
    * @example
    * Вкладки со стандартным шаблоном элемента (шаблоном по умолчанию).
    * <pre>
    *    <Controls.tabs:Buttons
    *                   bind:selectedKey='SelectedKey3'
    *                   keyProperty="id"
    *                   style="additional"
    *                   source="{{_source3}}">
    *       <ws:itemTemplate>
    *          <ws:partial template="Controls/tabs:buttonsItemTemplate"
    *                      item="{{itemTemplate.item}}"
    *                      displayProperty="caption"/>
    *       </ws:itemTemplate>
    *    </Controls.tabs:Buttons>
    * </pre>
    */

   /*
    * @name Controls/_tabs/Buttons#itemTemplate
    * @cfg {Function} Template for item render.
    * @default Base template 'Controls/tabs:buttonsItemTemplate'
    * @remark
    * To determine the template, you should call the base template 'Controls/tabs:buttonsItemTemplate'.
    * The template is placed in the component using the ws:partial tag with the template attribute.
    * By default, the base template 'Controls/tabs:buttonsItemTemplate' will display only the 'title' field. You can change the display of records by setting their values for the following options:
    * <ul>
    *    <li>displayProperty - defines the display field of the record.</li>
    * <ul>
    * @example
    * Tabs buttons with item template.
    * <pre>
    *    <Controls.tabs:Buttons
    *                   bind:selectedKey='SelectedKey3'
    *                   keyProperty="id"
    *                   style="additional"
    *                   source="{{_source3}}">
    *       <ws:itemTemplate>
    *          <ws:partial template="Controls/tabs:buttonsItemTemplate"
    *                      item="{{itemTemplate.item}}"
    *                      displayProperty="caption"/>
    *       </ws:itemTemplate>
    *    </Controls.tabs:Buttons>
    * </pre>
    */

   /**
    * @name Controls/_tabs/Buttons#itemTemplateProperty
    * @cfg {String} Имя поля, которое содержит шаблон отображения элемента.
    * @default Если параметр не задан, вместо него используется itemTemplate.
    * @remark
    * Чтобы определить шаблон, вы должны вызвать базовый шаблон 'Controls/tabs:buttonsItemTemplate'.
    * Шаблон помещается в компонент с помощью тега ws:partial с атрибутом template.
    * По умолчанию в шаблоне 'Controls/tabs:buttonsItemTemplate' будет отображаться только поле 'title'. Можно изменить формат отображения записей, задав следующие параметры:
    * <ul>
    *    <li>displayProperty - определяет поле отображения записи.</li>
    * <ul>
    * @example
    * Вкладки с шаблоном элемента.
    * <pre>
    *    <Controls.tabs:Buttons itemTemplateProperty="myTemplate"
    *                           source="{{_source}}
    *                           ...>
    *    </Controls.tabs:Buttons>
    * </pre>
    * myTemplate
    * <pre>
    *    <div class="controls-Tabs__item_custom">{{item.get(displayProperty || 'title')}}</div>
    * </pre>
    * <pre>
    *    _source: new Memory({
    *              keyProperty: 'id',
    *              data: [
    *                     {id: 1, title: 'I agree'},
    *                     {id: 2, title: 'I not decide'},
    *                     {id: 4, title: 'Will not seem', caption: 'I not agree',  myTemplate: 'wml!.../myTemplate'}
    *              ]
    *    })
    * </pre>
    */

   /*
    * @name Controls/_tabs/Buttons#itemTemplateProperty
    * @cfg {String} Name of the item property that contains template for item render.
    * @default If not set, itemTemplate is used instead.
    * @remark
    * To determine the template, you should call the base template 'Controls/tabs:buttonsItemTemplate'.
    * The template is placed in the component using the ws:partial tag with the template attribute.
    * By default, the base template 'Controls/tabs:buttonsItemTemplate' will display only the 'title' field. You can change the display of records by setting their values for the following options:
    * <ul>
    *    <li>displayProperty - defines the display field of the record.</li>
    * <ul>
    * @example
    * Tabs buttons with item template.
    * <pre>
    *    <Controls.tabs:Buttons itemTemplateProperty="myTemplate"
    *                           source="{{_source}}
    *                           ...>
    *    </Controls.tabs:Buttons>
    * </pre>
    * myTemplate
    * <pre>
    *    <div class="controls-Tabs__item_custom">{{item.get(displayProperty || 'title')}}</div>
    * </pre>
    * <pre>
    *    _source: new Memory({
    *              keyProperty: 'id',
    *              data: [
    *                     {id: 1, title: 'I agree'},
    *                     {id: 2, title: 'I not decide'},
    *                     {id: 4, title: 'Will not seem', caption: 'I not agree',  myTemplate: 'wml!.../myTemplate'}
    *              ]
    *    })
    * </pre>
    */

   var TabsButtons = Control.extend({
      _template: TabButtonsTpl,
      _items: null,
      _itemsOrder: null,
      _lastRightOrder: null,
      _defaultItemTemplate: ItemTemplate,

      /* Функции, передаваемые с сервера на клиент в receivedState, не могут корректно десериализоваться.
      Поэтому, если есть функции в receivedState, заново делаем запрос за данными. */
      checkHasFunction: function(receivedState) {
          let hasFunction = false;
         factory(receivedState && receivedState.items).each((item) => {
            const value = cInstance.instanceOfModule(item, 'Types/entity:Record') ?
                item.getRawData() : item;

            if (!hasFunction) {
                for (const key in value) {
                    // При рекваере шаблона, он возвращает массив, в 0 индексе которого лежит объект с функцией
                    if (typeof value[key] === 'function' || value[key] instanceof Array && typeof value[key][0].func === 'function') {
                        hasFunction = true;
                        Logger.warn(this._moduleName +  `
                         : Из источника данных вернулся набор записей с функцией в поле ${key}.
                         В наборе данных должны быть простые типы.
                         Для задания шаблона - нужно указать имя этого шаблона.`, this);
                    }
                }
            }
         });
         return hasFunction;
      },

      _beforeMount: function(options, context, receivedState) {
         if (receivedState && !this.checkHasFunction(receivedState)) {
            _private.prepareState(this, receivedState);
         } else if (options.source) {
            return _private.initItems(options.source, this).addCallback((result) => {
               _private.prepareState(this, result);
               return result;
            });
         }
      },
      _beforeUpdate: function(newOptions) {
         if (newOptions.source && newOptions.source !== this._options.source) {
            return _private.initItems(newOptions.source, this).addCallback((result) => {
               _private.prepareState(this, result);
               this._forceUpdate();
            });
         }
      },
      _onItemClick: function(event, key) {
         this._notify('selectedKeyChanged', [key]);
      },
      _prepareItemClass: function(item, index) {
         return _private.prepareItemClass(item, this._itemsOrder[index], this._options, this._lastRightOrder, this);
      },
      _prepareItemOrder: function(index) {
         return _private.prepareItemOrder(this._itemsOrder[index]);
      }
   });

   TabsButtons.getDefaultOptions = function() {
      return {
         style: 'primary',
         displayProperty: 'title',
         theme: 'default'
      };
   };
   TabsButtons._theme = ['Controls/tabs'];

   //необходимо для тестов
   TabsButtons._private = _private;
   export = TabsButtons;
