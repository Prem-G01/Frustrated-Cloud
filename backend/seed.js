import Database from 'better-sqlite3';
const db = new Database('db.sqlite');

const services = [
  ['FC_VM', 'FC VM instance', 100, 'month'],
  ['FC_Storage', 'FC Storage 1TB', 100, 'month'],
  ['FC_Network', 'FC VPC, subnet, route, internet gateway', 5, 'month'],
  ['FC_StaticIP', 'FC Static IP', 30, 'month'],
  ['FC_IAM', 'FC IAM', 0, 'month'],
  ['FC_Log', 'FC Log monitor', 500, 'month'],
  ['FC_Resource', 'FC Resource monitor', 500, 'month'],
  ['FC_SIEM', 'FC SIEM', 1000, 'month'],
  ['FC_IaC', 'FC IaC', 10, '100k_triggers'],
  ['FC_Auto', 'FC Automate', 10, '100k_triggers']
];

const create = `CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE, name TEXT, price_per_month INTEGER, unit TEXT)`;
db.exec(create);
const insert = db.prepare('INSERT OR IGNORE INTO services (code,name,price_per_month,unit) VALUES (?,?,?,?)');
for (const s of services) insert.run(...s);
console.log('✅ Services seeded successfully');
