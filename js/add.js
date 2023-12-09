let OrderData = [];

//初始化
function init() {
    getOrderList();
}
init();


//get訂單
function getOrderList() {
    axios.get(`${orderUrl}/orders`,
        {
            headers: {
                'Authorization': token
            }
        })
        .then((res) => {
            OrderData = res.data.orders;
            renderOrder();
            c3Chart();
        })
        .catch((error) => {
            console.log(error.res.data);
        })
}

//edit訂單狀態
function editOrderList(status,orderId) {
    let orderStatus;
    if(status==true){
        orderStatus = false;
    }else{
        orderStatus = true;
    }
    axios.put(`${orderUrl}/orders`,
        {
            "data": {
                "id": orderId,
                "paid": orderStatus
            }
        },
        {
            headers: {
                'Authorization': token
            }
        })
        .then((res) => {
            alert('訂單已處理');
            getOrderList();
        })
        .catch((error) => {
            console.log(error.res.data);
        })
};

//delete特定訂單
function deleteOrderItem(orderId) {
    axios.delete(`${orderUrl}/orders/${orderId}`,
        {
            headers: {
                'Authorization': token
            }
        })
        .then((res) => {
            getOrderList();
        })
        .catch((error) => {
            console.log(error.res.data);
        })
};

//delete全部訂單
function deleteAllOrder() {
    axios.delete(`${orderUrl}/orders`,
        {
            headers: {
                'Authorization': token
            }
        })
        .then((res) => {
            getOrderList();
            alert('已刪除所有訂單');
        })
        .catch((error) => {
            console.log(error.res.data);
        })
};

//渲染全部訂單
function renderOrder() {
    let str = '';
    let pieceStr = '';
    let paidStates = '';
    
    OrderData.forEach((item) => {
        item.products.forEach((piece) => {
            pieceStr += `<p>${piece.title}x${piece.quantity}</p>`
        });
        if (item.paid === true) {
            paidStates = '已處理';
        } else {
            paidStates = '未處理';
        }
        let timeDate = new Date(item.createdAt*1000);
        let orderDate = `${timeDate.getFullYear()}/${timeDate.getMonth()}/${timeDate.getDate()}`;
        str +=
            `<tr>
                <td>${item.id}</td>
                <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>${pieceStr}</td>
                <td>${orderDate}</td>
                </td>
                <td class="orderStatus">
                    <a href="#" class="js-state" data-id="${item.id}" data-status="${item.paid}">${paidStates}</a>
                </td>
                <td>
                    <input type="button" class="delSingleOrder-Btn" data-id ="${item.id}"value="刪除">
                </td>
          </tr>`
    })
    const jsOrderList = document.querySelector('.js-orderList');
    jsOrderList.innerHTML = str;
};



//處理訂單、刪除單筆訂單
const orderPageTable = document.querySelector('.orderPage-table');

orderPageTable.addEventListener('click', function (e) {
    e.preventDefault();
    const orderClass = e.target.getAttribute('class');
    const orderId = e.target.getAttribute('data-id');
    const orderStatus = e.target.getAttribute('data-status');
    if (orderClass !== 'js-state' && orderClass !== 'delSingleOrder-Btn') {
        return;
    }
    //修改訂單資料
    if (orderClass === 'js-state') {
        editOrderList(orderStatus,orderId);
    };
    //刪除單筆功能
    if (orderClass === 'delSingleOrder-Btn') {
        deleteOrderItem(orderId);
        alert('訂單已刪除');
    }
});



//刪除所有訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault();
    deleteAllOrder();
});



// C3.js
function c3Chart(){
    let obj = {};
    let newData = [];
    OrderData.forEach((item)=>{
        item.products.forEach((piece)=>{
            //從data中篩出標題，建立一個物件為{標題:價錢}
          if(obj[piece.title] === undefined){
            obj[piece.title] = piece.price * piece.quantity;
            //若標題的值不是undefined的話再加上一筆
          }else{
            obj[piece.title] += piece.price * piece.quantity;
          }
        });
    
    newData = Object.entries(obj);
    //排出品項中總額由最高至低
    newData.sort(function(a,b){
        return b[1]-a[1];
    });
    
    if(newData.length >3){
        let otherTotal = 0;
        newData.forEach(function(item,index){
            if(index>2){
                otherTotal += newData[index][1];
            }
        })
        newData.splice(3,newData.length-1);
        newData.push(['其他',otherTotal]);
    }   

    });
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: newData,
        // colors:{
        //     "Louvre 雙人床架":"#DACBFF",
        //     "Antony 雙人床架":"#9D7FEA",
        //     "Anty 雙人床架": "#5434A7",
        //     "其他": "#301E5F",
        // }
    },
});
};





