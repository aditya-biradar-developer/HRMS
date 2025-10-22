// Load environment variables first
require('dotenv').config();

const { supabase } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runJobBackupMigration() {
  try {
    console.log('🚀 Starting job backup migration...');
    console.log('ℹ️  Note: Database schema changes (adding columns) must be done manually in Supabase dashboard');
    console.log('ℹ️  This script will populate existing applications with job backup data');
    
    // Step 1: Check if we can access the database
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('applications')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      throw testError;
    }
    console.log('✅ Database connection successful');
    
    // Step 2: Get applications that need backup data
    console.log('📊 Checking applications that need job backup data...');
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select(`
        id, 
        job_id, 
        job_title_backup,
        jobs!applications_job_id_fkey(
          id,
          title,
          department
        )
      `);
    
    if (appsError) {
      console.error('❌ Error fetching applications:', appsError);
      throw appsError;
    }
    
    console.log(`📋 Found ${applications.length} total applications`);
    
    // Step 3: Filter applications that need backup data
    const needsBackup = applications.filter(app => 
      !app.job_title_backup && app.jobs && app.jobs.title
    );
    
    console.log(`🔄 ${needsBackup.length} applications need job backup data`);
    
    if (needsBackup.length === 0) {
      console.log('✅ All applications already have backup data or no job information available');
      return;
    }
    
    // Step 4: Update applications with backup data
    console.log('💾 Updating applications with job backup data...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const app of needsBackup) {
      try {
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            job_title_backup: app.jobs.title,
            job_department_backup: app.jobs.department
          })
          .eq('id', app.id);
        
        if (updateError) {
          console.error(`❌ Failed to update application ${app.id}:`, updateError);
          errorCount++;
        } else {
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`✅ Updated ${successCount}/${needsBackup.length} applications...`);
          }
        }
      } catch (err) {
        console.error(`❌ Error updating application ${app.id}:`, err);
        errorCount++;
      }
    }
    
    console.log(`🎉 Migration completed! Updated ${successCount} applications, ${errorCount} errors`);
    
    // Step 5: Verify the migration
    console.log('🔍 Verifying migration results...');
    
    const { data: verifyApps, error: verifyError } = await supabase
      .from('applications')
      .select('id, job_id, job_title_backup, job_department_backup')
      .not('job_title_backup', 'is', null)
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError);
    } else {
      console.log('📊 Sample applications after migration:');
      verifyApps.forEach(app => {
        console.log(`  - App ${app.id}: Job ${app.job_id} → "${app.job_title_backup}" (${app.job_department_backup})`);
      });
    }
    
    // Step 6: Get final statistics
    const { count: totalApps } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true });
    
    const { count: appsWithBackup } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .not('job_title_backup', 'is', null);
    
    console.log('📈 Final Migration Statistics:');
    console.log(`  - Total applications: ${totalApps}`);
    console.log(`  - Applications with backup data: ${appsWithBackup}`);
    console.log(`  - Coverage: ${totalApps > 0 ? ((appsWithBackup / totalApps) * 100).toFixed(1) : 0}%`);
    
    console.log('🎉 Job backup migration completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('  1. The backup columns may need to be added to the database schema manually');
    console.log('  2. Restart your application server to use the updated Application model');
    console.log('  3. Test that deleted job positions now show proper titles instead of "Position Unknown"');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('  1. Make sure your .env file has SUPABASE_URL and SUPABASE_SERVICE_KEY');
    console.error('  2. Ensure the database columns job_title_backup and job_department_backup exist');
    console.error('  3. Check that your Supabase service key has the necessary permissions');
    process.exit(1);
  }
}

// Run the migration
runJobBackupMigration();
