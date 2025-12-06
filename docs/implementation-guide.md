# 実装ガイド

このドキュメントでは、Google Apps Script エディターへのコード導入手順を説明します。

## 準備

### 1. Google Drive にアクセス

[Google Drive](https://drive.google.com) にアクセスします。

### 2. Google Apps Script プロジェクトを作成

1. 左側の「新規」をクリック
2. 「その他」 > 「Google Apps Script」を選択
3. プロジェクト名を「GoogleFormToSheet」に変更

## スクリプトコードの導入

### ステップ 1: form-config.gs を作成

1. Google Apps Script エディターで、左側の「+」アイコンをクリック
2. 「新しいファイル」を選択
3. ファイル名を「form-config」と入力（拡張子は自動で .gs になります）
4. 本リポジトリの `src/form-config.gs` の内容をコピーして貼り付け
5. 保存

### ステップ 2: apps-script.gs を作成

1. 同様に「新しいファイル」を選択
2. ファイル名を「apps-script」と入力
3. 本リポジトリの `src/apps-script.gs` の内容をコピーして貼り付け
4. 保存

## セットアップの実行

### ステップ 1: setup 関数を実行

1. エディター上部の「関数を選択」ドロップダウンから「setup」を選択
2. 左側の「実行」（▶ ボタン）をクリック
3. 初回実行時は、Google の認可ページが開きます
4. Google アカウントで認可を行います

### ステップ 2: 実行完了を確認

実行ログが表示されます：
```
✅ Setup completed successfully!
Form URL: https://docs.google.com/forms/d/...
Form ID: 1abc...
Spreadsheet ID: 1xyz...
✅ FORM_CONFIG automatically saved to Properties
✅ Form submit trigger created automatically
```

このログを記録しておくと、後で設定を確認する際に役立ちます。

## 自動トリガーの設定

`setup()` の実行時に、自動で `onFormSubmit` トリガーが作成されます。通常は追加操作不要です。

### トリガーを再作成したい場合のみ

1. 「関数を選択」ドロップダウンから `setupFormTrigger` を選択
2. 「実行」をクリック
3. 実行ログに `✅ Form submit trigger created successfully!` と表示されれば成功です。

### トリガーの確認

1. Google Apps Script エディターの左側で「トリガー」をクリック
2. `onFormSubmit` 関数のトリガーが表示されているか確認
3. イベントの種類が「フォーム送信時」になっているか確認

## テスト実行

### テスト 1: 自動記録テスト

1. 「関数を選択」から「testRecordResponse」を選択
2. 「実行」をクリック

実行ログに以下が表示されます：
```
✅ Test response recorded
```

3. Google Drive で、生成された Spreadsheet を開く
4. テストデータが新規行として追加されていることを確認

### テスト 2: Form 送信テスト

1. `setup()` 実行時のログから、Form URL を確認
2. Form を開く
3. 各項目に入力して「送信」をクリック
4. Spreadsheet を確認し、新規行として追加されていることを確認

## トラブルシューティング

### Form と Spreadsheet が生成されない

**原因**: 認可が完了していない、または権限不足

**解決方法**:
1. Google Apps Script エディターの「実行」> 「実行ログ」を確認
2. エラーメッセージがあれば、それに従って対処
3. Google アカウントの権限を確認

### 回答が Spreadsheet に記録されない

**原因**: トリガーが設定されていない、または不正

**解決方法**:
1. トリガー設定画面で、「onFormSubmit」トリガーが存在するか確認
2. トリガーをクリックして、設定内容を確認
3. トリガーの実行ログを確認：
   - Google Apps Script エディター > 「実行」> 「実行ログ」
   - 時間を指定して、Form 送信時のログを確認

### 質問項目が増えない

**原因**: `form-config.gs` 編集後、`setup()` を再度実行していない

**解決方法**:
1. `form-config.gs` を編集
2. `setup()` を再度実行
3. `saveFormConfig()` を実行して設定を保存

### エラーメッセージ: "FORM_CONFIG is not defined"

**原因**: `form-config.gs` が正しくロードされていない

**解決方法**:
1. Google Apps Script エディターをリロード（F5）
2. `form-config.gs` が存在するか確認
3. `form-config.gs` の構文エラーをチェック

## 質問項目を追加する場合

### 手順

1. `form-config.gs` の `FORM_CONFIG.fields` に新規フィールドを追加：

```javascript
{
  name: "新しい項目",
  type: "SHORT_TEXT",  // または PARAGRAPH, MULTIPLE_CHOICE
  required: true,
  spreadsheetColumn: "E",  // 追加の場合は次の列を指定
  itemIndex: null
}
```

2. `setup()` を再度実行（設定は自動保存されます）

### 型の選択

- `SHORT_TEXT`: テキスト入力（1行）
- `PARAGRAPH`: テキスト入力（複数行）
- `MULTIPLE_CHOICE`: セレクトボックス

### MULTIPLE_CHOICE の場合

```javascript
{
  name: "分類",
  type: "MULTIPLE_CHOICE",
  required: true,
  spreadsheetColumn: "C",
  choices: ["問い合わせ", "その他"],
  itemIndex: null
}
```

## Google Drive でリソースを確認

### Form を確認

1. [Google Drive](https://drive.google.com) にアクセス
2. 「最近使用したアイテム」から「問い合わせフォーム」をクリック
3. Form の内容を確認

### Spreadsheet を確認

1. 同様に「Form Responses」をクリック
2. 回答が記録されているか確認

## 実装後の確認チェックリスト

- [ ] Google Apps Script プロジェクトが作成されている
- [ ] `form-config.gs` と `apps-script.gs` がアップロードされている
- [ ] `setup()` が実行完了している（設定・トリガーは自動保存/作成されます）
- [ ] `testRecordResponse()` でテストデータが Spreadsheet に記録される
- [ ] Form から実際に回答を送信して、Spreadsheet に記録されることを確認している
- [ ] （任意確認）トリガー画面で `onFormSubmit` が「フォーム送信時」になっている

すべてのチェックが完了したら、実装は完了です！
