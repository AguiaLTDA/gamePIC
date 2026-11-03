# Do Lixo à Luz

Jornada gamificada sobre resíduos sólidos, conversão energética e noções de fluidodinâmica computacional (CFD), feita para o projeto PICJr 2026 *Simulação computacional para aproveitamento energético de resíduos sólidos* (UNIVC · FAPES/SEDU).

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O jogo completo. É a página que o GitHub Pages publica e também abre com dois cliques, sem internet. |
| `app.html` | O código-fonte. Edite aqui. |
| `build.ps1` | Gera o `index.html` a partir do `app.html`. |
| `.nojekyll` | Avisa o GitHub Pages para publicar os arquivos como estão. |

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
- **Modo apresentação** libera todas as fases. Use em feiras.
- O progresso fica salvo no navegador de cada aparelho, e o site não envia dados para lugar nenhum. Para juntar a turma, use **Copiar dados** (ou **Baixar .json**) em cada aparelho e **Mesclar dados** em um deles.
