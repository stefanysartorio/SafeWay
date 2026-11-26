# SafeWay

Projeto educacional de segurança digital.

## Recursos desta versão
- Início com atalhos para as áreas do projeto.
- Radar de notícias por feeds RSS externos.
- Orientações SOS Golpe.
- Central de Ajuda com links para canais oficiais.
- Proteção Digital: verificador educativo baseado em padrões simples de texto.
- Assistente IA conectado ao servidor, quando uma chave de API válida estiver configurada.
- Página demonstrativa de planos Gratuito, Premium mensal (R$ 14,90) e Premium anual (R$ 119,90).

## Como executar
1. Abra a pasta do projeto no VS Code.
2. Abra o terminal integrado.
3. Execute `npm install`.
4. Execute `npm start`.
5. Abra `http://localhost:3000`.

Não abra o `index.html` diretamente nem use apenas o Live Server: esta versão precisa do servidor Node.js para as rotas `/api/news` e `/api/chat`.

## Configuração da IA
A assistente usa a API Gemini. Ela exige uma chave de API válida, configurada pelo responsável pelo projeto no arquivo `.env` local, nunca no navegador nem no GitHub. Crie o `.env` copiando `.env.example` e preencha `GEMINI_API_KEY`. O modelo padrão é `gemini-2.5-flash`. A disponibilidade do nível gratuito, os limites e os modelos podem mudar; confira a página oficial de preços. No nível gratuito, o Google informa que o conteúdo pode ser usado para melhorar os produtos. Não envie senhas, códigos, dados bancários, documentos ou outras informações pessoais. O uso gratuito não é ilimitado.

Sem chave válida, o chatbot mostrará uma mensagem de configuração/indisponibilidade. Não simula que está funcionando.

## Planos
Os preços e benefícios são demonstrativos para apresentação escolar. Não existe cobrança, cadastro de cartão, assinatura, autenticação de usuário nem bloqueio automático de recursos Premium nesta versão.

## Limitações importantes
- O Radar consulta feeds RSS; não é monitoramento em tempo real garantido.
- Notícias não comprovam aumento de golpes ou ocorrência em uma cidade.
- O verificador de mensagens procura palavras e padrões simples; não confirma fraude e não acessa links.
- A IA pode cometer erros; confirme informações importantes em fontes oficiais.
- O SafeWay não bloqueia transações nem garante recuperação de dinheiro.
