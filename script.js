
function mostrarPagina(nome) {
    const paginas = document.querySelectorAll(".pagina");

    paginas.forEach(function(pagina) {
        pagina.classList.remove("ativa");
    });

    document.getElementById(nome).classList.add("ativa");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function filtrarGolpes() {
    const pesquisa = document
        .getElementById("pesquisaGolpe")
        .value.toLowerCase();

    const golpes = document.querySelectorAll(".golpe");
    let encontrados = 0;

    golpes.forEach(function(golpe) {
        const texto = golpe.innerText.toLowerCase();

        if (texto.includes(pesquisa)) {
            golpe.style.display = "block";
            encontrados++;
        } else {
            golpe.style.display = "none";
        }
    });

    document.getElementById("semResultado").hidden = encontrados > 0;
}

function responderIA() {
    const campo = document.getElementById("perguntaIA");
    const resposta = document.getElementById("respostaIA");

    const pergunta = campo.value.toLowerCase().trim();

    if (pergunta === "") {
        resposta.textContent = "Digite uma dúvida para receber orientação.";
        return;
    }

    let orientacao = "";

    if (
        pergunta.includes("pix") ||
        pergunta.includes("transferência") ||
        pergunta.includes("transferencia")
    ) {
        orientacao =
            "Atenção com pedidos de Pix e transferências. Confira o nome do destinatário e o valor antes de confirmar. Se já transferiu e suspeita de fraude, procure seu banco imediatamente pelos canais oficiais.";
    }

    else if (
        pergunta.includes("whatsapp") ||
        pergunta.includes("número novo") ||
        pergunta.includes("numero novo")
    ) {
        orientacao =
            "Se alguém conhecido pedir dinheiro por um número novo, confirme a identidade por uma ligação ou por outro contato que você já conhece. Não faça a transferência antes de confirmar.";
    }

    else if (
        pergunta.includes("link") ||
        pergunta.includes("cliquei") ||
        pergunta.includes("phishing")
    ) {
        orientacao =
            "Links suspeitos podem levar a páginas falsas. Não informe senhas ou códigos. Acesse sua conta diretamente pelo aplicativo ou site oficial. Se você informou seus dados, procure o serviço afetado pelos canais oficiais.";
    }

    else if (
        pergunta.includes("banco") ||
        pergunta.includes("senha") ||
        pergunta.includes("código") ||
        pergunta.includes("codigo")
    ) {
        orientacao =
            "Nunca compartilhe senhas ou códigos de verificação por mensagens ou ligações. Se alguém estiver se passando por funcionário do banco, encerre o contato e procure o banco pelo aplicativo ou telefone oficial.";
    }

    else if (
        pergunta.includes("loja") ||
        pergunta.includes("compra") ||
        pergunta.includes("produto")
    ) {
        orientacao =
            "Antes de comprar, pesquise a reputação da loja, confira se o endereço do site está correto e desconfie de ofertas muito abaixo do preço normal. Evite pagar antes de verificar a empresa.";
    }

    else if (
        pergunta.includes("golpe") ||
        pergunta.includes("fraude") ||
        pergunta.includes("caí") ||
        pergunta.includes("cai")
    ) {
        orientacao =
            "Se você suspeita que sofreu um golpe, entre em contato com seu banco ou serviço envolvido pelos canais oficiais, proteja suas contas e preserve as mensagens e comprovantes. Peça ajuda a uma pessoa de confiança.";
    }

    else {
        orientacao =
            "Não encontrei uma orientação específica para essa pergunta. Desconfie de pedidos urgentes, não compartilhe dados pessoais e procure o canal oficial da empresa envolvida. Você também pode consultar o Radar de Golpes do SafeWay.";
    }

    resposta.textContent = "Orientação do SafeWay: " + orientacao;
}
