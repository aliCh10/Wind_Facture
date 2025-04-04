package com.example.auth_service.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationCode(String email, String code) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // HTML content for verification email
            String htmlContent = "<!DOCTYPE html>" +
                "<html lang='fr'>" +
                "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "<style>" +
                        "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                        ".container { max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; }" +
                        ".header { background-color: #1b2c3f; padding: 20px; }" +
                        ".header img { width: 100px; }" +
                        ".content p { font-size: 16px; color: #555; }" +
                        ".code { font-size: 24px; font-weight: bold; color: #1b2c3f; margin: 20px 0; }" +
                        ".footer { text-align: center; padding: 20px; color: #999; font-size: 14px; }" +
                    "</style>" +
                "</head>" +
                "<body>" +
                    "<div class='header'>" +
                        "<img src='https://wind-consulting-tunisia.com/images/windsite/windc_1.png' alt='Logo'>" +
                    "</div>" +
                    "<div class='container'>" +
                        "<div class='content'>" +
                            "<p>Bonjour, <strong>" + email + "</strong></p>" +
                            "<p>Votre code de vérification est :</p>" +
                            "<p class='code'>" + code + "</p>" +
                            "<p>Veuillez utiliser ce code pour finaliser votre inscription.</p>" +
                        "</div>" +
                        "<div class='footer'>" +
                            "<p>&copy; 2024 Beams.PROFEEL. Tous droits réservés.</p>" +
                        "</div>" +
                    "</div>" +
                "</body>" +
                "</html>";

            helper.setTo(email);
            helper.setSubject("Vérification de votre compte");
            helper.setText(htmlContent, true);  

            mailSender.send(message);
            log.info("✅ Email de vérification envoyé avec succès à {}", email);
        } catch (MessagingException e) {
            log.error("❌ Erreur lors de l'envoi de l'email de vérification à {}: {}", email, e.getMessage());
            throw e;
        }
    }

    public void sendPasswordResetCode(String email, String code) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
    
            // HTML content for password reset email
            String htmlContent = "<!DOCTYPE html>" +
                "<html lang='fr'>" +
                "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "<style>" +
                        "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                        ".container { max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; }" +
                        ".header { background-color: #1b2c3f; padding: 20px; }" +
                        ".header img { width: 100px; }" +
                        ".content p { font-size: 16px; color: #555; }" +
                        ".code { font-size: 24px; font-weight: bold; color: #1b2c3f; margin: 20px 0; }" +
                        ".footer { text-align: center; padding: 20px; color: #999; font-size: 14px; }" +
                    "</style>" +
                "</head>" +
                "<body>" +
                    "<div class='header'>" +
                        "<img src='https://wind-consulting-tunisia.com/images/windsite/windc_1.png' alt='Logo'>" +
                    "</div>" +
                    "<div class='container'>" +
                        "<div class='content'>" +
                            "<p>Bonjour, <strong>" + email + "</strong></p>" +
                            "<p>Nous avons reçu une demande pour réinitialiser votre mot de passe.</p>" +
                            "<p>Votre code de réinitialisation est :</p>" +
                            "<p class='code'>" + code + "</p>" +
                            "<p>Veuillez utiliser ce code pour réinitialiser votre mot de passe.</p>" +
                        "</div>" +
                        "<div class='footer'>" +
                            "<p>&copy; 2024 Beams.PROFEEL. Tous droits réservés.</p>" +
                        "</div>" +
                    "</div>" +
                "</body>" +
                "</html>";
    
            helper.setTo(email);
            helper.setSubject("Réinitialisation de votre mot de passe");
            helper.setText(htmlContent, true);  // true means it's an HTML email
            mailSender.send(message);
            log.info("✅ Email de réinitialisation envoyé avec succès à {}", email);
        } catch (MessagingException e) {
            log.error("❌ Erreur lors de l'envoi de l'email de réinitialisation à {}: {}", email, e.getMessage());
            throw e;
        }
    }

    // New method to send the password
    public void sendPassword(String email, String password) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // HTML content for sending the password
            String htmlContent = "<!DOCTYPE html>" +
                "<html lang='fr'>" +
                "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "<style>" +
                        "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                        ".container { max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; }" +
                        ".header { background-color: #1b2c3f; padding: 20px; }" +
                        ".header img { width: 100px; }" +
                        ".content p { font-size: 16px; color: #555; }" +
                        ".password { font-size: 24px; font-weight: bold; color: #1b2c3f; margin: 20px 0; }" +
                        ".footer { text-align: center; padding: 20px; color: #999; font-size: 14px; }" +
                    "</style>" +
                "</head>" +
                "<body>" +
                    "<div class='header'>" +
                        "<img src='https://wind-consulting-tunisia.com/images/windsite/windc_1.png' alt='Logo'>" +
                    "</div>" +
                    "<div class='container'>" +
                        "<div class='content'>" +
                            "<p>Bonjour, <strong>" + email + "</strong></p>" +
                            "<p>Votre mot de passe est :</p>" +
                            "<p class='password'>" + password + "</p>" +
                            "<p>Veuillez utiliser ce mot de passe pour vous connecter à votre compte.</p>" +
                        "</div>" +
                        "<div class='footer'>" +
                            "<p>&copy; 2024 Beams.PROFEEL. Tous droits réservés.</p>" +
                        "</div>" +
                    "</div>" +
                "</body>" +
                "</html>";

            helper.setTo(email);
            helper.setSubject("Votre mot de passe");
            helper.setText(htmlContent, true);  // true means it's an HTML email
            mailSender.send(message);
            log.info("✅ Email de mot de passe envoyé avec succès à {}", email);
        } catch (MessagingException e) {
            log.error("❌ Erreur lors de l'envoi de l'email de mot de passe à {}: {}", email, e.getMessage());
            throw e;
        }
    }
     private void sendEmail(String toEmail, String generatedPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your account credentials");
        message.setText("Hello,\n\nYour account has been created successfully.\nYour password is: " + generatedPassword + "\n\nPlease change your password after logging in.");

        // Envoi du message
        mailSender.send(message);
    }
    public void sendAccountCredentials(String email, String generatedPassword) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
    
            // HTML content for account credentials email
            String htmlContent = "<!DOCTYPE html>" +
                "<html lang='fr'>" +
                "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "<style>" +
                        "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                        ".container { max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; }" +
                        ".header { background-color: #1b2c3f; padding: 20px; }" +
                        ".header img { width: 100px; }" +
                        ".content p { font-size: 16px; color: #555; }" +
                        ".password { font-size: 24px; font-weight: bold; color: #1b2c3f; margin: 20px 0; }" +
                        ".footer { text-align: center; padding: 20px; color: #999; font-size: 14px; }" +
                    "</style>" +
                "</head>" +
                "<body>" +
                    "<div class='header'>" +
                        "<img src='https://wind-consulting-tunisia.com/images/windsite/windc_1.png' alt='Logo'>" +
                    "</div>" +
                    "<div class='container'>" +
                        "<div class='content'>" +
                            "<p>Bonjour, <strong>" + email + "</strong></p>" +
                            "<p>Votre compte a été créé avec succès.</p>" +
                            "<p>Votre mot de passe est :</p>" +
                            "<p class='password'>" + generatedPassword + "</p>" +
                            "<p>Veuillez changer votre mot de passe après vous être connecté.</p>" +
                        "</div>" +
                        "<div class='footer'>" +
                            "<p>&copy; 2024 Beams.PROFEEL. Tous droits réservés.</p>" +
                        "</div>" +
                    "</div>" +
                "</body>" +
                "</html>";
    
            helper.setTo(email);
            helper.setSubject("Vos informations de compte");
            helper.setText(htmlContent, true);  // true means it's an HTML email
            mailSender.send(message);
            log.info("✅ Email de création de compte envoyé avec succès à {}", email);
        } catch (MessagingException e) {
            log.error("❌ Erreur lors de l'envoi de l'email de création de compte à {}: {}", email, e.getMessage());
            throw e;
        }
    }
}