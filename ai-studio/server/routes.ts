import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createGenerationSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPG files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload endpoint
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Convert buffer to base64 data URL
      const base64 = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

      res.json({
        dataUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Generation endpoint with mock behavior
  app.post("/api/generate", async (req, res) => {
    try {
      const validatedData = createGenerationSchema.parse(req.body);
      
      // Simulate processing time (1-2 seconds)
      const delay = Math.random() * 1000 + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Simulate 20% error rate
      if (Math.random() < 0.2) {
        return res.status(500).json({ message: "Model overloaded" });
      }

      // For demo purposes, use placeholder images from Unsplash
      const styleImageMap = {
        editorial: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        streetwear: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        vintage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        minimalist: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        cyberpunk: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        watercolor: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      };

      const generation = await storage.createGeneration({
        imageUrl: styleImageMap[validatedData.style],
        originalImageUrl: validatedData.imageDataUrl,
        prompt: validatedData.prompt,
        style: validatedData.style,
      });

      res.json(generation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Generation error:", error);
      res.status(500).json({ message: "Generation failed" });
    }
  });

  // Get generations history
  app.get("/api/generations", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const generations = await storage.getGenerations(limit);
      res.json(generations);
    } catch (error) {
      console.error("Get generations error:", error);
      res.status(500).json({ message: "Failed to fetch generations" });
    }
  });

  // Get single generation
  app.get("/api/generations/:id", async (req, res) => {
    try {
      const generation = await storage.getGeneration(req.params.id);
      if (!generation) {
        return res.status(404).json({ message: "Generation not found" });
      }
      res.json(generation);
    } catch (error) {
      console.error("Get generation error:", error);
      res.status(500).json({ message: "Failed to fetch generation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
