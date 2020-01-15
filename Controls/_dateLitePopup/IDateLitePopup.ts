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
 * @mixin Controls/dateLitePopup/IDateLitePopup
 * @public
 */
   export default {
      getDefaultOptions: function() {
         return {

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#year
             * @cfg {Date} Отображаемый год.
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
             */

            /*
             * @name Controls/dateLitePopup/IDateLitePopup#emptyCaption
             * @cfg {String} Text that is used if the period is not selected
             */
            emptyCaption: undefined,

             /**
              * @name Controls/dateLitePopup/IDateLitePopup#popupClassName
              * @cfg {String} Класс, который навешивается на всплывающее окно.
              */
            popupClassName: undefined,

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#checkedStart
             * @cfg {Date} Дата начала отмеченного периода.
             * @remark Отметить можно только месяца. При использовании опции, все месяца, находящиеся
             * до диапазона checkedStart, так же будут помечены, но в 'отрицательное' стостояние.
             * Так же при использовании опции отдельно от {@link Controls/dateLitePopup/IDateLitePopup#checkedEnd checkedEnd}
             * пометит все месяца, находящиеся после диапазона checkedStart в 'положительное' состояние.
             *
             */
            checkedStart: undefined,

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#checkedEnd
             * @cfg {Date} Дата окончания отмеченного периода.
             * @remark Отметить можно только месяца. При использовании опции отдельно от
             * {@link Controls/dateLitePopup/IDateLitePopup#checkedStart checkedStart} пометит все месяца в
             * 'отрицательное' состояние.
             */
            checkedEnd: undefined,

            /**
             * @name Controls/dateLitePopup/IDateLitePopup#checkedTemplate
             * @cfg {HTMLElement} Нестандартный шаблон отметок месяца.
             * @remark В шаблон будет отправлена булевая переменная isChecked, для управления видом отметок
             * @example
             * <pre>
             *  <Controls.dateLitePopup
             *    startValue="{{_startValue}}"
             *    endValue="{{_endValue}}"
             *    checkedTemplate="{{template}}"
             *    attr:class="ControlsDemo-PeriodLiteDialog__full"
             *  />
             * </pre>
             * <pre>
             *     <div>
             *       <ws:if data="{{ isChecked }}">
             *          <div class="controls-PeriodLiteDialog-item__checkBox" title="{[Месяц закрыт]}">
             *             <div>'Положительная' отметка</div>
             *          </div>
             *       </ws:if>
             *       <ws:else>
             *          <div class="controls-PeriodLiteDialog-item__checkBox" title="{[Месяц не закрыт]}">
             *             <div>'Отрицательная' отметка</div>
             *          </div>
             *       </ws:else>
             *     </div>
             * </pre>
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
