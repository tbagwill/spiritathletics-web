interface OrderEmailData {
  orderId: string;
  customerName: string | null;
  customerEmail: string;
  campaignTitle: string;
  campaignEndDate: string;
  totalCents: number;
  lineItems: Array<{
    productName: string;
    sizeName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

export function generateOrderConfirmationEmail(order: OrderEmailData): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
  const lineItemsHtml = order.lineItems
    .map(item => `
      <tr>
        <td style="padding: 16px 12px; border-bottom: 1px solid #e2e8f0;">
          <div style="font-weight: 600; color: #1e293b; font-size: 15px; margin-bottom: 4px;">${item.productName}</div>
          <div style="font-size: 13px; color: #64748b; background-color: #f1f5f9; display: inline-block; padding: 2px 8px; border-radius: 4px;">Size: ${item.sizeName}</div>
        </td>
        <td style="padding: 16px 12px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600; font-size: 15px;">
          ${item.quantity}
        </td>
        <td style="padding: 16px 12px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #059669; font-size: 16px;">
          $${(item.lineTotal / 100).toFixed(2)}
        </td>
      </tr>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Spirit Athletics</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb;">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:100%;">
              <!-- Header Image -->
              <tr>
                <td style="padding:0;">
                  <img src="${baseUrl}/images/WebEmails-Shopping.png" alt="Spirit Athletics Shopping" width="600" style="display:block;width:100%;height:auto;border:0;">
                </td>
              </tr>
              
              <!-- Success Banner -->
              <tr>
                <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:24px 40px;text-align:center;">
                  <div style="display:inline-block;width:56px;height:56px;background-color:rgba(255,255,255,0.2);border-radius:50%;line-height:56px;margin-bottom:12px;">
                    <span style="color:#ffffff;font-size:32px;">✓</span>
                  </div>
                  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;line-height:1.3;">
                    Order Confirmed!
                  </h1>
                  <p style="margin:8px 0 0 0;color:rgba(255,255,255,0.95);font-size:16px;">
                    Thanks for your support, ${order.customerName || 'Spirit Athlete'}!
                  </p>
                </td>
              </tr>
              
              <!-- Order Summary -->
              <tr>
                <td style="padding:32px 40px 24px 40px;">
                  <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:8px;padding:20px 24px;margin-bottom:32px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                            Campaign
                          </p>
                          <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
                            ${order.campaignTitle}
                          </p>
                        </td>
                        <td align="right">
                          <p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                            Order #
                          </p>
                          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">
                            ${order.orderId.slice(-8).toUpperCase()}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <h2 style="margin:0 0 20px 0;color:#1e293b;font-size:20px;font-weight:700;">
                    Your Items
                  </h2>
                </td>
              </tr>
              
              <!-- Order Items Table -->
              <tr>
                <td style="padding:0 40px 32px 40px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:2px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                    <thead>
                      <tr style="background-color:#f8fafc;">
                        <th style="padding:14px 12px;text-align:left;font-weight:700;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">
                          Product
                        </th>
                        <th style="padding:14px 12px;text-align:center;font-weight:700;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">
                          Qty
                        </th>
                        <th style="padding:14px 12px;text-align:right;font-weight:700;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      ${lineItemsHtml}
                    </tbody>
                    <tfoot>
                      <tr style="background-color:#f0fdf4;">
                        <td colspan="2" style="padding:18px 12px;text-align:right;font-weight:700;color:#166534;font-size:16px;border-top:2px solid #10b981;">
                          Order Total:
                        </td>
                        <td style="padding:18px 12px;text-align:right;font-weight:800;color:#059669;font-size:22px;border-top:2px solid #10b981;">
                          $${(order.totalCents / 100).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </td>
              </tr>
              
              <!-- What's Next -->
              <tr>
                <td style="padding:0 40px 32px 40px;">
                  <div style="background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border-radius:8px;padding:24px;border-left:4px solid #3b82f6;">
                    <h3 style="margin:0 0 16px 0;color:#1e40af;font-size:18px;font-weight:700;">
                      📦 What Happens Next?
                    </h3>
                    <div style="color:#1e40af;font-size:14px;line-height:1.8;">
                      <div style="margin-bottom:10px;padding-left:20px;position:relative;">
                        <strong style="display:block;margin-bottom:2px;">✅ Payment Processed</strong>
                        <span style="color:#1e3a8a;">Your order is confirmed and payment has been received</span>
                      </div>
                      <div style="margin-bottom:10px;padding-left:20px;position:relative;">
                        <strong style="display:block;margin-bottom:2px;">📅 Campaign Closes: ${new Date(order.campaignEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                        <span style="color:#1e3a8a;">We'll place the bulk order once the campaign ends</span>
                      </div>
                      <div style="margin-bottom:10px;padding-left:20px;position:relative;">
                        <strong style="display:block;margin-bottom:2px;">🏭 Production Time: 6-8 Weeks</strong>
                        <span style="color:#1e3a8a;">High-quality custom items take time to manufacture</span>
                      </div>
                      <div style="margin-bottom:10px;padding-left:20px;position:relative;">
                        <strong style="display:block;margin-bottom:2px;">🚚 Delivery to Gym</strong>
                        <span style="color:#1e3a8a;">Items will be shipped to Spirit Athletics facility</span>
                      </div>
                      <div style="padding-left:20px;position:relative;">
                        <strong style="display:block;margin-bottom:2px;">📱 Pickup Notification</strong>
                        <span style="color:#1e3a8a;">We'll email you when your order is ready for pickup!</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Important Note -->
              <tr>
                <td style="padding:0 40px 32px 40px;">
                  <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:20px;border-radius:6px;">
                    <h4 style="margin:0 0 10px 0;color:#92400e;font-size:16px;font-weight:700;">
                      ⚠️ This is a Preorder
                    </h4>
                    <p style="margin:0 0 12px 0;color:#78350f;font-size:14px;line-height:1.6;">
                      We place bulk orders after the campaign closes to offer the best pricing and ensure top quality. Your items will be available for pickup at the gym once production is complete.
                    </p>
                    <p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">
                      <strong>Need to modify or refund your order?</strong> Please visit the front office during operating hours. Our staff will be happy to assist you with any changes or concerns.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- No Reply Warning -->
              <tr>
                <td style="padding:0 40px 32px 40px;">
                  <div style="background-color:#fee2e2;border:2px solid #fecaca;border-radius:8px;padding:16px;text-align:center;">
                    <p style="margin:0 0 6px 0;color:#dc2626;font-size:15px;font-weight:700;">
                      ⚠️ This is a No-Reply Email
                    </p>
                    <p style="margin:0;color:#7f1d1d;font-size:13px;line-height:1.5;">
                      Please do not reply to this email. For order questions, see contact info below.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding:32px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                  <p style="margin:0 0 16px 0;color:#1e293b;font-size:18px;font-weight:700;">
                    Thanks for Supporting Spirit Athletics! 🎉
                  </p>
                  <p style="margin:0 0 8px 0;color:#64748b;font-size:14px;">
                    Questions about your order?
                  </p>
                  <p style="margin:0 0 20px 0;color:#64748b;font-size:14px;">
                    Email us at 
                    <a href="mailto:${process.env.RECEIVABLE_EMAIL || 'frontdesk@spiritathletics.net'}" style="color:#667eea;text-decoration:none;font-weight:700;">
                      ${process.env.RECEIVABLE_EMAIL || 'frontdesk@spiritathletics.net'}
                    </a>
                  </p>
                  <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                    Spirit Athletics • 17537 Bear Valley Rd, Hesperia, CA 92345<br>
                    © ${new Date().getFullYear()} Spirit Athletics. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generateAdminOrderNotification(order: OrderEmailData): string {
  const lineItemsList = order.lineItems
    .map(item => `• ${item.productName} (${item.sizeName}) - Qty: ${item.quantity} - $${(item.lineTotal / 100).toFixed(2)}`)
    .join('\n');

  return `
    New Order Received - Spirit Athletics Shop

    Order #${order.orderId.slice(-8).toUpperCase()}
    Campaign: ${order.campaignTitle}
    Customer: ${order.customerName || 'N/A'} (${order.customerEmail})
    Total: $${(order.totalCents / 100).toFixed(2)}

    Items:
    ${lineItemsList}

    View full order details in the admin dashboard.
  `;
}
