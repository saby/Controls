define("Controls/File/Attach/Container/Source", ["require", "exports", "Core/Deferred"], function (require, exports, Deferred) {
    "use strict";
    var filterForType = function (wrappers, fileData) {
        return wrappers.filter(function (sourceObj) {
            return fileData == sourceObj.fileType;
        });
    };
    /**
     * Класс для хранения экземпляров ISource по типам отправляеммых файлов
     * @class Controls/File/Attach/Container/Source
     * @author Заляев А.В.
     * @private
     */
    var SourceContainer = /** @class */ (function () {
        function SourceContainer() {
            this._sourceWrappers = [];
        }
        /**
         * Регистрация источников данных для загрузки определённого типа ресурса
         * @param {Core/Deferred<ISource>} source источник данных
         * @param {Controls/File/IFileDataConstructor} FileData конструктор обёртки над ресурсом
         * @see Controls/File/LocalFile
         * @see Controls/File/LocalFileLink
         * @see Controls/File/HttpFileLink
         */
        SourceContainer.prototype.push = function (source, FileData) {
            if (!(FileData instanceof Function)) {
                throw new Error("Invalid type of the first argument, expected constructor");
            }
            // Если для данного типа файла ISource уже зарегестрирован - поменяем его. нет - добавим
            var registeredSource = filterForType(this._sourceWrappers, FileData)[0];
            if (registeredSource) {
                registeredSource.source = source || registeredSource.source;
                return;
            }
            this._sourceWrappers.push({
                source: source,
                fileType: FileData
            });
        };
        /**
         * Зарегестрирован ли для текущего ресурса источник данных
         * @param {IFileData} file
         * @return {boolean}
         * @see Controls/File/LocalFile
         * @see Controls/File/LocalFileLink
         * @see Controls/File/HttpFileLink
         */
        SourceContainer.prototype.has = function (file) {
            return !!this._get(file);
        };
        /**
         * Возвращает источник данных для ресурса
         * @param {IFileData} file
         * @return {Core/Deferred<ISource>}
         * @see Controls/File/LocalFile
         * @see Controls/File/LocalFileLink
         * @see Controls/File/HttpFileLink
         */
        SourceContainer.prototype.get = function (file) {
            var source = this._get(file);
            return Deferred.success(source ||
                new Error("Not registered source for this file type"));
        };
        /**
         * Возвращает список зарегестрированый обёрток
         * @return {Array<IFileDataConstructor>}
         * @see Controls/File/LocalFile
         * @see Controls/File/LocalFileLink
         * @see Controls/File/HttpFileLink
         */
        SourceContainer.prototype.getRegisteredResource = function () {
            return this._sourceWrappers.map(function (wrapper) {
                return wrapper.fileType;
            });
        };
        SourceContainer.prototype._get = function (file) {
            var wrapper = this._sourceWrappers.filter(function (wrapper) {
                return file instanceof wrapper.fileType;
            })[0];
            return wrapper && wrapper.source;
        };
        SourceContainer.prototype.destroy = function () {
            this._sourceWrappers = [];
        };
        return SourceContainer;
    }());
    return SourceContainer;
});
