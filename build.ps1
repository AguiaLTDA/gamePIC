# Gera o index.html (site do GitHub Pages) a partir do app.html.
# Uso: clique com o botão direito > "Executar com o PowerShell", ou rode: .\build.ps1
$ErrorActionPreference = 'Stop'
$dir = $PSScriptRoot
$app = [System.IO.File]::ReadAllText((Join-Path $dir 'app.html'), [System.Text.Encoding]::UTF8)

$head = @'
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0A9A68">
<meta property="og:title" content="Do Lixo &agrave; Luz">
<meta property="og:description" content="Jornada gamificada sobre res&iacute;duos s&oacute;lidos, convers&atilde;o energ&eacute;tica e fluidodin&acirc;mica computacional (PICJr 2026, UNIVC).">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cpath d='M20 3C9 9 5 18 7 27c2 7 8 10 13 10s11-3 13-10c2-9-2-18-13-24z' fill='%230A9A68'/%3E%3Cpath d='M22 10l-8 14h6l-2 10 9-15h-6l3-9z' fill='%23FFB01F'/%3E%3C/svg%3E">
</head>
<body>
'@

$out = $head + $app + "`n</body>`n</html>`n"
[System.IO.File]::WriteAllText((Join-Path $dir 'index.html'), $out, (New-Object System.Text.UTF8Encoding $false))
Write-Host 'index.html gerado.'
