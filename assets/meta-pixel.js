/* ==========================================================================
   Pixel da Meta — Mundo Matemágico
   ID: 923127513721683

   Código oficial da Meta, carregado de connect.facebook.net. NAO e uma copia
   local congelada como a que existia antes: se a Meta atualizar a biblioteca,
   o site acompanha.

   Fica em arquivo separado de proposito. Colado no HTML, obrigaria a liberar
   'unsafe-inline' na politica de seguranca do checkout, que hoje nao permite
   script embutido nenhum.

   ATENCAO: aqui entra so o ID do pixel, que e publico. O token da API de
   Conversoes NAO pode vir para ca - tudo neste arquivo e visivel para
   qualquer visitante, e com o token daria para enviar eventos falsos de
   compra e envenenar a otimizacao dos anuncios. Esse token so se usa em
   servidor, e na Cakto ele e configurado no painel dela.
   ========================================================================== */

(function (f, b, e, v, n, t, s) {
  if (f.fbq) { return; }
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) { f._fbq = n; }
  n.push = n;
  n.loaded = !0;
  n.version = '2.0';
  n.queue = [];
  t = b.createElement(e);
  t.async = !0;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
})(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '923127513721683');
fbq('track', 'PageView');
