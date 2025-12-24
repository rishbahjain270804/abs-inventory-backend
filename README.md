# ABS Inventory Backend

Backend API for ABS Inventory Management System.

## Environment Variables

Create a `.env` file with:

```env
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=abs_inventory_system
PORT=5000
JWT_SECRET=your_secret_key
```

## Local Development

```bash
npm install
node scripts/initDatabase.js
node scripts/insertDummyData.js
npm run dev
```

## Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Note**: Vercel serverless functions don't support persistent database connections. Consider using:
- PlanetScale (MySQL-compatible)
- Railway
- AWS RDS
- Heroku
- Render (better for Node.js + MySQL)
