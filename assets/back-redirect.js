/* ==========================================================================
   Back-redirect — UTMify

   Quando o visitante aperta "voltar" no checkout, em vez de sair do site ele
   cai na pagina de vendas, direto na secao de precos.

   DISPARA UMA VEZ SO POR VISITA
   Essa e a diferenca principal para o script de exemplo da UTMify. No exemplo,
   o visitante fica preso: volta para a oferta, aperta voltar de novo, cai no
   checkout, volta para a oferta... sem fim. Pelo botao voltar ele nunca sai
   do site — so fechando a aba. Medido na pratica, quatro cliques seguidos
   alternando entre as duas paginas.

   Aqui, o primeiro "voltar" leva para a oferta e marca a sessao. A partir do
   segundo, o voltar funciona normalmente e a pessoa sai se quiser. Da a
   segunda chance de convencer sem prender ninguem.

   A marca fica em sessionStorage: vale so para aquela aba e some quando ela e
   fechada. Se a pessoa voltar depois numa aba nova, ganha uma nova chance.

   UMA PEGADA FALSA, NAO TRES
   O exemplo da UTMify empilha tres entradas no historico. Com disparo unico
   isso atrapalha: as duas sobrando ficariam no caminho e a pessoa precisaria
   de varios cliques para enfim sair. Com uma, a saida fica limpa —
   voltar leva a oferta, voltar de novo ao checkout, voltar de novo sai.

   Fica so no checkout, de proposito: pega quem ja demonstrou intencao de
   compra e esta desistindo. Na landing, prenderia tambem quem chegou por
   engano e so quer voltar para o anuncio.

   Em arquivo separado pelo mesmo motivo do meta-pixel.js: o checkout nao
   permite script inline (nao tem unsafe-inline no script-src).

   A QUERY VEM ANTES DA ANCORA
   O exemplo da UTMify monta a URL como destino + "?" + query atual. Isso
   quebra quando o destino tem ancora: "index.html#oferta?utm_source=..."
   joga tudo depois do "#" para dentro do fragmento, entao as UTMs sairiam da
   query string (perdendo a atribuicao da venda) e a ancora viraria
   "oferta?utm_source=...", que nao corresponde a nenhum id e por isso nem
   rolaria ate a oferta. montar() insere a query ANTES do "#".
   ========================================================================== */

(function () {

  /* Para trocar o destino, mude so esta linha. */
  var DESTINO = 'index.html#oferta';

  var MARCA = 'mms-back-redirect-usado';

  /* sessionStorage pode lancar excecao em modo anonimo ou com cookies
     bloqueados. Nesse caso seguimos sem marca: o pior caso e o visitante
     ganhar a segunda chance mais de uma vez, nunca a pagina quebrar. */
  function jaUsado() {
    try { return sessionStorage.getItem(MARCA) === '1'; } catch (e) { return false; }
  }

  function marcarUsado() {
    try { sessionStorage.setItem(MARCA, '1'); } catch (e) { /* segue sem marca */ }
  }

  if (jaUsado()) { return; }

  /* Leva os parametros da URL atual adiante, para a campanha continuar
     atribuida depois do redirecionamento. */
  function montar(destino) {
    var busca = document.location.search.replace(/^\?/, '');
    if (!busca) { return destino; }

    var corte = destino.indexOf('#');
    var base = corte >= 0 ? destino.slice(0, corte) : destino;
    var ancora = corte >= 0 ? destino.slice(corte) : '';

    return base + (base.indexOf('?') >= 0 ? '&' : '?') + busca + ancora;
  }

  var url = montar(DESTINO);

  /* A entrada extra e o que o "voltar" consome, em vez de tirar a pessoa
     do site. */
  history.pushState({}, '', location.href);

  window.addEventListener('popstate', function aoVoltar() {
    window.removeEventListener('popstate', aoVoltar);
    marcarUsado();
    setTimeout(function () { location.href = url; }, 1);
  });

})();
