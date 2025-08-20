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
  const lineItemsHtml = order.lineItems
    .map(item => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 500; color: #1f2937;">${item.productName}</div>
          <div style="font-size: 14px; color: #6b7280;">Size: ${item.sizeName}</div>
        </td>
        <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #1f2937;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #1f2937;">
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
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 32px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
            Spirit Athletics
          </h1>
          <p style="margin: 8px 0 0 0; color: #bfdbfe; font-size: 16px;">
            Order Confirmation
          </p>
        </div>

        <!-- Success Message -->
        <div style="padding: 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <div style="width: 64px; height: 64px; background-color: #10b981; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
          <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
            Thank You for Your Order!
          </h2>
          <p style="margin: 0; color: #6b7280; font-size: 16px;">
            Hi ${order.customerName || 'there'}, your Spirit Athletics preorder is confirmed.
          </p>
        </div>

        <!-- Order Details -->
        <div style="padding: 32px;">
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
              ${order.campaignTitle}
            </h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Order #${order.orderId.slice(-8).toUpperCase()}
            </p>
          </div>

          <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
            Items Ordered
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">
                  Item
                </th>
                <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">
                  Qty
                </th>
                <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 8px 8px 8px; text-align: right; font-weight: 600; color: #1f2937; border-top: 2px solid #e5e7eb;">
                  Order Total:
                </td>
                <td style="padding: 16px 8px 8px 8px; text-align: right; font-weight: 700; color: #059669; font-size: 18px; border-top: 2px solid #e5e7eb;">
                  $${(order.totalCents / 100).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- What's Next -->
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 18px; font-weight: 600;">
              What Happens Next?
            </h3>
            <div style="color: #1e40af; line-height: 1.6;">
              <div style="margin-bottom: 8px;">✅ Your preorder is confirmed and payment processed</div>
              <div style="margin-bottom: 8px;">📦 Orders will be placed when the campaign closes on <strong>${new Date(order.campaignEndDate).toLocaleDateString()}</strong></div>
              <div style="margin-bottom: 8px;">🏭 Items will take 6-8 weeks for production and then will be shipped to our facility</div>
              <div style="margin-bottom: 8px;">🏢 Items will be available for pickup at the gym</div>
              <div>📱 You'll be notified when your order is ready for pickup</div>
            </div>
          </div>

          <!-- Important Note -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
            <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 16px; font-weight: 600;">
              Important: This is a preorder
            </h4>
            <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; line-height: 1.5;">
              We place bulk orders after the campaign closes to get the best pricing and ensure quality. 
              Items will be available for pickup at the gym once production is complete.
            </p>
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
              <strong>Need to refund or change your order?</strong> Please visit us in the front office during operating hours. 
              Our staff will assist you on-site to resolve any issues that may arise.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 16px 0; color: #1f2937; font-weight: 600; font-size: 16px;">
            Thanks for supporting Spirit Athletics!
          </p>
          
          <!-- No Reply Notice -->
          <div style="background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; color: #dc2626; font-size: 14px; font-weight: 600;">
              ⚠️ This is a no-reply email
            </p>
            <p style="margin: 0; color: #7f1d1d; font-size: 13px; line-height: 1.4;">
              Please do not reply to this email. For any questions about your order, contact us at:
            </p>
          </div>
          
          <p style="margin: 16px 0 8px 0; color: #6b7280; font-size: 14px;">
            Questions about your order?
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Email us at 
            <a href="mailto:${process.env.RECEIVABLE_EMAIL || 'frontdesk@spiritathletics.net'}" style="color: #2563eb; text-decoration: none; font-weight: 600;">
              ${process.env.RECEIVABLE_EMAIL || 'frontdesk@spiritathletics.net'}
            </a>
          </p>
          
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} Spirit Athletics. All rights reserved.
            </p>
          </div>
        </div>
      </div>
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
