var UQLib;
(function (UQLib) {
    ES6Promise.polyfill();
    let uqlib = new ngstd.AngularModule('uqlib', ['ngMaterial']);
    //theme of ng-material
    uqlib.app.config(function ($mdThemingProvider) {
        $mdThemingProvider
            .theme('default')
            .primaryPalette('indigo', {
            default: '600'
        })
            .accentPalette('teal')
            .warnPalette('red')
            .backgroundPalette('grey');
        $mdThemingProvider.theme('blue');
        $mdThemingProvider.theme('red');
        $mdThemingProvider.theme('indigo');
    });
    uqlib.includeContentDirective();
    //include filters controllers and classes;
    uqlib.includeFilters(LibraryDataFilters);
    uqlib.addDirective(OpenDirective);
    uqlib.addDirective(MainDirective);
    uqlib.includeLoaderController();
})(UQLib || (UQLib = {}));
//# sourceMappingURL=uqlib.module.js.map