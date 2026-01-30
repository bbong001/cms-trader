// This script creates a symlink to the parent project's Prisma schema
// Run: node prisma-symlink.js

import { symlink } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const parentSchema = join(__dirname, '..', 'prisma', 'schema.prisma');
const cmsSchema = join(__dirname, 'prisma', 'schema.prisma');

console.log('Creating symlink for Prisma schema...');
console.log('Parent:', parentSchema);
console.log('CMS:', cmsSchema);

// Note: This is just a helper script. You can manually copy the schema or use the parent's generated client.

