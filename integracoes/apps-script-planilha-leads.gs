/**
 * @OnlyCurrentDoc
 *
 * Recebe os leads do site (janela do WhatsApp) e grava na planilha
 * "Leads Site - Imunizadora Oeste". Acessa SOMENTE esta planilha.
 *
 * Instalação (uma vez):
 * 1. Abra a planilha > Extensões > Apps Script.
 * 2. Engrenagem (Configurações do projeto) > marque
 *    "Mostrar arquivo de manifesto appsscript.json no editor".
 * 3. Em appsscript.json, cole o conteúdo de integracoes/appsscript.json.
 * 4. Em Código.gs, apague tudo, cole este arquivo e salve.
 * 5. Implantar > Nova implantação > tipo "App da Web"
 *    (Executar como: Eu · Quem pode acessar: Qualquer pessoa).
 * 6. Autorize e copie a URL terminada em /exec.
 */
var ABA = 'Página1';
var COLUNAS = [
  'data_hora', 'nome', 'whatsapp', 'origem', 'local_clique', 'pagina', 'referrer',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'primeiro_utm_source'
];

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA);
    if (aba.getLastRow() === 0) {
      aba.appendRow(COLUNAS);
      aba.setFrozenRows(1);
    }
    aba.appendRow(COLUNAS.map(function (c) { return String(dados[c] || '').slice(0, 500); }));
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('erro: ' + err);
  }
}
