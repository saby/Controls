import DataContext = require('Core/DataContext');

/**
 * Контекст для {@link Controls/scroll:Container}.
 * Используется для управления видимостью кнопок постраничной навигации.
 *
 * @example
 * Пример настройки постраничной навигации, когда кнопки не отображаются для внутреннего скролл-контейнера. 
 *
 * <pre>
 *    Component = Control.extend({
 *       _stickyHeaderContext: null,
 *       _beforeMount: function(options, context, receivedState) {
 *          this._scrollDataContext = new DataContext({
 *              pagingVisible: false
 *          });
 *       },
 *       _getChildContext: function() {
 *          return {
 *             stickyHeader: this._scrollDataContext
 *          };
 *       }
 *    });
 * </pre>
 *
 * @class Controls/_scroll/Scroll/Context
 * @extends Core/DataContext
 * @control
 * @public
 * @author Красильников А.С.
 * @category Container
 *
 */

/*
 * Context for {@link Controls/_scroll/Container}.
 * Used to control the visibility of paginated navigation.
 *
 * @example
 * Example setting paginated navigation is't visible for internal scroll container.
 *
 * <pre>
 *    Component = Control.extend({
 *       _stickyHeaderContext: null,
 *       _beforeMount: function(options, context, receivedState) {
 *          this._scrollDataContext = new DataContext({
 *              pagingVisible: false
 *          });
 *       }
 *       _getChildContext: function() {
 *          return {
 *             stickyHeader: this._scrollDataContext
 *          };
 *       },
 *    })
 * </pre>
 *
 * @class Controls/_scroll/Scroll/Context
 * @extends Core/DataContext
 * @control
 * @public
 * @author Красильников А.С.
 * @category Container
 *
 */
const ScrollContext = DataContext.extend({
   _moduleName: 'Controls/_scroll/Scroll/Context',
   constructor: function(cfg) {
      this.pagingVisible = cfg.pagingVisible;
   }
});
export = ScrollContext;
