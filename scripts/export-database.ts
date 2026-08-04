import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function exportDatabase() {
  const tables = [
    'User',
    'Product',
    'Order',
    'Coupon',
    'BankTransfer',
    'Winner',
    'Otp',
    'Cart',
    'SiteSettings',
    'Account',
    'Session',
    'OAuthSettings'
  ]

  let sql = ''

  for (const table of tables) {
    try {
      // @ts-ignore
      const data = await prisma[table].findMany()
      
      if (data.length > 0) {
        sql += `-- Data for ${table}\n`
        
        for (const row of data) {
          const columns = Object.keys(row)
          const values = columns.map(col => {
            const val = row[col]
            if (val === null) return 'NULL'
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
            if (typeof val === 'boolean') return val ? 'true' : 'false'
            if (val instanceof Date) return `'${val.toISOString()}'`
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`
            return val
          })
          
          sql += `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`
        }
        
        sql += '\n'
      }
    } catch (error) {
      console.log(`Skipping ${table}:`, error)
    }
  }

  fs.writeFileSync('database-export.sql', sql)
  console.log('Database exported to database-export.sql')
}

exportDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
