let productData = [];
let cartListData = [];

//初始化功能
function init() {
    getProductList();
    getCartList();
};
init();

//前台
//get商品列表
function getProductList() {
    axios.get(`${url}products`)
        .then((res) => {
            productData = res.data.products;
            //抓到資料後執行初始化渲染
            renderProductList();
        })
        .catch((error) => {
            console.log(error.res.data);
        })

};

//get購物車狀態
function getCartList() {
    axios.get(`${url}carts`)
        .then((res) => {
            document.querySelector('.js-total').textContent = numberComma(res.data.finalTotal);
            cartListData = res.data.carts;
            renderCartList();
        })
        .catch((error) => {
            console.log(error.res.data);
        })
};

//post購物車
function addCartItem(addCartId, cartNum) {
    axios.post(`${url}carts`, {
        data: {
            "productId": addCartId,
            "quantity": cartNum
        }
    })
        .then((res) => {
            alert('已加入購物車！');
            getCartList();
        })
        .catch((error) => {
            console.log(error.res.data);
        })
};

//delete單筆購物車
function deleteCartItem(cartID) {
    axios.delete(`${url}carts/${cartID}`)
        .then((res) => {
            alert('已刪除此購物車');
            getCartList();
        })
        .catch((error) => {
            console.log(error.res.data);
        })
};

//delete整筆購物車
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function (e) {
    axios.delete(`${url}carts`)
        .then((res) => {
            alert('已刪除所有購物車內的商品');
            getCartList();
        })
        .catch((error) => {
            alert('購物車已清空');
        })
});

//post訂單
function createOrder(customerName, customerPhone, customerEmail, customerAddress, tradeWay) {
    axios.post(`${url}orders`,
        {
            "data": {
                "user": {
                    "name": customerName,
                    "tel": customerPhone,
                    "email": customerEmail,
                    "address": customerAddress,
                    "payment": tradeWay
                }
            }
        }
    ).
        then((res) => {
            getCartList();
            alert('訂單已送出');
        })
        .catch((err) => {
            console.log(err.res.data);
        })
}


const productWrap = document.querySelector('.productWrap');
//return渲染函式
function groupString(item) {
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" data-id = ${item.id}>加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${numberComma(item.origin_price)}</del>
    <p class="nowPrice">NT$${numberComma(item.price)}</p>
    </li>`;
};

//渲染商品列表
function renderProductList() {
    let str = '';
    productData.forEach((item) => {
        str += groupString(item);
    })
    productWrap.innerHTML = str;
};

//渲染購物車
function renderCartList() {
    let str = '';
    cartListData.forEach((item) => {
        let cartPrice = numberComma(item.product.price);
        str +=
            `<tr>
        <td>
            <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT$${cartPrice}</td>
        <td>${item.quantity}</td>
        <td>NT$${numberComma(item.product.price * item.quantity)}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id="${item.id}">clear
            </a>
        </td>
    </tr>
    <tr>`;
    });

    const cartList = document.querySelector('.shoppingCart-tableList');
    cartList.innerHTML = str;
};


//篩選資料

const productSelect = document.querySelector('.productSelect');
productSelect.addEventListener('change', productListFilter);
//篩選函式
function productListFilter(e) {
    const value = e.target.value;
    if (value === '全部') {
        renderProductList();
        return;
    }
    let str = '';
    productData.forEach((item) => {
        if (item.category === value) {
            str += groupString(item);
        }
    });

    productWrap.innerHTML = str;
};


//加入購物車

productWrap.addEventListener('click', postCart);
function postCart(e) {
    e.preventDefault();
    let cartclass = e.target.getAttribute('class');
    if (cartclass !== 'js-addCart') {
        return;
    }

    let addCartId = e.target.getAttribute('data-id');
    let cartNum = 1;
    cartListData.forEach((item) => {
        if (item.product.id === addCartId) {
            cartNum = item.quantity += 1;
        }
    });
    addCartItem(addCartId, cartNum);
};

//刪除購物車

const shoppingCartTable = document.querySelector('.shoppingCart-table');

shoppingCartTable.addEventListener('click', deleteCart);
function deleteCart(e) {
    e.preventDefault();
    let cartclass = e.target.getAttribute('class');
    if (cartclass !== 'material-icons') {
        return;
    }

    let cartID = e.target.getAttribute('data-id');
    if (cartID === null) {
        return;
    }
    deleteCartItem(cartID);
};


//訂單送出驗證＆按鈕
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (cartListData.length === 0) {
        alert('你的購物車是空的');
    }
    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const tradeWay = document.querySelector('#tradeWay').value;
    const orderInfoMessage = document.querySelector('.orderInfo-message');
    const orderInfoForm = document.querySelector('.orderInfo-form');

    if (customerName === '' || customerPhone === '' || customerEmail === '' || customerAddress === '' || tradeWay === '') {
        alert('請輸入訂單資料');
        return;
    }
    createOrder(customerName, customerPhone, customerEmail, customerAddress, tradeWay);
    orderInfoForm.reset();
});


//js元件區
function numberComma(num) {
    let comma = /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g
    return num.toString().replace(comma, ',')
};


const form = document.querySelector('.orderInfo-form');

const inputs = document.querySelectorAll("input[name],select[data=payment]");


//驗證格式
const constraints = {
    '姓名': {
        presence: {
            message: '必填'
        }
    },
    '手機號碼': {
        presence: { 
            message: '必填' 
        },
            format: {
                pattern: '^09\\d{8}$',
                message: '格式有誤,請輸入手機10碼',
            }
    },
    'Email': {
        presence: {
            message: '必填'
        },
        email: { 
            message: '格式有誤，請輸入正確的Email' ,
        },
    },
    '寄送地址': {
        presence: {
            message: '必填'
        }
    },
    '交易方式': {
        presence: {
            message: '必填'
        }
    },
};

inputs.forEach((item) => {
    //監聽動作為'blur'
    item.addEventListener('blur', function () {
      //尋找同一層的下一個元素，將他改為空字串
      item.nextElementSibling.textContent = '';
      //設定一個變數將validate的errors存放在裡頭，綁定form標籤和驗證表單
      let errors = validate(form, constraints) || '';
        //若為空字串則跑下面的if判斷
      if (errors) {
        //此時的errors為物件格式，將其轉換為陣列跑迴圈
        Object.keys(errors).forEach(function (keys) {
        //綁定form標籤裡頭屬性有[data-message]的標籤
          document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
        })
      }
    });
  });
