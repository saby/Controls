define('js!SBIS3.CONTROLS.FieldLink',
    [
       'js!SBIS3.CONTROLS.SuggestTextBox',
       'js!SBIS3.CONTROLS.DSMixin',
       'js!SBIS3.CONTROLS.MultiSelectable',
       'js!SBIS3.CONTROLS.ActiveMultiSelectable',
       'js!SBIS3.CONTROLS.Selectable',
       'js!SBIS3.CONTROLS.ActiveSelectable',
       'js!SBIS3.CONTROLS.SyncSelectionMixin',
       'js!SBIS3.CONTROLS.FieldLinkItemsCollection',
       'html!SBIS3.CONTROLS.FieldLink/afterFieldWrapper',
       'html!SBIS3.CONTROLS.FieldLink/beforeFieldWrapper',
       'js!SBIS3.CONTROLS.Data.Model',
       'js!SBIS3.CONTROLS.Utils.DialogOpener',
       'js!SBIS3.CONTROLS.ITextValue',
       'js!SBIS3.CONTROLS.Utils.TemplateUtil',
       'js!SBIS3.CONTROLS.MenuIcon'

    ],
    function (
        SuggestTextBox,
        DSMixin,

        /* Интерфейс для работы с набором выбранных записей */
        MultiSelectable,
        ActiveMultiSelectable,
        /****************************************************/

        /* Интерфейс для работы с выбранной записью */
        Selectable,
        ActiveSelectable,
        /********************************************/

        SyncSelectionMixin,
        FieldLinkItemsCollection,
        afterFieldWrapper,
        beforeFieldWrapper,
        Model,
        DialogOpener,
        ITextValue,
        TemplateUtil
    ) {

       'use strict';

       var INPUT_WRAPPER_PADDING = 11;
       var SHOW_ALL_LINK_WIDTH = 11;
       var INPUT_MIN_WIDTH = 100;

       /**
        * Поле связи. Можно выбирать значение из списка, можно из автодополнения
        * @class SBIS3.CONTROLS.FieldLink
        * @extends SBIS3.CONTROLS.SuggestTextBox
        * @category Inputs
        * @mixes SBIS3.CONTROLS.Selectable
        * @mixes SBIS3.CONTROLS.MultiSelectable
        * @mixes SBIS3.CONTROLS.ActiveSelectable
        * @mixes SBIS3.CONTROLS.ActiveMultiSelectable
        * @mixes SBIS3.CONTROLS.ChooserMixin
        * @mixes SBIS3.CONTROLS.FormWidgetMixin
        * @mixes SBIS3.CONTROLS.SyncSelectionMixin
        * @demo SBIS3.CONTROLS.Demo.FieldLinkWithEditInPlace Поле связи с редактированием по месту. Данные для источника передаются в JSON-RPC формате
        * @demo SBIS3.CONTROLS.Demo.FieldLinkDemo Разные варианты конфигураций для поля связи
        * @cssModifier controls-FieldLink__itemsEdited При наведении на выделенные элементы, они подчёркиваются.
        * @cssModifier controls-FieldLink__itemsBold Текст выбранных элементов в поле связи отображается жирным.
        * @control
        * @public
        * @author Крайнов Дмитрий Олегович
        */

       var FieldLink = SuggestTextBox.extend([MultiSelectable, ActiveMultiSelectable, Selectable, ActiveSelectable, SyncSelectionMixin, DSMixin, ITextValue],/** @lends SBIS3.CONTROLS.FieldLink.prototype */{
          /**
           * @event onItemActivate При активации записи (клик с целью например редактирования)
           * @param {$ws.proto.EventObject} eventObject Дескриптор события.
           * @param {Object} meta Объект
           * @param {String} meta.id ключ элемента
           * @param {SBIS3.CONTROLS.Record} meta.item запись
           */
          $protected: {
             _inputWrapper: undefined,     /* Обертка инпута */
             _linksWrapper: undefined,     /* Контейнер для контрола выбранных элементов */
             _dropAllButton: undefined,    /* Кнопка очитски всех выбранных записей */
             _showAllLink: undefined,      /* Кнопка показа всех записей в пикере */
             _linkCollection: undefined,   /* Контрол отображающий выбранные элементы */
             _options: {
                /* Служебные шаблоны поля связи (иконка открытия справочника, контейнер для выбранных записей */
                afterFieldWrapper: afterFieldWrapper,
                beforeFieldWrapper: beforeFieldWrapper,
                /**********************************************************************************************/

                list: {
                   component: 'js!SBIS3.CONTROLS.DataGridView',
                   options: {
                      showHead: false,
                      columns: []
                   }
                },
                /**
                 * @typedef {Array} dictionaries
                 * @property {String} caption Текст в меню.
                 * @property {String} template Шаблон, который отобразится в диалоге выбора.
                 * @property {Object} componentOptions Опции, которые прокинутся в компонент на диалоге выбора.
                 */
                /**
                 * @cfg {dictionaries[]} Набор диалогов выбора для поля связи
                 * @remark
                 * Если передать всего один элемент, то дилог выбора откроется при клике на иконку меню.
                 */
                dictionaries: [],
                /**
                 * @cfg {Boolean} Не скрывать поле ввода после выбора
                 * @remark
                 * Актуально для поля связи с единичным выбором (Например чтобы записать что-то в поле контекста)
                 */
                alwaysShowTextBox: false,
                /**
                 * @cfg {String} Шаблон отображения для каждого выбранного элемента
                 * @example
                 * <pre>
                 *     <div class="fieldLinkText">
                 *        {{=it.item.get("title")}}
                 *     </div>
                 * </pre>
                 */
                itemTemplate: ''
             }
          },

          $constructor: function() {
             this.getContainer().addClass('controls-FieldLink');
             this._publish('onItemActivate');

             /* Проиницализируем переменные и event'ы */
             this._setVariables();
             this._initEvents();

             /* Создём контрол, который рисует выбранные элементы  */
             this._linkCollection = this._getLinkCollection();

             /* Если не передали конфигурацию диалога всех записей для автодополнения,
              то по-умолчанию возьмём конфигурацию первого словаря */
             if(!Object.keys(this._options.showAllConfig).length) {
                this._options.showAllConfig = this._options.dictionaries[0];
             }

            /* При изменении выбранных элементов в поле связи - сотрём текст.
               Достаточно отслеживать изменение массива ключей,
               т.к. это событие гарантирует изменение выбранных элементов
               Это всё актуально для поля связи без включенной опции alwaysShowTextBox,
               если она включена, то логика стирания текста обрабатывается по-другому. */
            this.subscribe('onSelectedItemsChange', function() {
               if(this.getText()) {
                  this.setText('');
               }
            }.bind(this));

            if(this._options.oldViews) {
               $ws.single.ioc.resolve('ILogger').log('FieldLink', 'В 3.8.0 будет удалена опция oldViews, а так же поддержка старых представлений данных на диалогах выбора.');
            }
         },

          init: function() {
             FieldLink.superclass.init.apply(this, arguments);
             this.getChildControlByName('fieldLinkMenu').setItems(this._options.dictionaries);
          },

          /**
           * Обработчик нажатия на меню(элементы меню), открывает диалог выбора с соответствующим шаблоном
           * @private
           */
          _menuItemActivatedHandler: function(e, item) {
             var rec = this.getItems().getRecordById(item);
             this.getParent().showSelector(rec.get('template'), rec.get('componentOptions'));
          },

          /**
           * Устанавливает набор словарей
           * @param {Array} dictionaries
           * @see dictionaries
           */
          setDictionaries: function(dictionaries) {
             this._options.dictionaries = dictionaries;
             this.getChildControlByName('fieldLinkMenu').setItems(dictionaries);
             this._notifyOnPropertyChanged('dictionaries');
          },

          /**
           * Показывает диалог выбора
           * @param {String} template Имя шаблона в виде 'js!SBIS3.CONTROLS.MyTemplate'
           * @param {Object} componentOptions Опции которые прокинутся в компонент выбора
           * @see dictionaries
           * @see setDictionaries
           */
          showSelector: function(template, componentOptions) {
             var oldRecArray = [],
                 oldRec;

             if(this._options.oldViews) {
                this.getSelectedItems().each(function(rec) {
                   oldRec = DialogOpener.convertRecord(rec);
                   if(oldRec) {
                      oldRecArray.push(oldRec);
                   }
                });
             }

             this._showChooser(
                 template,
                 componentOptions,
                 /* Дополнительный конфиг, который нужно прокинуть в selector */
                 {
                    currentValue: this.getSelectedKeys(),
                    selectorFieldLink: true,
                    multiSelect: this._options.multiselect,
                    selectedRecords: oldRecArray
                 });
          },

          _getLinkCollection: function() {
             if(!this._linkCollection) {
                return this._drawFieldLinkItemsCollection();
             }
             return this._linkCollection;
          },

          /**
           * Обрабатывает результат выбора из справочника
           * @param {Array} result
           * @private
           */
          _chooseCallback: function(result) {
             var isModel;

             if(result && result.length) {
                isModel = $ws.helpers.instanceOfModule(result[0], 'SBIS3.CONTROLS.Data.Model');

                if(isModel) {
                   this.addSelectedItems(result)
                } else {
                   this.addItemsSelection(result)
                }
             }
          },

          /**
           * Возвращает выбранные элементы в виде текста
           * @deprecated Метод getCaption устарел, используйте getTextValue
           * @returns {string}
           */
          getCaption: function() {
             $ws.single.ioc.resolve('ILogger').log('FieldLink::getCaption', 'Метод getCaption устарел, используйте getTextValue');
             return this.getTextValue();
          },

          getTextValue: function() {
             var displayFields = [],
                 self = this;

             this.getSelectedItems().each(function(rec) {
                displayFields.push($ws.helpers.escapeHtml(rec.get(self._options.displayField)));
             });

             return displayFields.join(', ');
          },

          /**
           * Устанавливает переменные, для дальнейшей работы с ними
           * @private
           */
          _setVariables: function() {
             this._linksWrapper = this._container.find('.controls-FieldLink__linksWrapper');
             this._inputWrapper = this._container.find('.controls-TextBox__fieldWrapper');

             if(this._options.multiselect) {
                this._dropAllLink = this._container.find('.controls-FieldLink__dropAllLinks');
                this._showAllLink = this._container.find('.controls-FieldLink__showAllLinks');
             }
          },

          _onResizeHandler: function() {
             var linkCollection = this._getLinkCollection();

             FieldLink.superclass._onResizeHandler.apply(this, arguments);

             if(!linkCollection.isPickerVisible()) {
                /* Почему надо звать redraw: поле связи может быть скрыто, когда в него проставили выбранные записи,
                   и просто пересчётом input'a тут не обойтись. Выполняться должно быстро, т.к. перерисовывается обычно всего 2-3 записи */
                linkCollection.redraw();
             }
          },

          _initEvents: function() {
             var self = this;

             if(this._options.multiselect) {
                /* Когда показываем пикер со всеми выбранными записями, скроем автодополнение и покажем выбранные записи*/
                this._showAllLink.click(function() {
                   /* Если открыто автодополнение, скроем его */
                   if(self.isPickerVisible()) {
                      self.hidePicker();
                   }
                   self._getLinkCollection().togglePicker();
                });
                this._dropAllLink.click(this.removeItemsSelectionAll.bind(this));
             }
          },

          /**
           * Обрабатывает скрытие/открытие пикера
           * @param open
           * @private
           */
          _pickerStateChangeHandler: function(open) {
             this._dropAllLink.toggleClass('ws-hidden', !open);
             this._inputWrapper.toggleClass('ws-invisible', open);
          },

          /**
           * Обработчик на выбор записи в автодополнении
           * @private
           */
          _onListItemSelect: function(id, item) {
             this.hidePicker();
             /* Чтобы не было лишнего запроса на БЛ, добавим рекорд в набор выбранных */
             this.addSelectedItems(item instanceof Array ? item : [item]);
             this.setText('');
          },


          setDataSource: function(ds, noLoad) {
             this.once('onListReady', function() {
                this.getList().setDataSource(ds, noLoad);
             });
             FieldLink.superclass.setDataSource.apply(this, arguments);
          },

          _loadAndDrawItems: function(amount) {
             var linkCollection = this._getLinkCollection(),
                 linkCollectionContainer = linkCollection.getContainer();

             if(amount) {
                /* Нужно скрыть контрол отображающий элементы, перед загрузкой, потому что часто бл может отвечать >500мс и
                 отображаемое значение в поле связи долго не меняется, особенно заметно в редактировании по месту. */
                linkCollectionContainer.addClass('ws-hidden');
                this.getSelectedItems(true, amount).addCallback(function(list){
                   linkCollectionContainer.removeClass('ws-hidden');
                   linkCollection.setItems(list);
                   return list;
                });
             } else {
                linkCollection.setItems(this.getSelectedItems(false, amount));
             }
          },

          _drawSelectedItems: function(keysArr) {
             var keysArrLen = keysArr.length;

             /* Если удалили в пикере все записи, и он был открыт, то скроем его */
             if (!keysArrLen) {
                this._toggleShowAllLink(false);
             }

             if(!this._options.alwaysShowTextBox) {

                if(!this._options.multiselect) {
                   this._inputWrapper.toggleClass('ws-hidden', Boolean(keysArrLen));
                }
             }

             this._loadAndDrawItems(keysArrLen, this._options.pageSize);
          },

          setListFilter: function() {
             /* Если единичный выбор в поле связи, но textBox всё равно показывается(включена опция), запрещаем работу suggest'a */
             if(!this._options.multiselect && this.getSelectedItems().getCount() && this._options.alwaysShowTextBox) {
                return;
             }
             FieldLink.superclass.setListFilter.apply(this, arguments);
          },

          _drawFieldLinkItemsCollection: function() {
             var self = this,
                 tpl = this.getProperty('itemTemplate');
             return new FieldLinkItemsCollection({
                element: this._linksWrapper.find('.controls-FieldLink__linksContainer'),
                displayField: this._options.displayField,
                keyField: this._options.keyField,
                itemTemplate: tpl ? TemplateUtil.prepareTemplate(tpl) : undefined,
                userItemAttributes: this._options.userItemAttributes,
                parent: this,
                itemCheckFunc: this._checkItemBeforeDraw.bind(this),
                handlers: {
                   /* После окончания отрисовки, обновим размеры поля ввода */
                   onDrawItems: this._updateInputWidth.bind(this),

                   /* При клике на крест, удалим ключ из выбранных */
                   onCrossClick: function(e, key){
                      self.removeItemsSelection([key]);
                      if(!self._options.multiselect && self._options.alwaysShowTextBox) {
                         self.setText('');
                      }
                   },

                   onItemActivate: function(e, key) {
                      self.getSelectedItems(false).each(function(item) {
                         if(item.getId() == key) {
                            self._notify('onItemActivate', {item: item, id: key});
                         }
                      })
                   },

                   /* При закрытии пикера надо скрыть кнопку удаления всех выбранных, при открытии - показать */
                   onClosePicker: self._pickerStateChangeHandler.bind(self, false),
                   onShowPicker: self._pickerStateChangeHandler.bind(self, true)
                }
             });
          },

          showPicker: function() {
             /* Если открыт пикер, который показывает все выбранные записи, то не показываем автодополнение */
             if(!this._linkCollection.isPickerVisible()) {
                FieldLink.superclass.showPicker.apply(this, arguments);
             }
          },
          /**
           * Проверяет, нужно ли отрисовывать элемент или надо показать троеточие
           */
          _checkItemBeforeDraw: function(item) {
             var needDrawItem = false,
                 linkCollection = this._getLinkCollection(),
                 inputMinWidth = INPUT_WRAPPER_PADDING,
                 inputWidth, newItemWidth;

             /* Для ситуаций, когда поле ввода не скрывается после выбора - минимальная ширина 100px (по стандарту) */
             if(this._options.multiselect || this._options.alwaysShowTextBox) {
                inputMinWidth += INPUT_MIN_WIDTH;
             }

             /* Если элементы рисуются в пикере то ничего считать не надо */
             if(linkCollection.isPickerVisible()) {
                return true;
             }

             /* Тут считается ширина добавляемого элемента, и если он не влезает,
              то отрисовываться он не будет и покажется троеточие, однако хотя бы один элемент в поле связи должен поместиться */
             if(this._checkWidth) {
                inputWidth = this._getInputWidth();
                newItemWidth = $ws.helpers.getTextWidth(item[0].outerHTML);
                /* Считаем, нужно ли отрисовывать элемент по следующему правилу:
                   Ширина добавляемого элемента + минимальная ширина поля ввода (для мултивыбора) не должны быть больше ширины контейнера контрола */
                needDrawItem = (newItemWidth + inputMinWidth) < (inputWidth + INPUT_WRAPPER_PADDING);

                if(!needDrawItem) {
                   /* Если в поле связи не отрисовано ни одного элемента, то уменьшаем ширину добавляемого,
                      т.к. хотя бы один элемент должен быть отрисован (стандарт) */
                   if(!linkCollection.getContainer().find('.controls-FieldLink__linkItem').length) {
                      item[0].style.width = inputWidth - inputMinWidth + 'px';
                      needDrawItem = true;
                   }
                   this._checkWidth = false;
                }
             }
             this._toggleShowAllLink(!needDrawItem);
             return needDrawItem
          },

          setSelectedItem: function(item) {
             /* Проверяем запись на наличие ключевых полей */
             if(item && item.get(this._options.displayField) && item.get(this._options.keyField)) {

                /* Если запись собралась из контекста, в ней может не быть поля с первичным ключем */
                if(!item.getIdProperty()) {
                   item.setIdProperty(this._options.keyField);
                }

                FieldLink.superclass.setSelectedItem.apply(this, arguments);
             }
          },

          /**
           * Конфигурация пикера
           */
          _setPickerConfig: function () {
             return {
                corner: 'bl',
                target: this._container,
                opener: this,
                closeByExternalClick: true,
                targetPart: true,
                className: 'controls-FieldLink__picker',
                verticalAlign: {
                   side: 'top'
                },
                horizontalAlign: {
                   side: 'left'
                }
             };
          },
          /**
           * Обрабатывает нажатие клавиш, специфичных для поля связи
           */
          _keyUpBind: function(e) {
             FieldLink.superclass._keyUpBind.apply(this, arguments);
             switch (e.which) {
                /* Нажатие на клавишу delete удаляет все выбранные элементы в поле связи */
                case $ws._const.key.del:
                   this.removeItemsSelectionAll();
                   break;

                /* ESC закрывает все пикеры у поля связи(если они открыты) */
                case $ws._const.key.esc:
                   if(this.isPickerVisible() || this._linkCollection.isPickerVisible()) {
                      this.hidePicker();
                      this._linkCollection.hidePicker();
                      e.stopPropagation();
                   }
                   break;
             }
          },
          _keyDownBind: function(e) {
             FieldLink.superclass._keyDownBind.apply(this, arguments);
             switch (e.which) {
                /* Нажатие на backspace должно удалять последние значение, если нет набранного текста */
                case $ws._const.key.backspace:
                   var selectedKeys = this.getSelectedKeys();
                   if(!this.getText() && selectedKeys.length) {
                      this.removeItemsSelection([selectedKeys[selectedKeys.length - 1]]);
                   }
                   break;
             }
          },

          /**
           * Скрывает/показывает кнопку показа всех записей
           */
          _toggleShowAllLink: function(show) {
             this._options.multiselect && this._showAllLink && this._showAllLink.toggleClass('ws-hidden', !show);
          },

          /**
           * Расщитывает ширину поля ввода, учитывая всевозможные wrapper'ы и отступы
           * @returns {number}
           * @private
           */
          _getInputWidth: function() {
             return this._container[0].clientWidth  -
                 (this._container.find('.controls-TextBox__afterFieldWrapper')[0].offsetWidth +
                  this._container.find('.controls-TextBox__beforeFieldWrapper')[0].offsetWidth +
                  INPUT_WRAPPER_PADDING);
          },
          /**
           * Обновляет ширину поля ввода
           */
          _updateInputWidth: function() {
             this._checkWidth = true;
             this._inputField[0].style.width = this._getInputWidth() + 'px';
          },

          /* Заглушка, само поле связи не занимается отрисовкой */
          _redraw: $ws.helpers.nop,


          destroy: function() {
             this._linksWrapper = undefined;
             this._inputWrapper = undefined;

             if(this._linkCollection) {
                this._linkCollection.destroy();
                this._linkCollection = undefined;
             }

             if(this._options.multiselect) {
                this._showAllLink.unbind('click');
                this._showAllLink = undefined;

                this._dropAllLink.unbind('click');
                this._dropAllLink = undefined;
             }
             FieldLink.superclass.destroy.apply(this, arguments);
          }
       });

       return FieldLink;

    });