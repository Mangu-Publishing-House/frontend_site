# RUNBOOK: Manuscript Upload & Antivirus Scanning

**Owner:** accounting@mangu-publishers.com
**Stack:** Vercel Blob + Next.js server action + optional AV scanning

---

## Current State

Manuscript uploads are handled by:

| File                                   | Purpose                                                       |
| -------------------------------------- | ------------------------------------------------------------- |
| `app/(portals)/author/upload/page.tsx` | Upload UI (author-facing)                                     |
| `lib/storage/`                         | Vercel Blob upload helpers                                    |
| `app/api/files/[id]/route.ts`          | Authenticated download with purchase/role check               |
| `next.config.js`                       | `*.public.blob.vercel-storage.com` in `images.remotePatterns` |

Upload flow:

1. Author selects DOCX/PDF/EPUB file in the upload form
2. File is sent to a server action / API route
3. Server action calls `put(path, file, { access: 'public' })` on Vercel Blob
4. Blob URL is saved to `books.manuscript_url` in MongoDB
5. File is accessible via `/api/files/[id]` (auth + purchase check)

---

## File size limits

| Setting                     | Value   | Where                                            |
| --------------------------- | ------- | ------------------------------------------------ |
| Server action body size     | 1 MB    | `next.config.js` → `serverActions.bodySizeLimit` |
| Vercel Blob max file size   | 500 MB  | Vercel Blob plan limit                           |
| Recommended manuscript size | ≤ 50 MB | Documented in upload UI                          |

> **Note:** The 1 MB server action limit applies to JSON/form bodies. For large file
> uploads, use the direct Vercel Blob client-side upload pattern (`createUploadUrl`)
> so the file goes directly to Blob without passing through the Next.js function.

---

## Large file upload pattern (recommended for manuscripts > 1 MB)

```typescript
// app/api/manuscripts/upload-url/route.ts
import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getAuth } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => ({
      allowedContentTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/epub+zip',
      ],
      maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
      tokenPayload: JSON.stringify({ userId: session.user.id }),
    }),
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const { userId } = JSON.parse(tokenPayload ?? '{}');
      // Save blob.url to MongoDB (manuscripts in review)
      console.log('[upload] completed', { blobUrl: blob.url, userId });
    },
  });

  return NextResponse.json(jsonResponse);
}
```

---

## Antivirus scanning (HUMAN GATE — optional)

MANGU currently does **not** scan uploaded manuscripts for malware. For a publishing
platform accepting files from third-party authors, AV scanning is recommended before
files are made available to readers.

### Option A: Vercel Blob webhook + ClamAV

1. Set a Vercel Blob webhook to notify your API when a new file is uploaded
2. API route downloads the file and passes it to a ClamAV HTTP API (e.g. [clamav-rest](https://github.com/solita/clamav-rest))
3. If clean: mark the manuscript as `av_status: 'clean'` in MongoDB
4. If infected: delete from Blob, mark manuscript as `av_status: 'quarantined'`, alert operator

### Option B: Azure Defender for Storage

If MANGU uploads are mirrored to Azure Blob Storage (via Power Automate flow #9 in MSFT-INTEGRATION.md),
Azure Defender for Storage provides built-in malware scanning with no additional code.

### Option C: Accept the risk (current)

For a small-volume publisher with trusted authors, the risk of a malicious upload is low.
Current mitigations:

- Only authenticated authors (role = `author`) can upload
- Files are served via `/api/files/[id]` with auth + purchase check, not as public URLs
- Manuscript MIME types are restricted in the upload form

---

## Upload path structure

Files in Vercel Blob follow this naming convention:

```
{userId}/{covers|manuscripts}/{uuid}-{sanitized-filename}

Examples:
  6842f3a1b2c3d4e5f6789012/manuscripts/a1b2c3d4-my-novel-final.docx
  6842f3a1b2c3d4e5f6789012/covers/e5f6a7b8-my-novel-cover.jpg
```

---

## Troubleshooting

| Symptom                           | Likely Cause                                                    | Fix                                         |
| --------------------------------- | --------------------------------------------------------------- | ------------------------------------------- |
| Upload fails with 413             | File > server action body limit                                 | Use client-side upload pattern (see above)  |
| Upload succeeds but URL not in DB | `onUploadCompleted` not saving                                  | Check Vercel function logs for error        |
| File not accessible after upload  | `books.manuscript_url` not updated                              | Check MongoDB `books` collection            |
| `/api/files/[id]` returns 403     | User not purchased / not admin/author-owner                     | Verify order in MongoDB `orders` collection |
| Blob URL expires                  | Vercel Blob public URLs don't expire; private URLs have 1hr TTL | Use `access: 'public'` for manuscripts      |

---

_Runbook v1.0 — 2026-09-18_
