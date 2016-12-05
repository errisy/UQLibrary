/// <reference path="../lib/ngstd.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class ComputerController {
    constructor($http, $scope) {
        this.$http = $http;
        this.$scope = $scope;
        this.$inject = ['$http', '$scope'];
        this.proxy = new HttpProxy(this.$http, 'http://localhost:2016/proxy.cgi.js');
        this.proxy.useProxy = true;
        this.client = new LibraryDataClient(this.proxy);
    }
    get isLoading() {
        return this._isLoading;
    }
    set isLoading(value) {
        this._isLoading = value;
    }
    onLoaded() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadData();
        });
    }
    loadData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isLoading = true;
            this.HoursByDay = yield this.client.library_hours_day();
            this.isLoading = false;
        });
    }
}
class ComputerDirective extends ngstd.AngularDirective {
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = '/view/open.view.html';
        this.scope.parent = '=?';
        this.controller = OpenController;
        this.controllerAs = 'ctrl';
        return this;
    }
}
ComputerDirective.selector = 'computer';
//# sourceMappingURL=computer.view.js.map