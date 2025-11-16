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
console.log("=====================================");
console.log("🔍 DEBUG ENV:");
console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS ? "(cargada)" : "(VACÍA)");
console.log("PORT =", process.env.PORT);
console.log("=====================================");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Falta configurar EMAIL_USER o EMAIL_PASS en las variables de entorno");
    process.exit(1);
}

// -------------------------------------------------
// 🔵 CONFIGURACIÓN DE NODEMAILER
// -------------------------------------------------
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
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
