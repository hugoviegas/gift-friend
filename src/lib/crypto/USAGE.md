// Quick Reference: Using the Encryption Module
// Location: src/lib/crypto/encryption.ts

import {
encrypt,
decrypt,
encryptJSON,
decryptJSON,
hashValue,
generateEncryptionKey,
} from "@/lib/crypto/encryption";

// ============================================================================
// 1. ENCRYPTING SIMPLE STRINGS
// ============================================================================

// Use case: Encrypt a recipient ID
const recipientId = "user-123-abc";
const encrypted = encrypt(recipientId);

// Result:
// {
// iv: "3f4d2a1b9c8e7f6a5d4c3b2a1f9e8d7c",
// ciphertext: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
// authTag: "q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
// salt: "f1e2d3c4b5a6978859687576f5e4d3c2"
// }

// Store encrypted in database
await DrawAssignment.create({
eventId: "event-456",
participantId: "participant-789",
encryptedRecipientId: JSON.stringify(encrypted),
});

// Later, retrieve and decrypt
const assignment = await DrawAssignment.findOne({ participantId: "participant-789" });
const decrypted = decrypt(JSON.parse(assignment.encryptedRecipientId));
// Result: "user-123-abc"

// ============================================================================
// 2. ENCRYPTING COMPLEX OBJECTS (JSON)
// ============================================================================

interface Assignment {
recipientId: string;
eventId: string;
giftBudget: number;
hints: string[];
createdAt: Date;
}

const assignment: Assignment = {
recipientId: "user-123-abc",
eventId: "event-456",
giftBudget: 50,
hints: ["loves coffee", "tech enthusiast"],
createdAt: new Date(),
};

// Encrypt the entire object
const encryptedJSON = encryptJSON(assignment);
// Result: '{"iv":"...","ciphertext":"...","authTag":"...","salt":"..."}'

// Store as string in database
await DrawAssignment.create({
participantId: "participant-789",
data: encryptedJSON,
});

// Later, retrieve and decrypt with type safety
const stored = await DrawAssignment.findOne({ participantId: "participant-789" });
const restored = decryptJSON<Assignment>(stored.data);
// Result: { recipientId: "user-123-abc", eventId: "...", ... }

// ============================================================================
// 3. HASHING VALUES (for deduplication)
// ============================================================================

// Use case: Check if email already exists without storing plaintext
const userEmail = "user@example.com";
const emailHash = hashValue(userEmail);

// Store only the hash
await User.create({
email: userEmail,
emailHash: emailHash, // Store this, not the plaintext
name: "John Doe",
});

// Check if email already used
const existingUser = await User.findOne({
emailHash: hashValue("user@example.com"),
});

// ============================================================================
// 4. ERROR HANDLING
// ============================================================================

try {
// Decryption with wrong key will fail
const result = decrypt({
iv: "invalid-hex",
ciphertext: "invalid",
authTag: "invalid",
salt: "invalid",
});
} catch (error) {
console.error("Decryption failed:", error.message);
// "Decryption failed: ... This usually means the data is corrupted
// or the encryption key has changed."
}

// ============================================================================
// 5. GENERATING A NEW KEY (one-time setup)
// ============================================================================

// Run this ONCE during initial setup
const newKey = generateEncryptionKey();
// Result: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"

// Add to .env.local:
// ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

// ============================================================================
// 6. PRODUCTION USAGE PATTERN
// ============================================================================

// Create a helper function for your domain
export class DrawAssignmentService {
// Encrypt assignment on creation
static createEncrypted(assignment: Assignment): string {
return encryptJSON(assignment);
}

// Decrypt assignment on retrieval
static decryptAssignment(encryptedData: string): Assignment {
return decryptJSON<Assignment>(encryptedData);
}

// Store only hash for lookups
static hashParticipantId(participantId: string): string {
return hashValue(participantId);
}
}

// Usage:
const encrypted = DrawAssignmentService.createEncrypted(assignment);
const decrypted = DrawAssignmentService.decryptAssignment(encrypted);

// ============================================================================
// 7. ENVIRONMENT CONFIGURATION
// ============================================================================

// Required in .env.local:
// ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

// If missing:
// Error: "ENCRYPTION_KEY environment variable is not defined.
// Please set it in .env.local"

// If wrong format:
// Error: "ENCRYPTION_KEY must be 64 hex characters (32 bytes for AES-256).
// Current length: 48"
