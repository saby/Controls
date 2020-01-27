import rk = require('i18n!Controls');
import {descriptor} from 'Types/entity';
import {Utils as dateControlsUtils} from 'Controls/dateRange';

   var EMPTY_CAPTIONS = {
      NOT_SPECIFIED: rk('Не указан'),
      NOT_SELECTED: rk('Не выбран'),
      WITHOUT_DUE_DATE: rk('Бессрочно', 'ShortForm'),
      ALL_TIME: rk('Весь период')
   };

/**
 * Интерфейс для контрола выбора даты или периода.
 * @mixin Controls/dateLitePopup/IDateLitePopup
 * @author Красильников А.С.
 * @public
 */
   export default {
      getDefaultOptions: function() {
         return {

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#year
             * @cfg {Date} Отображаемый год.
             * @default undefined
             */

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#year
             * @cfg {Date} Displayed period
             */
            year: undefined,

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#chooseMonths
             * @cfg {Boolean} Устанавливает возможность выбора месяца.
             * @default true
             */

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#chooseMonths
             * @cfg {Boolean} Sets the option to choose a month
             * @default true
             */
            chooseMonths: true,

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#chooseQuarters
             * @cfg {Boolean} Устанавливает возможность выбора квартала.
             * @default true
             */

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#chooseQuarters
             * @cfg {Boolean} Sets the option to choose a quarter
             * @default true
             */
            chooseQuarters: true,

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#chooseHalfyears
             * @cfg {Boolean} Устанавливает возможность выбора полугодия.
             * @default true
             */
            chooseHalfyears: true,

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#chooseYears
             * @cfg {Boolean} Sets the option to choose a year
             * @default true
             */
            chooseYears: true,

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#emptyCaption
             * @cfg {String} Текст, который отображается, если период не выбран.
             * @default undefined
             */

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#emptyCaption
             * @cfg {String} Text that is used if the period is not selected
             */
            emptyCaption: undefined,

             /**
              * @name Controls/dateLitePopup/IDateLitePopup#dialogClassName
              * @cfg {String} Имена классов, которые будут применены к шаблону всплывающего окна.
              * @default undefined
              */
             dialogClassName: undefined,

            // TODO: Доделать полноценную поддержку следующих опций. Пока не показываем их в документации.
            /*
             * @name Controls/dateLitePopup/IDateLitePopup#checkedStart
             * @cfg {Date} The date (month) of the beginning of the checked period
             * @default undefined
             * @noshow
             */
            checkedStart: undefined,

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#checkedEnd
             * @cfg {Date} The date(month) of the end of the checked period
             * @default undefined
             * @noshow
             */
            checkedEnd: undefined,

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#checkedIconCssClass
             * @cfg {String} The CSS class that will be set on the selected icons. The default is a green tick.
             * @default icon-Yes icon-done
             * @noshow
             */
            checkedIconCssClass: 'icon-Yes icon-done',

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#uncheckedIconCssClass
             * @cfg {String} A CSS class that will be set on unselected icons. The default is a gray tick.
             * @default icon-Yes icon-disabled
             * @noshow
             */
            uncheckedIconCssClass: 'icon-Yes icon-disabled',

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#checkedIconTitle
             * @cfg {String} A hint that will be displayed on the selected icons. By default, there is no tooltip.
             * @default undefined
             * @noshow
             */
            checkedIconTitle: undefined,

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#uncheckedIconTitle
             * @cfg {String} A hint that will be displayed on the unselected icons. By default, there is no tooltip.
             * @default undefined
             * @noshow
             */
            uncheckedIconTitle: undefined,

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#iconsHandler
             * @cfg {Function} Sets the function to be called when the component is repainted.
             * @remark
             * Function Arguments:
             * <ol>
             *    <li>periods - An array containing arrays from the beginning and end of the period</li>
             * </ol>
             * The function must return an array of Boolean elements or an object containing information about
             * the displayed icon {@link Icon} or Deferred, which fires such an object.
             * If the function returns true, the icon corresponding to the options {@Link checkedIconCssClass}
             * and {@Link checkedIconTitle} will be drawn. If false, the icons will match the options
             * {@Link uncheckedIconCssClass} and {@Link uncheckedIconTitle}.
             * By default, these are green and gray check marks.
             * The function can return an object containing information about custom windows.
             * { iconClass: 'icon-Yes icon-done',
             *   title: 'Reporting period is closed'
             *   }
             * @see updateIcons
             * @default undefined
             * @noshow
             */
            // iconsHandler: undefined,

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#itemTemplate
             * @cfg {String|Function} Шаблон отображения года. Может принимать опцию monthCaptionTemplate как шаблон заголовка месяца.
             * Дата первого дня месяца и функция форматирования даты передаются в шаблон месяца {@link Types/formatter:date}.
             * @example
             * <pre>
             *    <ws:itemTemplate>
             *       <ws:partial template="{{itemTemplate.defaultTemplate}}">
             *          <ws:monthCaptionTemplate>
             *             <ws:if data="{{month.getMonth() % 2 === 0}}">
             *                <div class="controls-PeriodLiteDialog__vLayoutItem-caption"
             *                     style="{{ (month.getMonth() % 4 === 0) ? 'color: red;' }}">
             *                   {{ formatDate(month, "MMMM") }} !
             *                </div>
             *             </ws:if>
             *          </ws:monthCaptionTemplate>
             *       </ws:partial>
             *    </ws:itemTemplate>
             * </pre>
             */

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#itemTemplate
             * @cfg {String} Template of the year. Can accept the option monthCaptionTemplate - template header
             * of the month. The date of the first day of the month and date formatting function are passed
             * to the template of the month {@link Types/formatter:date}.
             * @example
             * <pre>
             *    <ws:itemTemplate>
             *       <ws:partial template="{{itemTemplate.defaultTemplate}}">
             *          <ws:monthCaptionTemplate>
             *             <ws:if data="{{month.getMonth() % 2 === 0}}">
             *                <div class="controls-PeriodLiteDialog__vLayoutItem-caption"
             *                     style="{{ (month.getMonth() % 4 === 0) ? 'color: red;' }}">
             *                   {{ formatDate(month, "MMMM") }} !
             *                </div>
             *             </ws:if>
             *          </ws:monthCaptionTemplate>
             *       </ws:partial>
             *    </ws:itemTemplate>
             * </pre>
             */

            /* That not to drag dependence on a template in all, the default value we set only in the PeriodLiteDialog
             * itemTemplate: undefined,
             */

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#captionFormatter
             * @cfg {Function} Функция форматирования заголовка.
             */

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#captionFormatter
             * @cfg {Function} Caption formatting function.
             */
            captionFormatter: dateControlsUtils.formatDateRangeCaption
         };
      },

      EMPTY_CAPTIONS: EMPTY_CAPTIONS,

      getOptionTypes: function() {
         return {
            chooseMonths: descriptor(Boolean),
            chooseQuarters: descriptor(Boolean),
            chooseHalfyears: descriptor(Boolean),
            chooseYears: descriptor(Boolean),
            emptyCaption: descriptor(String),
            captionFormatter: descriptor(Function)
         };
      }
   };
