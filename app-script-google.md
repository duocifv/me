// function testMergeRooms() {
// const rooms = getSheetData("RoomList");
// const updates = getSheetData("DailyUpdate");
// const queryDate = "2025-08-26";

// // Log để kiểm tra giá trị thực tế
// updates.forEach(u => {
// Logger.log("Row Ngày raw: %s (type: %s)", u["Ngày"], typeof u["Ngày"]);
// });

// // Lọc theo ngày
// const updatesToday = updates.filter(u => {
// let cell = u["Ngày"];
// if (cell instanceof Date) {
// const d = Utilities.formatDate(cell, Session.getScriptTimeZone(), "yyyy-MM-dd");
// return d === queryDate;
// } else {
// return String(cell).trim() === queryDate;
// }
// });

// Logger.log("UpdatesToday:");
// Logger.log(updatesToday);

// const merged = rooms.map(r => {
// const update = updatesToday.find(u => u["Loại phòng"] === r["Loại phòng"]);
// return {
// "Mã phòng": r["Mã phòng"],
// "Loại phòng": r["Loại phòng"],
// "Mô tả": r["Mô tả"],
// "Tiện ích": r["Tiện ích"],
// "Sức chứa": r["Sức chứa"],
// "Ghi chú": r["Ghi chú"],
// "Hình ảnh": r["Hình ảnh"] || "",
// "Giá": update ? update["Giá"] : "-",
// "Khuyến*mãi": update ? update["Khuyến mãi"] : "-",
// "Tình_trạng": update ? update["Tình trạng"] : "-",
// "Thực*đơn": update ? update["Thực đơn"] : "-"
// };
// });

// Logger.log("Merged result:");
// Logger.log(merged);
// }

// ===== API GET =====
function doGet(e) {
const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

if (action === "rooms") {
const rows = getSheetData("RoomList");
if (!rows) return \_json({ success: false, error: "Sheet 'RoomList' not found" });
return \_json({ success: true, type: "rooms", data: rows });
}

if (action === "services") {
const rows = getSheetData("ServiceList");
if (!rows) return \_json({ success: false, error: "Sheet 'ServiceList' not found" });
return \_json({ success: true, type: "services", data: rows });
}

if (action === "hotel") {
const info = getSheetKeyValue("HotelInfo");
if (info === null) return \_json({ success: false, error: "Sheet 'HotelInfo' not found" });
return \_json({ success: true, type: "hotel", data: info });
}

if (action === "bookings") {
const rows = getSheetData("Bookings");
if (!rows) return \_json({ success: false, error: "Sheet 'Bookings' not found" });
return \_json({ success: true, type: "bookings", data: rows });
}

function formatYMD(date) {
return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

if (action === "roomStatus") {
const rooms = getSheetData("RoomList");
const updates = getSheetData("DailyUpdate");

if (!rooms || !updates) {
return \_json({ success: false, error: "Missing RoomList or DailyUpdate" });
}

// lấy ngày từ query ?date=YYYY-MM-DD, nếu không thì mặc định hôm nay
const queryDate = (e && e.parameter && e.parameter.date)
? e.parameter.date
: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

// lọc DailyUpdate theo ngày (theo timezone local)
const todayUpdates = updates.filter(r => {
const ngay = formatYMD(r["Ngày"]);
return ngay === queryDate;
});

const merged = rooms.map(room => {
const update = todayUpdates.find(u => u["Loại phòng"] === room["Loại phòng"]) || {};
return {
...room,
Giá: update["Giá"] || "-",
Khuyến*mãi: update["Khuyến mãi"] || "-",
Tình_trạng: update["Tình trạng"] || "-",
Thực*đơn: update["Thực đơn"] || update["Thực đơn hôm nay"] || "-"
};
});

return \_json({ success: true, type: "roomStatus", date: queryDate, data: merged });
}

return \_json({
success: false,
error: "Invalid action. Use ?action=rooms | services | hotel | bookings | roomStatus"
});
}

function doPost(e) {
try {
var data = JSON.parse(e.postData.contents);

    if (data.type === "booking") {
      return handleBooking(data);
    }

    if (data.type === "daily_update") {
      return handleDailyUpdate(data);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: "Unknown type" })
    ).setMimeType(ContentService.MimeType.JSON);

} catch (err) {
return ContentService.createTextOutput(
JSON.stringify({ success: false, error: err.message })
).setMimeType(ContentService.MimeType.JSON);
}
}

// ========== 🏨 Ghi booking vào Sheet "Bookings" ==========
function handleBooking(data) {
var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getSheetByName("Bookings");
if (!sheet) return \_error("Sheet 'Bookings' not found");

sheet.appendRow([
new Date(), // Ngày đặt (tự động)
data.name || "", // Họ và tên
data.phone || "", // Số điện thoại
data.email || "", // Email
data.checkin || "", // Check-in
data.checkout || "", // Check-out
data.roomType || "", // Loại phòng
data.nights || "", // Số đêm
data.guests || "", // Số khách
data.note || "", // Ghi chú khách
data.bookingIntent?.category || "", // Ý định đặt phòng
(data.bookingIntent?.reasons || []).join(", "), // Lý do nhận diện
data.bookingIntent?.score || "", // Điểm đánh giá
data.bookingIntent?.recommendedAction || "", // Hành động khuyến nghị
data.status || "Chờ xác nhận" // Tình trạng
]);

return ContentService.createTextOutput(
JSON.stringify({ success: true, message: "Booking saved" })
).setMimeType(ContentService.MimeType.JSON);
}

// function handleBooking(data) {
// var ss = SpreadsheetApp.getActiveSpreadsheet();
// var sheet = ss.getSheetByName("Bookings");
// if (!sheet) return \_error("Sheet 'Bookings' not found");

// sheet.appendRow([
// new Date(), // Ngày đặt (tự động)
// data.name || "",
// data.phone || "",
// data.email || "",
// data.checkin || "",
// data.checkout || "",
// data.roomType || "",
// data.note || "",
// data.status || "Chờ xác nhận"
// ]);

// return ContentService.createTextOutput(
// JSON.stringify({ success: true, message: "Booking saved" })
// ).setMimeType(ContentService.MimeType.JSON);
// }

// ========== 📊 Daily update vào Sheet "DailyUpdate" ==========
function handleDailyUpdate(data) {
var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getSheetByName("DailyUpdate");
if (!sheet) return \_error("Sheet 'DailyUpdate' not found");

sheet.appendRow([
data.date || new Date(),
data.roomType || "",
data.price || "",
data.promotion || "",
data.status || "",
data.menu || ""
]);

return ContentService.createTextOutput(
JSON.stringify({ success: true, message: "Daily update saved" })
).setMimeType(ContentService.MimeType.JSON);
}

// Helper trả lỗi
function \_error(msg) {
return ContentService.createTextOutput(
JSON.stringify({ success: false, error: msg })
).setMimeType(ContentService.MimeType.JSON);
}

// ===== POST: Create / Update / Delete + Upload Image =====
// function doPost(e) {
// try {
// const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Posts");
// if (!sheet) return \_json({ success: false, error: "Sheet 'Posts' not found" });

// let params = null;
// if (e && e.postData && e.postData.contents && e.postData.type.indexOf('application/json') !== -1) {
// try { params = JSON.parse(e.postData.contents); }
// catch (err) { return \_json({ success: false, error: "Invalid JSON format" }); }
// } else if (e && e.parameter) {
// params = e.parameter;
// } else return \_json({ success: false, error: "Missing post data" });

// const action = params.action;
// if (!action) return \_json({ success: false, error: "Missing action" });

// const data = sheet.getDataRange().getValues();

// // CREATE
// if (action === "create") {
// const newId = new Date().getTime();
// let imageUrl = '';
// if (params.image*base64) {
// // KHÔNG decodeURIComponent ở đây nữa
// imageUrl = saveImage(params.image_base64, 'post*' + newId + '.png') || '';
// }
// const newRow = [
// newId,
// params.title || "",
// params.content || "",
// new Date().toISOString(),
// imageUrl
// ];
// sheet.appendRow(newRow);
// return \_json({ success: true, id: newId, image_url: imageUrl });
// }

// // UPDATE
// if (action === "update") {
// const id = params.id;
// for (let i = 1; i < data.length; i++) {
// if (String(data[i][0]) == String(id)) {
// if (params.title !== undefined) sheet.getRange(i + 1, 2).setValue(params.title);
// if (params.content !== undefined) sheet.getRange(i + 1, 3).setValue(params.content);
// let imageUrl = data[i][4] || '';
// if (params.image*base64) {
// imageUrl = saveImage(params.image_base64, 'post*' + id + '.png') || imageUrl;
// sheet.getRange(i + 1, 5).setValue(imageUrl);
// }
// sheet.getRange(i + 1, 4).setValue(new Date().toISOString());
// return \_json({ success: true, image_url: imageUrl });
// }
// }
// return \_json({ success: false, error: "ID not found" });
// }

// // DELETE
// if (action === "delete") {
// const id = params.id;
// for (let i = 1; i < data.length; i++) {
// if (String(data[i][0]) == String(id)) {
// sheet.deleteRow(i + 1);
// return \_json({ success: true });
// }
// }
// return \_json({ success: false, error: "ID not found" });
// }

// return \_json({ success: false, error: "Unknown action" });
// } catch (err) {
// return \_json({ success: false, error: err.message });
// }
// }

// ===== HELPER: trả JSON =====
function \_json(obj) {
return ContentService
.createTextOutput(JSON.stringify(obj))
.setMimeType(ContentService.MimeType.JSON);
}

// ===== TEST: Upload ảnh mẫu =====
function testUpload() {
// Ảnh PNG 1x1 pixel màu trắng
const sampleBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8HwQACfsD/QqTkN4AAAAASUVORK5CYII=";

const url = saveImage(sampleBase64, "test_image.png");
Logger.log("File URL: " + url);
}

function saveImage(base64Data, fileName) {
try {
const folder = DriveApp.getFolderById('15meEV_jiNFNAOACMGJ0LR20uz-QQO1Ux');
let bytes, contentType;

    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) throw new Error('Invalid Base64 format');
      contentType = matches[1];
      bytes = Utilities.base64Decode(matches[2]);
    } else {
      contentType = 'image/png'; // mặc định
      bytes = Utilities.base64Decode(base64Data);
    }

    // 🔥 tạo blob từ bytes
    const blob = Utilities.newBlob(bytes, contentType, fileName);

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Lấy FILE_ID
    const fileId = file.getId();
    // Trả về link direct cho <img>
    return "https://drive.google.com/uc?export=view&id=" + file.getId();

} catch (err) {
Logger.log("saveImage error: " + err);
return null;
}
}

// ===== Helper: Đọc sheet theo tên, trả mảng object theo header hàng 1 =====
function getSheetData(sheetName) {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
if (!sheet) return null;

const data = sheet.getDataRange().getValues();
const headers = data[0] || [];
const rows = data.slice(1).map(r => {
const obj = {};
headers.forEach((h, i) => obj[h] = r[i]);
return obj;
});
return rows;
}

// ===== Helper: Đọc sheet 2 cột (key->value) cho HotelInfo =====
function getSheetKeyValue(sheetName, keyColIndex = 0, valColIndex = 1) {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
if (!sheet) return null;

const data = sheet.getDataRange().getValues();
if (data.length < 2) return {}; // chỉ có header

const kv = {};
// Bỏ qua hàng header (bắt đầu từ hàng 2)
for (let i = 1; i < data.length; i++) {
const key = String(data[i][keyColIndex] || "").trim();
const val = data[i][valColIndex];
if (key) kv[key] = val;
}
return kv;
}
