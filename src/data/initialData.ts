import {
  PurchaseRequest,
  PurchaseOrder,
  Quotation,
  Invoice,
  DeliveryStatus,
  Supplier,
  Approval,
  NpwpRecord
} from '../types';

export const initialPurchaseRequests: PurchaseRequest[] = [
  {
    _rowIndex: 2,
    'ID Request': 'PR-20260801-001',
    'Tanggal': '2026-08-01',
    'Nama Customer': 'PT. Indo Bharat Rayon',
    'Nama Item': 'Bearing Timken 32218 Tapered Roller',
    'Qty': 10,
    'Uom': 'PCS',
    'Spesifikasi': 'Tapered Roller Bearing Metric Size 90x160x42.5mm',
    'Harga Beli': 650000,
    'Total Harga Beli': 6500000,
    'Harga Jual': 850000,
    'Total Harga Jual': 8500000,
    'PPN 11%': 935000,
    'PPN 12%': 1020000,
    'DPP + (PPN 11%)': 9435000,
    'Online Shop Link': 'https://tokopedia.com/sample-bearing',
    'PMT Mode': 'KREDIT',
    'File': 'https://drive.google.com/file/d/sample_pr_file/view'
  },
  {
    _rowIndex: 3,
    'ID Request': 'PR-20260801-002',
    'Tanggal': '2026-08-01',
    'Nama Customer': 'CV. Cahaya Abadi Teknik',
    'Nama Item': 'Electro Motor Yuema 5.5HP 4P 3Phase',
    'Qty': 2,
    'Uom': 'UNIT',
    'Spesifikasi': '3 Phase Motor 4KW 1450RPM Flange Mounted',
    'Harga Beli': 3800000,
    'Total Harga Beli': 7600000,
    'Harga Jual': 4750000,
    'Total Harga Jual': 9500000,
    'PPN 11%': 1045000,
    'PPN 12%': 1140000,
    'DPP + (PPN 11%)': 10545000,
    'Online Shop Link': 'https://shopee.co.id/sample-motor',
    'PMT Mode': 'CASH',
    'File': ''
  },
  {
    _rowIndex: 4,
    'ID Request': 'PR-20260802-003',
    'Tanggal': '2026-08-02',
    'Nama Customer': 'PT. Petrokimia Gresik',
    'Nama Item': 'Flange Stainless Steel 304 ANSI 150 4 Inch',
    'Qty': 25,
    'Uom': 'PCS',
    'Spesifikasi': 'SS304 Slip On Flange Class 150 Sch 40',
    'Harga Beli': 320000,
    'Total Harga Beli': 8000000,
    'Harga Jual': 420000,
    'Total Harga Jual': 10500000,
    'PPN 11%': 1155000,
    'PPN 12%': 1260000,
    'DPP + (PPN 11%)': 11655000,
    'Online Shop Link': '',
    'PMT Mode': 'KREDIT',
    'File': ''
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    _rowIndex: 2,
    'ID Order': 'PO-20260801-001',
    'Tanggal': '2026-08-01',
    'No PO': 'PO/BMS/VIII/26-089',
    'Nama Customer': 'PT. Indo Bharat Rayon',
    'Nama Item': 'Bearing Timken 32218 Tapered Roller',
    'Qty': 10,
    'Uom': 'PCS',
    'Vendor/Supplier': 'PT. Bearing Nusantara Jaya',
    'Harga Beli': 650000,
    'Total Beli': 6500000,
    'Harga Jual': 850000,
    'Profit': 23.53,
    'Total Jual': 8500000,
    'PPN 11%': 935000,
    'PPN 12%': 1020000,
    'DPP PPH': 8500000,
    'Grand Total + (DPP + PPN11%)': 9435000,
    'Tgl Kirim': '2026-08-04',
    'Nomor Surat Jalan': 'SJ-20260804-012',
    'File PO': 'https://drive.google.com/file/d/sample_po_01/view',
    'Link Pembelian': 'https://tokopedia.com/sample'
  },
  {
    _rowIndex: 3,
    'ID Order': 'PO-20260801-002',
    'Tanggal': '2026-08-01',
    'No PO': 'PO/BMS/VIII/26-090',
    'Nama Customer': 'PT. Samator Indo Gas Tbk',
    'Nama Item': 'Centrifugal Pump Ebara 50x40 FSHA 3KW',
    'Qty': 3,
    'Uom': 'UNIT',
    'Vendor/Supplier': 'CV. Anugerah Teknik Utama',
    'Harga Beli': 8500000,
    'Total Beli': 25500000,
    'Harga Jual': 11200000,
    'Profit': 24.11,
    'Total Jual': 33600000,
    'PPN 11%': 3696000,
    'PPN 12%': 4032000,
    'DPP PPH': 33600000,
    'Grand Total + (DPP + PPN11%)': 37296000,
    'Tgl Kirim': '2026-08-05',
    'Nomor Surat Jalan': 'SJ-20260805-015',
    'File PO': 'https://drive.google.com/file/d/sample_po_02/view',
    'Link Pembelian': ''
  }
];

export const initialQuotations: Quotation[] = [
  {
    _rowIndex: 2,
    'ID Quotation': 'PNW/BMS/VIII/26-265',
    'Tanggal': '2026-08-01',
    'Nama Customer': 'Bpk. Hendra Gunawan',
    'Nama Perusahaan': 'PT. Samator Indo Gas Tbk',
    'Nama Barang': 'Centrifugal Pump Ebara 50x40 FSHA 3KW',
    'Qty': 3,
    'Uom': 'UNIT',
    'Harga': 11200000,
    'Total Harga': 33600000,
    'Harga (PPN)': 3696000,
    'Grand Total + (PPN 11%)': 37296000,
    'Mode PPN': 'PPN 11%',
    'Status': 'DEAL',
    'File': 'https://drive.google.com/file/d/sample_qt_01/view',
    'catatan': '1. Harga Penawaran berlaku selama 14 hari dari Penawaran ini.\n2. Pembayaran 30 hari Setelah Invoice diterima lengkap\n3. Barang stok berjalan, Harga tidak mengikat\n4. Barang Indent 5 - 7 hari\n5. Harga sudah termasuk ongkir'
  },
  {
    _rowIndex: 3,
    'ID Quotation': 'PNW/BMS/VIII/26-266',
    'Tanggal': '2026-08-02',
    'Nama Customer': 'Ibu Dewi Ratna',
    'Nama Perusahaan': 'PT. Santos Jaya Abadi',
    'Nama Barang': 'Pneumatic Cylinder Festo DNC-63-100-PPV-A',
    'Qty': 5,
    'Uom': 'PCS',
    'Harga': 2450000,
    'Total Harga': 12250000,
    'Harga (PPN)': 1347500,
    'Grand Total + (PPN 11%)': 13597500,
    'Mode PPN': 'PPN 11%',
    'Status': 'QUOTATION',
    'File': '',
    'catatan': '1. Harga Penawaran berlaku selama 14 hari.'
  }
];

export const initialInvoices: Invoice[] = [
  {
    _rowIndex: 2,
    'ID Invoice': 'BMS.INV.40.2608.00001',
    'Tipe Invoice': 'TEMPO',
    'Tanggal Invoice': '2026-08-01',
    'Nama Customer': 'PT. Samator Indo Gas Tbk',
    'Nama Perusahaan': 'PT. Samator Indo Gas Tbk',
    'Nomer PO': 'PO/SIG/2026/08/112',
    'Invoice Title': 'Centrifugal Pump Ebara 50x40 FSHA 3KW (3 Unit)',
    'Nominal Tagihan': 37632000,
    'Harga Jual': 33600000,
    'Potongan Harga': 0,
    'Uang Muka': 0,
    'DPP': 33600000,
    'PPN 12%': 4032000,
    'Jatuh Tempo': '2026-08-31',
    'Term of Payment': 'Net 30 (30 days from invoice date)',
    'Nomor Faktur Pajak': '010.003-26.88912301',
    'NPWP': '01.324.556.2-054.000',
    'Alamat': 'Jl. Raya Rungkut Industri No. 12, Surabaya, Jawa Timur',
    'Keterangan': 'Term of Payment : Net 30 days',
    'Status': 'Belum Lunas',
    'Faktur Invoice File': 'https://drive.google.com/file/d/sample_inv_01/view'
  },
  {
    _rowIndex: 3,
    'ID Invoice': 'BMS.INV.40.2608.00002',
    'Tipe Invoice': 'COD',
    'Tanggal Invoice': '2026-08-02',
    'Nama Customer': 'CV. Cahaya Abadi Teknik',
    'Nama Perusahaan': 'CV. Cahaya Abadi Teknik',
    'Nomer PO': 'PO/CAT/26/044',
    'Invoice Title': 'Electro Motor Yuema 5.5HP 4P 3Phase',
    'Nominal Tagihan': 10640000,
    'Harga Jual': 9500000,
    'Potongan Harga': 0,
    'Uang Muka': 0,
    'DPP': 9500000,
    'PPN 12%': 1140000,
    'Jatuh Tempo': '2026-08-02',
    'Term of Payment': 'CBD',
    'Nomor Faktur Pajak': '010.003-26.88912302',
    'NPWP': '02.441.980.1-052.000',
    'Alamat': 'Jl. Raya Krian No. 88, Sidoarjo, Jawa Timur',
    'Keterangan': 'CBD - Cash Before Delivery',
    'Status': 'Paid',
    'Faktur Invoice File': ''
  }
];

export const initialDeliveryStatuses: DeliveryStatus[] = [
  {
    _rowIndex: 2,
    'Tanggal': '2026-08-04',
    'Customer Name': 'PT. Indo Bharat Rayon',
    'Sending Item': 'Bearing Timken 32218 (10 PCS)',
    'No. PO': 'PO/BMS/VIII/26-089',
    'Man Power': 'Agus & Budi (Kurir BMS)',
    'Status': 'SELESAI',
    'Surat Jalan': 'https://drive.google.com/file/d/sample_sj_01/view'
  },
  {
    _rowIndex: 3,
    'Tanggal': '2026-08-05',
    'Customer Name': 'PT. Samator Indo Gas Tbk',
    'Sending Item': 'Centrifugal Pump Ebara 50x40 FSHA (3 Unit)',
    'No. PO': 'PO/BMS/VIII/26-090',
    'Man Power': 'Rudi (Driver Box)',
    'Status': 'PROSES KIRIM',
    'Surat Jalan': ''
  }
];

export const initialSuppliers: Supplier[] = [
  {
    _rowIndex: 2,
    'ID Supplier': 'SUP-001',
    'Kategori': 'Bearing & Transmission',
    'Nama Perusahaan Vendor/Supplier': 'PT. Bearing Nusantara Jaya',
    'Nama Barang': 'Bearing Timken, SKF, NSK, Koyo',
    'Harga Barang': 500000,
    'Alamat Kantor / Toko': 'Jl. Raden Patah No. 45, Surabaya',
    'PIC': 'Bpk. Budi Santoso',
    'No Tlp/WA': '0812-3456-7890'
  },
  {
    _rowIndex: 3,
    'ID Supplier': 'SUP-002',
    'Kategori': 'Pump & Motor',
    'Nama Perusahaan Vendor/Supplier': 'CV. Anugerah Teknik Utama',
    'Nama Barang': 'Ebara Pump, Yuema Motor, Teco',
    'Harga Barang': 3500000,
    'Alamat Kantor / Toko': 'Komplek Pertokoan Dupak Megah A-12, Surabaya',
    'PIC': 'Ibu Jenny',
    'No Tlp/WA': '0811-9876-5432'
  }
];

export const initialApprovals: Approval[] = [
  {
    _rowIndex: 2,
    'ID Approval': 'APR-20260802-001',
    'Tanggal': '2026-08-02',
    'Modul': 'Purchase Order',
    'Data ID': 'PO-20260801-002',
    'Pemohon': 'Purchasing Staff',
    'Customer': 'PT. Samator Indo Gas Tbk',
    'Nominal': 33600000,
    'Keterangan': 'Pengajuan PO senilai > Rp 25 Juta membutuhkan persetujuan Purchasing Manager',
    'Status': 'Menunggu',
    'Approved By': '',
    'Approved At': '',
    'Catatan': ''
  },
  {
    _rowIndex: 3,
    'ID Approval': 'APR-20260801-002',
    'Tanggal': '2026-08-01',
    'Modul': 'Purchase Request',
    'Data ID': 'PR-20260801-001',
    'Pemohon': 'Purchasing Staff',
    'Customer': 'PT. Indo Bharat Rayon',
    'Nominal': 8500000,
    'Keterangan': 'Persetujuan kredit payment mode (30 Hari)',
    'Status': 'Disetujui',
    'Approved By': 'Deo Fajar Andyka (Manager)',
    'Approved At': '2026-08-01 14:20',
    'Catatan': 'Disetujui, customer terpercaya.'
  }
];

export const initialNpwpDatabase: NpwpRecord[] = [
  { NAMA: 'PT. SAMATOR INDO GAS TBK', NPWP: '01.324.556.2-054.000', ALAMAT: 'Jl. Raya Rungkut Industri No. 12, Surabaya, Jawa Timur' },
  { NAMA: 'PT. INDO BHARAT RAYON', NPWP: '01.123.456.7-051.000', ALAMAT: 'Jl. Sutan Syahrir No. 10, Purwakarta, Jawa Barat' },
  { NAMA: 'CV. CAHAYA ABADI TEKNIK', NPWP: '02.441.980.1-052.000', ALAMAT: 'Jl. Raya Krian No. 88, Sidoarjo, Jawa Timur' },
  { NAMA: 'PT. SANTOS JAYA ABADI', NPWP: '01.888.777.3-053.000', ALAMAT: 'Jl. Raya Taman No. 1, Sepanjang, Sidoarjo' },
  { NAMA: 'PT. PETROKIMIA GRESIK', NPWP: '01.001.234.5-055.000', ALAMAT: 'Jl. Jenderal Ahmad Yani, Gresik, Jawa Timur' }
];

export const MOCK_PURCHASE_REQUESTS = initialPurchaseRequests;

export const MOCK_PURCHASE_ORDERS = initialPurchaseOrders;
export const MOCK_QUOTATIONS = initialQuotations;
export const MOCK_INVOICES = initialInvoices;
export const MOCK_DELIVERY_STATUSES = initialDeliveryStatuses;
export const MOCK_SUPPLIERS = initialSuppliers;
export const MOCK_APPROVALS = initialApprovals;
export const MOCK_NPWP_DATABASE = initialNpwpDatabase;
export const MOCK_ACTIVITY_LOGS = [
  { time: '10:45', user: 'Admin Purchasing', action: 'LOGIN', detail: 'Sistem Purchasing v3.0 Aktif' },
  { time: '10:30', user: 'Purchasing Staff', action: 'CREATE', detail: 'Purchase Order PO-20260801-002 dibuat' },
  { time: '09:15', user: 'Deo Fajar', action: 'APPROVE', detail: 'Approval APR-20260801-002 disetujui' }
];

