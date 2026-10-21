import assert from 'node:assert';
import { io } from 'socket.io-client';
import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:3000';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/linguachat';

// Helper to generate dynamic random strings
function randomStr(prefix = 'str', len = 6) {
  const rand = Math.random().toString(36).substring(2, 2 + len);
  const ts = Date.now().toString(36).slice(-4);
  return `${prefix}_${ts}_${rand}`;
}

// Helper to generate dynamic random integer in range [min, max]
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.log('================================================================');
console.log('🚀 DYNAMIC BACKEND PROCESS AUDIT & REAL-TIME TEST');
console.log('⚠️  NO DEFAULT VALUES - NO STATIC VALUES - 100% DYNAMIC PAYLOADS');
console.log('================================================================\n');

async function runDynamicTests() {
  const testResults = [];

  function record(stepName, status, details) {
    testResults.push({ stepName, status, details });
    console.log(`[${status === 'PASS' ? '✅ PASS' : '❌ FAIL'}] ${stepName}: ${details}`);
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Health & Runtime Statistics Probe
    // -------------------------------------------------------------
    console.log('\n--- Step 1: Dynamic Probe of Health & Runtime Endpoint ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(healthRes.status, 200, 'Health endpoint must respond with 200');
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.success, true);
    assert.strictEqual(healthData.status, 'ok');
    assert.ok(healthData.timestamp, 'Timestamp must be present');
    record('Health Check & Service Telemetry', 'PASS', `Status: ${healthData.status}, DB: ${healthData.database}, Server Time: ${healthData.timestamp}`);

    // -------------------------------------------------------------
    // TEST 2: Dynamic User Registration (No Static Data)
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Dynamic User Registration ---');
    const dynamicUser1 = {
      username: randomStr('user'),
      email: `${randomStr('email')}@testdomain-${randomInt(100, 999)}.org`,
      password: `P@ss_${randomStr('sec', 8)}!${randomInt(10, 99)}`,
      nativeLanguage: ['es', 'fr', 'de', 'ta', 'ja'][randomInt(0, 4)],
      preferredLanguage: ['en', 'es', 'fr', 'ta'][randomInt(0, 3)],
    };

    const dynamicUser2 = {
      username: randomStr('peer'),
      email: `${randomStr('email')}@peerdomain-${randomInt(100, 999)}.net`,
      password: `P@ss_${randomStr('sec', 8)}!${randomInt(10, 99)}`,
      nativeLanguage: ['it', 'pt', 'hi', 'zh'][randomInt(0, 3)],
      preferredLanguage: 'en',
    };

    console.log('Generated Dynamic User 1:', { username: dynamicUser1.username, email: dynamicUser1.email, lang: dynamicUser1.nativeLanguage });
    console.log('Generated Dynamic User 2:', { username: dynamicUser2.username, email: dynamicUser2.email, lang: dynamicUser2.nativeLanguage });

    const regRes1 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dynamicUser1),
    });
    const regData1 = await regRes1.json();
    assert.strictEqual(regRes1.status, 201, `User 1 registration failed: ${JSON.stringify(regData1)}`);
    assert.strictEqual(regData1.success, true);
    assert.ok(regData1.user.userId);
    assert.strictEqual(regData1.user.email, dynamicUser1.email.toLowerCase());
    record('Dynamic User 1 Registration', 'PASS', `Created userId: ${regData1.user.userId} (${dynamicUser1.email})`);

    const regRes2 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dynamicUser2),
    });
    const regData2 = await regRes2.json();
    assert.strictEqual(regRes2.status, 201, `User 2 registration failed: ${JSON.stringify(regData2)}`);
    record('Dynamic User 2 Registration', 'PASS', `Created userId: ${regData2.user.userId} (${dynamicUser2.email})`);

    // -------------------------------------------------------------
    // TEST 3: Dynamic Authentication & JWT Token Verification
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Dynamic Authentication & JWT Generation ---');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: dynamicUser1.email,
        password: dynamicUser1.password,
      }),
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200, `Login failed: ${JSON.stringify(loginData)}`);
    assert.strictEqual(loginData.success, true);
    assert.ok(loginData.token, 'JWT Token must be generated');
    const jwtToken = loginData.token;
    record('Dynamic Authentication & JWT Issuance', 'PASS', `Successfully authenticated dynamic user; received JWT (length: ${jwtToken.length})`);

    // -------------------------------------------------------------
    // TEST 4: Authenticated /api/auth/me Verification
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Authenticated Profile Fetch ---');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    const meData = await meRes.json();
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meData.success, true);
    assert.strictEqual(meData.user.email, dynamicUser1.email.toLowerCase());
    assert.strictEqual(meData.user.username, dynamicUser1.username);
    record('JWT Profile Verification (/api/auth/me)', 'PASS', `Token authenticated for ${meData.user.username} (${meData.user.userId})`);

    // -------------------------------------------------------------
    // TEST 5: Dynamic Conversation / Chat Room Creation
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Dynamic Chat Conversation Creation ---');
    const dynamicChatPayload = {
      name: `Project Room ${randomStr('room')}`,
      isGroup: true,
      participantIds: [regData1.user.userId, regData2.user.userId],
      languages: [dynamicUser1.nativeLanguage, dynamicUser2.nativeLanguage],
    };

    const chatRes = await fetch(`${BASE_URL}/api/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(dynamicChatPayload),
    });
    const chatData = await chatRes.json();
    assert.strictEqual(chatRes.status, 201, `Chat creation failed: ${JSON.stringify(chatData)}`);
    assert.strictEqual(chatData.success, true);
    assert.ok(chatData.chat.groupId);
    const createdChatId = chatData.chat.groupId;
    record('Dynamic Chat Creation', 'PASS', `Created chat room "${chatData.chat.name}" with ID: ${createdChatId}`);

    // -------------------------------------------------------------
    // TEST 6: Dynamic Message Transmission & Persistence
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Dynamic Message Transmission ---');
    const dynamicMessageContent = `Dynamic test transaction payload ${randomStr('msg', 12)} at timestamp ${Date.now()}`;
    const messageRes = await fetch(`${BASE_URL}/api/chats/${createdChatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        text: dynamicMessageContent,
        senderId: regData1.user.userId,
        senderName: dynamicUser1.username,
        sourceLanguage: dynamicUser1.nativeLanguage,
        targetLanguage: 'en',
      }),
    });
    const messageData = await messageRes.json();
    assert.strictEqual(messageRes.status, 201, `Message creation failed: ${JSON.stringify(messageData)}`);
    assert.strictEqual(messageData.success, true);
    assert.ok(messageData.message.messageId);
    assert.strictEqual(messageData.message.originalText, dynamicMessageContent);
    record('Dynamic Message Transmission', 'PASS', `Transmitted messageId: ${messageData.message.messageId}`);

    // -------------------------------------------------------------
    // TEST 7: Query Messages for Dynamic Chat
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Verify Message Fetch from Room ---');
    const fetchMsgsRes = await fetch(`${BASE_URL}/api/chats/${createdChatId}/messages`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    const fetchMsgsData = await fetchMsgsRes.json();
    assert.strictEqual(fetchMsgsRes.status, 200);
    assert.strictEqual(fetchMsgsData.success, true);
    assert.ok(Array.isArray(fetchMsgsData.messages));
    const foundMessage = fetchMsgsData.messages.find(m => m.messageId === messageData.message.messageId);
    assert.ok(foundMessage, 'Dynamic message must exist in fetched list');
    assert.strictEqual(foundMessage.originalText, dynamicMessageContent);
    record('Dynamic Message Fetch & Verification', 'PASS', `Verified message persistence in chat ${createdChatId} (total messages: ${fetchMsgsData.messages.length})`);

    // -------------------------------------------------------------
    // TEST 8: Dynamic Translation Service & Detection
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Dynamic Translation Service & Detection ---');
    const sampleSentences = [
      { text: 'Bonjour mon ami, comment se déroule le travail aujourd’hui?', expectedLang: 'fr', target: 'en' },
      { text: 'Hola a todos, esta es una prueba dinámica en tiempo real.', expectedLang: 'es', target: 'en' },
      { text: 'Guten Tag, das System funktioniert einwandfrei und zuverlässig.', expectedLang: 'de', target: 'en' },
    ];
    const chosenSample = sampleSentences[randomInt(0, sampleSentences.length - 1)];

    const detectRes = await fetch(`${BASE_URL}/api/translate/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chosenSample.text }),
    });
    const detectData = await detectRes.json();
    assert.strictEqual(detectRes.status, 200);
    assert.strictEqual(detectData.success, true);
    assert.ok(detectData.language, 'Detected language must be returned');

    const transRes = await fetch(`${BASE_URL}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: chosenSample.text,
        sourceLanguage: detectData.language,
        targetLanguage: chosenSample.target,
      }),
    });
    const transData = await transRes.json();
    assert.strictEqual(transRes.status, 200);
    assert.strictEqual(transData.success, true);
    assert.ok(transData.translatedText, 'Translation result must be returned');
    record('Dynamic Language Detection & Translation', 'PASS', `Detected: ${detectData.language} -> Translated text: "${transData.translatedText.substring(0, 40)}..."`);

    // -------------------------------------------------------------
    // TEST 9: Dynamic Translation Debt Formula Validation
    // -------------------------------------------------------------
    console.log('\n--- Step 9: Dynamic Translation Debt Ledger Calculation ---');
    // Generate purely dynamic arbitrary values
    const dynConfidence = randomInt(40, 95);
    const dynCorrections = randomInt(1, 4);
    const dynComplexity = randomInt(20, 90);
    const dynHours = randomInt(1, 48);
    const dynAuditApproved = Math.random() > 0.5;

    // Mathematical formula implemented in server.ts:
    // confidenceDebt = Number(((100 - Math.min(100, Math.max(0, confidenceScore))) * 0.30).toFixed(1));
    // correctionDebt = Number((Math.min(correctionCount * 12.5, 25)).toFixed(1));
    // auditApprovalDebt = isAuditApproved ? 0 : 20;
    // complexityDebt = Number(((Math.min(100, Math.max(0, codeSwitchComplexity)) / 100) * 15).toFixed(1));
    // timeDebt = Number((Math.min((hoursSinceReview / 24) * 10, 10)).toFixed(1));
    // totalDebtScore = Math.round(confidenceDebt + correctionDebt + auditApprovalDebt + complexityDebt + timeDebt);

    const expConfDebt = Number(((100 - dynConfidence) * 0.30).toFixed(1));
    const expCorrDebt = Number((Math.min(dynCorrections * 12.5, 25)).toFixed(1));
    const expAuditDebt = dynAuditApproved ? 0 : 20;
    const expCompDebt = Number(((dynComplexity / 100) * 15).toFixed(1));
    const expTimeDebt = Number((Math.min((dynHours / 24) * 10, 10)).toFixed(1));
    const expTotal = Math.round(expConfDebt + expCorrDebt + expAuditDebt + expCompDebt + expTimeDebt);

    const dynAiTranslation = `Dynamic translation text ${randomStr('trans')}`;

    const debtRes = await fetch(`${BASE_URL}/api/debt/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalMessage: `Dynamic test message ${randomStr('debt')}`,
        aiTranslation: dynAiTranslation,
        confidenceScore: dynConfidence,
        correctionCount: dynCorrections,
        isAuditApproved: dynAuditApproved,
        codeSwitchComplexity: dynComplexity,
        hoursSinceReview: dynHours,
      }),
    });
    const debtData = await debtRes.json();
    assert.strictEqual(debtRes.status, 201, `Debt calculation endpoint failed: ${JSON.stringify(debtData)}`);
    assert.strictEqual(debtData.success, true);
    assert.strictEqual(debtData.debtItem.debtScore, expTotal, `Debt score mismatch: got ${debtData.debtItem.debtScore}, expected ${expTotal}`);
    record('Dynamic Translation Debt Formula', 'PASS', `Inputs: [Conf: ${dynConfidence}%, Corr: ${dynCorrections}, Audit: ${dynAuditApproved}, Comp: ${dynComplexity}, Hours: ${dynHours}] -> Computed Score: ${debtData.debtItem.debtScore} (Exact Math Match)`);

    // -------------------------------------------------------------
    // TEST 10: Real-Time Socket.IO Handshake & Event Loop
    // -------------------------------------------------------------
    console.log('\n--- Step 10: Real-time Socket.IO Handshake & Event Loop ---');
    const socketConnected = await new Promise((resolve, reject) => {
      const socket = io(BASE_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      const timer = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Socket.io connection timeout after 5000ms'));
      }, 5000);

      socket.on('connect', () => {
        clearTimeout(timer);
        const sid = socket.id;
        // Test room join event
        socket.emit('join-chat', { chatId: createdChatId, userId: regData1.user.userId });
        socket.disconnect();
        resolve(sid);
      });

      socket.on('connect_error', (err) => {
        clearTimeout(timer);
        socket.disconnect();
        reject(err);
      });
    });
    assert.ok(socketConnected, 'Socket connection id must be returned');
    record('Real-Time Socket.IO Handshake', 'PASS', `Connected and established real-time bidirectional socket ID: ${socketConnected}`);

    // -------------------------------------------------------------
    // TEST 11: MongoDB Direct Persistence Verification
    // -------------------------------------------------------------
    console.log('\n--- Step 11: Direct Database Verification in MongoDB ---');
    const conn = await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    const userDoc = await conn.connection.db.collection('users').findOne({ userId: regData1.user.userId });
    assert.ok(userDoc, `Dynamic user ${regData1.user.userId} must exist in MongoDB 'users' collection`);
    assert.strictEqual(userDoc.email, dynamicUser1.email.toLowerCase());

    const messageDoc = await conn.connection.db.collection('messages').findOne({ messageId: messageData.message.messageId });
    assert.ok(messageDoc, `Dynamic message ${messageData.message.messageId} must exist in MongoDB 'messages' collection`);
    assert.strictEqual(messageDoc.originalText, dynamicMessageContent);

    await mongoose.disconnect();
    record('Direct MongoDB Database Audit', 'PASS', `Confirmed dynamic User (${userDoc.userId}) and Message (${messageDoc.messageId}) persisted in MongoDB`);

    console.log('\n================================================================');
    console.log('🎉 ALL DYNAMIC BACKEND TESTS PASSED SUCCESSFULLY! (11/11)');
    console.log('================================================================');
    return { success: true, results: testResults };

  } catch (err) {
    console.error('\n❌ TEST FAILURE OCCURRED:', err.message);
    record('Audit Failure Exception', 'FAIL', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    return { success: false, error: err.message, results: testResults };
  }
}

runDynamicTests().then((res) => {
  if (!res.success) {
    process.exit(1);
  }
  process.exit(0);
});
