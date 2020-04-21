/* eslint-disable */
define('Controls/interface/IEditableArea', [
], function() {

   /**
    * Интерфейс для полей ввода с возможностью редактирования по месту.
    *
    * @interface Controls/interface/IEditableArea
    * @public
    * @author Авраменко А.С.
    * @see Controls/interface/IEditableList
    * @remark 
    * Разница между этим интерфейсом и {@link Controls/interface/IEditableList} заключается в том, что второй используется в списках, а первый-вне их (например, на вкладках).
    */

   /*
    * Interface for components that have editing of input fields. The difference between {@link Controls/interface/IEditableList Controls/interface/IEditableList} and this interface is that the former is used in lists and the latter is used outside of them (e.g., in tabs).
    *
    * @interface Controls/interface/IEditableArea
    * @public
    * @author Авраменко А.С.
    * @see Controls/interface/IEditableList
    */    

   /**
    * @typedef {String} BeforeBeginEditResult
    * @variant {String} Cancel Отменяет начало редактирования.
    */

   /*
    * @typedef {String} BeforeBeginEditResult
    * @variant {String} Cancel Cancel start of editing.
    */    

   /**
    * @typedef {String|Promise} BeforeEndEditResult
    * @variant {Promise} Deferred Используется для сохранения с пользовательской логикой.
    * @variant {String} Cancel Отменяет окончание редактирования.
    */

   /*
    * @typedef {String|Promise|undefined} BeforeEndEditResult Результат, возвращаемый обработчиком события beforeBeginEdit.
    * @variant Promise - Используется для сохранения с пользовательской логикой.
    * @variant Cancel - Отменяет окончание редактирования.
    * @variant undefined - Стандартное завершение редактирования. Сохранение происходит на стороне платформы.
    */    

   /**
    * @event Controls/interface/IEditableArea#beforeBeginEdit Происходит перед стартом редактирования.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Object} options Объект, в котором лежит item — редактируемая строка.
    * @param {Boolean} isAdd Флаг, который позволяет различать редактирование (false) и добавление (true).
    * @returns {BeforeBeginEditResult}
    * @example
    * В следующем примере показано, как обрабатывать событие.
    * 
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View on:beforeBeginEdit="beforeBeginEditHandler()" editObject="{{_editObject}}" />
    * </pre>
    * 
    * <pre class="brush: js">
    * // JavaScript
    * define('ModuleName', ['Controls/Constants'], function(constants) {
    *    ...
    *    beforeBeginEditHandler: function(e, options, isAdd) {
    *       if (!isAdd) { // Редактирование разрешено только в определенных ситуациях.
    *          return constants.editing.CANCEL;
    *       }
    *    }
    * });
    * </pre>
    * @see beforeEndEdit
    * @see afterEndEdit
    * @see editObject
    */

   /*
    * @event Controls/interface/IEditableArea#beforeBeginEdit Happens before start of editing.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Record} editObject Editing record.
    * @param {Boolean} isAdd A flag that allows you to distinguish between editing and adding.
    * @returns {BeforeBeginEditResult}
    * @example
    * The following example creates EditableArea and shows how to handle the event.
    * WML:
    * <pre>
    *    <Controls.editableArea:View on:beforeBeginEdit="beforeBeginEditHandler()" editObject="{{_editObject}}" />
    * </pre>
    * JS:
    * <pre>
    *    define('ModuleName', ['Controls/Constants'], function(constants) {
    *       ...
    *       beforeBeginEditHandler: function(e, record) {
    *          if (this._editable === false) { 
    *             //Let's say that we want to allow editing only in certain situations.
    *             return constants.editing.CANCEL;
    *          }
    *       }
    *    });
    * </pre>
    * @see beforeEndEdit
    * @see afterEndEdit
    * @see editObject
    */    

   /**
    * @event Controls/interface/IEditableArea#beforeEndEdit Происходит до окончания редактирования.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Record} editObject Редактируемая запись.
    * @param {Boolean} commit Если значение параметра true, редактирование закончится сохранением.
    * @returns {BeforeEndEditResult}
    * @remark
    * Событие срабатывает только в случае, если проверка прошла успешно. Если вы вернете Core/Deferred из обработчика событий, редактирование закончится только в случае, если отложенное решение будет успешно выполнено.
    * @example
    * В следующем примере показано, как отменить завершение редактирования при выполнении определенного условия.
    * 
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View on:beforeEndEdit="beforeEndEditHandler()" editObject="{{_editObject}}" />
    * </pre>
    * 
    * <pre class="brush: js">
    * // JavaScript
    * define('ModuleName', ['Controls/Constants'], function(constants) {
    *    ...
    *    beforeEndEditHandler: function(e, record, commit) {
    *       //Let's say that we want to allow saving only if the field "text" is not empty (in this example the exact same effect can be achieved through validation mechanism, but sometimes condition is more complicated).
    *       if (commit && record.get("text").length === 0) {
    *          return constants.editing.CANCEL;
    *       }
    *    }
    * });
    * </pre>
    * @see beforeBeginEdit
    * @see afterEndEdit
    * @see editObject
    */

   /*
    * @event Controls/interface/IEditableArea#beforeEndEdit Happens before the end of editing.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Record} editObject Editing record.
    * @param {Boolean} commit If it is true editing ends with saving.
    * @returns {BeforeEndEditResult}
    * @remark
    * This event fires only if the validation was successful. If you return {@link Core/Deferred Core/Deferred} from the event handler then editing will end only if the deferred resolved successfully.
    * @example
    * The following example shows how to cancel the end of the editing if certain condition is met.
    * WML:
    * <pre>
    *    <Controls.editableArea:View on:beforeEndEdit="beforeEndEditHandler()" editObject="{{_editObject}}" />
    * </pre>
    * JS:
    * <pre>
    *    define('ModuleName', ['Controls/Constants'], function(constants) {
    *       ...
    *       beforeEndEditHandler: function(e, record, commit) {
    *          //Let's say that we want to allow saving only if the field "text" is not empty (in this example the exact same effect can be achieved through validation mechanism, but sometimes condition is more complicated).
    *          if (commit && record.get("text").length === 0) {
    *             return constants.editing.CANCEL;
    *          }
    *       }
    *    });
    * </pre>
    * The following example shows how to handle the event asynchronously.
    * WML:
    * <pre>
    *    <Controls.editableArea:View on:beforeEndEdit="beforeEndEditHandler()" editObject="{{_editObject}}" />
    * </pre>
    * JS:
    * <pre>
    *    beforeEndEditHandler: function(e, record, commit) {
    *       if (commit) {
    *          return this._source.update(record);
    *       }
    *    }
    * </pre>
    * @see beforeBeginEdit
    * @see afterEndEdit
    * @see editObject
    */    

   /**
    * @event Controls/interface/IEditableArea#afterEndEdit Происходит после окончания редактирования.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Record} editObject Редактируемая запись.
    * @example
    * В следующем примере показано, как скрыть и показать изображение в зависимости от состояния редактирования.
    * 
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View on:beforeBeginEdit="beforeBeginEditHandler()" on:afterEndEdit="afterEndEditHandler()" editObject="{{_editObject}}" />
    * <ws:if data="{{_imgVisible}}">
    *    <img src="/media/examples/frog.png" alt="Frog"/>
    * </ws:if>
    * </pre>
    * 
    * <pre class="brush: js">
    * // JavaScript
    * beforeBeginEditHandler: function(e, record) {
    *    this._imgVisible = false;
    * },
    * afterEndEditHandler: function(e, record) {
    *    this._imgVisible = true;
    * }
    * </pre>
    * @see beforeBeginEdit
    * @see beforeEndEdit
    * @see editObject
    */

   /*
    * @event Controls/interface/IEditableArea#afterEndEdit Happens after the end of editing.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Record} editObject Editing record.
    * @example
    * The following example shows how to hide and show an image based on the state of editing.
    * WML:
    * <pre>
    *    <Controls.editableArea:View on:beforeBeginEdit="beforeBeginEditHandler()" on:afterEndEdit="afterEndEditHandler()" editObject="{{_editObject}}" />
    *    <ws:if data="{{_imgVisible}}">
    *       <img src="/media/examples/frog.png" alt="Frog"/>
    *    </ws:if>
    * </pre>
    * JS:
    * <pre>
    *    beforeBeginEditHandler: function(e, record) {
    *       this._imgVisible = false;
    *    },
    *    afterEndEditHandler: function(e, record) {
    *       this._imgVisible = true;
    *    }
    * </pre>
    * @see beforeBeginEdit
    * @see beforeEndEdit
    * @see editObject
    */    

   /**
    * @name Controls/interface/IEditableArea#toolbarVisibility
    * @cfg {Boolean} Определяет, должны ли отображаться кнопки 'Сохранить' и 'Отмена'. 
    * @default false
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View
    *     toolbarVisibility="{{true}}"
    *     editObject="{{_editObject}}" />
    * </pre>
    */

   /*
    * @name Controls/interface/IEditableArea#toolbarVisibility
    * @cfg {Boolean} Determines whether buttons 'Save' and 'Cancel' should be displayed.
    * @default false
    * @example
    * <pre>
    *    <Controls.editableArea:View toolbarVisibility="{{true}}" editObject="{{_editObject}}" />
    * </pre>
    */

    /**
     * @typedef {String} Style
     * @variant withBackground Во время редактирования будет показан фон.
     * @variant withoutBackground Во время редактирования фон не будет показан.
     */

   /**
    * @name Controls/interface/IEditableArea#style
    * @cfg {Style} Стиль отображения контрола.
    * @default withoutBackground
    * @remark
    * Также, вы можете задать свой собственный стиль, передав строку.
    * Затем будет установлен класс 'controls-EditableArea_isEditing_style_<your_class>' на контейнере EditableArea и вы сможете использовать его для написания собственного CSS.
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View
    *     style="withBackground"
    *     editObject="{{_editObject}}" />
    * </pre>
    */

   /*
    * @name Controls/interface/IEditableArea#style
    * @cfg {String} Edit at place display style.
    * @default withoutBackground
    * @variant withBackground Background will be shown while editing.
    * @variant withoutBackground Background will not be shown while editing.
    * @remark
    * You are not limited to these 2 styles, you can pass your own string. Then we will set class 'controls-EditableArea_isEditing_style_<your_class>' on the container of EditableArea and you can use it to write your own CSS.
    * @example
    * <pre>
    *    <Controls.editableArea:View style="withBackground" editObject="{{_editObject}}" />
    * </pre>
    */    

   /**
    * @name Controls/interface/IEditableArea#editObject
    * @cfg {Types/entity:Record} Запись с исходными данными.
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View editObject="{{_editObject}}" />
    * </pre>
    * @see editObjectChanged
    */

   /*
    * @name Controls/interface/IEditableArea#editObject
    * @cfg {Types/entity:Record} Record with initial data.
    * @example
    * <pre>
    *    <Controls.editableArea:View editObject="{{_editObject}}" />
    * </pre>
    * @see editObjectChanged
    */    

   /**
    * @name Controls/interface/IEditableArea#editWhenFirstRendered
    * @cfg {Boolean} Определяет, начинать ли редактирование при первом рендеринге.
    * @default false
    * @remark
    * Используйте эту опцию, если необходимо начать редактирование немедленно, не дожидаясь полного построения контрола.
    * Например, если вы хотите открыть модальное окно и что-то изменить в нем, опция позволит вам избежать моргания.
    * @example
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View
    *     editWhenFirstRendered="{{true}}"
    *     editObject="{{_editObject}}" />
    * </pre>
    */

   /*
    * @name Controls/interface/IEditableArea#editWhenFirstRendered
    * @cfg {Boolean} Determines whether editing should start on first render.
    * @default false
    * @remark
    * This option is useful when you want to start editing immediately and do not want to wait for the component to mount. For example, if you want to open modal window and edit something in it, this option will help you avoid blinking.
    * @example
    * <pre>
    *    <Controls.editableArea:View editWhenFirstRendered="{{true}}" editObject="{{_editObject}}" />
    * </pre>
    */    

   /**
    * @name Controls/interface/IEditableArea#content
    * @cfg {Function} Шаблон, который будет использоваться для редактирования.
    * @remark
    * Если вы хотите, чтобы содержимое выглядело так же, как {@link Controls.input:Text Controls/input:Text}, используйте {@link Controls/editableArea:Base Controls/editableArea:Base}.
    * Если по какой-то причине это не подходит, то вы можете использовать свой собственный шаблон.
    * @example
    * Использование {@link Controls/editableArea:Base}:
    * 
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View editObject="{{_editObject}}">
    *     <Controls.editableArea:Base bind:value="content.editObject.text">
    *         <ws:editorTemplate>
    *             <Controls.input:Text />
    *         </ws:editorTemplate>
    *     </Controls.editableArea:Base>
    * </Controls.editableArea:View>
    * </pre>
    * 
    * Использование собственного шаблона:
    * 
    * <pre class="brush: html">
    * <!-- WML -->
    * <ws:template name="editingTemplate">
    *     <div class="myEditingTemplate">
    *         <ws:if data="{{isEditing}}">
    *             <Controls.input:Text value="{{editObject.text}}" />
    *         </ws:if>
    *         <ws:else>
    *             <span>{{editObject.text}}</span>
    *         </ws:else>
    *     </div>
    * </ws:template>
    * <Controls.editableArea:View editObject="{{_editObject}}">
    *     <ws:partial template="editingTemplate" scope="{{content}}" />
    * </Controls.editableArea:View>
    * </pre>
    * @see Controls/editableArea:Base
    */

   /*
    * @name Controls/interface/IEditableArea#content
    * @cfg {Function} Template that will be used for editing.
    * @remark
    * If you want content to look exactly as {@link Controls.input:Text Controls/input:Text} then you should use {@link Controls/editableArea:Base Controls/editableArea:Base}. If for some reason it doesn't suit you then you can use your own template.
    * @example
    * Using {@link Controls/editableArea:Base}:
    * <pre>
    *     <Controls.editableArea:View editObject="{{_editObject}}">
    *        <Controls.editableArea:Base bind:value="content.editObject.text">
    *           <ws:editorTemplate>
    *              <Controls.input:Text />
    *           </ws:editorTemplate>
    *        </Controls.editableArea:Base>
    *     </Controls.editableArea:View>
    * </pre>
    * Using custom template:
    * <pre>
    *    <ws:template name="editingTemplate">
    *       <div class="myEditingTemplate">
    *          <ws:if data="{{isEditing}}">
    *             <Controls.input:Text value="{{editObject.text}}" />
    *          </ws:if>
    *          <ws:else>
    *             <span>{{editObject.text}}</span>
    *          </ws:else>
    *       </div>
    *    </ws:template>
    *    <Controls.editableArea:View editObject="{{_editObject}}">
    *       <ws:partial template="editingTemplate" scope="{{content}}" />
    *    </Controls.editableArea:View>
    * </pre>
    * @see Controls/editableArea:Base
    */    

   /**
    * Начало редактирования.
    * @function Controls/interface/IEditableArea#beginEdit
    * @example
    * В следующем примере создается EditableArea и показано, как начать редактирование.
    * 
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View
    *     name="editableArea"
    *     editObject="{{_editObject}}" />
    * </pre>
    * 
    * <pre class="brush: js">
    * foo: function() {
    *    this._children.editableArea.beginEdit();
    * }
    * </pre>
    * @see commitEdit
    * @see cancelEdit
    */

   /*
    * Starts editing.
    * @function Controls/interface/IEditableArea#beginEdit
    * @example
    * The following example creates EditableArea and shows how to start editing.
    * WML:
    * <pre>
    *    <Controls.editableArea:View name="editableArea" editObject="{{_editObject}}" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.editableArea.beginEdit();
    *    }
    * </pre>
    * @see commitEdit
    * @see cancelEdit
    */    

   /**
    * Завершает редактирование и отменяет изменения.
    * @function Controls/interface/IEditableArea#cancelEdit
    * @example
    * В следующем примере создается EditableArea и показано, как завершить редактирование и отменить изменения.
    * 
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View
    *     name="editableArea"
    *     editObject="{{_editObject}}" />
    * </pre>
    * 
    * <pre class="brush: js">
    * // JavaScript
    * foo: function() {
    *    this._children.editableArea.cancelEdit();
    * }
    * </pre>
    * @see beginEdit
    * @see commitEdit
    */

   /*
    * Ends editing and discards changes.
    * @function Controls/interface/IEditableArea#cancelEdit
    * @example
    * The following example creates EditableArea and shows how to end editing and discard changes.
    * WML:
    * <pre>
    *    <Controls.editableArea:View name="editableArea" editObject="{{_editObject}}" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.editableArea.cancelEdit();
    *    }
    * </pre>
    * @see beginEdit
    * @see commitEdit
    */    

   /**
    * Завершает редактирование и сохраняет изменения.
    * @function Controls/interface/IEditableArea#commitEdit
    * @example
    * В следующем примере создается EditableArea и показано, как завершить редактирование и сохранить изменения.
    * 
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.editableArea:View
    *     name="editableArea"
    *     editObject="{{_editObject}}" />
    * </pre>
    *
    * <pre class="brush: js">
    * // JavaScript
    * foo: function() {
    *    this._children.editableArea.commitEdit();
    * }
    * </pre>
    * @see beginEdit
    * @see cancelEdit
    */

   /*
    * Ends editing and commits changes.
    * @function Controls/interface/IEditableArea#commitEdit
    * @example
    * The following example creates EditableArea and shows how to end editing and commit changes.
    * WML:
    * <pre>
    *    <Controls.editableArea:View name="editableArea" editObject="{{_editObject}}" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.editableArea.commitEdit();
    *    }
    * </pre>
    * @see beginEdit
    * @see cancelEdit
    */    
});
