/// <amd-module name="Controls/_dataSource/_error/Mode" />
/**
 * [enum] Перечисляемое множество возможных способов отображения парковочного шаблона ошибки
 * @class Controls/_dataSource/_error/Mode
 * @public
 * @author Санников К.А.
 * @todo Переписать как typedef, как появится возможность автодоки прогружать из библиотек тайпдефы
 */
enum Mode {
    /**
     * @name Controls/_dataSource/_error/Mode#dialog
     * @cfg {string} в диалоговом окне
     */
    dialog = 'dialog',
    /**
     * @name Controls/_dataSource/_error/Mode#page
     * @cfg {string} во всю страницу
     */
    page = 'page',
    /**
     * @name Controls/_dataSource/_error/Mode#routing
     * @cfg {string} В браузере - во всю страницу, при серверном рендеринге - изменить HTTP-код ответа
     */
    routing = 'routing',
    /**
     * @name Controls/_dataSource/_error/Mode#include
     * @cfg {string} в области контрола
     */
    include = 'include'
}

export default Mode;
