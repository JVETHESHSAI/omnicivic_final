package com.omnicivic.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@omnicivic.local}")
    private String fromEmail;

    @Value("${app.platform.url:http://localhost:4200}")
    private String platformUrl;

    // ─── ALL methods are @Async void ─────────────────────────────────────────
    // This means EVERY email call returns instantly to the caller.
    // The email is sent in a background thread — user never waits.

    /**
     * Plain-text notification email (complaint updates, proof status, etc.)
     */
    @Async
    public void sendAsync(String to, String subject, String body) {
        if (to == null || to.isBlank()) return;
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("✓ Async email sent to {}", to);
        } catch (Exception e) {
            log.warn("✗ Failed to send async email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * HTML credentials email sent when a new user is created (resident/staff/admin/co-admin).
     * Async — never blocks the create-user API call.
     */
    @Async
    public void sendCredentials(String to, String displayName,
                                String organizationName,
                                String username, String password,
                                String role, String communityPrefix) {
        if (to == null || to.isBlank()) {
            log.info("No email — skipping credential email for user={}", username);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Welcome to OmniCivic — Your account is ready");
            helper.setText(buildCredentialsHtml(
                displayName, organizationName, username, password, role, communityPrefix), true);
            mailSender.send(message);
            log.info("✓ Credential email sent to {} (user={}, role={})", to, username, role);
        } catch (MessagingException | RuntimeException e) {
            log.warn("✗ Could not send credential email to {}: user={}, role={}, reason={}",
                     to, username, role, e.getMessage());
        }
    }

    /**
     * HTML rejection email when a service request is denied.
     * Async — never blocks the reject API call.
     */
    @Async
    public void sendRejection(String to, String displayName,
                               String organizationName, String reason) {
        if (to == null || to.isBlank()) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("OmniCivic — Update on your service request");
            helper.setText(buildRejectionHtml(displayName, organizationName, reason), true);
            mailSender.send(message);
            log.info("✓ Rejection email sent to {}", to);
        } catch (MessagingException | RuntimeException e) {
            log.warn("✗ Could not send rejection email to {}: {}", to, e.getMessage());
        }
    }

    // ─── HTML Templates ───────────────────────────────────────────────────────

    private String buildCredentialsHtml(String displayName, String orgName,
                                         String username, String password,
                                         String role, String prefix) {
        String roleLabel = switch (role) {
            case "ADMIN"    -> "Administrator";
            case "CO_ADMIN" -> "Co-Administrator";
            case "STAFF"    -> "Staff Member";
            case "RESIDENT" -> "Resident";
            default         -> role;
        };
        String orgLine = (orgName == null || orgName.isBlank()) ? "" :
            "<p>You've been added to <strong>" + escape(orgName) + "</strong> as a <strong>" + roleLabel + "</strong>.</p>";

        return """
            <!DOCTYPE html>
            <html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;margin:0;padding:32px">
              <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.08)">
                <div style="background:linear-gradient(135deg,#2563eb 0%%,#1e40af 100%%);padding:32px;color:white">
                  <h1 style="margin:0;font-size:24px;font-weight:800">Welcome to OmniCivic</h1>
                  <p style="margin:8px 0 0;font-size:14px;opacity:.9">Your account is ready.</p>
                </div>
                <div style="padding:32px;color:#0f172a;line-height:1.6">
                  <p>Hi %s,</p>
                  %s
                  <p>Your community prefix: <code style="background:#0f172a;color:white;padding:2px 8px;border-radius:4px;font-weight:700">%s</code></p>
                  <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:20px;margin:24px 0;border-radius:8px">
                    <h3 style="margin:0 0 12px;font-size:13px;color:#475569;text-transform:uppercase">Login Credentials</h3>
                    <table style="width:100%%;border-collapse:collapse">
                      <tr>
                        <td style="padding:8px 0;color:#64748b;font-size:13px;width:160px">Username</td>
                        <td><code style="font-size:15px;font-weight:700;color:#0f172a">%s</code></td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#64748b;font-size:13px">Temporary Password</td>
                        <td><code style="font-size:15px;font-weight:700;color:#0f172a">%s</code></td>
                      </tr>
                    </table>
                  </div>
                  <p><a href="%s/login" style="display:inline-block;background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">Log In to OmniCivic →</a></p>
                  <p style="font-size:13px;color:#64748b">You'll be required to change this password on first login.</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0">
                  <p style="font-size:13px;color:#94a3b8;margin:0">Need help? Reply to this email.</p>
                </div>
              </div>
              <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:20px">© 2026 OmniCivic</p>
            </body></html>
            """.formatted(escape(displayName), orgLine, escape(prefix),
                          escape(username), escape(password), platformUrl);
    }

    private String buildRejectionHtml(String displayName, String orgName, String reason) {
        String reasonBlock = (reason == null || reason.isBlank()) ? "" :
            "<div style=\"background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;margin:20px 0;border-radius:8px\">" +
            "<strong style=\"display:block;margin-bottom:6px;font-size:13px;color:#78350f\">Reason</strong>" +
            "<span style=\"font-size:14px;color:#78350f\">" + escape(reason) + "</span></div>";

        return """
            <!DOCTYPE html>
            <html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;margin:0;padding:32px">
              <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.08)">
                <div style="padding:32px;color:#0f172a;line-height:1.6">
                  <h1 style="margin:0 0 12px;font-size:20px">Update on your OmniCivic request</h1>
                  <p>Hi %s,</p>
                  <p>Thank you for your interest in OmniCivic. Unfortunately, we are unable to approve the request for <strong>%s</strong> at this time.</p>
                  %s
                  <p>Feel free to reach out if you'd like to discuss further or resubmit.</p>
                  <p style="margin-top:32px;font-size:13px;color:#94a3b8">— The OmniCivic Team</p>
                </div>
              </div>
            </body></html>
            """.formatted(escape(displayName), escape(orgName), reasonBlock);
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
