/* eslint-disable */
define('Controls/interface/IDropdown', [], function() {

   /**
    * Интерфейс для выпадающих списков.
    *
    * @interface Controls/interface/IDropdown
    * @public
    * @author Золотова Э.Е.
    */

   /*
    * Interface for dropdown lists.
    *
    * @interface Controls/interface/IDropdown
    * @public
    * @author Золотова Э.Е.
    */

   /**
    * @name Controls/interface/IDropdown#itemTemplate
    * @cfg {Function} Устанавливает шаблон отображения элемента в выпадающем списке.
    * @default Controls/dropdown:ItemTemplate
    * @example
    * <pre class="brush: html">
    * <Controls.dropdown:Button source="{{_source)}}">
    *    <ws:itemTemplate>
    *       <ws:partial template="Controls/dropdown:ItemTemplate" multiLine="{{true}}">
    *          <ws:contentTemplate>
    *             <div class="demo-menu__item">
    *                <div class="demo-title">{{contentTemplate.itemData.item.get('title')}}</div>
    *             </div>
    *          </ws:contentTemplate>
    *          <ws:additionalTextTemplate>
    *             <div class="demo-comment">{{contentTemplate.itemData.item.get('comment')}}</div>
    *          </ws:additionalTextTemplate>
    *       </ws:partial>
    *    </ws:itemTemplate>
    * </Controls.dropdown:Button>
    * </pre>
    * <pre class="brush: js">
    *    this._source = new Memory ({
    *       data: [
    *           { id: 1,
    *             title: 'Discussion',
    *             comment: 'Create a discussion to find out the views of other group members on this issue' },
    *           { id: 2,
    *             title: 'Idea/suggestion',
    *             comment: 'Offer your idea, which others can not only discuss, but also evaluate.
    *             The best ideas will not go unnoticed and will be realized' },
    *           { id: 3,
    *             title: 'Problem',
    *             comment: 'Do you have a problem? Tell about it and experts will help to find its solution' }
    *       ],
    *       keyProperty: 'id'
    *    });
    * </pre>
    * @see itemTemplateProperty
    */

   /*
    * @name Controls/interface/IDropdown#itemTemplate
    * @cfg {Function} Template for item render.
    * @default "Controls/dropdown:ItemTemplate"
    * @remark
    * To determine the template, you should call the base template "Controls/dropdown:ItemTemplate".
    * The template should be placed in the component using the <ws:partial> tag with the template attribute.
    * By default, the base template Controls/dropdown:ItemTemplate will display only the 'title' field. You can change the display of records by setting their values for the following options:
    *    -  displayProperty - defines the display field (By default 'title'),
    *    -  marker - sets the display of the row marker,
    *    -  multiLine - sets the display record to several lines.
    * You can redefine content using the contentTemplate option.
    * @example
    * Menu with text header - "Add".
    * TMPL:
    * <pre>
    *    <Controls.dropdown:Button
    *          keyProperty="id"
    *          icon="icon-medium icon-AddButtonNew"
    *          source="{{_source)}}"
    *          tooltip="Add">
    *       <ws:itemTemplate>
    *          <ws:partial
    *             template="Controls/dropdown:ItemTemplate"
    *             itemData="{{itemData}}"
    *             multiLine="{{true}}">
    *          <ws:contentTemplate>
    *             <div class="demo-menu__item">
    *                <div class="demo-title">{{itemTemplate.itemData.item.get('title')}}</div>
    *                <div class="demo-comment">{{itemTemplate.itemData.item.get('comment')}}</div>
    *             </div>
    *          </ws:contentTemplate>
    *          </ws:partial>
    *       </ws:itemTemplate>
    *    </Controls.dropdown:Button>
    * </pre>
    * JS:
    * <pre>
    *    this._source = new Memory ({
    *       data: [
    *           { id: 1,
    *             title: 'Discussion',
    *             comment: 'Create a discussion to find out the views of other group members on this issue' },
    *           { id: 2,
    *             title: 'Idea/suggestion',
    *             comment: 'Offer your idea, which others can not only discuss, but also evaluate.
    *             The best ideas will not go unnoticed and will be realized' },
    *           { id: 3,
    *             title: 'Problem',
    *             comment: 'Do you have a problem? Tell about it and experts will help to find its solution' }
    *       ],
    *       keyProperty: 'id'
    *    });
    * </pre>
    */

   /**
    * @name Controls/interface/IDropdown#itemTemplateProperty
    * @cfg {String} Устанавливает имя поля, которое содержит имя шаблона отображения элемента.
    * @example
    * <pre class="brush: js;">
    * this._mySource = new Memory ({
    *    data: [
    *       { 
    *          id: 1, 
    *          title: 'Sales report' 
    *       },
    *       { 
    *          id: 2, 
    *          title: 'Property Warehouse, Arum, Ltd., 17 March 16', 
    *          myTemplate: 'wml!Controls-demo/Buttons/Menu/itemTemplateSub' 
    *       }
    *    ],
    *    keyProperty: 'id'
    * });
    * </pre>
    * <pre class="brush: html">
    * <Controls.dropdown:Button
    *    keyProperty="id"
    *    itemTemplateProperty="myTemplate"
    *    source="{{_mySource}}"
    *    />
    * </pre>
    * @see itemTemplate
    */

   /*
    * @name Controls/interface/IDropdown#itemTemplateProperty
    * @cfg {Function} Name of the item property that contains template for item render.
    * @remark
    * To determine the template, you should call the base template "Controls/dropdown:ItemTemplate".
    * The template should be placed in the component using the <ws:partial> tag with the template attribute.
    * By default, the base template Controls/dropdown:ItemTemplate will display only the 'title' field. You can change the display of records by setting their values for the following options:
    *    -  displayProperty - defines the display field (By default 'title'),
    *    -  marker - sets the display of the row marker,
    *    -  multiLine - sets the display record to several lines.
    * You can redefine content using the contentTemplate option.
    * @example
    * Second item in the menu will be displayed with comment.
    * TMPL:
    * <pre>
    *    <Controls.dropdown:Button
    *          keyProperty="id"
    *          icon="icon-medium icon-AddButtonNew"
    *          source="{{_source)}}"
    *          itemTemplateProperty=""
    *          tooltip="Add"/>
    * </pre>
    * myItemTemplate.wml
    * <pre>
    *    <ws:partial template="Controls/dropdown:ItemTemplate"
    *                itemData="{{itemData}}">
    *       <ws:contentTemplate>
    *          <div class="demo-item">
    *             <div class="demo-title">{{itemTemplate.itemData.item.get('title')}}</div>
    *             <div class="demo-comment">{{itemTemplate.itemData.item.get('comment')}}</div>
    *          </div>
    *       </ws:contentTemplate>
    *    </ws:partial>
    * </pre>
    * JS:
    * <pre>
    *    this._source = new Memory ({
    *       data: [
    *           { id: 1,
    *             title: 'Discussion' },
    *           { id: 2,
    *             title: 'Idea/suggestion',
    *             comment: 'Offer your idea, which others can not only discuss, but also evaluate.
    *             The best ideas will not go unnoticed and will be realized',
     *            myItemTemplate='myItemTemplate.wml' },
    *           { id: 3,
    *             title: 'Problem' }
    *       ],
    *       keyProperty: 'id'
    *    });
    * </pre>
    */

   /**
    * @name Controls/interface/IDropdown#dropdownClassName
    * @cfg {String} Класс, который навешивается на выпадающий список.
    * @example
    * Меню со скроллом.
    * TMPL:
    * <pre>
    *    <Controls.dropdown:Button
    *        keyProperty="id"
    *        icon="icon-small icon-Check"
    *        dropdownClassName="demo_menu"
    *        source="{{_source}}"/>
    * </pre>
    * CSS:
    * <pre>
    *    .demo_menu {
    *       max-height: 250px;
    *    }
    * </pre>
    * JS:
    * <pre>
    *    this._source = new Memory({
    *       data: [
    *           { id: 1, title: 'Task in development' },
    *           { id: 2, title: 'Error in development' },
    *           { id: 3, title: 'Application' },
    *           { id: 4, title: 'Assignment' },
    *           { id: 5, title: 'Approval' },
    *           { id: 6, title: 'Working out' },
    *           { id: 7, title: 'Assignment for accounting' },
    *           { id: 8, title: 'Assignment for delivery' },
    *           { id: 9, title: 'Assignment for logisticians' }
    *       ],
    *       keyProperty: 'id'
    *    });
    * </pre>
    */

   /*
    * @name Controls/interface/IDropdown#dropdownClassName
    * @cfg {String} The class that hangs on dropdown list.
    * @remark
    * The string, that is formed by the values from items, also changes position.
    * @example
    * Example menu with scrolling.
    * TMPL:
    * <pre>
    *    <Controls.dropdown:Button
    *        keyProperty="id"
    *        icon="icon-small icon-Check"
    *        dropdownClassName="demo_menu"
    *        source="{{_source}}"/>
    * </pre>
    * CSS:
    * <pre>
    *    .demo_menu {
    *       max-height: 250px;
    *    }
    * </pre>
    * JS:
    * <pre>
    *    this._source = new Memory({
    *       data: [
    *           { id: 1, title: 'Task in development' },
    *           { id: 2, title: 'Error in development' },
    *           { id: 3, title: 'Application' },
    *           { id: 4, title: 'Assignment' },
    *           { id: 5, title: 'Approval' },
    *           { id: 6, title: 'Working out' },
    *           { id: 7, title: 'Assignment for accounting' },
    *           { id: 8, title: 'Assignment for delivery' },
    *           { id: 9, title: 'Assignment for logisticians' }
    *       ],
    *       keyProperty: 'id'
    *    });
    * </pre>
    */

   /**
    * @name Controls/interface/IDropdown#popupClassName
    * @cfg {String} Класс, который навешивается на всплывающее окно.
    * @example
    * Для всплывающего окна задается сдвиг вверх на 5px.
    * TMPL:
    * <pre>
    *    <Controls.dropdown:Button
    *        popupClassName="MyMenu_popupClassName"
    *        ...
    *        />
    * </pre>
    * CSS:
    * <pre>
    *    .MyMenu_popupClassName {
    *       margin-top: -5px;
    *    }
    * </pre>
    */

   /**
    * @name Controls/interface/IDropdown#displayProperty
    * @cfg {String} Имя поля, значение которого будет отображаться.
    * @default title
    * @example
    * WML:
    * <pre>
    *    <Controls.dropdown:Button source="{{_source}}" displayProperty="title" keyProperty="id"/>
    * </pre>
    *
    * JS:
    * <pre>
    *     import sourceLib from "Types/source"
    *
    *     _beforeMount() {
    *         this._source = new sourceLib.Memory({
    *             keyProperty: 'id',
    *             data: [
    *                {id: 1, title: 'Name'},
    *                {id: 2, title: 'Date of change'}
    *             ]
    *         });
    *     }
    * </pre>
    *
    */

   /*
    * @name Controls/interface/IDropdown#displayProperty
    * @cfg {String} The name of the field whose value will displayed.
    * @default title
    * @example
    * WML:
    * <pre>
    *    <Controls.dropdown:Button source="{{_source}}" displayProperty="title" keyProperty="id"/>
    * </pre>
    *
    * JS:
    * <pre>
    *     import sourceLib from "Types/source"
    *
    *     _beforeMount() {
    *         this._source = new sourceLib.Memory({
    *             keyProperty: 'id',
    *             data: [
    *                {id: 1, title: 'Name'},
    *                {id: 2, title: 'Date of change'}
    *             ]
    *         });
    *     }
    * </pre>
    *
    */

   /**
    * @name Controls/interface/IDropdown#dataLoadCallback
    * @cfg {Function}  Функция обратного вызова, которая будет вызываться, когда данные загружены источником.
    * @example
    * WML:
    * <pre>
    * <Controls.dropdown:Button
    *       keyProperty="id"
    *       iconStyle="secondary"
    *       style="primary"
    *       viewMode="button"
    *       caption="+ Add"
    *       dataLoadCallback="{{_callbackHandler}}"
    *       source="{{_source)}}" />
    * </pre>
    * JS:
    * <pre>
    * this._source = new Memory({
    *    keyProperty: 'id',
    *    data: [
    *       {id: 1, title: 'Yaroslavl'},
    *       {id: 2, title: 'Moscow'},
    *       {id: 3, title: 'St-Petersburg'}
    *    ]
    * });
    * this._callbackHandler = function(items) {
    *   // do something
    * };
    * </pre>
    */

   /*
    * @name Controls/interface/IDropdown#dataLoadCallback
    * @cfg {Function} Callback function that will be called when list data loaded by source
    * @example
    * WML:
    * <pre>
    * <Controls.dropdown:Button
    *       keyProperty="id"
    *       iconStyle="secondary"
    *       style="primary"
    *       viewMode="button"
    *       caption="+ Add"
    *       dataLoadCallback="{{_callbackHandler}}"
    *       source="{{_source)}}" />
    * </pre>
    * JS:
    * <pre>
    * this._source = new Memory({
    *    keyProperty: 'id',
    *    data: [
    *       {id: 1, title: 'Yaroslavl'},
    *       {id: 2, title: 'Moscow'},
    *       {id: 3, title: 'St-Petersburg'}
    *    ]
    * });
    * this._callbackHandler = function(items) {
    *   // do something
    * };
    * </pre>
    */

   /**
    * @name Controls/interface/IDropdown#historyId
    * @cfg {String} Уникальный идентификатор для сохранения в историю.
    */

   /*
    * @name Controls/interface/IDropdown#historyId
    * @cfg {String} Unique id for save history.
    */


   /**
    * @event Controls/interface/IDropdown#dropDownOpen Происходит при открытии выпадающего списка.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @example
    * WML:
    * <pre>
    *    <Controls.dropdown:Button on:dropDownOpen="_dropDownOpen()" on:dropDownClose="_dropDownClose()"/>
    *    <div>dropDownOpened: {{_dropDownOpened}}</div>
    * </pre>
    *
    * JS:
    * <pre>
    *    _dropDownOpen() {
    *       this._dropDownOpened = true;
    *    },
    *    _dropDownClose() {
    *       this._dropDownOpened = false;
    *    }
    * </pre>
    */

   /*
    * @event Controls/interface/IDropdown#dropDownOpen Occurs when dropDown opened.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @example
    * WML:
    * <pre>
    *    <Controls.dropdown:Button on:dropDownOpen="_dropDownOpen()" on:dropDownClose="_dropDownClose()"/>
    *    <div>dropDownOpened: {{_dropDownOpened}}</div>
    * </pre>
    *
    * JS:
    * <pre>
    *    _dropDownOpen() {
    *       this._dropDownOpened = true;
    *    },
    *    _dropDownClose() {
    *       this._dropDownOpened = false;
    *    }
    * </pre>
    */

   /**
    * @event Controls/interface/IDropdown#dropDownClose Происходит при закрытии выпадающего списка.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @example
    * WML:
    * <pre>
    *    <Controls.dropdown:Button on:dropDownOpen="_dropDownOpen()" on:dropDownClose="_dropDownClose()"/>
    *    <div>dropDownOpened: {{_dropDownOpened}}</div>
    * </pre>
    *
    * JS:
    * <pre>
    *    _dropDownOpen() {
    *       this._dropDownOpened = true;
    *    },
    *    _dropDownClose() {
    *       this._dropDownOpened = false;
    *    }
    * </pre>
    */

   /*
    * @event Controls/interface/IDropdown#dropDownClose Occurs when dropDown closed.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @example
    * WML:
    * <pre>
    *    <Controls.dropdown:Button on:dropDownOpen="_dropDownOpen()" on:dropDownClose="_dropDownClose()"/>
    *    <div>dropDownOpened: {{_dropDownOpened}}</div>
    * </pre>
    *
    * JS:
    * <pre>
    *    _dropDownOpen() {
    *       this._dropDownOpened = true;
    *    },
    *    _dropDownClose() {
    *       this._dropDownOpened = false;
    *    }
    * </pre>
    */

   /**
    * Открывает выпадающий список.
    * @function Controls/interface/IDropdown#openMenu
    * @param {Object} popupOptions Конфигурация прилипающего блока {@link https://wi.sbis.ru/docs/js/Controls/interface/IStickyOptions#popupOptions popupOptions}
    * @example
    * WML:
    * <pre>
    *    <AnyControl on:showMenu="_showMenu()">
    *       ...
    *    </AnyControl>
    *    <Controls.dropDown:Button name="dropDownButton">
    *       ...
    *    </Controls.dropDown:Button>
    * </pre>
    *
    * ts:
    * <pre>
    *    _showMenu(): void {
    *       this._children.dropDownButton.openMenu();
    *    }
    * </pre>
    */

   /**
    * Закрывает выпадающий список.
    * @function Controls/interface/IDropdown#closeMenu
    * @example
    * WML:
    * <pre>
    *    <AnyControl on:closeMenu="_closeMenu()">
    *       ...
    *    </AnyControl>
    *    <Controls.dropDown:Button name="dropDownButton">
    *       ...
    *    </Controls.dropDown:Button>
    * </pre>
    *
    * ts:
    * <pre>
    *    _closeMenu(): void {
    *       this._children.dropDownButton.closeMenu();
    *    }
    * </pre>
    */

});
