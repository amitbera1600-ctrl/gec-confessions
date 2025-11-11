const express = require('express')
const path = require('path')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const sqlite3 = require('sqlite3').verbose()

const DB_PATH = path.join(__dirname, 'confessions.db')
const db = new sqlite3.Database(DB_PATH)

db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS confessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
})

const app = express()
app.use(helmet())
app.use(express.json())

const limiter = rateLimit({ windowMs: 60*1000, max: 6 })
app.use('/api/', limiter)

app.get('/api/confessions', (req, res) => {
  db.all('SELECT id, content, created_at FROM confessions ORDER BY created_at DESC LIMIT 100', (err, rows)=>{
    if(err) return res.status(500).json({error:'DB error'})
    res.json(rows)
  })
})

app.post('/api/confessions', (req, res) => {
  const { content } = req.body
  if(!content || !content.trim() || content.length > 2000) return res.status(400).json({error:'Invalid content'})

  const banned = ['@admin','http://','https://']
  for(const b of banned){ if(content.includes(b)) return res.status(400).json({error:'Invalid content'}) }

  const stmt = db.prepare('INSERT INTO confessions(content) VALUES(?)')
  stmt.run(content.trim(), function(err){
    if(err) return res.status(500).json({error:'DB error'})
    res.status(201).json({id: this.lastID})
  })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, ()=> console.log('Server listening on', PORT))
