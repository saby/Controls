/**
 * Модуль, в котором реализована функция <b>getTextWidth(parent, child)</b>.
 * Высчитывает ширину переданного текста в пикселях.
 * Высчитывает по базовым на странице шрифту и размеру, то есть без довеска каких-либо классов.
 * 
 * @remark
 * Параметры функции:
 * 
 * * {String} text Переданный текст
 *
 * Возвращает:
 * 
 * * {Number} Ширина переданного текста в пикселях.
 *
 * @example
 * <pre class="brush: js">
 * helpers.getTextWidth("helloWorld");
 * </pre>
 *
 * @class Controls/Utils/getTextWidth
 * @public
 * @author Мальцев А.А.
 */

export function getTextWidth(text: string, fontSize: number, isPureText: boolean): number {
    const hiddenStyle = 'left:-10000px;top:-10000px;height:auto;width:auto;position:absolute;' + (fontSize ? ('font-size: ' + fontSize + ';') : '');
    const clone: HTMLDivElement = document.createElement('div');

    // устанавливаем стили у клона, дабы он не мозолил глаз.
    // Учитываем, что IE не позволяет напрямую устанавливать значение аттрибута style
    document.all ? clone.style.setAttribute('cssText', hiddenStyle) : clone.setAttribute('style', hiddenStyle);

    if (isPureText) {
        clone.innerText = text;
    } else {
        clone.innerHTML = text;
    }

    document.body.appendChild(clone);

    // var rect = {width:clone.clientWidth,height:clone.clientHeight,text:clone.innerHTML};
    const rect = clone.clientWidth;
    document.body.removeChild(clone);

    return rect;
}
