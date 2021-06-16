import {IBaseSourceConfig} from 'Controls/interface';

/**
 * Интерфейс для перезагрузки данных c сохранением раскрытых узлов.
 * @public
 * @author Авраменко А.С.
 */

export interface IReloadableTreeGrid {
    reload: (keepScroll: boolean, sourceConfig: IBaseSourceConfig) => Promise<any>;
}
/**
 * Перезагружает данные дерева.
 * @name Controls/_treeGridOld/interface/IReloadableTreeGrid#reload
 * @function
 * @param {boolean} [keepScroll=false] Сохранить ли позицию скролла после перезагрузки.
 * @param {Controls/interface:INavigationPositionSourceConfig | Controls/interface:INavigationPageSourceConfig} [sourceConfig=undefined] Конфигурация источника данных для перезагрузки.
 * @return Promise
 * @remark
 * Перезагрузка выполняется с сохранением {@link /doc/platform/developmentapl/interface-development/controls/list/tree/node/ развернутых узлов}.
 * При этом в поле фильтра, указанное в {@link Controls/treeGrid:View#parentProperty parentProperty}, будет отправлен массив развернутых узлов.
 * Если в результате запроса для этих узлов будут присланы дочерние элементы, то узлы останутся развернутыми, иначе они будут свёрнуты.
 * Постраничная навигация в запросе передается для корня, и её параметр {@link Controls/interface:INavigationPageSourceConfig#pageSize pageSize} необходимо применять для всех узлов.
 * **Обратите внимание!** При смене конфигурации {@link Controls/treeGrid:View#filter filter}/{@link Controls/treeGrid:View#navigation navigation}/{@link Controls/treeGrid:View#source source} список развернутых узлов сбрасывается. Для перезагрузки с сохранением развернутых узлов используют либо метод {@link Controls/tree:ITreeControl#deepReload deepReload}, либо {@link /doc/platform/developmentapl/interface-development/controls/list/tree/node/managing-node-expand/#multi-navigation мультинавигацию}.
 * @markdown
 * @example
 * Пример списочного метода БЛ.
 * <pre class="brush: python">
 * def Test.MultiRoot(ДопПоля, Фильтр, Сортировка, Навигация):
 *      rs = RecordSet(CurrentMethodResultFormat())
 *      if Навигация.Type() == NavigationType.ntMULTI_ROOT:
 *          nav_result = {}
 *          for id, nav in Навигация.Roots().items():
 *              # Запрашиваем данные по одному разделу.
 *              Фильтр.Раздел = id
 *              tmp_rs = Test.MultiRoot(ДопПоля, Фильтр, Сортировка, nav)
 *              # Склеиваем результаты.
 *              for rec in tmp_rs:
 *                  rs.AddRow(rec)
 *              # Формируем общий результа навигации по всем разделам.
 *              nav_result[ id ] = tmp_rs.nav_result
 *          rs.nav_result = NavigationResult(nav_result)
 *      else:
 *          # Тут обработка обычной навигации, например, вызов декларативного списка.
 *          rs = Test.DeclList(ДопПоля, Фильтр, Сортировка, Навигация)
 *      return rs
 *</pre>
 * @see Controls/tree:ITreeControl#deepReload
 * @see Controls/treeGrid:View#parentProperty
 */