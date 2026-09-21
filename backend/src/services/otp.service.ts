import redis from "../config/redis";

const OTP_TTL = 5 * 60; // 5 minutes

function getOtpKey(email: string) {
  return `otp:${email.toLowerCase()}`;
}

export async function generateAndStoreOtp(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redis.set(getOtpKey(email), otp, "EX", OTP_TTL);

  return otp;
}

export async function verifyOtp(email: string, otp: string) {
  const key = getOtpKey(email);

  const storedOtp = await redis.get(key);

  if (!storedOtp) {
    return false;
  }

  if (storedOtp !== otp) {
    return false;
  }

  await redis.del(key);

  return true;
}
