type ReceiptData = {
  readonly transferId: string;
  readonly senderName: string;
  readonly recipientName: string;
  readonly sendAmount: string;
  readonly receiveAmount: string;
  readonly fxRate: string;
  readonly fee: string;
  readonly status: string;
  readonly date: string;
};

export class ReceiptService {
  generateHtml(data: ReceiptData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transfer Receipt — Payvio</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #0f172a; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 700; color: #4f46e5; }
    .title { font-size: 14px; color: #64748b; margin-top: 4px; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; }
    .label { color: #64748b; font-size: 14px; }
    .value { font-weight: 600; font-size: 14px; }
    .amounts { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 16px 0; }
    .amount-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .amount-label { color: #64748b; font-size: 13px; }
    .amount-value { font-size: 20px; font-weight: 700; }
    .receive-value { color: #4f46e5; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #ecfdf5; color: #059669; }
    .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Payvio</div>
    <div class="title">Transfer Receipt</div>
  </div>

  <div class="row">
    <span class="label">Transfer ID</span>
    <span class="value">${data.transferId}</span>
  </div>
  <div class="row">
    <span class="label">Date</span>
    <span class="value">${data.date}</span>
  </div>
  <div class="row">
    <span class="label">Status</span>
    <span class="status">${data.status}</span>
  </div>

  <hr class="divider">

  <div class="row">
    <span class="label">From</span>
    <span class="value">${data.senderName}</span>
  </div>
  <div class="row">
    <span class="label">To</span>
    <span class="value">${data.recipientName}</span>
  </div>

  <div class="amounts">
    <div class="amount-row">
      <span class="amount-label">You sent</span>
      <span class="amount-value">${data.sendAmount}</span>
    </div>
    <div class="amount-row">
      <span class="amount-label">They received</span>
      <span class="amount-value receive-value">${data.receiveAmount}</span>
    </div>
  </div>

  <div class="row">
    <span class="label">Exchange Rate</span>
    <span class="value">${data.fxRate}</span>
  </div>
  <div class="row">
    <span class="label">Fee</span>
    <span class="value">${data.fee}</span>
  </div>

  <hr class="divider">

  <div class="footer">
    <p>Payvio &mdash; Send money home, instantly</p>
    <p>&copy; 2025 Payvio. All rights reserved.</p>
    <p>Licensed and regulated by FinCEN and FCA.</p>
  </div>
</body>
</html>`;
  }
}
