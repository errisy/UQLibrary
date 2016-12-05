/// <reference path="../lib/ngstd.ts" />
/// <reference path="../lib/string.ts" />


interface IBackgroundHistogramScope extends ng.IScope {
    value: number;
    foreground: string;
    background: string;
}
interface IBackgroundHistogramDirectiveScope extends ng.IScope {
    value: ngstd.Bindables;
    foreground: ngstd.Bindables;
    background: ngstd.Bindables;
}
class BackgroundHistogramDirective extends ngstd.AngularDirective<IBackgroundHistogramDirectiveScope> {
    static selector = 'hisback';
    constructor() {
        super();
        this.restrict = 'A';
        this.scope.value = '=?';
        this.scope.foreground = '=?';
        this.scope.background = '=?'; 
        this.link = (scope: IBackgroundHistogramScope, element: ng.IAugmentedJQuery, attr: ng.IAttributes, ...args: any[]) => {
            let render = () => {
                let foreground: string = '#bFb';
                let background: string = '#aaa';
                let value: number = 0;
                if (typeof scope.foreground == 'string') foreground = scope.foreground;
                if (typeof scope.background == 'string') background = scope.background;
                if (typeof scope.value == 'number') value = scope.value;
                element.css('background', 'linear-gradient(to right, {0} 0%, {0} {2}%, {1} {2}%, {1} 100%)'.format(foreground, background, Math.round(value)));
            }
            scope.$watch('value', () => render()); 
            scope.$watch('foreground', () => render()); 
            scope.$watch('background', () => render()); 
        }
    }
}