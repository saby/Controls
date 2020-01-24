

   /**
    * Интерфейс для выпадающих списков, поддерживающих шаблон подвала списка.
    *
    * @interface Controls/_dropdown/interface/IFooterTemplate
    * @public
    * @author Золотова Э.Е.
    */

   /*
    * Interface for dropdown lists that support the template for the footer.
    *
    * @interface Controls/_dropdown/interface/IFooterTemplate
    * @public
    * @author Золотова Э.Е.
    */

   /**
    * @name Controls/_dropdown/interface/IFooterTemplate#footerTemplate
    * @cfg {Function | String} Шаблон подвала списка.
    * @demo Controls-demo/dropdown_new/Button/FooterTemplate/Index
    * @example
    * TMPL:
    * <pre>
    *    <Controls.dropdown:Button
    *          keyProperty="id"
    *          icon="icon-Save icon-small"
    *          on:footerClick="footerClickHandler()"
    *          source="{{_source}}">
    *       <ws:footerTemplate>
    *          <div class="ControlsDemo-InputDropdown-footerTpl">
    *             <Controls.buttons:Button caption="+ New template" size="l" viewMode="link"/>
    *          </div>
    *       </ws:footerTemplate>
    *    </Controls.dropdown:Button>
    * </pre>
    * JS:
    * <pre>
    *    footerClickHandler: function() {
    *       this._children.stack.open({
    *          opener: this._children.button
    *       });
    *    }
    * </pre>
    */

   /*
    * @name Controls/_dropdown/interface/IFooterTemplate#footerTemplate
    * @cfg {Function | String} Template that will be rendered below the list.
    * @example
    * TMPL:
    * <pre>
    *    <Controls.dropdown:Button
    *          keyProperty="id"
    *          icon="icon-Save icon-small"
    *          on:footerClick="footerClickHandler()"
    *          source="{{_source}}">
    *       <ws:footerTemplate>
    *          <div class="ControlsDemo-InputDropdown-footerTpl">
    *             <Controls.buttons:Button caption="+ New template" size="l" viewMode="link"/>
    *          </div>
    *       </ws:footerTemplate>
    *    </Controls.dropdown:Button>
    * </pre>
    * JS:
    * <pre>
    *    footerClickHandler: function() {
    *       this._children.stack.open({
    *          opener: this._children.button
    *       });
    *    }
    * </pre>
    */

   /**
    * @name Controls/_dropdown/interface/IFooterTemplate#nodeFooterTemplate
    * @cfg {Function | String} Шаблон подвала, отображающийся для всех подменю.
    * В шаблон передается объект itemData со следующими полями:
    *    key - ключ родительского элемента;
    *    item - родительский элемент.
    * @example
    * TMPL:
    * <pre>
    *    <Controls.dropdown:Button
    *          keyProperty="id"
    *          icon="icon-Save icon-small"
    *          parentProperty="parent"
    *          nodeProperty="@parent"
    *          source="{{_source}}">
    *       <ws:nodeFooterTemplate>
    *          <div class="ControlsDemo-InputDropdown-footerTpl">
    *             <Controls.buttons:Button caption="+ New template" size="l" viewMode="link" on:click="_clickHandler(itemData.key)"/>
    *          </div>
    *       </ws:footerTemplate>
    *    </Controls.dropdown:Button>
    * </pre>
    * JS:
    * <pre>
    *    _clickHandler: function(rootKey) {
    *       this._children.stack.open({
    *          opener: this._children.button
    *       });
    *    }
    * </pre>
    */
   