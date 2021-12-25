"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
const gREQUEST_READYSTATE_FINISH_RESPONSE_READY = 4;
const gREQUEST_STATUS_OK = 200;
const gBASE_URL = "http://42.115.221.44:8080/devcamp-lucky-dice/";

let gUserPlayObj = {
    firstname: "",
    lastname: "",
    username: ""
}
/*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
$(document).ready(() => {
    // sự kiện click chơi xúc xắc
    $("#btn-dice").on("click", onBtnThrowDiceClick);

    // sự kiện click lấy lịch sử chơi xúc xắc
    $("#btn-dice-history").on("click", onBtnGetDiceHistoryClick);
});

/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
// hàm xử lý sự kiện click ném xúc xắc
const onBtnThrowDiceClick = () => {
    "use strict";
    //B1: thu thập dữ liệu
    getDataUserPlay(gUserPlayObj);
    //B2: validate dữ liệu
    let vIsValidateNewDice = checkValidateDataUserPlay(gUserPlayObj);
    if (vIsValidateNewDice) {
        let vXmlHttpNewDice = new XMLHttpRequest();
        //B3: gửi request server đổ xúc xắc
        sendRequestServerPlayThrowNewDice(gUserPlayObj, vXmlHttpNewDice);
        vXmlHttpNewDice.onreadystatechange = function () {
            //B4: xử lý response trên giao diện
            handleResponseGetNewDice(this);
        }
    }
}

// hàm xử lý sự kiện click lấy lịch sử đổ xúc xắc của người chơi
const onBtnGetDiceHistoryClick = () => {
    "use strict";
    //B1: thu thập dữ liệu
    getDataUserPlay(gUserPlayObj);
    //B2: validate dữ liệu
    let vIsValidateNewDice = checkValidateDataUserPlay(gUserPlayObj);
    if (vIsValidateNewDice) {
        let vXmlHttpDiceHistory = new XMLHttpRequest();
        //B3: gửi request server lấy lịch sử đổ xúc xắc
        sendRequestServerGetDiceHistory(gUserPlayObj, vXmlHttpDiceHistory);
        vXmlHttpDiceHistory.onreadystatechange = function () {
            handleResponseGetDiceHistory(this);
        }
    }
}


/*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
// hàm thu thập dữ liệu
const getDataUserPlay = (paramUserPlay) => {
    "use strict";
    paramUserPlay.firstname = $("#inp-first-name").val().trim();
    paramUserPlay.lastname = $("#inp-last-name").val().trim();
    paramUserPlay.username = $("#inp-user-name").val().trim();

}

// hàm check validate dữ liệu
const checkValidateDataUserPlay = (paramUserPlay) => {
    "use strict";
    if (paramUserPlay.username === "") {
        alert("Vui lòng nhập user name!");
        return false;
    }
    if (paramUserPlay.firstname === "") {
        alert("Vui lòng nhập tên!");
        return false;
    }
    if (paramUserPlay.lastname === "") {
        alert("Vui lòng nhập họ!");
        return false;
    }
    return true;
}

// hàm gửi request server đổ xúc xắc
const sendRequestServerPlayThrowNewDice = (paramUserPlay, paramXmlHttpNewDice) => {
    "use strict";
    paramXmlHttpNewDice.open("POST", gBASE_URL + "/dice", true);
    paramXmlHttpNewDice.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    paramXmlHttpNewDice.send(JSON.stringify(paramUserPlay));
}

// hàm gửi request server lấy lịch sử đổ xúc xắc
const sendRequestServerGetDiceHistory = (paramUserPlay, paramXmlHttpDiceHistory) => {
    paramXmlHttpDiceHistory.open("GET", gBASE_URL + "/dice-history?username=" + paramUserPlay.username, true);
    paramXmlHttpDiceHistory.send();
};

// hàm xử lý response xúc xắc mới
const handleResponseGetNewDice = (paramXmlHttpNewDice) => {
    "use strict";
    if (paramXmlHttpNewDice.readyState == gREQUEST_READYSTATE_FINISH_RESPONSE_READY && paramXmlHttpNewDice.status == gREQUEST_STATUS_OK) {
        console.log(paramXmlHttpNewDice.responseText);
        let vUserPlayObj = JSON.parse(paramXmlHttpNewDice.responseText);
        // hàm thay đổi hình ảnh xúc xắc theo response trả về
        changeImgDiceSameGetNumberDice(vUserPlayObj.dice);
        // hàm hiển thị thông báo đổ được số xúc xắc bao nhiêu
        showMessageCongratThrowNumberDice(vUserPlayObj.dice);
        // hàm hiển thị voucher và mã giảm giá nếu đổ xúc xắc trúng được
        showVoucherAndPercentDiscountByNumberDice(vUserPlayObj);
        // hàm hiển thị phần thưởng nếu người chơi trúng được
        showPrizeImgUserThrowDice(vUserPlayObj);
    }
}

// hàm xử lý response lịch sử đổ xúc xắc của người chơi trên giao diện (table)
const handleResponseGetDiceHistory = (paramXmlHttpDiceHistory) => {
    "use strict";
    if (paramXmlHttpDiceHistory.readyState == gREQUEST_READYSTATE_FINISH_RESPONSE_READY && paramXmlHttpDiceHistory.status == gREQUEST_STATUS_OK) {
        console.log(paramXmlHttpDiceHistory.responseText);
        let vDiceHistoryObj = JSON.parse(paramXmlHttpDiceHistory.responseText);

        // truy xuất phần tử tbody 
        let vTbody = $("#hisory-placeholder-table").children("tbody");
        let vTable = vTbody.length ? vTbody : $("#hisory-placeholder-table"); // kiểm tra nếu tbody có tồn tại hay không
        
        vTable.html(""); // reset nội dung 
        // thêm dòng tiêu đề
        vTable.append("<tr class='thead-dark'><th>Lượt </th><th>Dices </th></tr>");
      
        // duyệt mảng dữ liệu thêm nội dung vào tbody
        for(var bI = 0 ; bI < vDiceHistoryObj.dices.length; bI++) {
            // vTable.append("<tr><td>" + +(bI + 1) + "</td><td>" + vDiceHistoryObj.dices[bI] + "</td></tr>");
            vTable.append(
                `<tr>
                    <td> ${+(bI + 1)} </td>
                    <td> ${vDiceHistoryObj.dices[bI]}</td>
                </tr>`);
        }
    }
}

// hàm thay đổi ảnh xúc xắc tương ứng số xúc xắc đổ được
const changeImgDiceSameGetNumberDice = (paramNumberDice) => {
    "use strict";
    // truy xuất phần tử img
    let vImgNumberDiceElement = $("#img-dice");
    switch (paramNumberDice) {
        case 1:
            vImgNumberDiceElement.attr("src", "LuckyDiceImages/1.png");
            break;
        case 2:
            vImgNumberDiceElement.attr("src", "LuckyDiceImages/2.png");
            break;
        case 3:
            vImgNumberDiceElement.attr("src", "LuckyDiceImages/3.png");
            break;
        case 4:
            vImgNumberDiceElement.attr("src", "LuckyDiceImages/4.png");
            break;
        case 5:
            vImgNumberDiceElement.attr("src", "LuckyDiceImages/5.png");
            break;
        case 6:
            vImgNumberDiceElement.attr("src", "LuckyDiceImages/6.png");
            break;
    }
}

// hàm hiển thị thông báo số xúc xắc khi ném được 
const showMessageCongratThrowNumberDice = (paramNumberDice) => {
    "use strict";
    $("#p-notifi-dice").html("You throw dice is: " + paramNumberDice);
}

// hàm hiển thị voucher và mã giảm giá nếu đổ xúc xắc trúng được
const showVoucherAndPercentDiscountByNumberDice = (paramUserPlayDice) => {
    "use strict";
    if (paramUserPlayDice.dice > 3) {
        $("#p-voucherID").html("You're given voucher: <span class = 'text-danger' style='font-size: 20px'>" + paramUserPlayDice.voucher.maVoucher + "</span>");
        $("#p-voucher-percent").html("Percent discount: <span class = 'text-danger' style='font-size: 20px'>" + paramUserPlayDice.voucher.phanTramGiamGia + "%</span>")
    } else {
        $("#p-voucherID").html("No Voucher ID");
        $("#p-voucher-percent").html("Percent Discount 0%");
    }
}

// hàm hiển thị phần thưởng nếu người chơi trúng
const showPrizeImgUserThrowDice = (paramUserPlayDice) => {
    "use strict";
    // truy xuất phần tử img prize và thẻ div thông báo
    let vImgPresentElement = $("#img-present");
    let vParaCongratPrize = $("#p-congrat");

    vParaCongratPrize.show(); // hiển thị thẻ div thông báo phần thưởng
    if (paramUserPlayDice.prize === null) {
        vParaCongratPrize.html("Hic hic No reward!!");
        vImgPresentElement.attr("src", "LuckyDiceImages/no-present.jpg");
    } else {
        vParaCongratPrize.html("Congrat! You have won the prize");
        vParaCongratPrize.addClass("para-congrat-prize");
        switch (paramUserPlayDice.prize) {
            case "Mũ":
                vImgPresentElement.attr("src", "LuckyDiceImages/mu.jpg");
                break;
            case "Áo":
                vImgPresentElement.attr("src", "LuckyDiceImages/ao.jpg");
                break;
            case "Xe máy":
                vImgPresentElement.attr("src", "LuckyDiceImages/xe-may.jpg");
                break;
            case "Ô tô":
                vImgPresentElement.attr("src", "LuckyDiceImages/car.jpg");
                break;
        }
    }
}