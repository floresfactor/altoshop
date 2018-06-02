const warnings = true;

const getKeys = function (keys) {
    return keys.map(key => key.split("."))
};

const readObjectKey = function (obj, keys) {
    for (let k of keys) {
        if (!obj)
            return obj;
        obj = obj[k];
    }
    return obj;
};

const testValue = function (value, obj, key) {
    if (warnings && (value == undefined || !(typeof value === "string" || typeof value === "number"))) {
        console.warn("Got:", value, "in object key: [" + key + "], string or number value recomended.\nObject:", obj);
        typeof value === "function" &&
            console.warn("Only functions that returns string or number are tested, this function has returned: ", typeof value);
        return false;
    };
    return true;
};

const getLiteralChars = function (str) {
    console.log(str);
    let literalArray = str.split("").map(char => {
        switch (char) {
            case "\\": case "^": case "$": case "*": case "+": case "?": case "-": case ".":
            case "(": case ")": case "[": case "]": case "{": case "}": case ":": case "=":
            case "!": case "|": case ",": //Al parecer la "," no se necesita poner, con aver puesto []{}() parece que no es necesario, pero por si las moscas
                return "\\" + char;//No estoy 100% seguro de que todas las busquedas se interpreten con el texto escrito en el search
            default:                // ya que, no eh probado bien los testeos de las regex que se generen con este switch.
                return char;
        }
    })
    let buffer = "";
    for (let literal of literalArray) buffer += literal;
    return buffer;
}

const createRegExps = function (searchString, matchString, flags) {
    if (matchString)
        return [new RegExp(getLiteralChars(searchString), flags)];
    return searchString.split(" ").filter(word => word != '')
        .map(word => new RegExp(getLiteralChars(word), flags));
};

const validateArguments = function ({ searchString, objArray, keys }) {
    return typeof searchString === "string" && searchString.length > 0 &&
        !/^[ ]+$/.test(searchString) && Array.isArray(objArray) &&
        Array.isArray(keys) && keys.length > 0
};

const matchRegExp = [
    function (value, wordRegExps) {// MatchAll
        for (let regex of wordRegExps) if (!regex.test(value)) return false;
        return true;
    },
    function (value, wordRegExps) {// MatchAny
        for (let regex of wordRegExps) if (regex.test(value)) return true;
        return false;
    }
];

const matchProps = [
    function (keys, obj, wordRegExps, matchAllWords) {// MatchAll
        let value = null;
        for (let key of keys) {
            value = readObjectKey(obj, key);
            value = (typeof value === "function") ? value() : value;
            if (!testValue(value, obj, key)) return false;
            if (!matchRegExp[matchAllWords](value, wordRegExps)) return false;
        }
        return true;
    },
    function (keys, obj, wordRegExps, matchAllWords) {// MatchAny
        let value = null;
        for (let key of keys) {
            value = readObjectKey(obj, key);
            value = (typeof value === "function") ? value() : value;
            if (!testValue(value, obj, key)) return false;
            if (matchRegExp[matchAllWords](value, wordRegExps)) return true;
        }
        return false;
    }
];

////////////////// MAIN FUNCTION ///////////////////////////////
export default function deepObjectSearch({ searchString, objArray, keys, flags, matchAllWords, matchAllProps, matchString = true }, callBack) {
    if (validateArguments(...arguments)) {
        let wordRegExps = createRegExps(searchString, matchString, flags);
        objArray = objArray.filter(obj => {
            return matchProps[Number(!matchAllProps)](getKeys(keys), obj, wordRegExps, Number(!matchAllWords));
        });
    }
    callBack && callBack(objArray);
    return objArray;
}
// Future Modifications
// matchAllWords, matchAnyWord, matchString must be one sole variable i.e. matchCriteria: string
// values("all-words", "any-word", "exact-string") default "exact-string"

//Error al encontrar una key en null o undefined, hace que no matchee nada

/*
** Returns and send as parameter in callback an object Array filtered by a search string,
** search  into object properties (keys) for a coincidence 
** given by the gotten arguments 
** ////// arguments //////
** flags(string): RegExp Flags("i" ignore Case, "g" global, "m" multiline)
** matchAnyWord(bool): must match all words in searchString.                   default fase (match any word)
** matchAllProps(bool): the search must match in all object props (keys).       default false (match any prop)
** matchString(bool): must match the whole string. (ignore blank spaces)        default false (match criteria by word (ignore blank spaces))
    Defualt: Match the exactly string
*/