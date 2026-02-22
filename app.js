/* ============================================================
   1. DỮ LIỆU GIẢ LẬP (DATABASE MOCKUP)
   ============================================================ */
const fakeProducts = [
    // 1. Cây Phong Thủy
    {
        id: 1,
        name: "Cây Kim Tiền",
        price: "200.000đ",
        img: "images/kim-tien.jpg",
        category: "phong-thuy"
    },

    // 2. Cây Trong Nhà
    {
        id: 4,
        name: "Cây Lan Ý",
        price: "130.000đ",
        img: "images/lan-y.jpg",
        category: "trong-nha"
    },

    // 3. Cây Để Bàn
    {
        id: 6,
        name: "Cây May Mắn",
        price: "85.000đ",
        img: "images/may-man.jpg",
        category: "de-ban"
    },


    // 4. Cây Văn Phòng
    {
        id: 8,
        name: "Cây Hạnh Phúc",
        price: "320.000đ",
        img: "images/cay-hanh-phuc.jpg",
        category: "van-phong"
    },

    // 5. Cây Loại To
    {
        id: 10,
        name: "Cây Bàng Singapore",
        price: "550.000đ",
        img: "images/bang-sin.jpg",
        category: "loai-to"
    },

    // 6. Sen Đá
    {
        id: 12,
        name: "Sen Đá Nâu",
        price: "45.000đ",
        img: "images/sen-da-nau.jpg",
        category: "sen-da"
    },


    // 7. Thủy Sinh
    {
        id: 14,
        name: "Cây Phú Quý Thủy Sinh",
        price: "140.000đ",
        img: "images/phu-quy.jpg",
        category: "thuy-sinh"
    },


    // 8. Xương Rồng
    {
        id: 16,
        name: "Xương Rồng Trứng Chim",
        price: "65.000đ",
        img: "images/xr-trung-chim.jpg",
        category: "xuong-rong"
    },


    // 9. Cây Công Trình
    {
        id: 19,
        name: "Cây Osaka Vàng",
        price: "1.200.000đ",
        img: "images/osaka.jpg",
        category: "cong-trinh"
    }
];

// Lấy giỏ hàng từ trình duyệt nếu có, nếu không thì để mảng rỗng
let cart = JSON.parse(localStorage.getItem('myCart')) || [];

/* ============================================================
   2. CÁC HÀM TIỆN ÍCH (UTILITIES)
   ============================================================ */

function priceToNumber(priceStr) {
    return parseInt(priceStr.replace(/\./g, '').replace('đ', '')) || 0;
}

function numberToPrice(num) {
    return num.toLocaleString('vi-VN') + "đ";
}

// Lưu giỏ hàng vào trình duyệt để không bị mất khi F5
function saveCart() {
    localStorage.setItem('myCart', JSON.stringify(cart));
}

/* ============================================================
   3. CÁC HÀM XỬ LÝ GIỎ HÀNG (LOGIC)
   ============================================================ */

function addToCart(productId) {
    const product = fakeProducts.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        saveCart(); // Lưu vào máy
        updateCartBadge(); // Cập nhật số trên header
        alert(`Đã thêm ${product.name} vào giỏ!`);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart(); // Cập nhật lại bộ nhớ
    updateCartBadge();
    renderCartPage(); // Vẽ lại trang giỏ hàng
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

function renderProducts(filterCategory = 'all') {
    const container = document.getElementById('product-container');
    if (!container) return;

    const productsToShow = filterCategory === 'all' ?
        fakeProducts :
        fakeProducts.filter(p => p.category === filterCategory);

    let html = "";
    if (productsToShow.length === 0) {
        html = "<p style='padding:20px;'>Chưa có sản phẩm nào trong mục này.</p>";
    } else {
        productsToShow.forEach(product => {
            html += `
                <div class="product-card">
                    <div class="product-img">
                        <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200'">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <span class="price">${product.price}</span>
                        <button class="btn-add" onclick="addToCart(${product.id})">Thêm vào giỏ</button>
                    </div>
                </div>`;
        });
    }
    container.innerHTML = html;
}

function renderCartPage() {
    const cartContainer = document.getElementById('cart-content');
    const totalPriceDisplay = document.getElementById('total-price-display');
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<div style='padding:20px;'><h3>Giỏ hàng đang trống.</h3></div>";
        if (totalPriceDisplay) totalPriceDisplay.innerText = "Tổng tiền: 0đ";
        return;
    }

    let totalMoney = 0;
    let html = `<table class="cart-table" style="width:100%; border-collapse: collapse; margin-top:20px;">
                <thead>
                    <tr style="border-bottom: 2px solid #27ae60; background: #f9f9f9;">
                        <th style="text-align:left; padding: 15px;">Sản phẩm</th>
                        <th>Giá</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>`;

    cart.forEach((item, index) => {
        totalMoney += priceToNumber(item.price);
        html += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; display: flex; align-items: center; gap: 15px;">
                    <img src="${item.img}" width="60" onerror="this.src='https://via.placeholder.com/60'">
                    <span style="font-weight:bold;">${item.name}</span>
                </td>
                <td style="text-align: center;">${item.price}</td>
                <td style="text-align: center;">
                    <button onclick="removeFromCart(${index})" class="btn-delete" style="color:red; cursor:pointer;">Xóa</button>
                </td>
            </tr>`;
    });

    html += `</tbody></table>`;
    cartContainer.innerHTML = html;

    if (totalPriceDisplay) {
        totalPriceDisplay.innerText = "Tổng tiền: " + numberToPrice(totalMoney);
    }
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
    const categories = ['phong-thuy', 'trong-nha', 'de-ban', 'van-phong', 'loai-to', 'sen-da', 'thuy-sinh', 'xuong-rong', 'cong-trinh'];

    try {
        const isCategory = categories.includes(pageName);
        const fileToFetch = isCategory ? 'home' : pageName;

        const response = await fetch(`pages/${fileToFetch}.html`);
        const html = await response.text();
        viewport.innerHTML = html;

        if (isCategory || pageName === 'home') {
            requestAnimationFrame(() => {
                const banner = document.getElementById('home-banner');
                const title = document.getElementById('category-title');
                const newsletter = document.querySelector('.newsletter'); // Lấy phần đăng ký email

                if (isCategory) {
                    // 1. Ẩn Banner và Newsletter khi xem danh mục
                    if (banner) banner.style.display = 'none';
                    if (newsletter) newsletter.style.display = 'none';

                    // 2. Đổi tiêu đề dựa trên danh mục
                    // const categories = ['phong-thuy', 'trong-nha', 'de-ban', 'van-phong', 'loai-to', 'sen-da', 'thuy-sinh', 'xuong-rong', 'cong-trinh'];
                    if (title) {
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
                        title.innerText = dict[pageName] || "DANH MỤC: " + pageName.toUpperCase();
                    }
                    renderProducts(pageName);
                } else {
                    // 3. Hiện lại mọi thứ khi về Trang Chủ
                    if (banner) banner.style.display = 'block';
                    if (newsletter) newsletter.style.display = 'block';
                    if (title) title.innerText = "SẢN PHẨM MỚI";
                    renderProducts('all');
                }
            });
        } else if (pageName === 'cart') {
            renderCartPage();
        }

        window.scrollTo(0, 0);
    } catch (error) {
        viewport.innerHTML = "<h2>Trang đang cập nhật...</h2>";
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('main-header', 'components/header-component.html');
    loadComponent('main-footer', 'components/footer-component.html');
    navigateTo('home');

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
    // Bước A: Chuyển về trang chủ để lấy khung hiển thị (id="product-container")
    // Dùng await để đợi trang chủ nạp xong hoàn toàn rồi mới lọc
    await navigateTo('home');

    // Bước B: Lọc sản phẩm từ mảng fakeProducts
    const results = fakeProducts.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.category.toLowerCase().includes(keyword)
    );

    // Bước C: Chờ một nhịp nhỏ để DOM ổn định rồi vẽ kết quả
    requestAnimationFrame(() => {
        const container = document.getElementById('product-container');
        const title = document.getElementById('category-title');
        const banner = document.getElementById('home-banner');
        const newsletter = document.querySelector('.newsletter');

        // Ẩn các thành phần thừa để tập trung vào kết quả tìm kiếm
        if (banner) banner.style.display = 'none';
        if (newsletter) newsletter.style.display = 'none';

        if (title) {
            title.innerText = `KẾT QUẢ TÌM KIẾM: "${keyword.toUpperCase()}"`;
        }

        if (results.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <p>Rất tiếc, shop chưa có cây "${keyword}". Bạn thử tìm từ khác nhé!</p>
                </div>`;
        } else {
            // Vẽ danh sách sản phẩm tìm được
            let html = "";
            results.forEach(product => {
                html += `
                    <div class="product-card">
                        <div class="product-img">
                            <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200'">
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <span class="price">${product.price}</span>
                            <button class="btn-add" onclick="addToCart(${product.id})">Thêm vào giỏ</button>
                        </div>
                    </div>`;
            });
            container.innerHTML = html;
        }
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