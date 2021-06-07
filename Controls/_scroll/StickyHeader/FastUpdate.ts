/**
 * Класс с помощью которого компонуем считывание размеров с фиксированных заголовков. Перед считыванием размеров,
 * сбрасываем position: sticky если это нужно. Затем производим измерения. Возвращаем position: sticky.
 * После этого мы можем синхронно применить изменния к дом дереву чтобы не было скачков.
 * Решеаем следующие проблемы.
 * 1. В таблицах может находиться несколько групп с заголовками. Каждая группа при инициализации определяет положение
 * ячеек относительно себя. В этот момент скрол контейнер может быть проскролен. По этому приходится сбрасывать
 * position: sticky. Получается, что сначала одна группа сбрасывает у себя sticky, затем считывает положение
 * ячеек, что приводит к лайауту. Затем возвращает sticky. Затем эти же действия делает другая группа. Что приводит
 * к еще одному лайату.
 * 2. Контроллер также производит свои вычисления, что приводит к третьему лайауту.
 * 3. В некоторых сценриях мы устанавливаем ситили сразу же в обход шаблнизации и жизненных циклов компоннетов чтобы
 * не было скачков.
 *
 * @class Controls/_scroll/StickyHeader/FastUpdate
 */
class FastUpdate {
    _measures: Function[] = [];
    _mutates: Function[] = [];
    _stickyContainersForReset: object[] = [];

    _isInvalid: boolean = false;

    _promise: Promise<void>;

    resetSticky(elements: HTMLElement[]): void {
        elements.forEach((element) => {
            if (!this._stickyContainersForReset.find((e) => e.container === element)) {
                this._stickyContainersForReset.push({ container: element });
            }
        });
    }

    measure(fn: Function): Promise<void> {
        this._measures.push(fn);
        return this._invalidateMutations();
    }

    mutate(fn: Function): Promise<void> {
        this._mutates.push(fn);
        return this._invalidateMutations();
    }

    protected _invalidateMutations() {
        if (!this._isInvalid) {
            this._isInvalid = true;
            this._promise = Promise.resolve().then(this._applyMutations.bind(this));
        }
        return this._promise;
    }

    protected _applyMutations() {
        this._resetSticky();
        this._runTasks(this._measures);
        this._restoreSticky();
        this._runTasks(this._mutates);
        this._isInvalid = false;
    }

    protected _runTasks(tasks: Function[]) {
        let task;
        // Надо иметь возможность добавлять задачи в момент выполнения выполнения других задач.
        while (task = tasks.shift()) {
            task();
        }
    }

    protected _resetSticky() {
        for (let stickyHeader of this._stickyContainersForReset) {
            // Устаналиваем relative вместо static, т.к в safari почему-то после сброса в static и
            // обратной установкой position: sticky тень думает, что заголовок все еще static.
            // Попытка "дёрнуть" тень установкой display none и обратно display block успехом не увенчалась.
            stickyHeader.container.style.position = 'relative';
            this._resetPosition(stickyHeader);
        }
    }

    protected _resetPosition(stickyHeader: object): void {
        stickyHeader.top = stickyHeader.container.style.top;
        stickyHeader.bottom = stickyHeader.container.style.bottom;
        stickyHeader.container.style.top = '';
        stickyHeader.container.style.bottom = '';
    }

    protected _restoreSticky() {
        for (let stickyHeader of this._stickyContainersForReset) {
            stickyHeader.container.style.position = '';
            this._restorePosition(stickyHeader);
        }
        this._stickyContainersForReset = [];
    }

    protected _restorePosition(stickyHeader: object): void {
        stickyHeader.container.style.top = stickyHeader.top;
        stickyHeader.container.style.bottom = stickyHeader.bottom;
    }

}

const fastUpdate = new FastUpdate();

export default fastUpdate