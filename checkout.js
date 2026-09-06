/* ==========================================================================
   Checkout - Mundo Matemagico

   >>> UNICA COISA QUE VOCE PRECISA EDITAR ESTA LOGO ABAIXO <<<

   Cada oferta cadastrada na plataforma de pagamento tem um link no formato:
       https://pay.cakto.com.br/xxxxxxx
   Cole o link de cada plano no campo "pay" correspondente.

   Enquanto o link nao for colado, o botao de compra fica desativado de
   proposito - para nenhum cliente clicar e cair em pagina quebrada.
   ========================================================================== */

var PLANOS = {

  basico: {
    nome: 'Plano Básico',
    desc: '298 páginas — Mundo Matemágico 1º ao 5º ano, em PDF.',
    img: 'assets/Loja_LK_Post_-_Matematica_4_Operacoes-1-1024x1024.png',
    preco: 1290,          // R$ 12,90  (sempre em centavos)
    de: null,             // sem preco riscado
    parcelas: null,       // sem parcelamento
    resumo: '298 páginas em PDF · pagamento único',
    inclui: [
      '298 páginas do Mundo Matemágico — 1º ao 5º ano',
      'Arquivo em PDF, pronto para imprimir',
      'Impressão ilimitada',
      'Acesso vitalício ao material',
      'Envio imediato por e-mail'
    ],

    pay: 'https://pay.cakto.com.br/3x2uik7_1081866'
  },

  premium: {
    nome: 'Plano Premium',
    desc: 'Todos os materiais inclusos, em versão editável.',
    img: 'assets/bonus-Loja_LK_Post_-_Matematica_4_Operacoes_2-777x1024.png',
    preco: 2490,          // R$ 24,90 - confere com o cadastro na plataforma e com a landing
    de: 9700,             // R$ 97,00 riscado
    parcelas: "em até 3x no cartão",  // valor da parcela nao anunciado: depende da config de juros da plataforma
    selo: '⚡ Mais vendido',
    resumo: 'Todos os materiais · versão editável',
    inclui: [
      'Mundo Matemágico 1º ao 5º ano — Editável',
      'Unidades de Medida do 1º ao 5º ano — Editável',
      'Mural da Tabuada',
      'Uno das 4 operações',
      'Frações',
      'Acesso vitalício ao conteúdo',
      'Envio imediato por e-mail (em PDF)'
    ],

    pay: 'https://pay.cakto.com.br/hod657w_1081890'
  }

};

/* ========================================================================
   Daqui para baixo nao precisa mexer.
   ======================================================================== */

(function () {
  'use strict';

  var PREFIXO_PAGAMENTO = 'https://pay.cakto.com.br/';
  var GUARDA = 'mm-checkout-identificacao';

  var planoAtual = null;

  function el(id) { return document.getElementById(id); }

  function brl(centavos) {
    return 'R$ ' + (centavos / 100).toFixed(2).replace('.', ',');
  }

  function configurado(plano) {
    return typeof plano.pay === 'string' && plano.pay.indexOf(PREFIXO_PAGAMENTO) === 0;
  }

  var CHECK = '<svg viewBox="0 0 512 512" aria-hidden="true"><path d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z"/></svg>';

  /* ======================= identificacao do cliente ======================= */

  /* "chave" e o nome do parametro que a Cakto espera na URL do checkout.
     Nao invente nomes aqui: sao os documentados em
     ajuda.cakto.com.br -> "Como usar URL para checkout pre-preenchido".
     Errar o nome nao da erro nenhum - o campo simplesmente chega vazio
     do outro lado, e o cliente digita tudo de novo. */
  var CAMPOS = [
    {
      id: 'f-email', box: 'campo-email', chave: 'email',
      valida: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
    },
    {
      id: 'f-nome', box: 'campo-nome', chave: 'name',
      valida: function (v) { return v.trim().split(/\s+/).length >= 2; }
    },
    {
      id: 'f-fone', box: 'campo-fone', chave: 'phone',
      valida: function (v) {
        var d = v.replace(/\D/g, '');
        return d.length === 10 || d.length === 11;
      },
      /* a Cakto exige o codigo do pais na frente, senao ignora o numero */
      formata: function (v) { return '55' + v.replace(/\D/g, ''); },
      mascara: function (v) { return mascaraTelefone(v); }
    },
    {
      id: 'f-cpf', box: 'campo-cpf', chave: 'cpf',
      valida: function (v) { return cpfValido(v); },
      /* a Cakto espera so os digitos, sem ponto nem traco */
      formata: function (v) { return v.replace(/\D/g, ''); },
      mascara: function (v) { return mascaraCPF(v); }
    }
  ];

  /* (11) 91234-5678 */
  function mascaraTelefone(v) {
    var d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) { return d; }
    if (d.length <= 6) { return '(' + d.slice(0, 2) + ') ' + d.slice(2); }
    if (d.length <= 10) { return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6); }
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  /* 000.000.000-00 */
  function mascaraCPF(v) {
    var d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) { return d; }
    if (d.length <= 6) { return d.slice(0, 3) + '.' + d.slice(3); }
    if (d.length <= 9) { return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6); }
    return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9);
  }

  /* Confere os dois digitos verificadores. Sem isto, um numero digitado
     errado so seria recusado la no pagamento, depois de o cliente achar
     que ja tinha terminado. */
  function cpfValido(v) {
    var d = v.replace(/\D/g, '');
    if (d.length !== 11) { return false; }
    if (/^(\d)\1{10}$/.test(d)) { return false; }   /* 111.111.111-11 e afins */

    var i, soma, resto;

    soma = 0;
    for (i = 0; i < 9; i++) { soma += parseInt(d.charAt(i), 10) * (10 - i); }
    resto = soma % 11;
    if (parseInt(d.charAt(9), 10) !== (resto < 2 ? 0 : 11 - resto)) { return false; }

    soma = 0;
    for (i = 0; i < 10; i++) { soma += parseInt(d.charAt(i), 10) * (11 - i); }
    resto = soma % 11;
    return parseInt(d.charAt(10), 10) === (resto < 2 ? 0 : 11 - resto);
  }

  /* Vira true na primeira tentativa de avancar. Antes disso, campo vazio nao
     e acusado como erro - ninguem gosta de ver o formulario ficar vermelho
     antes de ter tido a chance de preencher. Depois, vazio conta como erro. */
  var exigirTudo = false;

  function estaErrado(campo) {
    var v = el(campo.id).value;
    if (v.trim() === '') { return exigirTudo; }
    return !campo.valida(v);
  }

  /* Criterio para liberar o botao de compra: aqui vazio sempre pesa. */
  function incompleto(campo) {
    var v = el(campo.id).value;
    return v.trim() === '' || !campo.valida(v);
  }

  function primeiroPendente() {
    for (var i = 0; i < CAMPOS.length; i++) {
      if (incompleto(CAMPOS[i])) { return CAMPOS[i]; }
    }
    return null;
  }

  function marcar(campo, mostrarErro) {
    el(campo.box).classList.toggle('invalido', mostrarErro && estaErrado(campo));
  }

  function rolarPara(alvo, bloco) {
    var suave = !(window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    alvo.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: bloco || 'center' });
  }

  /* Aponta o primeiro campo pendente e leva o cliente ate ele. */
  function cobrarPendencias() {
    exigirTudo = true;
    CAMPOS.forEach(function (c) { marcar(c, true); });
    var falta = primeiroPendente();
    if (falta) {
      rolarPara(el(falta.box), 'center');
      el(falta.id).focus({ preventScroll: true });
    }
    return falta;
  }

  function guardar() {
    var dados = {};
    CAMPOS.forEach(function (c) { dados[c.chave] = el(c.id).value; });
    try { localStorage.setItem(GUARDA, JSON.stringify(dados)); }
    catch (e) { /* navegacao privada ou storage cheio: segue sem guardar */ }
  }

  function restaurar() {
    var dados;
    try { dados = JSON.parse(localStorage.getItem(GUARDA)) || {}; }
    catch (e) { dados = {}; }
    CAMPOS.forEach(function (c) {
      if (typeof dados[c.chave] === 'string') { el(c.id).value = dados[c.chave]; }
    });
  }

  function ligarCampos() {
    CAMPOS.forEach(function (campo) {
      var input = el(campo.id);

      input.addEventListener('input', function () {
        if (campo.mascara) { input.value = campo.mascara(input.value); }
        marcar(campo, false);   /* enquanto digita, nao acusa erro */
        guardar();
        atualizarLink();
      });

      input.addEventListener('blur', function () {
        marcar(campo, true);    /* ao sair do campo, aponta o que esta errado */
      });
    });
  }

  /* ================== link final para o checkout externo ================= */

  function atualizarLink() {
    var cta = el('cta');
    var aviso = el('aviso');
    var p = PLANOS[planoAtual];

    if (!configurado(p)) {
      cta.removeAttribute('href');
      cta.setAttribute('aria-disabled', 'true');
      cta.textContent = 'LINK DE PAGAMENTO NÃO CONFIGURADO';
      el('aviso-plano').textContent = p.nome;
      aviso.classList.add('on');
      return;
    }

    aviso.classList.remove('on');

    /* Sem os quatro campos validos o botao fica travado: o objetivo e que
       ninguem chegue no pagamento com dado faltando ou errado. */
    if (primeiroPendente()) {
      cta.removeAttribute('href');
      cta.setAttribute('aria-disabled', 'true');
      cta.textContent = 'PREENCHA SEUS DADOS ACIMA';
      return;
    }

    /* leva os dados preenchidos para o cliente nao digitar tudo de novo */
    var extras = [];
    CAMPOS.forEach(function (c) {
      var v = el(c.id).value.trim();
      if (c.formata) { v = c.formata(v); }
      extras.push(encodeURIComponent(c.chave) + '=' + encodeURIComponent(v));

      /* a Cakto tem campo de confirmacao de e-mail; sem isto o cliente
         digitaria o mesmo endereco duas vezes do outro lado */
      if (c.chave === 'email') {
        extras.push('confirmEmail=' + encodeURIComponent(v));
      }
    });

    cta.href = p.pay + '?' + extras.join('&');
    cta.removeAttribute('aria-disabled');
    cta.textContent = 'IR PARA O PAGAMENTO SEGURO';
  }

  /* ====================== cartoes de escolha de plano ===================== */

  function montarSeletor(atual) {
    var alvo = el('planos');
    alvo.innerHTML = '';

    Object.keys(PLANOS).forEach(function (chave) {
      var p = PLANOS[chave];

      var label = document.createElement('label');
      label.className = 'plano';

      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'plano';
      input.value = chave;
      input.checked = (chave === atual);

      var marca = document.createElement('span');
      marca.className = 'marca';
      marca.setAttribute('aria-hidden', 'true');

      var corpo = document.createElement('span');
      corpo.className = 'corpo';

      var titulo = document.createElement('span');
      titulo.className = 'titulo';
      titulo.appendChild(document.createTextNode(p.nome));
      if (p.selo) {
        var selo = document.createElement('span');
        selo.className = 'selo';
        selo.textContent = p.selo;
        titulo.appendChild(selo);
      }

      var resumo = document.createElement('span');
      resumo.className = 'resumo';
      resumo.textContent = p.resumo;

      var linha = document.createElement('span');
      linha.className = 'linha-preco';

      var preco = document.createElement('span');
      preco.className = 'p';
      preco.textContent = brl(p.preco);
      linha.appendChild(preco);

      if (p.de) {
        var de = document.createElement('span');
        de.className = 'p-de';
        de.textContent = brl(p.de);
        linha.appendChild(de);
      }
      if (p.parcelas) {
        var parc = document.createElement('span');
        parc.className = 'p-parc';
        parc.textContent = 'ou ' + p.parcelas;
        linha.appendChild(parc);
      }

      corpo.appendChild(titulo);
      corpo.appendChild(resumo);
      corpo.appendChild(linha);

      label.appendChild(input);
      label.appendChild(marca);
      label.appendChild(corpo);
      alvo.appendChild(label);

      input.addEventListener('change', function () {
        if (input.checked) { render(chave); }
      });
    });
  }

  /* ===================== carrinho, inclusos e resumo ====================== */

  function render(chave) {
    planoAtual = chave;
    var p = PLANOS[chave];

    /* carrinho */
    el('item-img').src = p.img;
    el('item-img').alt = p.nome + ' — Mundo Matemágico';
    el('item-nome').textContent = p.nome;
    el('item-desc').textContent = p.desc;
    el('item-preco').textContent = brl(p.preco);

    var de = el('item-de');
    if (p.de) { de.textContent = brl(p.de); de.hidden = false; }
    else { de.hidden = true; }

    /* o que esta incluso */
    var lista = el('inclui');
    lista.innerHTML = '';
    p.inclui.forEach(function (txt) {
      var li = document.createElement('li');
      li.innerHTML = CHECK;
      li.appendChild(document.createTextNode(txt));
      lista.appendChild(li);
    });

    /* resumo */
    el('sub-nome').textContent = p.nome;
    el('sub-valor').textContent = brl(p.preco);
    el('total').textContent = brl(p.preco);
    el('parcelado').textContent = p.parcelas ? 'ou ' + p.parcelas : 'Pagamento único';

    atualizarLink();

    /* mantem a URL coerente com o plano escolhido, sem recarregar */
    try {
      var u = new URL(window.location.href);
      u.searchParams.set('plano', chave);
      history.replaceState(null, '', u);
    } catch (e) { /* navegador antigo: ignora */ }

    document.title = p.nome + ' — Checkout Mundo Matemágico';
  }

  /* --------- qual plano veio da landing? ?plano=basico | premium --------- */
  function planoInicial() {
    var p = new URLSearchParams(window.location.search).get('plano');
    if (p) { p = p.toLowerCase().trim(); }
    return PLANOS[p] ? p : 'premium';
  }

  /* ================================ inicio =============================== */

  document.addEventListener('DOMContentLoaded', function () {
    restaurar();
    ligarCampos();

    var inicial = planoInicial();
    montarSeletor(inicial);
    render(inicial);

    /* Atalho: desce ate o botao de compra, ou cobra o que falta antes. */
    el('descer').addEventListener('click', function () {
      if (cobrarPendencias()) { return; }
      rolarPara(el('cta'), 'center');
    });

    el("cta").addEventListener("click", function (ev) {
      if (el("cta").getAttribute("aria-disabled") === "true") {
        ev.preventDefault();
        cobrarPendencias();   /* mostra o que falta em vez de so nao reagir */
        return;
      }

      /* Avisa o Pixel que a pessoa saiu daqui para pagar. E o ultimo evento
         que este site consegue medir: a compra em si acontece na Cakto, e
         quem informa a Meta e o painel dela. */
      if (typeof fbq === "function") {
        var p = PLANOS[planoAtual];
        fbq("track", "InitiateCheckout", {
          content_name: p.nome,
          value: p.preco / 100,
          currency: "BRL"
        });
      }
    });
  });

})();
