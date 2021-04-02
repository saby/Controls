import {detection} from 'Env/Env';
import {IInputData} from 'Controls/_input/Base/InputUtil';

/**
 * Класс для исправления бага появившегося в сафари 14.5
 * При повторном вводе данных(после удаления предыдущего) у инпута появляется отступ снизу.
 * Баг фиксится любым изменением стилей.
 */
export default class HeightAfterInput {

    inputHandler(field: HTMLInputElement, {oldValue, newValue}: IInputData): void {
        if (detection.isMobileSafari && newValue && !oldValue) {
            const currentTransform = field.style.transform;
            if (currentTransform) {
                field.style.transform = '';
            } else {
                field.style.transform = 'translateZ(0)';
            }
        }
    }
}
