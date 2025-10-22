const { supabase } = require('../config/db');

class Application {
  // Create application
  static async create(applicationData) {
    try {
      // If job_id is provided, fetch job details to store as backup
      let enhancedData = { ...applicationData };
      
      if (applicationData.job_id) {
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('title, department')
          .eq('id', applicationData.job_id)
          .single();
        
        if (!jobError && jobData) {
          enhancedData.job_title_backup = jobData.title;
          enhancedData.job_department_backup = jobData.department;
          
          console.log('💾 Storing job backup data:', {
            jobId: applicationData.job_id,
            jobTitle: jobData.title,
            jobDepartment: jobData.department
          });
        }
      }
      
      const { data, error } = await supabase
        .from('applications')
        .insert([enhancedData])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Get application by ID
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get applications by candidate ID
  static async findByCandidateId(candidateId, limit = 100, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get applications by job ID
  static async findByJobId(jobId, limit = 100, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all applications (for admin)
  static async getAll(limit = 100, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          candidate:users!applications_candidate_id_fkey(
            id,
            name,
            email
          ),
          job:jobs!applications_job_id_fkey(
            id,
            title,
            department,
            status,
            is_deleted
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      // Flatten the candidate and job data into the application object
      const flattenedData = data.map(app => {
        // Determine the best source for job information
        const jobTitle = app.job?.title || app.job_title_backup || 'Position Unknown';
        const jobDepartment = app.job?.department || app.job_department_backup || 'Unknown Department';
        const isJobDeleted = app.job?.is_deleted || false;
        const jobStatus = app.job?.status || (app.job_title_backup ? 'deleted' : 'unknown');
        
        return {
          ...app,
          candidate_name: app.candidate?.name || 'Unknown',
          candidate_email: app.candidate?.email || 'N/A',
          job_title: jobTitle,
          job_department: jobDepartment,
          job_status: jobStatus,
          job_is_deleted: isJobDeleted,
          // Add indicators for UI
          job_title_source: app.job?.title ? 'current' : (app.job_title_backup ? 'backup' : 'unknown'),
          position_status: isJobDeleted ? 'deleted' : (app.job ? 'active' : 'unknown')
        };
      });
      
      console.log('📋 Applications with job info:', {
        totalApplications: flattenedData.length,
        applicationsWithJobs: flattenedData.filter(app => app.job).length,
        applicationsWithDeletedJobs: flattenedData.filter(app => app.job_is_deleted).length,
        applicationsWithoutJobs: flattenedData.filter(app => !app.job).length
      });
      
      return flattenedData;
    } catch (error) {
      throw error;
    }
  }
  
  // Update application
  static async update(id, applicationData) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update(applicationData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Delete application
  static async delete(id) {
    try {
      const { data, error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get application statistics
  static async getStats(jobId = null, status = null) {
    try {
      let query = supabase
        .from('applications')
        .select('*');
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Calculate statistics
      const totalApplications = data.length;
      const applicationsByStatus = {
        pending: data.filter(app => app.status === 'pending').length,
        reviewed: data.filter(app => app.status === 'reviewed').length,
        shortlisted: data.filter(app => app.status === 'shortlisted').length,
        rejected: data.filter(app => app.status === 'rejected').length,
        hired: data.filter(app => app.status === 'hired').length
      };
      
      const averageScore = totalApplications > 0 
        ? data.reduce((sum, app) => sum + (app.score || 0), 0) / totalApplications 
        : 0;
      
      return {
        totalApplications,
        applicationsByStatus,
        averageScore
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Application;