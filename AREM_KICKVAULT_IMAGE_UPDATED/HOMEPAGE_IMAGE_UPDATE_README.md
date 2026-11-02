# AREM KICKVAULT — Complete Homepage Image Update

This is the **whole updated AREM KICKVAULT application**, built from the last ZIP you uploaded (`AREM_KICKVAULT_Supabase_Ready (6)(5).zip`). All original project files are retained, and the Home feed was updated with 14 individual 9:16 streetwear demo photos.

## Homepage changes

- 14 separate shoe-focused streetwear editorial `.webp` image assets: `src/assets/home/streetwear/`
- `src/components/HomeFeed.tsx` now includes those images as 14 new **Demo** posts in **Home → For You**. Genuine member posts still come first.
- The foreground photo uses `object-contain` for **all screen sizes**, so the complete shoe, outfit and edges remain visible instead of being cut off.
- A blurred full-screen backdrop fills letterbox space when an image doesn't match the device aspect ratio; there are no hard black bands.
- Older photo posts also use contain; Home photo viewer still supports zooming into details.
- Existing Supabase integration, routes, authentication and feed interactions are preserved.

**Image authenticity:** These are **original AI editorial examples** cropped into 14 independent 9:16 files from two generated lookbook compositions, not verified exact replicas of every specific sneaker in your ZIP. They are not real member submissions. The AI image generation function is **not** installed in this update.

## How to open in Windows VS Code

1. Download and extract the ZIP, keeping the folder structure intact.
2. Open **File → Open Folder** in VS Code and choose `AREM_KICKVAULT_IMAGE_UPDATED`, the folder containing `package.json`.
3. Copy `.env.local` from your existing **AREM_KICKVAULT_Supabase_Ready (6)** project into the updated folder. It is intentionally NOT included in this download. Never upload or share it.
4. In the VS Code Terminal, run `npm.cmd install` and then `npm.cmd run dev` (this avoids the PowerShell npm.ps1 execution restriction you previously saw).
5. Open the localhost link shown in the terminal, then **Home → For You**. Swipe/scroll to see the 14 new photo posts.
6. You can tap a photo or **Zoom** to inspect the entire image.

**What isn't automatically done:** this is a local file update, not a deployment. To publish, deploy the revised source with your hosting platform. Supabase must be active, and any live auth/data features still require correct database setup and permissions.
