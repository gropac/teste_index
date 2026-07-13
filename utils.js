function calcularVPD(temp, umid) {
    if (temp == null || umid == null) return null;
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = svp * (umid / 100);
    return svp - avp;
}

function obterMaxMin(array) {
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { obterMaxMin, calcularVPD };
}