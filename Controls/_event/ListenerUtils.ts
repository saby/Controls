import {Control} from 'UI/Base';
import {IListenerOptions} from './Listener';

export function register(instance: Control, event: String, callback: Function, config?: IListenerOptions) {
    instance._notify('register', [event, instance, callback, config], {bubbling: true});
}

export function unregister(instance: Control, event: String, config?: IListenerOptions) {
    instance._notify('unregister', [event, instance, config], {bubbling: true});
}
