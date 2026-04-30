import mongoose from 'mongoose';

export const tutorialDB = mongoose.createConnection(process.env.TUTORIAL_DB_URI);
export const blogDB = mongoose.createConnection(process.env.BLOG_DB_URI);

tutorialDB.on('connected', () => console.log('Tutorial DB connected'));
tutorialDB.on('error', (err) => { console.log('Tutorial DB error', err); process.exit(1); });

blogDB.on('connected', () => console.log('Blog DB connected'));
// blogDB.on('error', (err) => { console.log('Blog DB error', err); process.exit(1); });