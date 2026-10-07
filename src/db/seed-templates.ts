import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

const TEMPLATES = [
  {
    id: "contact-information",
    name: "Contact Information",
    description: "Collect names, emails, addresses, and phone numbers.",
    sortOrder: "1",
    headerColor: "#10B981", // Green accent like screenshot
    schema: {
      title: "Contact Information",
      description: "Please provide your details below.",
      questions: [
        { id: "q1", type: "short_text", label: "Name", required: true },
        { id: "q2", type: "email", label: "Email", required: true },
        { id: "q3", type: "short_text", label: "Address", required: false },
        { id: "q4", type: "short_text", label: "Phone number", required: false },
      ],
    },
  },
  {
    id: "rsvp",
    name: "RSVP",
    description: "Track event attendance, party sizes, and dietary preferences.",
    sortOrder: "2",
    headerColor: "#334155", // Slate banner like screenshot
    schema: {
      title: "Event RSVP",
      description: "Let us know if you can make it!",
      questions: [
        { id: "q1", type: "short_text", label: "Name", required: true },
        {
          id: "q2",
          type: "single_choice",
          label: "Can you attend?",
          required: true,
          options: ["Yes, I'll be there", "Sorry, can't make it"],
        },
        { id: "q3", type: "number", label: "What is your party size?", required: false },
        { id: "q4", type: "long_text", label: "Dietary restrictions", required: false },
      ],
    },
  },
  {
    id: "party-invite",
    name: "Party Invite",
    description: "Celebrate with friends, confirm attendance, and coordinate items.",
    sortOrder: "3",
    headerColor: "#F59E0B", // Festive yellow/orange banner
    schema: {
      title: "Party Invite",
      description: "Join us for an evening of food and drinks!",
      questions: [
        { id: "q1", type: "short_text", label: "What is your name?", required: true },
        {
          id: "q2",
          type: "single_choice",
          label: "Will you be attending?",
          required: true,
          options: ["Yes, can't wait!", "No, unfortunately"],
        },
        {
          id: "q3",
          type: "multi_choice",
          label: "What will you bring?",
          required: false,
          options: ["Appetizer", "Main dish", "Dessert", "Beverages"],
        },
        { id: "q4", type: "long_text", label: "Message to the host", required: false },
      ],
    },
  },
  {
    id: "t-shirt-sign-up",
    name: "T-Shirt Sign Up",
    description: "Collect sizes and color preferences for team or event shirts.",
    sortOrder: "4",
    headerColor: "#8B5CF6", // Purple banner
    schema: {
      title: "T-Shirt Sign Up",
      description: "Choose your shirt size for the upcoming event.",
      questions: [
        { id: "q1", type: "short_text", label: "Full Name", required: true },
        { id: "q2", type: "email", label: "Email Address", required: true },
        {
          id: "q3",
          type: "single_choice",
          label: "Shirt Size",
          required: true,
          options: ["Small (S)", "Medium (M)", "Large (L)", "Extra Large (XL)", "2XL"],
        },
      ],
    },
  },
  {
    id: "event-registration",
    name: "Event Registration",
    description: "Register attendees, collect company information, and schedule sessions.",
    sortOrder: "5",
    headerColor: "#B45309", // Warm amber/bronze banner
    schema: {
      title: "Event Registration",
      description: "Sign up for the annual tech conference.",
      questions: [
        { id: "q1", type: "short_text", label: "Name", required: true },
        { id: "q2", type: "email", label: "Work Email", required: true },
        { id: "q3", type: "short_text", label: "Organization", required: false },
        {
          id: "q4",
          type: "multi_choice",
          label: "Select Track Sessions",
          required: true,
          options: ["Keynote Address", "Technical Deep Dive", "Founder Panel", "Networking Mixer"],
        },
        { id: "q5", type: "long_text", label: "Questions for speakers", required: false },
      ],
    },
  },
];

async function seed() {
  console.log("Seeding templates into Neon Postgres...");

  for (const t of TEMPLATES) {
    await sql`
      INSERT INTO templates (id, name, description, sort_order, header_color, schema, is_active)
      VALUES (
        ${t.id},
        ${t.name},
        ${t.description},
        ${t.sortOrder},
        ${t.headerColor},
        ${JSON.stringify(t.schema)},
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        sort_order = EXCLUDED.sort_order,
        header_color = EXCLUDED.header_color,
        schema = EXCLUDED.schema,
        is_active = EXCLUDED.is_active;
    `;
  }

  // Also ensure a default demo user exists for local development
  await sql`
    INSERT INTO "user" (id, name, email, email_verified, image, prefs)
    VALUES (
      'usr_demo',
      'Sajal Jaiswal',
      'sajaljaiswal525@gmail.com',
      true,
      null,
      '{"view":"grid","hideTemplates":false}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;
  `;

  console.log("Templates and demo user seeded successfully!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
