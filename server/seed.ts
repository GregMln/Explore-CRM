import { db } from "./db";
import { contacts } from "@shared/schema";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { count } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const result = await db.select({ count: count() }).from(contacts);
    const contactCount = result[0]?.count || 0;

    if (contactCount > 0) {
      console.log(`Database already has ${contactCount} contacts, skipping seed`);
      return;
    }

    console.log("Database is empty, seeding contacts...");

    const jsonPath = join(process.cwd(), "client/src/crm-data.json");
    if (!existsSync(jsonPath)) {
      console.log("CRM data file not found, skipping seed");
      return;
    }

    const rawData = readFileSync(jsonPath, "utf-8");
    const crmData = JSON.parse(rawData);

    console.log(`Found ${crmData.contacts.length} contacts to import`);

    const contactsToInsert = crmData.contacts.map((contact: any) => ({
      nom: contact.nom || "",
      email: contact.email || null,
      telephone: contact.telephone || null,
      mobile: contact.mobile || null,
      adresse: contact.adresse || null,
      statut: contact.statut || null,
      consultant: contact.consultant || null,
      commentaires: contact.commentaires || null,
      date_creation: contact.date_creation || null,
      scpi: contact.scpi || null,
      marketing: contact.marketing || null,
      montant: contact.montant || null,
    }));

    const batchSize = 500;
    for (let i = 0; i < contactsToInsert.length; i += batchSize) {
      const batch = contactsToInsert.slice(i, i + batchSize);
      await db.insert(contacts).values(batch);
      console.log(`Imported ${Math.min(i + batchSize, contactsToInsert.length)}/${contactsToInsert.length} contacts`);
    }

    console.log(`✓ Successfully seeded ${contactsToInsert.length} contacts`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
