/**
 * Интерфейс списочных контролов, для перезагрузки данных из {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}.
 * @interface Controls/_list/interface/IReloadableList
 * @public
 * @author Авраменко А.С.
 */

/**
 * @typedef {Object} SourceConfig
 * @description Конфигурация навигации ({@link /doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#cursor по курсору} или {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#page постраничная}).
 * Также, в конфигурации можно передать опцию multiNavigation, если метод БЛ поддерживает работу с {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/managing-node-expand/#multi-navigation множественной навигацией}.
 */

/**
 * Перезагружает данные из {@link /doc/platform/developmentapl/interface-development/controls/list/source/ источника данных}.
 * @markdown
 * @remark
 * При перезагрузке в фильтр уходит список {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/ развернутых узлов} (с целью {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/managing-node-expand/#multi-navigation восстановить пользователю структуру}, которая была до перезагрузки).
 * Принимает опционально конфигурацию источника данных для: {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#cursor навигации по курсору}, {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#page постраничной навигации}, если нужно перезагрузить список с навигацией, отличной от указанной в опциях контрола.
 * Если в списке было запущено {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование по месту}, то при вызове этого метода редактирование завершится без сохранения изменений (поведение аналогично вызову метода {@link Controls/list:IEditableList#cancelEdit cancelEdit}).
 * @function
 * @name Controls/_list/interface/IReloadableList#reload
 * @param {Boolean} [keepScroll=false] Сохранить ли позицию скролла после перезагрузки. Опция не работает для {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#page навигации с фиксированным количеством загружаемых записей}.
 * @param {SourceConfig} [sourceConfig=undefined] Конфигурация навигации источника данных (например, размер и номер страницы для постраничной навигации), которую можно передать при вызове reload, чтобы перезагрузка произошла с этими параметрами.
 * По умолчанию перезагрузка происходит с параметрами, переданными в опции {@link Controls/interface:INavigation#navigation navigation}.
 * @returns {Promise<void>} Возвращает Promise, завершение которого означает окончание процесса перезагрузки.
 * @example
 * В следующем примере показано, как в {@link Controls/list:View плоском списке} выполнить перезагрузку списка с параметрами навигации.
 * <pre class="brush: html; highlight: [4]">
 * <!-- WML -->
 * <Controls.list:View
 *    source="{{_viewSource}}"
 *    name="list" />
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 * this._children.list.reload(true, {
 *     limit: 25,
 *     position: [null, new Date(), null, null, null],
 *     direction: 'both',
 *     field: ['@Документ', 'Веха.Дата', 'ДокументРасширение.Название', 'Раздел', 'Раздел@']
 * });
 * </pre>
 *
 * В следующем примере показано, как в {@link Controls/treeGrid:View дереве с колонками} выполнить перезагрузку с {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/managing-node-expand/#multi-navigation сохранением развёрнутых узлов}.
 * <pre class="brush: html; highlight: [4]">
 * <!-- WML -->
 * <Controls.treeGrid:View
 *    source="{{_viewSource}}"
 *    name="treegrid" />
 * </pre>
 * <pre class="brush: js; highlight: [3]">
 * // TypeScript
 * this._children.treegrid.reload(true, {
 *     multiNavigation: true
 * })
 * </pre>
 */

/*
 * Reloads list data and view.
 * @function Controls/_list/interface/IReloadableList#reload
 */
