/**
 * Branded HTML wrapper — Wisdom Match theme (#ff5c28 / #0a0a0a / white).
 * Plain-text `body` from the queue is unchanged; only the HTML part is added at send time.
 */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainBodyToHtmlParagraphs(body) {
  const escaped = escapeHtml(body);
  const blocks = escaped.split(/\n\n+/);
  return blocks
    .map((block) => {
      const lines = block.split("\n").join("<br />");
      return `<p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#0a0a0a;">${lines}</p>`;
    })
    .join("");
}

function extractOtp(body) {
  const match = String(body).match(/OTP is (\d{6})/i);
  return match ? match[1] : null;
}

/**
 * @param {{ subject: string, body: string }} params
 * @returns {string}
 */
function buildWisdomMatchHtmlEmail({ subject, body }) {
  const otp = extractOtp(body);
  const safeSubject = escapeHtml(subject);

  let mainContent;

  if (otp) {
    mainContent = `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#0a0a0a;">
        Use this one-time code to sign in. It expires in <strong>5 minutes</strong>.
      </p>
      <div style="margin:20px 0 24px;padding:20px 24px;background:#fff4ef;border:1px solid #ffd4c4;border-radius:12px;text-align:center;">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#525252;margin-bottom:8px;">Your code</div>
        <div style="font-size:32px;font-weight:700;letter-spacing:0.2em;color:#ff5c28;font-family:ui-monospace,Menlo,Consolas,monospace;">${otp}</div>
      </div>
      <p style="margin:0;font-size:13px;line-height:1.5;color:#525252;">
        If you did not request this code, you can ignore this email.
      </p>`;
  } else {
    mainContent = plainBodyToHtmlParagraphs(body);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#fafafa;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafa;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
          <tr>
            <td style="padding-bottom:20px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <span style="display:inline-block;width:12px;height:12px;background:#ff5c28;border-radius:2px;"></span>
                    <span style="display:inline-block;width:12px;height:12px;background:#ff5c28;border-radius:2px;margin-left:4px;"></span>
                  </td>
                  <td style="vertical-align:middle;font-size:18px;font-weight:700;color:#0a0a0a;letter-spacing:-0.02em;">Wisdom Match</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:28px 28px 24px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;line-height:1.3;color:#0a0a0a;">${safeSubject}</h1>
              ${mainContent}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 0;text-align:center;font-size:12px;line-height:1.5;color:#a3a3a3;">
              Wisdom Match · AI-powered client–supplier matchmaking
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { buildWisdomMatchHtmlEmail };
