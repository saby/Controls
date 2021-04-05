import {detection} from 'Env/Env';
import {IInputData} from 'Controls/_input/Base/InputUtil';

/**
 * Класс для исправления бага появившегося в сафари 14.5
 * При повторном вводе данных(после удаления предыдущего) у инпута появляется отступ снизу.
 * Баг фиксится любым изменением стилей.
 * https://online.sbis.ru/opendoc.html?guid=739d9f1d-1e48-4637-a934-76f8c9f79009
 * https://bugs.webkit.org/show_bug.cgi?id=224052
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
