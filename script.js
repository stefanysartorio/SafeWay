function mostrarPagina(nome) {
  document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
  const pagina = document.getElementById(nome);
  if (pagina) pagina.classList.add("ativa");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (nome === "radar" && !window.noticiasCarregadas) carregarNoticias();
}

function avisarPlano() {
  alert("Os planos Premium são demonstrativos nesta versão. Ainda não há contratação ou pagamento ativo.");
}

async function carregarNoticias() {
  const lista = document.getElementById("listaNoticias");
  const status = document.getElementById("statusNoticias");
  const botao = document.getElementById("atualizarNoticias");
  lista.innerHTML = "";
  status.textContent = "Consultando fontes...";
  botao.disabled = true;

  try {
    const resposta = await fetch("/api/news");
    const tipo = resposta.headers.get("content-type") || "";
    if (!tipo.includes("application/json")) {
      throw new Error("O servidor não retornou dados JSON. Confira se o SafeWay foi aberto em http://localhost:3000.");
    }
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.error || "Não foi possível consultar as notícias.");

    if (!dados.items || dados.items.length === 0) {
      lista.innerHTML = '<p class="cartao">Nenhuma publicação recente foi encontrada. Tente novamente mais tarde.</p>';
    } else {
      dados.items.forEach(item => {
        const card = document.createElement("article");
        card.className = "cartao noticia";
        const titulo = document.createElement("h3");
        titulo.textContent = item.title;
        const meta = document.createElement("p");
        meta.className = "meta-noticia";
        meta.textContent = `${item.source || "Fonte externa"} • ${formatarData(item.pubDate)}`;
        const resumo = document.createElement("p");
        resumo.textContent = item.description || "Abra a publicação original para consultar os detalhes.";
        const link = document.createElement("a");
        link.href = item.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Ler publicação original ↗";
        card.append(titulo, meta, resumo, link);
        lista.appendChild(card);
      });
    }
    status.textContent = `Última consulta: ${new Date().toLocaleString("pt-BR")}.`;
    window.noticiasCarregadas = true;
  } catch (erro) {
    lista.innerHTML = "";
    const aviso = document.createElement("p");
    aviso.className = "cartao";
    aviso.textContent = `${erro.message} Confira se o servidor está iniciado.`;
    lista.appendChild(aviso);
    status.textContent = "Falha na consulta.";
  } finally {
    botao.disabled = false;
  }
}

function formatarData(valor) {
  if (!valor) return "Data não informada";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "Data não informada" : data.toLocaleDateString("pt-BR");
}

function adicionarFala(texto, tipo) {
  const historico = document.getElementById("historicoChat");
  const fala = document.createElement("div");
  fala.className = `fala ${tipo === "usuario" ? "fala-usuario" : "fala-assistente"}`;
  const nome = document.createElement("strong");
  nome.textContent = tipo === "usuario" ? "Você:" : "SafeWay:";
  const paragrafo = document.createElement("p");
  paragrafo.textContent = texto;
  fala.append(nome, paragrafo);
  historico.appendChild(fala);
  historico.scrollTop = historico.scrollHeight;
  return fala;
}

const formularioChat = document.getElementById("formChat");
if (formularioChat) {
  formularioChat.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const campo = document.getElementById("perguntaIA");
    const botao = document.getElementById("enviarChat");
    const pergunta = campo.value.trim();
    if (!pergunta) return;

    adicionarFala(pergunta, "usuario");
    campo.value = "";
    botao.disabled = true;
    botao.textContent = "Aguarde...";
    const carregando = adicionarFala("Estou verificando sua pergunta...", "assistente");

    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: pergunta })
      });
      const tipo = resposta.headers.get("content-type") || "";
      if (!tipo.includes("application/json")) {
        throw new Error("Resposta inesperada do servidor. Verifique se você abriu o SafeWay em localhost:3000.");
      }
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.error || "Não foi possível obter uma resposta.");
      carregando.querySelector("p").textContent = dados.answer;
    } catch (erro) {
      carregando.querySelector("p").textContent = erro.message;
    } finally {
      botao.disabled = false;
      botao.textContent = "Enviar pergunta ➤";
      campo.focus();
    }
  });
}

function analisarMensagemSuspeita() {
  const campo = document.getElementById("textoSuspeito");
  const resultado = document.getElementById("resultadoAnalise");
  const texto = campo.value.trim().toLowerCase();
  if (!texto) {
    resultado.textContent = "Digite uma mensagem sem dados pessoais para analisar.";
    resultado.className = "resultado-analise resultado-atencao";
    return;
  }

  const sinais = [
    { nome: "pressão ou urgência", termos: ["urgente", "imediatamente", "hoje", "última chance", "bloqueada", "bloqueio"] },
    { nome: "pedido de dados ou códigos", termos: ["senha", "código", "token", "confirme seus dados", "dados bancários"] },
    { nome: "link ou acesso externo", termos: ["clique aqui", "acesse o link", "link", "http://", "https://"] },
    { nome: "promessa ou vantagem inesperada", termos: ["prêmio", "ganhou", "grátis", "reembolso", "dinheiro liberado"] }
  ];
  const encontrados = sinais.filter(grupo => grupo.termos.some(t => texto.includes(t))).map(grupo => grupo.nome);

  resultado.className = "resultado-analise resultado-atencao";
  if (encontrados.length) {
    resultado.innerHTML = "<strong>Sinais que merecem atenção:</strong><ul>" +
      encontrados.map(s => `<li>${s}</li>`).join("") +
      "</ul><p>Isso não confirma que a mensagem seja fraudulenta. Não clique nem responda antes de verificar o assunto por um canal oficial independente.</p>";
  } else {
    resultado.innerHTML = "<strong>Nenhum dos padrões simples cadastrados foi encontrado.</strong><p>Isso não significa que a mensagem seja segura. Golpes podem usar outros textos e estratégias. Confirme sempre por canais oficiais.</p>";
  }
}
