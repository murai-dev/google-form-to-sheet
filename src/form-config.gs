/**
 * formConfig.gs
 * 
 * Google Form ↔ Google Spreadsheet システムの設定ファイル
 * 一元管理されたスキーマ設定
 */

const FORM_CONFIG = {
  formTitle: "問い合わせフォーム",
  formDescription: "お問い合わせはこちらからお願いします",
  formId: null, // スクリプト実行後に自動設定される
  spreadsheetId: null, // スクリプト実行後に自動設定される
  
  fields: [
    {
      name: "名前",
      type: "SHORT_TEXT",
      required: true,
      spreadsheetColumn: "A",
      itemIndex: null // Form作成時に自動設定される
    },
    {
      name: "メールアドレス",
      type: "SHORT_TEXT",
      required: true,
      spreadsheetColumn: "B",
      itemIndex: null
    },
    {
      name: "分類",
      type: "MULTIPLE_CHOICE",
      required: true,
      spreadsheetColumn: "C",
      choices: ["問い合わせ", "その他"],
      itemIndex: null
    },
    {
      name: "コメント",
      type: "PARAGRAPH",
      required: false,
      spreadsheetColumn: "D",
      itemIndex: null
    }
  ]
};
