const { db, ready } = require('../config/db');

async function getAll() {
    await ready;
    return new Promise((resolve, reject) => {
        db.all('SELECT id, title, type, status, createdAt FROM jobs ORDER BY id DESC', (error, rows) => {
            if (error) {
                return reject(error);
            }
            resolve(rows);
        });
    });
}

async function create({ title, type, status }) {
    await ready;
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();

        db.run(
            'INSERT INTO jobs (title, type, status, createdAt) VALUES (?, ?, ?, ?)',
            [title, type, status || 'pending', createdAt],
            function (error) {
                if (error) {
                    return reject(error);
                }
                resolve({ id: this.lastID, title, type, status: status || 'pending', createdAt });
            }
        );
    });
}

async function findById(id) {
    await ready;
    return new Promise((resolve, reject) => {
        db.get('SELECT id, title, type, status, createdAt FROM jobs WHERE id = ?', [id], (error, row) => {
            if (error) {
                return reject(error);
            }
            resolve(row);
        });
    });
}

async function updateStatus(id, status, previousStatuses) {
    await ready;
    return new Promise((resolve, reject) => {
        const placeholders = previousStatuses.map(() => '?').join(', ');
        const values = [status, id, ...previousStatuses];

        db.run(`UPDATE jobs SET status = ? WHERE id = ? AND status IN (${placeholders})`, values, function (error) {
            if (error) {
                return reject(error);
            }
            resolve(this.changes ? true : false);
        });
    });
}

async function remove(id) {
    await ready;
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM jobs WHERE id = ?', [id], function (error) {
            if (error) {
                return reject(error);
            }
            resolve(this.changes ? true : null);
        });
    });
}

module.exports = { getAll, create, findById, updateStatus, remove };