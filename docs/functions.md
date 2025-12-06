# 関数仕様書

## 概要

Google Apps Script のメイン処理関数と、ユーティリティ関数の仕様をまとめています。

## 初期化・セットアップ関数

### `setup()`

**説明**: 初期セットアップを一括実行します。Google Form と Google Spreadsheet を自動生成し、スキーマに基づいて項目を設定し、設定を保存し、トリガーを作成します。

**実行タイミング**: 初回および再設定時に手動実行

**戻り値**: なし

**処理内容**:
1. Google Spreadsheet を作成
2. Spreadsheet にヘッダー行を設定
3. Google Form を作成
4. Form に質問項目を追加（FORM_CONFIG に基づく）
5. 設定を Properties Service に自動保存
6. フォーム送信トリガーを自動作成
7. Form ID、Spreadsheet ID、Form URL をログに出力

**実行後の手順**:
追加操作は不要です。すぐにフォームから回答を送信できます。

**ログ例**:
```
✅ Setup completed successfully!
Form URL: https://docs.google.com/forms/d/1abc.../edit
Form ID: 1abc...
Spreadsheet ID: 1xyz...
✅ Form submit trigger created automatically
✅ FORM_CONFIG automatically saved to Properties
```

---

### `createSpreadsheet()`

**説明**: Google Spreadsheet を新規作成します。

**実行タイミング**: `setup()` から呼び出し

**戻り値**: `Spreadsheet` オブジェクト

**パラメーター**: なし

---

### `setupSpreadsheetHeaders(spreadsheet)`

**説明**: Spreadsheet にヘッダー行を設定します。

**実行タイミング**: `setup()` から呼び出し

**戻り値**: なし

**パラメーター**:
- `spreadsheet`: `Spreadsheet` オブジェクト

**処理内容**:
- `FORM_CONFIG.fields` から `name` プロパティを抽出
- 最初の行にヘッダーとして追加

---

## Form 生成・管理関数

### `createFormFromConfig()`

**説明**: FORM_CONFIG に基づいて Google Form を作成します。

**実行タイミング**: `setup()` から呼び出し

**戻り値**: `Form` オブジェクト

**パラメーター**: なし

**処理内容**:
1. Form を新規作成（タイトル: `FORM_CONFIG.formTitle`）
2. Form の説明を設定（`FORM_CONFIG.formDescription`）
3. 各フィールドに対して `addFormItem()` を呼び出し

---

### `addFormItem(form, field, index)`

**説明**: Form に質問項目を追加します。

**実行タイミング**: `createFormFromConfig()` から呼び出し（各フィールドごと）

**戻り値**: Item オブジェクト

**パラメーター**:
- `form`: `Form` オブジェクト
- `field`: `FORM_CONFIG.fields` の各フィールドオブジェクト
- `index`: フィールドのインデックス

**処理内容**:
1. `field.type` に基づいて、対応する Item タイプを作成
2. タイトルを `field.name` で設定
3. 必須フラグを `field.required` で設定
4. セレクトボックスの場合は、`field.choices` から選択肢を設定
5. インデックスを `field.itemIndex` に記録

**対応する type**:
- `SHORT_TEXT`: テキスト入力（1行）
- `PARAGRAPH`: テキスト入力（複数行）
- `MULTIPLE_CHOICE`: ラジオボタン（単一選択）
- `LIST`: ドロップダウン（単一選択）
- `CHECKBOX`: チェックボックス（複数選択）

---

## フォーム回答処理関数

### `onFormSubmit(e)`

**説明**: Form 送信時に自動実行されるトリガー関数です。

**実行タイミング**: Form 送信時に自動実行（`setup()` 実行時に自動設定されます）

**戻り値**: なし

**パラメーター**:
- `e`: Google Apps Script のイベントオブジェクト

**処理内容**:
1. 保存された FORM_CONFIG をロード
2. イベントオブジェクトから Form の回答を取得
3. `extractFormResponse()` で回答を整形
4. `recordToSpreadsheet()` で Spreadsheet に記録

**トリガー設定**:
`setup()` 実行時に自動的に以下の設定で作成されます：
- イベントソース: Google フォーム
- イベントの種類: フォーム送信時
- 実行する関数: `onFormSubmit`

---

### `extractFormResponse(response)`

**説明**: Form の回答をオブジェクトに整形します。

**実行タイミング**: `onFormSubmit()` から呼び出し

**戻り値**: 回答オブジェクト（例: `{ "名前": "太郎", "メールアドレス": "...", ... }`)

**パラメーター**:
- `response`: Form の回答オブジェクト

**処理内容**:
1. 回答の各アイテムを取得
2. インデックスベースで `FORM_CONFIG.fields` とマッピング
3. 質問タイトルをキーにした連想配列に変換
4. 必須フィールドが未入力の場合は `null` をセット

**重要**: インデックスベースで対応付けることで、質問タイトル変更後も動作が保証されます

---

### `recordToSpreadsheet(formResponse)`

**説明**: Form の回答を Spreadsheet に新規行として追加します。

**実行タイミング**: `onFormSubmit()` から呼び出し

**戻り値**: なし

**パラメーター**:
- `formResponse`: 整形された回答オブジェクト（`extractFormResponse()` の戻り値）

**処理内容**:
1. Spreadsheet を取得（`FORM_CONFIG.spreadsheetId` より）
2. `FORM_CONFIG.fields` の順序に従ってデータを並べる
3. 新規行として Spreadsheet に追加

**注意**: 回答がない場合は、空文字列が記録されます（必須フィールドは `null`）

---

## テスト・ユーティリティ関数

### `testRecordResponse()`

**説明**: ダミーの Form 回答を Spreadsheet に記録し、システムが正常に機能しているかテストします。

**実行タイミング**: 手動実行（テスト目的）

**戻り値**: なし

**パラメーター**: なし

**テストデータ**:
```javascript
{
  "名前": "テスト太郎",
  "メールアドレス": "test@example.com",
  "分類": "問い合わせ",
  "コメント": "これはテスト回答です"
}
```

---

### `showFormConfig()`

**説明**: 現在の FORM_CONFIG をログに出力します。設定確認用です。

**実行タイミング**: 手動実行（確認目的）

**戻り値**: なし

**パラメーター**: なし

**ログ出力例**:
```
=== FORM_CONFIG ===
{
  "formTitle": "問い合わせフォーム",
  "formDescription": "お問い合わせはこちらからお願いします",
  ...
}
```

---

## 設定永続化関数

### `saveFormConfig()`

**説明**: 現在の FORM_CONFIG を Properties Service に保存します。

**実行タイミング**: `setup()` 内で自動実行されます。通常は手動実行不要です。

**戻り値**: なし

**パラメーター**: なし

**処理内容**:
1. FORM_CONFIG を JSON 文字列に変換
2. Properties Service に保存（キー: "FORM_CONFIG"）

**保存内容**:
- Form ID
- Spreadsheet ID
- 各フィールドのインデックス

**注意**: `setup()` 実行時に自動的に保存されるため、通常は手動実行する必要はありません

---

### `loadFormConfig()`

**説明**: Properties Service から保存された FORM_CONFIG を復元します。

**実行タイミング**: スクリプト実行時（通常は自動）

**戻り値**: `boolean`（保存データが存在したかどうか）
- `true`: 設定を復元した
- `false`: 保存データがない

**パラメーター**: なし

**処理内容**:
1. Properties Service から "FORM_CONFIG" を取得
2. JSON を解析
3. 現在の FORM_CONFIG にマージ

**使用例**:
```javascript
function onFormSubmit(e) {
  // トリガー実行時に設定を復元
  loadFormConfig();
  // 処理続行...
}
```

---

### `setupFormTrigger()`

**説明**: フォーム送信トリガーを手動で再作成します。通常は `setup()` で自動作成されるため不要ですが、トリガーのみ再設定したい場合に使用します。

**実行タイミング**: トリガーのみを再作成したい場合に手動実行

**戻り値**: なし

**パラメーター**: なし

**処理内容**:
1. Properties Service から FORM_CONFIG をロード
2. `createOrUpdateFormTrigger()` を呼び出してトリガーを再作成

---

### `createOrUpdateFormTrigger(formId)`

**説明**: フォーム送信トリガーを作成または更新します。既存のトリガーがあれば削除してから新規作成します。

**実行タイミング**: `setup()` または `setupFormTrigger()` から呼び出し

**戻り値**: なし

**パラメーター**:
- `formId`: Google Form の ID

**処理内容**:
1. 既存の `onFormSubmit` トリガーを削除
2. 指定された Form ID に対して新しいトリガーを作成
3. イベントの種類を「フォーム送信時」に設定

---

## 実行フロー図

```
【初回・再設定時】
    ↓
  setup()
    ├─ createSpreadsheet()
    ├─ setupSpreadsheetHeaders()
    ├─ createFormFromConfig()
    │    └─ addFormItem()（各フィールド）
    ├─ saveFormConfig()
    ├─ createOrUpdateFormTrigger()
    └─ ログ出力

【フォーム送信時】
  Form 送信
    ↓
  onFormSubmit()
    ├─ loadFormConfig()
    ├─ extractFormResponse()
    └─ recordToSpreadsheet()

【トリガーのみ再作成】
  setupFormTrigger()
    ├─ loadFormConfig()
    └─ createOrUpdateFormTrigger()
```

---

## エラーハンドリング

### setup() でのエラー

```javascript
try {
  // setup処理...
} catch (error) {
  Logger.log(`❌ Setup failed: ${error.message}`);
  throw error;
}
```

- Google Drive へのアクセス権がない
- スクリプトの実行時間が制限を超えた

### onFormSubmit() でのエラー

```javascript
try {
  // 回答処理...
} catch (error) {
  Logger.log(`❌ Error processing response: ${error.message}`);
  throw error;
}
```

- FORM_CONFIG の設定が不正
- Spreadsheet ID が無効
- インターネット接続エラー
