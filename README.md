# Do Lixo à Luz

Jornada gamificada sobre resíduos sólidos, conversão energética e noções de fluidodinâmica computacional (CFD), feita para o projeto PICJr 2026 *Simulação computacional para aproveitamento energético de resíduos sólidos* (UNIVC · FAPES/SEDU).

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O jogo completo. É a página que o GitHub Pages publica e também abre com dois cliques, sem internet. |
| `app.html` | O código-fonte. Edite aqui. |
| `build.ps1` | Gera o `index.html` a partir do `app.html`. |
| `.nojekyll` | Avisa o GitHub Pages para publicar os arquivos como estão. |
| `apps-script/Codigo.gs` | O código que salva o progresso numa planilha do Google Sheets. |

Depois de editar o `app.html`, rode o `build.ps1` (botão direito > *Executar com o PowerShell*) para atualizar o `index.html`.

## Publicar no GitHub Pages

### Opção 1: pelo site, sem instalar nada

1. Entre em <https://github.com/new>. Dê o nome `do-lixo-a-luz`, marque **Public** e clique em **Create repository**.
2. Na página do repositório, clique em **uploading an existing file**.
3. Arraste `index.html`, `app.html`, `build.ps1`, `README.md` e `.nojekyll` e clique em **Commit changes**.
   - O Windows esconde arquivos que começam com ponto. Se o `.nojekyll` não aparecer, pule esse arquivo: o site funciona sem ele.
4. Vá em **Settings > Pages**. Em *Source*, escolha **Deploy from a branch**, depois a branch **main**, a pasta **/ (root)**, e clique em **Save**.
5. Em um ou dois minutos o site fica no ar em `https://SEU-USUARIO.github.io/do-lixo-a-luz/`.

### Opção 2: pelo terminal (git + GitHub CLI)

```bash
gh auth login
git init -b main
git add .
git commit -m "Primeira versão do jogo Do Lixo à Luz"
gh repo create do-lixo-a-luz --public --source=. --push
gh api -X POST repos/{owner}/do-lixo-a-luz/pages -f "source[branch]=main" -f "source[path]=/"
```

Para atualizar o site depois de mudar o jogo:

```bash
git add . && git commit -m "Atualiza o jogo" && git push
```

### Domínio próprio (opcional)

1. Registre o domínio (por exemplo, no Registro.br).
2. No GitHub, abra **Settings > Pages > Custom domain**, digite o domínio e salve.
3. No painel do domínio, crie um registro **CNAME** apontando `www` para `SEU-USUARIO.github.io`. Para o domínio sem `www`, crie registros **A** apontando para `185.199.108.153`, `185.199.109.153`, `185.199.110.153` e `185.199.111.153`.
4. Volte ao GitHub e marque **Enforce HTTPS**.

## Fases

1. Conhecer os resíduos: orgânico, reciclável, rejeito, perigoso
2. Destinação correta: cores da CONAMA 275/2001 e a hierarquia da PNRS
3. Potencial energético: duelo de poder calorífico e calculadora da escola
4. Rotas de conversão: biodigestão, pirólise, gaseificação, incineração…
5. Combustíveis e produtos: biogás, biometano, syngas, bio-óleo, biodiesel, CDR
6. Leito fluidizado e CFD: simulador (Wen & Yu, velocidade terminal, ΔP) e túnel de vento (Stam, 1999)

## Painel do(a) professor(a)

- No primeiro acesso, o painel pede para criar uma senha. Ela fica só naquele navegador.
- O painel mostra o ranking, o acerto por fase e os itens que a turma mais erra.
- Todas as fases ficam abertas desde o início. O estudante pode começar por qualquer uma e pular as que quiser; a ordem da trilha é só uma sugestão.
- O progresso sempre fica salvo no navegador de cada aparelho. Sem a planilha, dá para juntar a turma com **Copiar dados** (ou **Baixar .json**) em cada aparelho e **Mesclar dados** em um deles.

## Salvar no Google Sheets

Com a planilha ligada, cada computador envia o progresso sozinho: ao entrar, ao terminar cada fase e ao cumprir cada missão do simulador. Se a internet cair, o envio fica numa fila e sai quando ela voltar.

A planilha ganha duas abas:
- **Alunos:** uma linha por estudante, com nome, telefone, turma, escola, XP, nível, acerto de cada fase, estrelas, missões e último acesso.
- **Fases concluídas:** uma linha cada vez que alguém termina uma fase, com data, escola, fase, acerto e estrelas.

Uma planilha criada com a versão anterior do script ganha as colunas Telefone e Escola sozinha no primeiro envio depois da atualização. Os dados que já existem não são alterados.

### 1. Criar a planilha e o script

1. Crie uma planilha nova em <https://sheets.new>, por exemplo "Do Lixo à Luz – Turmas", com a conta Google do(a) professor(a) ou do projeto.
2. Abra **Extensões > Apps Script**.
3. Apague o código que aparece e cole todo o conteúdo de [`apps-script/Codigo.gs`](apps-script/Codigo.gs). Salve com o ícone de disquete.
4. No menu de funções, no alto, escolha **configurar** e clique em **Executar**. Autorize o acesso quando o Google pedir.
   - Pode aparecer o aviso "O Google não verificou este app". Clique em **Avançado** e depois em **Acessar (não seguro)**. O script é seu e só mexe nesta planilha.
5. Abra o **Registro de execução**. Ele mostra a **chave do painel do(a) professor(a)**. Anote.

### 2. Publicar como App da Web

1. Clique em **Implantar > Nova implantação**. No ícone de engrenagem, escolha **App da Web**.
2. Preencha **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**.
3. Clique em **Implantar** e copie a **URL do app da Web**, que termina em `/exec`.

> Se você mudar o código do script depois, use **Implantar > Gerenciar implantações > editar (lápis) > Versão: Nova versão**. Assim a URL continua a mesma.

### 3. Ligar o jogo à planilha

1. Abra o `app.html` e cole a URL na linha:
   ```js
   const SHEETS_URL_PADRAO = 'https://script.google.com/macros/s/.../exec';
   ```
2. Rode o `build.ps1` e envie para o GitHub (`git add . && git commit -m "Liga a planilha" && git push`). A partir daí, todos os computadores enviam para a planilha.
3. No **painel do(a) professor(a) > Planilha do Google Sheets**, digite a chave e clique em **Salvar e testar**.
   - **Carregar a turma da planilha** traz para aquele computador os estudantes de todas as máquinas.
   - **Enviar todos deste computador** manda para a planilha quem jogou antes de ela ser ligada.

Para testar sem mexer no código, cole a URL direto no painel. Nesse caso ela vale só naquele navegador.

### Segurança e privacidade

- A planilha fica na conta Google de quem a criou e não é pública. Ninguém a vê sem que você compartilhe.
- A URL do script fica visível no código do site. Quem tiver a URL consegue **gravar** registros, mas **não consegue ler** nada sem a chave do(a) professor(a). O script também valida e limita tudo o que recebe.
- A planilha guarda só o que o jogo pede: nome, telefone, turma, escola, avatar e progresso. Telefone e nome de estudantes menores de idade são dados pessoais protegidos pela LGPD: combine o uso com a escola, peça a autorização dos responsáveis e não compartilhe a planilha fora da equipe. A tela de cadastro avisa que menores podem informar o telefone do(a) responsável.
- O telefone também fica salvo no navegador do computador onde o estudante se cadastrou. Ele aparece só no painel do(a) professor(a), protegido por senha, e nunca na tela inicial.
- Excluir um estudante no painel apaga só aquele computador. Na planilha, apague a linha à mão.
