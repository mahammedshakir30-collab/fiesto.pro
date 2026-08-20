import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");
const FROM_EMAIL = process.env.EMAIL_FROM || "FIESTO <noreply@fiesto.app>";
const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

type TransactionalEmailParams = {
  to: string;
  subject: string;
  title: string;
  preheader?: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
  footerNote?: string;
};

function buildHtml(params: TransactionalEmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${params.subject}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F2EEDD;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${params.preheader || params.message}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        
        <!-- Outer card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(80,78,118,0.08);">
          
          <!-- Top accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#504E76,#F1642E);height:5px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background-color:#504E76;padding:32px 48px;text-align:center;">
              <span style="font-size:32px;font-weight:900;letter-spacing:4px;color:#ffffff;font-family:Georgia,serif;">FIESTO</span>
              <br />
              <span style="font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:2px;text-transform:uppercase;">Festival Management Platform</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 32px;">
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#504E76;line-height:1.3;">${params.title}</h1>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#555555;">
                ${params.message}
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius:12px;background-color:#F1642E;">
                    <a href="${params.buttonUrl}"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
                       ${params.buttonText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:28px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">
                If the button above doesn&apos;t work, paste this link into your browser:<br />
                <a href="${params.buttonUrl}" style="color:#504E76;word-break:break-all;">${params.buttonUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;text-align:center;">
              ${params.footerNote
                ? `<p style="margin:0 0 12px;font-size:12px;color:#9ca3af;">${params.footerNote}</p>`
                : ""}
              <p style="margin:0;font-size:11px;color:#c4c4c4;line-height:1.6;">
                &copy; ${new Date().getFullYear()} FIESTO &mdash; Festival Management Platform<br />
                You received this email because an action was taken on your account.<br />
                If you did not request this, you can safely ignore this email.
              </p>
              <p style="margin:12px 0 0;font-size:11px;">
                <a href="${SITE_URL}" style="color:#504E76;text-decoration:none;">fiesto.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendTransactionalEmail(params: TransactionalEmailParams) {
  const isDev = !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_mock_key";

  if (isDev) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧  SIMULATED EMAIL (no RESEND_API_KEY set)");
    console.log(`To:      ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`Title:   ${params.title}`);
    console.log(`Action:  ${params.buttonText}`);
    console.log(`URL:     ${params.buttonUrl}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    return { success: true, simulated: true };
  }

  const html = buildHtml(params);

  const data = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html,
  });

  return { success: true, data };
}

// ─── Specific email senders ───────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendTransactionalEmail({
    to,
    subject: "Reset your FIESTO password",
    preheader: "Click the link to choose a new password. This link expires in 1 hour.",
    title: "Password Reset Request",
    message:
      "We received a request to reset the password for your FIESTO account. " +
      "Click the button below to choose a new password. " +
      "This link will expire in <strong>1 hour</strong>.",
    buttonText: "Reset My Password",
    buttonUrl: resetUrl,
    footerNote: "If you did not request a password reset, no action is needed — your password remains unchanged.",
  });
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  return sendTransactionalEmail({
    to,
    subject: "Welcome to FIESTO 🎉",
    preheader: "Your account is ready. Let's get started.",
    title: `Welcome, ${firstName}!`,
    message:
      `Your FIESTO account is all set. You can now log in and start exploring festivals, ` +
      `managing teams, and experiencing live events like never before.`,
    buttonText: "Go to Dashboard",
    buttonUrl: `${SITE_URL}/portal`,
  });
}

export async function sendEmailVerification(to: string, verifyUrl: string) {
  return sendTransactionalEmail({
    to,
    subject: "Verify your FIESTO email address",
    preheader: "Verify your email to activate your account.",
    title: "Verify your Email",
    message:
      "Thank you for creating a FIESTO account. " +
      "Please verify your email address by clicking the button below to activate your account.",
    buttonText: "Verify Email Address",
    buttonUrl: verifyUrl,
    footerNote: "This link expires in 24 hours.",
  });
}

export async function sendStaffInviteEmail(to: string, inviteUrl: string, festivalName: string, inviterName: string) {
  return sendTransactionalEmail({
    to,
    subject: `You've been invited to join ${festivalName} on FIESTO`,
    preheader: `${inviterName} invited you to ${festivalName}.`,
    title: `You're invited to ${festivalName}`,
    message:
      `<strong>${inviterName}</strong> has invited you to join the <strong>${festivalName}</strong> team on FIESTO. ` +
      `Click the button below to accept the invitation and set up your account.`,
    buttonText: "Accept Invitation",
    buttonUrl: inviteUrl,
    footerNote: "This invitation expires in 7 days.",
  });
}
