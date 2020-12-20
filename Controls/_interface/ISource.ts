import {ICrud, ICrudPlus, IData} from 'Types/source';
export interface ISourceOptions {
   source?: ICrudPlus | ICrud & ICrudPlus & IData;
   keyProperty?: string;
}

/**
 * Интерфейс для доступа к источнику данных.
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Interface for components that use data source.
 * @public
 * @author Крайнов Д.О.
 */
export default interface ISource {
   readonly '[Controls/_interface/ISource]': boolean;
}
/**
 * @name Controls/_interface/ISource#source
 * @cfg {Types/source:ICrud} Объект реализующий интерфейс {@link Types/source:ICrud}, необходимый для работы с источником данных.
 * @remark
 * Более подробно об источниках данных вы можете почитать {@link /doc/platform/developmentapl/interface-development/data-sources/ здесь}.
 * @example
 * В приведённом примере для контрола {@link Controls/list:View} в опцию source передаётся {@link Types/source:HierarchicalMemory} источник.
 * Контрол получит данные из источника и выведет их.
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.list:View source="{{_source}}" keyProperty="key">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}">
 *          <ws:contentTemplate>
 *             <span>{{contentTemplate.itemData.item.title}}</span>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 *
 * <pre class="brush: js">
 * import {HierarchicalMemory} from "Types/source";
 *
 * _source: null,
 * _beforeMount: function() {
 *     this._source = new HierarchicalMemory({
 *         keyProperty: 'key',
 *         parentProperty: 'parent',
 *         data: [
 *             {
 *                 key: '1',
 *                 title: 'Ярославль',
 *                 icon: 'icon-small icon-Yar icon-done',
 *                 parent: null,
 *                 '@parent': true
 *             },
 *             {
 *                 key: '2',
 *                 title: 'Рыбинск',
 *                 icon: 'icon-small icon-Ryb icon-done',
 *                 parent: 1,
 *                 '@parent': false
 *             },
 *             {
 *                 key: '3',
 *                 title: 'St-Petersburg',
 *                 icon: 'icon-small icon-SPB icon-done',
 *                 parent: null,
 *                 '@parent': true
 *             }
 *         ]
 *     })
 * }
 * </pre>
 * @see Types/source:ICrudPlus
 * @see Types/source:ICrud
 * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/data-sources/
 */
/*
 * @name Controls/_interface/ISource#source
 * @cfg {Types/source:ICrud} Object that implements {@link Types/source:ICrud} interface for working with data.
 * More information about sources you can read <a href='doc/platform/developmentapl/interface-development/data-sources/'>here</a>.
 * @example
 * The list will be rendered data from _source
 *
 * WML:
 * <pre>
 *    <Controls.list:View source="{{_source}}" keyProperty="key">
 *        <ws:itemTemplate>
 *            <ws:partial template="Controls/list:ItemTemplate" scope="{{itemTemplate}}">
 *                <ws:contentTemplate>
 *                    <span>{{contentTemplate.itemData.item.title}}</span>
 *                </ws:contentTemplate>
 *            </ws:partial>
 *        </ws:itemTemplate>
 *    </Controls.list:View>
 * </pre>
 *
 * JS:
 * <pre>
 *     import {HierarchicalMemory} from "Types/source";
 *
 *     _source: null,
 *     _beforeMount: function() {
 *         this._source = new source.HierarchicalMemory({
 *             keyProperty: 'key',
 *             data: [
 *                {
 *                   key: '1',
 *                   title: 'Yaroslavl'
 *                },
 *                {
 *                   key: '2',
 *                   title: 'Moscow'
 *                },
 *                {
 *                   key: '3',
 *                   title: 'St-Petersburg'
 *                }
 *             ]
 *          })
 *     }
 * </pre>
 * @see Types/source:ICrudPlus
 * @see Types/source:ICrud
 * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/data-sources/
 */

/**
 * @name Controls/_interface/ISource#keyProperty
 * @cfg {String} Имя свойства, содержащего информацию об идентификаторе текущей строки.
 * @remark Например, идентификатор может быть первичным ключом записи в базе данных.
 * Если keyProperty не задан, то значение будет взято из source.
 * @demo Controls-demo/list_new/KeyProperty/Source/Index
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.list:View
 *    source="{{_source}}"
 *    keyProperty="key" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * _source: null,
 * _beforeMount: function(){
 *    this._source = new source.Memory({
 *       keyProperty: 'key',
 *       data: [
 *          {
 *             key: '1',
 *             title: 'Yaroslavl'
 *          },
 *          {
 *             key: '2',
 *             title: 'Moscow'
 *          },
 *          {
 *             key: '3',
 *             title: 'St-Petersburg'
 *          }
 *       ]
 *    })
 * }
 * </pre>
 */

/*
 * @name Controls/_interface/ISource#keyProperty
 * @cfg {String} Name of the item property that uniquely identifies collection item.
 * @remark For example, the identifier may be the primary key of the record in the database.
 * @example
 * <pre>
 *    <Controls.list:View
 *       source = "{{_source}}"
 *       keyProperty="key">
 *    </Controls.list:View>
 * </pre>
 * <pre>
 *    _source: new Memory({
 *       keyProperty: 'key',
 *       data: [
 *       {
 *          key: '1',
 *          title: 'Yaroslavl'
 *       },
 *       {
 *          key: '2',
 *          title: 'Moscow'
 *       },
 *       {
 *          key: '3',
 *          title: 'St-Petersburg'
 *       }
 *       ]
 *    })
 * </pre>
 *
 */
