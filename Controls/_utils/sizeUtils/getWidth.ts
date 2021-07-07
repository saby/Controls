const position: string = `display: inline;
   top: 0;
   left: -9999px;
   position: absolute;
   white-space: nowrap;
   //Вроде самый безопасный способ вынести элемент на отдельный слой
   backface-visibility: hidden;`;

export function getWidth(element: HTMLElement | string): number {
    const measurer = document.createElement('div');
    let width: number;
    measurer.setAttribute('style', position);

    if (typeof element === 'string') {
        measurer.innerHTML = element;
    } else {
        measurer.appendChild(element);
    }
    document.body.appendChild(measurer);

    // clientWidth width returns integer, but real width is fractional
    width = measurer.getBoundingClientRect().width;

    //Откладываем удаление элемента, чтобы не пересчитвывать лишний раз DOM и быстрее отобразить страницу
    setTimeout(() => {
        document && document.body.removeChild(measurer);
    });
    return width;
}
