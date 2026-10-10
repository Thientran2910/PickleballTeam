# Read-only API source evidence — 2026-10-10

Coordinator opened the supplied Sheet in Chrome, selected Extensions → Apps Script, and read Dashboard.gs in the existing linked project. No source edits, saves, runs, deployments, or Sheet writes were performed.

Source editor: https://script.google.com/u/0/home/projects/17NCcpP-Nfo-heaQBnf6JYRhBpXf2WHARrCodoc6ACUScV9_OUChQWgDv/edit

## Verified mappings in Dashboard.gs

```js
sessions: { id: 0, date: 1, activity: 2, venue: 3, start: 4, end: 5,
  courts: 6, guests: 7, memberCount: 8, courtCost: 9, totalCost: 10, status: 11 }
refunds: { date: 0, expenseId: 1, member: 2, amount: 3, method: 4 }
matches: { date: 10, team1Player1: 11, team1Player2: 12, team2Player1: 13,
  team2Player2: 14, team1Score: 15, team2Score: 16, winner: 17, validation: 18, sessionId: 19 }
```

Indices above are zero-based Sheet column mappings, not example values. The field names on the left are the actual upstream JSON keys. Sessions do not include a list of attendees, only memberCount/guests.

## Serialization

pbDashboardRows_ reads getValues(). It keeps a row if the configured key cell is neither empty string nor null; it does not filter validation. Date values are formatted by Utilities.formatDate in Asia/Ho_Chi_Minh as yyyy-MM-ddTHH:mm:ss with +07:00 appended. Other values are passed unchanged, including numeric cells, strings and empty cells. Time cells may therefore be serialized with an 1899 date; interpret start/end as clock times and preserve the represented HH:mm, rather than applying historical timezone offsets.

## Match validity evidence from Sheet formulas

BẢNG XẾP HẠNG!S6:S7 returns Hợp lệ, Thiếu dữ liệu or Không hợp lệ. A valid match requires date, four distinct existing members, two integer nonnegative scores, and unequal scores. R6:R7 only emits winner Đội 1/Đội 2 when validation is Hợp lệ. Adapters should require the valid upstream status and correct field types; invalid records are identified separately, never treated as empty data or ranked on the client.

## Limits of evidence

This is the existing editor source, with mappings consistent with currently populated live arrays. The empty arrays still provide no live nonempty sample; use sanitized synthetic fixtures with these verified keys. Do not create records in the real Sheet just to test. Current editor inspection does not prove security of unrelated bot/write handlers.
