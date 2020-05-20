/**
 * Интерфейс для перезагрузки данных c сохранением раскрытых узлов.
 * @interface Controls/_treeGrid/interface/IReloadableTreeGrid
 * @public
 * @author Авраменко А.С.
 */

/**
 * Перезагружает данные дерева.
 * @function Controls/_treeGrid/interface/IReloadableTreeGrid#reload
 * @param {boolean} keepScroll Сохранить ли позицию скролла после перезагрузки.
 * @param {object} sourceConfig {@link Controls/_interface/INavigation/IBaseSourceConfig.typedef Конфигурация источника данных } для перезагрузки.
 * @remark
 * Перезагрузка выполняется с сохранением раскрытых узлов.
 * При этом в поле фильтра, указанное в parentProperty будет отправлен массив раскрытых узлов.
 * Если в результате запроса для этих узлов будут присланы дочерние элементы, то узлы останутся раскрытыми, иначе они будут свёрнуты.
 * Постраничная навигация в запросе передается для корня и её параметр {@link Controls/_interface/INavigation/PageSourceConfig.typedef pageSize} необходимо применять для всех узлов.
 * Обратите внимание! При смене фильтра/навигации/source список раскрытых узлов сбрасывается.
 * @example
 * Пример списочного метода БЛ
 * <pre>
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
 */