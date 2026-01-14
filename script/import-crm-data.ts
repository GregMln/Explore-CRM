import { db } from "../server/db";
import { contacts } from "@shared/schema";
import { readFileSync } from "fs";
import { join } from "path";

async function importData() {
  try {
    console.log("Reading CRM data from JSON file...");
    const jsonPath = join(process.cwd(), "client/src/crm-data.json");
    const rawData = readFileSync(jsonPath, "utf-8");
    const crmData = JSON.parse(rawData);

    console.log(`Found ${crmData.contacts.length} contacts to import`);

    console.log("Clearing existing contacts...");
    await db.delete(contacts);

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

    console.log("Importing contacts in batches...");
    const batchSize = 500;
    for (let i = 0; i < contactsToInsert.length; i += batchSize) {
      const batch = contactsToInsert.slice(i, i + batchSize);
      await db.insert(contacts).values(batch);
      console.log(`Imported ${Math.min(i + batchSize, contactsToInsert.length)}/${contactsToInsert.length} contacts`);
    }

    console.log(`✓ Successfully imported ${contactsToInsert.length} contacts`);
    process.exit(0);
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
}

importData();
