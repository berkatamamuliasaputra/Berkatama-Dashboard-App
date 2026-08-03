import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Helper for Gemini AI Client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Route: Chat Bot - Agen AI Database Assistant & Execution Engine
  app.post("/api/agent", async (req, res) => {
    try {
      const { prompt, database } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getAiClient();

      const systemInstruction = `Anda adalah BMS Agent AI untuk Sistem Purchasing PT Berkatama Mulia Saputra.
Tugas Anda:
1. Membantu pengguna mencari, menganalisis, menemukan, dan merangkum seluruh informasi atau data yang ada di database aplikasi ini (Purchase Requests, Purchase Orders, Quotations, Invoices, Delivery Status, Suppliers, Approvals).
2. Jika pengguna meminta PERUBAHAN, PERBAIKAN KESALAHAN, PENAMBAHAN, atau PENGHAPUSAN data (misal: "Ubah status PO-2026-001 jadi Completed", "Setujui APR-001", "Tambah supplier PT Maju"), Anda WAJIB memberikan balasan ramah DAN tindakan persis (action) untuk mengeksekusi perubahan tersebut pada database aplikasi secara otomatis!

DATABASE SAAT INI (Format JSON):
${JSON.stringify(database || {}, null, 2)}

RESPON HARUS DALAM FORMAT JSON BERIKUT (Gunakan JSON murni tanpa markdown triple backticks tambahan jika memungkinkan):
{
  "reply": "Balasan lengkap & ramah dalam bahasa Indonesia. Jika pertanyaan data: tampilkan data secara rapi. Jika perintah aksi: jelaskan detail perubahan yang telah/akan dieksekusi secara presisi.",
  "action": null OR {
    "type": "UPDATE_RECORD" | "ADD_RECORD" | "DELETE_RECORD",
    "module": "purchaseRequests" | "purchaseOrders" | "quotations" | "invoices" | "deliveryStatuses" | "suppliers" | "approvals",
    "id": "ID_REKORD_TERKAIT",
    "updates": { "field1": "val1", ... },
    "newRecord": { ...objek rekord baru jika ADD_RECORD... }
  }
}

Aturan Penanganan:
- "purchaseRequests" id berupa "PR-..."
- "purchaseOrders" id berupa "PO-..."
- "quotations" id berupa "QT-..."
- "invoices" id berupa "INV-..."
- "deliveryStatuses" id berupa "PO-..." atau ID rekord status
- "suppliers" id berupa "SUP-..."
- "approvals" id berupa "APR-..."
- Jika tidak ada perintah pengubahan data, set "action": null.
- Gunakan bahasa Indonesia yang sopan, terstruktur, profesional, dan akurat.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "{}";
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (err) {
        parsedResponse = {
          reply: responseText,
          action: null,
        };
      }

      return res.json({
        success: true,
        data: parsedResponse,
      });
    } catch (error: any) {
      console.error("Gemini Agent API Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Gagal memproses permintaan Agen AI",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
