const outputs = [];
const lines = []

const createLine = (from, to, filter) => {
    const line = document.createElement('div');
    line.classList.add('line');
    line.style.position = 'absolute';
    line.style.height = '1px';
    line.style.width = '10px';
    line.style.background = 'var(--color-foreground)';
    line.style.transformOrigin = 'top left';
    document.getElementById('output').appendChild(line);
    lines.push({ 'from': document.getElementById(from), 'to': document.getElementById(to), 'line': line, 'filter': filter });
}

const setLinePosition = (line, from, to) => {

    const fromBox = from.getBoundingClientRect();
    const toBox = to.getBoundingClientRect();
    const containerBox = line.parentNode.getBoundingClientRect();

    // const fromEdges = [[fromBox.left + fromBox.width / 2, fromBox.top], [fromBox.left + fromBox.width / 2, fromBox.bottom], [fromBox.left, fromBox.top + fromBox.height / 2], [fromBox.right, fromBox.top + fromBox.height / 2]];
    // const toEdges = [[toBox.left + toBox.width / 2, toBox.top], [toBox.left + toBox.width / 2, toBox.bottom], [toBox.left, toBox.top + toBox.height / 2], [toBox.right, toBox.top + toBox.height / 2]];
    // console.log(fromEdges);
    // console.log(toEdges);

    // // const fromEdges = [[fromBox.left, fromBox.top], [fromBox.left, fromBox.bottom], [fromBox.right, fromBox.top], [fromBox.right, fromBox.top]];
    // // const toEdges = [[toBox.left, toBox.top], [toBox.left, toBox.bottom], [toBox.right, toBox.top], [toBox.right, toBox.top]];

    // console.log([[fromBox.left, fromBox.top], [fromBox.left, fromBox.bottom], [fromBox.right, fromBox.top], [fromBox.right, fromBox.top]]);
    // console.log([[toBox.left, toBox.top], [toBox.left, toBox.bottom], [toBox.right, toBox.top], [toBox.right, toBox.top]]);
    // console.log('----');

    // var bestFrom = null;
    // var bestTo = null;
    // var bestDist = Infinity;

    // for (let checkFrom of fromEdges) {
    //     for (let checkTo of toEdges) {
    //         const distance = Math.sqrt(Math.pow(checkFrom[0] - checkTo[0], 2) + Math.pow(checkFrom[1] - checkTo[1], 2));
    //         if (distance <= bestDist) {
    //             bestDist = distance;
    //             bestFrom = checkFrom;
    //             bestTo = checkTo;
    //         }
    //     }
    // }

    var fromX = fromBox.left + fromBox.width / 2;
    var fromY = fromBox.bottom;
    var toX = toBox.left + toBox.width / 2;
    var toY = toBox.top;

    const startX = fromX - containerBox.x;
    const startY = fromY - containerBox.y;
    const endX = toX - containerBox.x;
    const endY = toY - containerBox.y;

    const angle = ((endX - startX) == 0 ? Math.PI / 2 : Math.atan((endY - startY) / (endX - startX))) + ((endX - startX) < 0 ? Math.PI : 0);
    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

    line.style.left = startX + 'px';
    line.style.top = startY + 'px';
    line.style.width = length + 'px';
    line.style.height = 2 + 'px';
    line.style.transform = `rotate(${angle}rad)`
}

const updateLines = () => {
    lines.forEach(line => {
        setLinePosition(line.line, line.from, line.to);
    });
}

const checkFilter = (filter, check) => {
    for (const [key, value] of Object.entries(filter))
        if (check[key] !== value)
            return false;
    return true;
}

const updateFlags = (flags) => {
    outputs.forEach((output) => {
        output.element.style.color = checkFilter(output.filter.true, flags) === true ? 'var(--color-tree-true)' : checkFilter(output.filter.false, flags) ? 'var(--color-tree-false)' : 'var(--color-tree-none)';
    });
    lines.forEach((line) => {
        line.line.style.background = checkFilter(line.filter, flags) ? 'var(--color-tree-true)' : 'var(--color-tree-none)';
    });
}

const initScript = () => {
    outputs.push({ 'element': document.getElementById('question-parallel'), 'filter': { 'true': { 'parallel': true }, 'false': { 'parallel': false } } });
    outputs.push({ 'element': document.getElementById('question-same'), 'filter': { 'true': { 'same': true }, 'false': { 'same': false } } });
    outputs.push({ 'element': document.getElementById('question-cuttingpoint'), 'filter': { 'true': { 'cuttingpoint': true }, 'false': { 'cuttingpoint': false } } });
    outputs.push({ 'element': document.getElementById('question-perpendicular'), 'filter': { 'true': { 'perpendicular': true }, 'false': { 'perpendicular': false } } });

    outputs.push({ 'element': document.getElementById('final-parallel'), 'filter': { 'true': { 'parallel': true, 'same': false }, 'false': {} } });
    outputs.push({ 'element': document.getElementById('final-same'), 'filter': { 'true': { 'same': true }, 'false': {} } });
    outputs.push({ 'element': document.getElementById('final-none'), 'filter': { 'true': { 'cuttingpoint': false }, 'false': {} } });
    outputs.push({ 'element': document.getElementById('final-cuttingpoint'), 'filter': { 'true': { 'cuttingpoint': true, 'perpendicular': false }, 'false': {} } });
    outputs.push({ 'element': document.getElementById('final-perpendicular'), 'filter': { 'true': { 'perpendicular': true }, 'false': {} } });

    createLine('question-parallel', 'question-same', { 'parallel': true });
    createLine('question-parallel', 'question-cuttingpoint', { 'parallel': false });
    createLine('question-cuttingpoint', 'question-perpendicular', { 'cuttingpoint': true });

    createLine('question-same', 'final-same', { 'same': true });
    createLine('question-same', 'final-parallel', { 'same': false });
    createLine('question-cuttingpoint', 'final-none', { 'cuttingpoint': false });
    createLine('question-perpendicular', 'final-perpendicular', { 'perpendicular': true });
    createLine('question-perpendicular', 'final-cuttingpoint', { 'perpendicular': false });

    addI18nUpdateListener(updateLines);
    window.onresize = updateLines;
    updateLines();
}
