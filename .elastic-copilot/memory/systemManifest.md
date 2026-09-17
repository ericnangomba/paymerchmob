# System Manifest

## Project Overview

- Name: pixel-perfect
- Description: CRCT-enabled project: pixel-perfect
- Created: 2026-09-14T12:27:05.690Z

## Current Status

- Current Phase: Set-up/Maintenance
- Last Updated: 2026-09-16T07:57:54.223Z

## Project Structure

- 9 ts files
- 64 tsx files
- 7 js files

## Dependencies

## Project Directory Structure

- 📂 public/
  - 📄 favicon.ico
  - 📄 favicon.png
  - 📄 manifest.webmanifest
  - 📄 paymerchlogo.png
  - 📄 robots.txt
  - 📄 sw.js
- 📂 src/
  - 📂 assets/
  - 📂 components/
    - 📂 paymerch/
      - 📄 AuthScreen.tsx
      - 📄 BankTopUp.tsx
      - 📄 CashOut.tsx
      - 📄 Dashboard.tsx
      - 📄 PaymerchApp.tsx
      - 📄 PayMode.tsx
      - 📄 RegisterScreen.tsx
      - 📄 Scanner.tsx
      - 📄 SplashScreen.tsx
      - 📄 types.ts
      - 📄 ui.tsx
      - 📄 VasScreen.tsx
    - 📂 ui/
      - 📄 accordion.tsx
      - 📄 alert-dialog.tsx
      - 📄 alert.tsx
      - 📄 aspect-ratio.tsx
      - 📄 avatar.tsx
      - 📄 badge.tsx
      - 📄 breadcrumb.tsx
      - 📄 button.tsx
      - 📄 calendar.tsx
      - 📄 card.tsx
      - 📄 carousel.tsx
      - 📄 chart.tsx
      - 📄 checkbox.tsx
      - 📄 collapsible.tsx
      - 📄 command.tsx
      - 📄 context-menu.tsx
      - 📄 dialog.tsx
      - 📄 drawer.tsx
      - 📄 dropdown-menu.tsx
      - 📄 form.tsx
      - 📄 hover-card.tsx
      - 📄 input-otp.tsx
      - 📄 input.tsx
      - 📄 label.tsx
      - 📄 menubar.tsx
      - 📄 navigation-menu.tsx
      - 📄 pagination.tsx
      - 📄 popover.tsx
      - 📄 progress.tsx
      - 📄 radio-group.tsx
      - 📄 resizable.tsx
      - 📄 scroll-area.tsx
      - 📄 select.tsx
      - 📄 separator.tsx
      - 📄 sheet.tsx
      - 📄 sidebar.tsx
      - 📄 skeleton.tsx
      - 📄 slider.tsx
      - 📄 sonner.tsx
      - 📄 switch.tsx
      - 📄 table.tsx
      - 📄 tabs.tsx
      - 📄 textarea.tsx
      - 📄 toggle-group.tsx
      - 📄 toggle.tsx
      - 📄 tooltip.tsx
  - 📂 hooks/
    - 📄 use-mobile.tsx
  - 📂 lib/
    - 📄 error-capture.ts
    - 📄 error-page.ts
    - 📄 lovable-error-reporting.ts
    - 📄 paymerch-store.tsx
    - 📄 utils.ts
  - 📂 routes/
    - 📄 __root.tsx
    - 📄 index.tsx
    - 📄 preview.$component.tsx
  - 📄 main.tsx
  - 📄 router.tsx
  - 📄 routeTree.gen.ts
  - 📄 server.ts
  - 📄 start.ts
  - 📄 styles.css
- 📄 bunfig.toml
- 📄 eslint.config.js
- 📄 index.html
- 📄 netlify.toml
- 📄 vite.config.ts

## TS Dependencies

### \vite.config.ts

Dependencies:

- @lovable.dev/vite-tanstack-config

### \src\start.ts

Dependencies:

- @tanstack/react-start
- ./lib/error-page

### \src\server.ts

Dependencies:

- ./lib/error-capture
- ./lib/error-page

### \src\routeTree.gen.ts

Dependencies:

- ./routes/__root
- ./routes/index
- ./routes/preview.$component
- ./router.tsx
- ./start.ts

### \src\lib\utils.ts

Dependencies:

- clsx
- tailwind-merge

## TSX Dependencies

### \src\routes\__root.tsx

Dependencies:

- @tanstack/react-query
- react
- ../styles.css?url
- ../lib/lovable-error-reporting

### \src\routes\preview.$component.tsx

Dependencies:

- @tanstack/react-router
- react
- @/lib/paymerch-store
- @/components/paymerch/AuthScreen
- @/components/paymerch/RegisterScreen
- @/components/paymerch/Dashboard
- @/components/paymerch/PayMode
- @/components/paymerch/Scanner
- @/components/paymerch/VasScreen
- @/components/paymerch/CashOut
- @/components/paymerch/BankTopUp
- @/components/paymerch/SplashScreen

### \src\routes\index.tsx

Dependencies:

- @tanstack/react-router
- @/components/paymerch/PaymerchApp

### \src\router.tsx

Dependencies:

- @tanstack/react-query
- @tanstack/react-router
- ./routeTree.gen

### \src\main.tsx

Dependencies:

- react
- react-dom/client
- ./components/paymerch/PaymerchApp
- ./styles.css

## JS Dependencies

### \public\sw.js

No dependencies found

### \eslint.config.js

Dependencies:

- @eslint/js
- eslint-plugin-prettier/recommended
- globals
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
- typescript-eslint

### \.output\public\sw.js

No dependencies found

### \.output\public\assets\preview._component-kB0xsM8z.js

No dependencies found

### \.output\public\assets\index-2vbCdaQc.js

No dependencies found

## Project Directory Structure

- 📂 public/
  - 📄 favicon.ico
  - 📄 favicon.png
  - 📄 jertine-tech-logo.svg
  - 📄 manifest.webmanifest
  - 📄 paymerchlogo.png
  - 📄 robots.txt
  - 📄 sw.js
- 📂 src/
  - 📂 assets/
  - 📂 components/
    - 📂 paymerch/
      - 📄 AuthScreen.tsx
      - 📄 BankTopUp.tsx
      - 📄 CashOut.tsx
      - 📄 Dashboard.tsx
      - 📄 PaymerchApp.tsx
      - 📄 PayMode.tsx
      - 📄 RegisterScreen.tsx
      - 📄 Scanner.tsx
      - 📄 SplashScreen.tsx
      - 📄 types.ts
      - 📄 ui.tsx
      - 📄 VasScreen.tsx
    - 📂 ui/
      - 📄 accordion.tsx
      - 📄 alert-dialog.tsx
      - 📄 alert.tsx
      - 📄 aspect-ratio.tsx
      - 📄 avatar.tsx
      - 📄 badge.tsx
      - 📄 breadcrumb.tsx
      - 📄 button.tsx
      - 📄 calendar.tsx
      - 📄 card.tsx
      - 📄 carousel.tsx
      - 📄 chart.tsx
      - 📄 checkbox.tsx
      - 📄 collapsible.tsx
      - 📄 command.tsx
      - 📄 context-menu.tsx
      - 📄 dialog.tsx
      - 📄 drawer.tsx
      - 📄 dropdown-menu.tsx
      - 📄 form.tsx
      - 📄 hover-card.tsx
      - 📄 input-otp.tsx
      - 📄 input.tsx
      - 📄 label.tsx
      - 📄 menubar.tsx
      - 📄 navigation-menu.tsx
      - 📄 pagination.tsx
      - 📄 popover.tsx
      - 📄 progress.tsx
      - 📄 radio-group.tsx
      - 📄 resizable.tsx
      - 📄 scroll-area.tsx
      - 📄 select.tsx
      - 📄 separator.tsx
      - 📄 sheet.tsx
      - 📄 sidebar.tsx
      - 📄 skeleton.tsx
      - 📄 slider.tsx
      - 📄 sonner.tsx
      - 📄 switch.tsx
      - 📄 table.tsx
      - 📄 tabs.tsx
      - 📄 textarea.tsx
      - 📄 toggle-group.tsx
      - 📄 toggle.tsx
      - 📄 tooltip.tsx
  - 📂 hooks/
    - 📄 use-mobile.tsx
  - 📂 lib/
    - 📄 error-capture.ts
    - 📄 error-page.ts
    - 📄 lovable-error-reporting.ts
    - 📄 paymerch-store.tsx
    - 📄 utils.ts
  - 📂 routes/
    - 📄 __root.tsx
    - 📄 index.tsx
    - 📄 preview.$component.tsx
  - 📄 router.tsx
  - 📄 routeTree.gen.ts
  - 📄 server.ts
  - 📄 start.ts
  - 📄 styles.css
- 📄 bunfig.toml
- 📄 eslint.config.js
- 📄 netlify.toml
- 📄 vite.config.ts

## TS Dependencies

### \vite.config.ts

Dependencies:

- @lovable.dev/vite-tanstack-config

### \src\start.ts

Dependencies:

- @tanstack/react-start
- ./lib/error-page

### \src\server.ts

Dependencies:

- ./lib/error-capture
- ./lib/error-page

### \src\routeTree.gen.ts

Dependencies:

- ./routes/__root
- ./routes/index
- ./routes/preview.$component
- ./router.tsx
- ./start.ts

### \src\lib\utils.ts

Dependencies:

- clsx
- tailwind-merge

## JS Dependencies

### \eslint.config.js

Dependencies:

- @eslint/js
- eslint-plugin-prettier/recommended
- globals
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
- typescript-eslint

### \public\sw.js

No dependencies found

### \.output\public\sw.js

No dependencies found

### \.output\public\assets\SplashScreen-Defybxix.js

No dependencies found

### \.output\public\assets\routes-BdjgQC25.js

No dependencies found

## TSX Dependencies

### \src\routes\__root.tsx

Dependencies:

- @tanstack/react-query
- react
- ../styles.css?url
- ../lib/lovable-error-reporting

### \src\routes\preview.$component.tsx

Dependencies:

- @tanstack/react-router
- react
- @/lib/paymerch-store
- @/components/paymerch/AuthScreen
- @/components/paymerch/RegisterScreen
- @/components/paymerch/Dashboard
- @/components/paymerch/PayMode
- @/components/paymerch/Scanner
- @/components/paymerch/VasScreen
- @/components/paymerch/CashOut
- @/components/paymerch/BankTopUp
- @/components/paymerch/SplashScreen

### \src\routes\index.tsx

Dependencies:

- @tanstack/react-router
- @/components/paymerch/PaymerchApp

### \src\router.tsx

Dependencies:

- @tanstack/react-query
- @tanstack/react-router
- ./routeTree.gen

### \src\lib\paymerch-store.tsx

Dependencies:

- react

## Project Directory Structure

- 📂 public/
  - 📄 favicon.ico
  - 📄 favicon.png
  - 📄 paymerchlogo.png
  - 📄 robots.txt
- 📂 src/
  - 📂 assets/
  - 📂 components/
    - 📂 paymerch/
      - 📄 AuthScreen.tsx
      - 📄 CashOut.tsx
      - 📄 Dashboard.tsx
      - 📄 PaymerchApp.tsx
      - 📄 PayMode.tsx
      - 📄 RegisterScreen.tsx
      - 📄 Scanner.tsx
      - 📄 SplashScreen.tsx
      - 📄 types.ts
      - 📄 ui.tsx
      - 📄 VasScreen.tsx
    - 📂 ui/
      - 📄 accordion.tsx
      - 📄 alert-dialog.tsx
      - 📄 alert.tsx
      - 📄 aspect-ratio.tsx
      - 📄 avatar.tsx
      - 📄 badge.tsx
      - 📄 breadcrumb.tsx
      - 📄 button.tsx
      - 📄 calendar.tsx
      - 📄 card.tsx
      - 📄 carousel.tsx
      - 📄 chart.tsx
      - 📄 checkbox.tsx
      - 📄 collapsible.tsx
      - 📄 command.tsx
      - 📄 context-menu.tsx
      - 📄 dialog.tsx
      - 📄 drawer.tsx
      - 📄 dropdown-menu.tsx
      - 📄 form.tsx
      - 📄 hover-card.tsx
      - 📄 input-otp.tsx
      - 📄 input.tsx
      - 📄 label.tsx
      - 📄 menubar.tsx
      - 📄 navigation-menu.tsx
      - 📄 pagination.tsx
      - 📄 popover.tsx
      - 📄 progress.tsx
      - 📄 radio-group.tsx
      - 📄 resizable.tsx
      - 📄 scroll-area.tsx
      - 📄 select.tsx
      - 📄 separator.tsx
      - 📄 sheet.tsx
      - 📄 sidebar.tsx
      - 📄 skeleton.tsx
      - 📄 slider.tsx
      - 📄 sonner.tsx
      - 📄 switch.tsx
      - 📄 table.tsx
      - 📄 tabs.tsx
      - 📄 textarea.tsx
      - 📄 toggle-group.tsx
      - 📄 toggle.tsx
      - 📄 tooltip.tsx
  - 📂 hooks/
    - 📄 use-mobile.tsx
  - 📂 lib/
    - 📄 error-capture.ts
    - 📄 error-page.ts
    - 📄 lovable-error-reporting.ts
    - 📄 paymerch-store.tsx
    - 📄 utils.ts
  - 📂 routes/
    - 📄 __root.tsx
    - 📄 index.tsx
  - 📄 router.tsx
  - 📄 routeTree.gen.ts
  - 📄 server.ts
  - 📄 start.ts
  - 📄 styles.css
- 📄 bunfig.toml
- 📄 eslint.config.js
- 📄 netlify.toml
- 📄 vite.config.ts

## TS Dependencies

### \vite.config.ts

Dependencies:

- @lovable.dev/vite-tanstack-config

### \src\start.ts

Dependencies:

- @tanstack/react-start
- ./lib/error-page

### \src\server.ts

Dependencies:

- ./lib/error-capture
- ./lib/error-page

### \src\routeTree.gen.ts

Dependencies:

- ./routes/__root
- ./routes/index
- ./router.tsx
- ./start.ts

### \src\lib\utils.ts

Dependencies:

- clsx
- tailwind-merge

## TSX Dependencies

### \src\routes\__root.tsx

Dependencies:

- @tanstack/react-query
- react
- ../styles.css?url
- ../lib/lovable-error-reporting

### \src\routes\index.tsx

Dependencies:

- @tanstack/react-router
- @/components/paymerch/PaymerchApp

### \src\router.tsx

Dependencies:

- @tanstack/react-query
- @tanstack/react-router
- ./routeTree.gen

### \src\lib\paymerch-store.tsx

Dependencies:

- react

### \src\hooks\use-mobile.tsx

Dependencies:

- react

## JS Dependencies

### \eslint.config.js

Dependencies:

- @eslint/js
- eslint-plugin-prettier/recommended
- globals
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
- typescript-eslint

### \.output\public\assets\routes-CuzF0h3e.js

No dependencies found

### \.output\public\assets\index-DlaBJV3L.js

No dependencies found

## Key Components

- TBD

## Integration Points

- TBD

## Technical Considerations

- TBD

## Implementation Notes

- TBD
