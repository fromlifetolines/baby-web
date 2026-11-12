# Baby-Web Firebase / GitHub 安全事件處置記錄
日期：2026-11-12 (Asia/Taipei)  
專案：`fromlifetolines/baby-web` / Firebase 專案 `baby-web-1a142`  
狀態：**待 Firebase Console 實際查核與處置；本分支未改動正式環境**

## 已證實的事實
- GitHub Secret Scanning 偵測到 `src/config/firebase.ts` 中的 Firebase Web SDK `apiKey`，其他命中部分來自編譯輸出或歷史提交。此文件刻意不重貼金鑰。
- 儲存庫為公開 `public`，正式頁面配置包含 `gh-pages` 分支。
- 官方 Firebase 文件明確說明：**僅用於 Firebase 服務並受到 API 限制的 Firebase Web API Key 本來就可以公開**；它不是資料庫的管理員憑證。不能單憑此警報判定資料外洩。
- `src/App.tsx`、`src/components/AdminPanel.tsx`、`src/components/AgencyDashboardView.tsx` 使用硬編碼前端口令或 localStorage 當成管理員權限判定，不是安全的後端授權。
- `src/config/firebase.ts` 用瀏覽器 Firestore SDK 執行 `setDoc` 更新設定與遊戲狀態、`writeBatch.delete` 清空猜測資料。能否未授權執行，取決於**目前 Firebase Console 正式生效的 Firestore Security Rules**。
- 原始碼儲存庫內**沒有 Firestore rules 檔案**；這不等同正式雲端規則不存在，也無法得知正式權限。
- 尚無雲端稽核紀錄、實際權限測試或金鑰限制查核的證據，**不能宣稱已遭駭或已全面修復**。

## P0：先在 Firebase / Google Cloud Console 人工執行
1. 登入 **Firebase Console**：https://console.firebase.google.com/project/baby-web-1a142/firestore/rules
2. 選 **Cloud Firestore → Rules**。**完整備份原本規則與發布時間**，核對是否有 `allow read, write: if true`、`allow write: if true`，或沒有確實限制各個寫入路徑的規則。若發現未授權者可修改或刪除資料，視為高優先風險。
3. 若有證據指出資料正在遭到竄改，需立即封鎖讀寫且可以接受活動即時同步暫停，可採用緊急封鎖規則（需在 Firebase Console 手動發布）：

   ```firestore-rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```

   **重大影響**：這會拒絕所有瀏覽器端 Firestore 存取，投票、開獎、設定同步與展示資料可能停止或退回本機快取。請先匯出資料且理解影響再採取；這不是正常營運的最終規則。
4. 對照本分支 `security/firestore.rules.proposed`，逐條確認房間讀寫需求與已上線規則。**不可將示範規則當成已驗收的正式設定**：示範規則保留公開參加者姓名及訪客提交投票功能，而且管理員寫入會被拒絕，直到導入 Firebase Authentication + 可信任的 `admin` custom claim。亦須防範濫用投票（App Check、速率限制或後端）。
5. **Google Cloud Console**：https://console.cloud.google.com/apis/credentials?project=baby-web-1a142 。確認相同金鑰僅允許 Firebase 所需 API，**沒有**包含 Generative Language API、Places 或其他不必要的計費 API；依實際 Firebase SDK 用途測試後調整。請勿未測試就撤銷或刪除金鑰。
6. 檢查 Cloud Monitoring／相關 API 使用量、Cloud Audit Logs（如已啟用）、Firestore 操作量與帳單是否有異常。沒開啟的稽核功能無法追溯過去事件。
7. 若確認金鑰已被拿去使用其他受限／計費 API、出現濫用或限制無法排除風險：在 Google Cloud 建立**權限受限的新金鑰**，同步更新網站與所有部署版本、驗證後才撤銷舊金鑰。只改 GitHub 原始檔無法撤回已公開的舊金鑰。
8. GitHub 警報在前述查核完成後再關閉。若確認為設計上允許公開的 Firebase 專用金鑰，按 GitHub 提供的適當理由排除警報；**不得將關閉警報解讀為 Security Rules 通過**。

## P1：需另案實作的必要修補
- 移除所有前端硬編碼管理員口令、可直接開啟管理員的 URL 參數捷徑、以 localStorage 決定管理員權限的做法。
- 主持人與代理商後台需由 Firebase Authentication 驗證，**FireStore Security Rules** 授權檢查必須在伺服器端執行；不可只靠前端按鈕、顯示狀態或 PIN。
- 批次刪除與設定變更必須只開放給可信任主持人。為多租戶擴充時須設計每個房間的角色與授權，不可讓任何 `admin` 控制全部房間。
- 儲存失敗時不得假裝成功：目前 `firebase.ts` 多處 catch 後只寫 console 或 fallback 到 localStorage，使用者可能以為雲端更新成功。
- 實施 Firestore 規則單元測試、Firestore Emulator 驗證（訪客讀取、投票、未授權修改或刪除、主持人登入／登出），再以獨立 PR 整合程式。
- 針對使用者姓名與寶寶相關素材進行公開性與隱私檢查；公開原始碼與 GitHub Pages 皆可能讓第三方取得已公開的靜態內容。

## 上線前不可略過的驗收
- Firebase Console 規則已確認及有備份；測試無匿名管理員寫入及刪除。
- 管理員使用 Firebase Authentication，沒有單靠瀏覽器端口令放行的操作。
- 訪客功能依產品政策通過驗收；若仍開放匿名讀取參加者姓名，取得資料分享同意。
- API Key 已套用必要的 Firebase API 限制；若有輪替，舊 Key 已在更新後撤銷。
- GitHub Pages 正式版、手機及桌機實際檢測；檢視異常流量與帳單。
- **未完成以上項目不得標示 Incident Resolved。**

官方參考：
- https://firebase.google.com/docs/projects/api-keys
- https://firebase.google.com/docs/firestore/security/insecure-rules
- https://firebase.google.com/docs/auth/admin/custom-claims
