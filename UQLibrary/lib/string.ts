 

interface String {
    /**
     * Replace {N} with Nth object in the augment array;
     * @param args 
     */
    format(...args: any[]): string;

    /**
     *
     */
    unescapeHTML(): string;
}

/**
 * Class to extend string
 */
class StringExtension extends String {
    public format(...args: string[]) {
        return this.replace(/{\d+}/g, (char: string): string => {
            var index: number = Number(char.substr(1, char.length - 2));
            return args[index].toString();
        });
    }
    public unescapeHTML(){
        return this.replace(/&(gt|lt|amp|nbsp);/ig, (hit) => {
            switch (hit) {
                case '&gt;': return '>';
                case '&lt;': return '<';
                case '&amp;': return '&';
                case '&nbsp;': return ' ';
            }
        }).replace(/&#(\d+);/ig, (hit: string, ...args: any[]) => {
            return String.fromCharCode(Number(args[0]));
        });
    }
}

//apply the definitions to String prototype
String.prototype.format = StringExtension.prototype.format;
String.prototype.unescapeHTML = StringExtension.prototype.unescapeHTML;