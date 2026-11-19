// =====================================
// E-UKS SMK MESIR (ULTIMATE PRO v3.0)
// Noval Fayyaz Farrasdhika — X RPL Mesir
// =====================================

let pasien = JSON.parse(localStorage.getItem("pasien")) || [];
let editIndex = -1;
let islandTimeout;
let soundEnabled = true;

// =========================
// AUDIO HAPTIC FEEDBACK (BEEP)
// =========================
function playBeep(type = 'success') {
    if (!soundEnabled) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        if (type === 'success') {
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        } else {
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
        }

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
        // Fallback jika browser block audio context sebelum interaksi
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById("soundToggleBtn");
    btn.innerHTML = soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
    if (soundEnabled) playBeep('success');
    showIsland("🔊", soundEnabled ? "Efek suara diaktifkan" : "Efek suara dimatikan");
}

// =========================
// DYNAMIC ISLAND & CLOCK
// =========================
function showIsland(icon, text) {
    const island = document.getElementById("dynamicIsland");
    const islandIcon = document.getElementById("islandIcon");
    const islandText = document.getElementById("islandText");

    clearTimeout(islandTimeout);

    islandIcon.textContent = icon;
    islandText.textContent = text;
    island.classList.add("expand");

    islandTimeout = setTimeout(() => {
        island.classList.remove("expand");
        updateClock();
    }, 3000);
}

function updateClock() {
    const island = document.getElementById("dynamicIsland");
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit" 
    });
    
    const clockMini = document.getElementById("clockMini");
    if (clockMini) clockMini.textContent = timeStr;

    if (!island.classList.contains("expand")) {
        document.getElementById("islandIcon").textContent = "🕒";
        document.getElementById("islandText").textContent = `${timeStr} WIB • Sistem Aktif`;
    }
}

setInterval(updateClock, 1000);

// =========================
// TOAST NOTIFICATION
// =========================
const toast = document.getElementById("toast");

function tampilkanToast(pesan) {
    toast.textContent = pesan;
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
    }, 2600);
}

// =========================
// COUNTER & QUICK PRESETS
// =========================
const keterangan = document.getElementById("keterangan");
const counter = document.getElementById("counter");

keterangan.addEventListener("input", () => {
    const len = keterangan.value.length;
    counter.textContent = `${len} Karakter`;
    counter.style.color = len < 10 ? "#ef4444" : "#10b981";
});

function applyPreset(keluhanVal, prioritasVal, ketVal) {
    document.getElementById("keluhan").value = keluhanVal;
    document.getElementById("prioritas").value = prioritasVal;
    document.getElementById("keterangan").value = ketVal;
    
    const len = ketVal.length;
    counter.textContent = `${len} Karakter`;
    counter.style.color = "#10b981";

    playBeep('success');
    showIsland("⚡", "Template cepat dimuat");
    tampilkanToast("⚡ Template medis diterapkan");
}

// =========================
// LOCAL STORAGE & SUBMIT
// =========================
function simpanData() {
    localStorage.setItem("pasien", JSON.stringify(pasien));
}

const formPasien = document.getElementById("formPasien");
formPasien.addEventListener("submit", function(e) {
    e.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const kelas = document.getElementById("kelas").value.trim().toUpperCase();
    const keluhan = document.getElementById("keluhan").value;
    const prioritas = document.getElementById("prioritas").value;
    const ket = document.getElementById("keterangan").value.trim();

    if (!nama || !kelas || !ket) {
        playBeep('error');
        tampilkanToast("⚠️ Semua field wajib diisi!");
        return;
    }

    if (ket.length < 10) {
        playBeep('error');
        tampilkanToast("⚠️ Catatan medis minimal 10 karakter!");
        return;
    }

    const now = new Date();
    const waktuFormat = now.toLocaleDateString("id-ID", { 
        day: "2-digit", 
        month: "short" 
    }) + " • " + now.toLocaleTimeString("id-ID", { 
        hour: "2-digit", 
        minute: "2-digit" 
    });

    const data = {
        nama,
        kelas,
        keluhan,
        prioritas,
        keterangan: ket,
        tanggal: waktuFormat,
        status: "Menunggu Perawatan"
    };

    if (editIndex !== -1) {
        data.status = pasien[editIndex].status;
        data.tanggal = pasien[editIndex].tanggal;
        pasien[editIndex] = data;

        playBeep('success');
        showIsland("✏️", `Data ${nama} diperbarui`);
        tampilkanToast("✅ Rekam medis diperbarui");
        resetFormState();
    } else {
        pasien.unshift(data);
        playBeep('success');
        showIsland("✅", `${nama} (${kelas}) terdaftar`);
        tampilkanToast("✅ Rekam medis baru disimpan");
        resetFormState();
    }

    simpanData();
    tampilkanData();
});

function resetFormState() {
    formPasien.reset();
    editIndex = -1;
    counter.textContent = "0 Karakter";
    counter.style.color = "inherit";
    document.getElementById("formTitle").textContent = "📝 Rekam Medis Baru";
    document.getElementById("submitBtn").innerHTML = "💾 Simpan Rekam Medis";
    document.getElementById("cancelEditBtn").style.display = "none";
}

function batalEdit() {
    resetFormState();
    showIsland("✖", "Mode edit dibatalkan");
}

// =========================
// ANALYTICS & CHARTS
// =========================
function updateAnalytics() {
    const container = document.getElementById("analyticsBars");
    container.innerHTML = "";

    const total = pasien.length;
    document.getElementById("analyticsTotal").textContent = `${total} Kasus Total`;

    if (total === 0) {
        container.innerHTML = `<p style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 10px;">Belum ada data untuk dianalisis.</p>`;
        return;
    }

    const counts = {};
    pasien.forEach(p => {
        counts[p.keluhan] = (counts[p.keluhan] || 0) + 1;
    });

    Object.keys(counts).forEach(keluhan => {
        const count = counts[keluhan];
        const percent = Math.round((count / total) * 100);

        container.innerHTML += `
            <div class="stat-bar-item">
                <div class="bar-meta">
                    <span>${keluhan}</span>
                    <span style="color: var(--primary);">${count} siswa (${percent}%)</span>
                </div>
                <div class="bar-bg">
                    <div class="bar-fill" style="width: ${percent}%;"></div>
                </div>
            </div>
        `;
    });
}

// =========================
// RENDER TABEL
// =========================
const tabelData = document.getElementById("tabelData");
const emptyState = document.getElementById("emptyState");
const filterKeluhan = document.getElementById("filterKeluhan");
const searchInput = document.getElementById("searchInput");

function tampilkanData() {
    tabelData.innerHTML = "";

    const filter = filterKeluhan.value;
    const keyword = searchInput.value.toLowerCase().trim();

    const hasil = pasien.filter(item => {
        const matchFilter = filter === "" || item.keluhan === filter;
        const matchSearch = item.nama.toLowerCase().includes(keyword) || 
                            (item.kelas && item.kelas.toLowerCase().includes(keyword));
        return matchFilter && matchSearch;
    });

    document.getElementById("showingCount").textContent = `${hasil.length} Data`;

    if (hasil.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }

    hasil.forEach(item => {
        const realIndex = pasien.indexOf(item);
        let statusClass = "";
        switch (item.status) {
            case "Menunggu Perawatan": statusClass = "status-menunggu"; break;
            case "Sedang Ditangani": statusClass = "status-proses"; break;
            case "Sudah Pulang": statusClass = "status-selesai"; break;
        }

        tabelData.innerHTML += `
            <tr>
                <td>
                    <span class="siswa-name">${item.nama}</span>
                    <span class="siswa-kelas">${item.kelas || "-"}</span>
                </td>
                <td>
                    <span class="keluhan-title">${item.keluhan}</span>
                    <span class="keluhan-note" title="${item.keterangan}">${item.keterangan}</span>
                </td>
                <td>
                    <span class="pill ${item.prioritas.toLowerCase()}">${item.prioritas}</span>
                </td>
                <td style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">
                    ${item.tanggal}
                </td>
                <td>
                    <span class="pill ${statusClass}">${item.status}</span>
                </td>
                <td>
                    <div class="action-group">
                        <button class="btn btn-icon btn-print" onclick="cetakSurat(${realIndex})" title="Cetak Surat Izin UKS">🖨️</button>
                        <button class="btn btn-icon btn-edit" onclick="editPasien(${realIndex})" title="Edit Data">✏️</button>
                        <button class="btn btn-icon btn-status" onclick="ubahStatus(${realIndex})" title="Ubah Status">🔄</button>
                        <button class="btn btn-icon btn-delete" onclick="hapusPasien(${realIndex})" title="Hapus">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });

    updateDashboard();
    updateAnalytics();
}

// =========================
// FITUR CETAK SURAT IZIN / RUJUKAN
// =========================
function cetakSurat(index) {
    const p = pasien[index];
    playBeep('success');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Surat Keterangan UKS - ${p.nama}</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #111; }
                .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; }
                .header h2 { margin: 0; color: #059669; }
                .header p { margin: 4px 0; font-size: 13px; color: #555; }
                .content { margin-top: 20px; font-size: 14px; line-height: 1.6; }
                .row { display: flex; margin-bottom: 8px; }
                .label { width: 150px; font-weight: bold; }
                .footer { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
                .sign { margin-top: 60px; border-top: 1px solid #333; width: 200px; padding-top: 4px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>UNIT KESEHATAN SEKOLAH (UKS) SMK MESIR</h2>
                <p>Sistem Informasi Kesehatan Terpadu • Laporan Digital 2026</p>
            </div>
            <h3 style="text-align: center; text-decoration: underline; margin-bottom: 20px;">SURAT KETERANGAN PEMERIKSAAN UKS</h3>
            <div class="content">
                <div class="row"><span class="label">Nama Siswa</span>: ${p.nama}</div>
                <div class="row"><span class="label">Kelas / Jurusan</span>: ${p.kelas}</div>
                <div class="row"><span class="label">Waktu Kunjungan</span>: ${p.tanggal}</div>
                <div class="row"><span class="label">Keluhan Utama</span>: ${p.keluhan}</div>
                <div class="row"><span class="label">Tingkat Kondisi</span>: ${p.prioritas}</div>
                <div class="row"><span class="label">Catatan & Tindakan</span>: ${p.keterangan}</div>
                <div class="row"><span class="label">Status Akhir</span>: <b>${p.status}</b></div>
            </div>
            <p style="margin-top: 30px; font-size: 13px;">Surat keterangan ini diterbitkan secara resmi melalui sistem E-UKS SMK Mesir untuk dipergunakan sebagaimana mestinya.</p>
            <div class="footer">
                <div></div>
                <div>
                    <p>Petugas UKS SMK Mesir,</p>
                    <div class="sign"><b>Noval Fayyaz Farrasdhika</b></div>
                </div>
            </div>
            <script>window.print();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// =========================
// EDIT, HAPUS, STATUS
// =========================
function editPasien(index) {
    const p = pasien[index];
    document.getElementById("nama").value = p.nama;
    document.getElementById("kelas").value = p.kelas || "";
    document.getElementById("keluhan").value = p.keluhan;
    document.getElementById("prioritas").value = p.prioritas;
    document.getElementById("keterangan").value = p.keterangan;

    const len = p.keterangan.length;
    counter.textContent = `${len} Karakter`;
    counter.style.color = len < 10 ? "#ef4444" : "#10b981";

    editIndex = index;
    document.getElementById("formTitle").textContent = "✏️ Edit Rekam Medis";
    document.getElementById("submitBtn").innerHTML = "🔄 Update Rekam Medis";
    document.getElementById("cancelEditBtn").style.display = "inline-flex";

    document.querySelector(".form-card").scrollIntoView({ behavior: "smooth" });
    playBeep('success');
    showIsland("✏️", `Edit data ${p.nama}`);
}

function hapusPasien(index) {
    const nama = pasien[index].nama;
    if (!confirm(`Hapus rekam medis atas nama ${nama}?`)) return;

    pasien.splice(index, 1);
    simpanData();
    tampilkanData();
    playBeep('error');
    showIsland("🗑️", `Data ${nama} dihapus`);
    tampilkanToast("🗑️ Rekam medis dihapus");
}

function ubahStatus(index) {
    const urutan = ["Menunggu Perawatan", "Sedang Ditangani", "Sudah Pulang"];
    const curr = urutan.indexOf(pasien[index].status);
    pasien[index].status = urutan[(curr + 1) % urutan.length];

    simpanData();
    tampilkanData();
    playBeep('success');
    showIsland("🔄", `Status: ${pasien[index].status}`);
}

function hapusPasienPulang() {
    const count = pasien.filter(i => i.status === "Sudah Pulang").length;
    if (count === 0) {
        tampilkanToast("ℹ️ Tidak ada data status 'Sudah Pulang'");
        return;
    }

    if (!confirm(`Hapus ${count} data pasien yang sudah pulang?`)) return;

    pasien = pasien.filter(item => item.status !== "Sudah Pulang");
    simpanData();
    tampilkanData();
    playBeep('success');
    showIsland("🧹", `${count} data selesai dibersihkan`);
    tampilkanToast("✅ Data dibersihkan");
}

function updateDashboard() {
    document.getElementById("totalPasien").textContent = pasien.length;
    document.getElementById("menunggu").textContent = pasien.filter(i => i.status === "Menunggu Perawatan").length;
    document.getElementById("ditangani").textContent = pasien.filter(i => i.status === "Sedang Ditangani").length;
    document.getElementById("pulang").textContent = pasien.filter(i => i.status === "Sudah Pulang").length;
}

// =========================
// EXPORT CSV
// =========================
function exportCSV() {
    if (pasien.length === 0) {
        tampilkanToast("⚠️ Belum ada data untuk di-export!");
        return;
    }

    let csv = "Nama Siswa,Kelas,Keluhan,Tingkat Kondisi,Catatan Medis,Waktu Masuk,Status\n";
    pasien.forEach(p => {
        csv += `"${p.nama}","${p.kelas}","${p.keluhan}","${p.prioritas}","${p.keterangan.replace(/"/g, '""')}","${p.tanggal}","${p.status}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Rekam_Medis_UKS_SMK_Mesir_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    playBeep('success');
    showIsland("📥", "Export CSV berhasil");
    tampilkanToast("✅ Laporan berhasil di-download!");
}

// =========================
// EVENT LISTENERS & DARK MODE
// =========================
filterKeluhan.addEventListener("change", tampilkanData);
searchInput.addEventListener("input", tampilkanData);

const darkButton = document.getElementById("darkModeBtn");
function updateDarkButton() {
    darkButton.innerHTML = document.body.classList.contains("dark-mode") ? "☀️ Light" : "🌙 Dark";
}

if (localStorage.getItem("darkMode") === "aktif") {
    document.body.classList.add("dark-mode");
}
updateDarkButton();

darkButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark ? "aktif" : "mati");
    playBeep('success');
    showIsland(isDark ? "🌙" : "☀️", isDark ? "Dark Mode Aktif" : "Light Mode Aktif");
    updateDarkButton();
});

// =========================
// INIT
// =========================
tampilkanData();
showIsland("🏥", "E-UKS SMK Mesir v3.0 Siap");