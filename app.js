/* Kasir UMKM — Maliki Studio (malikisaputra.biz.id). Lisensi MIT. */
(function () {
  'use strict';

  // ---------- Penyimpanan (localStorage, offline) ----------
  var KUNCI = 'kasir-umkm-v1';
  var WARNA = ['#0f766e', '#b45309', '#7c3aed', '#be123c', '#1d4ed8', '#15803d', '#a16207', '#0e7490'];

  function dataKosong() {
    return {
      toko: { nama: 'Toko Saya', alamat: '', telp: '', footer: 'Terima kasih sudah belanja!', rekening: '' },
      kategori: [], produk: [], transaksi: [],
      kasir: [{ id: 'k1', nama: 'Admin', pin: '1234', peran: 'admin' }],
      nomor: 0
    };
  }

  function dataContoh() {
    var d = dataKosong();
    d.toko = { nama: 'Kopi Senja', alamat: 'Jl. Merdeka No. 12, Bandung', telp: '0812-0000-1234', footer: 'Terima kasih, sampai jumpa lagi!', rekening: 'Bank Contoh 0000000000 a.n. Kopi Senja' };
    d.kategori = ['Kopi', 'Non-Kopi', 'Makanan', 'Camilan'];
    var p = [
      ['Kopi Susu Gula Aren', 'Kopi', 40, [['Reguler', 18000], ['Large', 23000]]],
      ['Americano', 'Kopi', 50, [['Hot', 15000], ['Ice', 17000]]],
      ['Cappuccino', 'Kopi', 30, [['Reguler', 22000]]],
      ['Matcha Latte', 'Non-Kopi', 25, [['Reguler', 22000], ['Large', 27000]]],
      ['Cokelat Panas', 'Non-Kopi', 20, [['Reguler', 18000]]],
      ['Teh Lemon', 'Non-Kopi', 60, [['Reguler', 10000]]],
      ['Nasi Goreng Kampung', 'Makanan', 15, [['Biasa', 22000], ['Spesial', 28000]]],
      ['Mie Goreng', 'Makanan', 4, [['Biasa', 18000]]],
      ['Roti Bakar', 'Camilan', 18, [['Cokelat', 15000], ['Keju', 17000], ['Campur', 19000]]],
      ['Kentang Goreng', 'Camilan', 22, [['Reguler', 14000]]],
      ['Pisang Goreng', 'Camilan', 0, [['Isi 5', 12000]]]
    ];
    d.produk = p.map(function (x, i) {
      return { id: 'p' + (i + 1), nama: x[0], kategori: x[1], stok: x[2], varian: x[3].map(function (v) { return { nama: v[0], harga: v[1] }; }) };
    });
    d.kasir.push({ id: 'k2', nama: 'Sari', pin: '1111', peran: 'kasir' });
    // transaksi contoh 30 hari terakhir
    var acak = semai(7);
    var sekarang = new Date();
    for (var h = 29; h >= 0; h--) {
      var n = 3 + Math.floor(acak() * 7);
      for (var t = 0; t < n; t++) {
        var w = new Date(sekarang); w.setDate(w.getDate() - h);
        w.setHours(8 + Math.floor(acak() * 13), Math.floor(acak() * 60), 0, 0);
        if (w > sekarang) continue;
        var items = [], m = 1 + Math.floor(acak() * 3);
        for (var j = 0; j < m; j++) {
          var pr = d.produk[Math.floor(acak() * d.produk.length)], vr = pr.varian[Math.floor(acak() * pr.varian.length)];
          items.push({ pid: pr.id, nama: pr.nama, varian: vr.nama, harga: vr.harga, qty: 1 + Math.floor(acak() * 2) });
        }
        var sub = items.reduce(function (s, it) { return s + it.harga * it.qty; }, 0);
        var mt = ['tunai', 'tunai', 'qris', 'transfer'][Math.floor(acak() * 4)];
        var bayar = mt === 'tunai' ? Math.ceil(sub / 10000) * 10000 : sub;
        d.nomor++;
        d.transaksi.push({ id: noTrx(w, d.nomor), waktu: w.toISOString(), kasir: acak() > .5 ? 'Sari' : 'Admin', items: items, subtotal: sub, diskon: 0, total: sub, metode: mt, bayar: bayar, kembali: bayar - sub });
      }
    }
    return d;
  }
  function semai(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  var D;
  function muat() {
    try { D = JSON.parse(localStorage.getItem(KUNCI)); } catch (e) { D = null; }
    if (!D || !D.produk) { D = dataContoh(); simpan(); }
  }
  function simpan() { try { localStorage.setItem(KUNCI, JSON.stringify(D)); } catch (e) { toast('Gagal menyimpan: memori penuh'); } }

  // ---------- Utilitas ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function rp(n) { return 'Rp' + Math.round(n || 0).toLocaleString('id-ID'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function dua(n) { return (n < 10 ? '0' : '') + n; }
  function tglKey(d) { return d.getFullYear() + '-' + dua(d.getMonth() + 1) + '-' + dua(d.getDate()); }
  function noTrx(d, n) { return 'TRX' + String(d.getFullYear()).slice(2) + dua(d.getMonth() + 1) + dua(d.getDate()) + '-' + String(n).padStart(4, '0'); }
  function fmtWaktu(iso) { var d = new Date(iso); return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + dua(d.getHours()) + ':' + dua(d.getMinutes()); }
  function warnaDari(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return WARNA[h % WARNA.length]; }
  function inisial(s) { return s.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  var tTimer;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('tampil'); clearTimeout(tTimer); tTimer = setTimeout(function () { t.classList.remove('tampil'); }, 2200); }
  function unduh(nama, isi, tipe) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([isi], { type: tipe }));
    a.download = nama; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csvSel(v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function parseCSV(teks) {
    var baris = [], sel = '', row = [], kutip = false;
    for (var i = 0; i < teks.length; i++) {
      var c = teks[i];
      if (kutip) {
        if (c === '"' && teks[i + 1] === '"') { sel += '"'; i++; }
        else if (c === '"') kutip = false; else sel += c;
      } else if (c === '"') kutip = true;
      else if (c === ',') { row.push(sel); sel = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && teks[i + 1] === '\n') i++; row.push(sel); baris.push(row); row = []; sel = ''; }
      else sel += c;
    }
    if (sel || row.length) { row.push(sel); baris.push(row); }
    return baris.filter(function (r) { return r.join('').trim(); });
  }

  // ---------- Sesi kasir ----------
  var pengguna = null, pinBuffer = '', kasirDipilih = null;
  function isAdmin() { return pengguna && pengguna.peran === 'admin'; }

  function tampilMasuk() {
    $('#aplikasi').hidden = true; $('#layarMasuk').hidden = false;
    $('#masukToko').textContent = D.toko.nama;
    kasirDipilih = D.kasir[0]; pinBuffer = '';
    $('#daftarKasir').innerHTML = D.kasir.map(function (k) { return '<button data-id="' + k.id + '">' + esc(k.nama) + '</button>'; }).join('');
    $$('#daftarKasir button').forEach(function (b) {
      b.classList.toggle('aktif', b.dataset.id === kasirDipilih.id);
      b.onclick = function () { kasirDipilih = D.kasir.find(function (k) { return k.id === b.dataset.id; }); pinBuffer = ''; tampilMasuk.titik(); $$('#daftarKasir button').forEach(function (x) { x.classList.toggle('aktif', x === b); }); };
    });
    tampilMasuk.titik();
  }
  tampilMasuk.titik = function () { $$('#pinTitik i').forEach(function (i, n) { i.classList.toggle('isi', n < pinBuffer.length); }); };
  function ketikPin(k) {
    if (k === 'hapus') pinBuffer = pinBuffer.slice(0, -1);
    else if (pinBuffer.length < 4) pinBuffer += k;
    tampilMasuk.titik();
    if (pinBuffer.length === 4) {
      if (kasirDipilih && kasirDipilih.pin === pinBuffer) { masuk(kasirDipilih); }
      else { var t = $('#pinTitik'); t.classList.add('salah'); setTimeout(function () { t.classList.remove('salah'); pinBuffer = ''; tampilMasuk.titik(); }, 350); }
    }
  }
  function masuk(k) {
    pengguna = k; try { sessionStorage.setItem('kasir-sesi', k.id); } catch (e) {}
    $('#layarMasuk').hidden = true; $('#aplikasi').hidden = false;
    $('#namaKasir').textContent = k.nama + (k.peran === 'admin' ? ' · admin' : '');
    $('#namaTokoNav').textContent = D.toko.nama;
    $$('[data-hal="produk"],[data-hal="atur"]').forEach(function (b) { b.hidden = !isAdmin(); });
    buka('kasir');
  }

  // ---------- Navigasi ----------
  function buka(hal) {
    $$('.hal').forEach(function (s) { s.classList.toggle('aktif', s.id === 'hal-' + hal); });
    $$('.nav').forEach(function (b) { b.classList.toggle('aktif', b.dataset.hal === hal); });
    ({ kasir: renderPOS, produk: renderKelola, riwayat: renderRiwayat, laporan: renderLaporan, atur: renderAtur })[hal]();
  }

  // ---------- POS ----------
  var keranjang = [], katAktif = 'Semua';
  function stokTerpakai(pid) { return keranjang.filter(function (i) { return i.pid === pid; }).reduce(function (s, i) { return s + i.qty; }, 0); }

  function renderPOS() {
    var kats = ['Semua'].concat(D.kategori);
    $('#chipKategori').innerHTML = kats.map(function (k) { return '<button class="chip' + (k === katAktif ? ' aktif' : '') + '" data-k="' + esc(k) + '">' + esc(k) + '</button>'; }).join('');
    var q = $('#cariProduk').value.trim().toLowerCase();
    var list = D.produk.filter(function (p) { return (katAktif === 'Semua' || p.kategori === katAktif) && p.nama.toLowerCase().indexOf(q) > -1; });
    $('#gridProduk').innerHTML = list.length ? list.map(function (p) {
      var sisa = p.stok - stokTerpakai(p.id);
      var min = Math.min.apply(null, p.varian.map(function (v) { return v.harga; }));
      return '<button class="kartu-produk" data-id="' + p.id + '"' + (sisa <= 0 ? ' disabled' : '') + '>' +
        '<div class="thumb" style="background:' + warnaDari(p.kategori + p.nama) + '">' + esc(inisial(p.nama)) + '</div>' +
        '<b>' + esc(p.nama) + '</b><span class="harga">' + (p.varian.length > 1 ? 'mulai ' : '') + rp(min) + '</span>' +
        '<span class="stok' + (sisa <= 5 ? ' tipis' : '') + '">' + (sisa <= 0 ? 'Stok habis' : 'Stok ' + sisa) + '</span></button>';
    }).join('') : '<p class="kosong">Produk tidak ditemukan.</p>';
    renderKeranjang();
  }

  function tambahKeKeranjang(p, v) {
    if (p.stok - stokTerpakai(p.id) <= 0) return toast('Stok ' + p.nama + ' habis');
    var ada = keranjang.find(function (i) { return i.pid === p.id && i.varian === v.nama; });
    if (ada) ada.qty++; else keranjang.push({ pid: p.id, nama: p.nama, varian: v.nama, harga: v.harga, qty: 1 });
    renderPOS();
  }

  function hitung() {
    var sub = keranjang.reduce(function (s, i) { return s + i.harga * i.qty; }, 0);
    var nilai = Math.max(0, parseFloat($('#inDiskon').value) || 0);
    var dis = $('#tipeDiskon').value === 'persen' ? Math.round(sub * Math.min(nilai, 100) / 100) : Math.min(nilai, sub);
    return { subtotal: sub, diskon: dis, total: sub - dis };
  }

  function renderKeranjang() {
    var h = hitung(), jml = keranjang.reduce(function (s, i) { return s + i.qty; }, 0);
    $('#kerDaftar').innerHTML = keranjang.length ? keranjang.map(function (i, n) {
      return '<li><span class="nm">' + esc(i.nama) + '</span><span class="jml"><span class="qty"><button data-n="' + n + '" data-d="-1" aria-label="Kurangi">−</button><span>' + i.qty + '</span><button data-n="' + n + '" data-d="1" aria-label="Tambah">+</button></span><b>' + rp(i.harga * i.qty) + '</b></span><span class="vr">' + esc(i.varian) + ' · ' + rp(i.harga) + '</span></li>';
    }).join('') : '<li class="kosong" style="display:block;border:0">Belum ada pesanan.<br>Ketuk produk untuk menambah.</li>';
    $('#kSubtotal').textContent = rp(h.subtotal);
    $('#kTotal').textContent = rp(h.total);
    $('#btnBayar').disabled = !keranjang.length;
    $('#fabJumlah').textContent = jml; $('#fabTotal').textContent = rp(h.total);
  }

  function dialog(html, siap) {
    var d = $('#dlg'); $('#dlgIsi').innerHTML = html;
    if (!d.open) d.showModal();
    if (siap) siap($('#dlgIsi'));
    return d;
  }
  function tutupDialog() { var d = $('#dlg'); if (d.open) d.close(); }

  function pilihVarian(p) {
    if (p.varian.length === 1) return tambahKeKeranjang(p, p.varian[0]);
    dialog('<h3>' + esc(p.nama) + '</h3><div class="pilih-varian">' + p.varian.map(function (v, i) {
      return '<button type="button" data-i="' + i + '"><span>' + esc(v.nama) + '</span><span>' + rp(v.harga) + '</span></button>';
    }).join('') + '</div><div class="dlg-aksi"><button class="tombol" value="batal">Batal</button></div>', function (f) {
      $$('[data-i]', f).forEach(function (b) { b.onclick = function () { tambahKeKeranjang(p, p.varian[+b.dataset.i]); tutupDialog(); }; });
    });
  }

  function dialogBayar() {
    var h = hitung();
    var cepat = [h.total, Math.ceil(h.total / 5000) * 5000, Math.ceil(h.total / 10000) * 10000, Math.ceil(h.total / 50000) * 50000, 100000]
      .filter(function (v, i, a) { return v >= h.total && a.indexOf(v) === i; });
    dialog('<h3>Pembayaran</h3><div class="total-besar">' + rp(h.total) + '</div>' +
      '<div class="metode">' + ['tunai', 'qris', 'transfer'].map(function (m, i) { return '<label><input type="radio" name="metode" value="' + m + '"' + (i ? '' : ' checked') + '>' + { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer' }[m] + '</label>'; }).join('') + '</div>' +
      '<div id="areaTunai" class="form"><label>Uang diterima<input id="inBayar" type="number" inputmode="numeric" min="0" value="' + h.total + '"></label>' +
      '<div class="uang-cepat">' + cepat.map(function (v) { return '<button type="button" data-v="' + v + '">' + (v === h.total ? 'Uang pas' : rp(v)) + '</button>'; }).join('') + '</div>' +
      '<div class="kembali" id="kembali"><span>Kembalian</span><span>Rp0</span></div></div>' +
      '<div id="areaQris" class="qris" hidden><img src="qris.svg" alt="QRIS toko"><p class="redup kecil">Minta pelanggan memindai, cek notifikasi masuk, lalu selesaikan.</p></div>' +
      '<div id="areaTransfer" hidden class="panel" style="margin:0"><b>' + esc(D.toko.rekening || 'Atur nomor rekening di Pengaturan') + '</b><p class="redup kecil" style="margin:6px 0 0">Cek mutasi sebelum menyelesaikan.</p></div>' +
      '<div class="dlg-aksi"><button class="tombol" value="batal">Batal</button><button class="tombol utama" type="button" id="btnSelesai">Selesaikan</button></div>', function (f) {
        var inB = $('#inBayar', f);
        function upd() {
          var m = $('input[name=metode]:checked', f).value;
          $('#areaTunai', f).hidden = m !== 'tunai'; $('#areaQris', f).hidden = m !== 'qris'; $('#areaTransfer', f).hidden = m !== 'transfer';
          var k = (parseFloat(inB.value) || 0) - h.total, el = $('#kembali', f);
          el.classList.toggle('kurang', k < 0);
          el.innerHTML = '<span>' + (k < 0 ? 'Kurang' : 'Kembalian') + '</span><span>' + rp(Math.abs(k)) + '</span>';
        }
        $$('input[name=metode]', f).forEach(function (r) { r.onchange = upd; });
        inB.oninput = upd;
        $$('[data-v]', f).forEach(function (b) { b.onclick = function () { inB.value = b.dataset.v; upd(); }; });
        $('#btnSelesai', f).onclick = function () {
          var m = $('input[name=metode]:checked', f).value;
          var bayar = m === 'tunai' ? (parseFloat(inB.value) || 0) : h.total;
          if (bayar < h.total) return toast('Uang diterima masih kurang');
          selesaikan(m, bayar);
        };
        upd(); inB.select();
      });
  }

  function selesaikan(metode, bayar) {
    var h = hitung(), w = new Date();
    D.nomor = (D.nomor || 0) + 1;
    var trx = { id: noTrx(w, D.nomor), waktu: w.toISOString(), kasir: pengguna.nama, items: keranjang.map(function (i) { return Object.assign({}, i); }), subtotal: h.subtotal, diskon: h.diskon, total: h.total, metode: metode, bayar: bayar, kembali: bayar - h.total };
    trx.items.forEach(function (i) { var p = D.produk.find(function (x) { return x.id === i.pid; }); if (p) p.stok = Math.max(0, p.stok - i.qty); });
    D.transaksi.push(trx); simpan();
    keranjang = []; $('#inDiskon').value = 0; $('#panelKeranjang').classList.remove('buka');
    dialog('<h3>Transaksi berhasil ✓</h3><div class="total-besar">' + rp(trx.total) + '</div>' +
      (metode === 'tunai' ? '<div class="kembali"><span>Kembalian</span><span>' + rp(trx.kembali) + '</span></div>' : '') +
      '<p class="redup kecil" style="text-align:center;margin:0">' + trx.id + '</p>' +
      '<div class="dlg-aksi"><button class="tombol" type="button" id="btnCetak">Cetak struk</button><button class="tombol utama" value="ok">Transaksi baru</button></div>', function (f) {
        $('#btnCetak', f).onclick = function () { cetak(trx); };
      });
    renderPOS();
  }

  // ---------- Struk 58mm ----------
  function cetak(trx) {
    var t = D.toko;
    $('#struk').innerHTML = '<div class="tengah"><h4>' + esc(t.nama) + '</h4>' + (t.alamat ? '<div>' + esc(t.alamat) + '</div>' : '') + (t.telp ? '<div>' + esc(t.telp) + '</div>' : '') + '</div>' +
      '<div class="gr"></div><div>' + trx.id + '</div><div>' + fmtWaktu(trx.waktu) + '</div><div>Kasir: ' + esc(trx.kasir) + '</div><div class="gr"></div>' +
      trx.items.map(function (i) { return '<div>' + esc(i.nama) + (i.varian ? ' (' + esc(i.varian) + ')' : '') + '</div><div class="br"><span>' + i.qty + ' x ' + rp(i.harga) + '</span><span>' + rp(i.qty * i.harga) + '</span></div>'; }).join('') +
      '<div class="gr"></div><div class="br"><span>Subtotal</span><span>' + rp(trx.subtotal) + '</span></div>' +
      (trx.diskon ? '<div class="br"><span>Diskon</span><span>-' + rp(trx.diskon) + '</span></div>' : '') +
      '<div class="br"><b>TOTAL</b><b>' + rp(trx.total) + '</b></div>' +
      '<div class="br"><span>' + trx.metode.toUpperCase() + '</span><span>' + rp(trx.bayar) + '</span></div>' +
      (trx.metode === 'tunai' ? '<div class="br"><span>Kembali</span><span>' + rp(trx.kembali) + '</span></div>' : '') +
      '<div class="gr"></div><div class="tengah">' + esc(t.footer) + '</div>';
    window.print();
  }

  // ---------- Kelola produk ----------
  function renderKelola() {
    var q = $('#cariKelola').value.trim().toLowerCase();
    var list = D.produk.filter(function (p) { return p.nama.toLowerCase().indexOf(q) > -1; });
    $('#tabelProduk').innerHTML = '<thead><tr><th>Produk</th><th>Kategori</th><th>Varian &amp; harga</th><th>Stok</th><th></th></tr></thead><tbody>' +
      (list.map(function (p) {
        return '<tr><td><b>' + esc(p.nama) + '</b></td><td>' + esc(p.kategori) + '</td><td>' + p.varian.map(function (v) { return esc(v.nama) + ' ' + rp(v.harga); }).join('<br>') + '</td>' +
          '<td><span class="lencana' + (p.stok <= 5 ? ' merah' : '') + '">' + p.stok + '</span></td>' +
          '<td style="text-align:right;white-space:nowrap"><button class="tautan" data-stok="' + p.id + '">+Stok</button> <button class="tautan" data-edit="' + p.id + '">Ubah</button></td></tr>';
      }).join('') || '<tr><td colspan="5" class="kosong">Belum ada produk.</td></tr>') + '</tbody>';
  }

  function formProduk(p) {
    var baru = !p; p = p || { nama: '', kategori: D.kategori[0] || '', stok: 0, varian: [{ nama: 'Reguler', harga: 0 }] };
    function barisV(v) { return '<div class="varian-baris"><input placeholder="Nama varian" value="' + esc(v.nama) + '" required><input type="number" min="0" placeholder="Harga" value="' + v.harga + '" required><button type="button" aria-label="Hapus varian">×</button></div>'; }
    dialog('<h3>' + (baru ? 'Tambah' : 'Ubah') + ' produk</h3><div class="form">' +
      '<label>Nama<input id="fNama" required value="' + esc(p.nama) + '"></label>' +
      '<label>Kategori<select id="fKat">' + D.kategori.map(function (k) { return '<option' + (k === p.kategori ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select></label>' +
      '<label>Stok<input id="fStok" type="number" min="0" value="' + p.stok + '"></label>' +
      '<div><b class="kecil">Varian &amp; harga</b><div id="fVarian" class="form" style="margin-top:6px">' + p.varian.map(barisV).join('') + '</div>' +
      '<button type="button" class="tautan" id="fTambahV">+ varian</button></div></div>' +
      '<div class="dlg-aksi">' + (baru ? '' : '<button type="button" class="tombol bahaya" id="fHapus" style="margin-right:auto">Hapus</button>') +
      '<button class="tombol" value="batal" formnovalidate>Batal</button><button class="tombol utama" type="button" id="fSimpan">Simpan</button></div>', function (f) {
        function ikatHapus() { $$('.varian-baris button', f).forEach(function (b) { b.onclick = function () { if ($$('.varian-baris', f).length > 1) b.parentNode.remove(); }; }); }
        ikatHapus();
        $('#fTambahV', f).onclick = function () { $('#fVarian', f).insertAdjacentHTML('beforeend', barisV({ nama: '', harga: 0 })); ikatHapus(); };
        if (!baru) $('#fHapus', f).onclick = function () { if (confirm('Hapus ' + p.nama + '?')) { D.produk = D.produk.filter(function (x) { return x.id !== p.id; }); simpan(); tutupDialog(); renderKelola(); } };
        $('#fSimpan', f).onclick = function () {
          var nama = $('#fNama', f).value.trim();
          var varian = $$('.varian-baris', f).map(function (r) { var i = $$('input', r); return { nama: i[0].value.trim() || 'Reguler', harga: Math.max(0, +i[1].value || 0) }; });
          if (!nama) return toast('Nama produk wajib diisi');
          if (!D.kategori.length) return toast('Buat kategori dulu');
          var data = { nama: nama, kategori: $('#fKat', f).value, stok: Math.max(0, parseInt($('#fStok', f).value, 10) || 0), varian: varian };
          if (baru) D.produk.push(Object.assign({ id: uid() }, data)); else Object.assign(p, data);
          simpan(); tutupDialog(); renderKelola(); toast('Produk disimpan');
        };
      });
  }

  function formKategori() {
    function isi() {
      return '<h3>Kategori</h3><ul class="daftar-kasir">' + D.kategori.map(function (k, i) {
        var n = D.produk.filter(function (p) { return p.kategori === k; }).length;
        return '<li><span>' + esc(k) + ' <span class="redup kecil">(' + n + ' produk)</span></span><button type="button" class="tautan" data-h="' + i + '"' + (n ? ' disabled title="Masih dipakai"' : '') + '>Hapus</button></li>';
      }).join('') + '</ul><div class="form sebaris" style="grid-template-columns:1fr auto"><input id="kBaru" placeholder="Kategori baru"><button type="button" class="tombol" id="kTambah">Tambah</button></div><div class="dlg-aksi"><button class="tombol utama" value="ok">Selesai</button></div>';
    }
    function ikat(f) {
      $('#kTambah', f).onclick = function () { var v = $('#kBaru', f).value.trim(); if (v && D.kategori.indexOf(v) < 0) { D.kategori.push(v); simpan(); dialog(isi(), ikat); } };
      $$('[data-h]', f).forEach(function (b) { b.onclick = function () { D.kategori.splice(+b.dataset.h, 1); simpan(); dialog(isi(), ikat); }; });
    }
    dialog(isi(), ikat);
  }

  // ---------- Riwayat ----------
  function trxFilter() {
    var t = $('#filterTanggal').value;
    return D.transaksi.filter(function (x) { return !t || tglKey(new Date(x.waktu)) === t; }).slice().reverse();
  }
  function renderRiwayat() {
    var list = trxFilter();
    $('#daftarTrx').innerHTML = list.length ? list.slice(0, 200).map(function (x) {
      return '<div class="trx"><div><b>' + x.id + '</b><div class="meta">' + fmtWaktu(x.waktu) + ' · ' + esc(x.kasir) + ' · ' + x.metode.toUpperCase() + ' · ' + x.items.reduce(function (s, i) { return s + i.qty; }, 0) + ' item</div>' +
        '<div class="meta">' + x.items.map(function (i) { return esc(i.nama) + ' ×' + i.qty; }).join(', ') + '</div></div><div class="tot">' + rp(x.total) + '</div>' +
        '<div class="aksi"><button class="tombol" data-cetak="' + x.id + '">Cetak</button>' + (isAdmin() ? '<button class="tombol bahaya" data-hapus="' + x.id + '">Batalkan</button>' : '') + '</div></div>';
    }).join('') : '<p class="kosong">Belum ada transaksi.</p>';
  }

  function eksporTrx() {
    var rows = [['id', 'waktu', 'kasir', 'produk', 'varian', 'qty', 'harga', 'subtotal_item', 'diskon_trx', 'total_trx', 'metode']];
    trxFilter().reverse().forEach(function (x) { x.items.forEach(function (i) { rows.push([x.id, x.waktu, x.kasir, i.nama, i.varian, i.qty, i.harga, i.qty * i.harga, x.diskon, x.total, x.metode]); }); });
    unduh('transaksi-' + ($('#filterTanggal').value || 'semua') + '.csv', '﻿' + rows.map(function (r) { return r.map(csvSel).join(','); }).join('\n'), 'text/csv');
  }

  // ---------- Laporan ----------
  var modeLap = 'hari';
  function ringkasan(list) {
    var omzet = 0, item = 0, perProduk = {}, metode = { tunai: 0, qris: 0, transfer: 0 };
    list.forEach(function (x) {
      omzet += x.total; metode[x.metode] = (metode[x.metode] || 0) + x.total;
      x.items.forEach(function (i) { item += i.qty; var k = i.nama; perProduk[k] = perProduk[k] || { nama: k, qty: 0, nilai: 0 }; perProduk[k].qty += i.qty; perProduk[k].nilai += i.qty * i.harga; });
    });
    var top = Object.keys(perProduk).map(function (k) { return perProduk[k]; }).sort(function (a, b) { return b.qty - a.qty || b.nilai - a.nilai; });
    return { omzet: omzet, trx: list.length, item: item, rata: list.length ? omzet / list.length : 0, top: top, metode: metode };
  }
  function renderLaporan() {
    var inp = $('#tglLaporan'); if (!inp.value) inp.value = tglKey(new Date());
    var t = new Date(inp.value + 'T00:00:00');
    var list = D.transaksi.filter(function (x) { var d = new Date(x.waktu); return modeLap === 'hari' ? tglKey(d) === inp.value : d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth(); });
    var r = ringkasan(list);
    $('#kartuAngka').innerHTML = '<div class="angka sorot"><small>Omzet</small><b>' + rp(r.omzet) + '</b></div><div class="angka"><small>Transaksi</small><b>' + r.trx + '</b></div><div class="angka"><small>Item terjual</small><b>' + r.item + '</b></div><div class="angka"><small>Rata-rata/struk</small><b>' + rp(r.rata) + '</b></div>';
    var batang = [];
    if (modeLap === 'hari') {
      $('#judulGrafik').textContent = 'Penjualan per jam';
      for (var j = 7; j <= 22; j++) batang.push({ l: j, v: 0 });
      list.forEach(function (x) { var h = new Date(x.waktu).getHours(); var b = batang.find(function (z) { return z.l === h; }); if (b) b.v += x.total; });
    } else {
      $('#judulGrafik').textContent = 'Penjualan per tanggal';
      var hari = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
      for (var d = 1; d <= hari; d++) batang.push({ l: d, v: 0 });
      list.forEach(function (x) { batang[new Date(x.waktu).getDate() - 1].v += x.total; });
    }
    var maks = Math.max.apply(null, batang.map(function (b) { return b.v; }).concat([1]));
    $('#grafik').innerHTML = batang.map(function (b, i) {
      var lbl = modeLap === 'bulan' && i % 5 !== 0 && b.l !== batang.length ? '&nbsp;' : b.l;
      return '<div class="kol" title="' + b.l + ': ' + rp(b.v) + '"><div class="batang' + (b.v ? '' : ' nol') + '" style="height:' + (b.v / maks * 100) + '%"></div><small>' + lbl + '</small></div>';
    }).join('');
    $('#terlaris').innerHTML = r.top.slice(0, 7).map(function (p) { return '<li><span>' + esc(p.nama) + '</span><b>' + p.qty + '×</b></li>'; }).join('') || '<li style="display:block" class="redup">Belum ada penjualan.</li>';
    $('#metodeRingkas').innerHTML = ['tunai', 'qris', 'transfer'].map(function (m) { return '<div><small class="redup">' + m.toUpperCase() + '</small><b>' + rp(r.metode[m]) + '</b></div>'; }).join('');
  }

  // ---------- Pengaturan ----------
  function renderAtur() {
    var f = $('#formToko');
    ['nama', 'alamat', 'telp', 'footer', 'rekening'].forEach(function (k) { f.elements[k].value = D.toko[k] || ''; });
    $('#daftarKasirAtur').innerHTML = D.kasir.map(function (k) {
      return '<li><span><b>' + esc(k.nama) + '</b> <span class="lencana">' + k.peran + '</span></span>' + (k.id === pengguna.id ? '<span class="redup kecil">sedang masuk</span>' : '<button class="tautan" data-hk="' + k.id + '">Hapus</button>') + '</li>';
    }).join('');
  }

  function eksporProdukCSV() {
    var rows = [['nama', 'kategori', 'stok', 'varian']].concat(D.produk.map(function (p) { return [p.nama, p.kategori, p.stok, p.varian.map(function (v) { return v.nama + ':' + v.harga; }).join('|')]; }));
    unduh('produk.csv', '﻿' + rows.map(function (r) { return r.map(csvSel).join(','); }).join('\n'), 'text/csv');
  }
  function imporProdukCSV(teks) {
    var rows = parseCSV(teks.replace(/^﻿/, ''));
    if (rows.length && /nama/i.test(rows[0][0])) rows.shift();
    var n = 0;
    rows.forEach(function (r) {
      var nama = (r[0] || '').trim(); if (!nama) return;
      var kat = (r[1] || 'Umum').trim();
      if (D.kategori.indexOf(kat) < 0) D.kategori.push(kat);
      var varian = (r[3] || 'Reguler:0').split('|').map(function (s) { var a = s.split(':'); return { nama: (a[0] || 'Reguler').trim(), harga: Math.max(0, parseInt(a[1], 10) || 0) }; });
      var ada = D.produk.find(function (p) { return p.nama.toLowerCase() === nama.toLowerCase(); });
      var data = { nama: nama, kategori: kat, stok: Math.max(0, parseInt(r[2], 10) || 0), varian: varian };
      if (ada) Object.assign(ada, data); else D.produk.push(Object.assign({ id: uid() }, data));
      n++;
    });
    simpan(); return n;
  }
  function bacaFile(input, cb) {
    var file = input.files[0]; if (!file) return;
    var r = new FileReader(); r.onload = function () { cb(String(r.result)); input.value = ''; }; r.readAsText(file);
  }

  // ---------- Event ----------
  function ikatEvent() {
    var pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'hapus'];
    $('#padPin').innerHTML = pad.map(function (k) { return k ? '<button data-k="' + k + '" aria-label="' + (k === 'hapus' ? 'Hapus' : k) + '">' + (k === 'hapus' ? '⌫' : k) + '</button>' : '<span></span>'; }).join('');
    $('#padPin').onclick = function (e) { var b = e.target.closest('[data-k]'); if (b) ketikPin(b.dataset.k); };
    document.addEventListener('keydown', function (e) { if (!$('#layarMasuk').hidden) { if (/^\d$/.test(e.key)) ketikPin(e.key); if (e.key === 'Backspace') ketikPin('hapus'); } });

    $('#navBawah').innerHTML = $$('.samping .nav').map(function (b) { return b.outerHTML; }).join('');
    document.addEventListener('click', function (e) { var n = e.target.closest('.nav'); if (n) buka(n.dataset.hal); });
    $('#btnKeluar').onclick = function () { pengguna = null; keranjang = []; try { sessionStorage.removeItem('kasir-sesi'); } catch (er) {} tampilMasuk(); };

    $('#cariProduk').oninput = renderPOS;
    $('#chipKategori').onclick = function (e) { var c = e.target.closest('.chip'); if (c) { katAktif = c.dataset.k; renderPOS(); } };
    $('#gridProduk').onclick = function (e) { var k = e.target.closest('.kartu-produk'); if (k) pilihVarian(D.produk.find(function (p) { return p.id === k.dataset.id; })); };
    $('#kerDaftar').onclick = function (e) {
      var b = e.target.closest('[data-n]'); if (!b) return;
      var it = keranjang[+b.dataset.n], d = +b.dataset.d;
      if (d > 0) { var p = D.produk.find(function (x) { return x.id === it.pid; }); if (p && p.stok - stokTerpakai(p.id) <= 0) return toast('Stok tidak cukup'); }
      it.qty += d; if (it.qty <= 0) keranjang.splice(+b.dataset.n, 1);
      renderPOS();
    };
    $('#inDiskon').oninput = renderKeranjang; $('#tipeDiskon').onchange = renderKeranjang;
    $('#btnKosongkan').onclick = function () { keranjang = []; renderPOS(); };
    $('#btnBayar').onclick = dialogBayar;
    $('#fabKeranjang').onclick = function () { $('#panelKeranjang').classList.toggle('buka'); };
    document.addEventListener('click', function (e) {
      var pk = $('#panelKeranjang');
      if (pk.classList.contains('buka') && !pk.contains(e.target) && !e.target.closest('#fabKeranjang') && !e.target.closest('dialog')) pk.classList.remove('buka');
    });

    $('#cariKelola').oninput = renderKelola;
    $('#btnTambahProduk').onclick = function () { formProduk(null); };
    $('#btnKategori').onclick = formKategori;
    $('#tabelProduk').onclick = function (e) {
      var ed = e.target.closest('[data-edit]'), st = e.target.closest('[data-stok]');
      if (ed) formProduk(D.produk.find(function (p) { return p.id === ed.dataset.edit; }));
      if (st) { var p = D.produk.find(function (x) { return x.id === st.dataset.stok; }); var n = parseInt(prompt('Tambah stok ' + p.nama + ' sebanyak:', '10'), 10); if (n) { p.stok = Math.max(0, p.stok + n); simpan(); renderKelola(); toast('Stok jadi ' + p.stok); } }
    };

    $('#filterTanggal').onchange = renderRiwayat;
    $('#btnEksporTrx').onclick = eksporTrx;
    $('#daftarTrx').onclick = function (e) {
      var c = e.target.closest('[data-cetak]'), h = e.target.closest('[data-hapus]');
      if (c) cetak(D.transaksi.find(function (x) { return x.id === c.dataset.cetak; }));
      if (h && confirm('Batalkan transaksi ini? Stok akan dikembalikan.')) {
        var x = D.transaksi.find(function (t) { return t.id === h.dataset.hapus; });
        x.items.forEach(function (i) { var p = D.produk.find(function (q) { return q.id === i.pid; }); if (p) p.stok += i.qty; });
        D.transaksi = D.transaksi.filter(function (t) { return t !== x; }); simpan(); renderRiwayat(); toast('Transaksi dibatalkan');
      }
    };

    $('#segLaporan').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; modeLap = b.dataset.mode; $$('#segLaporan button').forEach(function (x) { x.classList.toggle('aktif', x === b); }); renderLaporan(); };
    $('#tglLaporan').onchange = renderLaporan;

    $('#formToko').onsubmit = function (e) {
      e.preventDefault(); var f = e.target;
      ['nama', 'alamat', 'telp', 'footer', 'rekening'].forEach(function (k) { D.toko[k] = f.elements[k].value.trim(); });
      simpan(); $('#namaTokoNav').textContent = D.toko.nama; toast('Profil toko disimpan');
    };
    $('#formKasir').onsubmit = function (e) {
      e.preventDefault(); var f = e.target;
      D.kasir.push({ id: uid(), nama: f.elements.nama.value.trim(), pin: f.elements.pin.value, peran: f.elements.peran.value });
      simpan(); f.reset(); renderAtur(); toast('Kasir ditambahkan');
    };
    $('#daftarKasirAtur').onclick = function (e) { var b = e.target.closest('[data-hk]'); if (b && confirm('Hapus kasir ini?')) { D.kasir = D.kasir.filter(function (k) { return k.id !== b.dataset.hk; }); simpan(); renderAtur(); } };
    $('#btnBackup').onclick = function () { unduh('backup-kasir-' + tglKey(new Date()) + '.json', JSON.stringify(D, null, 1), 'application/json'); };
    $('#fileBackup').onchange = function () {
      bacaFile(this, function (t) {
        try { var x = JSON.parse(t); if (!x.produk || !x.kasir) throw 0; if (confirm('Timpa semua data dengan backup ini?')) { D = x; simpan(); toast('Backup dipulihkan'); tampilMasuk(); } }
        catch (er) { toast('File backup tidak valid'); }
      });
    };
    $('#btnEksporProduk').onclick = eksporProdukCSV;
    $('#fileCsv').onchange = function () { bacaFile(this, function (t) { toast(imporProdukCSV(t) + ' produk diimpor'); }); };
    $('#btnContoh').onclick = function () { if (confirm('Ganti data dengan data contoh?')) { D = dataContoh(); simpan(); tampilMasuk(); } };
    $('#btnReset').onclick = function () { if (confirm('Yakin hapus SEMUA data? Backup dulu ya.')) { D = dataKosong(); simpan(); toast('Data dikosongkan. PIN admin: 1234'); tampilMasuk(); } };
  }

  // ---------- Mulai ----------
  muat(); ikatEvent();
  var sesi = null; try { sesi = sessionStorage.getItem('kasir-sesi'); } catch (e) {}
  var k = sesi && D.kasir.find(function (x) { return x.id === sesi; });
  if (k) masuk(k); else if (/[?&]demo\b/.test(location.search)) { masuk(D.kasir[0]); [0, 0, 3, 8].forEach(function (i, n) { var p = D.produk[i]; if (p) tambahKeKeranjang(p, p.varian[n % p.varian.length]); }); } else tampilMasuk();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () {});

  // untuk pengujian
  window.__kasir = { hitung: hitung, ringkasan: ringkasan, parseCSV: parseCSV, imporProdukCSV: imporProdukCSV, data: function () { return D; }, keranjang: function () { return keranjang; }, tambah: tambahKeKeranjang, selesaikan: selesaikan };
})();
