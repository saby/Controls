export interface IHierarchySearchOptions {
    startingWith: string;
    searchNavigationMode: string;
}
/**
 * Интерфейс для контролов, реализующих поиск в иерархических списках.
 * @public
 * @author Герасимов А.М.
 */
interface IHierarchySearch {
    readonly _options: {
        /**
         * @typedef {String} StartingWith
         * @variant root Поиск происходит в корне .
         * @variant current Поиск происходит в текущем резделе.
         */
        /**
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
         * @variant open В {@link Controls/_explorer/interface/IExplorer#viewMode режиме поиска} при клике на хлебную крошку происходит проваливание в данный узел.
         * @variant expand В режиме поиска при клике на хлебную крошку данные отображаются от корня, путь до узла разворачивается.
         */
        /**
         * @cfg {SearchNavigationMode} Режим навигации при поиске в иерархическом списке.
         * @default open
         */
        searchNavigationMode: string;
    };
}

export default IHierarchySearch;
