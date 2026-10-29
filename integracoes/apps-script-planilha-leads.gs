/**
 * Recebe os leads do site (janela do WhatsApp) e grava na planilha
 * "Leads Site - Imunizadora Oeste".
 *
 * Instalação (uma vez):
 * 1. Abra a planilha > Extensões > Apps Script.
 * 2. Apague o conteúdo do editor, cole este arquivo e salve.
 * 3. Implantar > Nova implantação > tipo "App da Web".
 *    - Executar como: Eu
 *    - Quem pode acessar: Qualquer pessoa
 * 4. Autorize o acesso e copie a URL terminada em /exec.
 * 5. Cole essa URL em sheetWebhook, no SITE_CONFIG do site.
 */
var ABA = 'Página1';
var COLUNAS = [
  'data_hora', 'nome', 'whatsapp', 'origem', 'local_clique', 'pagina', 'referrer',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'primeiro_utm_source'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var dados = JSON.parse(e.postData.contents);
    var aba = SpreadsheetApp.getActive().getSheetByName(ABA);
    if (aba.getLastRow() === 0) {
      aba.appendRow(COLUNAS);
      aba.setFrozenRows(1);
    }
    aba.appendRow(COLUNAS.map(function (c) { return String(dados[c] || '').slice(0, 500); }));
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('erro: ' + err);
  } finally {
    lock.releaseLock();
  }
}
