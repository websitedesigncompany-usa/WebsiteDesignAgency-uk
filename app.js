/* HammadifyDigital Tools — catalogue, customer experience and partner workspace */
const ADMIN_PASSWORD = "hammad@digitals786";
const WHATSAPP_NUMBER = "923304302549";
const PRODUCTS_KEY = "hammadify_products_v1";
const RESELLERS_KEY = "hammadify_resellers_v1";

const productSeed = [
  { id: "gemini-18m", name: "Gemini AI Pro", category: "AI & Productivity", icon: "✦", term: "18 months", price: "Ask on WhatsApp", active: true, short: "A private Gemini AI Pro subscription on your own Gmail.", description: "18 months plan with 5TB cloud storage. Add up to 5 users, with no sharing. No card required and works in any country. This is a full family account, not an invite. Please redeem the link within one hour of delivery.", delivery: "Redeem link", warranty: "1 hour after delivery", color: "#c8bdfb", bg: "#eeeaff", ink: "#6350c7" },
  { id: "figma-edu", name: "Figma Pro Education", category: "Design & Creator", icon: "◒", term: "2 years", price: "Ask on WhatsApp", active: true, short: "Build, prototype and collaborate with a long-term Pro plan.", description: "Two-year Figma Pro Education access. Format: email and password. Figma and Hotmail password are the same. A one-month guarantee is included. Never change the Figma email.", delivery: "Email + password", warranty: "1 month", color: "#f4a7c4", bg: "#ffe8f0", ink: "#b04976" },
  { id: "spotify-3m", name: "Spotify Premium", category: "Entertainment", icon: "◉", term: "3 months", price: "Ask on WhatsApp", active: true, short: "Activate Premium on your own eligible Spotify account.", description: "Three months of Premium access via a redeem link. A fresh or eligible account is required. Activation may require a Germany or Spain VPN. Previously used Premium or trial accounts may not work.", delivery: "Redeem link", warranty: "3 days hold warranty", color: "#9fe0a8", bg: "#e2f6e4", ink: "#32814a" },
  { id: "nordvpn-3m", name: "NordVPN", category: "Security & VPN", icon: "⌁", term: "3 months", price: "Ask on WhatsApp", active: true, short: "Private browsing access with straightforward activation.", description: "Three-month NordVPN redeem link. Can be activated on your own email with no credit card or payment method required. Please note: there is no warranty after activation and no hold warranty.", delivery: "Redeem link", warranty: "No warranty after activation", color: "#93cef2", bg: "#e4f3fc", ink: "#2d83ba" },
  { id: "surfshark-coupon", name: "Surfshark Coupon", category: "Security & VPN", icon: "◈", term: "2 months", price: "Ask on WhatsApp", active: true, short: "A two-month coupon for unlimited device access.", description: "Two-month Surfshark coupon with unlimited devices. A credit card is required to activate the coupon. No hold warranty.", delivery: "Coupon", warranty: "No hold warranty", color: "#f5c873", bg: "#fff3d6", ink: "#9c701d" },
  { id: "surfshark-device", name: "Surfshark One Device", category: "Security & VPN", icon: "◈", term: "2 months", price: "Ask on WhatsApp", active: true, short: "Simple one-device login access for two months.", description: "Use on one device only. Login is completed in the Surfshark app with an email, password and 2FA code. Please do not log in on more than one device, as this voids replacement eligibility.", delivery: "Login details", warranty: "No hold warranty", color: "#f5c873", bg: "#fff3d6", ink: "#9c701d" },
  { id: "canva-team", name: "Canva Pro Team", category: "Design & Creator", icon: "✽", term: "1 year", price: "Ask on WhatsApp", active: true, short: "Join a Canva Pro education team with full warranty.", description: "One-year Canva Pro team package with full warranty. Send your email after purchase and you will be notified when the invite has been completed.", delivery: "Team invite", warranty: "1 year", color: "#f6a6b6", bg: "#ffebef", ink: "#b94d70" },
  { id: "canva-admin", name: "Canva Admin Panel", category: "Design & Creator", icon: "✽", term: "3 years", price: "Ask on WhatsApp", active: true, short: "Education admin panel with space for your own team.", description: "Three-year Canva Education admin panel. Add up to 499 people. Manual delivery. Includes a five-month warranty.", delivery: "Manual delivery", warranty: "5 months", color: "#f6a6b6", bg: "#ffebef", ink: "#b94d70" },
  { id: "outlook", name: "Outlook Mailbox", category: "Email & Microsoft", icon: "@", term: "Access", price: "Ask on WhatsApp", active: true, short: "Good-quality Outlook access with an easy auto-login flow.", description: "Use the auto-login link, then go to Outlook.com to complete access. For bulk reading, ask us about the MailReader bulk-reader option.", delivery: "Auto-login link", warranty: "Ask the team", color: "#8fc7f0", bg: "#e8f4ff", ink: "#3b80b5" },
  { id: "microsoft-family", name: "Microsoft 365 Family", category: "Email & Microsoft", icon: "▦", term: "1 year", price: "Ask on WhatsApp", active: true, short: "A family-plan slot with clear email submission steps.", description: "One-year Microsoft 365 Family slot. Use the email registered to your Microsoft account. Send one email per line for multiple family members. Orders are usually processed within 5–30 minutes.", delivery: "Account invitation", warranty: "Full warranty", color: "#9cc5ed", bg: "#e8f3ff", ink: "#3877b4" },
  { id: "udemy", name: "Udemy Personal Plan", category: "Learning", icon: "▰", term: "1 month", price: "Ask on WhatsApp", active: true, short: "Personal Plan access with a full email login.", description: "One-month Udemy Personal Plan with full email access and access to almost all Udemy courses. Login with OTP, and avoid changing account settings. One-day warranty included.", delivery: "Email login", warranty: "1 day", color: "#f1a46e", bg: "#fff0e3", ink: "#b36430" },
  { id: "wispr-flow", name: "Wispr Flow Student", category: "AI & Productivity", icon: "〰", term: "12 months", price: "Ask on WhatsApp", active: true, short: "Official student subscription for a full year.", description: "Official Wispr Flow student subscription. Twelve-month term. Delivery is provided in email and password format; ask for current eligibility details.", delivery: "Email + password", warranty: "1 month", color: "#c7b5f5", bg: "#f0eaff", ink: "#7057bd" },
  { id: "duolingo-12m", name: "Super Duolingo", category: "Learning", icon: "●", term: "12 months", price: "Ask on WhatsApp", active: true, short: "A full year of Super Duolingo via redeem link.", description: "Twelve-month Super Duolingo redeem link. No card is needed. Keep your account logged in, open the offer link in a new tab and click Claim Offer. No warranty after activation; three-day hold warranty.", delivery: "Redeem link", warranty: "3 days hold", color: "#9edba0", bg: "#e6f6e5", ink: "#39834e" },
  { id: "duolingo-2m", name: "Super Duolingo Offer", category: "Learning", icon: "●", term: "2 months", price: "Ask on WhatsApp", active: true, short: "An easy offer link for a fresh Duolingo account.", description: "Two-month Super Duolingo offer link. Requires a fresh Duolingo account and a credit card or other payment method. No VPN required. Two-day hold warranty.", delivery: "Offer link", warranty: "2 days hold", color: "#9edba0", bg: "#e6f6e5", ink: "#39834e" },
  { id: "notion-business", name: "Notion Business", category: "AI & Productivity", icon: "N", term: "3 months", price: "Ask on WhatsApp", active: true, short: "Business workspace access activated through email.", description: "Three-month Notion Business redeem link. Can be activated via email. Please redeem immediately after purchase. No warranty after activation.", delivery: "Redeem link", warranty: "No warranty after activation", color: "#d2d2ce", bg: "#f0f0ed", ink: "#555752" },
  { id: "notion-edu", name: "Notion Edu Plus", category: "AI & Productivity", icon: "N", term: "12 months", price: "Ask on WhatsApp", active: true, short: "A twelve-month education workspace for organised thinking.", description: "Notion Edu Plus for twelve months with a one-month warranty. Format: Notion email and password.", delivery: "Email + password", warranty: "1 month", color: "#d2d2ce", bg: "#f0f0ed", ink: "#555752" },
  { id: "lovable", name: "Lovable Lite", category: "AI & Productivity", icon: "♡", term: "12 months", price: "Ask on WhatsApp", active: true, short: "Build with a full year of Lovable Lite access.", description: "Twelve-month Lovable Lite redeem link. No payment method is needed to activate and it can be activated directly on email. Activate within 30 minutes and report issues during the same window.", delivery: "Redeem link", warranty: "30-minute activation window", color: "#f39a91", bg: "#ffebe8", ink: "#af544b" },
  { id: "youtube", name: "YouTube Premium", category: "Entertainment", icon: "▶", term: "12 months", price: "Ask on WhatsApp", active: true, short: "A full year of Premium with help if activation gets stuck.", description: "Twelve-month YouTube Premium slot with full warranty. Pakistani billing address and VPN steps may be required for activation. We support activation errors during use.", delivery: "Family slot", warranty: "Full warranty", color: "#f29a91", bg: "#ffebea", ink: "#ae4d45" },
  { id: "capcut-admin", name: "CapCut Pro Admin Team", category: "Design & Creator", icon: "✂", term: "1 month", price: "Ask on WhatsApp", active: true, short: "A seven-seat Pro admin team with manual delivery.", description: "One-month CapCut Pro admin team with seven seats and 28–30 day warranty. Email, password and invite link are delivered manually. Avoid logging in just to check and do not exceed two devices.", delivery: "Manual delivery", warranty: "28–30 days", color: "#bba8f1", bg: "#eeeaff", ink: "#6954b4" },
  { id: "capcut-team", name: "CapCut Pro Team", category: "Design & Creator", icon: "✂", term: "1 month", price: "Ask on WhatsApp", active: true, short: "Team access with 1,200 AI credits and Pro features.", description: "One-month CapCut Pro team plan with full Pro features and 1,200 AI credits. Email and password login. Use on up to two devices. Twenty-eight-day warranty.", delivery: "Email + password", warranty: "28 days", color: "#bba8f1", bg: "#eeeaff", ink: "#6954b4" },
  { id: "grok-x", name: "Super Grok + X Premium", category: "AI & Productivity", icon: "✧", term: "2 months", price: "Ask on WhatsApp", active: true, short: "Super Grok and X Premium in one paid account.", description: "Two-month Super Grok plus X Premium paid account. Manual delivery. Non-warranty product; ask us for current availability before ordering.", delivery: "Manual delivery", warranty: "No warranty", color: "#c0d0d5", bg: "#edf3f5", ink: "#4c707c" },
  { id: "grok", name: "Super Grok", category: "AI & Productivity", icon: "✧", term: "9–10 days", price: "Ask on WhatsApp", active: true, short: "Short-term Super Grok access with clear account notes.", description: "Nine to ten-day Super Grok access. Please change the email and update the password, then log out other sessions. Changing the email address voids the warranty.", delivery: "Account access", warranty: "6 days", color: "#c0d0d5", bg: "#edf3f5", ink: "#4c707c" },
  { id: "elevenlabs", name: "ElevenLabs Pro", category: "AI & Productivity", icon: "◉", term: "1 month", price: "Ask on WhatsApp", active: true, short: "Pro workspace access with 50,000 credits.", description: "One-month ElevenLabs Pro workspace invite account with 50,000 credits and all Pro features. Voice cloning is not possible here. Includes a short warranty window.", delivery: "Workspace invite", warranty: "2 days", color: "#e6adbc", bg: "#ffedf2", ink: "#ae5b73" },
  { id: "chatgpt-k12", name: "ChatGPT K12", category: "AI & Productivity", icon: "✳", term: "2 years", price: "Ask on WhatsApp", active: true, short: "Private K12 account access with a guided self-join.", description: "Two-year ChatGPT K12 fully private account. Format: email, password and 2FA. Follow the provided workspace invite and activation guide to self-join the K12 workspace.", delivery: "Email + password + 2FA", warranty: "12 hours", color: "#9bd4bd", bg: "#e6f6ea", ink: "#3c8960" }
];

const state = {
  products: load(PRODUCTS_KEY, productSeed),
  resellers: load(RESELLERS_KEY, [
    { id: "demo-partner", name: "Demo partner", username: "partner", password: "partner2026", commission: "15", active: true }
  ]),
  filter: "All",
  search: "",
  loginMode: "reseller",
  portalRole: null,
  portalUser: null,
  portalPanel: "overview",
  editingProductId: null,
  editingResellerId: null
};

function load(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(fallback));
  } catch (_) { return JSON.parse(JSON.stringify(fallback)); }
}
function persist() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(state.products));
  localStorage.setItem(RESELLERS_KEY, JSON.stringify(state.resellers));
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}
function slugify(value) { return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `tool-${Date.now()}`; }
function cssVars(product) { return `--card-color:${product.color || "#bde8c8"};--card-bg:${product.bg || "#e1f3e5"};--card-ink:${product.ink || "#17452e"}`; }
function getCategories() { return ["All", ...new Set(state.products.map(product => product.category))]; }
function whatsappFor(product, intro = "I’d like to ask about") {
  const message = `${intro} ${product ? product.name : "your digital tools"}. Please share current availability, price and activation details.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function renderCategories() {
  const target = document.getElementById("categoryTabs");
  if (!target) return;
  target.innerHTML = getCategories().map(category => `<button class="category-tab ${category === state.filter ? "active" : ""}" type="button" role="tab" aria-selected="${category === state.filter}" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join("");
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("productCount");
  if (!grid) return;
  const query = state.search.toLowerCase().trim();
  const filtered = state.products.filter(product => {
    const matchesCategory = state.filter === "All" || product.category === state.filter;
    const matchesQuery = !query || [product.name, product.category, product.short, product.term].join(" ").toLowerCase().includes(query);
    return matchesCategory && matchesQuery && product.active !== false;
  });
  grid.innerHTML = filtered.map(product => `
    <article class="product-card" style="${cssVars(product)}">
      <div class="product-card-head"><span class="product-icon">${escapeHTML(product.icon || "✦")}</span><span class="product-term">${escapeHTML(product.term || "Access")}</span></div>
      <h3>${escapeHTML(product.name)}</h3>
      <p class="product-desc">${escapeHTML(product.short || product.description || "Digital access, delivered with support.")}</p>
      <div class="product-card-foot"><span class="product-category">${escapeHTML(product.category)}</span><button class="product-open" type="button" data-product-id="${escapeHTML(product.id)}">Details <span>↗</span></button></div>
    </article>`).join("");
  empty.hidden = filtered.length !== 0;
  count.textContent = `${filtered.length} ${filtered.length === 1 ? "tool" : "tools"} available`;
}

function openProduct(productId) {
  const product = state.products.find(item => item.id === productId);
  if (!product) return;
  const detail = document.getElementById("productDetail");
  detail.innerHTML = `<div class="product-detail" style="${cssVars(product)}">
    <div class="detail-top"><span class="detail-icon">${escapeHTML(product.icon || "✦")}</span><div class="detail-heading"><div class="eyebrow">${escapeHTML(product.category)}</div><h2>${escapeHTML(product.name)}</h2><p>${escapeHTML(product.term || "Digital access")}</p></div><div class="detail-price">CURRENT PRICE<strong>${escapeHTML(product.price || "Ask us")}</strong></div></div>
    <div class="detail-body"><h3>What to know</h3><p>${escapeHTML(product.description || product.short || "Ask our team for current details.")}</p></div>
    <div class="detail-bottom"><small><strong>Delivery:</strong> ${escapeHTML(product.delivery || "Ask the team")} &nbsp; · &nbsp; <strong>Warranty:</strong> ${escapeHTML(product.warranty || "Ask the team")}</small><a class="button button-primary" href="${whatsappFor(product)}" target="_blank" rel="noopener">Ask about this tool <span>↗</span></a></div>
  </div>`;
  const dialog = document.getElementById("productDialog");
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("modal-open");
}

function showToast(message, type = "success") {
  const region = document.getElementById("toastRegion");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === "error" ? "!" : "✓"}</span>${escapeHTML(message)}`;
  region.appendChild(toast);
  setTimeout(() => { toast.classList.add("out"); setTimeout(() => toast.remove(), 250); }, 3200);
}

function openLogin(mode = "reseller") {
  state.loginMode = mode;
  updateLoginMode();
  const form = document.getElementById("loginForm");
  form.reset();
  document.getElementById("loginMode").value = mode;
  document.getElementById("loginError").hidden = true;
  const dialog = document.getElementById("portalDialog");
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("modal-open");
  setTimeout(() => document.getElementById("loginIdentity").focus(), 50);
}
function updateLoginMode() {
  const mode = state.loginMode;
  document.querySelectorAll(".login-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.loginMode === mode));
  document.getElementById("loginMode").value = mode;
  document.getElementById("loginIdentityLabel").textContent = mode === "admin" ? "Admin username" : "Username or email";
  document.getElementById("loginIdentity").placeholder = mode === "admin" ? "Enter admin" : "Enter your partner ID";
  document.getElementById("loginHint").innerHTML = mode === "admin" ? "Admin access is restricted to the HammadifyDigital team." : `Need access? <a data-whatsapp href="${whatsappFor(null, "Hi HammadifyDigital Tools, I’d like to become a reseller")}" target="_blank" rel="noopener">Message the team ↗</a>`;
}
function closeDialog(dialog) {
  if (dialog && dialog.open) dialog.close();
  if (!document.querySelector("dialog[open]")) document.body.classList.remove("modal-open");
}

function enterPortal(role, user) {
  closeDialog(document.getElementById("portalDialog"));
  closeDialog(document.getElementById("productDialog"));
  state.portalRole = role;
  state.portalUser = user;
  state.portalPanel = role === "admin" ? "overview" : "catalogue";
  document.getElementById("siteShell").hidden = true;
  const portal = document.getElementById("portalShell");
  portal.hidden = false;
  document.body.classList.remove("modal-open");
  renderPortal();
  window.scrollTo(0, 0);
}
function exitPortal() {
  state.portalRole = null;
  state.portalUser = null;
  document.getElementById("portalShell").hidden = true;
  document.getElementById("siteShell").hidden = false;
  window.scrollTo(0, 0);
}

function portalHeader() {
  const isAdmin = state.portalRole === "admin";
  const displayName = isAdmin ? "Administrator" : (state.portalUser.name || state.portalUser.username);
  return `<header class="portal-header"><a class="brand" href="#" data-portal-home><img src="logo.svg" alt="" class="brand-mark" /><span class="brand-name"><strong>hammadifydigital</strong><em>tools</em></span></a><div class="portal-header-actions"><button type="button" data-storefront>← Back to store</button><div class="portal-user"><span class="portal-user-avatar">${escapeHTML(displayName.charAt(0).toUpperCase())}</span><div><strong>${escapeHTML(displayName)}</strong><small>${isAdmin ? "Admin workspace" : "Partner workspace"}</small></div></div><button type="button" data-logout>Log out</button></div></header>`;
}
function portalSidebar() {
  const isAdmin = state.portalRole === "admin";
  const items = isAdmin ? [["overview", "▦", "Overview"], ["products", "✦", "Products"], ["resellers", "♧", "Reseller access"], ["settings", "⚙", "Settings"]] : [["catalogue", "✦", "My catalogue"], ["guides", "≡", "Partner notes"]];
  return `<aside class="portal-sidebar"><div class="portal-sidebar-label">Workspace</div>${items.map(item => `<button class="portal-nav-btn ${state.portalPanel === item[0] ? "active" : ""}" type="button" data-portal-panel="${item[0]}"><span>${item[1]}</span>${item[2]}</button>`).join("")}</aside>`;
}
function renderPortal() {
  const portal = document.getElementById("portalShell");
  portal.innerHTML = `${portalHeader()}<div class="portal-layout">${portalSidebar()}<main class="portal-main">${state.portalRole === "admin" ? renderAdminContent() : renderResellerContent()}</main></div>`;
}
function portalIntro(title, subtitle, action = "") {
  return `<div class="portal-welcome"><div><div class="eyebrow">${state.portalRole === "admin" ? "Admin workspace" : "Partner workspace"}</div><h1>${title}</h1></div><div class="portal-date">${subtitle}${action}</div></div>`;
}
function metric(label, value, note) { return `<div class="metric"><small>${label}</small><strong>${value}</strong><span>${note}</span></div>`; }
function productTable(products = state.products) {
  if (!products.length) return `<div class="portal-empty"><strong>No tools yet</strong>Add your first product to start building the catalogue.</div>`;
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Product</th><th>Term</th><th>Category</th><th>Status</th><th></th></tr></thead><tbody>${products.map(product => `<tr><td><div class="table-product" style="${cssVars(product)}"><span class="table-product-icon">${escapeHTML(product.icon || "✦")}</span><div><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.price || "Ask on WhatsApp")}</small></div></div></td><td>${escapeHTML(product.term || "Access")}</td><td>${escapeHTML(product.category)}</td><td><span class="status-pill ${product.active === false ? "off" : ""}"><i></i>${product.active === false ? "Hidden" : "Live"}</span></td><td><div class="table-actions"><button type="button" data-edit-product="${escapeHTML(product.id)}">Edit</button><button type="button" class="delete-action" data-delete-product="${escapeHTML(product.id)}">Delete</button></div></td></tr>`).join("")}</tbody></table></div>`;
}
function renderAdminContent() {
  if (state.portalPanel === "products") {
    return `${portalIntro("Your products", `${state.products.length} products in catalogue`)}<section class="portal-panel"><div class="panel-heading"><div><h2>Catalogue manager</h2><p>Keep the public catalogue current and clear.</p></div><button class="button button-primary" type="button" data-add-product>+ Add product</button></div>${productTable()}</section>`;
  }
  if (state.portalPanel === "product-form") return renderProductForm();
  if (state.portalPanel === "resellers") return renderResellers();
  if (state.portalPanel === "reseller-form") return renderResellerForm();
  if (state.portalPanel === "settings") return renderSettings();
  const active = state.products.filter(product => product.active !== false).length;
  const categories = new Set(state.products.map(product => product.category)).size;
  return `${portalIntro("Good morning, Hammad.", "Keep the catalogue feeling fresh.")}<div class="portal-metrics">${metric("Live products", active, "Visible in catalogue")}${metric("Categories", categories, "Ways to explore")}${metric("Partners", state.resellers.filter(item => item.active !== false).length, "Active reseller access")}${metric("Support", "Online", "WhatsApp desk ready")}</div><section class="portal-panel"><div class="panel-heading"><div><h2>Recently managed</h2><p>Your latest catalogue items at a glance.</p></div><button class="button button-ghost" type="button" data-portal-panel="products">View all products <span>→</span></button></div>${productTable(state.products.slice(-6).reverse())}</section>`;
}
function renderProductForm() {
  const product = state.editingProductId && state.editingProductId !== "new" ? state.products.find(item => item.id === state.editingProductId) : null;
  const editing = Boolean(product);
  return `${portalIntro(editing ? "Edit product" : "Add a product", editing ? "Update the details shown to customers." : "Give customers a clear reason to choose it.")}<form id="productForm" class="portal-panel portal-form"><div class="form-grid"><div class="form-field"><label for="productName">Product name</label><input id="productName" name="name" required value="${escapeHTML(product?.name || "")}" placeholder="e.g. Figma Pro Education" /></div><div class="form-field"><label for="productCategory">Category</label><select id="productCategory" name="category">${getCategories().filter(item => item !== "All").map(category => `<option ${category === product?.category ? "selected" : ""}>${escapeHTML(category)}</option>`).join("")}<option ${product && !getCategories().includes(product.category) ? "selected" : ""}>Other</option></select></div><div class="form-field"><label for="productTerm">Term / access</label><input id="productTerm" name="term" value="${escapeHTML(product?.term || "")}" placeholder="e.g. 12 months" /></div><div class="form-field"><label for="productPrice">Price display</label><input id="productPrice" name="price" value="${escapeHTML(product?.price || "Ask on WhatsApp")}" placeholder="e.g. Ask on WhatsApp" /></div><div class="form-field"><label for="productIcon">Icon</label><input id="productIcon" name="icon" value="${escapeHTML(product?.icon || "✦")}" maxlength="3" placeholder="✦" /></div><div class="form-field"><label for="productDelivery">Delivery method</label><input id="productDelivery" name="delivery" value="${escapeHTML(product?.delivery || "")}" placeholder="Redeem link / manual delivery" /></div><div class="form-field full"><label for="productShort">Short description</label><input id="productShort" name="short" required value="${escapeHTML(product?.short || "")}" placeholder="A clear one-line description" /></div><div class="form-field full"><label for="productDescription">Full access notes</label><textarea id="productDescription" name="description" required placeholder="Include the important activation and warranty notes.">${escapeHTML(product?.description || "")}</textarea></div><div class="form-field"><label for="productWarranty">Warranty note</label><input id="productWarranty" name="warranty" value="${escapeHTML(product?.warranty || "Ask the team")}" placeholder="e.g. 1 month" /></div><div class="form-field"><label for="productActive">Visibility</label><select id="productActive" name="active"><option value="true" ${product?.active !== false ? "selected" : ""}>Live on storefront</option><option value="false" ${product?.active === false ? "selected" : ""}>Hidden</option></select></div></div><div class="form-actions"><button class="button button-primary" type="submit">${editing ? "Save changes" : "Add product"} <span>→</span></button><button class="button button-ghost" type="button" data-cancel-form>Cancel</button></div></form>`;
}
function renderResellers() {
  return `${portalIntro("Reseller access", `${state.resellers.length} partner accounts`)}<section class="portal-panel"><div class="panel-heading"><div><h2>Partner credentials</h2><p>Create and manage access for trusted resellers.</p></div><button class="button button-primary" type="button" data-add-reseller>+ Add reseller</button></div><div class="reseller-list">${state.resellers.length ? state.resellers.map(reseller => `<div class="reseller-row"><div><strong>${escapeHTML(reseller.name)}</strong><small>${escapeHTML(reseller.username)}</small></div><span>${reseller.active === false ? "Paused" : "Active"}</span><span class="commission">${escapeHTML(reseller.commission || "0")}% fee</span><span>${reseller.password ? "Password set" : "No password"}</span><div class="table-actions"><button type="button" data-edit-reseller="${escapeHTML(reseller.id)}">Edit</button><button class="delete-action" type="button" data-delete-reseller="${escapeHTML(reseller.id)}">Delete</button></div></div>`).join("") : `<div class="portal-empty"><strong>No reseller access yet</strong>Add a partner account to give someone catalogue access.</div>`}</div></section>`;
}
function renderResellerForm() {
  const reseller = state.editingResellerId && state.editingResellerId !== "new" ? state.resellers.find(item => item.id === state.editingResellerId) : null;
  const editing = Boolean(reseller);
  return `${portalIntro(editing ? "Edit reseller" : "Add a reseller", "Credentials are for partner access only.")}<form id="resellerForm" class="portal-panel portal-form"><div class="form-grid"><div class="form-field"><label for="resellerName">Partner name</label><input id="resellerName" name="name" required value="${escapeHTML(reseller?.name || "")}" placeholder="e.g. Ali Digital" /></div><div class="form-field"><label for="resellerUsername">Username or email</label><input id="resellerUsername" name="username" required value="${escapeHTML(reseller?.username || "")}" placeholder="Choose a partner ID" /></div><div class="form-field"><label for="resellerPassword">${editing ? "New password (optional)" : "Password"}</label><input id="resellerPassword" type="password" name="password" ${editing ? "" : "required"} placeholder="Set a secure password" /></div><div class="form-field"><label for="resellerCommission">Partner rate (%)</label><input id="resellerCommission" name="commission" type="number" min="0" max="100" value="${escapeHTML(reseller?.commission || "15")}" /></div><div class="form-field"><label for="resellerActive">Account status</label><select id="resellerActive" name="active"><option value="true" ${reseller?.active !== false ? "selected" : ""}>Active</option><option value="false" ${reseller?.active === false ? "selected" : ""}>Paused</option></select></div></div><div class="form-actions"><button class="button button-primary" type="submit">${editing ? "Save changes" : "Create access"} <span>→</span></button><button class="button button-ghost" type="button" data-cancel-form>Cancel</button></div></form>`;
}
function renderSettings() {
  return `${portalIntro("Workspace settings", "A quick view of your storefront setup.")}<section class="portal-panel"><div class="panel-heading"><div><h2>Storefront details</h2><p>These details are reflected across the public experience.</p></div></div><div class="settings-note"><strong>WhatsApp desk</strong> All customer enquiries route to +92 330 4302549 with the selected tool name pre-filled in the message.</div><div class="settings-note"><strong>Catalogue storage</strong> This launch-ready static workspace saves edits in this browser. Connect the provided data layer to a private database before sharing admin access across devices.</div><div class="settings-note"><strong>Domain</strong> hammadifydigitaltools.com is configured as the canonical storefront domain in the page metadata.</div></section>`;
}
function renderResellerContent() {
  const visible = state.products.filter(product => product.active !== false);
  if (state.portalPanel === "guides") return `${portalIntro("Partner notes", "Everything you need for a smoother handoff.")}<section class="portal-panel"><div class="panel-heading"><div><h2>Simple partner playbook</h2><p>Keep your customer conversations clear and useful.</p></div></div><div class="settings-note"><strong>1. Start with the need</strong> Ask what the customer wants to make, learn or access before recommending a tool.</div><div class="settings-note"><strong>2. Set expectations</strong> Always share the term, delivery method and warranty note from the catalogue before confirming an order.</div><div class="settings-note"><strong>3. Use the support desk</strong> If you need availability or a current price, use the WhatsApp button on the product card and send it to the team.</div></section>`;
  const categories = new Set(visible.map(product => product.category)).size;
  return `${portalIntro(`Hello, ${escapeHTML((state.portalUser.name || "partner").split(" ")[0])}.`, "Your partner catalogue is ready.")}<div class="portal-metrics">${metric("Live products", visible.length, "Ready to share")}${metric("Categories", categories, "Ways to browse")}${metric("Your rate", `${escapeHTML(state.portalUser.commission || "0")}%`, "Partner rate")}${metric("Support", "Online", "WhatsApp desk ready")}</div><section class="portal-panel"><div class="panel-heading"><div><h2>My catalogue</h2><p>Open a product to share its current details with a customer.</p></div><a class="button button-primary" data-whatsapp href="${whatsappFor(null, "Hi HammadifyDigital Tools, I’d like to check partner availability")}" target="_blank" rel="noopener">Ask support <span>↗</span></a></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Product</th><th>Term</th><th>Category</th><th></th></tr></thead><tbody>${visible.map(product => `<tr><td><div class="table-product" style="${cssVars(product)}"><span class="table-product-icon">${escapeHTML(product.icon || "✦")}</span><div><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.price || "Ask on WhatsApp")}</small></div></div></td><td>${escapeHTML(product.term || "Access")}</td><td>${escapeHTML(product.category)}</td><td><div class="table-actions"><button type="button" data-product-id="${escapeHTML(product.id)}">View details</button><a class="table-actions button-link" href="${whatsappFor(product, "Hi HammadifyDigital Tools, I’d like to check")}" target="_blank" rel="noopener">WhatsApp ↗</a></div></td></tr>`).join("")}</tbody></table></div></section>`;
}

function saveProduct(form) {
  const data = new FormData(form);
  const existing = state.editingProductId && state.editingProductId !== "new" ? state.products.find(item => item.id === state.editingProductId) : null;
  const name = data.get("name").trim();
  const product = { id: existing?.id || slugify(name), name, category: data.get("category"), term: data.get("term").trim() || "Access", price: data.get("price").trim() || "Ask on WhatsApp", active: data.get("active") === "true", short: data.get("short").trim(), description: data.get("description").trim(), delivery: data.get("delivery").trim() || "Ask the team", warranty: data.get("warranty").trim() || "Ask the team", icon: data.get("icon").trim() || "✦", color: existing?.color || "#bde8c8", bg: existing?.bg || "#e1f3e5", ink: existing?.ink || "#17452e" };
  if (existing) state.products = state.products.map(item => item.id === existing.id ? product : item); else state.products.push(product);
  persist(); state.editingProductId = null; state.portalPanel = "products"; renderPortal(); renderCategories(); renderProducts(); showToast(existing ? "Product updated" : "Product added to catalogue");
}
function saveReseller(form) {
  const data = new FormData(form);
  const existing = state.editingResellerId && state.editingResellerId !== "new" ? state.resellers.find(item => item.id === state.editingResellerId) : null;
  const password = data.get("password").trim();
  const reseller = { id: existing?.id || `reseller-${Date.now()}`, name: data.get("name").trim(), username: data.get("username").trim(), password: password || existing?.password || "", commission: data.get("commission").trim() || "0", active: data.get("active") === "true" };
  const duplicate = state.resellers.some(item => item.username.toLowerCase() === reseller.username.toLowerCase() && item.id !== reseller.id);
  if (duplicate) { showToast("That username is already in use", "error"); return; }
  if (existing) state.resellers = state.resellers.map(item => item.id === existing.id ? reseller : item); else state.resellers.push(reseller);
  persist(); state.editingResellerId = null; state.portalPanel = "resellers"; renderPortal(); showToast(existing ? "Reseller updated" : "Reseller access created");
}

// Page events are delegated so dashboard sections can re-render without re-binding every control.
document.addEventListener("click", event => {
  const openPortal = event.target.closest("[data-open-portal]");
  if (openPortal) { event.preventDefault(); openLogin("reseller"); return; }
  const productButton = event.target.closest("[data-product-id]");
  if (productButton && !event.target.closest("a[href^=\"https://wa.me\"]")) { event.preventDefault(); openProduct(productButton.dataset.productId); return; }
  const category = event.target.closest("[data-category]");
  if (category) { state.filter = category.dataset.category; renderCategories(); renderProducts(); return; }
  if (event.target.closest("[data-clear-filters]")) { state.filter = "All"; state.search = ""; document.getElementById("searchInput").value = ""; renderCategories(); renderProducts(); return; }
  const tab = event.target.closest("[data-login-mode]");
  if (tab) { state.loginMode = tab.dataset.loginMode; updateLoginMode(); return; }
  if (event.target.closest("[data-toggle-password]")) { const input = document.getElementById("loginPassword"); input.type = input.type === "password" ? "text" : "password"; event.target.textContent = input.type === "password" ? "Show" : "Hide"; return; }
  if (event.target.closest("[data-close-dialog]")) { closeDialog(event.target.closest("dialog")); return; }
  if (event.target.closest("[data-storefront], [data-portal-home]")) { event.preventDefault(); exitPortal(); return; }
  if (event.target.closest("[data-logout]")) { exitPortal(); showToast("You’ve been logged out"); return; }
  const panelButton = event.target.closest("[data-portal-panel]");
  if (panelButton) { state.portalPanel = panelButton.dataset.portalPanel; state.editingProductId = null; state.editingResellerId = null; renderPortal(); return; }
  if (event.target.closest("[data-add-product]")) { state.editingProductId = "new"; state.portalPanel = "product-form"; renderPortal(); return; }
  const editProduct = event.target.closest("[data-edit-product]");
  if (editProduct) { state.editingProductId = editProduct.dataset.editProduct; state.portalPanel = "product-form"; renderPortal(); return; }
  const deleteProduct = event.target.closest("[data-delete-product]");
  if (deleteProduct) { const product = state.products.find(item => item.id === deleteProduct.dataset.deleteProduct); if (product && window.confirm(`Delete ${product.name}?`)) { state.products = state.products.filter(item => item.id !== product.id); persist(); renderPortal(); renderCategories(); renderProducts(); showToast("Product removed"); } return; }
  if (event.target.closest("[data-cancel-form]")) { state.editingProductId = null; state.editingResellerId = null; state.portalPanel = state.portalRole === "admin" ? (state.portalPanel === "reseller-form" ? "resellers" : "products") : "catalogue"; renderPortal(); return; }
  if (event.target.closest("[data-add-reseller]")) { state.editingResellerId = "new"; state.portalPanel = "reseller-form"; renderPortal(); return; }
  const editReseller = event.target.closest("[data-edit-reseller]");
  if (editReseller) { state.editingResellerId = editReseller.dataset.editReseller; state.portalPanel = "reseller-form"; renderPortal(); return; }
  const deleteReseller = event.target.closest("[data-delete-reseller]");
  if (deleteReseller) { const reseller = state.resellers.find(item => item.id === deleteReseller.dataset.deleteReseller); if (reseller && window.confirm(`Delete access for ${reseller.name}?`)) { state.resellers = state.resellers.filter(item => item.id !== reseller.id); persist(); renderPortal(); showToast("Reseller access removed"); } return; }
});

document.addEventListener("input", event => {
  if (event.target.id === "searchInput") { state.search = event.target.value; renderProducts(); }
});
document.addEventListener("submit", event => {
  if (event.target.id === "loginForm") {
    event.preventDefault();
    const mode = document.getElementById("loginMode").value;
    const identity = document.getElementById("loginIdentity").value.trim();
    const password = document.getElementById("loginPassword").value;
    const error = document.getElementById("loginError");
    if (mode === "admin" && identity.toLowerCase() === "admin" && password === ADMIN_PASSWORD) { enterPortal("admin", { name: "Administrator", username: "admin" }); return; }
    const reseller = state.resellers.find(item => item.active !== false && item.username.toLowerCase() === identity.toLowerCase() && item.password === password);
    if (mode === "reseller" && reseller) { enterPortal("reseller", reseller); return; }
    error.textContent = mode === "admin" ? "That admin username or password is not correct." : "We couldn’t find an active partner with those details.";
    error.hidden = false;
    return;
  }
  if (event.target.id === "productForm") { event.preventDefault(); saveProduct(event.target); return; }
  if (event.target.id === "resellerForm") { event.preventDefault(); saveReseller(event.target); }
});

document.addEventListener("keydown", event => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) && !document.querySelector("dialog[open]")) { event.preventDefault(); document.getElementById("searchInput")?.focus(); }
  if (event.key === "Escape") document.querySelectorAll("dialog[open]").forEach(closeDialog);
});

// Mobile nav and initial render.
const menuToggle = document.querySelector(".menu-toggle");
menuToggle?.addEventListener("click", () => { const menu = document.querySelector(".mobile-menu"); const expanded = menuToggle.getAttribute("aria-expanded") === "true"; menuToggle.setAttribute("aria-expanded", String(!expanded)); menu.hidden = expanded; });
document.querySelectorAll(".mobile-menu a").forEach(link => link.addEventListener("click", () => { document.querySelector(".mobile-menu").hidden = true; menuToggle.setAttribute("aria-expanded", "false"); }));
document.getElementById("year").textContent = new Date().getFullYear();
renderCategories();
renderProducts();
