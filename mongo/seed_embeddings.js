// MongoDB Seed Script for Smart Campus Event & Resource Booking System
// Usage: node mongo/seed_embeddings.js

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Automatically load .env.local if present
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[2] ? match[2].trim() : '';
        val = val.replace(/^['"](.*)['"]$/, '$1'); // strip quotes
        process.env[match[1]] = val;
      }
    }
  }
} catch (e) {
  console.warn("Could not load .env.local file automatically:", e.message);
}

let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_nosql';
// Clean up accidental angle brackets in password if present: :<pass>@ -> :pass@
uri = uri.replace(/:<([^>]+)>@/, ':$1@');

console.log("Connecting to MongoDB target:", uri.replace(/:([^@:]+)@/, ':****@'));

const client = new MongoClient(uri);

// Helper to generate normalized mock 768-dim vector
function generateMockVector(seed) {
  const vec = [];
  let sumSq = 0;
  for (let i = 0; i < 768; i++) {
    const val = Math.sin(seed * (i + 1)) * Math.cos(seed * (i + 2));
    vec.push(val);
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq);
  return vec.map(v => v / norm);
}

async function seedMongo() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas!");
    const db = client.db('smart_campus_nosql');

    // 1. Vector Search Collection
    const venueColl = db.collection('venue_search_embeddings');
    await venueColl.deleteMany({});

    const venues = [
      {
        venue_id: 1,
        venue_name: "Auditorium 1",
        combined_text_profile: "Auditorium 1 located at CS Block Floor 2. Capacity 250. Features Dolby audio, dual 4K projectors, tiered theater seating, central air conditioning, stage lighting.",
        embedding_vector: generateMockVector(1.0),
        metadata: {
          capacity: 250,
          dept_code: "CSE",
          requires_approval: true,
          amenities: ["4K Projector", "Dolby Audio", "Stage Lighting", "Tiered Seating", "Air Conditioned"]
        }
      },
      {
        venue_id: 2,
        venue_name: "Seminar Hall B",
        combined_text_profile: "Seminar Hall B located at CS Block Floor 1. Capacity 80. Quiet meeting room equipped with HD projector, whiteboard, podium microphone, ideal for code reviews and workshops.",
        embedding_vector: generateMockVector(2.0),
        metadata: {
          capacity: 80,
          dept_code: "CSE",
          requires_approval: false,
          amenities: ["HD Projector", "Whiteboard", "Podium Mic", "High-Speed Wi-Fi"]
        }
      },
      {
        venue_id: 3,
        venue_name: "EC Seminar Hall",
        combined_text_profile: "EC Seminar Hall located at EC Block Floor 3. Capacity 120. Acoustically treated conference hall with surround speakers, wireless microphones, and lecture capture hardware.",
        embedding_vector: generateMockVector(3.0),
        metadata: {
          capacity: 120,
          dept_code: "ECE",
          requires_approval: true,
          amenities: ["Surround Sound", "Lecture Capture", "Wireless Mic", "HD Projector"]
        }
      },
      {
        venue_id: 4,
        venue_name: "Open Amphitheatre",
        combined_text_profile: "Open Amphitheatre located at Campus Central Square. Capacity 600. Large outdoor venue with open-air acoustic shell, powerful stadium lighting, ideal for fests and concerts.",
        embedding_vector: generateMockVector(4.0),
        metadata: {
          capacity: 600,
          dept_code: "ADMIN",
          requires_approval: true,
          amenities: ["Stadium Lighting", "Open Air Shell", "Stage", "Heavy Power Supply"]
        }
      }
    ];

    await venueColl.insertMany(venues);
    console.log(`Inserted ${venues.length} venue embeddings.`);

    // 2. Metadata index
    await venueColl.createIndex(
      { "metadata.capacity": 1, "metadata.dept_code": 1 },
      { name: "idx_venue_metadata_filter" }
    );
    console.log("Created metadata compound filter index.");

    // 3. System Audit Documents Collection
    const auditColl = db.collection('system_audit_documents');
    await auditColl.createIndex({ booking_id: 1, event_type: 1 });
    await auditColl.insertOne({
      booking_id: 2,
      event_type: "CONFLICT_DETECTED",
      context_payload: {
        requested_slot: {
          start: "2026-11-05T10:30:00Z",
          end: "2026-11-05T12:30:00Z"
        },
        colliding_booking_id: 1,
        failure_reason: "Primary venue occupied; auto-evaluating alternate capacity matches in CSE cluster"
      },
      created_at: new Date()
    });
    console.log("Inserted sample unstructured telemetry audit log.");

    console.log("\n=============================================");
    console.log("MongoDB initialization and seeding complete!");
    console.log("=============================================");
  } finally {
    await client.close();
  }
}

seedMongo().catch(console.error);
