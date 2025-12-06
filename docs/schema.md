# データスキーマ設計書

## 概要

本システムでは、Google Form の質問項目と Google Spreadsheet の列対応を、`form-config.gs` の `FORM_CONFIG` オブジェクトで**一元管理**します。

すべての定義は **`form-config.gs` のみ** で行い、そこから Form と Spreadsheet が自動生成されます。

## 設計例：問い合わせフォーム

このドキュメントで説明する具体例として、以下の構成を想定しています。

| 質問項目 | 型 | 必須 | Spreadsheet 列 | 説明 |
|---------|-----|------|-----------------|------|
| 名前 | テキスト（短編） | ✓ | A | 入力者の名前 |
| メールアドレス | テキスト（短編） | ✓ | B | 入力者のメールアドレス |
| 分類 | ドロップダウン | ✓ | C | 「問い合わせ」または「その他」から選択 |
| コメント | テキスト（長編） | × | D | 追加コメント（オプション） |

**注意**: この表は「設計の意図」を示すものです。実際の定義は `form-config.gs` で行われます。

## セレクトボックンの選択肢

**分類フィールド:**
- 問い合わせ
- その他

## 選択可能な type

Google Apps Script の Forms Service で対応している質問項目の型：

| type 値 | 説明 | UI表示 | 使用例 |
|---------|------|--------|--------|
| `SHORT_TEXT` | テキスト入力（1行） | テキストボックス | 名前、メールアドレス |
| `PARAGRAPH` | テキスト入力（複数行） | テキストエリア | コメント、意見 |
| `MULTIPLE_CHOICE` | 単一選択（ラジオボタン） | ラジオボタンのリスト | 分類、選択肢から1つ選ぶ場合 |
| `LIST` | 単一選択（ドロップダウン） | セレクトボックス | 分類、選択肢から1つ選ぶ場合 |
| `CHECKBOX` | 複数選択 | チェックボックスのリスト | 複数項目から複数選択 |

### type 選択時の注意

- **`SHORT_TEXT`**: 1行のテキスト入力。`choices` プロパティは不要
- **`PARAGRAPH`**: 複数行のテキスト入力。`choices` プロパティは不要
- **`MULTIPLE_CHOICE`**: ラジオボタン表示。**必ず `choices` プロパティを配列で指定する必要があります**
- **`LIST`**: ドロップダウン（セレクトボックス）表示。**必ず `choices` プロパティを配列で指定する必要があります**
- **`CHECKBOX`**: チェックボックス表示（複数選択可）。**必ず `choices` プロパティを配列で指定する必要があります**

## Spreadsheet の実際の構造

`setup()` が実行されると、以下のような Spreadsheet が自動生成されます。

**ヘッダー行（1行目）**:
```
A列: 名前
B列: メールアドレス
C列: 分類
D列: コメント
```

**データ行（2行目以降）**:
各 Form 送信時に、回答が新規行として自動追加されます。

例:
```
row 2: 太郎 | taro@example.com | 問い合わせ | 商品について質問があります
row 3: 花子 | hanako@example.com | その他 | （空白）
```

## 一元管理戦略

### field.name と field.spreadsheetColumn の関係

- **`field.name`**: Google Form の質問項目のタイトル
  - 例：「名前」「メールアドレス」
  - ユーザーが Form で見るテキスト

- **`field.spreadsheetColumn`**: その質問への回答が Spreadsheet に記録される列
  - 例：「A」「B」「C」
  - ユーザーが Spreadsheet で見るデータが格納される列

### 対応関係の例

| field.name | field.spreadsheetColumn | 動作 |
|-----------|------------------------|------|
| 「名前」 | A | Form で「名前」という質問への回答が、Spreadsheet の **A列** に記録される |
| 「メールアドレス」 | B | Form で「メールアドレス」という質問への回答が、Spreadsheet の **B列** に記録される |
| 「分類」 | C | Form で「分類」という質問への回答が、Spreadsheet の **C列** に記録される |
| 「コメント」 | D | Form で「コメント」という質問への回答が、Spreadsheet の **D列** に記録される |

### スクリプト側での定義

すべての設定項目（質問項目名、列対応、セレクトボックスの選択肢）を、Google Apps Script の 1 つの設定オブジェクトで管理します。

**config.js（仮）:**
```javascript
const FORM_CONFIG = {
  formTitle: "問い合わせフォーム",
  fields: [
    {
      name: "名前",
      type: "SHORT_TEXT",
      required: true,
      spreadsheetColumn: "A"
    },
    {
      name: "メールアドレス",
      type: "SHORT_TEXT",
      required: true,
      spreadsheetColumn: "B"
    },
    {
      name: "分類",
      type: "MULTIPLE_CHOICE",
      required: true,
      spreadsheetColumn: "C",
      choices: ["問い合わせ", "その他"]
    },
    {
      name: "コメント",
      type: "PARAGRAPH",
      required: false,
      spreadsheetColumn: "D"
    }
  ]
};
```

この設定を使って：
1. **Form 作成時**: 質問項目を自動生成
2. **回答取得時**: 質問名から対応する列を自動マッピング
3. **Spreadsheet 書き込み時**: 列順序と型を自動適用

## メリット

- ✅ 設定が 1 箇所で管理できる
- ✅ Form と Spreadsheet の同期が容易
- ✅ 後から項目追加・変更が簡単
