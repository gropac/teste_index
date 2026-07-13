const fs = require('fs');

function obterMaxMinOriginal(array) {
    const validos = array.filter(v => v !== null && !isNaN(v));
    if (validos.length === 0) return { max: 0, min: 0 };
    return {
        max: Math.max(...validos),
        min: Math.min(...validos)
    };
}

function obterMaxMinOptimized(array) {
    let max = -Infinity;
    let min = Infinity;
    let hasValid = false;
    for (let i = 0; i < array.length; i++) {
        const v = array[i];
        if (v !== null && !isNaN(v)) {
            hasValid = true;
            if (v > max) max = v;
            if (v < min) min = v;
        }
    }
    if (!hasValid) return { max: 0, min: 0 };
    return { max, min };
}

// Generate large array
const size = 100000;
const testArray = [];
for (let i = 0; i < size; i++) {
    testArray.push(Math.random() * 100);
}
// Add some nulls and NaNs
testArray.push(null);
testArray.push(NaN);

// Benchmark original
let startOriginal = performance.now();
for(let i = 0; i < 100; i++) {
    try {
        obterMaxMinOriginal(testArray);
    } catch(e) {
        // catch stack overflow
    }
}
let endOriginal = performance.now();
console.log("Original time:", endOriginal - startOriginal, "ms");

// Benchmark optimized
let startOptimized = performance.now();
for(let i = 0; i < 100; i++) {
    obterMaxMinOptimized(testArray);
}
let endOptimized = performance.now();
console.log("Optimized time:", endOptimized - startOptimized, "ms");

// Check stack overflow limit
const hugeSize = 1000000;
const hugeArray = new Array(hugeSize).fill(1);
try {
    obterMaxMinOriginal(hugeArray);
    console.log("Original handled huge array");
} catch(e) {
    console.log("Original failed on huge array:", e.message);
}

try {
    obterMaxMinOptimized(hugeArray);
    console.log("Optimized handled huge array");
} catch(e) {
    console.log("Optimized failed on huge array:", e.message);
}

const feeds = [];
for (let i = 0; i < 10000; i++) {
  feeds.push({ created_at: new Date(Date.now() - i * 10000).toISOString() });
}

console.time('baseline');
const historicoHorarios1 = [];
feeds.forEach(feed => {
    const dataHora = new Date(feed.created_at);
    historicoHorarios1.push(dataHora.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }));
});
console.timeEnd('baseline');

console.time('optimized');
const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const historicoHorarios2 = [];
feeds.forEach(feed => {
    const dataHora = new Date(feed.created_at);
    historicoHorarios2.push(formatter.format(dataHora));
});
console.timeEnd('optimized');
