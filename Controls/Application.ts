import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import { PrefetchLinksStore } from 'UI/Deps';
import { AppData } from 'UI/State';
import * as template from 'wml!Controls/Application/Page';
import {Body as PageBody, Head as PageHead} from 'Application/Page';

import * as cBodyClasses from 'Core/BodyClasses';
import * as getResourceUrl from 'Core/helpers/getResourceUrl';
import {detection, compatibility, constants, IoC} from 'Env/Env';
import {TouchDetect} from 'Env/Touch';
import {Bus} from 'Env/Event';
import {SyntheticEvent} from 'Vdom/Vdom';
import {dispatcherHandler} from 'UI/HotKeys';
import {List} from 'Types/collection';

import {setController as setSettingsController, IPopupSettingsController} from
       'Controls/Application/SettingsController';
import {ManagerClass as PopupManager, GlobalController as PopupGlobalController, IPopupItem} from
       'Controls/popup';
import {RegisterClass} from 'Controls/event';
import {ControllerClass as DnDController} from 'Controls/dragnDrop';
import { getConfig } from 'Application/Env';

// Нужно чтобы oldCss прилетал первым на страницу. Есть контролы (например itemsActions), стили которыйх
// Завязаны на порядок css.
import 'css!Controls/Application/oldCss';
import 'css!Controls/application';
import 'css!Controls/dragnDrop';
import 'css!Controls/CommonClasses';

/**
 * Корневой контрол для Wasaby-приложений. Служит для создания базовых html-страниц.
 * Подробнее читайте <a href='/doc/platform/developmentapl/interface-development/controls/controls-application/'>здесь</a>.
 *
 * @class Controls/Application
 * @extends UI/Base:Control
 *
 * @mixes Controls/interface:IApplication
 * @mixes UI/_base/interface/IHTML
 * @mixes Controls/_interface/IRUM
 *
 *
 * @public
 * @author Санников К.А.
 */

interface IBodyClassesField {
   scrollingClass: string;
   fromOptions: string;
   touchClass: string;
   hoverClass: string;
   dragClass: string;
   themeClass: string;
   bodyThemeClass: string;
   isAdaptiveClass: string;
}

interface IApplicationRegistrars {
   scroll?: RegisterClass;
   controlResize?: RegisterClass;
   mousedown?: RegisterClass;
   mousemove?: RegisterClass;
   mouseup?: RegisterClass;
   touchmove?: RegisterClass;
   touchend?: RegisterClass;
}

interface IHeadLinkConfig {
   force?: boolean;
   preload?: boolean;
   prefetch?: boolean;
}

interface IApplication extends IControlOptions{
   bodyClass?: string;
   title?: string;
   RUMEnabled?: boolean;
   pageName?: string;
   resourceRoot?: string;
   loadDataProviders?: boolean;
   isAdaptive?: boolean;

   popupHeaderTheme?: string;
   settingsController?: IPopupSettingsController;

   pagingVisible?: boolean;
   compat?: boolean;
}

/** Динамические классы для body */
const BODY_CLASSES = {
   /* eslint-disable */
   /**
    * @type {String} Property controls whether or not touch devices use momentum-based scrolling for innerscrollable areas.
    * @private
    */
   /* eslint-enable */
   scrollingClass: detection.isMobileIOS ? 'controls-Scroll_webkitOverflowScrollingTouch' : '',
   fromOptions: '',
   touchClass: '',
   hoverClass: '',
   dragClass: 'ws-is-no-drag',
   themeClass: '',
   bodyThemeClass: '',
   isAdaptiveClass: ''
};

export default class Application extends Control<IApplication> {
   RUMEnabled: boolean;
   pageName: string;
   resourceRoot: string;
   head: object;

   protected _template: TemplateFunction = template;
   protected _bodyClasses: IBodyClassesField = BODY_CLASSES;

   private _registers: IApplicationRegistrars;
   private _popupManager: PopupManager;
   private _globalPopup: PopupGlobalController;
   private _dragnDropController: DnDController;
   private _isPopupShow: boolean;
   private _isSuggestShow: boolean;
   private _touchController: TouchDetect;

   // start hooks
   protected _beforeMount(options: IApplication): void {
      this._checkDeprecatedOptions(options);

      const appData = AppData.getAppData();
      this.RUMEnabled = getConfig('RUMEnabled') || false;
      this.pageName = options.pageName || appData.pageName || '';
      this.resourceRoot = options.resourceRoot || constants.resourceRoot;

      // Чтобы при загрузке слоя совместимости, понять нужно ли грузить провайдеры(extensions, userInfo, rights),
      // положим опцию из Application в constants. Иначе придется использовать глобальную переменную.
      // TODO: Удалить этот код отсюда по задае:
      // https://online.sbis.ru/opendoc.html?guid=3ed5ebc1-0b55-41d5-a8fa-921ad24aeec3
      constants.loadDataProviders = options.loadDataProviders;

      if (constants.isBrowserPlatform) {
         /* eslint-disable */
         if (document.getElementsByClassName('head-custom-block').length > 0) {
            this.head = undefined;
         }
         /* eslint-enable */
      }
      this._initBodyClasses(options);
      this._updateTouchClass();
      this._updateThemeClass(options);
      this._updateFromOptionsClass(options);

      setSettingsController(options.settingsController);

      this._createDragnDropController();
      this._createGlobalPopup();
      this._createPopupManager(options);
      this._createRegisters();
      this._createTouchDetector();
   }
   protected _afterMount(options: IApplication): void {
      // Подписка через viewPort дает полную информацию про ресайз страницы, на мобильных устройствах
      // сообщает так же про изменение экрана после показа клавиатуры и/или зуме страницы.
      // Подписка на body стреляет не всегда. в 2100 включаю только для 13ios, в перспективе можно включить
      // везде, где есть visualViewport

      if (Application._isIOS13()) {
         window.visualViewport.addEventListener('resize', this._resizePage.bind(this));
         window.addEventListener('orientationchange', this._orientationChange);
      }
      window.addEventListener('resize', this._resizePage.bind(this))
      window.document.addEventListener('scroll', this._scrollPage.bind(this))
      window.document.addEventListener('keydown', (event) => {
         this._keyDownHandler(new SyntheticEvent<KeyboardEvent>(event))
      });
      const channelPopupManager = Bus.channel('popupManager');
      channelPopupManager.subscribe('managerPopupCreated', this._popupCreatedHandler, this);
      channelPopupManager.subscribe('managerPopupDestroyed', this._popupDestroyedHandler, this);
      channelPopupManager.subscribe('managerPopupBeforeDestroyed', this._popupBeforeDestroyedHandler, this);

      this._globalPopup.registerGlobalPopup();
      this._popupManager.init();

   }
   protected _beforeUpdate(options: IApplication): void {
      this._updateTouchClass();
      this._updateThemeClass(options);
      this._updateFromOptionsClass(options);
   }
   protected _afterUpdate(oldOptions: IApplication): void {
      /* eslint-disable */
      const elements = document.getElementsByClassName('head-title-tag');
      /* eslint-enable */
      if (elements.length === 1) {
         // Chrome на ios при вызове History.replaceState, устанавливает в title текущий http адрес.
         // Если после загрузки установить title, который уже был, то он не обновится, и в заголовке вкладки
         // останется http адрес. Поэтому сначала сбросим title, а затем положим туда нужное значение.
         if (detection.isMobileIOS && detection.chrome && oldOptions.title === this._options.title) {
            elements[0].textContent = '';
         }
         elements[0].textContent = this._options.title;
      }
      this._popupManager.updateOptions(this._options.popupHeaderTheme);
   }
   protected _beforeUnmount(): void {
      for (const register in this._registers) {
         if (this._registers.hasOwnProperty(register)) {
            this._registers[register].destroy();
         }
      }
      const channelPopupManager = Bus.channel('popupManager');
      channelPopupManager.unsubscribe('managerPopupCreated', this._popupCreatedHandler, this);
      channelPopupManager.unsubscribe('managerPopupDestroyed', this._popupDestroyedHandler, this);
      channelPopupManager.unsubscribe('managerPopupBeforeDestroyed', this._popupBeforeDestroyedHandler, this);

      this._globalPopup.registerGlobalPopupEmpty();
      this._popupManager.destroy();
      this._dragnDropController.destroy();
   }
   // end hooks

   // start Handlers
   protected _scrollPage(e: SyntheticEvent<Event>): void {
      this._registers.scroll.start(e);
      this._popupManager.eventHandler('pageScrolled', []);
   }
   protected _resizeBody(e: SyntheticEvent<Event>): void {
      if (!Application._isIOS13()) {
         this._resizePage(e);
      }
   }
   protected _resizePage(e: SyntheticEvent<Event>): void {
      this._registers.controlResize.start(e);
      this._popupManager.eventHandler('popupResizeOuter', []);
   }
   protected _mousedownPage(e: SyntheticEvent<Event>): void {
      this._registers.mousedown.start(e);
      this._popupManager.mouseDownHandler(e);
   }
   protected _mousemovePage(e: SyntheticEvent<Event>): void {
      this._registers.mousemove.start(e);
      this._updateTouchClass();
   }
   protected _mouseupPage(e: SyntheticEvent<Event>): void {
      this._registers.mouseup.start(e);
   }
   protected _touchmovePage(e: SyntheticEvent<Event>): void {
      this._registers.touchmove.start(e);
   }
   protected _touchendPage(e: SyntheticEvent<Event>): void {
      this._registers.touchend.start(e);
   }
   protected _mouseleavePage(e: SyntheticEvent<Event>): void {
      /* eslint-disable */
      /**
       * Перемещение элементов на странице происходит по событию mousemove. Браузер генерирует его исходя из
       * доступных ресурсов, и с дополнительными оптимизациями, чтобы не перегружать систему. Поэтому событие не происходит
       * на каждое попиксельное смещение мыши. Между двумя соседними событиями, мышь проходит некоторое расстояние.
       * Чем быстрее перемещается мышь, тем больше оно будет.
       * Событие не происход, когда мышь покидает граници экрана. Из-за этого, элементы не могут быть перемещены в плотную к ней.
       * В качестве решения, генерируем событие mousemove, на момент ухода мыши за граници экрана.
       * Демо: https://jsfiddle.net/q7rez3v5/
       */
      /* eslint-enable */
      this._registers.mousemove.start(e);
   }
   protected _touchStartPage(): void {
      this._updateTouchClass();
   }
   protected _keyPressHandler(event: SyntheticEvent<KeyboardEvent>): void {
      if (this._isPopupShow) {
         if (constants.browser.safari) {
            // Need to prevent default behaviour if popup is opened
            // because safari escapes fullscreen mode on 'ESC' pressed
            // TODO https://online.sbis.ru/opendoc.html?guid=5d3fdab0-6a25-41a1-8018-a68a034e14d9
            if (event.nativeEvent && event.nativeEvent.keyCode === 27) {
               event.preventDefault();
            }
         }
      }
   }
   protected _keyDownHandler(event: SyntheticEvent<KeyboardEvent>): void {
      dispatcherHandler(event);
   }
   protected _suggestStateChangedHandler(event: SyntheticEvent<Event>, state: boolean): void {
      this._isSuggestShow = state;
      this._updateScrollingClass();
   }
   private _dragStartHandler(): void {
      this._updateTouchClass({
         dragClass: 'ws-is-drag'
      });
   }
   private _dragEndHandler(): void {
      this._updateTouchClass({
         dragClass: 'ws-is-no-drag'
      });
   }
   /* end Handlers */

   /** Задаем классы для body, которые не будут меняться */
   private _initBodyClasses(cfg: IApplication): void {
      this._initIsAdaptiveClass(cfg);
      const BodyAPI = PageBody.getInstance();
      // Эти классы вешаются в двух местах. Разница в том, что BodyClasses всегда возвращает один и тот же класс,
      // а TouchDetector реагирует на изменение состояния.
      // Поэтому в Application оставим только класс от TouchDetector
      const bodyClasses = cBodyClasses()
          .replace('ws-is-touch', '')
          .replace('ws-is-no-touch', '')
          .split(' ')
          .concat(['zIndex-context'])
          .filter(Application._isExist);
      for (const key in this._bodyClasses) {
         if (this._bodyClasses.hasOwnProperty(key)) {
            if (Application._isExist(this._bodyClasses[key])) {
               this._bodyClasses[key]
                   .split(' ')
                   .forEach((_class) => bodyClasses.push(_class));
            }
         }
      }
      BodyAPI.addClass.apply(BodyAPI, bodyClasses);
   }
   private _initIsAdaptiveClass(cfg: IApplication): void {// TODO: toso
      if (cfg.isAdaptive) {
         PageHead.getInstance().createTag('meta', {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0, user-scalable=no'
         });
         this._bodyClasses.isAdaptiveClass = 'ws-is-adaptive';
      } else {
         this._bodyClasses.isAdaptiveClass = '';
      }
   }
   private _updateBodyClasses(updated?: Partial<IBodyClassesField>): void {
      const BodyAPI = PageBody.getInstance();
      const bodyClassesToUpdate = updated || this._bodyClasses;
      let classesToDelete = [];
      let classesToAdd = [];

      for (const key in bodyClassesToUpdate) {
         if (bodyClassesToUpdate.hasOwnProperty(key)) {
            if (bodyClassesToUpdate[key] === this._bodyClasses[key]) {
               continue;
            }
            classesToAdd = classesToAdd.concat(bodyClassesToUpdate[key].split(' ').filter(Application._isExist))
            classesToDelete = classesToDelete.concat(this._bodyClasses[key].split(' ').filter(Application._isExist))
            this._bodyClasses[key] = bodyClassesToUpdate[key];
         }
      }

      classesToDelete = classesToDelete.filter((value: string) => {
         return !classesToAdd.includes(value);
      });

      if (classesToAdd.length || classesToDelete.length) {
         BodyAPI.replaceClasses(classesToDelete || [], classesToAdd || []);
      }
   }
   private _updateFromOptionsClass(options: IApplication): void {
      this._updateBodyClasses({
         fromOptions: options.bodyClass || ''
      });
   }
   private _updateScrollingClass(): void {
      let scrollingClass;
      if (detection.isMobileIOS) {
         if (this._isPopupShow || this._isSuggestShow) {
            scrollingClass = 'controls-Scroll_webkitOverflowScrollingAuto';
         } else {
            scrollingClass = 'controls-Scroll_webkitOverflowScrollingTouch';
         }
      } else {
         scrollingClass = '';
      }

      this._updateBodyClasses({
         scrollingClass
      });
   }
   private _updateTouchClass(updated: Partial<IBodyClassesField> = {}): void {
      updated.touchClass = '';
      updated.hoverClass = '';

      // Данный метод вызывается до построения вёрстки, и при первой отрисовке еще нет _children (это нормально)
      // поэтому сами детектим touch с помощью compatibility
      if (this._touchController) {
         updated.touchClass = this._touchController.getClass();
      } else {
         updated.touchClass = compatibility.touch ? 'ws-is-touch' : 'ws-is-no-touch';
      }

      updated.hoverClass = this._isHover(updated.touchClass, updated.dragClass || this._bodyClasses.dragClass)
          ? 'ws-is-hover'
          : 'ws-is-no-hover';

      this._updateBodyClasses(updated);
   }
   private _updateThemeClass(options: IApplication): void {
      this._updateBodyClasses({
         themeClass: 'Application-body',
         bodyThemeClass: `controls_theme-${options.theme}`
      });
   }
   /** ************************************************** */

   private _checkDeprecatedOptions(opts: IApplication): void {
      /* eslint-disable */
      if (opts.compat) {
         IoC.resolve('ILogger').warn('Опция compat является устаревшей. Для вставки старых контролов внутри VDOM-ного окружения ' +
             'используйте один из способов, описанных в этой статье: https://wi.sbis.ru/doc/platform/developmentapl/ws3/compound-wasaby/');
      }
      /* eslint-enable */
   }
   // start Registrars
   private _createRegisters(): void {
      const registers = ['scroll', 'controlResize', 'mousemove', 'mouseup', 'touchmove', 'touchend', 'mousedown'];
      this._registers = {};
      registers.forEach((register) => {
         this._registers[register] = new RegisterClass({ register });
      });
   }
   protected _registerHandler(event, registerType, component, callback, config): void {
      if (this._registers[registerType]) {
         this._registers[registerType].register(event, registerType, component, callback, config);
         return;
      }
      this._dragnDropController.registerHandler(event, registerType, component, callback, config);
   }
   protected _unregisterHandler(event, registerType, component, config): void {
      if (this._registers[registerType]) {
         this._registers[registerType].unregister(event, registerType, component, config);
         return;
      }
      this._dragnDropController.unregisterHandler(event, registerType, component, config);
   }
   // end Registrar

   // start create helpers
   private _createGlobalPopup(): void {
      this._globalPopup = new PopupGlobalController();
   }
   private _createPopupManager(cfg): void {
      this._popupManager = new PopupManager(cfg);
   }
   private _createDragnDropController(): void {
      this._dragnDropController = new DnDController();
   }
   private _createTouchDetector(): void {
      this._touchController = TouchDetect.getInstance();
   }
   // end create helpers

   // start dragHandlers
   protected _documentDragStart(event, dragObject): void {
      this._dragnDropController.documentDragStart(dragObject);
      this._dragStartHandler();
   }
   protected _documentDragEnd(event, dragObject): void {
      this._dragnDropController.documentDragEnd(dragObject);
      this._dragEndHandler();
   }
   protected _updateDraggingTemplate(event, draggingTemplateOptions, draggingTemplate): void {
      this._dragnDropController.updateDraggingTemplate(draggingTemplateOptions, draggingTemplate);
   }
   protected _removeDraggingTemplate(): void {
      this._dragnDropController.removeDraggingTemplate();
   }
   // end dragHandlers

   // popupHandlers
   private _popupCreatedHandler(): void {
      this._isPopupShow = true;

      this._updateScrollingClass();
   }
   private _popupDestroyedHandler(event: SyntheticEvent<Event>,
                                  element: IPopupItem, popupItems: List<IPopupItem>): void {
      if (popupItems.getCount() === 0) {
         this._isPopupShow = false;
      }
      this._updateScrollingClass();
   }
   private _popupBeforeDestroyedHandler(event: SyntheticEvent<Event>, popupCfg: IPopupItem,
                                        popupList: List<IPopupItem>, popupContainer: HTMLElement): void {
      this._globalPopup.popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer);
   }

   protected _openInfoBoxHandler(event: SyntheticEvent<Event>, config): void {
      this._globalPopup.openInfoBoxHandler(event, config);
   }
   protected _openDialogHandler(event: SyntheticEvent<Event>, templ, templateOptions, opener): Promise<unknown> {
      return this._globalPopup.openDialogHandler(event, templ, templateOptions, opener);
   }
   protected _closeInfoBoxHandler(event: SyntheticEvent<Event>, delay: number): void {
      this._globalPopup.closeInfoBoxHandler(event, delay);
   }
   protected _forceCloseInfoBoxHandler(): void {
      this._globalPopup.forceCloseInfoBoxHandler();
   }
   protected _openPreviewerHandler(event, config, type): Promise<unknown> {
      return this._globalPopup.openPreviewerHandler(event, config, type);
   }
   protected  _cancelPreviewerHandler(event, action): void {
      this._globalPopup.cancelPreviewerHandler(event, action);
   }
   protected _isPreviewerOpenedHandler(event): boolean {
      return this._globalPopup.isPreviewerOpenedHandler(event);
   }
   protected _closePreviewerHandler(event, type): void {
      this._globalPopup.closePreviewerHandler(event, type);
   }
   protected _popupEventHandler(event, action): void {
      let args = Array.prototype.slice.call(arguments, 2);
      this._popupManager.eventHandler.apply(this._popupManager, [action, args]);
   }

   /**
    * Решения взято отсюда
    * https://stackoverflow.com/questions/62717621/white-space-at-page-bottom-after-device-rotation-in-ios-safari
    * @protected
    */
   protected _orientationChange(): void {
      document.documentElement.style.height = 'initial';
      setTimeout(() => {
         document.documentElement.style.height = '100%';
         setTimeout(() => {
            // this line prevents the content
            // from hiding behind the address bar
            window.scrollTo(0, 1);
         }, 500);
      }, 500);
   }

   private _getResourceUrl(str: string): string {
      return getResourceUrl(str);
   }

   private _isHover(touchClass: string, dragClass: string): boolean {
      return touchClass === 'ws-is-no-touch' && dragClass === 'ws-is-no-drag';
   }

   private static _isIOS13(): boolean {
      const oldIosVersion: number = 12;
      return detection.isMobileIOS && detection.IOSVersion > oldIosVersion;
   }

   private static _isExist(value: unknown): boolean {
      return !!value;
   }

   /**
    * Добавление ресурсов, которые необходимо вставить в head как <link rel="prefetch"/> или <link rel="preload"/>
    * @param modules
    * @param cfg настройки для ссылок
    *             {
    *                'prefetch': <boolean>,  // добавить prefetch-ссылку в head
    *                'preload': <boolean>  // добавить preload-ссылку в head
    *                'force': <boolean>  // по умолчанию ресурсы добавляются только на сервисе представления, но
    *                                    // с этим параметром можно на это повлиять
    *             }
    * @private
    */
   private static _addHeadLinks(modules: string[], cfg: IHeadLinkConfig = {}): void {
      if (!constants.isServerSide && !cfg.force) {
         return;
      }
      if (!modules || !modules.length) {
         return;
      }

      const pls = new PrefetchLinksStore();
      if (cfg.prefetch) {
         pls.addPrefetchModules(modules);
      } else {
         pls.addPreloadModules(modules);
      }
   }

   /**
    * Добавление ресурсов, которые необходимо вставить в head как <link rel="prefetch"/>
    * По умолчанию ресурсы добавляются только на сервисе представления
    * @param modules
    * @param force
    * @public
    */
   static addPrefetchModules(modules: string[], force: boolean): void {
      Application._addHeadLinks(modules, { prefetch: true, force: !!force });
   }

   /**
    * Добавление ресурсов, которые необходимо вставить в head как <link rel="preload"/>
    * По умолчанию ресурсы добавляются только на сервисе представления
    * @param modules
    * @param force
    * @public
    */
   static addPreloadModules(modules: string[], force: boolean): void {
      Application._addHeadLinks(modules, { preload: true, force: !!force });
   }

   static getDefaultOptions(): object {
      return {
         title: '',
         pagingVisible: false
      };
   }
}

Object.defineProperty(Application, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Application.getDefaultOptions();
   }
});
