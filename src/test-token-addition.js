// Test script to verify token addition logic
// This simulates the behavior of the updateUserCredits function

// Mock user and metadata
const userId = 'test-user-id';
const initialTokens = 10;
let currentTokens = initialTokens;

// Mock metadata with tokens
const metadata = { tokens: 25 };

// Simulate the updateUserCredits function
function updateUserCredits(userId, metadata) {
  // Extract token amount from metadata
  const tokenAmount = metadata.tokens || 0;
  
  if (tokenAmount <= 0) {
    console.log(`No tokens to add for user: ${userId}`);
    return;
  }
  
  // In the real function, we'd fetch current tokens from the database
  // Here we're using our mock currentTokens variable
  
  const newTokens = currentTokens + tokenAmount;
  
  console.log(`Adding ${tokenAmount} tokens to user ${userId}`);
  console.log(`Current tokens: ${currentTokens}`);
  console.log(`New tokens: ${newTokens}`);
  
  // Update our mock currentTokens
  currentTokens = newTokens;
  
  console.log(`Updated credits for user: ${userId} from ${initialTokens} to ${newTokens} tokens`);
}

// Test 1: Add tokens
console.log('=== Test 1: Add tokens ===');
updateUserCredits(userId, metadata);

// Test 2: Add tokens again (should add to the updated balance)
console.log('\n=== Test 2: Add tokens again ===');
updateUserCredits(userId, metadata);

// Test 3: Add 0 tokens (should skip)
console.log('\n=== Test 3: Add 0 tokens ===');
updateUserCredits(userId, { tokens: 0 });

// Test 4: Add tokens with no metadata (should use default 0)
console.log('\n=== Test 4: Add tokens with no metadata ===');
updateUserCredits(userId, {});

console.log('\n=== Final token count ===');
console.log(`User ${userId} has ${currentTokens} tokens`);
console.log(`Started with ${initialTokens} tokens`);
console.log(`Total tokens added: ${currentTokens - initialTokens}`); 