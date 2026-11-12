# FLTL × Baby-Web｜P0 安全登入與 Firestore 復原工程工單

**Mode: LOCAL REVIEW → DRAFT PR ONLY / ZERO MERGE / ZERO DEPLOY**  
2026-11-12，來源：GitHub `fromlifetolines/baby-web`，Firebase 專案 `baby-web-1a142`。

## 0. 背景與鐵則

- 使用者已在 Firebase Authentication 建立電子郵件／密碼帳號。
- 使用者已在 Firebase Console 建立管理員授權文件：
  `rooms/xingwei/admins/<Firebase Authentication UID>`，`active: true` (boolean)，`role: "owner"` (string)。
- Firestore **正式生效**規則是全面拒絕用戶端讀寫：`allow read, write: if false;`，為緊急防護。**不可在驗收前更改**。
- GitHub 已公開的金鑰是 Firebase Web API Key；Cloud Console 已設定 GitHub Pages HTTP referrer 限制與 25 個允許 API。不得在程式內產生或要求新的祕密金鑰。
- 一切以 GitHub 最新主線與現有檔案為準：先 `git status`、`git log`、`git diff`，檢查工作樹。若本機與遠端不同，先回報，**不可直接覆寫**。
- **禁止**改 `main`、`gh-pages`、Firebase 正式規則、正式頁面或其他 FLTL 官網專案；不得自動 `git push`、建立可直接合併 PR、執行 `gh-pages` 發布。可在獨立分支完成本機修補與測試，以 PR 草稿呈現變更。
- 不收集或顯示密碼、完整 UID、API Key、服務帳戶私鑰；不可把上述資訊寫入 commit/日誌。

## 1. P0 安全缺陷與具體檔案

| 檔案 | 已查核問題 | 修復 |
|---|---|---|
| `src/App.tsx` | `?admin=...` 存在固定 PIN 預解鎖；「快速客製化」按鈕可直接開啟設定；操作顯示假成功 | 移除 URL 通關捷徑、授權檢查、保護設定入口與操作回饋 |
| `src/components/AdminPanel.tsx` | 主持人固定 PIN `0819` 寫在 bundle | 改 Firebase Auth 電子郵件／密碼登入，並驗證該房間 `admins/{uid}` |
| `src/components/AgencyDashboardView.tsx` | 固定「合作夥伴授權碼」、一鍵解鎖、`localStorage` 授權布林值 | 移除假性授權；使用可信任的身分／房間授權檢查，尚未實作正式機制者必須禁用該入口 |
| `src/config/firebase.ts` | 多處 catch 只印 console 後當成功，訪客投票可能只落 localStorage | 寫入必須 fail-closed，失敗回傳明確錯誤，網頁不能回報「已成功寫入大典紀錄」 |
| `src/components/PartyCustomizerModal.tsx` | 顯示層可開設定，但不得作為真正授權 | 檢查已授權主持人、錯誤訊息；Firestore Rules 必須最終阻擋未授權寫入 |
| `src/components/LandingPageView.tsx` | 試算「付款成功／開通房間」屬前端模擬；不要混同真實授權 | 本次禁止宣稱新房間具有真實安全授權或付款完成；另建修復議題 |

## 2. 登入狀態與授權驗證

- 在 Firebase Web SDK 使用 `getAuth(app)`、`onAuthStateChanged()` 和 `signInWithEmailAndPassword()`。
- 驗證成功後，查詢 **目前房間** 的 `rooms/{roomId}/admins/{auth.currentUser.uid}`，**必須同時**滿足 `active === true`、`role === "owner"` 才顯示管理功能。
- `auth.currentUser == null`、不同房間、權限文件不存在、`active: false`、Firestore 請求失敗、切換帳號或登出，一律清除前端已授權狀態。
- 建議登入狀態集中於 App/hook，所有受保護按鈕共用同一份鑑權結果；避免 AdminPanel 已關閉但 PartyCustomizer 仍可開啟。
- 不要將授權結果存為 `localStorage=true`，也不能將 UID、電子郵件、query string 或 token 字串直接當成管理員憑證。Firebase Authentication 提供登入，Firestore Rules 執行伺服器端授權。
- 用戶端不允許創建、修改、刪除 `admins/{uid}`；管理員授權必須由 Firebase Console／可信任後端執行。

## 3. Firestore 規則（草案，不能直接貼上正式環境）

請以 `security/firestore.rules.proposed` 為候選方案，先在 **Firebase Emulator** 驗證：

- `get/exists` 根據 `rooms/{roomId}/admins/{request.auth.uid}` 判定 `active=true && role=owner`。
- `admins/{uid}` 僅允許本人讀取自己的授權文件，不許任何網頁端寫入。
- `settings/config` 與 `gameState/current`：維持訪客讀取，只有該房間的 owner 能寫入。
- `guesses/{id}`：允許訪客提交符合欄位與格式約束的新投票，不許修改／刪除；owner 才能清除資料。
- **隱私決策待確認**：現有儀表板即時列出參加者姓名，候選規則因此容許公開讀取 `guesses`。若要保護姓名，必須同步改寫前端資料模型與匿名統計後端，不得聲稱現在資料全為私密。
- **反垃圾投票仍未完成**：App Check、伺服器端節流／每人次數限制需另行設計；目前「只驗證 name 長度」不代表可防濫用。
- 參考：https://firebase.google.com/docs/firestore/security/rules-conditions

## 4. 必做測試（至少）

在 Firestore Emulator 建立模擬資料，不連接正式資料庫：

1. 匿名訪客：可讀公開活動 config、gameState；在業務允許下可新增格式正確的猜測。
2. 匿名訪客：**不可**更新設定、開獎、修改票、刪除票、讀取管理員文件。
3. 已登入但未授權使用者：**不可**修改任何房間設定或資料。
4. `rooms/xingwei/admins/{UID}` `active: false`：不可修改。
5. xingwei 授權 owner：可以更新 xingwei 的設定與開獎，但**不可**更新其他房間。
6. 管理員授權文件被刪除／停權後，在重新查核與安全規則層都應拒絕後續寫入。
7. `submitGuessToDb()` 服務拒絕時，前端**不可**顯示「成功寫入」，需明確告知重試或連線失敗。
8. `updatePartyConfigInDb()`、`updateGameStateInDb()`、`resetAllGuessesInDb()` 發生錯誤時，不可偽裝雲端成功；批次中斷要可識別與追蹤。
9. UI：測試 `?admin=0819`、Agency 一鍵解鎖、直接開啟 Studio，全部不應繞過 Auth。
10. `npm ci`、`npm run build`、TypeScript 編譯（需與專案設定一致），測試手機及桌面，測試 GitHub Pages base path。
11. 完整稽核 repo 中所有固定通關碼、`localStorage` 假授權，以及附帶安全資訊的日誌／產物；不可只修被掃描的檔案。

## 5. 上線順序與回復機制

- 在本機完成 Auth／Rules／失敗回饋，經 Emulator 測試，先由主理人核准整體變更。
- 調整 Firebase Authentication → Settings → Authorized domains 的 GitHub Pages 網域（如適用），並驗證 email/password 登入。
- **切換窗口**：先部署新版帶驗證的前端，再發布測試通過的最小權限 Firestore 規則；過程中保持 `if false`，必要時短暫停用雲端功能，避免舊版利用放寬的規則讀寫。
- 待新站確實運作後，以非管理員無痕模式、真正管理員與不同房間測試讀寫；最後再評估 GitHub Secret Scanning 警報的正確結案理由。
- 遇到問題，先保持／恢復 `if false` 緊急規則，不回復 `if true`。
- GitHub PR 並非正式 Firestore 規則部署的證據；發布 Firebase Rules 需另外實際確認。

## 6. 交付

請提交：
- 變更檔案清單與逐項原因、風險分析；
- 具體的 TypeScript／UI 改動（獨立分支或本機 patch）；
- Firestore rules／測試用例／結果；
- `npm run build` 與測試輸出摘要；
- 手機與桌機 UI 驗收截圖；
- 不包含敏感資料的操作紀錄；
- 明確標示 **ZERO MERGE / ZERO DEPLOY**，尚待主理人驗收。

> **嚴禁**為了讓畫面「看起來正常」而將 Firestore 改回 `if true` 或繼續默默把投票改存本機。
