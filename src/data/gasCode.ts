// Embedded string representations of Code.gs and index.html for direct view/copy/download in GAS Exporter

export const CODE_GS_CONTENT = `// ==============================================================================
// BMS Dashboard Version 4.0 · PT. Berkatama Mulia Saputra
// Google Apps Script Backend (Code.gs) - Update Final 02 Agustus 2026
// ==============================================================================

const SPREADSHEET_ID = '1XiD6IvxygNS0t9tHa2nSHHl6s3uE-CuQpO1ei9Q9QV4'; // 🔑 ID Spreadsheet
const FOLDER_ID      = '1VpzFjXgWvctBQrYcNfIF2AllaPkJnMRC';               // 📁 ID Root Folder Google Drive

// ─── Entry point ──────────────────────────────────────────────────────────────
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('BMS Dashboard Version 4.0 · PT. Berkatama Mulia Saputra')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

// ─── Test Drive Access ────────────────────────────────────────────────────────
function testDriveAccess() {
  var folder;
  try {
    folder = DriveApp.getFolderById(FOLDER_ID);
    Logger.log('✅ Step 1 OK — Folder ditemukan: ' + folder.getName());
  } catch(e) {
    Logger.log('❌ Step 1 GAGAL: ' + e.message);
    return 'GAGAL Step 1: ' + e.message;
  }
  var testFile;
  try {
    var testBlob = Utilities.newBlob('Purchasing Drive Test', 'text/plain', 'Purchasing_DriveTest_' + new Date().getTime() + '.txt');
    testFile = folder.createFile(testBlob);
    Logger.log('✅ Step 2 OK — Write OK: ' + testFile.getUrl());
  } catch(e) {
    Logger.log('❌ Step 2 GAGAL (write): ' + e.message);
    return 'GAGAL Step 2: ' + e.message;
  }
  try { DriveApp.getFileById(testFile.getId()).setTrashed(true); } catch(e) {}
  try {
    PropertiesService.getScriptProperties().setProperty('test_key', 'ok');
    PropertiesService.getScriptProperties().deleteProperty('test_key');
    Logger.log('✅ Step 3 OK — PropertiesService OK.');
  } catch(e) {
    return 'GAGAL Step 3 (PropertiesService): ' + e.message;
  }
  Logger.log('🎉 SEMUA TEST LULUS!');
  return 'SUKSES — Semua permission aktif. Lanjutkan deploy.';
}

// ─── Spreadsheet helper ───────────────────────────────────────────────────────
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// ─── Generic sheet reader → returns array of objects with _rowIndex ───────────
function sheetToObjects(sheetName) {
  const ss     = getSpreadsheet();
  const sheet  = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const data    = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const tz      = Session.getScriptTimeZone();
  return data
    .map(function(row, i) {
      var obj = { _rowIndex: i + 2 };
      headers.forEach(function(h, j) {
        var key = h ? String(h).trim() : ('col' + j);
        var val = row[j];
        obj[key] = (val instanceof Date)
          ? Utilities.formatDate(val, tz, 'yyyy-MM-dd') : val;
      });
      return obj;
    })
    .filter(function(obj) {
      return Object.keys(obj)
        .filter(function(k) { return k !== '_rowIndex'; })
        .some(function(k) { return obj[k] !== '' && obj[k] != null; });
    });
}

// ─── Auto ID generator ────────────────────────────────────────────────────────
function generateNextId(prefix, sheetName) {
  const ss    = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const count = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
  const date  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  return prefix + '-' + date + '-' + String(count + 1).padStart(3, '0');
}

function getNextPurchaseRequestId() { return generateNextId('PR',  'Purchase Request'); }
function getNextPurchaseOrderId()   { return generateNextId('PO',  'Purchase Order'); }
function getNextQuotationId()       { return generateNextId('QT',  'Quotation'); }
function getNextInvoiceId()         { return generateNextId('INV', 'Invoice'); }
function getNextSupplierId()        { return generateNextId('SUP', 'Supplier/Vendor'); }
function getNextApprovalId()        { return generateNextId('APR', 'Approval'); }

// ─── Authentication ───────────────────────────────────────────────────────────
function login(username, password) {
  try {
    if (!username || !password) return { success: false, error: 'Username dan password harus diisi.' };
    const ss    = getSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    if (!sheet || sheet.getLastRow() < 2) return { success: false, error: 'Tidak ada user terdaftar.' };
    const lastRow = sheet.getLastRow() - 1;
    const lastCol = Math.max(sheet.getLastColumn(), 6);
    const data = sheet.getRange(2, 1, lastRow, lastCol).getValues();
    var foundRow = -1, user = null;
    for (var i = 0; i < data.length; i++) {
      var rowUser = String(data[i][0] || '').trim();
      var rowPass = String(data[i][1] || '').trim();
      if (rowUser === username.trim() && rowPass === password) {
        foundRow = i + 2;
        user = {
          username: rowUser,
          name:     String(data[i][2] || '').trim() || rowUser,
          role:     String(data[i][3] || '').trim() || 'User'
        };
        break;
      }
    }
    if (!user) return { success: false, error: 'Username atau password salah.' };
    try { sheet.getRange(foundRow, 5).setValue(new Date()); } catch(e) {}
    return { success: true, user: user };
  } catch(e) {
    return { success: false, error: 'Terjadi kesalahan: ' + e.message };
  }
}

// ─── Customer & Vendor dropdowns ──────────────────────────────────────────────
function getCustomers() {
  try {
    const reqs   = sheetToObjects('Purchase Request');
    const orders = sheetToObjects('Purchase Order');
    const seen   = {};
    reqs.forEach(function(r)   { if (r['Nama Customer']) seen[r['Nama Customer']] = true; });
    orders.forEach(function(r) { if (r['Nama Customer']) seen[r['Nama Customer']] = true; });
    return { success: true, data: Object.keys(seen).sort() };
  } catch(e) { return { success: false, error: e.message, data: [] }; }
}

function getVendors() {
  try {
    const suppliers = sheetToObjects('Supplier/Vendor');
    const seen = {};
    suppliers.forEach(function(s) {
      var v = s['Nama Perusahaan Vendor/Supplier'];
      if (v) seen[v] = true;
    });
    return { success: true, data: Object.keys(seen).sort() };
  } catch(e) { return { success: false, error: e.message, data: [] }; }
}

// ─── Dashboard summary ────────────────────────────────────────────────────────
function getDashboardData() {
  try {
    const ss = getSpreadsheet();
    const rSheet = ss.getSheetByName('Report');
    var report = { totalRfq: 0, totalItemPo: 0, totalQtyRequested: 0, totalVendor: 0 };
    if (rSheet && rSheet.getLastRow() > 1) {
      var row = rSheet.getRange(2, 1, 1, 4).getValues()[0];
      report = { totalRfq: row[0]||0, totalItemPo: row[1]||0, totalQtyRequested: row[2]||0, totalVendor: row[3]||0 };
    }
    function count(name) {
      var s = ss.getSheetByName(name);
      return s ? Math.max(0, s.getLastRow() - 1) : 0;
    }
    const allOrders    = sheetToObjects('Purchase Order');
    const allInvoices  = sheetToObjects('Invoice');
    const allApprovals = sheetToObjects('Approval');
    const pendingApprovals = allApprovals.filter(function(a){ return String(a['Status']||'').toLowerCase() === 'menunggu'; }).length;
    return {
      success: true,
      report:  report,
      counts:  {
        purchaseRequests: count('Purchase Request'),
        purchaseOrders:   count('Purchase Order'),
        quotations:       count('Quotation'),
        invoices:         count('Invoice'),
        status:           count('Status'),
        suppliers:        count('Supplier/Vendor'),
        approvals:        count('Approval'),
        pendingApprovals: pendingApprovals
      },
      recentOrders:   allOrders.slice(-5).reverse(),
      recentInvoices: allInvoices.slice(-5).reverse(),
    };
  } catch(e) { return { success: false, error: e.message }; }
}

// ─── Per-sheet data getters ───────────────────────────────────────────────────
function getPurchaseRequests() { try { return { success: true, data: sheetToObjects('Purchase Request') }; } catch(e) { return { success: false, error: e.message, data: [] }; } }
function getPurchaseOrders()   { try { return { success: true, data: sheetToObjects('Purchase Order') }; }   catch(e) { return { success: false, error: e.message, data: [] }; } }
function getQuotations()       { try { return { success: true, data: sheetToObjects('Quotation') }; }         catch(e) { return { success: false, error: e.message, data: [] }; } }
function getInvoices()         { try { return { success: true, data: sheetToObjects('Invoice') }; }           catch(e) { return { success: false, error: e.message, data: [] }; } }
function getDeliveryStatus()   { try { return { success: true, data: sheetToObjects('Status') }; }            catch(e) { return { success: false, error: e.message, data: [] }; } }
function getSuppliers()        { try { return { success: true, data: sheetToObjects('Supplier/Vendor') }; }   catch(e) { return { success: false, error: e.message, data: [] }; } }
function getApprovals()        { try { return { success: true, data: sheetToObjects('Approval') }; }          catch(e) { return { success: false, error: e.message, data: [] }; } }

// ─── Approval actions ─────────────────────────────────────────────────────────
function approveItem(rowIndex, approvedBy) {
  try {
    const ss    = getSpreadsheet();
    const sheet = ss.getSheetByName('Approval');
    if (!sheet) return { success: false, error: 'Sheet Approval tidak ditemukan.' };
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(h){ return String(h).trim(); });
    var statusCol = headers.indexOf('Status') + 1;
    var approvedByCol = headers.indexOf('Approved By') + 1;
    var approvedAtCol = headers.indexOf('Approved At') + 1;
    if (statusCol > 0) sheet.getRange(rowIndex, statusCol).setValue('Disetujui');
    if (approvedByCol > 0) sheet.getRange(rowIndex, approvedByCol).setValue(approvedBy || 'Admin');
    if (approvedAtCol > 0) sheet.getRange(rowIndex, approvedAtCol).setValue(new Date());
    return { success: true };
  } catch(e) { return { success: false, error: e.message }; }
}

function rejectItem(rowIndex, rejectedBy, catatan) {
  try {
    const ss    = getSpreadsheet();
    const sheet = ss.getSheetByName('Approval');
    if (!sheet) return { success: false, error: 'Sheet Approval tidak ditemukan.' };
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(h){ return String(h).trim(); });
    var statusCol = headers.indexOf('Status') + 1;
    var catatanCol = headers.indexOf('Catatan') + 1;
    var rejectedByCol = headers.indexOf('Rejected By') + 1;
    if (statusCol > 0) sheet.getRange(rowIndex, statusCol).setValue('Ditolak');
    if (catatanCol > 0) sheet.getRange(rowIndex, catatanCol).setValue(catatan || '');
    if (rejectedByCol > 0) sheet.getRange(rowIndex, rejectedByCol).setValue(rejectedBy || 'Admin');
    return { success: true };
  } catch(e) { return { success: false, error: e.message }; }
}

function createApprovalRequest(data) {
  try {
    var rowData = {
      'ID Approval': getNextApprovalId(),
      'Tanggal': new Date(),
      'Modul': data.modul || 'Purchase Order',
      'Data ID': data.dataId || '',
      'Pemohon': data.pemohon || 'System',
      'Customer': data.customer || '',
      'Nominal': data.nominal || 0,
      'Keterangan': data.keterangan || '',
      'Status': 'Menunggu',
      'Approved By': '',
      'Approved At': '',
      'Catatan': ''
    };
    return saveRecord('Approval', rowData, 0);
  } catch(e) { return { success: false, error: e.message }; }
}

// ─── Account management ───────────────────────────────────────────────────────
function updateUserProfile(username, displayName) {
  try {
    if (!username || !displayName) return { success: false, error: 'Data tidak lengkap.' };
    const ss    = getSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    if (!sheet || sheet.getLastRow() < 2) return { success: false, error: 'Sheet User tidak ditemukan.' };
    const lastRow = sheet.getLastRow() - 1;
    const data    = sheet.getRange(2, 1, lastRow, 1).getValues();
    var foundRow  = -1;
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === username.trim()) { foundRow = i + 2; break; }
    }
    if (foundRow < 0) return { success: false, error: 'User tidak ditemukan.' };
    sheet.getRange(foundRow, 3).setValue(displayName.trim());
    return { success: true };
  } catch(e) { return { success: false, error: e.message }; }
}

function updateUserPhotoUrl(username, photoUrl) {
  try {
    if (!username) return { success: false, error: 'Username diperlukan.' };
    const ss    = getSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    if (!sheet || sheet.getLastRow() < 2) return { success: false, error: 'Sheet User tidak ditemukan.' };
    const lastCol = sheet.getLastColumn();
    if (lastCol < 7) {
      for (var c = lastCol + 1; c <= 7; c++) {
        var headerLabels = {5:'lastLogin', 6:'created', 7:'photoUrl'};
        sheet.getRange(1, c).setValue(headerLabels[c] || 'col'+c);
      }
    }
    const lastRow = sheet.getLastRow() - 1;
    const data    = sheet.getRange(2, 1, lastRow, 1).getValues();
    var foundRow  = -1;
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === username.trim()) { foundRow = i + 2; break; }
    }
    if (foundRow < 0) return { success: false, error: 'User tidak ditemukan.' };
    sheet.getRange(foundRow, 7).setValue(photoUrl || '');
    return { success: true };
  } catch(e) { return { success: false, error: e.message }; }
}

function updateUserPassword(username, oldPassword, newPassword) {
  try {
    if (!username || !oldPassword || !newPassword) return { success: false, error: 'Data tidak lengkap.' };
    if (newPassword.length < 6) return { success: false, error: 'Password baru minimal 6 karakter.' };
    const ss    = getSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    if (!sheet || sheet.getLastRow() < 2) return { success: false, error: 'Sheet User tidak ditemukan.' };
    const lastCol = Math.max(sheet.getLastColumn(), 2);
    const lastRow = sheet.getLastRow() - 1;
    const data    = sheet.getRange(2, 1, lastRow, lastCol).getValues();
    var foundRow  = -1;
    for (var i = 0; i < data.length; i++) {
      var rowUser = String(data[i][0] || '').trim();
      var rowPass = String(data[i][1] || '').trim();
      if (rowUser === username.trim() && rowPass === oldPassword) { foundRow = i + 2; break; }
    }
    if (foundRow < 0) return { success: false, error: 'Password lama tidak cocok.' };
    sheet.getRange(foundRow, 2).setValue(newPassword);
    return { success: true };
  } catch(e) { return { success: false, error: e.message }; }
}

// ─── Save (create or update) ─────────────────────────────────────────────────
function saveRecord(sheetName, rowData, rowIndex) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      const newHeaders = Object.keys(rowData);
      sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
      const hdrRange = sheet.getRange(1, 1, 1, newHeaders.length);
      hdrRange.setFontWeight('bold');
      hdrRange.setBackground('#1e3a5c');
      hdrRange.setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
    const currentLastCol = sheet.getLastColumn();
    var headers = [];
    if (currentLastCol > 0) {
      headers = sheet.getRange(1, 1, 1, currentLastCol).getValues()[0].map(function(h){ return String(h).trim(); });
    }
    const missingKeys = Object.keys(rowData).filter(function(k){
      return k && k.trim() && headers.indexOf(k.trim()) === -1;
    });
    if (missingKeys.length > 0) {
      missingKeys.forEach(function(k, i){
        sheet.getRange(1, currentLastCol + i + 1).setValue(k);
      });
    }
    const finalLastCol = sheet.getLastColumn();
    const finalHeaders = sheet.getRange(1, 1, 1, finalLastCol).getValues()[0].map(function(h){ return String(h).trim(); });
    const values = finalHeaders.map(function(h) {
      return (rowData[h] !== undefined && rowData[h] !== null) ? rowData[h] : '';
    });
    if (rowIndex && rowIndex >= 2) {
      sheet.getRange(rowIndex, 1, 1, values.length).setValues([values]);
    } else {
      sheet.appendRow(values);
    }
    try { sheet.autoResizeColumns(1, finalLastCol); } catch(e2) {}
    return { success: true, sheetName: sheetName, rowCount: sheet.getLastRow() - 1 };
  } catch(e) {
    Logger.log('saveRecord error [' + sheetName + ']: ' + e.message);
    return { success: false, error: 'saveRecord error: ' + e.message };
  }
}

// ─── Delete row ───────────────────────────────────────────────────────────────
function deleteRow(sheetName, rowIndex) {
  try {
    const ss    = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet)               return { success: false, error: 'Sheet tidak ditemukan' };
    if (!rowIndex || rowIndex < 2) return { success: false, error: 'Row index tidak valid' };
    sheet.deleteRow(rowIndex);
    return { success: true };
  } catch(e) { return { success: false, error: e.message }; }
}

// ─── GAS Frontend Integration Helpers ─────────────────────────────────────────
function getInitialDataGAS() {
  try {
    return {
      success: true,
      purchaseRequests: sheetToObjects('Purchase Request'),
      purchaseOrders: sheetToObjects('Purchase Order'),
      quotations: sheetToObjects('Quotation'),
      invoices: sheetToObjects('Invoice'),
      deliveryStatuses: sheetToObjects('Status'),
      suppliers: sheetToObjects('Supplier/Vendor'),
      approvals: sheetToObjects('Approval')
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function mapSheetNameGAS_(sheetName) {
  var s = String(sheetName || '').toUpperCase().trim();
  if (s === 'PURCHASE REQUEST') return 'Purchase Request';
  if (s === 'PURCHASE ORDER') return 'Purchase Order';
  if (s === 'QUOTATION') return 'Quotation';
  if (s === 'INVOICE') return 'Invoice';
  if (s === 'DELIVERY STATUS') return 'Status';
  if (s === 'DATA SUPPLIER' || s === 'SUPPLIER') return 'Supplier/Vendor';
  if (s === 'APPROVALS' || s === 'APPROVAL') return 'Approval';
  return sheetName;
}

function saveRecordGAS(sheetName, record, isEdit, idKey) {
  var realSheet = mapSheetNameGAS_(sheetName);
  var rowIndex = (isEdit && record && record._rowIndex) ? record._rowIndex : null;
  return saveRecord(realSheet, record, rowIndex);
}

function deleteRecordGAS(sheetName, rowIndex) {
  var realSheet = mapSheetNameGAS_(sheetName);
  return deleteRow(realSheet, rowIndex);
}

// ─── Helper: ambil atau buat subfolder ───────────────────────────────────────
function getOrCreateFolder_(parent, name) {
  var safe = String(name||'').trim().replace(/[\\\\/:*?"<>|]/g, '_').substring(0, 100);
  if(!safe) return parent;
  var it = parent.getFoldersByName(safe);
  return it.hasNext() ? it.next() : parent.createFolder(safe);
}

function getOrCreateFolderPath_(rootFolder, pathParts) {
  var folder = rootFolder;
  pathParts.forEach(function(part){
    if(part && part.trim()) folder = getOrCreateFolder_(folder, part.trim());
  });
  return folder;
}

var MENU_FOLDER_MAP = {
  'purchase-requests': 'Purchase Request',
  'purchase-orders':   'Purchase Order',
  'quotations':        'Quotation',
  'invoices':          'Invoice',
  'status':            'Delivery Status',
  'suppliers':         'Supplier Vendor',
  'approvals':         'Approval',
  'profile-photos':    'Profile Photos'
};

// ─── Upload File ke Google Drive (single-shot, maks ~4 MB after Base64) ──────
function uploadFileToDrive(b64, fileName, mimeType, subFolder, menuSection) {
  try {
    if (!b64)      return { success: false, error: 'Data file kosong.' };
    if (!fileName) return { success: false, error: 'Nama file tidak boleh kosong.' };
    if (!FOLDER_ID || FOLDER_ID === 'FOLDER_ID')
      return { success: false, error: 'FOLDER_ID belum dikonfigurasi di Code.gs.' };
    var rootFolder;
    try {
      rootFolder = DriveApp.getFolderById(FOLDER_ID);
    } catch(folderErr) {
      return { success: false, error: 'Gagal akses folder Drive. Jalankan testDriveAccess() lalu re-deploy. Detail: ' + folderErr.message };
    }
    var pathParts = [];
    var menuLabel = MENU_FOLDER_MAP[menuSection] || menuSection || '';
    if (menuLabel) pathParts.push(menuLabel);
    if (subFolder && subFolder.trim()) pathParts.push(subFolder.trim());
    var targetFolder = pathParts.length > 0
      ? getOrCreateFolderPath_(rootFolder, pathParts) : rootFolder;
    var folderPath = pathParts.join(' / ') || '(root)';
    var bytes = Utilities.base64Decode(b64);
    var blob  = Utilities.newBlob(bytes, mimeType || 'application/octet-stream', fileName);
    var file  = targetFolder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch(shareErr) {
      Logger.log('⚠️  setSharing tidak diizinkan: ' + shareErr.message);
    }
    var fileUrl = 'https://drive.google.com/file/d/' + file.getId() + '/view?usp=sharing';
    Logger.log('✅ File uploaded: ' + fileName + ' → ' + folderPath + ' | ' + fileUrl);
    return { success: true, url: fileUrl, fileId: file.getId(), folderPath: folderPath, folderName: subFolder || menuLabel || null };
  } catch(e) {
    Logger.log('❌ uploadFileToDrive error: ' + e.message);
    return { success: false, error: 'uploadFileToDrive error: ' + e.message };
  }
}

// ─── Chunked Upload: init ─────────────────────────────────────────────────────
function initChunkedUpload(fileName, mimeType, subFolder, menuSection) {
  try {
    if (!FOLDER_ID || FOLDER_ID === 'FOLDER_ID')
      return { success: false, error: 'FOLDER_ID belum dikonfigurasi.' };
    var rootFolder;
    try {
      rootFolder = DriveApp.getFolderById(FOLDER_ID);
    } catch(folderErr) {
      return { success: false, error: 'Gagal akses folder Drive. Detail: ' + folderErr.message };
    }
    var pathParts = [];
    var menuLabel = MENU_FOLDER_MAP[menuSection] || menuSection || '';
    if (menuLabel) pathParts.push(menuLabel);
    if (subFolder && subFolder.trim()) pathParts.push(subFolder.trim());
    var targetFolder = pathParts.length > 0
      ? getOrCreateFolderPath_(rootFolder, pathParts) : rootFolder;
    var folderPath = pathParts.join(' / ') || '(root)';
    var placeholder = targetFolder.createFile(
      Utilities.newBlob('', mimeType || 'application/octet-stream', fileName)
    );
    try {
      placeholder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch(shareErr) {}
    var tempKey = 'chu_' + Utilities.getUuid().replace(/-/g,'').substring(0,16);
    PropertiesService.getScriptProperties().setProperty(tempKey, JSON.stringify({
      fileId: placeholder.getId(), folderId: targetFolder.getId(),
      mimeType: mimeType || 'application/octet-stream', fileName: fileName,
      folderPath: folderPath, folderName: subFolder || menuLabel || null,
      chunks: 0, created: new Date().getTime()
    }));
    return { success: true, tempKey: tempKey, fileId: placeholder.getId(), folderPath: folderPath };
  } catch(e) {
    return { success: false, error: 'initChunkedUpload error: ' + e.message };
  }
}

function appendChunk(tempKey, chunkB64, chunkIndex) {
  try {
    var props = PropertiesService.getScriptProperties();
    var meta  = JSON.parse(props.getProperty(tempKey) || 'null');
    if (!meta) return { success: false, error: 'Sesi upload tidak ditemukan (tempKey invalid).' };
    var chunkKey = tempKey + '_c' + String(chunkIndex).padStart(4,'0');
    props.setProperty(chunkKey, chunkB64);
    meta.chunks = Math.max(meta.chunks, chunkIndex + 1);
    props.setProperty(tempKey, JSON.stringify(meta));
    return { success: true, chunkIndex: chunkIndex };
  } catch(e) {
    return { success: false, error: 'appendChunk error: ' + e.message };
  }
}

function finalizeChunkedUpload(tempKey) {
  try {
    var props = PropertiesService.getScriptProperties();
    var meta  = JSON.parse(props.getProperty(tempKey) || 'null');
    if (!meta) return { success: false, error: 'Sesi upload tidak ditemukan.' };
    var parts = [];
    for (var i = 0; i < meta.chunks; i++) {
      var ck  = tempKey + '_c' + String(i).padStart(4,'0');
      var raw = props.getProperty(ck);
      if (!raw) return { success: false, error: 'Chunk ke-' + i + ' tidak ditemukan.' };
      parts.push(raw);
      props.deleteProperty(ck);
    }
    var fullB64 = parts.join('');
    var bytes   = Utilities.base64Decode(fullB64);
    var blob    = Utilities.newBlob(bytes, meta.mimeType, meta.fileName);
    var targetFolder;
    try {
      targetFolder = meta.folderId
        ? DriveApp.getFolderById(meta.folderId)
        : DriveApp.getFolderById(FOLDER_ID);
    } catch(folderErr) {
      return { success: false, error: 'Gagal akses folder Drive saat finalize. Detail: ' + folderErr.message };
    }
    var newFile = targetFolder.createFile(blob);
    try { newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(shareErr) {}
    try { DriveApp.getFileById(meta.fileId).setTrashed(true); } catch(e2) {}
    props.deleteProperty(tempKey);
    Logger.log('✅ Chunked upload finalized: ' + meta.fileName);
    return {
      success: true, url: 'https://drive.google.com/file/d/' + newFile.getId() + '/view?usp=sharing',
      fileId: newFile.getId(), folderPath: meta.folderPath || null, folderName: meta.folderName || null
    };
  } catch(e) {
    return { success: false, error: 'finalizeChunkedUpload error: ' + e.message };
  }
}

// ─── NPWP Database ────────────────────────────────────────────────────────────
function getNpwpDatabase() {
  try {
    var ss     = SpreadsheetApp.openById(SPREADSHEET_ID);
    var result = [];
    var npwpSheet = ss.getSheetByName('DATABASE NPWP');
    if (npwpSheet) {
      var lastRow = npwpSheet.getLastRow();
      var lastCol = npwpSheet.getLastColumn();
      if (lastRow > 1 && lastCol >= 2) {
        var headers = npwpSheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h){ return String(h).trim(); });
        var rows    = npwpSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
        rows.forEach(function(row) {
          var obj = {};
          headers.forEach(function(h, i){ obj[h] = row[i]; });
          var nama = String(obj['NAMA'] || obj['Nama'] || '').trim();
          if (nama) result.push(obj);
        });
      }
    }
    var invSheet = ss.getSheetByName('Invoice');
    if (invSheet) {
      var invLast = invSheet.getLastRow();
      if (invLast > 1) {
        var invHeaders = invSheet.getRange(1, 1, 1, invSheet.getLastColumn()).getValues()[0].map(function(h){ return String(h).trim(); });
        var invRows = invSheet.getRange(2, 1, invLast - 1, invSheet.getLastColumn()).getValues();
        var seen = {};
        result.forEach(function(r){ seen[(r['NAMA']||r['Nama']||'').toUpperCase()] = true; });
        invRows.forEach(function(row) {
          var obj = {};
          invHeaders.forEach(function(h, i){ obj[h] = row[i]; });
          var nama = String(obj['Nama Perusahaan'] || obj['Nama Customer'] || '').trim();
          if (!nama || seen[nama.toUpperCase()]) return;
          seen[nama.toUpperCase()] = true;
          result.push({ 'NAMA': nama, 'NPWP': obj['NPWP'] || '', 'ALAMAT': obj['Alamat'] || '' });
        });
      }
    }
    return { success: true, data: result };
  } catch(e) {
    return { success: false, error: e.message, data: [] };
  }
}
`;

export const INDEX_HTML_CONTENT = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchasing · PT. Berkatama Mulia Saputra</title>
  <!-- Google Fonts & Tailwind CSS CDN -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 text-slate-800 font-sans antialiased">
  <div id="root">
    <div class="p-8 text-center text-slate-600 font-bold">
      Purchasing System Loading... Silakan buka via Google Apps Script Web App URL.
    </div>
  </div>
</body>
</html>`;

