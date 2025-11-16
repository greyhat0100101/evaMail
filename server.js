require("dotenv").config();

const express = require("express");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// -------------------------------------------------
// 🧪 DEBUG: MOSTRAR VALORES DEL .env
// -------------------------------------------------
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 465);
const resolvedSmtpPort = Number.isNaN(smtpPort) ? 465 : smtpPort;
const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : resolvedSmtpPort === 465;

const smtpUser = process.env.EMAIL_USER;
const smtpPass = process.env.EMAIL_PASS;
const smtpFrom = process.env.EMAIL_FROM || smtpUser;

console.log("=====================================");
console.log("🔍 DEBUG ENV:");
console.log("SMTP_HOST =", smtpHost);
console.log("SMTP_PORT =", resolvedSmtpPort);
console.log("SMTP_SECURE =", smtpSecure);
console.log("EMAIL_USER =", smtpUser ? "(definido)" : "(VACÍO)");
console.log("EMAIL_PASS =", smtpPass ? "(cargada)" : "(VACÍA)");
console.log("PORT =", process.env.PORT || 3000);
console.log("=====================================");

// -------------------------------------------------
// 🔵 CONFIGURACIÓN DE NODEMAILER
// -------------------------------------------------
const missingEnv = [];

if (!smtpUser) missingEnv.push("EMAIL_USER");
if (!smtpPass) missingEnv.push("EMAIL_PASS");

if (missingEnv.length) {
    console.warn(
        "⚠️  Variables de entorno faltantes para SMTP:",
        missingEnv.join(", ")
    );
}

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: resolvedSmtpPort,
    secure: smtpSecure, // SSL si es true
    auth: {
        user: smtpUser,
        pass: smtpPass
    }
});

// Verificar SMTP
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error iniciando SMTP:", error);
    } else {
        console.log("📨 SMTP listo para enviar correos");
    }
});

// -------------------------------------------------
// 🟦 OBTENER EMPLEADOS BASE44
// -------------------------------------------------
app.get("/api/employees", async (req, res) => {
    try {
        const response = await fetch(
            "https://app.base44.com/api/apps/690ec4ebc5a0007158f39171/entities/Employee",
            {
                headers: {
                    "api_key": "ba2b96ae1a364660b718a8eee9a0cc8e",
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        console.log("👥 Empleados obtenidos:", data.entities?.length);

        res.json(data.entities || data);

    } catch (err) {
        console.error("❌ ERROR BASE44:", err);
        res.status(500).json({ error: "Error obteniendo empleados." });
    }
});

// -------------------------------------------------
// 🟩 ENVIAR EMAIL
// -------------------------------------------------
app.post("/api/send-email", async (req, res) => {
    const { email, subject, message } = req.body;

    console.log("📤 Enviando correo a:", email);

    try {
        if (missingEnv.length) {
            return res.status(500).json({
                message:
                    "Faltan variables de entorno para enviar el correo.",
                missingEnv
            });
        }

        const info = await transporter.sendMail({
            from: smtpFrom,
            to: email,
            subject,
            text: message
        });

        console.log("✔️ Email enviado:", info.messageId);

        res.json({ message: "Correo enviado correctamente." });

    } catch (err) {
        console.error("❌ ERROR EN ENVÍO:", err);
        res.status(500).json({
            message: "Error enviando email.",
            error: err.message
        });
    }
});

// -------------------------------------------------
// 🚀 INICIAR SERVIDOR
// -------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
);
