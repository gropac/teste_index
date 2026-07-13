function calcularVPD(temp, umid) {
    if (temp == null || umid == null) return null;
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = svp * (umid / 100);
    return svp - avp;
}

if (typeof module !== 'undefined') {
    module.exports = { calcularVPD };
}
