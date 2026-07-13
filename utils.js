function calcularVPD(temp, umid) {
    if (temp == null || umid == null) return null;
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = svp * (umid / 100);
    return svp - avp;
}

function obterMaxMin(array) {
    const validos = array.filter(v => v !== null && !isNaN(v));
    if (validos.length === 0) return { max: 0, min: 0 };
    return {
        max: Math.max(...validos),
        min: Math.min(...validos)
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { obterMaxMin, calcularVPD };
}