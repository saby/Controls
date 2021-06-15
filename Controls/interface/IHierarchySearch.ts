export interface IHierarchySearchOptions {
    startingWith?: 'root'|'current';
    searchNavigationMode?: string;
}
/**
 * Интерфейс для контролов, реализующих поиск в {@link /doc/platform/developmentapl/interface-development/controls/list/ иерархических списках}.
 * @public
 * @author Герасимов А.М.
 */
interface IHierarchySearch {
    readonly _options: {
        /**
         * @typedef {String} StartingWith
         * @description Допустимые значения для опции {@link startingWith}.
         * @variant root Поиск происходит в корне.
         * @variant current Поиск происходит в текущем резделе.
         */
        /**
         * @name Controls/interface/IHierarchySearch#startingWith
         * @cfg {StartingWith} Режим поиска в иерархическом списке.
         * @default root
         * @example
         * В приведённом примере поиск будет происходить в корне.
         *
         * <pre class="brush: js">
         * // TypeScript
         * import {HierarchicalMemory} from 'Types/source';
         *
         * _source: null,
         * _beforeMount: function() {
         *     this._source = new HierarchicalMemory({
         *         //hierarchy data
         *     })
         * }
         * </pre>
         * <pre class="brush: html">
         * <!-- WML -->
         * <Layout.browsers:Browser parentProperty="Раздел" startingWith="root" searchParam="city" source="_source">
         *     <ws:search>
         *         <Controls.search:Input/>
         *     </ws:search>
         *     <ws:content>
         *         <Controls.explorer:View>
         *             ...
         *         </Controls.explorer:View>
         *     <ws:content>
         * </Layout.browsers:Browser>
         * </pre>
         */
        startingWith: string;
        /**
         * @typedef {String} SearchNavigationMode
         * @description Допустимые значения для опции {@link searchNavigationMode}.
         * @variant open В {@link Controls/_explorer/interface/IExplorer#viewMode режиме поиска} при клике на хлебную крошку происходит проваливание в данный узел.
         * @variant expand В режиме поиска при клике на хлебную крошку данные отображаются от корня, путь до узла разворачивается.
         */
        /**
         * @name Controls/interface/IHierarchySearch#searchNavigationMode
         * @cfg {SearchNavigationMode} Режим навигации при поиске в иерархическом списке.
         * @default open
         */
        searchNavigationMode: string;
    };
}

export default IHierarchySearch;
