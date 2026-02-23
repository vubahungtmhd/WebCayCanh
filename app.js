/* ============================================================
   1. DỮ LIỆU DATABASE
   ============================================================ */
let realProducts = [];
// Lấy giỏ hàng từ trình duyệt nếu có, nếu không thì để mảng rỗng
let cart = JSON.parse(localStorage.getItem('myCart')) || [];
// Hàm lấy dữ liệu từ Backend Java
async function fetchProductsFromBackend() {
    try {
        const response = await fetch('http://localhost:8080/api/products');
        realProducts = await response.json();
        console.log("Dữ liệu đã tải thành công:", realProducts);
    } catch (error) {
        console.error("Lỗi kết nối Backend:", error);
        // Có thể thêm dữ liệu dự phòng ở đây nếu muốn
    }
}
/* ============================================================
   2. CÁC HÀM TIỆN ÍCH (UTILITIES)
   ============================================================ */

function getPriceNumber(price) {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
        return parseInt(price.replace(/\./g, '').replace('đ', '')) || 0;
    }
    return 0;
}

function formatPrice(num) {
    return num.toLocaleString('vi-VN') + "đ";
}

// Lưu giỏ hàng vào trình duyệt để không bị mất khi F5
function saveCart() {
    localStorage.setItem('myCart', JSON.stringify(cart));
}

/* ============================================================
   3. CÁC HÀM XỬ LÝ GIỎ HÀNG (LOGIC)
   ============================================================ */
function renderCartPage() {
    const cartContainer = document.getElementById('cart-content');
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <p style="font-size: 18px; color: #666;">Giỏ hàng của bạn đang trống.</p>
                <button onclick="navigateTo('home')" style="padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">Mua sắm ngay</button>
            </div>`;
        return;
    }

    let totalAll = 0;
    let html = `<table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">`;

    cart.forEach((item, index) => {
        const price = getPriceNumber(item.price);
        const qty = item.quantity || 1;
        const subTotal = price * qty;
        totalAll += subTotal;

        html += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;"><img src="images/${item.img}" width="60" height="60" style="object-fit: cover; border-radius: 5px;"></td>
                <td style="padding: 10px;"><strong>${item.name}</strong><br><small>${formatPrice(price)}</small></td>
                <td style="padding: 10px;">
                    <button onclick="changeQuantity(${index}, -1)" style="width:25px;">-</button>
                    <span style="margin: 0 8px;">${qty}</span>
                    <button onclick="changeQuantity(${index}, 1)" style="width:25px;">+</button>
                </td>
                <td style="padding: 10px; text-align: right;">${formatPrice(subTotal)}</td>
                <td style="padding: 10px; text-align: center;">
                    <button onclick="removeFromCart(${index})" style="color: red; border: none; background: transparent; cursor: pointer;">Xóa</button>
                </td>
            </tr>`;
    });

    html += `</table>`;
    html += `
        <div style="text-align: right; padding: 20px; background: #fefefe; border: 1px dashed #ccc;">
            <h3 style="margin: 0;">Tổng cộng: <span style="color: #e74c3c;">${formatPrice(totalAll)}</span></h3>
            <button onclick="document.getElementById('checkout-section').style.display='block'; window.scrollTo(0, document.body.scrollHeight);" 
                    style="margin-top: 15px; background: #2980b9; color: white; border: none; padding: 12px 30px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                THANH TOÁN NGAY
            </button>
        </div>`;

    cartContainer.innerHTML = html;
}

function addToCart(productId) {
    const product = realProducts.find(p => p.id == productId);
    if (product) {
        // Tìm xem sản phẩm đã có trong giỏ chưa
        const existingItem = cart.find(item => item.id == productId);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            // Thêm mới và đặt số lượng là 1
            cart.push({
                ...product,
                quantity: 1
            });
        }

        saveCart();
        updateCartBadge();
        alert(`Đã thêm ${product.name} vào giỏ!`);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart(); // Cập nhật lại bộ nhớ
    updateCartBadge();
    renderCartPage(); // Vẽ lại trang giỏ hàng
}

function changeQuantity(index, delta) {
    // 1. Thay đổi số lượng
    if (!cart[index].quantity) cart[index].quantity = 1;
    cart[index].quantity += delta;

    // 2. Nếu số lượng < 1, hỏi người dùng có muốn xóa không
    if (cart[index].quantity < 1) {
        const confirmDelete = confirm("Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?");
        if (confirmDelete) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = 1; // Giữ lại mức tối thiểu là 1
        }
    }

    // 3. Lưu lại và vẽ lại giao diện
    saveCart();
    updateCartBadge();
    renderCartPage();
}

function updateCartBadge() {
    const cartNumberElement = document.getElementById('cart-number');
    if (cartNumberElement) {
        cartNumberElement.innerText = cart.length;
        // Hiệu ứng nháy đỏ khi có thay đổi
        cartNumberElement.style.color = "red";
        cartNumberElement.style.fontWeight = "bold";
        setTimeout(() => {
            cartNumberElement.style.color = "";
        }, 500);
    }
}

/* ============================================================
   4. CÁC HÀM HIỂN THỊ GIAO DIỆN (RENDERING)
   ============================================================ */
function renderProducts(filterCategory = 'all', customList = null) {
    const container = document.getElementById('product-container');
    if (!container) return;

    // Ưu tiên dùng customList nếu có (dành cho tìm kiếm), nếu không thì mới lọc theo category
    let productsToShow = customList ? customList :
        (filterCategory === 'all' ? realProducts : realProducts.filter(p => p.category === filterCategory));

    let html = "";
    if (productsToShow.length === 0) {
        html = "<p style='padding:20px;'>Không tìm thấy sản phẩm nào phù hợp...</p>";
    } else {
        productsToShow.forEach(product => {
            const imagePath = `images/${product.img}`;
            const displayPrice = formatPrice(getPriceNumber(product.price));

            html += `
    <div class="product-card">
        <div class="product-img" onclick="viewDetail(${product.id})" style="cursor:pointer">
            <img src="${imagePath}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200'">
        </div>
        
        <div class="product-info">
            <h3 onclick="viewDetail(${product.id})" style="cursor:pointer">${product.name}</h3>
            
            <span class="price">${displayPrice}</span>
            
            <button class="btn-add" onclick="addToCart(${product.id})">Thêm vào giỏ</button>
        </div>
    </div>`;
        });
    }
    container.innerHTML = html;
}
/* ============================================================
   5. BỘ MÁY ĐIỀU HƯỚNG & KHỞI CHẠY
   ============================================================ */

async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        updateCartBadge(); // Cập nhật số ngay khi header hiện ra
    } catch (error) {
        console.error("Lỗi tải component:", error);
    }
}

async function navigateTo(pageName) {
    const viewport = document.getElementById('app-viewport');

    // Gom tất cả danh mục sản phẩm vào đây
    const productCategories = ['phong-thuy', 'trong-nha', 'de-ban', 'van-phong', 'loai-to', 'sen-da', 'thuy-sinh', 'xuong-rong', 'cong-trinh'];

    // Kiểm tra loại trang
    const isProductCat = productCategories.includes(pageName);
    const isBlogCat = pageName.startsWith('blog-');
    const isPolicyCat = pageName.startsWith('cs-')
    const isHomePage = (pageName === 'home');
    // --- BƯỚC QUAN TRỌNG NHẤT: ĐIỀU KHIỂN SIDEBAR ---
    if (isHomePage) {
        document.body.classList.add('is-home'); // Hiện sidebar
    } else {
        document.body.classList.remove('is-home'); // Ẩn sidebar
    }
    try {
        // XÁC ĐỊNH FILE HTML CẦN TẢI
        let fileToFetch = pageName;
        if (isProductCat) fileToFetch = 'home';
        if (isBlogCat) fileToFetch = 'blog-template';
        if (isPolicyCat) fileToFetch = 'policy-template';
        const response = await fetch(`pages/${fileToFetch}.html`);
        const html = await response.text();
        viewport.innerHTML = html;

        requestAnimationFrame(() => {
            const banner = document.getElementById('home-banner');
            const newsletter = document.querySelector('.newsletter');
            const title = document.getElementById('category-title');

            // Ẩn hiện banner/newsletter (Chỉ hiện ở Trang Chủ)
            if (banner) banner.style.display = isHomePage ? 'block' : 'none';
            if (newsletter) newsletter.style.display = isHomePage ? 'block' : 'none';

            // XỬ LÝ LOGIC RIÊNG CHO TỪNG LOẠI TRANG
            if (isProductCat || isHomePage) {
                if (isProductCat) {
                    const dict = {
                        'phong-thuy': 'CÂY CẢNH PHONG THỦY',
                        'trong-nha': 'CÂY CẢNH TRONG NHÀ',
                        'de-ban': 'CÂY CẢNH ĐỂ BÀN',
                        'van-phong': 'CÂY CẢNH VĂN PHÒNG',
                        'loai-to': 'CÂY CẢNH LOẠI TO',
                        'sen-da': 'CÂY CẢNH SEN ĐÁ',
                        'thuy-sinh': 'CÂY THỦY SINH',
                        'xuong-rong': 'XƯƠNG RỒNG CẢNH',
                        'cong-trinh': 'CÂY CÔNG TRÌNH'
                    };
                    if (title) title.innerText = dict[pageName] || "DANH MỤC: " + pageName.toUpperCase();
                    renderProducts(pageName);
                } else {
                    if (title) title.innerText = "SẢN PHẨM MỚI";
                    renderProducts('all');
                }
            } else if (isBlogCat) {
                renderBlogDetail(pageName);
            } else if (isPolicyCat) {
                renderPolicyDetail(pageName);
            } else if (pageName === 'cart') {
                setTimeout(renderCartPage(), 100);
            } else if (pageName === 'product-detail') {
                renderProductDetail(window.currentProductId);
            }
        });

        window.scrollTo(0, 0);
    } catch (error) {
        viewport.innerHTML = "<h2>Trang đang cập nhật...</h2>";
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Tải Header/Footer
    loadComponent('main-header', 'components/header-component.html');
    loadComponent('main-footer', 'components/footer-component.html');

    // 2. QUAN TRỌNG: Đợi lấy dữ liệu từ Java xong mới chạy tiếp
    await fetchProductsFromBackend();

    // 3. Hiển thị trang chủ
    navigateTo('home');

    // 4. Lắng nghe click điều hướng
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-link]');
        if (target) {
            e.preventDefault();
            navigateTo(target.getAttribute('data-link'));
        }
    });
});


/* ============================================================
   XỬ LÝ TÌM KIẾM (FIX LỖI KHÔNG CHẠY)
   ============================================================ */

// 1. Lắng nghe sự kiện Submit của Form
document.addEventListener('submit', function (e) {
    // Kiểm tra xem có đúng là form tìm kiếm không dựa vào ID
    if (e.target && e.target.id === 'search-form') {
        e.preventDefault(); // CHẶN trang web bị load lại (quan trọng nhất)

        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        const keyword = searchInput.value.trim().toLowerCase();

        if (keyword === "") {
            alert("Vui lòng nhập tên cây bạn muốn tìm!");
            return;
        }

        // Gọi hàm thực hiện tìm kiếm
        performSearch(keyword);
    }
});

// 2. Hàm thực hiện tìm kiếm và hiển thị

async function performSearch(keyword) {
    await navigateTo('home'); // Quay về trang chủ để có container

    const results = realProducts.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.category.toLowerCase().includes(keyword)
    );

    requestAnimationFrame(() => {
        const title = document.getElementById('category-title');
        const banner = document.getElementById('home-banner');
        if (banner) banner.style.display = 'none';
        if (title) title.innerText = `KẾT QUẢ TÌM KIẾM: "${keyword.toUpperCase()}"`;

        // Gọi lại hàm render với danh sách kết quả
        renderProducts(null, results);
    });
}

/* ============================================================
   XỬ LÝ ĐẶT HÀNG (CHECKOUT LOGIC)
   ============================================================ */

document.addEventListener('submit', (e) => {
    if (e.target.id === 'checkout-form') {
        e.preventDefault();

        const name = document.getElementById('cus-name').value;
        const phone = document.getElementById('cus-phone').value;
        const address = document.getElementById('cus-address').value;

        if (cart.length === 0) {
            alert("Giỏ hàng của bạn đang trống!");
            return;
        }

        // Tạo nội dung đơn hàng để thông báo
        let orderDetail = cart.map(item => `- ${item.name} (${item.quantity || 1} cây)`).join('\n');

        const confirmMsg = `Cảm ơn anh/chị ${name}!\n\n` +
            `Đơn hàng của bạn gồm:\n${orderDetail}\n\n` +
            `Shop sẽ liên hệ qua SĐT ${phone} để giao đến địa chỉ: ${address}.`;

        alert(confirmMsg);

        // Xóa giỏ hàng sau khi đặt thành công
        cart = [];
        saveCart();
        updateCartBadge();
        navigateTo('home'); // Đưa khách về trang chủ
    }
});

//Hàm chứa nội dung các mục hướng dẫn chăm sóc
function renderBlogDetail(blogId) {
    const blogData = {
        'blog-van-phong': {
            title: "Cách chăm sóc cây văn phòng",
            content: "Cây văn phòng cần ít nước, nhưng cần được lau lá thường xuyên để quang hợp tốt..."
        },
        'blog-thuy-sinh': {
            title: "Chăm sóc cây thủy sinh đúng cách",
            content: "Nên thay nước 1 lần/tuần và rửa sạch rễ cây để tránh bị thối..."
        },
        'blog-sen-da': {
            title: "Bí kíp trồng sen đá không bị úng",
            content: "Đất trồng sen đá phải thoát nước cực nhanh, tưới nước vào sáng sớm hoặc chiều mát..."
        },
        'blog-dich-vu': {
            title: "Dịch vụ chăm sóc cây tại nhà",
            content: "Chúng tôi cung cấp gói chăm sóc cây định kỳ bao gồm tỉa cành, bón phân và diệt trừ sâu bệnh..."
        }
    };

    const data = blogData[blogId];
    if (data) {
        if (document.getElementById('blog-title')) document.getElementById('blog-title').innerText = data.title;
        if (document.getElementById('blog-content')) document.getElementById('blog-content').innerHTML = data.content;
    }
}


//Hàm chứa nội dung phần chính sách
function renderPolicyDetail(policyId) {
    const policyData = {
        'cs-bao-hanh': {
            title: "CHÍNH SÁCH BẢO HÀNH CÂY CẢNH",
            content: `
        <p>Để đảm bảo quý khách hoàn toàn yên tâm khi mang sắc xanh về không gian sống, <strong>Cây Cảnh Nam Thanh Miện</strong> áp dụng chế độ bảo hành như sau:</p>
        <ul style="margin-top: 15px;">
            <li><strong>Bảo hành 1 đổi 1:</strong> Trong vòng 7 ngày đầu tiên nếu cây có hiện tượng héo, chết hoặc úng do lỗi kỹ thuật từ vườn.</li>
            <li><strong>Hỗ trợ trọn đời:</strong> Tư vấn miễn phí cách chăm sóc, bón phân và xử lý sâu bệnh thông qua Hotline/Zalo ngay cả sau thời gian bảo hành.</li>
            <li><strong>Điều kiện bảo hành:</strong> Quý khách vui lòng cung cấp ảnh chụp/video tình trạng cây và đảm bảo cây được đặt ở vị trí có ánh sáng, tưới nước theo đúng hướng dẫn của shop.</li>
            <li><strong>Lưu ý:</strong> Chúng tôi không nhận bảo hành đối với các trường hợp cây chết do tác động ngoại lực (va đập, thú cưng phá) hoặc bỏ bê không tưới nước quá lâu.</li>
        </ul>
        <p style="margin-top: 20px; font-style: italic; color: #555;">* Chúng tôi cam kết mang đến những gốc cây khỏe mạnh nhất để đồng hành cùng bạn!</p>
    `
        },
        'cs-doi-tra': {
            title: "CHÍNH SÁCH ĐỔI TRẢ",
            content: `<p>Nhằm đảm bảo quyền lợi, quý khách vui lòng kiểm tra cây trước khi nhận.</p>
            <ul>
                <li>Đổi trả miễn phí trong 24h nếu cây bị dập nát do vận chuyển.</li>
                <li>Không áp dụng đổi trả với các trường hợp cây héo do chăm sóc sai cách sau khi nhận.</li>
            </ul>`
        },
        'cs-giao-hang': {
            title: "CHÍNH SÁCH GIAO HÀNG",
            content: `<p>Shop giao hàng toàn quốc với phí ship ưu đãi:</p>
            <ul>
                <li>Nội thành Hải Phòng: Giao trong ngày, phí 20k-30k.</li>
                <li>Các tỉnh khác: Giao từ 2-4 ngày tùy khu vực.</li>
                <li>Miễn phí vận chuyển cho đơn hàng trên 500.000đ.</li>
            </ul>`
        },
        'cs-bao-mat': {
            title: "CHÍNH SÁCH BẢO MẬT",
            content: "<p>Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của khách hàng (SĐT, Địa chỉ) và chỉ sử dụng cho mục đích giao hàng.</p>"
        }
    };

    const data = policyData[policyId];
    if (data) {
        document.getElementById('policy-title').innerText = data.title;
        document.getElementById('policy-content').innerHTML = data.content;
    }
}

/* ============================================================
   XỬ LÝ TRANG CHI TIẾT SẢN PHẨM
   ============================================================ */

function renderProductDetail(productId) {
    // 1. Tìm cây trong danh sách realProducts dựa trên ID
    const product = realProducts.find(p => p.id == productId);

    if (!product) {
        document.getElementById('app-viewport').innerHTML = "<h2>Không tìm thấy sản phẩm!</h2>";
        return;
    }

    // 2. Chờ một chút để HTML kịp load rồi đổ dữ liệu vào
    setTimeout(() => {
        const desc = document.getElementById('detail-desc');

        // Đổ dữ liệu mô tả từ Java gửi về vào đây
        if (desc) {
            // Biến các dấu xuống dòng \n thành thẻ <br> trong HTML
            desc.innerHTML = (product.description || "Đang cập nhật...").replace(/\n/g, '<br>');
        }
        const img = document.getElementById('detail-img');
        const name = document.getElementById('detail-name');
        const price = document.getElementById('detail-price');
        const category = document.getElementById('detail-category');
        const btnAdd = document.getElementById('btn-add-detail');
        if (img) img.src = `images/${product.img}`;
        if (name) name.innerText = product.name;
        if (price) price.innerText = formatPrice(getPriceNumber(product.price));
        if (category) category.innerText = "Danh mục: " + product.category;

        // Gán sự kiện click cho nút thêm vào giỏ ngay tại đây
        if (btnAdd) {
            btnAdd.onclick = () => addToCart(product.id);
        }
    }, 50);
}

function viewDetail(productId) {
    // Bước A: Lưu cái ID cây khách vừa bấm vào một "biến toàn cục" để dùng sau
    window.currentProductId = productId;

    // Bước B: Gọi hàm điều hướng sang trang chi tiết mà bạn đã có sẵn
    navigateTo('product-detail');
}