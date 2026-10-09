const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("=== Testing Formly Backend Completion Plan Workflows ===");

  const timestamp = Date.now().toString().slice(-6);
  const testUser = `plan_user_${timestamp}`;
  const testPassword = "Password123!";

  try {
    // 1. Register test user
    console.log(`\n1. Registering user (${testUser})...`);
    const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: testUser, password: testPassword }),
    });
    const regData = await regRes.json();
    console.log("Registration status:", regRes.status, regRes.ok ? "SUCCESS" : "FAILED");
    if (!regRes.ok) throw new Error("Registration failed: " + JSON.stringify(regData));

    // Get cookie from registration
    const cookieHeader = regRes.headers.get("set-cookie") || "";
    console.log("Session cookie captured:", cookieHeader ? "YES" : "NO");

    // 2. Create Blank Form
    console.log("\n2. Creating blank form...");
    const createRes = await fetch(`${BASE_URL}/api/v1/forms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ title: "Completion Plan Verification Form" }),
    });
    const createData = await createRes.json();
    console.log("Form created:", createRes.ok ? "SUCCESS" : "FAILED", "ID:", createData.form?.id);
    const formId = createData.form?.id;
    if (!formId) throw new Error("Form creation failed");

    // 3. Configure Form with Settings and Questions
    console.log("\n3. Autosaving form draft with password, limits, shuffle, and redirect settings...");
    const definition = {
      schemaVersion: 1,
      title: "Completion Plan Verification Form",
      description: "Testing backend enforcement of form settings",
      themeKey: "soft-lavender",
      settings: {
        category: "Feedback",
        defaultLanguage: "English",
        accessType: "password",
        passwordRequired: true,
        accessPassword: "SecretAccessCode99",
        acceptingResponses: true,
        closedMessage: "This form has been closed by the administrator.",
        collectEmailAddresses: false,
        limitOneResponse: true,
        allowMultipleSubmissions: false,
        setResponseLimit: true,
        responseLimit: 10,
        showProgressIndicator: true,
        shuffleQuestionOrder: true,
        showQuestionNumbers: true,
        oneQuestionPerPage: false,
        confirmationType: "redirect",
        confirmationTitle: "Thank you for participating!",
        confirmationMessage: "Your response has been registered.",
        redirectUrl: "https://example.com/completion-success",
        emailNewResponses: false,
        notifyResponseLimit: false,
        notifySuspiciousActivity: false,
        allowEditAfterSubmission: false,
        saveAndContinueLater: false,
      },
      questions: [
        {
          id: "q_satisfaction",
          type: "RATING",
          label: "How would you rate your experience?",
          required: true,
          settings: { minRating: 1, maxRating: 5 },
        },
        {
          id: "q_feedback",
          type: "SHORT_TEXT",
          label: "Any additional comments?",
          required: false,
        },
      ],
    };

    const saveRes = await fetch(`${BASE_URL}/api/v1/forms/${formId}/draft`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        definition,
        expectedRevision: 0,
      }),
    });
    const saveData = await saveRes.json();
    console.log("Draft save status:", saveRes.status, saveData.success ? "SUCCESS" : "FAILED");
    if (!saveData.success) throw new Error("Draft save failed: " + JSON.stringify(saveData));

    // 4. Publish Form
    console.log("\n4. Publishing form...");
    const pubRes = await fetch(`${BASE_URL}/api/v1/forms/${formId}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });
    const pubData = await pubRes.json();
    console.log("Publish status:", pubRes.status, pubData.success ? "SUCCESS" : "FAILED", "Public URL:", pubData.publicUrl);
    if (!pubData.success) throw new Error("Publish failed: " + JSON.stringify(pubData));

    // 5. Test autosave on PUBLISHED form (must succeed, not return 400 DRAFT only error)
    console.log("\n5. Testing draft autosave while status is PUBLISHED...");
    const savePubRes = await fetch(`${BASE_URL}/api/v1/forms/${formId}/draft`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        definition: {
          ...definition,
          title: "Completion Plan Verification Form (Published & Updated)",
        },
        expectedRevision: saveData.newRevision,
      }),
    });
    const savePubData = await savePubRes.json();
    console.log("Autosave on PUBLISHED form status:", savePubRes.status, savePubData.success ? "SUCCESS (Fixed!)" : "FAILED: " + JSON.stringify(savePubData));
    if (!savePubData.success) throw new Error("Autosave on published form failed");

    // 6. Test Public Form Service Password Challenge
    console.log("\n6. Testing public form GET without password cookie...");
    const pubGetRes = await fetch(`${BASE_URL}/api/public/forms/${formId}`);
    const pubGetData = await pubGetRes.json();
    console.log("Public form response:", {
      status: pubGetRes.status,
      isPasswordProtected: pubGetData.form?.isPasswordProtected,
      questionsStripped: pubGetData.form?.definition?.questions?.length === 0,
    });
    if (!pubGetData.form?.isPasswordProtected || pubGetData.form?.definition?.questions?.length !== 0) {
      throw new Error("Password protection gate failed: questions were not stripped or isPasswordProtected is false");
    }
    console.log("=> Password protection gate: VERIFIED (Questions securely hidden)");

    // 7. Test verify-password endpoint
    console.log("\n7. Testing verify-password with wrong password...");
    const wrongPwRes = await fetch(`${BASE_URL}/api/public/forms/${formId}/verify-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "WrongPassword!" }),
    });
    console.log("Wrong password status:", wrongPwRes.status, "(Expected 401)");
    if (wrongPwRes.status !== 401) throw new Error("Expected 401 for wrong password");

    console.log("\nTesting verify-password with correct password...");
    const correctPwRes = await fetch(`${BASE_URL}/api/public/forms/${formId}/verify-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "SecretAccessCode99" }),
    });
    const correctPwData = await correctPwRes.json();
    const accessCookie = correctPwRes.headers.get("set-cookie") || "";
    console.log("Correct password status:", correctPwRes.status, correctPwData.success ? "SUCCESS" : "FAILED");
    console.log("Access cookie received:", accessCookie ? "YES" : "NO");
    if (!correctPwData.success || !accessCookie) throw new Error("Verify password did not return success or access cookie");

    // 8. Test public form GET with access cookie
    console.log("\n8. Testing public form GET with verified access cookie...");
    const unlockedRes = await fetch(`${BASE_URL}/api/public/forms/${formId}`, {
      headers: { Cookie: accessCookie },
    });
    const unlockedData = await unlockedRes.json();
    console.log("Unlocked form response:", {
      status: unlockedRes.status,
      isPasswordProtected: unlockedData.form?.isPasswordProtected || false,
      questionCount: unlockedData.form?.definition?.questions?.length,
    });
    if (unlockedData.form?.definition?.questions?.length !== 2) {
      throw new Error("Expected 2 unlocked questions");
    }
    console.log("=> Password unlock flow: VERIFIED");

    // 9. Test Submission with redirect confirmation
    console.log("\n9. Testing response submission with answers and access cookie...");
    const subRes = await fetch(`${BASE_URL}/api/public/forms/${formId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: accessCookie,
      },
      body: JSON.stringify({
        answers: {
          q_satisfaction: 5,
          q_feedback: "Form settings backend works brilliantly!",
        },
      }),
    });
    const subData = await subRes.json();
    const subCookie = subRes.headers.get("set-cookie") || "";
    console.log("Submission status:", subRes.status, subData.success ? "SUCCESS" : "FAILED");
    console.log("Submission response:", {
      responseId: subData.responseId,
      confirmationType: subData.confirmationType,
      redirectUrl: subData.redirectUrl,
      submissionCookieSet: subCookie.includes("formly_submitted_"),
    });
    if (!subData.success || subData.confirmationType !== "redirect" || !subData.redirectUrl) {
      throw new Error("Submission did not return redirect confirmation metadata");
    }
    console.log("=> Submission & Redirect confirmation: VERIFIED");

    // 10. Test single submission enforcement (limitOneResponse)
    console.log("\n10. Testing limitOneResponse duplicate prevention...");
    const duplicateRes = await fetch(`${BASE_URL}/api/public/forms/${formId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${accessCookie}; ${subCookie}`,
      },
      body: JSON.stringify({
        answers: {
          q_satisfaction: 4,
          q_feedback: "Attempting second response",
        },
      }),
    });
    const duplicateData = await duplicateRes.json();
    console.log("Duplicate submission status:", duplicateRes.status, "Error message:", duplicateData.error);
    if (duplicateRes.status !== 400 || !duplicateData.error?.includes("already submitted")) {
      throw new Error("Expected limitOneResponse to reject duplicate submission");
    }
    console.log("=> limitOneResponse constraint: VERIFIED");

    // 11. Test Owner-Scoped Search API
    console.log("\n11. Testing owner-scoped Search API (GET /api/v1/search?q=Verification)...");
    const searchRes = await fetch(`${BASE_URL}/api/v1/search?q=Verification`, {
      headers: { Cookie: cookieHeader },
    });
    const searchData = await searchRes.json();
    console.log("Search API status:", searchRes.status, {
      formsCount: searchData.forms?.length,
      firstFormTitle: searchData.forms?.[0]?.title,
    });
    if (!searchData.success || !searchData.forms || searchData.forms.length === 0) {
      throw new Error("Search API failed to find created form");
    }
    console.log("=> Owner-scoped search API: VERIFIED");

    console.log("\n🎉 ALL BACKEND COMPLETION PLAN CRITICAL FLOWS VERIFIED SUCCESSFULLY!");
  } catch (err) {
    console.error("\n❌ TEST ERROR:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
