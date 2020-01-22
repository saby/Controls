import Control = require('Core/Control');
import template = require('wml!Controls/_compatiblePopup/CompoundAreaForNewTpl/ComponentWrapper/ComponentWrapper');
import 'css!theme?Controls/compatiblePopup';

interface ITemplateOptions {
   _onCloseHandler: Function;
   _onResizeHandler: Function;
   _onResultHandler: Function;
   _onRegisterHandler: Function;
   _onMaximizedHandler: Function;
   _onResizingLineHandler: Function;
}

interface IPopupOptions {
   width?: number;
   minWidth?: number;
   maxWidth?: number;
   propStorageId?: number;
}

interface IComponentWrapperOptions {
   templateOptions: ITemplateOptions;
   popupOptions: IPopupOptions;
}

const ComponentWrapper = Control.extend({
   _template: template,
   _minOffset: null,
   _maxOffset: null,
   _fillCallbacks(cfg: IComponentWrapperOptions): void {
      this._onCloseHandler = cfg.templateOptions._onCloseHandler;
      this._onResizeHandler = cfg.templateOptions._onResizeHandler;
      this._onResultHandler = cfg.templateOptions._onResultHandler;
      this._onRegisterHandler = cfg.templateOptions._onRegisterHandler;
      this._onMaximizedHandler = cfg.templateOptions._onMaximizedHandler;
      this._onResizingLineHandler = cfg.templateOptions._onResizingLineHandler;
   },
   finishPendingOperations(): Promise<null> {
      return this._children.PendingRegistrator.finishPendingOperations();
   },
   hasRegisteredPendings(): boolean {
      return this._children.PendingRegistrator._hasRegisteredPendings();
   },
   _beforeMount(cfg: IComponentWrapperOptions): void {
      this._fillCallbacks(cfg);
      this.setTemplateOptions(cfg.templateOptions);
      this.setPopupOptions(cfg.popupOptions);
      this._updateOffset();
   },
   _beforeUpdate(cfg: IComponentWrapperOptions): void {
      this._fillCallbacks(cfg);
      this._updateOffset();
   },
   setTemplateOptions(templateOptions: ITemplateOptions): void {
      this._templateOptions = templateOptions;
   },
   setPopupOptions(popupOptions: IPopupOptions): void {
      this._popupOptions = popupOptions;
   },
   _canResize(propStorageId: string, width: number, minWidth: number, maxWidth: number): boolean {
      const canResize = propStorageId && width && minWidth && maxWidth && maxWidth !== minWidth;
      return !!canResize;
   },
   _updateOffset(): void {
      const popupOptions = this._popupOptions;
      // protect against wrong options
      this._maxOffset = Math.max(popupOptions.maxWidth - popupOptions.width, 0);
      this._minOffset = Math.max(popupOptions.width - popupOptions.minWidth, 0);
   },
   _offsetHandler(event: Event, offset: number): void {
      // стреляет после того, как закончилось движение границ
      this._onResizingLineHandler(offset);
   }
});

export default ComponentWrapper;
