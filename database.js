/*
 * Knight of the Altar local database.
 * This file defines the data schema and persistence layer used by script.js.
 * Records are stored in this browser's localStorage.
 */
const databaseKey = 'knight-of-altar-local-database-v1';
const coordinatorPin = '2468';
const storedDatabase = JSON.parse(localStorage.getItem(databaseKey) || 'null');
const database = storedDatabase || {
    members: [],
    rsvps: [],
    intentions: []
};

database.members = database.members.map((member) => ({
    ...member,
    rank: member.rank || 'Aspirant',
    joinedAt: member.joinedAt || new Date().toISOString()
}));

const saveDatabase = () => localStorage.setItem(databaseKey, JSON.stringify(database));
const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));