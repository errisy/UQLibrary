class SectionDivider {
    static sectionsBeforeEachPattern(value, pattern, includePattern) {
        var sections = [];
        var lastPos = 0;
        var mc = pattern.Matches(value);
        for (var i = 0; i < mc.length; i++) {
            var m = mc[i];
            sections.push(value.substring(lastPos, includePattern ? m.lastIndex : m.index));
            lastPos = includePattern ? m.lastIndex : m.index;
        }
        return sections;
    }
    static sectionsAfterEachPattern(value, pattern, includePattern) {
        var sections = [];
        var nextPos = -1;
        var mc = pattern.Matches(value);
        //console.log('number of sections: '+  mc.length.toString());
        for (var i = 0; i < mc.length; i++) {
            var m = mc[i];
            if (i < mc.length - 1) {
                nextPos = mc[i + 1].index;
            }
            else {
                nextPos = value.length;
            }
            sections.push(value.substring(m.index, nextPos));
        }
        return sections;
    }
    static Divide(value, pattern) {
        var Sections = [];
        var lastPos = -1;
        pattern.Matches(value).forEach((match, index, array) => {
            if (lastPos > -1) {
                if (lastPos == 0) {
                    //console.log(value.substr(lastPos, match.index - lastPos));
                    Sections.push(value.substr(lastPos, match.index - lastPos));
                }
                else {
                    //console.log(value.substr(lastPos + 1, match.index - lastPos));
                    Sections.push(value.substr(lastPos + 1, match.index - lastPos));
                }
            }
            lastPos = match.index;
        });
        if (lastPos == 0) {
            Sections.push(value.substr(lastPos));
        }
        else {
            Sections.push(value.substr(lastPos + 1));
        }
        return Sections;
    }
    static DivideWith(value, pattern, groupIndex) {
        var Sections = [];
        var lastPos = -1;
        pattern.Matches(value).forEach((match, index, array) => {
            Sections.push(value.substr(lastPos, match.index - lastPos) + (match.groups[2] ? match.groups[2] : ''));
            lastPos = match.index + match.length;
        });
        if (lastPos == 0) {
            Sections.push(value.substr(lastPos));
        }
        else {
            Sections.push(value.substr(lastPos + 1));
        }
        return Sections;
    }
    static SelectSection(Sections, pattern) {
        return Sections.filter((value) => pattern.IsMatch(value));
    }
    static RemoveQuotation(Value) {
        return Value.replace(/^\s*"/g, '').replace(/"\s*$/g, '');
    }
}
class RegularExpressionMatch {
}
/**
 * Class to extend string
 */
class StringExtension extends String {
    escapeXML() {
        return this.replace(/[<>&'"]/g, (char) => {
            switch (char) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }
    format(...args) {
        return this.replace(/{\d+}/g, (char) => {
            var index = Number(char.substr(1, char.length - 2));
            return args[index].toString();
        });
    }
    present(obj) {
        return this.replace(/\{[\w+\.]+\}/g, (char) => {
            var fields = char.substr(1, char.length - 2).split('.').filter((field) => field.length > 0);
            console.log('String.apply:', char, obj, fields);
            var value = obj;
            while (fields.length > 0) {
                value = value[fields.shift()];
            }
            return value;
        });
    }
}
//apply the definitions to String prototype
String.prototype.escapeXML = StringExtension.prototype.escapeXML;
String.prototype.format = StringExtension.prototype.format;
String.prototype.present = StringExtension.prototype.present;
class Insertion {
    static Compare(a, b) {
        return (a.index > b.index) ? 1 : ((a.index < b.index) ? -1 : 0);
    }
}
class PasswordUtil {
    static checkPasswordStrength(password) {
        var score = 0;
        if (password.length < 6)
            return 0;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/))
            score += 1;
        if (password.match(/\d+/))
            score += 1;
        if (password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/))
            score += 1;
        if (password.length > 12)
            score += 1;
        return score;
    }
}
class EmailUtil {
    static isValid(email) {
        return EmailUtil.pattern.IsMatch(email);
    }
}
EmailUtil.pattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
Array.prototype.add = (item) => {
    var that = eval('this');
    that.push(item);
    if (that.onInsert)
        that.onInsert(that, item, that.length);
};
Array.prototype.insert = (item, index) => {
    var that = eval('this');
    that.splice(index, 0, item);
    if (that.onInsert)
        that.onInsert(that, item, index);
};
Array.prototype.clear = () => {
    var that = eval('this');
    that.splice(0, that.length);
    if (that.onClear)
        that.onClear(that);
};
Array.prototype.removeAt = (index) => {
    var that = eval('this');
    var item = that[index];
    that.splice(index, 1);
    if (that.onRemoveAt)
        that.onRemoveAt(that, item, index);
};
Array.prototype.remove = (item) => {
    var that = eval('this');
    var index = that.indexOf(item);
    that.splice(index, 1);
    if (that.onRemoveAt)
        that.onRemoveAt(that, item, index);
};
Array.prototype.moveTo = (from, to) => {
    var that = eval('this');
    var item = that[from];
    that.splice(from, 1);
    that.splice(to, 0, item);
    if (that.onMoveTo)
        that.onMoveTo(that, item, from, to);
};
Array.prototype.addUnique = (item) => {
    var that = eval('this');
    if (that.uniqueComparer) {
        if (!that.some((value, index, array) => that.uniqueComparer(value, item))) {
            that.add(item);
            return true;
        }
        else {
            return false;
        }
    }
    else {
        if (!that.some((value, index, array) => value === item)) {
            that.add(item);
            return true;
        }
        else {
            return false;
        }
    }
};
Array.prototype.contains = (item) => {
    var that = eval('this');
    if (that.uniqueComparer) {
        return that.some((value, index, array) => that.uniqueComparer(value, item));
    }
    else {
        return that.some((value, index, array) => value === item);
    }
};
Array.prototype.intersectWith = (arr) => {
    var that = eval('this');
    var results = [];
    if (that.uniqueComparer) {
        results.uniqueComparer = that.uniqueComparer;
    }
    else {
        results.uniqueComparer = arr.uniqueComparer;
    }
    for (var i = 0; i < that.length; i++) {
        var item = that[i];
        if (that.contains(item) && arr.contains(item))
            results.addUnique(item);
    }
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (that.contains(item) && arr.contains(item))
            results.addUnique(item);
    }
    return results;
};
Array.prototype.unionWith = (arr) => {
    var that = eval('this');
    var results = [];
    if (that.uniqueComparer) {
        results.uniqueComparer = that.uniqueComparer;
    }
    else {
        results.uniqueComparer = arr.uniqueComparer;
    }
    for (var i = 0; i < that.length; i++) {
        results.addUnique(that[i]);
    }
    for (var i = 0; i < arr.length; i++) {
        results.addUnique(arr[i]);
    }
    return results;
};
Array.prototype.addRange = (items) => {
    var that = eval('this');
    items.forEach((item) => {
        that.push(item);
        if (that.onInsert)
            that.onInsert(that, item, that.length);
    });
};
Array.prototype.combine = (items) => {
    var that = eval('this');
    var arr = [];
    that.forEach((item) => {
        arr.push(item);
    });
    items.forEach((item) => {
        arr.push(item);
    });
    return arr;
};
Array.prototype.count = (filter) => {
    var that = eval('this');
    if (filter) {
        var count = 0;
        for (var i = 0; i < that.length; i++) {
            var index = i;
            count += filter(that[index], index, that) ? 1 : 0;
        }
        return count;
    }
    else {
        return that.length;
    }
};
Array.prototype.sum = (accumulator) => {
    var that = eval('this');
    if (accumulator) {
        var sum = 0;
        for (var i = 0; i < that.length; i++) {
            var index = i;
            sum += accumulator(that[index], index, that);
        }
        return sum;
    }
    else {
        return that.length;
    }
};
Array.prototype.collect = (callback) => {
    var that = eval('this');
    var results = [];
    if (callback) {
        for (var i = 0; i < that.length; i++) {
            var index = i;
            callback(that[index], index, that).forEach((value) => results.push(value));
        }
    }
    return results;
};
Array.prototype.collectUnique = (callback) => {
    var that = eval('this');
    var results = [];
    if (callback) {
        for (var i = 0; i < that.length; i++) {
            var index = i;
            callback(that[index], index, that).forEach((value) => results.addUnique(value));
        }
    }
    return results;
};
class PHPDate {
    static num2date(value) {
        return moment('1970-01-01 00:00:00').add(value, 'second').format('YYYY-MM-DD HH:mm:ss');
    }
    static date2num(value) {
        return moment.duration(moment(value).diff(moment('1970-01-01 00:00:00'))).asSeconds();
    }
    static now() {
        return moment.duration(moment().diff(moment('1970-01-01 00:00:00'))).asSeconds();
    }
}
function isValidNumber(value) {
    if (typeof value == 'number') {
        return !isNaN(value);
    }
    return false;
}
//# sourceMappingURL=string.js.map