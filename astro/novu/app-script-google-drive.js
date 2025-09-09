function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return _json({ success: false, error: "No POST data" });
    }

    var data = JSON.parse(e.postData.contents);

    // 📂 Chọn thư mục Drive
    var folder = DriveApp.getFolderById("1JxCy4Rq0Jh-Y1L1r6tBbV_Qeib0mm-mk"); // TODO: thay bằng Folder ID

    // 📌 Tên file backup
    var fileName = "backup_" + new Date().toISOString() + ".json";

    // 📝 Tạo file JSON (dùng plain text MIME)
    var file = folder.createFile(
      fileName,
      JSON.stringify(data, null, 2),
      MimeType.PLAIN_TEXT
    );

    // Cho phép public link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return _json({
      success: true,
      message: "File saved to Google Drive",
      fileId: file.getId(),
      fileUrl: "https://drive.google.com/uc?export=view&id=" + file.getId(),
    });
  } catch (err) {
    return _json({ success: false, error: err.message });
  }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
