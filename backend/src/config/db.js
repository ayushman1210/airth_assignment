const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./jobs.db', (error) => {
    if (error) {
        console.error('could not connect to database', error.message);
    }
});

const ready = new Promise((resolve, reject) => {
    db.serialize(() => {
        db.all('PRAGMA table_info(jobs)', (error, columns) => {
            if (error) {
                return reject(error);
            }

            const hasCurrentSchema = columns.length > 0 &&
                columns.some((column) => column.name === 'type') &&
                columns.some((column) => column.name === 'status');

            const createTable = () => db.run(`
                CREATE TABLE IF NOT EXISTS jobs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    type TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
                    createdAt TEXT NOT NULL
                )
            `, (createError) => createError ? reject(createError) : resolve());

            if (columns.length > 0 && !hasCurrentSchema) {
                db.run('ALTER TABLE jobs RENAME TO jobs_old', (renameError) => {
                    if (renameError) {
                        return reject(renameError);
                    }

                    db.run(`
                        CREATE TABLE jobs (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            title TEXT NOT NULL,
                            type TEXT NOT NULL,
                            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
                            createdAt TEXT NOT NULL
                        )
                    `, (createError) => {
                        if (createError) {
                            return reject(createError);
                        }

                        db.run(`
                            INSERT INTO jobs (title, type, status, createdAt)
                            SELECT title, 'general', 'pending', createdAt FROM jobs_old
                        `, (copyError) => {
                            if (copyError) {
                                return reject(copyError);
                            }

                            db.run('DROP TABLE jobs_old', (dropError) => {
                                dropError ? reject(dropError) : resolve();
                            });
                        });
                    });
                });
            } else {
                createTable();
            }
        });
    });
});

module.exports = { db, ready };