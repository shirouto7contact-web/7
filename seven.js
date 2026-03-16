// js/main.js

const gallery = document.getElementById("gallery");
const tagsContainer = document.getElementById('tags');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const pageInfo = document.getElementById('pageInfo');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('infoModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

let currentPage = 1;
const itemsPerPage = 20;
let currentData = numbers; // data.jsの変数をそのまま使用

// 1. タグリスト作成
const allTags = [...new Set(numbers.flatMap(item => item.tags || []))].filter(tag => tag && tag.trim() !== "");

// 2. 描画エンジン
function displayData(page, data = currentData) {
    currentData = data;
    const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = data.slice(start, end);

    gallery.innerHTML = ""; 

    paginatedItems.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'number-card';
    
        // 1. 各種パーツのHTMLを作成
        const linkHtml = item.url 
            ? `<a href="${item.url}" target="_blank" class="detail-link" onclick="event.stopPropagation();">動画のリンクはこちら</a>` 
            : "";
        
        const tagsHtml = (item.tags || []).map(t => 
            `<span class="card-tag" data-tag="${t}">${t}</span>`).join('');

        // 2. シェア用URLの作成
        const shareUrl = `${window.location.origin}${window.location.pathname}?code=${item.code}`;
        
        // 3. シェアボタンのHTML（これが出ない場合はここをチェック！）
        const shareBtnHtml = `
            <button type="button" class="share-link-btn" 
                    onclick="event.stopPropagation(); copyToClipboard('${shareUrl}')"
                    style="margin-top:10px; width:100%; border-radius:5px; padding:8px; cursor:pointer; background:#f0f0f0; border:1px solid #ccc; font-size:12px;">
                🔗 このカードのリンクをコピー
            </button>`;

        // 4. カードの中身を組み立て
            card.innerHTML = `
                <h3>${item.name}:${item.code}</h3>
                <img src="${item.img}" alt="${item.code}">
                
                <div class="description-container">
                    <p class="description">${item.comment}</p>
                </div>

                <div class="card-tags-wrapper">${tagsHtml}</div>
                ${linkHtml}
                ${shareBtnHtml}
            `;

        // タグクリックイベント
        card.querySelectorAll('.card-tag').forEach(tagSpan => {
            tagSpan.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const tag = e.target.getAttribute('data-tag');
                filterByTagFromCard(tag);
            });
        });

        // カード本体をクリックした時にモーダルを開く
        card.onclick = () => openModal(item);

        gallery.appendChild(card);
    });

    pageInfo.innerText = `${page} / ${totalPages}`;
    prevBtn.disabled = (page === 1);
    nextBtn.disabled = (page === totalPages);
}

// 3. モーダル制御（モーダル内にもリンクを追加）
function openModal(item) {
    const tagsHtml = (item.tags || []).map(t => `<span class="card-tag">${t}</span>`).join('');
    const modalLinkHtml = item.url 
        ? `<a href="${item.url}" target="_blank" class="detail-link" style="display:block; text-align:center; margin-top:20px;">このコードの外部動画ページへ</a>`
        : "";

    modalBody.innerHTML = `
        <img src="${item.img}" style="width:100%; max-height:300px; object-fit:contain; border-radius:10px;">
        <h2 style="margin-top:20px;">${item.name} (Code: ${item.code})</h2>
        <div class="card-tags-wrapper" style="margin:15px 0;">${tagsHtml}</div>
        <hr>
        <p style="font-size:1.1rem; line-height:1.8; white-space:pre-wrap;">${item.comment}</p>
        ${modalLinkHtml}
    `;
    modal.style.display = 'flex';
}

// 4. タグフィルタリング
function filterByTag(selectedTag) {
    const filtered = numbers.filter(item => (item.tags || []).includes(selectedTag));
    currentPage = 1;
    displayData(1, filtered);
}

function filterByTagFromCard(tag) {
    const btns = tagsContainer.querySelectorAll('.tag-btn');
    btns.forEach(b => {
        b.classList.remove('active');
        if (b.textContent === tag) b.classList.add('active');
    });
    filterByTag(tag);
}

// 5. ボタン生成
function renderTagButtons() {
    tagsContainer.innerHTML = '';
    const clearActiveTags = () => tagsContainer.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));

    const allBtn = document.createElement('button');
    allBtn.textContent = "全て";
    allBtn.classList.add('tag-btn', 'active');
    allBtn.onclick = (e) => {
        clearActiveTags();
        e.target.classList.add('active');
        currentPage = 1;
        displayData(1, numbers);
    };
    tagsContainer.appendChild(allBtn);

    allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.textContent = tag;
        btn.classList.add('tag-btn');
        btn.onclick = (e) => {
            clearActiveTags();
            e.target.classList.add('active');
            filterByTag(tag);
        };
        tagsContainer.appendChild(btn);
    });
}

// 6. 検索・ページ送り
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = numbers.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.code.toLowerCase().includes(query) || 
        (item.comment && item.comment.toLowerCase().includes(query))
    );
    currentPage = 1;
    displayData(1, filtered);
});

nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    if (currentPage < totalPages) displayData(++currentPage);
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) displayData(--currentPage);
});

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

// タグエリアの開閉ロジック
const tagToggleBtn = document.getElementById('tagToggleBtn');
const tagsArea = document.getElementById('tags');

if(tagToggleBtn) {
    tagToggleBtn.addEventListener('click', () => {
        const isCollapsed = tagsArea.classList.contains('collapsed');
        if (isCollapsed) {
            tagsArea.classList.remove('collapsed');
            tagsArea.classList.add('expanded');
            tagToggleBtn.textContent = '閉じる ▲';
        } else {
            tagsArea.classList.remove('expanded');
            tagsArea.classList.add('collapsed');
            tagToggleBtn.textContent = 'もっと見る ▼';
        }
    });
}

function checkTagHeight() {
    if (tagsArea && tagToggleBtn) {
        if (tagsArea.scrollHeight <= 90) {
            tagToggleBtn.style.display = 'none';
        } else {
            tagToggleBtn.style.display = 'block';
        }
    }
}

function directSearch() {
    const inputField = document.getElementById('directCodeInput');
    const message = document.getElementById('searchMessage');
    const gallery = document.getElementById('gallery');
    // HTMLのクラス名に合わせて修正
    const pagination = document.querySelector('.pagination-controls'); 
    
    if (!inputField) return;

    const input = inputField.value.trim();
    if (input === "") return;

    // 1. numbers配列からコードが一致するものを探す
    // 数字として比較する場合も考慮して String() で包んでいます
    const result = numbers.find(item => String(item.code) === input);

    if (result) {
        message.innerText = "";
        
        // 2. ページネーションを隠す
        if (pagination) pagination.style.display = 'none';

        // 3. displayData関数を使って1枚だけ描画
        // 現在のJSにある「displayData(page, data)」の形に合わせて呼び出し
        displayData(1, [result]); 

        // 4. 「戻る」ボタンの制御
        let backBtnContainer = document.getElementById('backToTotalBtn');
        if (backBtnContainer) backBtnContainer.remove(); // 二重表示防止

        backBtnContainer = document.createElement('div');
        backBtnContainer.id = 'backToTotalBtn';
        backBtnContainer.style.textAlign = "center";
        backBtnContainer.style.padding = "20px";
        
        const backBtn = document.createElement('button');
        backBtn.innerText = "← 全データ一覧に戻る";
        backBtn.className = "tag-btn active"; 
        backBtn.style.cursor = "pointer";
        
        backBtn.onclick = () => {
            if (pagination) pagination.style.display = 'flex';
            displayData(1, numbers); // 全データに戻す
            backBtnContainer.remove();
            inputField.value = "";
        };
        
        backBtnContainer.appendChild(backBtn);
        gallery.after(backBtnContainer); 

    } else {
        message.innerText = "そのコード「" + input + "」は見つかりませんでした";
        // 見つからない場合は一覧をそのままにしておくか、クリアするか選べますが、
        // 今はメッセージを出すだけにしています。
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("このカードのリンクをコピーしました！");
    }).catch(err => {
        console.error('コピーに失敗しました', err);
    });
}

// ページが読み込まれた時に実行
window.onload = () => {
    renderTagButtons();
    checkTagHeight();

    // URLの「?code=xxxx」をチェックする
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCode = urlParams.get('code');

    if (sharedCode) {
        // もしURLにコードが含まれていたら、その1枚だけを表示する
        const result = numbers.find(item => String(item.code) === sharedCode);
        if (result) {
            // ページネーションを隠す
            const pagination = document.querySelector('.pagination-controls');
            if (pagination) pagination.style.display = 'none';

            // 1枚だけ表示
            displayData(1, [result]);

            // 「一覧に戻る」ボタンを設置
            const backBtnContainer = document.createElement('div');
            backBtnContainer.style.textAlign = "center";
            backBtnContainer.style.padding = "20px";
            const backBtn = document.createElement('button');
            backBtn.innerText = "← 他のデータも見る（一覧へ）";
            backBtn.className = "tag-btn active";
            backBtn.onclick = () => {
                window.location.href = window.location.pathname; // パラメータを消してリロード
            };
            backBtnContainer.appendChild(backBtn);
            gallery.after(backBtnContainer);
        } else {
            // コードが間違っている場合は通常表示
            displayData(1);
        }
    } else {
        // コードがない場合は通常通り1ページ目を表示
        displayData(1);
    }
};


function unlockSite() {
    // 1. 年齢確認を消す
    const ageGate = document.getElementById('age-gate');
    if (ageGate) {
        ageGate.style.display = 'none';
    }

    // 2. JuicyAdsに「人間がクリックしたぞ！」と強く認識させる
    // 実際にページ上の見えない要素をクリックさせる力技です
    document.body.click(); 

    // 3. もしJuicyAdsのコードが正しく貼られていれば、
    // この「body.click()」に反応して全画面広告が発動します。
    console.log("Age check cleared & physical click triggered.");
}
    