import rk = require('i18n!Controls');
import {descriptor} from 'Types/entity';
import {TemplateFunction, IControlOptions} from 'UI/Base';

export interface IDateLitePopupOptions extends IControlOptions {
   year?: Date;
   chooseMonths?: boolean;
   chooseQuarters?: boolean;
   chooseHalfyears?: boolean;
   chooseYears?: boolean;
   emptyCaption?: string;
   popupClassName?: string;
   captionFormatter?: Function;
   startValue?: Date;
   endValue?: Date;
   displayedRanges?: Date[];
   dateConstructor?: Function;
   monthTemplate?: TemplateFunction;
   itemTemplate?: TemplateFunction;
   stickyPosition?: object;

   //TODO: устаревшая опция
   range?: Date[];
}

const EMPTY_CAPTIONS = {
      NOT_SPECIFIED: rk('Не указан'),
      NOT_SELECTED: rk('Не выбран'),
      WITHOUT_DUE_DATE: rk('Бессрочно', 'ShortForm'),
      ALL_TIME: rk('Весь период')
   };

/**
 * Интерфейс для контрола выбора даты или периода.
 * @mixin Controls/shortDatePicker/IDateLitePopup
 * @author Красильников А.С.
 * @public
 */

/**
 * @name Controls/shortDatePicker/IDateLitePopup#year
 * @cfg {Date} Отображаемый год.
 * @default undefined
 */

/**
 * @name Controls/shortDatePicker/IDateLitePopup#emptyCaption
 * @cfg {String} Текст, который отображается, если период не выбран.
 * @default undefined
 */

/**
 * @name Controls/shortDatePicker/IDateLitePopup#popupClassName
 * @cfg {String} Имена классов, которые будут применены к корневой ноде всплывающего окна.
 * @default undefined
 */
export default {
      getDefaultOptions(): object {
         return {

            /**
             * @name Controls/shortDatePicker/IDateLitePopup#chooseMonths
             * @cfg {Boolean} Устанавливает возможность выбора месяца.
             * @default true
             */

            chooseMonths: true,

            /**
             * @name Controls/shortDatePicker/IDateLitePopup#chooseQuarters
             * @cfg {Boolean} Устанавливает возможность выбора квартала.
             * @default true
             */

            chooseQuarters: true,

            /**
             * @name Controls/shortDatePicker/IDateLitePopup#chooseHalfyears
             * @cfg {Boolean} Устанавливает возможность выбора полугодия.
             * @default true
             */
            chooseHalfyears: true,

            /**
             * @name Controls/shortDatePicker/IDateLitePopup#chooseYears
             * @cfg {Boolean} Sets the option to choose a year
             * @default true
             */
            chooseYears: true,

            /**
             * @name Controls/shortDatePicker/IDateLitePopup#monthTemplate
             * @remark Шаблон может принимать 2 опции:
             * <ul>
             *     <li>contentTemplate : В шаблон передается value, где хранится дата месяца.</li>
             *     <li>iconTemplate: в качестве опций получает value (Дату) и extData(данные загруженные через источник данных source).</li>
             * </ul>
             * @cfg {HTMLElement} Шаблон месяца
             * @example
             * <pre>
             *     <Controls.shortDatePicker:View>
             *         <ws:monthTemplate>
             *             <ws:partial
             *                template='Controls.shortDatePicker:MonthTemplate'>
             *                <ws:contentTemplate>
             *                   <div>{{_getMonthCaption(contentTemplate.date)}}</div>
             *                </ws:contentTemplate>
             *                <ws:iconTemplate>
             *                   <div class="{{_getIconIconClass(iconTemplate.date)}}"  title="{{_getIconTitle(iconTemplate.date)}}"></div>
             *                </ws:iconTemplate>
             *             </ws:partial>
             *         <ws:monthTemplate>
             *     </Controls.shortDatePicker:View>
             * </pre>
             */

            /**
             * @name Controls/shortDatePicker/IDateLitePopup#source
             * @cfg {Types/source:ICrud} Источник данных, которые используются для отображения отметок на месяцах.
             * @remark Должен поддерживать навигацию по курсору. В качестве идентификаторов используются даты.
             * Каждый элемент это месяц, должен содержать поле extData. В самом простом случае это true или false.
             * true соответствует зеленой галочке, false - серой.
             * @example
             * <pre>
             *  <Controls.dateRange:RangeShortSelector
             *     source="{{_source}}"
             *     attr:test_name="default_range">
             *     <ws:monthTemplate>
             *         <ws:partial template="Controls/shortDatePicker:MonthTemplate">
             *             <ws:iconTemplate>
             *                 <ws:if data="{{iconTemplate.extData}}">
             *                     <div class="controls-PeriodLiteDialog-item__checkBox" title="{[Месяц закрыт]}">
             *                         <div class="icon-16 icon-Yes icon-done"></div>
             *                     </div>
             *                 </ws:if>
             *                 <ws:else data="{{iconTemplate.extData === 0}}">
             *                     <div class="controls-PeriodLiteDialog-item__checkBox" title="{[Месяц не закрыт]}">
             *                         <div class="icon-16 icon-Yes icon-disabled"></div>
             *                     </div>
             *                 </ws:else>
             *             </ws:iconTemplate>
             *         </ws:partial>
             *     </ws:monthTemplate>
             *  </Controls.dateRange:RangeShortSelector>
             * </pre>
             * <pre>
             *    class DateLitePopupSource extends Memory {
             *       private _$keyProperty: string = 'id';
             *
             *       public query(query) {
             *          let
             *             offset = query.getOffset(),
             *             where = query.getWhere(),
             *             limit = query.getLimit() || 1,
             *             executor;
             *
             *          executor = (function() {
             *             let adapter = this.getAdapter().forTable(),
             *                 items = [],
             *                 monthEqual = where['id~'],
             *                 monthGt = where['id>='],
             *                 monthLt = where['id<='],
             *                 month = monthEqual || monthGt || monthLt,
             *                 deferred = new Deferred();
             *
             *             if (month) {
             *                month = formatter.dateFromSql(month);
             *             } else {
             *                month = dateUtils.getStartOfMonth(new Date());
             *             }
             *
             *             month.setMonth(month.getMonth() + offset);
             *
             *             if (monthLt) {
             *                month.setMonth(month.getMonth() - limit);
             *             } else if (monthGt) {
             *                month.setMonth(month.getMonth() + 1);
             *             }
             *
             *             for (let i = 0; i < limit; i++) {
             *                items.push({
             *                   id: formatter.dateToSql(month, formatter.TO_SQL_MODE.DATE),
             *                   extData: i % 2
             *                });
             *                month.setMonth(month.getMonth() + 1);
             *             }
             *
             *             this._each(
             *                items,
             *                function(item) {
             *                   adapter.add(item);
             *                }
             *             );
             *             items = this._prepareQueryResult({
             *                items: adapter.getData(),
             *                total: monthEqual ? { before: true, after: true } : true
             *             });
             *
             *             setTimeout(function() {
             *                deferred.callback(items);
             *             }, 300);
             *
             *             return deferred;
             *          }).bind(this);
             *
             *          if (this._loadAdditionalDependencies) {
             *             return this._loadAdditionalDependencies().addCallback(executor);
             *          } else {
             *             return Deferred.success(executor());
             *          }
             *       }
             *    }
             * </pre>
             */
         };
      },

      EMPTY_CAPTIONS,

      getOptionTypes(): object  {
         return {
            chooseMonths: descriptor(Boolean),
            chooseQuarters: descriptor(Boolean),
            chooseHalfyears: descriptor(Boolean),
            chooseYears: descriptor(Boolean),
            emptyCaption: descriptor(String)
         };
      }
   };
