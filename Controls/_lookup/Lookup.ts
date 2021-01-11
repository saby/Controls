import {default as BaseLookupInput, ILookupInputOptions} from 'Controls/_lookup/BaseLookupInput';
import {SelectedItems} from './BaseControllerClass';
import showSelector from 'Controls/_lookup/showSelector';
import {IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import {getWidth} from 'Controls/sizeUtils';
import {Model} from 'Types/entity';
import * as selectedCollectionUtils from 'Controls/_lookup/SelectedCollection/Utils';
import {default as Collection} from './SelectedCollection';
import * as itemsTemplate from 'wml!Controls/_lookup/SelectedCollection/SelectedCollection';
import * as ContentTemplate from 'wml!Controls/_lookup/SelectedCollection/_ContentTemplate';
import * as CrossTemplate from 'wml!Controls/_lookup/SelectedCollection/_CrossTemplate';
import * as CounterTemplate from 'wml!Controls/_lookup/SelectedCollection/CounterTemplate';
import {default as BaseLookup} from './BaseLookup';
import * as itemTemplate from 'wml!Controls/_lookup/SelectedCollection/ItemTemplate';

const MAX_VISIBLE_ITEMS = 20;
let SHOW_SELECTOR_WIDTH = 0;
let CLEAR_RECORDS_WIDTH = 0;
let LEFT_OFFSET_COUNTER = 0;

export interface ILookupOptions extends ILookupInputOptions {
   multiLine?: boolean;
}
/**
 * Поле ввода с автодополнением и возможностью выбора значений из справочника.
 * Выбранные значения отображаются в виде текста с кнопкой удаления внутри поля ввода.
 *
 * @remark
 * Поддерживает автовысоту в зависимости от выбранных значений {@link multiLine}, а также одиночный и множественный выбор (см. {@link multiSelect}).
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/directory/lookup/ руководство разработчика}
 * * {@link /materials/Controls-demo/app/Controls-demo%2FLookup%2FIndexпеременные тем оформления}
 *
 *
 * @class Controls/_lookup/Lookup
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ILookup
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/_interface/ISelectorDialog
 * @mixes Controls/interface/ISuggest
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/_input/interface/IValueOptions
 * @mixes Controls/_interface/IValidationStatus
 * @mixes Controls/input:IBorderVisibility
 * @mixes Controls/input:IPadding
 * 
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/Input/Lookup/LookupPropertyGrid
 */
/*
 * “Lookup:Input” is an input field with auto-completion and the ability to select a value from the directory.
 * Сan be displayed in single-line and multi-line mode.
 * Supports single and multiple selection.
 * Here you can see <a href="/materials/Controls-demo/app/Controls-demo%2FLookup%2FIndex">demo-example</a>.
 * If you use the link to open the directory inside the tooltip of the input field, you will need {@link Controls/lookup:Link}.
 * If you want to make a dynamic placeholder of the input field, which will vary depending on the selected collection, use {@link Controls/lookup:PlaceholderChooser}.
 * If you need a choice of several directories, one value from each, then {@link Controls / lookup: MultipleInput} is suitable for you.
 *
 * @class Controls/_lookup/Lookup
 * @extends UI/Base:Control
 * @mixes Controls/_interface/ILookup
 * @mixes Controls/interface/ISelectedCollection
 * @mixes Controls/interface/ISelectorDialog
 * @mixes Controls/interface/ISuggest
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IMultiSelectable
 * @mixes Controls/_interface/ITextValue
 * @mixes Controls/_interface/ISorting
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_input/interface/IText
 * @mixes Controls/_interface/IHeight
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/interface/IInputTag
 * @mixes Controls/_input/interface/IValueOptions
 * 
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/Input/Lookup/LookupPropertyGrid
 */
export default class Lookup extends BaseLookupInput {
   protected _listOfDependentOptions: string[] = ['multiSelect', 'multiLine', 'displayProperty', 'maxVisibleItems', 'readOnly', 'comment'];
   protected _rootContainerClasses: string = 'controls-Lookup';
   protected _multiLineState: boolean = false;
   protected _inputWidth: number;
   protected _availableWidthCollection: number = null;
   protected _counterWidth: number;
   protected _fieldWrapperMinHeight: number = null;

   showSelector(popupOptions?: IStackPopupOptions): void {
      this.closeSuggest();
      // Если lookup лежит на stack панели, и окно выборе окажется шире этой stack панели,
      // то по особой логике в мехнизме окон, stack панель будет скрыта через display: none,
      // из-за этого возникает проблема при выборе, поле связи не может посчитать размеры,
      // т.к. лежит в скрытом блоке, чтобы решить эту пробелму,
      // кэшируем размеры перед открытием окна выбора
      this._getFieldWrapperWidth();
      return showSelector(this, popupOptions, this._options.multiSelect);
   }

   _calculateSizes(options: ILookupOptions): void {
      const itemsCount = this._items.getCount();
      let counterWidth;
      let fieldWrapperWidth;
      let allItemsInOneRow = false;
      let maxVisibleItems = options.maxVisibleItems;
      let rightFieldWrapperWidth = 0;
      let availableWidth = null;
      let inputWidth;
      let lastRowCollectionWidth;
      let itemsSizesLastRow;
      let lastSelectedItems;
      let multiLineState = !!(options.multiLine && itemsCount);
      const isShowCounter = this._isShowCounter(multiLineState, itemsCount, maxVisibleItems);

      if (this._isNeedCalculatingSizes(options)) {
         this._initializeConstants();
         // in mode read only and single line, counter does not affect the collection
         if (isShowCounter && (!options.readOnly || options.multiLine)) {
            counterWidth = this._getCounterWidth(itemsCount, options.theme, options.fontSize);
         }

         fieldWrapperWidth = this._getFieldWrapperWidth();
         lastSelectedItems = this._getLastSelectedItems(this._items, MAX_VISIBLE_ITEMS);
         itemsSizesLastRow = this._getItemsSizesLastRow(fieldWrapperWidth, lastSelectedItems, options, counterWidth);
         allItemsInOneRow = !options.multiLine ||
                             itemsSizesLastRow.length === Math.min(lastSelectedItems.length, maxVisibleItems);
         rightFieldWrapperWidth = this._getRightFieldWrapperWidth(itemsCount, !allItemsInOneRow, options.readOnly);
         availableWidth = this._getAvailableCollectionWidth(
             rightFieldWrapperWidth,
             options.readOnly,
             options.multiSelect,
             options.comment
         );

         // For multi line define - inputWidth, for single line - maxVisibleItems
         if (options.multiLine) {
            lastRowCollectionWidth = this._getCollectionWidth(itemsSizesLastRow);
            inputWidth = this._getInputWidth(fieldWrapperWidth, lastRowCollectionWidth, availableWidth);
            multiLineState = this._getMultiLineState(lastRowCollectionWidth, availableWidth, allItemsInOneRow);
         } else {
            maxVisibleItems = this._getMaxVisibleItems(
                lastSelectedItems,
                itemsSizesLastRow,
                availableWidth,
                counterWidth
            );
         }
      } else {
         multiLineState = false;
         maxVisibleItems = itemsCount;
      }

      this._multiLineState = multiLineState;
      this._inputWidth = inputWidth;
      this._maxVisibleItems = maxVisibleItems;
      this._availableWidthCollection = availableWidth;
      this._counterWidth = counterWidth;
   }

   private _getInputWidth(
       fieldWrapperWidth: number,
       lastRowCollectionWidth: number,
       availableWidth: number
   ): number {
      if (lastRowCollectionWidth <= availableWidth) {
         return fieldWrapperWidth - lastRowCollectionWidth - SHOW_SELECTOR_WIDTH;
      }
   }

   private _getMultiLineState(
       lastRowCollectionWidth: number,
       availableWidth: number,
       allItemsInOneRow: boolean
   ): boolean {
      return lastRowCollectionWidth > availableWidth || !allItemsInOneRow;
   }

   private _getCollectionWidth(itemsSizes: number[]): number {
      return itemsSizes.reduce((currentWidth, itemWidth) => {
         return currentWidth + itemWidth;
      }, 0);
   }

   private _getMaxVisibleItems(
       items: Model[],
       itemsSizes: number[],
       availableWidth: number,
       counterWidth: number): number {
      const itemsCount = items.length;
      const collectionWidth = this._getCollectionWidth(itemsSizes);
      let maxVisibleItems = 0;
      let visibleItemsWidth = 0;
      let availableCollectionWidthWidth = availableWidth;

      if (collectionWidth <= availableCollectionWidthWidth) {
         maxVisibleItems = items.length;
      } else {
         availableCollectionWidthWidth -= counterWidth || 0;
         for (let currentIndex = itemsCount - 1; currentIndex >= 0; currentIndex--) {
            if ((visibleItemsWidth + itemsSizes[currentIndex]) > availableCollectionWidthWidth) {
               /* If no element is inserted, then only the last selected */
               if (!maxVisibleItems) {
                  maxVisibleItems++;
               }
               break;
            }

            maxVisibleItems++;
            visibleItemsWidth += itemsSizes[currentIndex];
         }
      }

      return maxVisibleItems;
   }

   private _isShowCounter(multiLine: boolean, itemsCount: number, maxVisibleItems: number): boolean {
      return multiLine && itemsCount > maxVisibleItems || !multiLine && itemsCount > 1;
   }

   private _getCounterWidth(itemsCount: number, theme: string, fontSize: string): number {
      return selectedCollectionUtils.getCounterWidth(itemsCount, theme, fontSize);
   }

   private _getLastSelectedItems(items: SelectedItems, maxVisibleItems: number): Model[] {
      const selectedItems = [];
      const count = items.getCount();
      const startIndex = (count - maxVisibleItems) < 0 ? 0 : (count - maxVisibleItems);

      for (let i = startIndex; i < count; i++) {
         selectedItems.push(items.at(i));
      }

      return selectedItems;
   }

   private _getItemsSizesLastRow(
       fieldWrapperWidth: number,
       items: Model[],
       newOptions: ILookupInputOptions,
       counterWidth: number
   ): number[] {
      const measurer = document.createElement('div');
      const maxVisibleItems = newOptions.multiLine ? newOptions.maxVisibleItems : items.length;
      const itemsSizes = [];
      let itemsCount;
      let collectionItems;

      measurer.innerHTML = itemsTemplate({
         _options: {
            ...Collection.getDefaultOptions(),
            ...this._getCollectionOptions(newOptions, maxVisibleItems, counterWidth)
         },
         _visibleItems: this._getLastSelectedItems(this._items, maxVisibleItems),
         _getItemMaxWidth: selectedCollectionUtils.getItemMaxWidth,
         _getItemOrder: selectedCollectionUtils.getItemOrder,
         _contentTemplate: ContentTemplate,
         _crossTemplate: CrossTemplate,
         _counterTemplate: CounterTemplate
      }).replace(/&amp;/g, '&');

      if (newOptions.multiLine) {
         measurer.style.width = fieldWrapperWidth - SHOW_SELECTOR_WIDTH + 'px';
      }

      measurer.classList.add('controls-Lookup-collection__measurer');
      document.body.appendChild(measurer);
      collectionItems = measurer.getElementsByClassName('js-controls-SelectedCollection__item');
      itemsCount = collectionItems.length;

      // items only from the last line
      for (let index = itemsCount - 1; index >= 0 &&
      collectionItems[index].offsetTop === collectionItems[itemsCount - 1].offsetTop; index--) {

         itemsSizes.unshift(Math.ceil(collectionItems[index].getBoundingClientRect().width));
      }

      document.body.removeChild(measurer);

      return itemsSizes;
   }

   private _getCollectionOptions(options: ILookupInputOptions, maxVisibleItems: number, counterWidth: number): object {
      const collectionConfig = {
         itemsLayout: options.multiLine ? 'default' : 'oneRow',
         maxVisibleItems,
         _counterWidth: counterWidth,
         theme: options.theme,
         items: this._items
      };
      const depOptions = ['itemTemplate', 'readOnly', 'displayProperty'];

      depOptions.forEach((optName) => {
         if (options.hasOwnProperty(optName)) {
            collectionConfig[optName] = options[optName];
         }
      });

      return collectionConfig;
   }

   private _getRightFieldWrapperWidth(itemsCount: number, multiLine: boolean, readOnly: boolean): number {
      let rightFieldWrapperWidth = 0;

      if (!readOnly) {
         rightFieldWrapperWidth += SHOW_SELECTOR_WIDTH;
      }

      if (!multiLine && itemsCount > 1) {
         rightFieldWrapperWidth += CLEAR_RECORDS_WIDTH;
      }

      return rightFieldWrapperWidth;
   }

   private _getAvailableCollectionWidth(
       rightFieldWrapperWidth: number,
       readOnly: boolean,
       multiSelect: boolean,
       comment: string
   ): number {
      // we get the height of a single-line Lookup control, which would then calculate the minimum width of the input
      const fieldWrapperMinHeight = this._getFieldWrapperMinHeight();
      const fieldWrapperWidth = this._getFieldWrapperWidth();
      const fieldWrapperStyles = this._getFieldWrapperComputedStyle();
      const fieldWrapperWidthWithPaddings =
          fieldWrapperWidth +
          parseInt(fieldWrapperStyles.paddingLeft, 10) +
          parseInt(fieldWrapperStyles.paddingRight, 10) +
          parseInt(fieldWrapperStyles.borderLeftWidth, 10) +
          parseInt(fieldWrapperStyles.borderRightWidth, 10);
      let additionalWidth = rightFieldWrapperWidth;

      if (!readOnly && (multiSelect || comment)) {
         additionalWidth += this._getInputMinWidth(
             fieldWrapperWidthWithPaddings,
             rightFieldWrapperWidth,
             fieldWrapperMinHeight
         );
      }

      return fieldWrapperWidth - additionalWidth;
   }

   private _getFieldWrapperComputedStyle(): CSSStyleDeclaration {
      return getComputedStyle(this._getFieldWrapper());
   }

   private _getInputMinWidth(
       fieldWrapperWidth: number,
       rightFieldWrapperWidth: number,
       fieldWrapperMinHeight: number
   ): number {
      /* By the standard, the minimum input field width is 33%, but not more than 4 field wrapper min height */
      const minWidthFieldWrapper = (fieldWrapperWidth - rightFieldWrapperWidth) / 3;
      return Math.min(minWidthFieldWrapper, 4 * fieldWrapperMinHeight);
   }

   private _getFieldWrapperMinHeight(): number {
      if (this._fieldWrapperMinHeight === null) {
         const fieldWrapperStyles = getComputedStyle(this._getFieldWrapper());
         this._fieldWrapperMinHeight = parseInt(fieldWrapperStyles['min-height'], 10) ||
                                       parseInt(fieldWrapperStyles.height, 10);
      }

      return this._fieldWrapperMinHeight;
   }

   private _initializeConstants(): void {
      if (!SHOW_SELECTOR_WIDTH) {
         const templateOptions = {
            theme: this._options.theme
         };
         SHOW_SELECTOR_WIDTH = getWidth(this._showSelectorTemplate(templateOptions));
         CLEAR_RECORDS_WIDTH = getWidth(this._clearRecordsTemplate(templateOptions));
      }
   }

   _isInputVisible(options: ILookupOptions): boolean {
      return (!options.readOnly || this._getInputValue(options) && !options.multiSelect) &&
             !!(this._isEmpty() || options.multiSelect || options.comment);
   }

   _isNeedCalculatingSizes(options: ILookupOptions): boolean {
      return !this._isEmpty() &&
             (options.multiSelect || options.comment) &&
             (!options.readOnly || this._items.getCount() > 1);
   }

   static getDefaultOptions(): object {
      return {
         ...BaseLookup.getDefaultOptions(),
         ...{
            displayProperty: 'title',
            multiSelect: false,
            maxVisibleItems: 7,
            itemTemplate
         }
      };
   }
}
/**
 * @name Controls/_lookup/Lookup#multiLine
 * @cfg {Boolean} Определяет, включать ли режим автовысоты при выборе записей,
 * когда включён этот режим, поле связи может отображаться в несколько строк.
 * @default false
 * @remark
 * Когда поле связи находится в многострочном режиме, то высота определяется автоматически по выбранным записям. Количество отображаемых записей устанавливается опцией {@link Controls/interface/ISelectedCollection#maxVisibleItems}.
 * Актуально только при multiSelect: true.
 *
 * @example
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       source="{{_source}}"
 *       keyProperty="id"
 *       searchParam="title"
 *       multiSelect="{{true}}"
 *       multiLine="{{true}}">
 *    </Controls.lookup:Input>
 * </pre>
 *
 * @see Controls/interface/ISelectedCollection#maxVisibleItems
 * @see Controls/interface/ISelectedCollection#multiSelect
 */
/*
 * @name Controls/_lookup/Lookup#multiLine
 * @cfg {Boolean} Determines then Lookup can be displayed in multi line mode.
 * @default false
 * @remark
 * When the communication field is in multi-line mode, the height is automatically determined by the selected records. The number of records displayed is set by the {@link Controls/interface/ISelectedCollection#maxVisibleItems} option.
 * Only relevant with multiSelect: true.
 *
 * @example
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       source="{{_source}}"
 *       keyProperty="id"
 *       searchParam="title"
 *       multiSelect="{{true}}"
 *       multiLine="{{true}}">
 *    </Controls.lookup:Input>
 * </pre>
 *
 * @see Controls/interface/ISelectedCollection#maxVisibleItems
 * @see Controls/interface/ISelectedCollection#multiSelect
 */

/**
 * @name Controls/_lookup/Lookup#comment
 * @cfg {String} Текст, который отображается в {@link placeholder подсказке} поля ввода, если в поле связи выбрано значение.
 * @remark
 * Если указана опция comment, то для поля связи будет включён режим,
 * в котором после выбора записи, поле ввода будет продолжать отображаться.
 * Актуально только в режиме единичного выбора.
 * Введённый комментарий можно получить из опции value поля связи.
 * @example
 * WML:
 * <pre>
 *     <Controls.lookup:Input
 *             comment='Введите комментарий'
 *             displayProperty='name'
 *             keyProperty='id'
 *             multiSelect='{{false}}'
 *             source='{{_source}}'
 *             bind:value='_value'
 *             bind:selectedKeys='_selectedKeys'/>
 * </pre>
 *
 * JS:
 * <pre>
 *     import {Memory} from 'Types/source';
 *
 *     protected _beforeMount() {
 *        this._source = new Memory({
 *            keyProperty: 'id'
 *            data: [
 *               { id: 1, name: 'Sasha' },
 *               { id: 2, name: 'Mark' },
 *               { id: 3, name: 'Jasmin' },
 *               { id: 4, name: 'Doggy' }
 *            ]
 *        });
 *        this._selectedKeys = [];
 *     }
 * </pre>
 * @link placeholder
 */
/*
 * @name Controls/_lookup/Lookup#comment
 * @cfg {String} The text that is displayed in the empty comment box.
 * @remark
 * Actual only in the mode of single choice.
 * If the value is not specified, the comment field will not be displayed.
 */

/**
 * @name Controls/_lookup/Lookup#suggestSource
 * @cfg {Types/source:ICrudPlus} Устанавливает источник для автодополнения.
 * @remark
 * Если опция не указана, то вместо нее автоматически передается значение опции {@link Controls/_lookup/Lookup#source}.
 *
 * @example
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       suggestSource="{{_source}}"
 *       keyProperty="id"
 *       searchParam="title"
 *       multiSelect="{{true}}">
 *    </Controls.lookup:Input>
 * </pre>
 * @see suggestKeyProperty
 */

/**
 * @name Controls/_lookup/Lookup#suggestKeyProperty
 * @cfg {String} Устанавливает поле с первичным ключем для автодополнения.
 * @remark
 * Если опция не указана, то вместо нее автоматически передается значение опции {@link Controls/_lookup/Lookup#keyProperty}.
 *
 * @example
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       suggestSource="{{_source}}"
 *       suggestKeyProperty="id"
 *       searchParam="title"
 *       multiSelect="{{true}}">
 *    </Controls.lookup:Input>
 * </pre>
 * @link suggestSource
 */

/**
 * @name Controls/_lookup/Lookup#items
 * @cfg {Types/collection:RecordSet} Устанавливает значения без использования источника.
 *
 * @example
 * WML:
 * <pre>
 *    <Controls.lookup:Input
 *       items="{{_items}}"
 *       keyProperty="id"
 *       searchParam="title"
 *       multiSelect="{{true}}">
 *    </Controls.lookup:Input>
 * </pre>
 */

 /**
 * @name Controls/_lookup/Lookup#fontSize
 * @cfg
 * @demo Controls-demo/LookupNew/Input/FontSize/Index
 */