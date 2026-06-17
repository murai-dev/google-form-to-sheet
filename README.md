# Google Form to Spreadsheet 自動記録システム

Google フォームの回答を Google Spreadsheet に自動記録する、Google Apps Script ベースの業務自動化サンプルです。

フォーム受付、問い合わせ管理、申込管理などでは、回答内容をスプレッドシートに整理し、後続の確認や集計につなげる場面がよくあります。このリポジトリでは、フォームとスプレッドシートの設定をコードで管理し、送信内容を自動で記録する仕組みを実装しています。

## 想定する用途

- 問い合わせフォームの回答を管理したい
- 申込・予約フォームの回答を一覧化したい
- Google フォームとスプレッドシートを業務用に整えたい
- 手作業のコピー、転記、列整理を減らしたい

## 特徴・機能

- Google Apps Script ベース: 追加費用なし、無料で運用可能
- 一元管理: `form-config.gs` で Form と Spreadsheet の設定を一括管理
- 自動生成: 設定から自動的に Form と Spreadsheet を生成
- 堅牢な実装: インデックスベースの回答取得で、質問タイトル変更に対応
- 自動記録: Form 送信時に自動的に Spreadsheet に行を追加

## このリポジトリについて

Google Workspace を使った小さな業務改善のサンプルです。
追加サーバーを用意せず、Google アカウントだけで運用できる構成を想定しています。

## 技術構成

- 言語: Google Apps Script (JavaScript)
- API: Google Forms API, Google Sheets API
- 管理方法: Properties Service を使用した設定の永続化

## 工夫した点

1. 設定の一元管理
   - すべての Form 質問項目と Spreadsheet 列の対応を `FORM_CONFIG` で管理
   - 項目追加時は設定を変更するだけで自動対応

2. インデックスベースの回答取得
   - 質問タイトル変更にも対応できる堅牢な実装
   - 質問順序に基づいて回答を Spreadsheet に記録

3. 自動化による効率化
   - `setup()` 一度実行で Form と Spreadsheet を自動生成
   - その後は完全自動で回答を記録

## セットアップ手順

### 前提条件

- Google アカウント
- Google Drive へのアクセス権

### ステップ 1: Google Apps Script プロジェクトを作成

1. [Google Drive](https://drive.google.com) にアクセス
2. 「新規」> 「その他」> 「Google Apps Script」を選択
3. プロジェクト名を `GoogleFormToSheet` に変更

### ステップ 2: スクリプトコードをアップロード

1. エディター内で以下のファイルを作成：
   - `form-config.gs`: 設定ファイル
   - `apps-script.gs`: ロジックファイル

2. 本リポジトリの以下のファイルをコピー：
   - `src/form-config.gs` の内容をコピー
   - `src/apps-script.gs` の内容をコピー

### ステップ 3: セットアップ関数を実行

1. Google Apps Script エディターで、実行する関数を `setup` に変更
2. 「▶ 実行」ボタンをクリック
3. 認可を求められたら、Google アカウントで認可

**実行完了時のログ:**
```
✅ Setup completed successfully!
Form URL: https://docs.google.com/forms/d/...
Form ID: 1abc...
Spreadsheet ID: 1xyz...
✅ Form submit trigger created automatically
✅ FORM_CONFIG automatically saved to Properties
```

**注意**: `setup()` 実行だけで、Form・Spreadsheet の作成、設定の保存、トリガーの設定まで自動的に完了します。追加の手動操作は不要です。

## 使い方

### 質問項目を追加・変更する場合

1. `form-config.gs` の `FORM_CONFIG.fields` を編集
   ```javascript
   {
     name: "新しい項目",
     type: "SHORT_TEXT", // または PARAGRAPH, MULTIPLE_CHOICE
     required: true,
     spreadsheetColumn: "E",
     choices: [], // MULTIPLE_CHOICE の場合のみ
     itemIndex: null
   }
   ```

2. `setup()` を再度実行（Form・Spreadsheet の再生成、設定保存、トリガー再作成まで自動実行されます）

### フォームに回答を送信

1. Form を開く（Form URL は `setup()` 実行時のログに表示）
2. 各項目に入力して送信
3. 自動的に Spreadsheet に新規行として追加される

### テスト

ダミーデータで記録テストを行う場合：
```javascript
// Google Apps Script エディターで以下を実行
testRecordResponse()
```

## ファイル構成

```
.
├── README.md
├── docs/
│   └── schema.md          # データスキーマ設計書
├── src/
│   ├── form-config.gs     # 設定ファイル（編集対象）
│   └── apps-script.gs     # ロジックファイル
└── memo.txt
```

## 設定リファレンス

`form-config.gs` の `FORM_CONFIG` で設定できる項目：

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `formTitle` | Form のタイトル | "問い合わせフォーム" |
| `formDescription` | Form の説明文 | "お問い合わせはこちらから..." |
| `fields[].name` | 質問項目名 | "名前" |
| `fields[].type` | 質問項目の型 | "SHORT_TEXT", "PARAGRAPH", "MULTIPLE_CHOICE" |
| `fields[].required` | 必須項目かどうか | `true`, `false` |
| `fields[].spreadsheetColumn` | Spreadsheet の列 | "A", "B", "C", ... |
| `fields[].choices` | セレクトボックンの選択肢（MULTIPLE_CHOICE のみ） | `["問い合わせ", "その他"]` |

## トラブルシューティング

### Form と Spreadsheet が生成されない

- Google Apps Script に正しい認可がされているか確認
- ブラウザのコンソールでエラーログを確認

### 回答が Spreadsheet に記録されない

- 自動トリガーが正しく設定されているか確認
- トリガーの実行ログを確認：
  - Google Apps Script エディター > 「実行」> 「実行ログ」

### 質問項目が増えない

- `form-config.gs` を編集した後、`setup()` を再度実行したか確認
- `setup()` の実行ログで成功メッセージが表示されたか確認

## ライセンス

MIT License

## 参考リンク

- [Google Apps Script 公式ドキュメント](https://developers.google.com/apps-script)
- [Forms Service](https://developers.google.com/apps-script/reference/forms)
- [Sheets API](https://developers.google.com/sheets/api)
