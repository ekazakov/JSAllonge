console.clear();

var __slice = Array.prototype.slice;

function callFirst (fn, larg) {
    return function () {
        var args = __slice.call(arguments);

        return fn.apply(this, [larg].concat(args));
    };
}

function callLast (fn, rarg) {
    return function () {
        var args = __slice.call(arguments);

        return fn.apply(this, args.concat([rarg]));
    };
}

function greet (me, you) {
    return "Hello, " + you + ", my name is " + me;
}

var heliosSayHello = callFirst(greet, 'Helios');
var sayHellotoCeline = callLast(greet, 'Celine');

console.log(heliosSayHello('Eartha'));
console.log(sayHellotoCeline('Eartha'));

function variadic (fn) {
    var fnLength = fn.length;

    if (fnLength < 1) {
        return fn;
    } else if (fnLength === 1) {
        return function () {
            return fn.call(this, __slice.call(arguments, 0));
        };
    } else {
        return function () {
            var numberOfArgs = arguments.length;
            var namedArgs = __slice.call(arguments, 0, fnLength - 1);
            var numberOfMissingNamedArgs = Math.max(fnLength - numberOfArgs -1, 0);
            var argPadding = new Array(numberOfMissingNamedArgs);
            var variadicArgs = __slice.call(arguments, fn.length - 1);

            return fn.apply(this, namedArgs.concat(argPadding).concat([variadicArgs]));
        };
    }
}

var callLeft = variadic(function (fn, args) {
    return variadic(function (remainingArgs) {
        return fn.apply(this, args.concat(remainingArgs));
    });
});

var callRight = variadic(function (fn, args) {
    return variadic(function (precedingArgs) {
        return fn.apply(this, precedingArgs.concat(args));
    });
});

var mapper = variadic(function (fn, elements) {
    return elements.map(fn);
});

console.log(mapper(function (x) { return x *x;}, 1, 2, 3));

var squarer = callLeft(mapper, function (x) { return x * x;});


function unary (fn) {
    if (fn.length === 1) {
        return fn;
    } else {
        return function (something) {
            return fn.call(this, something);
        };
    }
}

console.log(['1', '2', '3'].map(unary(parseInt)));

// K Combinator
function K (x) {
    return function (y) {
        return x;
    };
}


function tap (value, fn) {
    if (fn == null) {
        return curried;
    } else {
        return curried(fn);
    }

    function curried (fn) {
        if (typeof fn === 'function') {
            fn(value);
        }

        return value;
    }
}

var drink1 = tap('espresso')(function (it) {
    console.log('Our drink is ' + it);
});

var drink2 = tap('capuchino', function (it) {
    console.log('Our drink is ' + it);
});


function maybe (fn) {
    return function _maybe() {
        var i;
        if (arguments.length === 0) return;

        for (i = 0; i < arguments.length; ++i) {
            if (arguments[i] == null) return;
        }

        return fn.apply(this, arguments);
    };
}


function once (fn) {
    var done = false;

    return function () {
        return done ? undefined : ((done = true), fn.apply(this, arguments));
    };
}



var askedOnBlindDate = once(function () {
    return 'sure, why not?';
});

console.log(askedOnBlindDate());
console.log(askedOnBlindDate());

function map (list, fn) {
    return Array.prototype.map.call(list, fn);
}

function flip (fn) {
    return function (first, second) {
        if (arguments.length === 2) {
            return fn.call(this, second, first);
        } else return function (second) {
            return fn.call(this, second, first);
        };
    };
}

var mapWith = flip(map);
function square (x) {return x *x;}

console.log(mapWith(square, [1,2,3]));
console.log(mapWith(square)([1,2,3]));


var extend = variadic(function (consumer, providers) {
    providers.forEach(function (provider) {
        Object.keys(provider).forEach(function (key) {
            consumer[key] = provider[key];
        });
    });

    return consumer;
});

var o = extend({}, {apples: 12, oranges: 12});
console.log(o);
console.log(extend({}));

function memoized (fn, keymaker) {
    var lookupTable = {};

    keymaker = keymaker || function (args) { return JSON.stringify(args); };

    return function () {
        var key = keymaker.call(this, arguments);

        return lookupTable[key] || (
            lookupTable[key] = fn.apply(this, arguments)
        );
    };
}

var fastFibonacci = memoized(function (n) {
    if (n < 2) {
        return n;
    } else {
        return fastFibonacci(n-2) + fastFibonacci(n-1);
    }
});

console.log(fastFibonacci(1045));

function getWith (attr) {
    return function (object) {
        return object[attr]; };
}

var inventory = {
    apples: 0,
    oranges: 144,
    eggs: 36
};


console.log(getWith('oranges')(inventory));


var inventories = [
    { apples: 0, oranges: 144, eggs: 36 },
    { apples: 240, oranges: 54, eggs: 12 },
    { apples: 24, oranges: 12, eggs: 42 },

];



console.log(
    mapWith(
        unary(
            maybe(getWith('oranges'))
        )
    )(inventories)
);

function compose (a, b) {
    return function (c) {
        return a(b(c));
    };
}

var pipeline = flip(compose);

pluckWith = compose(mapWith, getWith);

console.log(pluckWith('eggs')(inventories));


function deepMapWith (fn) {
    return function innerdeepMapWith (tree) {
        return Array.prototype.map.call(tree, function (element) {
            if (Array.isArray(element)) {
                return innerdeepMapWith(element);
            } else {
                return fn(element);
            }
        });
    };
}

function original (unknown) {
    return unknown.constructor(unknown);
}

console.log(original(new Number(1)) === 1);

function curry (fn) {
    var arity = fn.length;

    return given([]);

    function given (argsSoFar) {
        return function helper () {
            var updatedArgsSoFar = argsSoFar.concat(__slice.call(arguments));

            if (updatedArgsSoFar.length >= arity) return fn.apply(this, updatedArgsSoFar);

            return given(updatedArgsSoFar);
        };
    }
}

function sumOfFour (a, b, c, d) { return a + b + c + d }

var curriedSum = curry(sumOfFour);

console.log(curriedSum(1)(2)(3)(4));
console.log(curriedSum(1,2)(3)(4));
console.log(curriedSum(1,2)(3,4));
console.log(curriedSum(1,2,3,4));
console.log(curriedSum(1)()(2)()(3)(4));

function callLeft2 (fn) {
    return curry(fn).apply(null, __slice.call(arguments, 1));
}

console.log(callLeft2(sumOfFour, 1)(2, 3, 4));
console.log(callLeft2(sumOfFour, 1, 2)(3, 4));

function bind (fn, context, force) {
    if (force) {
        fn = unbind(fn);
    }

    var bound = function () {
        return fn.apply(context, arguments);
    };

    bound.unbound = function () {
        return fn;
    };

    return bound;
}

var unbind = function unbind (fn) {
    return fn.unbound ? unbind(fn.unbound()) : fn;
};

function myName () { return this.name; }

var harpo   = { name: 'Harpo' },
    chico   = { name: 'Chico' },
    groucho = { name: 'Groucho' };

var fh = bind(myName, harpo);
console.log(fh());

var fc = bind(myName, chico);
console.log(fc());

var fhg = bind(fh, groucho);
console.log(fhg());

var fhug = bind(fh, groucho, true);
console.log(fhug());

var fhug2 = bind(unbind(fh), groucho);
console.log(fhug2());

console.log(fc.unbound().call(groucho));

console.log(unbind(fh).apply(groucho, []));


function InventoryRecord (apples, oranges, eggs) {
    this.record = {
        apples: apples,
        oranges: oranges,
        eggs: eggs
    };
}

InventoryRecord.prototype.apples = function apples () {
    return this.record.apples;
};

InventoryRecord.prototype.oranges = function oranges () {
    return this.record.oranges;
};

InventoryRecord.prototype.eggs = function eggs () {
    return this.record.eggs;
};

var inventories = [
    new InventoryRecord( 0, 144, 36 ),
    new InventoryRecord( 240, 54, 12 ),
    new InventoryRecord( 24, 12, 42 )
];

var send = variadic(function (methodName, leftArguments) {
    return variadic(function (receiver, rightArguments) {
        return receiver[methodName].apply(receiver, leftArguments.concat(rightArguments));
    });
});

console.log(mapWith(send('apples'))(inventories));

function invoke (fn) {
    var args = __slice.call(arguments,1);

    return function (instance) {
        return fn.apply(instance, args);
    };
}


var data = [
    {0: 'zero', 1: 'one', 2: 'two', length: 3}
];

var __copy = callFirst(__slice, 0);

console.log(mapWith(invoke(__copy))(data));


function fluent (methodBody) {
    return function () {
        methodBody.apply(this, arguments);
        return this;
    };
}

function Cake () {}

extend(Cake.prototype, {
    setFlavour: fluent(function (flavour) {
        return this.flavour = flavour;
    }),

    setLayers: fluent(function (layers) {
        return this.layers = layers;
    }),

    bake: fluent(function () {
        // do some baking
    })
});

var cake = new Cake();
cake.setFlavour('chocolate');
cake.setLayers(3);
cake.bake();


var LinkedList = (function () {
    function LinkedList (content, next) {
        this.content = content;
        this.next = next != null ? next : undefined;
    }

    LinkedList.prototype = {
        appendTo: function (content) {
            return new LinkedList(content, this);
        },

        tailNode: function () {
            var nextThis = this.next;

            return (nextThis != null ? nextThis.tailNode() : undefined) || this;
        }
    };

    return LinkedList;
})();

function ListIterator (list) {
    return function () {
        var node;

        node = (list != null ? list.content : undefined);
        list = (list != null ? list.next : undefined);

        return node;
    };
}

function ArrayIterator (array) {
    var index = 0;

    return function () {
        return array[index++];
    };
}

function LeafIterator (array) {
    var index = 0;
    var state = [];

    return myself;

    function myself () {
        var element = array[index++];
        var tempState;

        if (element instanceof Array) {
            state.push({array: array, index: index});
            array = element;
            index = 0;

            return myself();
        } else if (element == null) {
            if (state.length > 0) {
                tempState = state.pop();

                array = tempState.array;
                index = tempState.index;

                return myself();
            } else {
                return;
            }
        } else {
            return element;
        }
    }
}

function sum (iter) {
    var number;
    var total = 0;

    number = iter();

    while (number != null) {
        total += number;
        number = iter();
    }

    return total;
}

var list = new LinkedList(5).appendTo(4).appendTo(3).appendTo(2).appendTo(1);

console.log(sum(ListIterator(list)));
console.log(sum(ArrayIterator([1,2,3,4,5])));
console.log(sum(LeafIterator([1, [2, [3, 4]], [5]])));

function fold (iter, binaryFn, seed) {
    var acc = seed;
    var element = iter();

    while (element != null) {
        acc = binaryFn.call(element, acc, element);
        element = iter();
    }

    return acc;
}

function foldingSum (iter) {
    return fold(iter, (function (x, y) {
        return x + y;
    }), 0);
}

console.log(
    foldingSum(LeafIterator([1, [2, [3, 4]], [5]]))
);


console.log("========= ITERATORS ============");

function NumberIterator (base) {
    var number;

    if (base == null) {
        base = 0;
    }

    number = base;

    return function () {
        return number++;
    };
}

var fromeOne = NumberIterator(1);

function take (iter, numberToTake) {
    var count = 0;

    return function () {
        if (++count <= numberToTake) {
            return iter();
        }

        return undefined;
    };
}


var oneToFive = take(NumberIterator(1), 5);

function iteratorMap (iter, unaryFn) {
    return function () {
        var element = iter();

        if (element != null) {
            return unaryFn.call(element, element);
        }

        return;
    };
}

function iteratorFilter (iter, unaryPredicateFn) {
    return function () {
        var element = iter();

        while (element != null) {
            if (unaryPredicateFn.call(element, element)) {
                return element;
            }

            element = iter();
        }

        return undefined;
    };
}

function squaresIterator (iter) {
    return iteratorMap(iter, function (n) {
        return n * n;
    });
}

function odd (n) {
    return n % 2 !== 0;
}

function oddsFilter (iter) {
    return iteratorFilter(iter, odd);
}

(function () {
    var s = foldingSum(
        take(
            oddsFilter(
                squaresIterator(NumberIterator(1))
            ),
            3
        )
    );

    console.log(s);
})();



console.log("=============== GAME ==============");

var DIRECTION_TO_DELTA = {
    N: [1, 0],
    E: [0, 1],
    S: [-1, 0],
    W: [0, -1]
};

var Game = (function () {
    function Game (size) {
        var i, j;

        this.size = size == null ? Math.floor(Math.random() * 8) + 8 : size;

        this.board = [];

        for (i = 0; i < this.size; ++i) {
            this.board[i] = [];

            for (j = 0; j < this.size; ++j) {
                this.board[i][j] = 'NSEW'[Math.floor(Math.random() * 4)];
            }
        }

        this.initialPosition = [
            2 + Math.floor(Math.random() * (this.size - 4)),
            2 + Math.floor(Math.random() * (this.size - 4))
        ];

        return this;
    }

    Game.prototype = {
        contains: function (position) {
            return position[0] >= 0
                && position[0] < this.size
                && position[1] >= 0
                && position[1] < this.size;
        },

        iterator: function () {
            var position = [this.initialPosition[0], this.initialPosition[1]];

            return function iter () {
                var direction;

                if (this.contains(position)) {
                    direction = this.board[position[0]][position[1]];

                    position[0] += DIRECTION_TO_DELTA[direction][0];
                    position[1] += DIRECTION_TO_DELTA[direction][1];

                    return direction;
                }

                return undefined;
            }.bind(this);
        }
    };

    return Game;
})();

function statefullMap (iter, binaryFn, initial) {
    var state = initial;

    return function () {
        var element = iter();

        if (element == null) return;

        if (state == null) {
            state = element;
            return state;
        }

        return (state = binaryFn.call(element, state, element));
    };
}

function RelativeIterable (game) {
    return {
        iterator: function () {
            return statefullMap(game.iterator(), function (relativePosStr, directionStr) {
                var delta = DIRECTION_TO_DELTA[directionStr];
                var matchData = relativePosStr.match(/(-?\d+) (-?\d+)/);
                var rel0 = parseInt(matchData[0], 10);
                var rel1 = parseInt(matchData[1], 10);

                return '' + (rel0 + delta[0]) + ' ' + (rel1 + delta[1]);
            }, "0 0");
        }
    };
}

function tortoiseAndHareLoopDetector (iterable) {
    var tortoise = iterable.iterator();
    var hare = iterable.iterator();

    var tortoiseValue = tortoise();
    hare();
    var hareValue = hare();

    while (tortoiseValue != null && hareValue != null) {
        console.log('t: ' + tortoiseValue, 'h: ' + hareValue);

        if (tortoiseValue === hareValue) return true;

        tortoiseValue = tortoise();
        hare();
        hareValue = hare();
    }

    return false;
}

function terminates (game) {
    return !tortoiseAndHareLoopDetector(RelativeIterable(game));
}


console.log( terminates(new Game (4)) );
// console.log( terminates(new Game (16)) );
// console.log( terminates(new Game (8)) );
// console.log( terminates(new Game (4)) );

console.log("========= TRAMPOLINING ============");

function trampoline (fn) {
    return variadic(function (args) {
        var result = fn.apply(this, args);

        while (result instanceof Function) {
            result = result();
        }

        return result;
    });
}


function factorial (n) {
    var _factorial = trampoline(function myself (acc, n) {
        return n ? function () { return myself(acc * n, n - 1); } : acc;
    });

    return _factorial(1, n);
}

console.log( factorial(10) );
console.log( factorial(321) );
