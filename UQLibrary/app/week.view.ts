class WeekController {
    $inject: ngstd.Injectables[] = ['$scope', '$mdMedia'];
    constructor(public $scope: ng.IScope, public $mdMedia: ng.material.IMedia) {
    }
    /**its $parent is the main controller scope because the content directive created with the main controller scope*/
    public get parent(): MainController {
        return this.$scope.$parent['ctrl'];
    }
    public setMode(mode: number) {
        this.parent.displayMode = mode.toString();
    }
}

class WeekDirective extends ngstd.AngularDirective<ng.IScope> {
    static selector = 'week';
    constructor() {
        super();
        this.restrict = 'AE';
        this.templateUrl = ngstd.AngluarJSTemplateUrlPacker('/view/week.view.html');
        this.controller = WeekController;
        this.controllerAs = 'ctrl';
        return this;
    }
}