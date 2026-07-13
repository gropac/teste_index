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
