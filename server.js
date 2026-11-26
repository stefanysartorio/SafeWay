import express from "express";
import Parser from "rss-parser";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
const parser = new Parser({ timeout: 12000 });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

const GOOGLE_NEWS_RSS =
  "https://news.google.com/rss/search?q=(golpe+digital+OR+fraude+Pix+OR+phishing+OR+golpe+WhatsApp)+when:7d&hl=pt-BR&gl=BR&ceid=BR:pt-419";
const CERT_RSS = "https://www.cert.br/rss/certbr-rss.xml";

function dataValida(item) {
  const data = new Date(item.isoDate || item.pubDate || "");
  return !Number.isNaN(data.getTime()) && data <= new Date();
}

function dentroDaSemana(item) {
  const data = new Date(item.isoDate || item.pubDate || "");
  const limite = new Date();
  limite.setDate(limite.getDate() - 7);
  return !Number.isNaN(data.getTime()) && data >= limite && data <= new Date();
}

function limparTexto(texto = "") {
  return String(texto).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 450);
}

app.get("/api/news", async (_req, res) => {
  try {
    const resultados = await Promise.allSettled([
      parser.parseURL(GOOGLE_NEWS_RSS),
      parser.parseURL(CERT_RSS)
    ]);

    const googleItems = resultados[0].status === "fulfilled"
      ? resultados[0].value.items.filter(dentroDaSemana).map(item => ({
          title: limparTexto(item.title),
          link: item.link,
          pubDate: item.isoDate || item.pubDate,
          source: item.creator || item.source?.title || "Google Notícias",
          description: limparTexto(item.contentSnippet || item.content || "")
        }))
      : [];

    // O feed do CERT.br é usado aqui apenas para exibir título, data e link da publicação original.
    const certItems = resultados[1].status === "fulfilled"
      ? resultados[1].value.items.filter(dataValida).slice(0, 5).map(item => ({
          title: limparTexto(item.title),
          link: item.link,
          pubDate: item.isoDate || item.pubDate,
          source: "CERT.br",
          description: "Consulte a publicação original do CERT.br."
        }))
      : [];

    const unicos = new Map();
    [...googleItems, ...certItems].forEach(item => {
      if (item.title && item.link && !unicos.has(item.link)) unicos.set(item.link, item);
    });

    const items = [...unicos.values()]
      .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
      .slice(0, 20);

    res.json({
      items,
      checkedAt: new Date().toISOString(),
      note: "Notícias externas; confirme sempre os detalhes na fonte original."
    });
  } catch {
    res.status(502).json({ error: "As fontes de notícias estão temporariamente indisponíveis." });
  }
});

app.post("/api/chat", async (req, res) => {
  const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
  if (!question || question.length > 1500) {
    return res.status(400).json({ error: "Escreva uma pergunta de até 1.500 caracteres." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "A IA ainda não foi configurada. O responsável pelo projeto precisa configurar a chave Gemini no servidor."
    });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const instrucoes = `Você é o assistente educativo do SafeWay, especializado em prevenção de golpes digitais no Brasil.
Responda em português simples, com orientações prudentes e objetivas.
Não peça senhas, códigos de autenticação, dados bancários ou documentos.
Não afirme que uma mensagem, link, pessoa ou notícia é legítima sem verificação suficiente.
Não invente notícias, datas, estatísticas, fontes ou acontecimentos atuais.
Se a pergunta envolver um caso real ou urgente, recomende confirmar com o banco, empresa ou órgão pelos canais oficiais.
Explique que o SafeWay é educativo e não bloqueia transações nem garante recuperação de dinheiro.
Não solicite que a pessoa cole informações pessoais ou confidenciais na conversa.`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const resposta = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instrucoes }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { maxOutputTokens: 450, temperature: 0.4 }
      }),
      signal: AbortSignal.timeout(30000)
    });

    const dados = await resposta.json();
    if (!resposta.ok) {
      console.error("Erro Gemini:", dados?.error?.message || resposta.status);
      return res.status(502).json({ error: "O Gemini não conseguiu responder. Confira a chave, o modelo e os limites da API." });
    }

    const answer = (dados.candidates?.[0]?.content?.parts || [])
      .map(parte => parte.text || "").join("\n").trim();
    if (!answer) {
      return res.status(502).json({ error: "O Gemini não retornou uma resposta. Tente novamente." });
    }
    res.json({ answer });
  } catch (error) {
    console.error("Erro na API Gemini:", error?.message || error);
    res.status(502).json({ error: "O serviço Gemini não respondeu. Tente novamente mais tarde." });
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`SafeWay disponível em http://localhost:${PORT}`);
});
