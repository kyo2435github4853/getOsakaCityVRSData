function getRecordDateEasy() {
  //大阪市のVRSオープンデータが期間限りで面倒なので毎日収集するbotを作成する
  //手始めに現在の公開されている記録の日付がいつかを取り出し
  url="https://www.city.osaka.lg.jp/kenko/page/0000545560.html";
  // URLからHTMLを取得
  var html = UrlFetchApp.fetch(url).getContentText();
  // HTMLをパース
  var parsed = Parser.data(html);
  var get_csv_date = parsed.from('href="./cmsfiles/contents/0000545/545560/VRS_271004_opendata_2023_generated_on_').to('.csv').build();

  return get_csv_date
}

function getRecordDate() {
  //大阪市のVRSオープンデータが期間限りで面倒なので毎日収集するbotを作成する
  //手始めに現在の公開されている記録の日付がいつかを取り出し
  url="https://www.city.osaka.lg.jp/kenko/page/0000545560.html";
  // URLからHTMLを取得
  var html = UrlFetchApp.fetch(url).getContentText();
  // HTMLをパース
  var parsed = Parser.data(html);
  var get_csv_date = parsed.from('href="./cmsfiles/contents/0000545/545560/VRS_271004_opendata_2023_generated_on_').to('.csv').build();
  var get_year_list = parsed.from('href="./cmsfiles/contents/0000545/545560/VRS_271004_opendata_').to('_generated_on_').iterate();

  return {'date':get_csv_date,'year_list':get_year_list}
}

//ダウンロード用フォルダにcsvをダウンロードし、それを日付フォルダにコピーする
//スクリプトの参照元：　https://utelecon.adm.u-tokyo.ac.jp/articles/gas/copy
function mainCopyFolder(get_date,dest_folder) {

  const folderNameDest = "d" + get_date; // コピー先のフォルダ名

  const folderSrc = dest_folder;
  const folderDest = folderSrc.getParents().next().createFolder(folderNameDest);

  copyFolder(folderSrc, folderDest);
}

function copyFolder(src, dest) {
  const folders = src.getFolders();
  const files = src.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    file.makeCopy(file.getName(), dest);
  }

  while (folders.hasNext()) {
    const subFolder = folders.next();
    const folderName = subFolder.getName();
    const folderDest = dest.createFolder(folderName);
    copyFolder(subFolder, folderDest);
  }
}

//スクリプトの参照元：　https://lost-waldo.blogspot.com/2015/09/csvgoogle-drive-google-apps-script.html
function getCsv(dest_folder,get_year,get_date) { 
  
  var destfolder = dest_folder;
  var record_year = get_year;
  var date = get_date;

  var url = "https://www.city.osaka.lg.jp/kenko/cmsfiles/contents/0000545/545560/VRS_271004_opendata_" + record_year + "_generated_on_";
  console.log(url)
  var response = UrlFetchApp.fetch(url + date + '.csv');
  destfolder.createFile(date + '_generated_' + record_year + '.csv', response.getContentText('Shift_JIS'));
}

//フォルダ内のファイルを全てゴミ箱に入れる
//スクリプトの参照元：　https://takeda-san.hatenablog.com/entry/2021/07/17/215539
function resetFolder(src){
  var files = src.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    file.setTrashed(true);
  }
}

//基本形　https://www.city.osaka.lg.jp/kenko/cmsfiles/contents/0000545/545560/VRS_271004_opendata_2023_generated_on_2023-11-06.csv
function getVRSRecord() {
  //最初に、読み込みフォルダの中身をいったんすべて削除する
  var folderId = '1e6-yeDXKRxmaEmA7JJY3qEJ7zkX9e1Ev';//保存するフォルダID
  var dest_f = DriveApp.getFolderById(folderId);

  resetFolder(dest_f);

  //本処理
  //流れとして、対象csvをダウンロードし、自身のフォルダにコピーする
  //var record_year_list = ["2023","2022","2021"];
  var obj = getRecordDate();
  var get_date = obj['date'];
  var record_year_list = obj['year_list'];

  console.log(record_year_list);

  for (var rec_year of record_year_list){
    getCsv(dest_f,rec_year,get_date);

  }

  mainCopyFolder(get_date,dest_f);
}
