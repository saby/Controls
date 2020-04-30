import scheduleCallbackAfterRedraw from 'Controls/Utils/scheduleCallbackAfterRedraw';

/**
 * Завершить редактирование и сохранить изменения после следующего обновления.
 * @remark
 * Решает проблему обработки устаревших данных в дочернем контроле:
 * Например, если у поля ввода установлена опция trim = 'true', то при завершении редактирования будет обработано значение с пробелами,
 * т.к. последовательно произойдет измененние значения поля ввода -> завершение редактирования -> обновление значения в поле ввода.
 */
function editAfterRedraw(self, callback): void {
    scheduleCallbackAfterRedraw(self, callback);
    self._forceUpdate();
}

export default editAfterRedraw;
