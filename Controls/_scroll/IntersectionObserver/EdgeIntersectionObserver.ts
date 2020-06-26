import {Control} from 'UI/Base';
import SyntheticEntry from './SyntheticEntry';

export default class EdgeIntersectionObserver {
    private _component: Control;
    private _topTriggerElement: HTMLElement;
    private _bottomTriggerElement: HTMLElement;
    private _handler: Function;

    constructor(component: Control, handler: Function, topTriggerElement: HTMLElement, bottomTriggerElement: HTMLElement) {
        this._component = component;
        this._handler = handler;
        this._topTriggerElement = topTriggerElement;
        this._bottomTriggerElement = bottomTriggerElement;
        this._observe('top');
        this._observe('bottom');
    }

    private _observe(position): void {
        if (this[`_${position}TriggerElement`]) {
            this._component._notify(
                'intersectionObserverRegister',
                [{
                    instId: `${this._component.getInstanceId()}-${position}`,
                    element: this[`_${position}TriggerElement`],
                    threshold: [0, 1],
                    handler: this._observeHandler.bind(this)
                }],
                {bubbling: true});
        }
    }
    private _unobserve(position): void {
        this._component._notify('intersectionObserverUnregister', [`${this._component.getInstanceId()}-${position}`], {bubbling: true});
    }

    protected _observeHandler(item: SyntheticEntry): void {
        let eventName = '';
        eventName += item.nativeEntry.target === this._topTriggerElement ? 'top' : 'bottom';
        eventName += item.nativeEntry.isIntersecting ? 'In' : 'Out';

        this._handler(eventName);
    }

    destroy(): void {
        this._unobserve('top');
        this._unobserve('bottom');
        this._component = null;
        this._topTriggerElement = null;
        this._bottomTriggerElement = null;
        this._handler = null;
    }
}
