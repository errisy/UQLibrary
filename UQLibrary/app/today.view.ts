class TodayController {
    static $inject: ngstd.Injectables[] = ['$scope'];
    constructor(public $scope: ng.IScope) {
    }
    /**for presenting weekday */
    public Weekday = Date.now();
    /**its $parent is the main controller scope because the content directive created with the main controller scope*/
    public get parent(): MainController {
        return this.$scope.$parent['ctrl'];
    }
    public setMode(mode: number) {
        this.parent.displayMode = mode.toString();
    }
}

class TodayDirective extends ngstd.AngularDirective<ng.IScope> {
    static selector = 'today';
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = ngstd.AngluarJSTemplateUrlPacker('/view/today.view.html');
        this.controller = TodayController;
        this.controllerAs = 'ctrl';
        return this;
    }
}