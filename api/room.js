// Vercel Serverless Function: api/room.js
// Provides reliable real-time synchronization between host and participants

// Global in-memory cache shared across requests in the container
const rooms = global.__gd_rooms || (global.__gd_rooms = new Map());

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method } = req;

    try {
        if (method === 'GET') {
            const code = (req.query.code || req.query.room || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (!code) {
                return res.status(400).json({ success: false, error: 'Room code is required' });
            }

            const room = rooms.get(code);
            if (!room) {
                return res.status(404).json({ success: false, error: 'Room not found' });
            }

            return res.status(200).json({ success: true, room });
        }

        if (method === 'POST') {
            let body = req.body;
            if (typeof body === 'string') {
                try { body = JSON.parse(body); } catch (e) {}
            }
            body = body || {};
            const action = body.action;

            if (action === 'create') {
                const room = body.room;
                if (!room || !room.roomCode) {
                    return res.status(400).json({ success: false, error: 'Invalid room payload' });
                }
                const cleanCode = room.roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
                rooms.set(cleanCode, room);
                return res.status(200).json({ success: true, room });
            }

            if (action === 'join') {
                const cleanCode = (body.roomCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
                const participant = body.participant;
                let room = rooms.get(cleanCode);

                if (!room && body.room) {
                    room = body.room;
                    rooms.set(cleanCode, room);
                }

                if (!room) {
                    return res.status(404).json({ success: false, error: 'Room not found' });
                }

                if (participant && participant.name) {
                    const exists = (room.participants || []).some(
                        p => p.name.toLowerCase() === participant.name.toLowerCase()
                    );
                    if (!exists) {
                        if (!room.participants) room.participants = [];
                        room.participants.push(participant);
                    }
                }

                rooms.set(cleanCode, room);
                return res.status(200).json({ success: true, room });
            }

            if (action === 'start') {
                const cleanCode = (body.roomCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
                let room = rooms.get(cleanCode);
                if (room) {
                    room.status = 'active';
                    rooms.set(cleanCode, room);
                }
                return res.status(200).json({ success: true, room });
            }

            if (action === 'sync') {
                const room = body.room;
                if (room && room.roomCode) {
                    const cleanCode = room.roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    const existing = rooms.get(cleanCode);
                    if (existing) {
                        // Merge participants safely
                        const pMap = new Map();
                        (existing.participants || []).forEach(p => pMap.set(p.name.toLowerCase(), p));
                        (room.participants || []).forEach(p => pMap.set(p.name.toLowerCase(), p));
                        existing.participants = Array.from(pMap.values());
                        if (room.status === 'active') existing.status = 'active';
                        rooms.set(cleanCode, existing);
                        return res.status(200).json({ success: true, room: existing });
                    } else {
                        rooms.set(cleanCode, room);
                        return res.status(200).json({ success: true, room });
                    }
                }
            }

            return res.status(400).json({ success: false, error: 'Unknown action' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
