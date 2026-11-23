// ─────────────────────────────────────────────
// Database Seeder Script
//
// Populates PostgreSQL with the exact 32 demo
// leads and metrics matching the UI screenshot:
//   • 12 New (37.5%)
//   • 10 Contacted (31.25%)
//   • 8 Qualified (25%)
//   • 2 Lost (6.25%)
//
// Sources breakdown:
//   • 14 Website
//   • 8 Referral
//   • 6 LinkedIn
//   • 4 Other
// ─────────────────────────────────────────────
import { connectDB } from '../config/database.js';
import { User, Lead } from '../models/index.js';

const SEED_USER = {
  name: 'Alex Morgan',
  email: 'alex@leadmanager.io',
  password: 'Password123!'
};

const SEED_LEADS = [
  // ── New Leads (12) ──────────────────────────
  { name: 'Emma Wilson', company: 'Northstar', email: 'emma@northstar.io', phone: '+1 415 555 0101', source: 'Website', status: 'New' },
  { name: 'Noah Williams', company: 'Spherule', email: 'noah@spherule.com', phone: '+1 415 555 0104', source: 'Website', status: 'New' },
  { name: 'Ethan Davis', company: 'Luminous', email: 'ethan@luminous.co', phone: '+1 415 555 0108', source: 'LinkedIn', status: 'New' },
  { name: 'Maya Patel', company: 'Brightside', email: 'maya@brightside.com', phone: '+1 415 555 0109', source: 'Referral', status: 'New' },
  { name: 'Lucas Martin', company: 'Acme Corp', email: 'lucas@acmecorp.com', phone: '+1 415 555 0110', source: 'Website', status: 'New' },
  { name: 'Isabella Rossi', company: 'Starlight', email: 'isabella@starlight.io', phone: '+1 415 555 0113', source: 'Website', status: 'New' },
  { name: 'William Vance', company: 'Strata Labs', email: 'william@strata.ai', phone: '+1 415 555 0115', source: 'LinkedIn', status: 'New' },
  { name: 'Mia Tanaka', company: 'Sakura Tech', email: 'mia@sakuratech.jp', phone: '+1 415 555 0117', source: 'Website', status: 'New' },
  { name: 'Henry Zhang', company: 'Horizon AI', email: 'henry@horizon.ai', phone: '+1 415 555 0119', source: 'Referral', status: 'New' },
  { name: 'Evelyn Scott', company: 'Catalyst Co', email: 'evelyn@catalyst.co', phone: '+1 415 555 0121', source: 'Website', status: 'New' },
  { name: 'Oliver Green', company: 'Pinecone Inc', email: 'oliver@pinecone.io', phone: '+1 415 555 0123', source: 'Other', status: 'New' },
  { name: 'Harper Bell', company: 'Echo Systems', email: 'harper@echosys.net', phone: '+1 415 555 0125', source: 'Website', status: 'New' },

  // ── Contacted Leads (10) ────────────────────
  { name: 'James Chen', company: 'Layers', email: 'james@layers.co', phone: '+1 415 555 0102', source: 'Referral', status: 'Contacted' },
  { name: 'Ava Thompson', company: 'Capsule', email: 'ava@capsule.co', phone: '+1 415 555 0105', source: 'Referral', status: 'Contacted' },
  { name: 'Daniel Foster', company: 'Novus Media', email: 'daniel@novus.com', phone: '+1 415 555 0114', source: 'Website', status: 'Contacted' },
  { name: 'Emily Clark', company: 'Peak Ventures', email: 'emily@peakventures.vc', phone: '+1 415 555 0118', source: 'LinkedIn', status: 'Contacted' },
  { name: 'Jacob Wright', company: 'Streamline', email: 'jacob@streamline.app', phone: '+1 415 555 0120', source: 'Referral', status: 'Contacted' },
  { name: 'Chloe Adams', company: 'Luminary', email: 'chloe@luminary.design', phone: '+1 415 555 0122', source: 'Website', status: 'Contacted' },
  { name: 'Alexander White', company: 'Vanguard', email: 'alex@vanguard.io', phone: '+1 415 555 0124', source: 'Website', status: 'Contacted' },
  { name: 'Grace Hall', company: 'Beacon Software', email: 'grace@beacon.dev', phone: '+1 415 555 0126', source: 'Other', status: 'Contacted' },
  { name: 'Samuel King', company: 'Nexus Health', email: 'samuel@nexushealth.org', phone: '+1 415 555 0127', source: 'Referral', status: 'Contacted' },
  { name: 'Lily Evans', company: 'BlueSky Labs', email: 'lily@blueskylabs.com', phone: '+1 415 555 0128', source: 'Website', status: 'Contacted' },

  // ── Qualified Leads (8) ─────────────────────
  { name: 'Olivia Patel', company: 'Orbit', email: 'olivia@orbit.so', phone: '+1 415 555 0103', source: 'LinkedIn', status: 'Qualified' },
  { name: 'Sophia Lee', company: 'Quotient', email: 'sophia@quotient.io', phone: '+1 415 555 0107', source: 'Website', status: 'Qualified' },
  { name: 'Charlotte Brown', company: 'Veritas', email: 'charlotte@veritas.org', phone: '+1 415 555 0111', source: 'LinkedIn', status: 'Qualified' },
  { name: 'Liam O\'Connor', company: 'Emerald City', email: 'liam@emerald.io', phone: '+1 415 555 0116', source: 'Referral', status: 'Qualified' },
  { name: 'Zachary Miller', company: 'Kinetic', email: 'zach@kinetic.sh', phone: '+1 415 555 0129', source: 'Website', status: 'Qualified' },
  { name: 'Zoe Campbell', company: 'Atlas Logic', email: 'zoe@atlaslogic.com', phone: '+1 415 555 0130', source: 'Website', status: 'Qualified' },
  { name: 'Mason Rivera', company: 'Solstice', email: 'mason@solstice.cloud', phone: '+1 415 555 0131', source: 'LinkedIn', status: 'Qualified' },
  { name: 'Ella Ward', company: 'Prism Studio', email: 'ella@prismstudio.co', phone: '+1 415 555 0132', source: 'Other', status: 'Qualified' },

  // ── Lost Leads (2) ──────────────────────────
  { name: 'Liam Garcia', company: 'CloudWatch', email: 'liam@cloudwatch.io', phone: '+1 415 555 0106', source: 'Other', status: 'Lost' },
  { name: 'Benjamin Taylor', company: 'Apex Global', email: 'benjamin@apex.io', phone: '+1 415 555 0112', source: 'Referral', status: 'Lost' }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to PostgreSQL database...');
    await connectDB();

    // 1. Find or create default user
    let user = await User.findOne({ where: { email: SEED_USER.email } });
    if (!user) {
      user = await User.scope('withPassword').create(SEED_USER);
      console.log(`✓ Created primary user: ${user.name} (${user.email})`);
    } else {
      console.log(`✓ Using existing user: ${user.name} (${user.email})`);
    }

    // 2. Also create/ensure demo@leadmanager.io user for the frontend auto-login
    let demoUser = await User.findOne({ where: { email: 'demo@leadmanager.io' } });
    if (!demoUser) {
      demoUser = await User.scope('withPassword').create({
        name: 'Alex Morgan',
        email: 'demo@leadmanager.io',
        password: 'Password123!'
      });
      console.log(`✓ Created frontend demo user: ${demoUser.name} (${demoUser.email})`);
    }

    // Clear existing leads for these users to ensure clean exact numbers
    await Lead.destroy({ where: { userId: [user.id, demoUser.id] } });
    console.log('✓ Cleaned existing leads for fresh seed');

    // 3. Bulk create leads for both users
    const leadsForAlex = SEED_LEADS.map((l, index) => ({
      ...l,
      userId: user.id,
      // Stagger createdAt so sort ordering looks realistic
      createdAt: new Date(Date.now() - index * 3600000)
    }));

    const leadsForDemo = SEED_LEADS.map((l, index) => ({
      ...l,
      userId: demoUser.id,
      createdAt: new Date(Date.now() - index * 3600000)
    }));

    await Lead.bulkCreate([...leadsForAlex, ...leadsForDemo]);
    console.log(`✓ Successfully seeded ${SEED_LEADS.length} leads for Alex Morgan & Demo accounts!`);

    // 4. Output summary verification
    const [statusSummary, totalCount] = await Promise.all([
      Lead.findAll({
        where: { userId: user.id },
        attributes: [
          'status',
          [Lead.sequelize.fn('COUNT', Lead.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }),
      Lead.count({ where: { userId: user.id } })
    ]);

    console.log('\n📊 Seeding Summary for Dashboard:');
    console.log(`   Total Leads: ${totalCount}`);
    statusSummary.forEach((row) => {
      console.log(`   - ${row.status}: ${row.count}`);
    });

    console.log('\n🚀 Database is now fully populated and ready for the UI!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
