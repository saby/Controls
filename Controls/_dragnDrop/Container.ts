import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor} from 'Types/entity';
import Env = require('Env/Env');

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_dragnDrop/Container/Container';

/**
 * @interface Controls/_dragnDrop/Container/IContainerOptions
 * @public
 * @author Красильников А.С.
 */
interface IContainerOptions extends IControlOptions {
    resetTextSelection: boolean;
    draggingTemplateOffset: number;
    /**
     * @name Controls/_dragnDrop/Container/IContainerOptions#draggingTemplate
     * @cfg {Function} Шаблон перемещаемого объекта.
     * @remark В процессе перемещения, рядом с курсором отображается миниатюра перемещаемого объекта, для отображения которой используется отдельный шаблон.
     * @example
     * В следующем примере показано, как настроить шаблон перемещения.
     * <pre>
     *    <Controls.dragnDrop:Container>
     *       <ws:draggingTemplate>
     *          <div class="demo-DraggingTemplate">CustomDraggingTemplate</div>
     *       </ws:draggingTemplate>
     *       <ws:content>
     *          <div>
     *             <ws:for data="item in _items">
     *                <ws:partial template="wml!MyModule/ItemTemplate" item="{{item}}" on:mousedown="_startDragNDrop(item)"/>
     *             </ws:for>
     *          </div>
     *       </ws:content>
     *    </Controls.dragnDrop:Container>
     * </pre>
     *
     * <pre>
     *    Control.extend({
     *       ...
     *     _items: [...]
     *       ...
     *    });
     * </pre>
     */
    draggingTemplate: TemplateFunction;
}

/**
 * @typedef {Object} IStartDragOptions
 * @description Start dragNDrop options.
 * @property {Boolean} immediately Определяет момент начала перемещения.
 * @remark
 * * false - Перемещение начинается после перемещения мыши на 4px по горизонтали или вертикали.
 * * true - Перемещение начинается сразу.
 */
interface IStartDragOptions {
    immediately: boolean;
}

interface ICords {
    x: number;
    y: number;
}

/**
 * @typedef {Object} IDragObject
 * @property {MouseEvent} domEvent Дескриптор события.
 * @property {Object} position Координаты указателя.
 * @property {Object} offset Смещение от начальной позиции посредством drag'n'drop.
 */
export interface IDragObject<T = object> {
    domEvent: MouseEvent;
    position: ICords;
    offset: ICords;
    entity: T;
    draggingTemplateOffset: number;
}

/**
 * Контейнер, который отслеживает события мыши и генерирует события перемещения.
 * Контрол-контейнер должен быть встроен в {@link Controls/dragnDrop:Controller}.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/tools/drag-n-drop/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dragnDrop.less переменные тем оформления}
 *
 * @class Controls/_dragnDrop/Container
 * @extends UI/Base:Control
 *
 * @mixes Controls/_dragnDrop/Container/IContainerOptions
 *
 * @public
 * @author Красильников А.С.
 */
class Container extends Control<IContainerOptions> {
    /**
     * Хранит список перетаскиваемых элементов и ключ элемента, за который потащили (draggedKey)
     */
    private _dragEntity: object = null;
    private _startEvent: MouseEvent = null;
    private _currentEvent: MouseEvent = null;
    private _startImmediately: boolean = null;
    private _documentDragging: boolean = false;
    private _insideDragging: boolean = false;
    private _endDragNDropTimer: number = null;
    private _draggedKey: string = null;

    protected _template: TemplateFunction = template;

    private _registerMouseMove(): void {
        this._notify('register', ['mousemove', this, this._onMouseMove], {bubbling: true});
        this._notify('register', ['touchmove', this, this._onTouchMove], {bubbling: true});
    }

    private _unregisterMouseMove(): void {
        this._notify('unregister', ['mousemove', this], {bubbling: true});
        this._notify('unregister', ['touchmove', this], {bubbling: true});
    }

    private _registerMouseUp(): void {
        this._notify('register', ['mouseup', this, this._onMouseUp], {bubbling: true});
        this._notify('register', ['touchend', this, this._onMouseUp], {bubbling: true});
    }

    private _unregisterMouseUp(): void {
        this._notify('unregister', ['mouseup', this], {bubbling: true});
        this._notify('unregister', ['touchend', this], {bubbling: true});
    }

    private _onMouseMove(event: SyntheticEvent<MouseEvent>): void {
        /**
         * В яндекс браузере каким то образом пришел nativeEvent === null, после чего
         * упала ошибка в коде ниже и страница стала некликабельной. Повторить ошибку не получилось
         * добавляем защиту на всякий случай.
         */
        if (event.nativeEvent) {
            if (Env.detection.isIE) {
                this._onMouseMoveIEFix(event);
            } else {
                // Check if the button is pressed while moving.
                if (!event.nativeEvent.buttons) {
                    this._dragNDropEnded(event);
                }
            }

            // Не надо вызывать onMove если не нажата кнопка мыши.
            // Кнопка мыши может быть не нажата в 2 случаях:
            // 1) Мышь увели за пределы браузера, там отпустили и вернули в браузер
            // 2) Баг IE, который подробнее описан в методе _onMouseMoveIEFix
            if (event.nativeEvent.buttons) {
                this._onMove(event.nativeEvent);
            }
        }
    }

    private _onMouseMoveIEFix(event: SyntheticEvent<MouseEvent>): void {
        /**
         * In IE strange bug, the cause of which could not be found. During redrawing of the table the MouseMove
         * event at which buttons = 0 shoots. In 10 milliseconds we will check that the button is not pressed.
         */
        if (!event.nativeEvent.buttons && !this._endDragNDropTimer) {
            this._endDragNDropTimer = setTimeout(() => {
                this._dragNDropEnded(event);
            }, Container.IE_MOUSEMOVE_FIX_DELAY);
        } else {
            clearTimeout(this._endDragNDropTimer);
            this._endDragNDropTimer = null;
        }
    }

    private _onTouchMove(event: SyntheticEvent<TouchEvent>): void {
        this._onMove(event.nativeEvent);
    }

    private _onMouseUp(event: SyntheticEvent<MouseEvent>): void {
        if (this._startEvent) {
            this._dragNDropEnded(event);
        }
    }

    private _onMove(nativeEvent: MouseEvent): void {
        if (this._startEvent) {
            const dragObject: IDragObject = this._getDragObject(nativeEvent, this._startEvent);
            const dragStarted: boolean = Container._isDragStarted(this._startEvent, nativeEvent, this._startImmediately);
            if (!this._documentDragging && dragStarted) {
                this._insideDragging = true;
                this._notify('_documentDragStart', [dragObject], {bubbling: true});
            }
            if (this._documentDragging) {
                this._currentEvent = nativeEvent;
                this._notify('dragMove', [dragObject]);
                if (this._options.draggingTemplate) {
                    this._notify('_updateDraggingTemplate', [dragObject, this._options.draggingTemplate], {bubbling: true});
                }
            }
        }
    }

    private _documentDragStart(dragObject: IDragObject): void {
        if (this._insideDragging) {
            this._notify('dragStart', [dragObject, this._draggedKey]);
        } else {
            this._dragEntity = dragObject.entity;
        }
        this._documentDragging = true;
        this._notify('documentDragStart', [dragObject]);
    }

    private _documentDragEnd(dragObject: IDragObject): void {
        if (this._insideDragging) {
            this._notify('dragEnd', [dragObject]);
        }

        this._insideDragging = false;
        this._documentDragging = false;
        this._notify('documentDragEnd', [dragObject]);
    }

    private _getDragObject(mouseEvent: MouseEvent, startEvent: SyntheticEvent<MouseEvent>): IDragObject {
        const dragObject: IDragObject = {
            entity: this._dragEntity,
            domEvent: null,
            position: null,
            offset: null,
            draggingTemplateOffset: null
        };
        if (mouseEvent && startEvent) {
            dragObject.domEvent = mouseEvent;
            dragObject.position = Container._getPageXY(mouseEvent);
            dragObject.offset = Container._getDragOffset(mouseEvent, startEvent);
            dragObject.draggingTemplateOffset = this._options.draggingTemplateOffset;
        }
        return dragObject;
    }

    private _dragNDropEnded(event: SyntheticEvent<MouseEvent>): void {
        if (this._documentDragging) {
            const args = [this._getDragObject(event.nativeEvent, this._startEvent)];
            this._notify('_documentDragEnd', args, {bubbling: true});
        }
        if (this._startEvent && this._startEvent.target) {
            this._startEvent.target.classList.remove('controls-DragNDrop__dragTarget');
        }
        this._unregisterMouseMove();
        this._unregisterMouseUp();
        this._dragEntity = null;
        this._startEvent = null;
        this._currentEvent = null;
    }

    protected _afterMount(options?: IContainerOptions, contexts?: any): void {
        super._afterMount(options, contexts);

        this._notify('register', ['documentDragStart', this, this._documentDragStart], {bubbling: true});
        this._notify('register', ['documentDragEnd', this, this._documentDragEnd], {bubbling: true});
    }

    protected _beforeUnmount(): void {
        super._beforeUnmount();

        /**
         * Когда контрол находится в режиме перемещения, и его уничтожили, тогда нужно завершенить перемещение.
         * Это делается по событию mouseup. Вызовем обработчик этого события.
         */
        const event: MouseEvent = this._startEvent || this._currentEvent;
        if (event) {
            this._onMouseUp(new SyntheticEvent<MouseEvent>(event));
        }
        this._notify('unregister', ['documentDragStart', this], {bubbling: true});
        this._notify('unregister', ['documentDragEnd', this], {bubbling: true});
    }

    protected _mouseEnter(event: SyntheticEvent<MouseEvent>): void {
        if (this._documentDragging) {
            this._insideDragging = true;
            this._notify('dragEnter', [this._getDragObject()]);
        }
    }

    protected _mouseLeave(event: SyntheticEvent<MouseEvent>): void {
        /**
         * Если было инициализировано перемещение, но оно ещё не началось, и мышь покинула свой контейнер,
         * то начинаем перемещение сразу, не дожидаясь минимального смещения мыши.
         */
        if (this._dragEntity && !this._documentDragging) {
            this._startImmediately = true;
            this._onMove(event.nativeEvent);
        }
        if (this._documentDragging) {
            this._insideDragging = false;
            this._notify('dragLeave', [this._getDragObject()]);
        }
    }

    /**
     * Метод для запуска процесса перемещения.
     * @public
     * @param {Controls/_dragnDrop/Entity} entity Объект перемещения.
     * @param {Vdom/Vdom:SyntheticEvent} mouseDownEvent Дескриптор события.
     * @param {IStartDragOptions} options настройки перемещения.
     * @param {String} draggedKey ключ перемещения.
     * @example
     * В следующем примере показано, как запустить dragNDrop.
     * <pre>
     *    <Controls.dragnDrop:Container name="dragNDropController">
     *       <ws:draggingTemplate>
     *          <div class="demo-DraggingTemplate">CustomDraggingTemplate</div>
     *       </ws:draggingTemplate>
     *       <ws:content>
     *          <div>
     *             <ws:for data="item in _items">
     *                <ws:partial template="wml!MyModule/ItemTemplate" item="{{item}}" on:mousedown="_startDragNDrop(item)"/>
     *             </ws:for>
     *          </div>
     *       </ws:content>
     *    </Controls.dragnDrop:Container>
     * </pre>
     *
     * <pre>
     *    Control.extend({
     *       ...
     *       _items: [...],
     *       _startDragNDrop: function(event, item) {
     *          this._children.dragNDropController.startDragNDrop(new Entity({
     *             item: item
     *          }), event);
     *       },
     *       ...
     *    });
     * </pre>
     */
    startDragNDrop(
        entity: object, mouseDownEvent: SyntheticEvent<MouseEvent>,
        options: IStartDragOptions = {immediately: false}, draggedKey?: string
    ): void {
        if ((mouseDownEvent.target as HTMLElement).closest('.controls-DragNDrop__notDraggable')) {
            return;
        }

        this._dragEntity = entity;
        this._draggedKey = draggedKey;
        this._startEvent = mouseDownEvent.nativeEvent;
        this._startImmediately = options.immediately;

        if (this._options.resetTextSelection) {
            Container._clearSelection(this._startEvent);
        }

        const target: Element = this._startEvent.target as Element;
        if (this._startEvent && target) {
            target.classList.add('controls-DragNDrop__dragTarget');
        }

        this._registerMouseMove();
        this._registerMouseUp();
    }

    private static SHIFT_LIMIT: number = 4;
    private static IE_MOUSEMOVE_FIX_DELAY: number = 50;

    static _styles: string[] = ['Controls/dragnDrop'];

    private static _getPageXY(event: MouseEvent | TouchEvent): ICords {
        if (event.type === 'touchstart' || event.type === 'touchmove') {
            const touchEvent = event as TouchEvent;
            return {
                x: touchEvent.touches[0].pageX,
                y: touchEvent.touches[0].pageY
            };
        } else if (event.type === 'touchend') {
            const touchEvent = event as TouchEvent;
            return {
                x: touchEvent.changedTouches[0].pageX,
                y: touchEvent.changedTouches[0].pageY
            };
        } else {
            const mouseEvent = event as MouseEvent;
            return {
                x: mouseEvent.pageX,
                y: mouseEvent.pageY
            };
        }
    }

    private static _isDragStarted(startEvent: MouseEvent, moveEvent: MouseEvent, immediately: boolean): boolean {
        if (immediately) {
            return true;
        }

        const offset: ICords = Container._getDragOffset(moveEvent, startEvent);
        return Math.abs(offset.x) > Container.SHIFT_LIMIT || Math.abs(offset.y) > Container.SHIFT_LIMIT;
    }

    private static _getSelection(): Selection {
        return window.getSelection();
    }

    private static _clearSelection(event: MouseEvent): void {
        if (event.type === 'mousedown') {
            /**
             * Снимаем выделение с текста иначе не будут работать клики а выделение не будет сниматься по клику из за preventDefault
             */
            const selection = Container._getSelection();
            if (selection.removeAllRanges) {
                selection.removeAllRanges();
            } else if (selection.empty) {
                selection.empty();
            }
        }
    }

    private static _getDragOffset(moveEvent: MouseEvent, startEvent: MouseEvent): ICords {
        const moveEventXY = Container._getPageXY(moveEvent);
        const startEventXY = Container._getPageXY(startEvent);

        return {
            y: moveEventXY.y - startEventXY.y,
            x: moveEventXY.x - startEventXY.x
        };
    }

    static getDefaultOptions(): Partial<IContainerOptions> {
        return {
            draggingTemplateOffset: 10,
            resetTextSelection: true
        };
    }

    static getOptionTypes(): object {
        return {
            /**
             * resetTextSelection = false используется только в scrollContainer
             */
            resetTextSelection: descriptor(Boolean),
            draggingTemplateOffset: descriptor(Number)
        };
    }
}

/**
 * @event Происходит при начале перемещения объекта на странице.
 * @name Controls/_dragnDrop/Container#documentDragStart
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {dragObject} dragObject Объект, в котором содержится информация о текущем состоянии Drag'n'drop.
 * @remark Событие срабатывает на всех контроллерах на странице, включая контроллер, в котором началось перемещение.
 * @example
 * В следующем примере показано, как изменить визуальное состояние контрола при запуске перетаскивания в другом контроле.
 * <pre>
 *     <Controls.dragnDrop:Container name="dragNDropController">
 *        <ws:draggingTemplate>
 *          <div class="demo-DraggingTemplate">CustomDraggingTemplate</div>
 *        </ws:draggingTemplate>
 *        <ws:content>
 *          <div>
 *             <ws:for data="item in _items">
 *                <ws:partial template="wml!MyModule/ItemTemplate" item="{{item}}" on:mousedown="_startDragNDrop(item)"/>
 *             </ws:for>
 *          </div>
 *        </ws:content>
 *     </Controls.dragnDrop:Container>
 *     <Controls.dragnDrop:Container on:documentDragStart="_documentDragStart()">
 *        <div class="demo-Basket {{_documentDrag ? 'demo-Basket_withDragStyle'}}"></div>
 *     </Controls.dragnDrop:Container>
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _items: [...],
 *       _documentDrag: false,
 *       _documentDragStart: function(event, dragObject) {
 *          this._documentDrag = true;
 *       },
 *       _startDragNDrop: function(event, item) {
 *          this._children.dragNDropController.startDragNDrop(new Entity({
 *             item: item
 *          }), event);
 *       },
 *       ...
 *    });
 * </pre>
 * @see documentDragEnd
 * @see dragStart
 * @see dragEnd
 */


/**
 * @event Происходит при завершении перемещения объекта на странице.
 * @name Controls/_dragnDrop/Container#documentDragEnd
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {dragObject} dragObject Объект, в котором содержится информация о текущем состоянии Drag'n'drop.
 * @remark Событие срабатывает на всех контроллерах на странице, включая контроллер, на котором закончилось перемещение.
 * @example
 * В следующем примере показано, как изменить визуальное состояние контрола при завершении перетаскивания в другом контроле.
 * <pre>
 *     <Controls.dragnDrop:Container name="dragNDropController">
 *        <ws:draggingTemplate>
 *          <div class="demo-DraggingTemplate">CustomDraggingTemplate</div>
 *        </ws:draggingTemplate>
 *        <ws:content>
 *           <div>
 *              <ws:for data="item in _items">
 *                 <ws:partial template="wml!MyModule/ItemTemplate" item="{{item}}" on:mousedown="_startDragNDrop(item)"/>
 *              </ws:for>
 *           </div>
 *        </ws:content>
 *     </Controls.dragnDrop:Container>
 *     <Controls.dragnDrop:Container on:documentDragStart="_documentDragStart()" on:documentDragEnd="_documentDragEnd()">
 *        <div class="demo-Basket {{_documentDrag ? 'demo-Basket_withDragStyle'}}"></div>
 *     </Controls.dragnDrop:Container>
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _items: [...],
 *       _documentDrag: false,
 *       _documentDragStart: function(event, dragObject) {
 *          this._documentDrag = true;
 *       },
 *       _documentDragEnd: function(event, dragObject) {
 *          this._documentDrag = false;
 *       },
 *       _startDragNDrop: function(event, item) {
 *          this._children.dragNDropController.startDragNDrop(new Entity({
 *             item: item
 *          }), event);
 *       },
 *       ...
 *    });
 * </pre>
 * @see documentDragStart
 * @see dragStart
 * @see dragEnd
 */


/**
 * @event Происходит, когда пользователь начинает перемещение объект в текущем контроллере.
 * @name Controls/_dragnDrop/Container#dragStart
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {dragObject} dragObject Объект, в котором содержится информация о текущем состоянии Drag'n'drop.
 * @remark Событие срабатывает только на контроллере, где началось перемещение.
 * @example
 * В следующем примере показано, как скрыть подвижный объект.
 * <pre>
 *     <Controls.dragnDrop:Container name="dragNDropController" on:dragStart="_onDragStart()">
 *        <ws:draggingTemplate>
 *           <div class="demo-DraggingTemplate">CustomDraggingTemplate</div>
 *        </ws:draggingTemplate>
 *        <ws:content>
 *           <div>
 *              <ws:for data="item in _items">
 *                 <ws:if data="{{item.key !== _dragItemKey }}">
 *                    <ws:partial template="wml!MyModule/ItemTemplate" item="{{item}}" on:mousedown="_startDragNDrop(item)"/>
 *                 </ws:if>
 *              </ws:for>
 *           </div>
 *        </ws:content>
 *     </Controls.dragnDrop:Container>
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _items: [...],
 *       _dragItemKey: null,
 *       _onDragStart: function(event, dragObject) {
 *          this._dragItemKey = dragObject.entity._options.item.getId();
 *       },
 *       _startDragNDrop: function(event, item) {
 *          this._children.dragNDropController.startDragNDrop(new Entity({
 *             item: item
 *          }), event);
 *       },
 *       ...
 *    });
 * </pre>
 * @see documentDragStart
 * @see documentDragEnd
 * @see dragEnd
 */


/**
 * @event Происходит после того, как пользователь закончил перемещение объекта в текущем контроллере.
 * @name Controls/_dragnDrop/Container#dragEnd
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {dragObject} dragObject Объект, в котором содержится информация о текущем состоянии Drag'n'drop.
 * @remark Событие срабатывает только на контроллере, где завершилось перетаскивание.
 * @example
 * В следующем примере показано, как обновить объект в источнике после завершения перемещения.
 * <pre>
 *     <Controls.dragnDrop:Container name="dragNDropController" on:dragEnd="_onDragEnd()">
 *        <ws:draggingTemplate>
 *            <div class="demo-DraggingTemplate">CustomDraggingTemplate</div>
 *        </ws:draggingTemplate>
 *        <ws:content>
 *            <div>
 *                <ws:for data="item in _items">
 *                    <ws:partial template="wml!MyModule/ItemTemplate" item="{{item}}" on:mousedown="_startDragNDrop(item)"/>
 *                </ws:for>
 *            </div>
 *        </ws:content>
 *     </Controls.dragnDrop:Container>
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _items: [...],
 *       _onDragEnd: function(event, dragObject) {
 *          var dragItem = dragObject.entity._options.item;
 *          dragItem.set('position', dragObject.position);
 *          this._itemsSource.update(dragItem);
 *       },
 *       _startDragNDrop: function(event, item) {
 *          this._children.dragNDropController.startDragNDrop(new Entity({
 *             item: item
 *          }), event);
 *       },
 *       ...
 *    });
 * </pre>
 * @see documentDragStart
 * @see documentDragEnd
 * @see dragStart
 */


/**
 * @event Происходит после перемещения объекта внутри контроллера.
 * @name Controls/_dragnDrop/Container#dragEnter
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {dragObject} dragObject Объект, в котором содержится информация о текущем состоянии Drag'n'drop.
 * @example
 * В следующем примере показано, как изменить визуальное состояние контрола при наведении на него курсора.
 * <pre>
 *     <Controls.dragnDrop:Container name="dragNDropController">
 *        <ws:draggingTemplate>
 *           <div class="demo-DraggingTemplate">CustomDraggingTemplate</div>
 *        </ws:draggingTemplate>
 *        <ws:content>
 *           <div>
 *              <ws:for data="item in _items">
 *                 <ws:partial template="wml!MyModule/ItemTemplate" item="{{item}}" on:mousedown="_startDragNDrop(item)"/>
 *              </ws:for>
 *           </div>
 *        </ws:content>
 *     </Controls.dragnDrop:Container>
 *     <Controls.dragnDrop:Container on:dragEnter="_dragEnter()" on:dragLeave="_dragLeave()">
 *        <div class="demo-Basket {{_dragInsideBasket ? 'demo-Basket_dragInside'}}"></div>
 *     </Controls.dragnDrop:Container>
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _items: [...],
 *       _documentDrag: false,
 *       _dragEnter: function(event, dragObject) {
 *          this._dragInsideBasket = true;
 *       },
 *       _dragLeave: function(event, dragObject) {
 *          this._dragInsideBasket = false;
 *       },
 *       _startDragNDrop: function(event, item) {
 *          this._children.dragNDropController.startDragNDrop(new Entity({
 *             item: item
 *          }), event);
 *       },
 *       ...
 *    });
 * </pre>
 * @see dragLeave
 * @see dragMove
 */


/**
 * @event Происходит после перемещения объекта за пределы контроллера.
 * @name Controls/_dragnDrop/Container#dragLeave
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {dragObject} dragObject Объект, в котором содержится информация о текущем состоянии Drag'n'drop.
 * @example
 * В следующем примере показано, как изменить визуальное состояние контрола при наведении на него курсора.
 * <pre>
 *     <Controls.dragnDrop:Container name="dragNDropController">
 *        <ws:draggingTemplate>
 *           <div class="demo-DraggingTemplate">CustomDraggingTemplate</div>
 *        </ws:draggingTemplate>
 *        <ws:content>
 *           <div>
 *              <ws:for data="item in _items">
 *                 <ws:partial template="wml!MyModule/ItemTemplate" item="{{item}}" on:mousedown="_startDragNDrop(item)"/>
 *              </ws:for>
 *           </div>
 *        </ws:content>
 *     </Controls.dragnDrop:Container>
 *     <Controls.dragnDrop:Container on:dragEnter="_dragEnter()" on:dragLeave="_dragLeave()">
 *        <div class="demo-Basket {{_dragInsideBasket ? 'demo-Basket_dragInside'}}"></div>
 *     </Controls.dragnDrop:Container>
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _items: [...],
 *       _documentDrag: false,
 *       _dragEnter: function(event, dragObject) {
 *          this._dragInsideBasket = true;
 *       },
 *       _dragLeave: function(event, dragObject) {
 *          this._dragInsideBasket = false;
 *       },
 *       _startDragNDrop: function(event, item) {
 *          this._children.dragNDropController.startDragNDrop(new Entity({
 *             item: item
 *          }), event);
 *       },
 *       ...
 *    });
 * </pre>
 * @see dragEnter
 * @see dragMove
 */


/**
 * @event Происходит при перемещении объекта на странице.
 * @name Controls/_dragnDrop/Container#dragMove
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {dragObject} dragObject Объект, в котором содержится информация о текущем состоянии Drag'n'drop.
 * @remark Событие срабатывает только на контроллере, где началось перемещение. Событие срабатывает каждый раз, когда на странице происходит событие mousemove(touchmove).
 * @example
 * В следующем примере показано, как изменить положение объекта на странице при перемещении.
 * <pre>
 *     <Controls.dragnDrop:Container name="dragNDropController" on:dragMove="_dragMove()">
 *        <ws:content>
 *           <div>
 *              <ws:for data="item in _items">
 *                 <ws:partial style="{{_dragItemStyle}}" template="wml!MyModule/ItemTemplate" item="{{item}}" on:mousedown="_startDragNDrop(item)"/>
 *              </ws:for>
 *           </div>
 *        </ws:content>
 *     </Controls.dragnDrop:Container>
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _items: [...],
 *       _dragMove: function(event, dragObject) {
 *          this._dragItemStyle = this._objectToString({
 *             top: dragObject.position.y + 'px',
 *             left: dragObject.position.x + 'px',
 *             position: 'absolute'
 *          });
 *       },
 *       _objectToString: function() {...},
 *       _startDragNDrop: function(event, item) {
 *          this._children.dragNDropController.startDragNDrop(new Entity({
 *             item: item
 *          }), event);
 *       },
 *       ...
 *    });
 * </pre>
 * @see dragEnter
 * @see dragLeave
 */

export default Container;
