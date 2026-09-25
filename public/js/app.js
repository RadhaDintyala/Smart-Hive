document.addEventListener('DOMContentLoaded', () => {
    // Current Path & Session State
    const currentPath = window.location.pathname.toLowerCase();
    let currentAuthToken = localStorage.getItem('sh_token') || null;
    let currentUser = JSON.parse(localStorage.getItem('sh_user') || 'null');
    let imageBase64Data = null;
    let activeConsumerBatchId = "BATCH-2026-HIM-101";

    // ═══════════════ 1. UNIVERSAL HAMBURGER SIDEBAR LOGIC ═══════════════
    const btnHamburger = document.getElementById('btn-hamburger');
    const btnSidebarClose = document.getElementById('btn-sidebar-close');
    const sidebarDrawer = document.getElementById('sidebar-drawer');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebarDrawer && sidebarOverlay) {
        if (btnHamburger) {
            btnHamburger.addEventListener('click', () => {
                setupRoleSidebar();
                sidebarDrawer.classList.add('open');
                sidebarOverlay.classList.add('open');
            });
        }

        btnSidebarClose?.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    function closeSidebar() {
        sidebarDrawer?.classList.remove('open');
        sidebarOverlay?.classList.remove('open');
    }

    window.scrollToElement = function(id) {
        closeSidebar();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('highlight-pulse');
            setTimeout(() => el.classList.remove('highlight-pulse'), 1500);
        }
    };

    window.selectRoleTabFromSidebar = function(username) {
        closeSidebar();
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
            return;
        }
        const btn = document.querySelector(`.role-box-btn[data-user="${username}"]`);
        if (btn) btn.click();
    };

    function setupRoleSidebar() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (!sidebarNav) return;

        // Remove comments section from drawer if present
        const sidebarSection = document.querySelector('.sidebar-section');
        if (sidebarSection) {
            sidebarSection.remove();
        }

        const role = currentUser?.role || null;

        if (currentPath === '/login' || (!role && currentPath === '/')) {
            sidebarNav.innerHTML = `
                <div class="role-menu-header" style="font-size:1.25rem;margin-bottom:14px;">🔑 Role Workspaces Overview</div>
                
                <div class="role-menu-section">
                    <div class="role-menu-header">🐝 Beekeeper</div>
                    <ul class="role-task-list">
                        <li onclick="selectRoleTabFromSidebar('beekeeper1')">Enters IOT sensor details</li>
                        <li onclick="selectRoleTabFromSidebar('beekeeper1')">Enters Audio files</li>
                        <li onclick="selectRoleTabFromSidebar('beekeeper1')">Uploads images</li>
                        <li onclick="selectRoleTabFromSidebar('beekeeper1')">Enters harvest logs (Crop details & harvest start date)</li>
                        <li onclick="selectRoleTabFromSidebar('beekeeper1')">Registers honey Batches</li>
                        <li onclick="selectRoleTabFromSidebar('beekeeper1')">Generates the QR code</li>
                    </ul>
                </div>
                
                <hr class="sidebar-divider">
                
                <div class="role-menu-section">
                    <div class="role-menu-header">🧪 Laboratory</div>
                    <ul class="role-task-list">
                        <li onclick="selectRoleTabFromSidebar('lab1')">Tests & uploads the product results</li>
                        <li onclick="selectRoleTabFromSidebar('lab1')">Provide feedback to beekeeper on quality issues</li>
                        <li onclick="selectRoleTabFromSidebar('lab1')">Maintain test records</li>
                        <li onclick="selectRoleTabFromSidebar('lab1')">Scans the QR & check</li>
                    </ul>
                </div>
                
                <hr class="sidebar-divider">
                
                <div class="role-menu-section">
                    <div class="role-menu-header">🏪 Retailer</div>
                    <ul class="role-task-list">
                        <li onclick="selectRoleTabFromSidebar('retailer1')">Verifies batch records</li>
                        <li onclick="selectRoleTabFromSidebar('retailer1')">Maintains all logs (about the product batch & QR)</li>
                        <li onclick="selectRoleTabFromSidebar('retailer1')">Scans the QR & checks</li>
                    </ul>
                </div>
                
                <hr class="sidebar-divider">
                
                <div class="role-menu-section">
                    <div class="role-menu-header">👥 End consumer</div>
                    <ul class="role-task-list">
                        <li onclick="selectRoleTabFromSidebar('consumer1')">Scan the QR code & verifies it's purity</li>
                        <li onclick="selectRoleTabFromSidebar('consumer1')">Reads beekeeper profile</li>
                        <li onclick="selectRoleTabFromSidebar('consumer1')">Provide rating</li>
                        <li onclick="selectRoleTabFromSidebar('consumer1')">Reports (any) concerns</li>
                    </ul>
                </div>

                <hr class="sidebar-divider">
                <a href="/" class="sidebar-link">🏠 Home Landing</a>
            `;
        } else if (currentPath === '/beekeeper' || role === 'Beekeeper') {
            sidebarNav.innerHTML = `
                <div class="role-menu-header">🐝 Beekeeper Workspace</div>
                <ul class="role-task-list">
                    <li onclick="scrollToElement('bk-temp')">📡 Enters IOT sensor details</li>
                    <li onclick="scrollToElement('bk-audio-filename')">🎵 Enters Audio files</li>
                    <li onclick="scrollToElement('bk-image-file')">📷 Uploads images</li>
                    <li onclick="scrollToElement('bk-crop-name')">🌾 Enters harvest logs (Crop details & harvest start date)</li>
                    <li onclick="scrollToElement('form-beekeeper')">🍯 Registers honey Batches</li>
                    <li onclick="scrollToElement('bk-qr-box')">📱 Generates the QR code</li>
                </ul>
                <hr class="sidebar-divider">
                <a href="/" class="sidebar-link">🏠 Home Landing Page</a>
                <a href="/login" class="sidebar-link">🔑 Select / Switch Role</a>
            `;
        } else if (currentPath === '/tester' || role === 'Laboratory') {
            sidebarNav.innerHTML = `
                <div class="role-menu-header">🧪 Laboratory Workspace</div>
                <ul class="role-task-list">
                    <li onclick="scrollToElement('form-lab-test')">📊 Tests & uploads the product results</li>
                    <li onclick="scrollToElement('lab-feedback')">💬 Provide feedback to beekeeper on quality issues</li>
                    <li onclick="scrollToElement('lab-records-list')">📜 Maintain test records</li>
                    <li onclick="scrollToElement('lab-batch-cards-container')">📱 Scans the QR & check</li>
                </ul>
                <hr class="sidebar-divider">
                <a href="/" class="sidebar-link">🏠 Home Landing Page</a>
                <a href="/login" class="sidebar-link">🔑 Select / Switch Role</a>
            `;
        } else if (currentPath === '/retailer' || role === 'Retailer') {
            sidebarNav.innerHTML = `
                <div class="role-menu-header">🏪 Retailer Workspace</div>
                <ul class="role-task-list">
                    <li onclick="scrollToElement('form-retailer-verify')">✅ Verifies batch records</li>
                    <li onclick="scrollToElement('retailer-logs-list')">📋 Maintains all logs (about the product batch & QR)</li>
                    <li onclick="scrollToElement('retailer-batch-cards-container')">📱 Scans the QR & checks</li>
                </ul>
                <hr class="sidebar-divider">
                <a href="/" class="sidebar-link">🏠 Home Landing Page</a>
                <a href="/login" class="sidebar-link">🔑 Select / Switch Role</a>
            `;
        } else if (currentPath === '/consumer' || role === 'End Consumer') {
            sidebarNav.innerHTML = `
                <div class="role-menu-header">👥 End Consumer Workspace</div>
                <ul class="role-task-list">
                    <li onclick="scrollToElement('consumer-batch-cards-container')">🔍 Scan the QR code & verifies it's purity</li>
                    <li onclick="scrollToElement('c-profile-box')">👨‍🌾 Reads beekeeper profile</li>
                    <li onclick="scrollToElement('btn-goto-feedback')">⭐ Provide rating</li>
                    <li onclick="scrollToElement('btn-goto-contact')">⚠️ Reports (any) concerns</li>
                </ul>
                <hr class="sidebar-divider">
                <a href="/" class="sidebar-link">🏠 Home Landing Page</a>
                <a href="/login" class="sidebar-link">🔑 Select / Switch Role</a>
            `;
        }
    }

    // Call setupRoleSidebar initially
    setupRoleSidebar();

    // Sign Out Handler
    const btnSignout = document.getElementById('btn-signout');
    if (btnSignout) {
        btnSignout.addEventListener('click', () => {
            localStorage.removeItem('sh_token');
            localStorage.removeItem('sh_user');
            window.location.href = '/login';
        });
    }

    // ═══════════════ 2. ROUTE ACCESS PROTECTION ═══════════════
    if (currentPath === '/beekeeper') {
        if (!currentAuthToken || currentUser?.role !== 'Beekeeper') {
            alert('Access Restricted: Please sign in as a Beekeeper to access this workspace.');
            window.location.href = '/login';
            return;
        }
        setupBeekeeperPage();
    } else if (currentPath === '/tester') {
        if (!currentAuthToken || currentUser?.role !== 'Laboratory') {
            alert('Access Restricted: Please sign in as Accredited Laboratory to access this workspace.');
            window.location.href = '/login';
            return;
        }
        setupTesterPage();
    } else if (currentPath === '/retailer') {
        if (!currentAuthToken || currentUser?.role !== 'Retailer') {
            alert('Access Restricted: Please sign in as a Retailer to access this workspace.');
            window.location.href = '/login';
            return;
        }
        setupRetailerPage();
    } else if (currentPath === '/login') {
        setupLoginPage();
    } else if (currentPath === '/consumer') {
        setupConsumerPage();
    } else if (currentPath === '/feedback') {
        setupFeedbackPage();
    } else if (currentPath === '/contact') {
        setupContactPage();
    }

    // ═══════════════ LOGIN PAGE ═══════════════
    function setupLoginPage() {
        const roleBtns = document.querySelectorAll('.role-box-btn');
        const loginUsernameInput = document.getElementById('login-username');
        const loginPasswordInput = document.getElementById('login-password');
        const loginForm = document.getElementById('login-form');
        const loginErrorMsg = document.getElementById('login-error-msg');

        roleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                roleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const username = btn.getAttribute('data-user');
                if (loginUsernameInput) loginUsernameInput.value = username;
                if (loginPasswordInput) loginPasswordInput.value = 'pass123';
            });
        });

        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginErrorMsg) loginErrorMsg.style.display = 'none';

            const username = loginUsernameInput.value;
            const password = loginPasswordInput.value;

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        localStorage.setItem('sh_token', data.token);
                        localStorage.setItem('sh_user', JSON.stringify(data.profile));
                        window.location.href = data.redirectRoute;
                        return;
                    }
                }
            } catch (err) {
                console.warn('Backend login endpoint unavailable, using local fallback.');
            }

            const demoProfiles = {
                beekeeper1: { username: 'beekeeper1', role: 'Beekeeper', name: 'Rajesh Kumar (Master Beekeeper)', apiary: 'Himalayan Organic Apiary', license: 'GOV-HONEY-AP-8821' },
                lab1: { username: 'lab1', role: 'Laboratory', name: 'Central National Honey Lab', accreditation: 'NABL Accredited', license: 'GOV-LAB-TEST-9920' },
                retailer1: { username: 'retailer1', role: 'Retailer', name: 'Pure Natural Foods Outlets', storeLocation: 'Connaught Place, New Delhi', license: 'RETAIL-GOV-4410' },
                consumer1: { username: 'consumer1', role: 'End Consumer', name: 'Ananya Sen', email: 'ananya.consumer@example.com' }
            };
            const userProf = demoProfiles[username];
            if (userProf && (password === 'pass123' || password === '')) {
                const token = 'demo_token_' + Date.now();
                let route = '/consumer';
                if (userProf.role === 'Beekeeper') route = '/beekeeper';
                else if (userProf.role === 'Laboratory') route = '/tester';
                else if (userProf.role === 'Retailer') route = '/retailer';

                localStorage.setItem('sh_token', token);
                localStorage.setItem('sh_user', JSON.stringify(userProf));
                window.location.href = route;
            } else {
                if (loginErrorMsg) {
                    loginErrorMsg.textContent = 'Login Failed: Invalid credentials';
                    loginErrorMsg.style.display = 'block';
                } else {
                    alert('Login Failed: Invalid credentials');
                }
            }
        });
    }

    // ═══════════════ BEEKEEPER PAGE ═══════════════
    function setupBeekeeperPage() {
        const formBeekeeper = document.getElementById('form-beekeeper');
        const imageFileInput = document.getElementById('bk-image-file');
        const imagePreviewContainer = document.getElementById('image-preview-container');
        const imagePreviewImg = document.getElementById('bk-image-preview');

        const navUserInfo = document.getElementById('nav-user-info');
        if (navUserInfo && currentUser) {
            navUserInfo.textContent = `🐝 ${currentUser.name}`;
        }

        imageFileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    imageBase64Data = evt.target.result;
                    if (imagePreviewImg) imagePreviewImg.src = imageBase64Data;
                    if (imagePreviewContainer) imagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imageBase64Data = null;
                if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
            }
        });

        formBeekeeper?.addEventListener('submit', async (e) => {
            e.preventDefault();

            // MANDATORY IMAGE CHECK
            if (!imageBase64Data || imageBase64Data.trim() === '') {
                alert("❌ Image Evidence Upload is MANDATORY!\n\nThe form cannot be submitted from the Beekeeper side without uploading a comb/frame photo evidence.");
                return;
            }

            const payload = {
                token: currentAuthToken,
                batchIdCustom: document.getElementById('bk-batch-id').value,
                cropName: document.getElementById('bk-crop-name').value,
                floralSource: document.getElementById('bk-floral-source').value,
                harvestStartDate: document.getElementById('bk-harvest-start').value,
                yieldQuantityKg: document.getElementById('bk-yield-qty').value,
                hiveId: document.getElementById('bk-hive-id').value,
                temperature: document.getElementById('bk-temp').value,
                humidity: document.getElementById('bk-humid').value,
                weight: document.getElementById('bk-weight').value,
                vocPpm: document.getElementById('bk-voc').value,
                audioFilename: document.getElementById('bk-audio-filename').value,
                audioFreq: document.getElementById('bk-audio-freq').value,
                imageCaption: document.getElementById('bk-image-caption').value,
                imageBase64: imageBase64Data
            };

            try {
                const res = await fetch('/api/beekeeper/batch/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    renderBeekeeperQR(data.batch);
                    loadBeekeeperBatches();
                    alert(`✅ Batch ${data.batch.batchId} Successfully Registered! National QR Code generated.`);
                } else {
                    alert('❌ Error registering batch: ' + data.error);
                }
            } catch (err) {
                alert('Server error registering honey batch.');
            }
        });

        loadBeekeeperBatches();
    }

    function renderBeekeeperQR(batch) {
        const qrBox = document.getElementById('bk-qr-box');
        if (qrBox) qrBox.style.display = 'block';
        const title = document.getElementById('bk-qr-title');
        const img = document.getElementById('bk-qr-img');
        const hash = document.getElementById('bk-qr-hash');
        const link = document.getElementById('bk-qr-link');

        if (title) title.textContent = batch.batchId;
        if (img) img.src = batch.qrCodeDataUrl;
        if (hash) hash.textContent = batch.sha256Hash;
        if (link) link.href = batch.verifyUrl;
    }

    async function loadBeekeeperBatches() {
        try {
            const res = await fetch('/api/batches');
            const data = await res.json();
            if (data.success) {
                const list = document.getElementById('bk-batches-list');
                if (!list) return;
                list.innerHTML = '';
                data.batches.forEach(b => {
                    const item = document.createElement('div');
                    item.style.cssText = 'background:#ffffff;border:2px solid #000;box-shadow:3px 3px 0px #000;padding:14px;border-radius:6px;margin-bottom:12px;';
                    item.innerHTML = `
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <strong style="font-size:1.05rem;">${b.batchId}</strong>
                            <span class="badge-status ${b.status}">${b.status}</span>
                        </div>
                        <div style="font-size:0.85rem;color:#444;">🌾 ${b.cropDetails?.cropName || 'Honey Batch'} (${b.cropDetails?.yieldQuantityKg} kg)</div>
                        <div style="font-size:0.8rem;color:#666;margin-top:4px;">📍 Hive: ${b.iotSensorDetails?.hiveId} | Temp: ${b.iotSensorDetails?.temperature}°C</div>
                        <div style="margin-top:10px;">
                            <a href="/consumer?batchId=${b.batchId}" class="btn-white" style="padding:4px 10px;font-size:0.75rem;text-decoration:none;">View QR Provenance Page</a>
                        </div>
                    `;
                    list.appendChild(item);
                });
            }
        } catch (err) {
            console.error('Error loading beekeeper batches:', err);
        }
    }

    // ═══════════════ 3. LABORATORY PAGE (CARD GRID - NO DROPDOWNS!) ═══════════════
    function setupTesterPage() {
        const formLabTest = document.getElementById('form-lab-test');
        const navUserInfo = document.getElementById('nav-user-info');
        if (navUserInfo && currentUser) {
            navUserInfo.textContent = `🧪 ${currentUser.name}`;
        }

        formLabTest?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedBatchId = document.getElementById('lab-batch-id-selected').value;
            if (!selectedBatchId) {
                alert('Please select a batch from the cards above first!');
                return;
            }

            const payload = {
                token: currentAuthToken,
                batchId: selectedBatchId,
                purityPercentage: document.getElementById('lab-purity').value,
                moisturePercentage: document.getElementById('lab-moisture').value,
                hmfMgKg: document.getElementById('lab-hmf').value,
                pollenCount: document.getElementById('lab-pollen').value,
                antibioticResidues: document.getElementById('lab-antibiotics').value,
                status: document.getElementById('lab-status').value,
                feedback: document.getElementById('lab-feedback').value
            };

            try {
                const res = await fetch('/api/lab/test/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert(`✅ Laboratory Certificate Issued! Batch status updated to: ${data.batch.status}`);
                    loadLabData();
                } else {
                    alert('❌ Lab Upload Error: ' + data.error);
                }
            } catch (err) {
                alert('Server error submitting lab test results.');
            }
        });

        loadLabData();
    }

    async function loadLabData() {
        try {
            const res = await fetch('/api/batches');
            const data = await res.json();
            if (data.success && data.batches) {
                // Render Batch Cards Grid
                const cardsContainer = document.getElementById('lab-batch-cards-container');
                if (cardsContainer) {
                    cardsContainer.innerHTML = '';
                    if (data.batches.length === 0) {
                        cardsContainer.innerHTML = '<p style="color:#666;">No registered honey batches found.</p>';
                    } else {
                        data.batches.forEach(b => {
                            const card = document.createElement('div');
                            card.className = 'batch-card';
                            card.setAttribute('data-id', b.batchId);
                            card.innerHTML = `
                                <div class="batch-card-header">
                                    <span class="batch-card-id">${b.batchId}</span>
                                    <span class="badge-status ${b.status}">${b.status}</span>
                                </div>
                                <div class="batch-card-name">${b.cropDetails?.cropName || 'Honey Batch'}</div>
                                <div class="batch-card-meta">🌾 Yield: ${b.cropDetails?.yieldQuantityKg || 100} kg | Harvest: ${b.cropDetails?.harvestStartDate || '2026-03-20'}</div>
                                <div style="font-size:0.75rem;color:#d97706;font-weight:700;margin-top:8px;">👉 Click to select for lab test</div>
                            `;
                            card.addEventListener('click', () => {
                                document.querySelectorAll('#lab-batch-cards-container .batch-card').forEach(c => c.classList.remove('selected'));
                                card.classList.add('selected');

                                document.getElementById('lab-batch-id-selected').value = b.batchId;
                                const label = document.getElementById('lab-selected-batch-label');
                                if (label) label.textContent = `${b.batchId} (${b.cropDetails?.cropName})`;
                            });
                            cardsContainer.appendChild(card);
                        });
                    }
                }

                // Render Issued Lab Records List
                const list = document.getElementById('lab-records-list');
                if (list) {
                    list.innerHTML = '';
                    const tested = data.batches.filter(b => b.labTestResults !== null);
                    if (tested.length === 0) {
                        list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No test certificates issued yet.</p>';
                    } else {
                        tested.forEach(b => {
                            const lab = b.labTestResults;
                            const item = document.createElement('div');
                            item.style.cssText = 'background:#ffffff;border:2px solid #000;box-shadow:3px 3px 0px #000;padding:14px;border-radius:6px;margin-bottom:12px;';
                            item.innerHTML = `
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                                    <strong style="font-size:1rem;">${b.batchId}</strong>
                                    <span class="badge-status ${lab.status}">${lab.status}</span>
                                </div>
                                <div style="font-size:0.85rem;">Purity: <strong>${lab.purityPercentage}%</strong> | Moisture: <strong>${lab.moisturePercentage}%</strong> | HMF: <strong>${lab.hmfMgKg} mg/kg</strong></div>
                                <div style="font-size:0.8rem;color:#555;margin-top:4px;">Feedback: "${lab.feedback}"</div>
                            `;
                            list.appendChild(item);
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error loading lab data:', err);
        }
    }

    // ═══════════════ 4. RETAILER PAGE (CARD GRID - NO DROPDOWNS!) ═══════════════
    function setupRetailerPage() {
        const formRetailerVerify = document.getElementById('form-retailer-verify');
        const navUserInfo = document.getElementById('nav-user-info');
        if (navUserInfo && currentUser) {
            navUserInfo.textContent = `🏪 ${currentUser.name}`;
        }

        formRetailerVerify?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedBatchId = document.getElementById('retailer-batch-id-selected').value;
            if (!selectedBatchId) {
                alert('Please select a batch from the cards above first!');
                return;
            }

            const payload = {
                token: currentAuthToken,
                batchId: selectedBatchId,
                stockQuantity: document.getElementById('retailer-stock-qty').value,
                storeRemarks: document.getElementById('retailer-remarks').value
            };

            try {
                const res = await fetch('/api/retailer/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert('✅ Retail Store Inventory Verified & Audit Logged!');
                    loadRetailerData();
                } else {
                    alert('❌ Retailer Verification Error: ' + data.error);
                }
            } catch (err) {
                alert('Server error verifying retailer batch.');
            }
        });

        loadRetailerData();
    }

    async function loadRetailerData() {
        try {
            const res = await fetch('/api/batches');
            const data = await res.json();
            if (data.success && data.batches) {
                // Render Retailer Batch Cards Grid
                const cardsContainer = document.getElementById('retailer-batch-cards-container');
                if (cardsContainer) {
                    cardsContainer.innerHTML = '';
                    data.batches.forEach(b => {
                        const card = document.createElement('div');
                        card.className = 'batch-card';
                        card.setAttribute('data-id', b.batchId);
                        card.innerHTML = `
                            <div class="batch-card-header">
                                <span class="batch-card-id">${b.batchId}</span>
                                <span class="badge-status ${b.status}">${b.status}</span>
                            </div>
                            <div class="batch-card-name">${b.cropDetails?.cropName || 'Honey Batch'}</div>
                            <div class="batch-card-meta">🌾 Apiary: ${b.beekeeperProfile?.apiary || 'Organic Apiary'}</div>
                            <div style="font-size:0.75rem;color:#d97706;font-weight:700;margin-top:8px;">👉 Click to select for store audit</div>
                        `;
                        card.addEventListener('click', () => {
                            document.querySelectorAll('#retailer-batch-cards-container .batch-card').forEach(c => c.classList.remove('selected'));
                            card.classList.add('selected');

                            document.getElementById('retailer-batch-id-selected').value = b.batchId;
                            const label = document.getElementById('retailer-selected-batch-label');
                            if (label) label.textContent = `${b.batchId} (${b.cropDetails?.cropName})`;
                        });
                        cardsContainer.appendChild(card);
                    });
                }

                // Render Store Verification Logs
                const list = document.getElementById('retailer-logs-list');
                if (list) {
                    list.innerHTML = '';
                    let hasLogs = false;
                    data.batches.forEach(b => {
                        (b.retailerLogs || []).forEach(log => {
                            hasLogs = true;
                            const item = document.createElement('div');
                            item.style.cssText = 'background:#ffffff;border:2px solid #000;box-shadow:3px 3px 0px #000;padding:14px;border-radius:6px;margin-bottom:12px;';
                            item.innerHTML = `
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                                    <strong style="font-size:1rem;">${b.batchId}</strong>
                                    <span class="badge-status TESTED_AND_VERIFIED">STORE VERIFIED</span>
                                </div>
                                <div style="font-size:0.85rem;">Store: <strong>${log.storeName}</strong></div>
                                <div style="font-size:0.85rem;color:#444;">Stock Units: <strong>${log.stockQuantity} jars</strong></div>
                                <div style="font-size:0.8rem;color:#666;margin-top:4px;">Remarks: ${log.remarks}</div>
                            `;
                            list.appendChild(item);
                        });
                    });
                    if (!hasLogs) {
                        list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No store verification logs registered yet.</p>';
                    }
                }
            }
        } catch (err) {
            console.error('Error loading retailer data:', err);
        }
    }

    // ═══════════════ 5. CONSUMER PAGE (BATCH CARDS + UNBROKEN QR PIPELINE) ═══════════════
    function setupConsumerPage() {
        const btnSearch = document.getElementById('btn-consumer-search');
        const inputSearch = document.getElementById('consumer-search-input');
        const urlParams = new URLSearchParams(window.location.search);
        const urlBatchId = urlParams.get('batchId');

        btnSearch?.addEventListener('click', () => {
            const bId = inputSearch.value.trim();
            if (bId) fetchConsumerVerification(bId);
        });

        loadConsumerBatchCards(urlBatchId || "BATCH-2026-HIM-101");
    }

    async function loadConsumerBatchCards(defaultSelectedBatchId) {
        try {
            const res = await fetch('/api/batches');
            const data = await res.json();
            if (data.success && data.batches) {
                const container = document.getElementById('consumer-batch-cards-container');
                if (container) {
                    container.innerHTML = '';
                    data.batches.forEach(b => {
                        const card = document.createElement('div');
                        card.className = `batch-card ${b.batchId === defaultSelectedBatchId ? 'selected' : ''}`;
                        card.setAttribute('data-id', b.batchId);
                        card.innerHTML = `
                            <div class="batch-card-header">
                                <span class="batch-card-id">${b.batchId}</span>
                                <span class="badge-status ${b.status}">${b.status}</span>
                            </div>
                            <div class="batch-card-name">${b.cropDetails?.cropName || 'Honey Batch'}</div>
                            <div class="batch-card-meta">👨‍🌾 ${b.beekeeperProfile?.name || 'Beekeeper'} | 🌾 ${b.cropDetails?.yieldQuantityKg || 100} kg</div>
                            <div style="font-size:0.75rem;color:#d97706;font-weight:700;margin-top:8px;">🔍 Click to view QR & traceability</div>
                        `;
                        card.addEventListener('click', () => {
                            document.querySelectorAll('#consumer-batch-cards-container .batch-card').forEach(c => c.classList.remove('selected'));
                            card.classList.add('selected');
                            fetchConsumerVerification(b.batchId);
                        });
                        container.appendChild(card);
                    });
                }
            }
        } catch (err) {
            console.error('Error loading consumer batch cards:', err);
        }

        fetchConsumerVerification(defaultSelectedBatchId);
    }

    async function fetchConsumerVerification(batchId) {
        try {
            const res = await fetch(`/api/consumer/verify/${batchId}`);
            const data = await res.json();
            if (data.success) {
                renderConsumerVerification(data.batch);
            } else {
                alert('❌ Honey Batch Not Found: ' + data.error);
            }
        } catch (err) {
            console.error('Error verifying QR batch:', err);
        }
    }

    function renderConsumerVerification(batch) {
        activeConsumerBatchId = batch.batchId;
        const resultBox = document.getElementById('consumer-verify-result');
        if (resultBox) resultBox.style.display = 'block';

        // Update Links to Feedback & Contact pages with batchId query param
        const btnFb = document.getElementById('btn-goto-feedback');
        const btnCt = document.getElementById('btn-goto-contact');
        if (btnFb) btnFb.href = `/feedback?batchId=${batch.batchId}`;
        if (btnCt) btnCt.href = `/contact?batchId=${batch.batchId}`;

        const lab = batch.labTestResults;
        const purityScore = lab ? `${lab.purityPercentage}%` : '99.0%';

        const elScore = document.getElementById('c-purity-score');
        const elTitle = document.getElementById('c-batch-title');
        const elCrop = document.getElementById('c-crop-name');
        const elHash = document.getElementById('c-sha-hash');
        const elStatus = document.getElementById('c-status-badge');

        if (elScore) elScore.textContent = purityScore;
        if (elTitle) elTitle.textContent = batch.batchId;
        if (elCrop) elCrop.textContent = batch.cropDetails?.cropName || 'Pure Natural Honey';
        if (elHash) elHash.textContent = batch.sha256Hash || '--';

        // Render QR Code Image Card
        const qrImg = document.getElementById('c-qr-img');
        const qrLink = document.getElementById('c-qr-link');
        if (qrImg && batch.qrCodeDataUrl) qrImg.src = batch.qrCodeDataUrl;
        if (qrLink) {
            qrLink.href = batch.verifyUrl || `/consumer?batchId=${batch.batchId}`;
            qrLink.textContent = batch.verifyUrl || `http://localhost:3000/consumer?batchId=${batch.batchId}`;
        }

        if (elStatus) {
            if (batch.status === 'TESTED_AND_VERIFIED' || batch.status === 'RETAIL_STOCK') {
                elStatus.className = 'badge-status PASS';
                elStatus.textContent = '✓ Verified Grade A Pure Honey';
            } else {
                elStatus.className = 'badge-status PENDING_LAB';
                elStatus.textContent = '⚠️ Pending Laboratory Certification';
            }
        }

        // Beekeeper Profile & Sensors
        const bk = batch.beekeeperProfile || {};
        const elBkName = document.getElementById('c-bk-name');
        const elBkApiary = document.getElementById('c-bk-apiary');
        const elBkLic = document.getElementById('c-bk-license');

        if (elBkName) elBkName.textContent = bk.name || 'Master Beekeeper';
        if (elBkApiary) elBkApiary.textContent = bk.apiary || 'Organic Apiary';
        if (elBkLic) elBkLic.textContent = `License: ${bk.license || 'GOV-AP-000'}`;

        const iot = batch.iotSensorDetails || {};
        const elTemp = document.getElementById('c-iot-temp');
        const elHumid = document.getElementById('c-iot-humid');
        const elWeight = document.getElementById('c-iot-weight');
        const elVoc = document.getElementById('c-iot-voc');

        if (elTemp) elTemp.textContent = `${iot.temperature || 35.0}°C`;
        if (elHumid) elHumid.textContent = `${iot.humidity || 58.0}%`;
        if (elWeight) elWeight.textContent = `${iot.weight || 45.0} kg`;
        if (elVoc) elVoc.textContent = `${iot.vocPpm || 110} ppm`;

        // Image Evidence
        const evidenceBox = document.getElementById('c-evidence-box');
        if (evidenceBox) {
            evidenceBox.innerHTML = '';
            if (batch.uploadedImages && batch.uploadedImages.length > 0) {
                const imgObj = batch.uploadedImages[0];
                const imgSrc = imgObj.data || '/css/placeholder.jpg';
                evidenceBox.innerHTML = `
                    <div style="background:#ffffff;border:2px solid #000;padding:10px;border-radius:6px;margin-top:10px;">
                        <span style="font-size:0.8rem;font-weight:800;display:block;margin-bottom:6px;">📷 Frame Inspection Photo Evidence:</span>
                        <img src="${imgSrc}" alt="Frame Evidence" style="max-width:100%;max-height:160px;border:1px solid #000;border-radius:4px;display:block;">
                        <span style="font-size:0.75rem;color:#555;margin-top:4px;display:block;">${imgObj.caption || 'Sealed honeycomb frame'}</span>
                    </div>
                `;
            }
        }

        // LAB TEST BOX OR CLEAN PENDING NOTICE
        const labContainer = document.getElementById('c-lab-details-container');
        if (labContainer) {
            if (lab) {
                labContainer.innerHTML = `
                    <div style="line-height:1.8;font-size:0.9rem;">
                        <div>Testing Lab: <strong>${lab.labName || 'Central Quality Lab'}</strong></div>
                        <div>Moisture Content: <strong>${lab.moisturePercentage}% (Legal Max 20%)</strong></div>
                        <div>HMF Freshness: <strong>${lab.hmfMgKg} mg/kg</strong></div>
                        <div>Antibiotics: <strong>${lab.antibioticResidues || 'Not Detected (0.0 ppm)'}</strong></div>
                        <div>Pollen Signature: <strong>${lab.pollenCount || 'Acacia Pollen'}</strong></div>
                        <div style="background:#fffdfa;border:2px solid #000;padding:12px;border-radius:6px;margin-top:14px;">
                            <em>"${lab.feedback}"</em>
                        </div>
                    </div>
                `;
            } else {
                labContainer.innerHTML = `
                    <div style="background:#fef08a;border:2px solid #000;padding:16px;border-radius:6px;margin-top:6px;">
                        <strong style="font-size:0.95rem;color:#854d0e;display:block;margin-bottom:4px;">🧪 Status: Awaiting Laboratory Quality Certification</strong>
                        <p style="font-size:0.85rem;color:#713f12;line-height:1.4;">
                            This batch has been registered by the Beekeeper with IoT sensors and comb photo evidence. It is currently in queue for analytical testing by an NABL Accredited Laboratory. No test certificates have been issued yet.
                        </p>
                    </div>
                `;
            }
        }

        // Retailer Status Box
        const retailerInfo = document.getElementById('c-retailer-info');
        if (retailerInfo) {
            if (batch.retailerLogs && batch.retailerLogs.length > 0) {
                const rLog = batch.retailerLogs[0];
                retailerInfo.textContent = `Verified in stock at ${rLog.storeName} (${rLog.stockQuantity} jars). Verified on ${new Date(rLog.verifiedAt).toLocaleDateString()}`;
            } else {
                retailerInfo.textContent = 'Batch certified & ready for retail store distribution.';
            }
        }
    }

    // ═══════════════ 6. FEEDBACK PAGE LOGIC ═══════════════
    function setupFeedbackPage() {
        const formFb = document.getElementById('form-feedback-page');
        const urlParams = new URLSearchParams(window.location.search);
        const targetBatchId = urlParams.get('batchId') || "BATCH-2026-HIM-101";

        loadFeedbackPageBatches(targetBatchId);

        formFb?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                batchId: document.getElementById('fb-batch-select').value,
                reviewerName: document.getElementById('fb-reviewer-name').value,
                rating: document.getElementById('fb-rating-score').value,
                comment: document.getElementById('fb-comment-text').value
            };

            try {
                const res = await fetch('/api/consumer/rating', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert('⭐ Thank you! Your review and rating have been recorded on the feedback ledger.');
                    loadFeedbackPageBatches(payload.batchId);
                }
            } catch (err) {
                alert('Server error submitting feedback.');
            }
        });
    }

    async function loadFeedbackPageBatches(selectedBatchId) {
        try {
            const res = await fetch('/api/batches');
            const data = await res.json();
            if (data.success && data.batches) {
                const select = document.getElementById('fb-batch-select');
                if (select) {
                    select.innerHTML = '';
                    data.batches.forEach(b => {
                        const opt = document.createElement('option');
                        opt.value = b.batchId;
                        opt.textContent = `${b.batchId} (${b.cropDetails?.cropName || 'Honey Batch'})`;
                        if (b.batchId === selectedBatchId) opt.selected = true;
                        select.appendChild(opt);
                    });
                }

                // Render Feedback History List
                const list = document.getElementById('feedback-records-list');
                if (list) {
                    list.innerHTML = '';
                    let allRatings = [];
                    data.batches.forEach(b => {
                        (b.consumerRatings || []).forEach(r => {
                            allRatings.push({ ...r, batchId: b.batchId });
                        });
                    });

                    if (allRatings.length === 0) {
                        list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No ratings submitted yet.</p>';
                    } else {
                        allRatings.forEach(r => {
                            const div = document.createElement('div');
                            div.style.cssText = 'background:#ffffff;border:2px solid #000;box-shadow:3px 3px 0px #000;padding:12px;border-radius:6px;margin-bottom:12px;';
                            div.innerHTML = `
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                                    <strong>${r.reviewerName}</strong>
                                    <span style="color:#d97706;font-weight:900;">${'⭐'.repeat(r.rating)}</span>
                                </div>
                                <div style="font-size:0.8rem;color:#555;">Batch: <strong>${r.batchId}</strong></div>
                                <div style="font-size:0.85rem;margin-top:4px;">"${r.comment}"</div>
                            `;
                            list.appendChild(div);
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error loading feedback batches:', err);
        }
    }

    // ═══════════════ 7. CONTACT / SUPPORT PAGE LOGIC ═══════════════
    function setupContactPage() {
        const formContact = document.getElementById('form-contact-concern');
        const urlParams = new URLSearchParams(window.location.search);
        const targetBatchId = urlParams.get('batchId') || "BATCH-2026-HIM-101";

        loadContactPageBatches(targetBatchId);

        formContact?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                batchId: document.getElementById('cc-batch-select').value,
                consumerName: document.getElementById('cc-consumer-name').value,
                category: document.getElementById('cc-category-select').value,
                comments: document.getElementById('cc-comments-text').value
            };

            try {
                const res = await fetch('/api/consumer/concern', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert(`⚠️ Quality Concern Successfully Registered!\n\nGovernment Audit Tracking ID: ${data.concern.concernId}\nOur inspection team will review this query.`);
                    document.getElementById('cc-comments-text').value = '';
                }
            } catch (err) {
                alert('Server error submitting quality concern.');
            }
        });
    }

    async function loadContactPageBatches(selectedBatchId) {
        try {
            const res = await fetch('/api/batches');
            const data = await res.json();
            if (data.success && data.batches) {
                const select = document.getElementById('cc-batch-select');
                if (select) {
                    select.innerHTML = '';
                    data.batches.forEach(b => {
                        const opt = document.createElement('option');
                        opt.value = b.batchId;
                        opt.textContent = `${b.batchId} (${b.cropDetails?.cropName || 'Honey Batch'})`;
                        if (b.batchId === selectedBatchId) opt.selected = true;
                        select.appendChild(opt);
                    });
                }
            }
        } catch (err) {
            console.error('Error loading contact page batches:', err);
        }
    }
});
