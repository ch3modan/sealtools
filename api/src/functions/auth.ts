import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createHash, randomBytes } from 'crypto';
import { getUsersContainer, getReferralContainer } from '../lib/cosmos';

/**
 * Hash a password with a salt using SHA-256.
 * For production, consider bcrypt or argon2 — but those need native modules.
 */
function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

/**
 * POST /api/auth/signup
 * Body: { email, password, displayName, referralCode }
 *
 * Creates a new user with email/password credentials.
 * Requires a valid referral code.
 */
export async function signup(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      displayName?: string;
      referralCode?: string;
    };

    if (!body.email || !body.password || !body.referralCode) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: email, password, referralCode' },
      };
    }

    if (body.password.length < 6) {
      return {
        status: 400,
        jsonBody: { error: 'Password must be at least 6 characters' },
      };
    }

    // Validate referral code
    const referralContainer = await getReferralContainer();
    try {
      const { resource: referral } = await referralContainer
        .item(body.referralCode, body.referralCode)
        .read();

      if (!referral) {
        return { status: 403, jsonBody: { error: 'Invalid referral code' } };
      }

      if (referral.maxUses && referral.usedCount >= referral.maxUses) {
        return { status: 403, jsonBody: { error: 'Referral code has reached maximum uses' } };
      }
    } catch {
      return { status: 403, jsonBody: { error: 'Invalid referral code' } };
    }

    // Check if user already exists
    const usersContainer = await getUsersContainer();
    const { resources: existing } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: body.email.toLowerCase() }],
      })
      .fetchAll();

    if (existing.length > 0) {
      return { status: 409, jsonBody: { error: 'Email already registered' } };
    }

    // Create user
    const salt = randomBytes(16).toString('hex');
    const passwordHash = hashPassword(body.password, salt);
    const userId = randomBytes(12).toString('hex');
    const sessionToken = randomBytes(32).toString('hex');

    const newUser = {
      id: userId,
      userId,
      email: body.email.toLowerCase(),
      displayName: body.displayName || body.email.split('@')[0],
      passwordHash,
      salt,
      referralCode: body.referralCode,
      sessionToken,
      createdAt: new Date().toISOString(),
    };

    await usersContainer.items.create(newUser);

    // Increment referral usage
    const referralContainer2 = await getReferralContainer();
    const { resource: referral } = await referralContainer2
      .item(body.referralCode, body.referralCode)
      .read();
    if (referral) {
      referral.usedCount = (referral.usedCount || 0) + 1;
      referral.usedBy = [...(referral.usedBy || []), userId];
      await referralContainer2.item(referral.id, referral.code).replace(referral);
    }

    context.log(`User ${userId} signed up with email ${body.email}`);

    return {
      status: 201,
      jsonBody: {
        message: 'Account created successfully',
        user: {
          userId,
          email: newUser.email,
          displayName: newUser.displayName,
          sessionToken,
        },
      },
    };
  } catch (error: any) {
    context.error('signup error:', error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Authenticates a user with email/password and returns a session token.
 */
export async function login(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!body.email || !body.password) {
      return { status: 400, jsonBody: { error: 'Missing email or password' } };
    }

    const usersContainer = await getUsersContainer();
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: body.email.toLowerCase() }],
      })
      .fetchAll();

    if (resources.length === 0) {
      return { status: 401, jsonBody: { error: 'Invalid email or password' } };
    }

    const user = resources[0];
    const passwordHash = hashPassword(body.password, user.salt);

    if (passwordHash !== user.passwordHash) {
      return { status: 401, jsonBody: { error: 'Invalid email or password' } };
    }

    // Generate new session token
    const sessionToken = randomBytes(32).toString('hex');
    user.sessionToken = sessionToken;
    user.lastLoginAt = new Date().toISOString();
    await usersContainer.item(user.id, user.userId).replace(user);

    return {
      status: 200,
      jsonBody: {
        message: 'Login successful',
        user: {
          userId: user.userId,
          email: user.email,
          displayName: user.displayName,
          sessionToken,
        },
      },
    };
  } catch (error: any) {
    context.error('login error:', error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}
