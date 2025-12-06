/**
 * Google Form ↔ Google Spreadsheet 自動記録システム
 * 
 * 一元管理されたスキーマ設定から、
 * Form質問項目とSpreadsheet列を自動生成・管理するシステム
 * 
 * 設定は form-config.gs で管理
 */

// ============================================================================
// 【1】初期化: Form と Spreadsheet のセットアップ
// ============================================================================

/**
 * 初期セットアップを実行
 * - Google Form を作成
 * - Google Spreadsheet を作成またはリンク
 * - スキーマに基づいて項目を生成
 */
function setup() {
  try {
    // Spreadsheet を作成
    const spreadsheet = createSpreadsheet();
    FORM_CONFIG.spreadsheetId = spreadsheet.getId();
    
    // Spreadsheet にヘッダー行を設定
    setupSpreadsheetHeaders(spreadsheet);
    
    // Form を作成
    const form = createFormFromConfig();
    FORM_CONFIG.formId = form.getId();
    
    // 設定を保存
    const props = PropertiesService.getScriptProperties();
    props.setProperty("FORM_CONFIG", JSON.stringify(FORM_CONFIG));
    
    // トリガーを自動設定
    createOrUpdateFormTrigger(FORM_CONFIG.formId);
    
    Logger.log("✅ Setup completed successfully!");
    Logger.log(`Form URL: ${form.getPublishedUrl()}`);
    Logger.log(`Form ID: ${FORM_CONFIG.formId}`);
    Logger.log(`Spreadsheet ID: ${FORM_CONFIG.spreadsheetId}`);
    Logger.log("✅ Form submit trigger created automatically");
    Logger.log("✅ FORM_CONFIG automatically saved to Properties");
    
  } catch (error) {
    Logger.log(`❌ Setup failed: ${error.message}`);
    throw error;
  }
}

/**
 * Google Spreadsheet を作成
 */
function createSpreadsheet() {
  const spreadsheet = SpreadsheetApp.create("Form Responses");
  return spreadsheet;
}

/**
 * Spreadsheet にヘッダー行を設定
 */
function setupSpreadsheetHeaders(spreadsheet) {
  const sheet = spreadsheet.getActiveSheet();
  const headers = FORM_CONFIG.fields.map(field => field.name);
  sheet.appendRow(headers);
}

/**
 * FORM_CONFIG からフォームを作成
 */
function createFormFromConfig() {
  const form = FormApp.create(FORM_CONFIG.formTitle);
  form.setDescription(FORM_CONFIG.formDescription);
  
  // スキーマに基づいて質問項目を追加し、インデックスを記録
  FORM_CONFIG.fields.forEach((field, index) => {
    addFormItem(form, field, index);
  });
  
  return form;
}

/**
 * フォームに質問項目を追加し、インデックスを記録
 */
function addFormItem(form, field, index) {
  let item;
  
  switch (field.type) {
    case "SHORT_TEXT":
      item = form.addTextItem();
      break;
      
    case "PARAGRAPH":
      item = form.addParagraphTextItem();
      break;
      
    case "MULTIPLE_CHOICE":
      item = form.addMultipleChoiceItem();
      item.setChoiceValues(field.choices);
      break;
      
    case "LIST":
      item = form.addListItem();
      item.setChoiceValues(field.choices);
      break;
      
    case "CHECKBOX":
      item = form.addCheckboxItem();
      item.setChoiceValues(field.choices);
      break;
      
    default:
      throw new Error(`Unsupported field type: ${field.type}`);
  }
  
  // 共通設定
  item.setTitle(field.name);
  item.setRequired(field.required);
  
  // インデックスをFORM_CONFIGに記録
  field.itemIndex = index;
  
  return item;
}

// ============================================================================
// 【2】フォーム回答処理
// ============================================================================

/**
 * フォーム送信時に自動実行されるトリガー関数
 */
function onFormSubmit(e) {
  try {
    // トリガー実行時はグローバル変数が初期状態になるため、保存済み設定をロード
    const loaded = loadFormConfig();
    if (!loaded) {
      Logger.log("❌ No FORM_CONFIG found in Properties. Run setup() first.");
      return;
    }

    if (!FORM_CONFIG.spreadsheetId) {
      Logger.log("❌ Spreadsheet ID is missing. Run setup() again.");
      return;
    }

    const response = e.response;
    const formResponse = extractFormResponse(response);
    
    // Spreadsheet に記録
    recordToSpreadsheet(formResponse);
    
    Logger.log("✅ Response recorded successfully");
    
  } catch (error) {
    Logger.log(`❌ Error processing response: ${error.message}`);
    throw error;
  }
}

/**
 * フォーム回答を抽出して整形
 * インデックスベースで対応付けることで、質問タイトル変更に対応
 */
function extractFormResponse(response) {
  const itemResponses = response.getItemResponses();
  const formResponse = {};
  
  // インデックスで対応付け
  FORM_CONFIG.fields.forEach(field => {
    const itemIndex = field.itemIndex;
    if (itemIndex !== null && itemIndex < itemResponses.length) {
      formResponse[field.name] = itemResponses[itemIndex].getResponse();
    } else {
      formResponse[field.name] = field.required ? null : "";
    }
  });
  
  return formResponse;
}

/**
 * フォーム回答を Spreadsheet に記録
 */
function recordToSpreadsheet(formResponse) {
  const spreadsheet = SpreadsheetApp.openById(FORM_CONFIG.spreadsheetId);
  const sheet = spreadsheet.getActiveSheet();
  
  // FORM_CONFIG の field 順に データを並べる
  const row = FORM_CONFIG.fields.map(field => formResponse[field.name] || "");
  
  sheet.appendRow(row);
}

// ============================================================================
// 【3】テスト・ユーティリティ
// ============================================================================

/**
 * テスト用: ダミー回答を Spreadsheet に記録
 */
function testRecordResponse() {
  const dummyResponse = {
    "名前": "テスト太郎",
    "メールアドレス": "test@example.com",
    "分類": "問い合わせ",
    "コメント": "これはテスト回答です"
  };
  
  recordToSpreadsheet(dummyResponse);
  Logger.log("✅ Test response recorded");
}

/**
 * フォーム設定を表示
 */
function showFormConfig() {
  Logger.log("=== FORM_CONFIG ===");
  Logger.log(JSON.stringify(FORM_CONFIG, null, 2));
}

/**
 * 現在の設定を保存（Properties Service に保存）
 * 次回実行時に復元できるようにする
 */
function saveFormConfig() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty("FORM_CONFIG", JSON.stringify(FORM_CONFIG));
  Logger.log("✅ FORM_CONFIG saved to Properties");
}

/**
 * Properties Service から設定を復元
 */
function loadFormConfig() {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty("FORM_CONFIG");
  
  if (saved) {
    const loadedConfig = JSON.parse(saved);
    // 既存のFORM_CONFIGにマージ
    Object.assign(FORM_CONFIG, loadedConfig);
    Logger.log("✅ FORM_CONFIG loaded from Properties");
    return true;
  } else {
    Logger.log("⚠️  No saved FORM_CONFIG found");
    return false;
  }
}

/**
 * フォーム送信トリガーを手動で設定
 */
function setupFormTrigger() {
  // FORM_CONFIGをロード
  const loaded = loadFormConfig();
  if (!loaded) {
    Logger.log("❌ No FORM_CONFIG found. Please run setup() first.");
    return;
  }

  createOrUpdateFormTrigger(FORM_CONFIG.formId);
}

/**
 * トリガーを作成／再作成
 */
function createOrUpdateFormTrigger(formId) {
  if (!formId) {
    Logger.log("❌ Form ID not found. Please run setup() first.");
    return;
  }
  
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
      Logger.log("🗑️  Deleted existing trigger");
    }
  });
  
  // Form を取得
  const form = FormApp.openById(formId);
  
  // 新しいトリガーを作成
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
  
  Logger.log("✅ Form submit trigger created successfully!");
}
