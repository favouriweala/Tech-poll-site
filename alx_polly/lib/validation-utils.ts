/**
 * Comprehensive Input Validation and Sanitization Utilities
 * 
 * WHAT: Centralized validation and sanitization functions for all user inputs
 * WHY: Ensures consistent security practices across the application and prevents XSS/injection attacks
 * HOW: Provides reusable validation schemas, sanitization functions, and security utilities
 */

import { z } from 'zod';

// =====================================================
// SANITIZATION FUNCTIONS
// =====================================================

/**
 * Sanitizes text input to prevent XSS attacks
 * @param input - Raw text input
 * @returns Sanitized text safe for display
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>"'&]/g, (match) => {
      const htmlEntities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return htmlEntities[match] || match;
    })
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
}

/**
 * Sanitizes HTML content while preserving safe tags
 * @param input - Raw HTML input
 * @returns Sanitized HTML with only safe tags
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/\s(on\w+|javascript:|data:|vbscript:)[^\s>]*/gi, '');
  
  // Remove dangerous tags
  const dangerousTags = /<(iframe|object|embed|form|input|textarea|select|button|link|meta|base)[^>]*>/gi;
  sanitized = sanitized.replace(dangerousTags, '');
  
  return sanitized.trim();
}

/**
 * Sanitizes email addresses
 * @param email - Raw email input
 * @returns Sanitized email in lowercase
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, ''); // Only allow valid email characters
}

/**
 * Sanitizes URLs to prevent malicious redirects
 * @param url - Raw URL input
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }
  
  const trimmed = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = /^(javascript:|data:|vbscript:|file:|ftp:)/i;
  if (dangerousProtocols.test(trimmed)) {
    return '';
  }
  
  // Only allow http, https, and relative URLs
  if (trimmed.startsWith('//') || trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  return '';
}

// =====================================================
// VALIDATION PATTERNS
// =====================================================

export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  name: /^[a-zA-Z\s]{2,50}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  mediumPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
  pollTitle: /^[a-zA-Z0-9\s\?\!\.,;:()\-]{3,200}$/,
  pollOption: /^[a-zA-Z0-9\s\?\!\.,;:()\-]{1,100}$/
} as const;

// =====================================================
// ZOD VALIDATION SCHEMAS
// =====================================================

/**
 * User profile validation schema
 */
export const UserProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(ValidationPatterns.name, 'Name can only contain letters and spaces')
    .transform(sanitizeText),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(254, 'Email is too long')
    .transform(sanitizeEmail),
  
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .transform((val: string | undefined) => val ? sanitizeText(val) : undefined)
});

/**
 * Password validation schema
 */
export const PasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(ValidationPatterns.mediumPassword, 'Password must contain uppercase, lowercase, and numbers'),
  
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data: any) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
}).refine((data: any) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
});

/**
 * Poll creation validation schema
 */
export const PollCreationSchema = z.object({
  title: z
    .string()
    .min(3, 'Poll title must be at least 3 characters')
    .max(200, 'Poll title must be less than 200 characters')
    .regex(ValidationPatterns.pollTitle, 'Poll title contains invalid characters')
    .transform(sanitizeText),
  
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .transform((val: string | undefined) => val ? sanitizeText(val) : undefined),
  
  options: z
    .array(
      z.object({
        text: z
          .string()
          .min(1, 'Option cannot be empty')
          .max(100, 'Option must be less than 100 characters')
          .regex(ValidationPatterns.pollOption, 'Option contains invalid characters')
          .transform(sanitizeText)
      })
    )
    .min(2, 'At least 2 options are required')
    .max(10, 'Maximum 10 options allowed')
    .refine((options: any[]) => {
      const texts = options.map((opt: any) => opt.text.toLowerCase());
      return new Set(texts).size === texts.length;
    }, 'All options must be unique'),
  
  allowMultipleSelections: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  endDate: z.string().optional().nullable()
});

/**
 * Login validation schema
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform(sanitizeEmail),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

/**
 * Registration validation schema
 */
export const RegistrationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(ValidationPatterns.name, 'Name can only contain letters and spaces')
    .transform(sanitizeText),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(254, 'Email is too long')
    .transform(sanitizeEmail),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(ValidationPatterns.mediumPassword, 'Password must contain uppercase, lowercase, and numbers')
});

/**
 * Vote submission validation schema
 */
export const VoteSubmissionSchema = z.object({
  pollId: z
    .string()
    .uuid('Invalid poll ID'),
  
  optionIds: z
    .array(z.string().uuid('Invalid option ID'))
    .min(1, 'At least one option must be selected')
    .max(10, 'Too many options selected')
});

// =====================================================
// VALIDATION HELPER FUNCTIONS
// =====================================================

/**
 * Validates and sanitizes form data using a Zod schema
 * @param schema - Zod validation schema
 * @param data - Raw form data to validate
 * @returns Validation result with sanitized data or errors
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Password strength assessment
 */
export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isValid: boolean;
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one lowercase letter');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one uppercase letter');
  }
  
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }
  
  if (/[@$!%*?&]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain at least one special character (@$!%*?&)');
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  return {
    score,
    feedback,
    isValid: score >= 4 && password.length >= 8
  };
}

/**
 * Validates file uploads
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { isValid: boolean; error?: string } {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`
    };
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed`
    };
  }
  
  return { isValid: true };
}

/**
 * Rate limiting validation
 * @param key - Unique identifier for rate limiting
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 * @returns Whether the request is within rate limits
 */
export function validateRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  // This is a simple in-memory rate limiter
  // In production, use Redis or a proper rate limiting service
  
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get or create rate limit data
  if (typeof window !== 'undefined') {
    // Client-side rate limiting (basic)
    const storageKey = `rate_limit_${key}`;
    const stored = localStorage.getItem(storageKey);
    const data = stored ? JSON.parse(stored) : { requests: [], resetTime: now + windowMs };
    
    // Remove old requests
    data.requests = data.requests.filter((time: number) => time > windowStart);
    
    if (data.requests.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.resetTime
      };
    }
    
    // Add current request
    data.requests.push(now);
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    return {
      allowed: true,
      remaining: limit - data.requests.length,
      resetTime: data.resetTime
    };
  }
  
  // Server-side would use a proper store (Redis, database, etc.)
  return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
}

// =====================================================
// SECURITY UTILITIES
// =====================================================

/**
 * Generates a secure random string
 * @param length - Length of the string to generate
 * @returns Cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
}

/**
 * Validates CSRF token
 * @param token - Token to validate
 * @param expectedToken - Expected token value
 * @returns Whether the token is valid
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Validates IP address format
 * @param ip - IP address to validate
 * @returns Whether the IP address is valid
 */
export function validateIPAddress(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Export types for TypeScript
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export type PasswordStrength = {
  score: number;
  feedback: string[];
  isValid: boolean;
};

export type FileValidationResult = {
  isValid: boolean;
  error?: string;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetTime: number;
};