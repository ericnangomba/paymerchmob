# Inclusive Paymerch splash and merchant experience

## What will change

- Add a short Paymerch splash screen that appears when the app opens, using the existing logo and tagline.
- Transition smoothly from the splash screen into the PIN screen, while respecting reduced-motion settings.
- Update the merchant-facing wording so the app clearly welcomes spaza shops, street vendors, car washes, tshisa nyama, street-food stalls, and fruit-and-vegetable sellers without assuming a bank account or one business type.
- Keep all existing payment, vending, cash-out, offline, theme, and locking behavior unchanged.

## Technical details

- Add the splash state and timed transition within the existing mobile app shell.
- Create a focused splash component using current Paymerch assets and design tokens.
- Replace the fixed demo merchant name with inclusive demo wording where appropriate.
- Check the opening transition and unlocked dashboard on desktop and mobile-sized views, then confirm the current build is healthy.
