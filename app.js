// ===== データ管理 =====
const STORAGE_KEY = 'oizumi_contracts';

function loadContracts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveContracts(contracts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
}

// ===== 画面切り替え =====
const btnNew = document.getElementById('btn-new');
const btnList = document.getElementById('btn-list');
const formSection = document.getElementById('form-section');
const listSection = document.getElementById('list-section');

btnNew.addEventListener('click', () => {
    formSection.style.display = '';
    listSection.style.display = 'none';
    btnNew.classList.add('active');
    btnList.classList.remove('active');
});

btnList.addEventListener('click', () => {
    formSection.style.display = 'none';
    listSection.style.display = '';
    btnList.classList.add('active');
    btnNew.classList.remove('active');
    renderTable();
});

// ===== フォーム連動 =====

// 区分「その他」の表示切替
document.getElementById('category').addEventListener('change', (e) => {
    document.getElementById('category-other-group').style.display =
        e.target.value === 'その他' ? '' : 'none';
});

// 支払方法の表示切替
document.getElementById('shiharaiMethod').addEventListener('change', (e) => {
    document.getElementById('furikomi-detail').style.display = e.target.value === '振込' ? '' : 'none';
    document.getElementById('jidou-detail').style.display = e.target.value === '自動引落' ? '' : 'none';
    document.getElementById('shuukin-detail').style.display = e.target.value === '集金' ? '' : 'none';
});

// 〆日 末/日付指定 切替
document.getElementById('shimebiType').addEventListener('change', (e) => {
    document.getElementById('shimebi-date-group').style.display =
        e.target.value === '日付指定' ? '' : 'none';
});

// 支払日 末/日付指定 切替
document.getElementById('shiharaiBiType').addEventListener('change', (e) => {
    document.getElementById('shiharaibi-date-group').style.display =
        e.target.value === '日付指定' ? '' : 'none';
});

// 年末加算の表示切替
document.getElementById('nenmatsuKasan').addEventListener('change', (e) => {
    const show = e.target.value === 'あり';
    document.getElementById('nenmatsu-amount-group').style.display = show ? '' : 'none';
    document.getElementById('nenshi-amount-group').style.display = show ? '' : 'none';
});

// 請求先「同上」チェックボックス
document.getElementById('seikyuDojou').addEventListener('change', (e) => {
    const fields = document.getElementById('seikyu-fields');
    if (e.target.checked) {
        // 現場情報をコピー（TEL以外）
        document.getElementById('seikyuName').value = document.getElementById('genbaName').value;
        document.getElementById('seikyuAddress').value = document.getElementById('genbaAddress').value;
        document.getElementById('seikyuBldg').value = document.getElementById('genbaBldg').value;
        fields.classList.add('disabled-fields');
        // TEL以外を読み取り専用に
        ['seikyuName', 'seikyuAddress', 'seikyuBldg'].forEach(id => {
            document.getElementById(id).readOnly = true;
        });
    } else {
        fields.classList.remove('disabled-fields');
        ['seikyuName', 'seikyuAddress', 'seikyuBldg'].forEach(id => {
            document.getElementById(id).readOnly = false;
        });
    }
});

// ===== トースト通知 =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => { toast.className = 'toast'; }, 2500);
}

// ===== フォームデータの取得・設定 =====
let editingId = null;

const ALL_FIELDS = [
    'tokuisakiNo', 'genbaNo', 'keiyakuTanto', 'category', 'categoryOther',
    'genbaName', 'genbaAddress', 'genbaBldg', 'genbaTel',
    'seikyuName', 'seikyuAddress', 'seikyuBldg', 'seikyuTel',
    'aiteTanto', 'yakushoku', 'gyoushuNo',
    'keiyakuGaku', 'taxType',
    'shimebiType', 'shimebiDate', 'shiharaiTsuki', 'shiharaiBiType', 'shiharaiBiDate',
    'shiharaiMethod',
    'furikomiName', 'moushikomiYoushi', 'kaishiMade',
    'teikyubi', 'shuukinJikan',
    'shokaiShushuubi', 'shokaiNyuukinbi', 'shokaiNyuukinTsuki',
    'kurumaBan', 'muryouKikan',
    'nichiyouKaishu', 'nenshi', 'baketsu',
    'nenmatsuKasan', 'nenmatsuAmount', 'nenshiAmount',
    'eigyou', 'kanri', 'jimu', 'bikou'
];

function getFormData() {
    const data = {};

    ALL_FIELDS.forEach(f => {
        const el = document.getElementById(f);
        if (el) data[f] = el.value;
    });

    // 同上フラグ
    data.seikyuDojou = document.getElementById('seikyuDojou').checked;

    // チェックボックス（ゴミの種類）
    const gomiChecks = document.querySelectorAll('input[name="gomiType"]:checked');
    data.gomiType = Array.from(gomiChecks).map(c => c.value);
    data.gomiOther = document.getElementById('gomiOther').value;

    return data;
}

function setFormData(data) {
    ALL_FIELDS.forEach(f => {
        const el = document.getElementById(f);
        if (el && data[f] !== undefined) el.value = data[f];
    });

    // 同上チェック
    const dojouCb = document.getElementById('seikyuDojou');
    dojouCb.checked = !!data.seikyuDojou;
    dojouCb.dispatchEvent(new Event('change'));

    // チェックボックス
    document.querySelectorAll('input[name="gomiType"]').forEach(cb => {
        cb.checked = data.gomiType && data.gomiType.includes(cb.value);
    });
    if (data.gomiOther) document.getElementById('gomiOther').value = data.gomiOther;

    // 連動表示の更新
    document.getElementById('category').dispatchEvent(new Event('change'));
    document.getElementById('shiharaiMethod').dispatchEvent(new Event('change'));
    document.getElementById('shimebiType').dispatchEvent(new Event('change'));
    document.getElementById('shiharaiBiType').dispatchEvent(new Event('change'));
    document.getElementById('nenmatsuKasan').dispatchEvent(new Event('change'));
}

function clearForm() {
    document.getElementById('contract-form').reset();
    editingId = null;
    document.getElementById('btn-save').textContent = '保存';
    // 同上リセット
    document.getElementById('seikyuDojou').checked = false;
    const fields = document.getElementById('seikyu-fields');
    fields.classList.remove('disabled-fields');
    fields.querySelectorAll('input').forEach(el => el.readOnly = false);
    // 連動リセット
    document.getElementById('category-other-group').style.display = 'none';
    document.getElementById('furikomi-detail').style.display = '';
    document.getElementById('jidou-detail').style.display = 'none';
    document.getElementById('shuukin-detail').style.display = 'none';
    document.getElementById('shimebi-date-group').style.display = 'none';
    document.getElementById('shiharaibi-date-group').style.display = 'none';
    document.getElementById('nenmatsu-amount-group').style.display = 'none';
    document.getElementById('nenshi-amount-group').style.display = 'none';
}

// ===== 保存 =====
document.getElementById('contract-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const data = getFormData();
    const contracts = loadContracts();

    if (editingId !== null) {
        const idx = contracts.findIndex(c => c.id === editingId);
        if (idx !== -1) {
            data.id = editingId;
            data.createdAt = contracts[idx].createdAt;
            data.updatedAt = new Date().toISOString();
            contracts[idx] = data;
        }
        showToast('契約情報を更新しました');
    } else {
        data.id = Date.now().toString();
        data.createdAt = new Date().toISOString();
        data.updatedAt = data.createdAt;
        contracts.push(data);
        showToast('契約情報を保存しました');
    }

    saveContracts(contracts);
    clearForm();
});

// クリアボタン
document.getElementById('btn-clear').addEventListener('click', clearForm);

// ===== 一覧表示 =====
function renderTable(filter = '') {
    const contracts = loadContracts();
    const tbody = document.querySelector('#contract-table tbody');
    tbody.innerHTML = '';

    const filtered = contracts.filter(c => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        return (c.genbaName || '').toLowerCase().includes(q) ||
               (c.seikyuName || '').toLowerCase().includes(q) ||
               (c.tokuisakiNo || '').toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999;padding:32px;">データがありません</td></tr>';
        return;
    }

    filtered.forEach(c => {
        const tr = document.createElement('tr');
        const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('ja-JP') : '';
        const amount = c.keiyakuGaku ? Number(c.keiyakuGaku).toLocaleString() + '円' : '';

        tr.innerHTML = `
            <td>${escHtml(c.tokuisakiNo || '')}</td>
            <td>${escHtml(c.genbaNo || '')}</td>
            <td>${escHtml(c.genbaName || '')}</td>
            <td>${escHtml(c.seikyuName || '')}</td>
            <td>${amount}</td>
            <td>${escHtml(c.category || '')}</td>
            <td>${date}</td>
            <td>
                <button class="btn-edit" data-id="${c.id}">編集</button>
                <button class="btn-delete" data-id="${c.id}">削除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const contract = contracts.find(c => c.id === id);
            if (contract) {
                editingId = id;
                setFormData(contract);
                document.getElementById('btn-save').textContent = '更新';
                btnNew.click();
                window.scrollTo(0, 0);
                showToast('編集モードに切り替えました');
            }
        });
    });

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!confirm('この契約情報を削除しますか？')) return;
            const id = btn.dataset.id;
            const updated = contracts.filter(c => c.id !== id);
            saveContracts(updated);
            renderTable(document.getElementById('search-input').value);
            showToast('削除しました', 'error');
        });
    });
}

// 検索
document.getElementById('search-input').addEventListener('input', (e) => {
    renderTable(e.target.value);
});

// ===== Excel出力 =====
document.getElementById('btn-export').addEventListener('click', () => {
    const contracts = loadContracts();
    if (contracts.length === 0) {
        showToast('出力するデータがありません', 'error');
        return;
    }

    const headers = [
        '得意先No.', '現場No.', '契約担当名', '区分',
        '現場名', '現場住所', 'ﾋﾞﾙ・ﾏﾝｼｮﾝ名(現場)', 'TEL(現場)',
        '請求先名', '請求先住所', 'ﾋﾞﾙ・ﾏﾝｼｮﾝ名(請求先)', 'TEL(請求先)',
        '相手担当者', '役職等', '業種別番号',
        '契約額', '税区分',
        '〆日', '支払月', '支払日', '支払方法',
        '振込人名', '申込用紙', '開始するまで',
        '定休日', '集金可能時間帯',
        '初回収集日', '初回入金日', '初回入金月分',
        '車番', '無料ｻｰﾋﾞｽ期間',
        '日曜回収', '年始回収', 'バケツ',
        '年末加算', '12月加算額', '1月加算額',
        'ゴミの種類', 'ゴミその他',
        '営業', '管理', '事務', '備考', '登録日'
    ];

    const rows = contracts.map(c => {
        const shimebi = c.shimebiType === '末' ? '末日' : (c.shimebiDate ? c.shimebiDate + '日' : '');
        const shiharaibi = c.shiharaiBiType === '末' ? '末日' : (c.shiharaiBiDate ? c.shiharaiBiDate + '日' : '');
        return [
            c.tokuisakiNo, c.genbaNo, c.keiyakuTanto, c.category,
            c.genbaName, c.genbaAddress, c.genbaBldg, c.genbaTel,
            c.seikyuName, c.seikyuAddress, c.seikyuBldg, c.seikyuTel,
            c.aiteTanto, c.yakushoku, c.gyoushuNo,
            c.keiyakuGaku, c.taxType,
            shimebi, c.shiharaiTsuki, shiharaibi, c.shiharaiMethod,
            c.furikomiName, c.moushikomiYoushi, c.kaishiMade,
            c.teikyubi, c.shuukinJikan,
            c.shokaiShushuubi, c.shokaiNyuukinbi, c.shokaiNyuukinTsuki,
            c.kurumaBan, c.muryouKikan,
            c.nichiyouKaishu, c.nenshi, c.baketsu,
            c.nenmatsuKasan, c.nenmatsuAmount, c.nenshiAmount,
            (c.gomiType || []).join('、'), c.gomiOther,
            c.eigyou, c.kanri, c.jimu, c.bikou,
            c.createdAt ? new Date(c.createdAt).toLocaleDateString('ja-JP') : ''
        ];
    });

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = headers.map(() => ({ wch: 16 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '契約一覧');
    XLSX.writeFile(wb, `大泉衛生_契約一覧_${new Date().toISOString().slice(0,10)}.xlsx`);
    showToast('Excelファイルを出力しました');
});

// ===== PDF出力 =====

document.getElementById('btn-print-form').addEventListener('click', () => {
    if (editingId) {
        window.open('print.html?ids=' + editingId, '_blank');
    } else {
        const data = getFormData();
        if (!data.genbaName) {
            showToast('現場名を入力してください', 'error');
            return;
        }
        data.id = 'temp_print';
        data.createdAt = new Date().toISOString();
        const contracts = loadContracts();
        contracts.push(data);
        saveContracts(contracts);
        window.open('print.html?ids=temp_print', '_blank');
        setTimeout(() => {
            const updated = loadContracts().filter(c => c.id !== 'temp_print');
            saveContracts(updated);
        }, 2000);
    }
});

document.getElementById('btn-print-all').addEventListener('click', () => {
    const contracts = loadContracts();
    if (contracts.length === 0) {
        showToast('出力するデータがありません', 'error');
        return;
    }
    window.open('print.html', '_blank');
});

// ===== ユーティリティ =====
function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
