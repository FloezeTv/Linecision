const verifyNumber = (event) => {
    if (event.target.value.indexOf(',') >= 0)
        event.target.value = event.target.value.replace(/,/gi, '')

    if (isNaN(parseFloat(event.target.value)))
        event.target.setCustomValidity(getStringForJs('error.input.nan'));
    else
        event.target.setCustomValidity('');
}

const setNumFields = (element, fields) => {
    while (element.children.length > fields)
        element.removeChild(element.lastChild);
    while (element.children.length < fields) {
        const n = document.createElement("input");
        n.type = 'text';
        n.onchange = verifyNumber;
        element.appendChild(n);
    }
};

const decisionTree = {
    function: (line1, line2) => line1.isParallel(line2),
    flag: 'parallel',
    true: {
        function: (line1, line2) => line1.hasPoint(line2.start),
        flag: 'same',
        true: null,
        false: null,
    },
    false: {
        function: (line1, line2) => !!line1.cuttingPoint(line2),
        flag: 'cuttingpoint',
        true: {
            function: (line1, line2) => line1.direction.scalarProduct(line2.direction) === 0,
            flag: 'perpendicular',
            true: null,
            false: null,
        },
        false: null,
    },
}

console.log('decisionTree:', decisionTree);

class Linecision {

    constructor(line1, line2, dimensions = 3) {
        // validate lines
        if (Object.keys(line1).indexOf('start') < 0 || Object.keys(line1).indexOf('direction') < 0)
            throw new Error("Line 1 is missing either a 'start' or a 'direction'.");
        if (Object.keys(line2).indexOf('start') < 0 || Object.keys(line2).indexOf('direction') < 0)
            throw new Error("Line 2 is missing either a 'start' or a 'direction'.");

        this.line1 = line1;
        this.line2 = line2;
        this.lines = [line1, line2];
        this.dimensions = dimensions;
        this.updateVectors();

        console.log('Linecision initialised with', this.dimensions, 'dimensions and the following vectors:', this.lines);
    }

    updateVectors() {
        this.lines.forEach(line => {
            setNumFields(line.start, this.dimensions);
            setNumFields(line.direction, this.dimensions);
        });
    }

    calculate() {
        console.log('calculating now!');

        const start1 = new Vector(...[...this.line1.start.children].map(e => parseFloat(e.value) || 0));
        const direction1 = new Vector(...[...this.line1.direction.children].map(e => parseFloat(e.value) || 0));
        const start2 = new Vector(...[...this.line2.start.children].map(e => parseFloat(e.value) || 0));
        const direction2 = new Vector(...[...this.line2.direction.children].map(e => parseFloat(e.value) || 0));

        const line1 = new Line(start1, direction1);
        const line2 = new Line(start2, direction2);

        const flags = this.calculateRec(line1, line2, decisionTree);

        console.log('flags', flags);

        return flags;
    }

    calculateRec(line1, line2, tree, flags = {}) {
        const result = tree.function(line1, line2);
        flags[tree.flag] = result;
        const newTree = result ? tree.true : tree.false;
        if (newTree)
            return this.calculateRec(line1, line2, newTree, flags);
        return flags;
    }

    setDimensons(dimensions) {
        this.dimensions = dimensions;
        this.updateVectors();
    }
}

class Line {
    constructor(start, direction) {
        if (start.getDimensions() != direction.getDimensions())
            throw new Error("start and direction have different dimensions!");
        this.start = start;
        this.direction = direction;
    }

    getDimensions() {
        if (this.start.getDimensions() != this.direction.getDimensions())
            throw new Error("start and direction have different dimensions!");
        return this.start.getDimensions();
    }

    isSame(other) {
        return this.isParallel(other) && this.hasPoint(other.start);
    }

    isParallel(other) {
        return !isNaN(this.direction.linearDependence(other.direction));
    }

    hasPoint(point) {
        // A = B + m * r
        // A - B = m * r
        return !isNaN(point.minus(this.start).linearDependence(this.direction));
    }

    cuttingPoint(other) {
        // if one dimensional, every line is the same
        if (this.getDimensions() <= 1)
            return new Vector(undefined);

        const equations = this.getEquations(other);

        for (let eq1idx = 0; eq1idx < this.getDimensions(); eq1idx++) {
            for (let eq2idx = eq1idx + 1; eq2idx < this.getDimensions(); eq2idx++) {
                var eq1 = equations[eq1idx];
                var eq2 = equations[eq2idx];
                var eq = eq1.minus(eq2.multiply(eq1.d / eq2.d));
                if (eq.b === 0) {
                    // l is gone too!
                    if (eq.a === eq.c) // equation correct
                        continue; // switch equations and try again
                    else // equation incorrect
                        return undefined; // no cutting point
                }
                var l = eq.getL(0); // 0, because value of u doesn't matter because of calculations above (d = 0)
                var u = eq1.getU(l);
                // check if correct for everyone
                for (let checkeq of equations)
                    if (!checkeq.check(l, u))
                        return undefined; // no cutting point
                return this.start.plus(this.direction.multiply(l)); // cutting point
            }
        }
    }

    getEquations(other) {
        const equations = [];
        for (let i = 0; i < this.getDimensions(); i++)
            equations.push(new Equation(this.start.get(i), this.direction.get(i), other.start.get(i), other.direction.get(i)));
        return equations;
    }
}

// technically a one dimensional line, but this has some additional methods
class Equation {

    // equation: a + l * b = c + u * d   ; l, u in R
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }

    multiply(factor) {
        return new Equation(this.a * factor, this.b * factor, this.c * factor, this.d * factor);
    }

    minus(other) {
        return new Equation(this.a - other.a, this.b - other.b, this.c - other.c, this.d - other.d);
    }

    getL(u) {
        // a + l * b = c + u * d
        // l * b = c + u * d - a
        // l = (c + u * d - a) / b
        return (this.c + u * this.d - this.a) / this.b;
    }

    getU(l) {
        // a + l * b = c + u * d
        // a + l * b - c = u * d
        // (a + l * b - c) / d = u
        return (this.a + l * this.b - this.c) / this.d;
    }

    check(l, u) {
        // a + l * b = c + u * d
        return this.a + l * this.b === this.c + u * this.d;
    }
}

class Vector {
    constructor(...values) {
        if (values.length <= 0)
            throw new Error("0-dimensional vector is not allowed!");
        this.values = values;
    }

    get(i) {
        return this.values[i];
    }

    getDimensions() {
        return this.values.length;
    }

    linearDependence(other) {
        this.verifySameDimension(other);

        const fac = other.values[0] / this.values[0];
        for (let i = 1; i < this.getDimensions(); i++)
            if (other.values[i] / this.values[i] !== fac)
                return NaN;
        return fac;
    }

    minus(other) {
        this.verifySameDimension(other);

        return new Vector(...new Array(this.getDimensions()).fill(undefined).map((e, i) => this.values[i] - other.values[i]));
    }

    plus(other) {
        this.verifySameDimension(other);

        return new Vector(...new Array(this.getDimensions()).fill(undefined).map((e, i) => this.values[i] + other.values[i]));
    }

    // ONLY MULTIPLY WITH NUMBER!
    multiply(number) {
        return new Vector(...new Array(this.getDimensions()).fill(undefined).map((e, i) => this.values[i] * number));
    }

    scalarProduct(other) {
        this.verifySameDimension(other);

        let result = 0;
        for (let i = 0; i < this.getDimensions(); i++)
            result += this.values[i] * other.values[i];
        return result;
    }

    verifySameDimension(other) {
        if (other.getDimensions() !== this.getDimensions())
            throw new Error("Tried to perform calculation on two Vectors with different dimensionality!");
    }

    static fromDimensions(dimensions) {
        const arr = [];
        for (let i = 0; i < dimensions; i++)
            arr.push(0);
        return new Vector(...arr);
    }
}