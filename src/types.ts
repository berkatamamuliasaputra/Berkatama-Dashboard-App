export interface User {
  username: string;
  name: string;
  role: string;
}

export interface PurchaseRequest {
  _rowIndex?: number;
  'ID Request': string;
  'Tanggal': string;
  'Nama Customer': string;
  'Nama Item': string;
  'Qty': number | string;
  'Uom': string;
  'Spesifikasi'?: string;
  'Harga Beli': number | string;
  'Total Harga Beli'?: number | string;
  'Harga Jual': number | string;
  'Total Harga Jual'?: number | string;
  'PPN 11%'?: number | string;
  'PPN 12%'?: number | string;
  'DPP + (PPN 11%)'?: number | string;
  'Online Shop Link'?: string;
  'PMT Mode': string; // 'KREDIT' | 'CASH'
  'File'?: string;
}

export interface PurchaseOrder {
  _rowIndex?: number;
  'ID Order': string;
  'Tanggal': string;
  'No PO': string;
  'Nama Customer': string;
  'Nama Item': string;
  'Qty': number | string;
  'Uom': string;
  'Vendor/Supplier': string;
  'Harga Beli': number | string;
  'Total Beli'?: number | string;
  'Harga Jual': number | string;
  'Profit'?: number | string;
  'Total Jual'?: number | string;
  'PPN 11%'?: number | string;
  'PPN 12%'?: number | string;
  'DPP PPH'?: number | string;
  'Grand Total + (DPP + PPN11%)'?: number | string;
  'Tgl Kirim'?: string;
  'Nomor Surat Jalan'?: string;
  'File PO'?: string;
  'Link Pembelian'?: string;
}

export interface QuotationItem {
  id: number;
  namaItem: string;
  gambar?: string;
  jumlah: number;
  satuan: string;
  hargaModal: number;
  profit: number; // Cost Ratio, e.g. 0.8
  hargaSatuan: number;
}

export interface Quotation {
  _rowIndex?: number;
  'ID Quotation': string;
  'Tanggal': string;
  'Nama Customer': string;
  'Nama Perusahaan': string;
  'Nama Barang': string;
  'Qty': number | string;
  'Uom': string;
  'Harga': number | string;
  'Total Harga'?: number | string;
  'Harga (PPN)'?: number | string;
  'Grand Total + (PPN 11%)'?: number | string;
  'Mode PPN'?: string; // 'PPN 11%' | 'PPN 12%' | 'NON PPN'
  'Status': string; // 'QUOTATION' | 'INQ PO' | 'DEAL' | 'CANCEL'
  'File'?: string;
  'itemsJson'?: string;
  'catatan'?: string;
  'lainLain'?: number;
}

export interface InvoiceItem {
  id: number;
  namaBarang: string;
  qty: number;
  unit: string;
  hargaSatuan: number;
}

export interface Invoice {
  _rowIndex?: number;
  'ID Invoice': string;
  'Tipe Invoice'?: string; // 'TEMPO' | 'KODE007' | 'COD' | 'NONPPN'
  'Tanggal Invoice': string;
  'Nama Customer': string;
  'Nama Perusahaan'?: string;
  'Nomer PO'?: string;
  'Invoice Title': string;
  'Nominal Tagihan': number | string;
  'Harga Jual'?: number | string;
  'Potongan Harga'?: number | string;
  'Uang Muka'?: number | string;
  'DPP'?: number | string;
  'PPN 12%'?: number | string;
  'Jatuh Tempo': string;
  'Term of Payment': string;
  'Nomor Faktur Pajak'?: string;
  'NPWP'?: string;
  'Alamat'?: string;
  'Keterangan'?: string;
  'Status': string; // 'Belum Lunas' | 'Paid' | 'Overdue'
  'Faktur Invoice File'?: string;
  'itemsJson'?: string;
}

export interface SuratJalanItem {
  id: number;
  banyaknya: string | number;
  namaBarang: string;
}

export interface DeliveryStatus {
  _rowIndex?: number;
  'Tanggal': string;
  'Customer Name': string;
  'Alamat Customer'?: string;
  'Sending Item': string;
  'No. PO': string;
  'Man Power': string;
  'Status': string;
  'Surat Jalan'?: string;
  'No. Surat Jalan'?: string;
  'itemsJson'?: string;
}

export interface Supplier {
  _rowIndex?: number;
  'ID Supplier': string;
  'Kategori': string;
  'Nama Perusahaan Vendor/Supplier': string;
  'Nama Barang': string;
  'Harga Barang': number | string;
  'Alamat Kantor / Toko': string;
  'PIC': string;
  'No Tlp/WA': string;
}

export interface Approval {
  _rowIndex?: number;
  'ID Approval': string;
  'Tanggal': string;
  'Modul': string;
  'Data ID': string;
  'Pemohon': string;
  'Customer': string;
  'Nominal': number | string;
  'Keterangan': string;
  'Status': 'Menunggu' | 'Disetujui' | 'Ditolak';
  'Approved By'?: string;
  'Approved At'?: string;
  'Catatan'?: string;
}

export interface NpwpRecord {
  NAMA: string;
  NPWP: string;
  ALAMAT: string;
}

export interface NotificationItem {
  id: string;
  sec: string;
  action: 'Tambah' | 'Edit' | 'Hapus' | 'Approval';
  label: string;
  icon: string;
  color: string;
  bg: string;
  nav: string;
  dataId: string;
  customer: string;
  time: string;
  rowIndex?: number | null;
  read: boolean;
}

export interface ActivityLogItem {
  action: 'Tambah' | 'Edit' | 'Hapus' | 'Approval';
  sec: string;
  id: string;
  customer: string;
  label: string;
  icon: string;
  color: string;
  time: string;
}

export interface ActivityLog {
  time: string;
  user: string;
  action: string;
  detail: string;
}

