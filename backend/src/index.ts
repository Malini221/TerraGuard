import express from 'express';
import cors from 'cors';
import prisma from './db';

const app = express();
app.use(cors());
app.use(express.json());

// Register Driver
app.post('/api/register-driver', async (req, res) => {
  const { name, aadhaar } = req.body;
  if (!name || !aadhaar) return res.status(400).json({ error: "Missing fields" });
  try {
    const newUser = await prisma.user.create({
      data: { name: String(name), aadhaar: String(aadhaar), role: 'DRIVER' }
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: "Aadhaar already registered." });
  }
});

// Login Driver
app.post('/api/login-driver', async (req, res) => {
  const { aadhaar } = req.body;
  if (!aadhaar) return res.status(400).json({ error: "Aadhaar required" });
  try {
    const user = await prisma.user.findUnique({ where: { aadhaar: String(aadhaar) } });
    if (user) res.json(user);
    else res.status(404).json({ error: "Aadhaar not found. Please Sign Up!" });
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
});

// Log GPS Violation
app.post('/api/log-violation', async (req, res) => {
  const { aadhaar, latitude, longitude, message } = req.body;
  try {
    const driver = await prisma.user.findUnique({ where: { aadhaar: String(aadhaar) } });
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    // @ts-ignore
    const violation = await prisma.violation.create({
      data: { latitude, longitude, message, driverId: driver.id }
    });
    res.status(201).json(violation);
  } catch (error) { res.status(500).json({ error: "Log failed" }); }
});

// Admin Reports
app.get('/api/admin/violations', async (req, res) => {
  try {
    // @ts-ignore
    const violations = await prisma.violation.findMany({
      include: { driver: true },
      orderBy: { time: 'desc' }
    });
    res.json(violations);
  } catch (error) { res.status(500).json({ error: "Fetch failed" }); }
});

app.listen(5000, () => console.log(`🚀 Backend active on http://localhost:5000`));