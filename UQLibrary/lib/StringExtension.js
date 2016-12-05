var SectionDivider = (function () {
    function SectionDivider() {
    }
    SectionDivider.sectionsBeforeEachPattern = function (value, pattern, includePattern) {
        var sections = [];
        var lastPos = 0;
        var mc = pattern.Matches(value);
        for (var i = 0; i < mc.length; i++) {
            var m = mc[i];
            sections.push(value.substring(lastPos, includePattern ? m.lastIndex : m.index));
            lastPos = includePattern ? m.lastIndex : m.index;
        }
        return sections;
    };
    SectionDivider.sectionsAfterEachPattern = function (value, pattern, includePattern) {
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
    };
    SectionDivider.Divide = function (value, pattern) {
        var Sections = [];
        var lastPos = -1;
        pattern.Matches(value).forEach(function (match, index, array) {
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
    };
    SectionDivider.DivideWith = function (value, pattern, groupIndex) {
        var Sections = [];
        var lastPos = -1;
        pattern.Matches(value).forEach(function (match, index, array) {
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
    };
    SectionDivider.SelectSection = function (Sections, pattern) {
        return Sections.filter(function (value) { return pattern.IsMatch(value); });
    };
    SectionDivider.RemoveQuotation = function (Value) {
        return Value.replace(/^\s*"/g, '').replace(/"\s*$/g, '');
    };
    return SectionDivider;
}());
var RegularExpressionMatch = (function () {
    function RegularExpressionMatch() {
    }
    return RegularExpressionMatch;
}());
String.prototype.encodeXML = function () {
    var that = eval('this');
    return that.replace(/[<>&'"]/g, function (char) {
        switch (char) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
};
String.prototype.format = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var that = eval('this');
    return that.replace(/{\d+}/g, function (char) {
        var index = Number(char.substr(1, char.length - 2));
        return args[index].toString();
    });
};
String.prototype.apply = function (obj) {
    var that = eval('this');
    console.log('String.apply:', obj);
    return that.replace(/\{[\w+\.]+\}/g, function (char) {
        var fields = char.substr(1, char.length - 2).split('.').filter(function (field) { return field.length > 0; });
        console.log('String.apply:', char, obj, fields);
        var value = obj;
        while (fields.length > 0) {
            value = value[fields.shift()];
        }
        return value;
    });
};
RegExp.prototype.Matches = function (value) {
    var hit;
    var result = [];
    var that = eval('this');
    while (hit = that.exec(value)) {
        var match = new RegularExpressionMatch();
        match.index = hit.index;
        match.lastIndex = that.lastIndex;
        match.length = match.lastIndex - match.index;
        match.groups = hit;
        //console.log('from ' + match.index.toString() + ' to ' + match.lastIndex.toString());
        result.push(match);
    }
    that.lastIndex = 0;
    return result;
};
RegExp.prototype.Match = function (value) {
    var hit;
    var result = null;
    var that = eval('this');
    that.lastIndex = 0;
    if (hit = that.exec(value)) {
        result = new RegularExpressionMatch();
        result.index = hit.index;
        result.lastIndex = that.lastIndex;
        result.length = result.lastIndex - result.index;
        result.groups = hit;
    }
    return result;
};
RegExp.prototype.IsMatch = function (value) {
    var that = eval('this');
    that.lastIndex = 0;
    return that.test(value);
};
var Insertion = (function () {
    function Insertion() {
    }
    Insertion.Compare = function (a, b) {
        return (a.index > b.index) ? 1 : ((a.index < b.index) ? -1 : 0);
    };
    return Insertion;
}());
var PasswordUtil = (function () {
    function PasswordUtil() {
    }
    PasswordUtil.checkPasswordStrength = function (password) {
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
    };
    return PasswordUtil;
}());
var EmailUtil = (function () {
    function EmailUtil() {
    }
    EmailUtil.isValid = function (email) {
        return EmailUtil.pattern.IsMatch(email);
    };
    return EmailUtil;
}());
EmailUtil.pattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
Array.prototype.add = function (item) {
    var that = eval('this');
    that.push(item);
    if (that.onInsert)
        that.onInsert(that, item, that.length);
};
Array.prototype.insert = function (item, index) {
    var that = eval('this');
    that.splice(index, 0, item);
    if (that.onInsert)
        that.onInsert(that, item, index);
};
Array.prototype.clear = function () {
    var that = eval('this');
    that.splice(0, that.length);
    if (that.onClear)
        that.onClear(that);
};
Array.prototype.removeAt = function (index) {
    var that = eval('this');
    var item = that[index];
    that.splice(index, 1);
    if (that.onRemoveAt)
        that.onRemoveAt(that, item, index);
};
Array.prototype.remove = function (item) {
    var that = eval('this');
    var index = that.indexOf(item);
    that.splice(index, 1);
    if (that.onRemoveAt)
        that.onRemoveAt(that, item, index);
};
Array.prototype.moveTo = function (from, to) {
    var that = eval('this');
    var item = that[from];
    that.splice(from, 1);
    that.splice(to, 0, item);
    if (that.onMoveTo)
        that.onMoveTo(that, item, from, to);
};
Array.prototype.addUnique = function (item) {
    var that = eval('this');
    if (that.uniqueComparer) {
        if (!that.some(function (value, index, array) { return that.uniqueComparer(value, item); })) {
            that.add(item);
            return true;
        }
        else {
            return false;
        }
    }
    else {
        if (!that.some(function (value, index, array) { return value === item; })) {
            that.add(item);
            return true;
        }
        else {
            return false;
        }
    }
};
Array.prototype.contains = function (item) {
    var that = eval('this');
    if (that.uniqueComparer) {
        return that.some(function (value, index, array) { return that.uniqueComparer(value, item); });
    }
    else {
        return that.some(function (value, index, array) { return value === item; });
    }
};
Array.prototype.intersectWith = function (arr) {
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
Array.prototype.unionWith = function (arr) {
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
Array.prototype.addRange = function (items) {
    var that = eval('this');
    items.forEach(function (item) {
        that.push(item);
        if (that.onInsert)
            that.onInsert(that, item, that.length);
    });
};
Array.prototype.combine = function (items) {
    var that = eval('this');
    var arr = [];
    that.forEach(function (item) {
        arr.push(item);
    });
    items.forEach(function (item) {
        arr.push(item);
    });
    return arr;
};
Array.prototype.count = function (filter) {
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
Array.prototype.sum = function (accumulator) {
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
Array.prototype.collect = function (callback) {
    var that = eval('this');
    var results = [];
    if (callback) {
        for (var i = 0; i < that.length; i++) {
            var index = i;
            callback(that[index], index, that).forEach(function (value) { return results.push(value); });
        }
    }
    return results;
};
Array.prototype.collectUnique = function (callback) {
    var that = eval('this');
    var results = [];
    if (callback) {
        for (var i = 0; i < that.length; i++) {
            var index = i;
            callback(that[index], index, that).forEach(function (value) { return results.addUnique(value); });
        }
    }
    return results;
};
var PHPDate = (function () {
    function PHPDate() {
    }
    PHPDate.num2date = function (value) {
        return moment('1970-01-01 00:00:00').add(value, 'second').format('YYYY-MM-DD HH:mm:ss');
    };
    PHPDate.date2num = function (value) {
        return moment.duration(moment(value).diff(moment('1970-01-01 00:00:00'))).asSeconds();
    };
    PHPDate.now = function () {
        return moment.duration(moment().diff(moment('1970-01-01 00:00:00'))).asSeconds();
    };
    return PHPDate;
}());
function isValidNumber(value) {
    if (typeof value == 'number') {
        return !isNaN(value);
    }
    return false;
}
//# sourceMappingURL=StringExtension.js.map